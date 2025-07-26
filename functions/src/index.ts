import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Export all flows from their new location
export * from "./ai/flows/admin-stats";
export * from "./ai/flows/brand-audit";
export * from "./ai/flows/generate-blog-post";
export * from "./ai/flows/generate-image";
export * from "./ai/flows/generate-newsletter";
export * from "./ai/flows/manage-ads";
export * from "./ai/flows/manage-brand";
export * from "./ai/flows/manage-calendar";
export * from "./ai/flows/moderation";
export * from "./ai/flows/social-burst";
export * from "./ai/flows/strategic-analysis";

// Export other functions
export * from "./analytics";
export * from "./auth-triggers";
export * from "./billing";
export * from "./scheduled-tasks";
export * from "./temp-admin-tool";
