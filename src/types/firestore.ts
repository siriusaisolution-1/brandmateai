// src/types/firestore.ts
// Re-export shared Firestore interfaces defined in the Functions workspace so the
// Next.js app can consume the same source of truth.

export type {
  FirestoreTimestamp,
  WithId,
  UserRole,
  SubscriptionPlan,
  UserIntegration,
  User,
  Brand,
  MediaAsset,
  BrandReportSection,
  BrandReportType,
  BrandReport,
  NotificationAction,
  Notification,
  CalendarEvent,
  AdCampaign,
  ScrapedCachePayload,
  ScrapedCacheEntry,
} from '../../functions/src/types/firestore';
