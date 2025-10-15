// Shared Firestore domain types (source of truth for both Functions and App)
import type { Timestamp, FieldValue } from 'firebase-admin/firestore';

/** Alias ka Firestore Timestamp tipu iz firebase-admin-a */
export type FirestoreTimestamp = Timestamp;
/** Datumsko polje koje može biti Firestore vreme, JS Date, broj (ms), itd. */
export type FirestoreDateLike = Timestamp | FieldValue | Date | number | string;

/** Generički helper: dokument sa obaveznim id-jem */
export type WithId<T> = T & { id: string };

/** Opšti statusi / uloge koje koristi aplikacija */
export type UserRole = 'admin' | 'user' | 'viewer' | 'editor' | string;
export type SubscriptionPlan = 'free' | 'solo' | 'pro' | 'agency' | string;

export interface BaseDocument {
  id?: string;
  createdAt?: FirestoreDateLike;
  updatedAt?: FirestoreDateLike;
}

/* =====================  Core modeli  ===================== */

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

export type NotificationAction = {
  label: string;
  href: string;
  target?: '_self' | '_blank';
};

export interface Notification extends BaseDocument {
  userId: string;
  title: string;
  body: string;
  read?: boolean;
  actionUrl?: string; // starije poruke
  action?: NotificationAction; // noviji format
  category?: string;
  priority?: 'low' | 'normal' | 'high';
}

export type UserIntegration =
  | { provider: 'google' | 'github' | string; connectedAt: FirestoreDateLike; externalId?: string }
  | Record<string, unknown>;

export interface User extends BaseDocument {
  role?: UserRole;
  subscriptionPlan?: SubscriptionPlan;
  bmkCredits?: number;
  bmkBalance?: number;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  integrations?: UserIntegration[];
}

/* =====================  Reporting / Calendar  ===================== */

export interface BrandReportSection {
  title: string;
  summary?: string;
  content?: string;
  score?: number;
}

export type BrandReportType = 'audit' | 'analysis' | 'trend' | string;

export interface BrandReport extends BaseDocument {
  brandId: string;
  type: BrandReportType;
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

/* =====================  Ads / Scraper  ===================== */

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
  metrics?: Record<string, number | undefined>;
  metadata?: Record<string, unknown>;
}

/** Sadržaj skrejpovanih resursa */
export interface ScrapedCachePayload {
  content: string;
  contentType?: string; // npr. 'text/html', 'application/json'
}

/** Stavka keša za skrejp (nekad zvan ScraperCache) */
export interface ScrapedCacheEntry extends BaseDocument {
  url: string;
  brandId?: string;
  payload: ScrapedCachePayload;
  fetchedAt?: FirestoreDateLike;
  expiresAt?: FirestoreDateLike;
  metadata?: Record<string, unknown>;
}
