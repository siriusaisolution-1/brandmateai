// src/types/firestore.ts
export interface Brand {
    id?: string;
    ownerId?: string;
    name: string;
    logoUrl?: string;
    colors?: string[];
    fonts?: string[];
    brandVoice?: string;
    keyInfo?: string;
    industry?: string;
    competitorWebsites?: string[];
  }
  
  export interface MediaAsset {
    id?: string;
    brandId: string;
    userId: string;
    fileName?: string;
    url?: string;
    createdAt?: number | Date;
  }
  
  export interface Notification {
    id?: string;
    userId: string;
    title: string;
    body: string;
    createdAt?: number | Date;
    read?: boolean;
  }
  
  export interface User {
    id?: string;
    role?: "admin" | "user";
    subscriptionPlan?: "free" | "solo" | "pro" | "agency";
    bmkCredits?: number;
    bmkBalance?: number;
    displayName?: string | null;
    email?: string | null;
  }