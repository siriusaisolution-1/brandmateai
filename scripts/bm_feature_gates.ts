// scripts/bm_feature_gates.ts – tiny helper for feature-gating routes
export const features = {
    adminDashboard: process.env.NEXT_PUBLIC_FEAT_ADMIN === '1',
    reports: process.env.NEXT_PUBLIC_FEAT_REPORTS === '1',
    videoStudio: process.env.NEXT_PUBLIC_FEAT_VIDEO === '1',
    newsletter: process.env.NEXT_PUBLIC_FEAT_NEWSLETTER === '1',
    blog: process.env.NEXT_PUBLIC_FEAT_BLOG === '1',
  } as const;
  
  // Usage in a page.tsx:
  // import { features } from '@/scripts/bm_feature_gates';
  // if (!features.adminDashboard) { notFound(); }
  