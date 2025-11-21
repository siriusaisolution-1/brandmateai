// functions/src/types/firestore.d.ts
// Shared Firestore data models used by both Firebase Functions and the Next.js app.
// The interfaces below reflect the document shapes referenced throughout the codebase
// (uploads, notifications, brand data, scheduled events, etc.).

/** A timestamp value as returned by Firestore on both client and admin SDKs. */
export type FirestoreTimestamp =
  | Date
  | number
  | { seconds: number; nanoseconds: number; toMillis?: () => number; toDate?: () => Date };

/** Helper for documents that always include an id alongside their data. */
export type WithId<T> = T & { id: string };

export type UserRole = 'admin' | 'user';
export type SubscriptionPlan = 'free' | 'solo' | 'pro' | 'agency';

export interface UserIntegration {
  provider: string;
  accessToken: string;
  refreshToken?: string | null;
  updatedAt?: FirestoreTimestamp;
  scopes?: string[];
}

export interface User {
  id?: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: UserRole;
  subscriptionPlan?: SubscriptionPlan;
  bmkCredits?: number;
  bmkBalance?: number;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
  integrations?: Record<string, UserIntegration>;
}

export interface Brand {
  id?: string;
  ownerId: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  colors?: string[];
  fonts?: string[];
  brandVoice?: string;
  keyInfo?: string;
  industry?: string;
  competitorWebsites?: string[];
  websiteUrl?: string | null;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface MediaAsset {
  id?: string;
  brandId: string;
  userId: string;
  fileName?: string;
  contentType?: string;
  url?: string;
  storagePath?: string;
  createdAt?: FirestoreTimestamp;
  uploadedAt?: FirestoreTimestamp;
}

export interface BrandReportSection {
  id?: string;
  title: string;
  content: string;
  score?: number;
  metrics?: Record<string, number | string>;
  recommendations?: string[];
}

export type BrandReportType = 'audit' | 'performance' | 'competitor' | 'trend' | 'custom';

export interface BrandReport {
  id?: string;
  brandId: string;
  ownerId: string;
  type: BrandReportType;
  title: string;
  summary?: string;
  report: string;
  brandVoice?: string;
  keyInfo?: string;
  suggestedColors?: string[];
  sections?: BrandReportSection[];
  generatedByFlow?: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface NotificationAction {
  label: string;
  href: string;
}

export interface Notification {
  id?: string;
  ownerId?: string;
  userId?: string;
  title: string;
  summary?: string;
  message?: string;
  body?: string;
  read?: boolean;
  createdAt?: FirestoreTimestamp;
  actions?: NotificationAction[];
  type?: 'info' | 'warning' | 'success' | 'error';
}

export interface CalendarEvent {
  id?: string;
  ownerId: string;
  brandId: string;
  title: string;
  description?: string;
  scheduledFor: FirestoreTimestamp;
  status?: 'draft' | 'scheduled' | 'sent' | 'failed';
  channel?: 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'email' | string;
  assetIds?: string[];
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface AdCampaign {
  id?: string;
  ownerId: string;
  brandId: string;
  platform: 'facebook' | 'instagram' | 'google' | 'linkedin' | 'tiktok' | string;
  objective?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  budgetCents?: number;
  spendCents?: number;
  startsAt?: FirestoreTimestamp;
  endsAt?: FirestoreTimestamp;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface ScrapedCachePayload {
  logoUrl: string | null;
  colors: string[];
  textContent: string;
}

export interface ScrapedCacheEntry {
  id?: string;
  timestamp: number;
  payload: ScrapedCachePayload;
}

export type OutputType = 'video' | 'image' | 'copy';

export interface OutputMeta {
  durationSec?: number;
  width?: number;
  height?: number;
  styleId?: string;
}

export interface Output {
  id?: string;
  brandId: string;
  requestId: string;
  type: OutputType;
  platform?: string;
  variantIndex?: number;
  status: 'draft' | 'approved' | 'published' | string;
  meta?: OutputMeta;
  storagePath?: string;
  url?: string;
  text?: string;
  createdAt?: FirestoreTimestamp;
  createdBy: string;
}

export type ContentRequestStatus = 'queued' | 'processing' | 'done' | 'failed';

export interface ContentRequest {
  id?: string;
  brandId: string;
  userId: string;
  platform?: string;
  requestedImages?: number;
  requestedVideos?: number;
  requestedCopies?: number;
  brief?: string;
  status: ContentRequestStatus;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}
