import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  subscriptionPlan: 'free' | 'small-business' | 'small-agency' | 'enterprise';
  agencyId?: string;
  role: 'user' | 'agency-admin' | 'agency-member';
}

export interface Brand {
  id: string; // ID dokumenta
  name: string;
  logoUrl: string;
  colors: string[]; // Niz hex kodova
  fonts: string[]; // Niz naziva fontova
  brandVoice: string; // Tekstualni opis
  keyInfo: string; // Opis proizvoda/usluge
  competitorWebsites?: string[];
}

export interface MediaAsset {
  id: string;
  storagePath: string; // Putanja u Firebase Storage
  fileName: string;
  fileType: string;
  uploadedAt: Timestamp;
  tags: string[];
}
