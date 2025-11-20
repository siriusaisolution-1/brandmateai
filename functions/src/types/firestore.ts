import type { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type FirestoreDateLike = Timestamp | FieldValue | Date | number | string;

export interface BaseDocument {
  id?: string;
  createdAt?: FirestoreDateLike;
  updatedAt?: FirestoreDateLike;
}

export interface Brand extends BaseDocument {
  id?: string;
  ownerId: string;
  name: string;
  industry?: string;
  website?: string;
  socialHandles?: { instagram?: string; tiktok?: string; other?: string };
  priceRange?: 'low' | 'mid' | 'high';
  targetAudienceSummary?: string;
  brandMemoryRef?: string;
  status: 'active' | 'inactive';
  createdAt: FirestoreDateLike;
  updatedAt: FirestoreDateLike;

  // Legacy/compatibility fields retained for now
  logoUrl?: string;
  colors?: string[];
  fonts?: string[];
  brandVoice?: string;
  keyInfo?: string;
  description?: string;
  websiteUrl?: string;
  socialLinks?: string[];
  competitorWebsites?: string[];
  primaryContactId?: string;
  metadata?: Record<string, unknown>;
}

export interface BrandMemory extends BaseDocument {
  id: string;
  brandId: string;
  toneOfVoice?: string;
  mission?: string;
  values?: string[];
  personas?: { name: string; description: string }[];
  primaryColors?: string[];
  fonts?: string[];
  preferences?: string[];
  assetsSummary?: string;
  incomplete: boolean;
  createdAt: FirestoreDateLike;
  updatedAt: FirestoreDateLike;
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
  brandMemories: BrandMemory;
  mediaAssets: MediaAsset;
  notifications: Notification;
  users: UserProfile;
  brandReports: BrandReport;
  calendar: CalendarEvent;
  adCampaigns: AdCampaign;
  scraperCache: ScraperCache;
  trendInsights: TrendInsight;
};

export type WithId<T extends BaseDocument> = T & { id: string };