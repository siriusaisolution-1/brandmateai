import type { FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Firestore timestamp / FieldValue / JS date helpers.
 */
export type FirestoreDateLike = Timestamp | FieldValue | Date | number | string;

export interface BaseDocument {
  id?: string;
  createdAt?: FirestoreDateLike;
  updatedAt?: FirestoreDateLike;
}

/* -------------------------------------------------------------------------- */
/*                                   Brands                                   */
/* -------------------------------------------------------------------------- */

export interface Brand extends BaseDocument {
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

  // Legacy/compat fields
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

/* -------------------------------------------------------------------------- */
/*                                 Media/Notif                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                     User                                   */
/* -------------------------------------------------------------------------- */

export interface UserProfile extends BaseDocument {
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: 'admin' | 'user' | 'viewer' | 'editor' | string;
  subscriptionPlan?: 'starter' | 'free' | 'solo' | 'pro' | 'agency' | string;
  bmkCredits?: number;
  bmkBalance?: number;
  onboardingComplete?: boolean;
  notificationPreferences?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

// Back-compat alias
export type User = UserProfile;

/* -------------------------------------------------------------------------- */
/*                               Brand Reports                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                  Calendar                                  */
/* -------------------------------------------------------------------------- */

export interface CalendarEvent extends BaseDocument {
  brandId: string;
  ownerId?: string; // legacy
  title: string;
  description?: string;
  channel?: string;
  startTime: FirestoreDateLike;
  endTime?: FirestoreDateLike;
  status?: 'draft' | 'scheduled' | 'sent' | 'cancelled' | string;
  metadata?: Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/*                                 AdCampaigns                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                Scraper/Trends                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                   Outputs                                  */
/* -------------------------------------------------------------------------- */

export type OutputType = 'video' | 'image' | 'copy';

export interface OutputMeta {
  durationSec?: number;
  width?: number;
  height?: number;
  styleId?: string;
}

export interface Output extends BaseDocument {
  brandId: string;
  requestId: string; // primary link to ContentRequest
  type: OutputType;
  platform?: string;
  variantIndex?: number;
  status: 'draft' | 'approved' | 'published' | 'error' | string;
  meta?: OutputMeta;
  storagePath?: string;
  url?: string;
  text?: string;
  createdBy: string;

  // Legacy/compat fields
  ownerId?: string;
  contentRequestId?: string;
  title?: string;
  summary?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/*                              Content Requests (M3+)                        */
/* -------------------------------------------------------------------------- */

export type ContentChannel =
  | 'instagram_feed'
  | 'instagram_reels'
  | 'tiktok'
  | 'youtube_shorts';

export type ContentOutputType = 'video' | 'image' | 'copy';

export type ContentRequestStatus =
  | 'draft'
  | 'queued'
  | 'in_progress'
  | 'processing'      // legacy synonym
  | 'done'
  | 'failed'
  | 'needs_revision'
  | 'approved'
  | 'cancelled'
  | string;

export interface ContentRequest extends BaseDocument {
  brandId: string;
  userId: string;

  title: string;
  description?: string;

  goal?: 'increase_sales' | 'brand_awareness' | 'engagement' | 'other' | string;
  channels: ContentChannel[];

  requestedOutputs: {
    video?: number;
    image?: number;
    copy?: number;
  };

  status: ContentRequestStatus;

  masterBrief: unknown;

  createdFromChatId?: string;
  createdAt: FirestoreDateLike;
  updatedAt: FirestoreDateLike;

  // Legacy/compat fields
  ownerId?: string;
  channel?: string;
  requestedVideos?: number;
  requestedImages?: number;
  requestedCopy?: number;
  metadata?: Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/*                                   Chat (M3)                                */
/* -------------------------------------------------------------------------- */

export interface ChatSession extends BaseDocument {
  brandId: string;
  userId: string;
  title: string;
  createdAt: FirestoreDateLike;
  updatedAt: FirestoreDateLike;
  lastContentRequestId?: string;
}

export interface ChatMessage extends BaseDocument {
  sessionId: string;
  brandId: string;
  userId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: FirestoreDateLike;
}

/* -------------------------------------------------------------------------- */
/*                                   Model Map                                */
/* -------------------------------------------------------------------------- */

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

  // Core generation models
  contentRequests: ContentRequest;
  outputs: Output;

  // Chat
  chatSessions: ChatSession;
  chatMessages: ChatMessage;
};

export type WithId<T extends BaseDocument> = T & { id: string };