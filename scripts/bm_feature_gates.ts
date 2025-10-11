// scripts/bm_feature_gates.ts – tiny helper for feature-gating routes
const readFeatureToggle = (envVar: string) =>
  process.env[envVar] === "1";

export const features = {
  adminDashboard: readFeatureToggle("FEAT_ADMIN"),
  reports: readFeatureToggle("FEAT_REPORTS"),
  videoStudio: readFeatureToggle("FEAT_VIDEO"),
  newsletter: readFeatureToggle("FEAT_NEWSLETTER"),
  blog: readFeatureToggle("FEAT_BLOG"),
} as const;
  
  // Usage in a page.tsx:
  // import { features } from '@/scripts/bm_feature_gates';
  // if (!features.adminDashboard) { notFound(); }
  