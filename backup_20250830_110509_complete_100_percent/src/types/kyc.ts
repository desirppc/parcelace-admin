
export type EntityType = 'individual' | 'partnership' | 'private-limited' | 'public';

export type KYCType = 'aadhar' | 'pan' | 'gst' | 'bank';

export type KYCStatus = 'not-started' | 'in-progress' | 'verified' | 'failed';

export interface KYCRequirement {
  type: KYCType;
  required: boolean;
  status: KYCStatus;
  label: string;
  description: string;
}

export interface AadharVerificationData {
  aadharNumber: string;
  otp: string;
}

export interface PANVerificationData {
  panNumber: string;
  name?: string;
  address?: string;
}

export interface GSTVerificationData {
  gstNumber: string;
  businessName?: string;
  address?: string;
}

export interface BankVerificationData {
  payeeName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifsc: string;
  phone: string;
}

export interface KYCState {
  entityType: EntityType | null;
  requirements: KYCRequirement[];
  currentVerification: KYCType | null;
  verificationData: {
    aadhar?: AadharVerificationData;
    pan?: PANVerificationData;
    gst?: GSTVerificationData;
    bank?: BankVerificationData;
  };
}
