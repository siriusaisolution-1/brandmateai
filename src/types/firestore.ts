// src/types/firestore.ts
// Re-export shared Firestore interfaces defined in the Functions workspace so the
// Next.js app can consume the same source of truth.

export type {
  FirestoreDateLike,
  BaseDocument,
  Brand,
  BrandMemory,
  MediaAsset,
  Notification,
  UserProfile,
  User,
  BrandReportSection,
  BrandReport,
  CalendarEvent,
  AdCampaignMetrics,
  AdCampaign,
  ScraperCache,
  TrendInsight,

  // Content + outputs
  ContentChannel,
  ContentOutputType,
  ContentRequest,
  OutputType,
  OutputMeta,
  Output,

  // Chat
  ChatSession,
  ChatMessage,

  // Model map helpers
  FirestoreModels,
  WithId,
} from '../../functions/src/types/firestore';