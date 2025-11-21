import type { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type FirestoreDateLike = Timestamp | FieldValue | Date | number | string;

export interface BaseDocument {
  id?: string;
  createdAt?: FirestoreDateLike;
  updatedAt?: FirestoreDateLike;
}

export interface Brand extends BaseDocument {
  ownerId?: string;
  name: string;
  logoUrl?: string;
  colors?: string[];
  fonts?: string[];
  brandVoice?: string;
  keyInfo?: string;
  industry?: string;
  description?: string;
  websiteUrl?: string;
  socialLinks?: string[];
  competitorWebsites?: string[];
  primaryContactId?: string;
  status?: 'draft' | 'active' | 'archived' | string;
  metadata?: Record<string, unknown>;
}

export interface MediaAsset extends BaseDocument {
  brandId: string;
  userId: string;
  fileName?: string;
  url?: string;
  storagePath?: string;
  type?: 'image' | 'video' | 'audio' | 'document' | string;
  sizeBytes?: number;
  hash?: string;
  metadata?: Record<string, unknown>;
}

export interface Notification extends BaseDocument {
  userId: string;
  title: string;
  body: string;
  read?: boolean;
  actionUrl?: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface UserProfile extends BaseDocument {
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: 'admin' | 'user' | 'viewer' | 'editor' | string;
  subscriptionPlan?: 'free' | 'solo' | 'pro' | 'agency' | string;
  bmkCredits?: number;
  bmkBalance?: number;
  onboardingComplete?: boolean;
  notificationPreferences?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

// Kompatibilnost sa starijim importima koji su koristili `User`
export type User = UserProfile;

export interface BrandReportSection {
  title: string;
  summary?: string;
  content?: string;
  score?: number;
}

export interface BrandReport extends BaseDocument {
  brandId: string;
  type: 'audit' | 'analysis' | 'trend' | string;
  generatedBy?: 'ai' | 'user' | string;
  summary?: string;
  highlights?: string[];
  sections?: BrandReportSection[];
  metadata?: Record<string, unknown>;
}

export interface CalendarEvent extends BaseDocument {
  brandId: string;
  ownerId?: string;
  title: string;
  description?: string;
  channel?: string;
  startTime: FirestoreDateLike;
  endTime?: FirestoreDateLike;
  status?: 'draft' | 'scheduled' | 'sent' | 'cancelled' | string;
  metadata?: Record<string, unknown>;
}

export interface AdCampaignMetrics {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  spend?: number;
  conversions?: number;
  cpa?: number;
  roas?: number;
  [metric: string]: number | undefined;
}

export interface AdCampaign extends BaseDocument {
  brandId: string;
  name: string;
  objective?: string;
  budget?: number;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived' | string;
  platforms?: string[];
  startDate?: FirestoreDateLike;
  endDate?: FirestoreDateLike;
  audience?: Record<string, unknown>;
  creatives?: MediaAsset[];
  metrics?: AdCampaignMetrics;
  metadata?: Record<string, unknown>;
}

export interface ContentRequest extends BaseDocument {
  brandId: string;
  ownerId?: string;
  title: string;
  description?: string;
  goal?: string;
  channel?: string;
  requestedVideos?: number;
  requestedImages?: number;
  requestedCopy?: number;
  status?:
    | 'draft'
    | 'queued'
    | 'processing'
    | 'done'
    | 'failed'
    | 'needs_revision'
    | string;
  metadata?: Record<string, unknown>;
}

export type OutputType = 'video' | 'image' | 'copy' | string;

export interface Output extends BaseDocument {
  brandId: string;
  ownerId?: string;
  contentRequestId?: string;
  type: OutputType;
  title?: string;
  summary?: string;
  text?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  platform?: string;
  status?: 'draft' | 'ready' | 'error' | 'published' | string;
  metadata?: Record<string, unknown>;
}

export interface ScraperCache extends BaseDocument {
  url: string;
  brandId?: string;
  content: string;
  contentType?: string;
  fetchedAt?: FirestoreDateLike;
  expiresAt?: FirestoreDateLike;
  metadata?: Record<string, unknown>;
}

export interface TrendInsight extends BaseDocument {
  brandId: string;
  topic: string;
  summary?: string;
  source?: string;
  capturedAt?: FirestoreDateLike;
  metadata?: Record<string, unknown>;
}

export type FirestoreModels = {
  brands: Brand;
  mediaAssets: MediaAsset;
  notifications: Notification;
  users: UserProfile;
  brandReports: BrandReport;
  calendar: CalendarEvent;
  adCampaigns: AdCampaign;
  scraperCache: ScraperCache;
  trendInsights: TrendInsight;
  contentRequests: ContentRequest;
  outputs: Output;
};

export type WithId<T extends BaseDocument> = T & { id: string };