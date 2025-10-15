// Re-export tipova iz Functions workspace-a tako da ih Next.js app koristi centralno.

export type {
  // bazni tipovi i helpere
  FirestoreTimestamp,
  FirestoreDateLike,
  WithId,
  UserRole,
  SubscriptionPlan,

  // korisnici / integracije
  UserIntegration,
  User,

  // brend i medija
  Brand,
  MediaAsset,

  // izveštaji
  BrandReportSection,
  BrandReportType,
  BrandReport,

  // notifikacije
  NotificationAction,
  Notification,

  // kalendar i kampanje
  CalendarEvent,
  AdCampaign,

  // scraper cache
  ScrapedCachePayload,
  ScrapedCacheEntry,
} from '../../functions/src/types/firestore';
