import { redirect } from 'next/navigation';
import type { Timestamp } from 'firebase-admin/firestore';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { isOwnerUser } from '@/lib/auth/owner';
import { getFirestore } from '@/lib/firebase-admin';
import { requireServerAuthSession } from '@/lib/auth/verify-id-token';

interface AdminUserRow {
  id: string;
  email: string;
  displayName: string;
  subscriptionPlan: string;
  createdAt: string;
  brandCount: number;
}

interface AdminBrandRow {
  id: string;
  name: string;
  ownerEmail: string;
  createdAt: string;
  outputsLabel: string;
}

interface UsageSnapshotRow {
  id: string;
  brandName: string;
  period: string;
  videosUsed: string;
  imagesUsed: string;
  aiTokensUsed: string;
  status: string;
}

interface FeedbackRow {
  id: string;
  userEmail: string;
  brandName: string;
  message: string;
  context: string;
  createdAt: string;
  resolved: string;
}

function formatDate(value: Timestamp | Date | string | number | null | undefined): string {
  if (!value) {
    return '—';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return new Date(value).toLocaleString();
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  try {
    return value.toDate().toLocaleString();
  } catch {
    return '—';
  }
}

function safeString(value: unknown, fallback = '—'): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return fallback;
}

async function loadAdminData() {
  const db = getFirestore();
  const [usersSnapshot, brandsSnapshot, usageSnapshot, feedbackSnapshot] = await Promise.all([
    db.collection('users').limit(200).get(),
    db.collection('brands').limit(200).get(),
    db.collection('usageSnapshots').limit(200).get(),
    db.collection('betaFeedback').orderBy('createdAt', 'desc').limit(200).get(),
  ]);

  const usersMap = new Map<string, AdminUserRow>();
  const brandCounts: Record<string, number> = {};

  for (const doc of brandsSnapshot.docs) {
    const data = doc.data() ?? {};
    const ownerId = typeof data.ownerId === 'string' ? data.ownerId : 'unknown';
    brandCounts[ownerId] = (brandCounts[ownerId] ?? 0) + 1;
  }

  for (const doc of usersSnapshot.docs) {
    const data = doc.data() ?? {};
    const id = doc.id;
    usersMap.set(id, {
      id,
      email: safeString(data.email, 'unknown'),
      displayName: safeString(data.displayName, '—'),
      subscriptionPlan: safeString(data.subscriptionPlan, 'Starter'),
      createdAt: formatDate(data.createdAt ?? data.created_at ?? null),
      brandCount: brandCounts[id] ?? 0,
    });
  }

  const brandMap = new Map<string, AdminBrandRow>();
  const brands: AdminBrandRow[] = brandsSnapshot.docs.map(doc => {
    const data = doc.data() ?? {};
    const ownerId = typeof data.ownerId === 'string' ? data.ownerId : 'unknown';
    const owner = usersMap.get(ownerId);
    const outputsLabel =
      typeof data.outputsCount === 'number'
        ? data.outputsCount.toString()
        : safeString(data.outputsLabel, 'N/A');
    const row: AdminBrandRow = {
      id: doc.id,
      name: safeString(data.name, 'Untitled brand'),
      ownerEmail: owner?.email ?? ownerId,
      createdAt: formatDate(data.createdAt ?? null),
      outputsLabel,
    };
    brandMap.set(doc.id, row);
    return row;
  });

  const usageRows: UsageSnapshotRow[] = usageSnapshot.docs.map(doc => {
    const data = doc.data() ?? {};
    const metrics = (data.metrics ?? data.usage) ?? {};
    const brandId = typeof data.brandId === 'string' ? data.brandId : null;
    return {
      id: doc.id,
      brandName: brandId ? brandMap.get(brandId)?.name ?? brandId : 'Unknown brand',
      period: safeString(data.period ?? data.month ?? data.range, 'Unspecified'),
      videosUsed: safeString(metrics.videosUsed ?? metrics.videoCount ?? metrics.videos, '0'),
      imagesUsed: safeString(metrics.imagesUsed ?? metrics.imageCount ?? metrics.images, '0'),
      aiTokensUsed: safeString(metrics.aiTokensUsed ?? metrics.tokens ?? metrics.totalTokens, '0'),
      status:
        typeof data.status === 'string'
          ? data.status
          : data.overLimit === true
          ? 'Over limit'
          : 'Within limits',
    };
  });

  const feedbackRows: FeedbackRow[] = feedbackSnapshot.docs.map(doc => {
    const data = doc.data() ?? {};
    const user = usersMap.get(data.userId);
    const brandId = typeof data.brandId === 'string' ? data.brandId : null;
    const brand = brandId ? brandMap.get(brandId)?.name ?? brandId : '—';
    return {
      id: doc.id,
      userEmail: user?.email ?? data.userId ?? 'Unknown user',
      brandName: brand,
      message: safeString(data.message, '—'),
      context: safeString(data.context, 'unspecified'),
      createdAt: formatDate(data.createdAt ?? null),
      resolved: data.resolved === true ? 'Resolved' : 'Open',
    };
  });

  return {
    users: Array.from(usersMap.values()),
    brands,
    usageRows,
    feedbackRows,
  };
}

export default async function BetaAdminPage() {
  const session = await requireServerAuthSession();
  const isAdmin = session.claims.admin === true;
  const owner = isOwnerUser(session.claims);
  if (!isAdmin && !owner) {
    redirect('/dashboard');
  }

  const data = await loadAdminData();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm uppercase text-muted-foreground">Closed Beta</p>
        <h1 className="text-3xl font-semibold">Admin Overview</h1>
        <p className="text-muted-foreground">
          Snapshot of active users, brands, usage and beta feedback. Data is read-only and limited to the last 200 records per
          collection.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Brands</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>{user.subscriptionPlan}</TableCell>
                    <TableCell>{user.brandCount}</TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Outputs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No brands yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.brands.map(brand => (
                  <TableRow key={brand.id}>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>{brand.ownerEmail}</TableCell>
                    <TableCell>{brand.createdAt}</TableCell>
                    <TableCell>{brand.outputsLabel}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Snapshots</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Videos</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>AI Tokens</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.usageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No usage snapshots yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.usageRows.map(snapshot => (
                  <TableRow key={snapshot.id}>
                    <TableCell>{snapshot.brandName}</TableCell>
                    <TableCell>{snapshot.period}</TableCell>
                    <TableCell>{snapshot.videosUsed}</TableCell>
                    <TableCell>{snapshot.imagesUsed}</TableCell>
                    <TableCell>{snapshot.aiTokensUsed}</TableCell>
                    <TableCell>{snapshot.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Beta Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Context</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.feedbackRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No feedback submitted yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.feedbackRows.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.userEmail}</TableCell>
                    <TableCell>{entry.brandName}</TableCell>
                    <TableCell className="max-w-xs whitespace-pre-line text-sm">{entry.message}</TableCell>
                    <TableCell>{entry.context}</TableCell>
                    <TableCell>{entry.createdAt}</TableCell>
                    <TableCell>{entry.resolved}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <p className="mt-3 text-sm text-muted-foreground">Use the Firebase console to mark feedback as resolved if needed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
