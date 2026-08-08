export interface Sailing {
  id: number;
  profileId: number; // Foreign key to Profile
  dep: string; // Departure date (YYYY-MM-DD)
  arr: string; // Arrival date (YYYY-MM-DD)
  vessel: string;
  rank: string;
  portType: "indian" | "foreign"; // 'indian' = CDC, 'foreign' = Passport
  monthlySalary?: number; // Optional Monthly Gross Salary in USD
  usdRate?: number; // Optional Historical USD Rate
}

export interface Profile {
  id: number;
  name: string;
  rank: string;
  vessel: string;
  dob?: string; // Date of Birth (YYYY-MM-DD)
  userType?: "seafarer" | "nri"; // User Classification: Seafarer or General NRI
}

export interface DocumentItem {
  id: number;
  profileId: number;
  name: string; // e.g. "Indian Passport", "CDC", "STCW Basic Safety", "US C1/D Visa", "Yellow Fever"
  docType: "passport" | "cdc" | "stcw" | "visa" | "medical" | "other";
  docNumber: string;
  issueDate?: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  issuingAuthority?: string;
  notes?: string;
}

export interface AppState {
  profile: Profile;
  profiles: Profile[];
  activeProfileId: number;
  sailings: Sailing[];
  documents?: DocumentItem[];
  sailingIdCounter: number;
  lastUpdated: string | null;
}

export interface FYSailingSplit {
  id: number;
  profileId: number;
  depDate: Date;
  arrDate: Date;
  daysInFY: number;
  vessel: string;
  rank: string;
  portType: "indian" | "foreign";
  monthlySalary?: number;
  usdRate?: number;
}

export interface FYData {
  fy: string; // e.g., "2025-26"
  fyYear: number; // e.g., 2025
  outsideDays: number;
  sailings: FYSailingSplit[];
}

export interface CloudUser {
  email: string;
  name: string;
  avatarUrl?: string;
  role: "admin" | "user";
  status: "active" | "suspended";
  createdAt: string;
  lastLoginAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  ip: string;
  userAgent: string;
  loginTime: string;
  lastActive: string;
  status: "online" | "offline" | "kicked";
}
