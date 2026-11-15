export type UserRole =
  | 'OWNER'
  | 'CO_OWNER'
  | 'PROPERTY_MANAGER'
  | 'ACCOUNTANT'
  | 'CARETAKER'
  | 'BROKER'
  | 'BROKER_STAFF'
  | 'TENANT'
  | 'VENDOR'
  | 'PLATFORM_ADMIN';

export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'NOTICE' | 'MAINTENANCE' | 'RESERVED';
export type PaymentStatus = 'PAID' | 'DUE' | 'OVERDUE' | 'NOTICE' | 'VACANT';
export type UnitType = '1RK' | '1BHK' | '2BHK' | '3BHK' | '4BHK' | 'Commercial' | 'Shop';
export type PaymentMethod = 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH';
export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'VOICE';
export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  avatar?: string;
  isTwoFactorEnabled?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  pan?: string;
  gstin?: string;
  rera?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName?: string;
  accountNumberMasked?: string;
  ifscCode?: string;
}

export interface Membership {
  userId: string;
  orgId: string;
  role: UserRole;
  buildingScope?: string[]; // null means all buildings
}

export interface TenantContext {
  user: User;
  organization: Organization;
  role: UserRole;
  buildingScope?: string[];
  permissions: string[];
}

export interface Building {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalFloors: number;
  totalUnits: number;
  occupancyPercent: number;
  image?: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNumber: number;
  floorLabel: string;
}

export interface Unit {
  id: string;
  organizationId: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorNumber: number;
  unitNumber: string;
  type: UnitType;
  areaSqft: number;
  baseRentPaise: number;
  maintenancePaise: number;
  depositPaise: number;
  status: UnitStatus;
  paymentStatus: PaymentStatus;
  currentTenantId?: string;
  currentTenantName?: string;
  currentTenantPhone?: string;
  currentLeaseId?: string;
  overdueDays?: number;
  amountDuePaise?: number;
}

export interface TenantKYC {
  documentType: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'VOTER_ID';
  documentNumberMasked: string; // e.g. "XXXX-XXXX-4921"
  rawDocumentNumberEncrypted: string;
  verified: boolean;
  uploadedAt: string;
}

export interface Tenant {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  company?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  coTenants: Array<{ name: string; age: number; relation: string }>;
  vehicles: Array<{ type: 'CAR' | 'BIKE'; regNumber: string }>;
  kyc: TenantKYC[];
  policeVerificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  isBlacklisted: boolean;
  currentUnitId?: string;
  currentLeaseId?: string;
}

export interface Lease {
  id: string;
  organizationId: string;
  buildingId: string;
  unitId: string;
  tenantId: string;
  unitNumber: string;
  tenantName: string;
  startDate: string; // ISO
  endDate: string; // ISO
  rentPaise: number;
  maintenancePaise: number;
  dueDay: number; // e.g. 5th of month
  graceDays: number;
  lateFeePercent: number; // e.g. 2%
  yearlyIncreasePercent: number; // e.g. 8%
  lockInMonths: number;
  noticePeriodDays: number;
  depositPaise: number;
  status: 'ACTIVE' | 'PENDING' | 'TERMINATED' | 'EXPIRED';
  agreementPdfUrl?: string;
}

export interface RentCharge {
  id: string;
  organizationId: string;
  leaseId: string;
  unitNumber: string;
  tenantName: string;
  period: string; // "Nov 2026"
  baseRentPaise: number;
  maintenancePaise: number;
  lateFeePaise: number;
  totalDuePaise: number;
  paidAmountPaise: number;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface PaymentReceipt {
  id: string;
  organizationId: string;
  receiptNumber: string; // e.g. "GK/2026-27/0412"
  leaseId: string;
  tenantName: string;
  unitNumber: string;
  buildingName: string;
  amountPaise: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  status: 'COMPLETED' | 'REVERSED';
  recordedBy: string;
  notes?: string;
}

export interface ReminderRule {
  id: string;
  organizationId: string;
  buildingId?: string; // null means all
  name: string;
  channel: NotificationChannel;
  offsetDays: number; // e.g. -5 (5 days before), 0 (on due day), +3 (3 days overdue)
  sendTime: string; // e.g. "10:30"
  language: SupportedLanguage;
  templateCode: string;
  isActive: boolean;
}

export interface NotificationLog {
  id: string;
  organizationId: string;
  recipientName: string;
  recipientPhoneOrEmail: string;
  channel: NotificationChannel;
  messagePreview: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
  sentAt: string;
  costPaise: number;
}

export interface BrokerageDeal {
  id: string;
  brokerOrgId: string;
  brokerName: string;
  ownerOrgId: string;
  ownerOrgName: string;
  buildingName: string;
  unitNumber: string;
  leaseId: string;
  tenantName: string;
  dealType: 'NEW_RENT' | 'RENEWAL' | 'SALE';
  leaseStartDate: string;
  leaseRenewalDate: string; // triggers renewal reminder at 60 & 30 days
  commissionPaise: number;
  receivedPaise: number;
  status: 'PENDING' | 'PARTIAL' | 'RECEIVED';
  financialYear: string;
}

export interface MaintenanceTicket {
  id: string;
  organizationId: string;
  ticketNumber: string; // e.g. "TKT-1082"
  buildingId: string;
  buildingName: string;
  unitId?: string;
  unitNumber: string;
  tenantName: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'CARPENTRY' | 'PAINTING' | 'APPLIANCE' | 'CLEANING' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  slaHours: number;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedVendorName?: string;
  assignedVendorPhone?: string;
  description: string;
  reportedAt: string;
  resolvedAt?: string;
}

export interface AuditEntry {
  id: string;
  organizationId: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. "KYC_REVEAL", "PAYMENT_RECORD", "LEASE_CREATE"
  targetEntity: string;
  targetId: string;
  details: string;
  ipAddress: string;
}

export interface ExpenseRecord {
  id: string;
  organizationId: string;
  buildingId: string;
  buildingName: string;
  category: 'LIFT_AMC' | 'SECURITY' | 'CLEANING' | 'ELECTRICITY' | 'WATER' | 'REPAIRS' | 'TAX';
  amountPaise: number;
  date: string;
  vendorName: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

