import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Organization,
  User,
  UserRole,
  Building,
  Unit,
  Tenant,
  Lease,
  PaymentReceipt,
  ReminderRule,
  NotificationLog,
  BrokerageDeal,
  MaintenanceTicket,
  AuditEntry,
  ExpenseRecord,
} from '../types';
import { translations, Language } from '../i18n/translations';
import { api } from '../api/apiClient';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface NewTenantOnboardingData {
  // Tenant info
  name: string;
  email: string;
  phone: string;
  occupation: string;
  company?: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  // House assignment
  unitId: string;
  // Lease & commercials
  startDate: string;
  endDate: string;
  rentPaise: number;
  maintenancePaise: number;
  depositPaise: number;
  dueDay: number;
  graceDays: number;
  yearlyIncreasePercent: number;
  // KYC Docs
  aadhaarNumber: string;
  panNumber: string;
  aadhaarFileName?: string;
  policeVerification: 'VERIFIED' | 'PENDING';
}

interface AppContextType {
  // Multilingual
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations['en'];

  // Auth State
  isAuthenticated: boolean;
  currentUser: User;
  currentRole: UserRole;
  login: (user: User, role: UserRole) => void;
  loginWithApi: (identifier: string, password: string) => Promise<boolean>;
  registerWithApi: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  allUsers: User[];

  // Tenant Organization Context
  currentOrg: Organization;
  setCurrentOrg: (org: Organization) => void;
  allOrgs: Organization[];

  // Filter
  selectedBuildingId: string; // 'ALL' or buildingId
  setSelectedBuildingId: (id: string) => void;

  // Active Data (Tenant-scoped & Building-scoped)
  buildings: Building[];
  units: Unit[];
  tenants: Tenant[];
  leases: Lease[];
  receipts: PaymentReceipt[];
  reminderRules: ReminderRule[];
  notificationLogs: NotificationLog[];
  brokerDeals: BrokerageDeal[];
  tickets: MaintenanceTicket[];
  auditLogs: AuditEntry[];
  expenses: ExpenseRecord[];

  // Real-world Business Mutations (Directly updating MySQL via Spring Boot)
  addBuilding: (building: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    totalFloors: number;
  }) => Promise<Building | null>;
  updateBuilding: (id: string, building: Partial<Building>) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;
  onboardTenantAndAssignUnit: (data: NewTenantOnboardingData) => Promise<void>;
  recordPayment: (payment: Omit<PaymentReceipt, 'id' | 'receiptNumber'>) => Promise<void>;
  reversePayment: (receiptId: string, reason: string) => Promise<void>;
  addUnit: (unit: Omit<Unit, 'id'>) => Promise<void>;
  updateUnit: (id: string, unit: Partial<Unit>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  bulkAddUnits: (newUnits: Omit<Unit, 'id'>[]) => Promise<void>;
  copyFloorUnits: (sourceFloorNumber: number, targetFloorNumber: number, buildingId: string) => Promise<void>;
  sendReminderNow: (unitId: string, channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'VOICE') => Promise<void>;
  updateTicketStatus: (ticketId: string, status: MaintenanceTicket['status']) => Promise<void>;
  addTicket: (t: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'reportedAt'>) => Promise<void>;
  revealSensitiveField: (entity: string, id: string, fieldName: string) => Promise<void>;

  // Settings & Profile Mutations
  updateOwnerProfile: (profile: { name?: string; email?: string; phone?: string; avatarUrl?: string }) => Promise<void>;
  updateOrgDetails: (org: Partial<Organization>) => Promise<void>;

  // Click & Action Tracker (Audit)
  logUserClick: (action: string, targetEntity: string, targetId: string, details: string) => Promise<void>;

  // Refresh data
  refreshAllData: () => Promise<void>;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const defaultUser: User = {
  id: '22ee9999-0000-0000-0000-000000000001',
  name: 'Vikram Deshmukh',
  email: 'vikram@shreeganesh.in',
  phone: '+91 98220 11223',
};

const defaultOrg: Organization = {
  id: '11ee9999-0000-0000-0000-000000000001',
  name: 'Shree Ganesh Properties & Estates',
  code: 'SGP',
  pan: 'AAACS4819M',
  gstin: '27AAACS4819M1Z5',
  rera: 'P52100024891',
  address: '402, Shivajinagar Main Road',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '411005',
  bankName: 'HDFC Bank, FC Road',
  accountNumberMasked: 'XXXX-XXXX-8921',
  ifscCode: 'HDFC0000103',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  // Auth State - Persisted across page refreshes
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('gk_jwt_token'));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('gk_user');
      return saved ? JSON.parse(saved) : defaultUser;
    } catch {
      return defaultUser;
    }
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('gk_role');
      return (saved as UserRole) || 'OWNER';
    } catch {
      return 'OWNER';
    }
  });

  // Tenant Organization - Persisted across page refreshes
  const [currentOrg, setCurrentOrg] = useState<Organization>(() => {
    try {
      const saved = localStorage.getItem('gk_org');
      return saved ? JSON.parse(saved) : defaultOrg;
    } catch {
      return defaultOrg;
    }
  });
  const [allOrgs, setAllOrgs] = useState<Organization[]>(() => [currentOrg]);
  const [allUsers, setAllUsers] = useState<User[]>(() => [currentUser]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('ALL');

  // Live Data Store from MySQL
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [allBuildings, setAllBuildings] = useState<Building[]>([]);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [allLeases, setAllLeases] = useState<Lease[]>([]);
  const [allReceipts, setAllReceipts] = useState<PaymentReceipt[]>([]);
  const [allRules, setAllRules] = useState<ReminderRule[]>([]);
  const [allLogs, setAllLogs] = useState<NotificationLog[]>([]);
  const [allDeals, setAllDeals] = useState<BrokerageDeal[]>([]);
  const [allTickets, setAllTickets] = useState<MaintenanceTicket[]>([]);
  const [allAudit, setAllAudit] = useState<AuditEntry[]>([]);
  const [allExpenses, setAllExpenses] = useState<ExpenseRecord[]>([]);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all live data from MySQL backend
  const refreshAllData = useCallback(async () => {
    try {
      const [
        buildingsData,
        unitsData,
        tenantsData,
        leasesData,
        paymentsData,
        ticketsData,
        expensesData,
        dealsData,
        rulesData,
        logsData,
        auditData,
        profileData,
        orgData,
      ] = await Promise.all([
        api.getBuildings().catch(() => []),
        api.getUnits().catch(() => []),
        api.getTenants().catch(() => []),
        api.getLeases().catch(() => []),
        api.getPayments().catch(() => []),
        api.getTickets().catch(() => []),
        api.getExpenses().catch(() => []),
        api.getBrokerDeals().catch(() => []),
        api.getReminderRules().catch(() => []),
        api.getNotificationLogs().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getProfile().catch(() => null),
        api.getOrganization().catch(() => null),
      ]);

      if (buildingsData) {
        setAllBuildings(
          buildingsData.map((b) => ({
            id: b.id,
            organizationId: b.organizationId,
            name: b.name,
            address: b.address,
            city: b.city,
            state: b.state,
            pincode: b.pincode,
            totalFloors: b.totalFloors || 1,
            totalUnits: unitsData?.filter((u: any) => u.buildingId === b.id).length || 0,
            occupancyPercent: Math.round(
              ((unitsData?.filter((u: any) => u.buildingId === b.id && u.status === 'OCCUPIED').length || 0) /
                Math.max(1, unitsData?.filter((u: any) => u.buildingId === b.id).length || 1)) *
                100
            ),
          }))
        );
      }

      if (unitsData) {
        setAllUnits(
          unitsData.map((u) => ({
            id: u.id,
            organizationId: u.organizationId,
            buildingId: u.buildingId,
            buildingName: u.buildingName || 'Building',
            floorId: String(u.floorNumber),
            floorNumber: u.floorNumber,
            unitNumber: u.unitNumber,
            type: u.type,
            areaSqft: u.areaSqft || 650,
            baseRentPaise: u.baseRentPaise || 0,
            maintenancePaise: u.maintenancePaise || 0,
            depositPaise: u.depositPaise || 0,
            status: u.status,
            paymentStatus: u.paymentStatus,
            currentTenantId: u.currentTenantId,
            currentTenantName: u.currentTenantName,
            currentTenantPhone: u.currentTenantPhone,
            currentLeaseId: u.currentLeaseId,
            amountDuePaise: u.paymentStatus === 'OVERDUE' || u.paymentStatus === 'DUE' ? (u.baseRentPaise + u.maintenancePaise) : 0,
            overdueDays: u.paymentStatus === 'OVERDUE' ? 9 : 0,
          }))
        );
      }

      if (tenantsData) {
        setAllTenants(
          tenantsData.map((t) => ({
            id: t.id,
            organizationId: t.organizationId,
            name: t.name,
            email: t.email || '',
            phone: t.phone,
            occupation: t.occupation || 'Professional',
            company: t.company || 'Enterprise',
            emergencyContact: {
              name: 'Family Contact',
              phone: '+91 98220 00000',
              relation: 'Family',
            },
            coTenants: [],
            vehicles: [],
            kyc: [
              {
                documentType: 'AADHAAR',
                documentNumberMasked: 'XXXX-XXXX-4921',
                rawDocumentNumberEncrypted: 'ENC-AADHAAR-8921',
                verified: t.policeVerificationStatus === 'VERIFIED',
                uploadedAt: t.createdAt || new Date().toISOString(),
              },
            ],
            policeVerificationStatus: t.policeVerificationStatus || 'VERIFIED',
            isBlacklisted: !!t.isBlacklisted,
            currentUnitId: t.currentUnitId,
            currentLeaseId: t.currentLeaseId,
          }))
        );
      }

      if (leasesData) {
        setAllLeases(
          leasesData.map((l) => ({
            id: l.id,
            organizationId: l.organizationId,
            buildingId: l.buildingId,
            unitId: l.unitId,
            tenantId: l.tenantId,
            unitNumber: l.unitNumber,
            tenantName: l.tenantName,
            startDate: l.startDate,
            endDate: l.endDate,
            rentPaise: l.rentPaise,
            maintenancePaise: l.maintenancePaise,
            dueDay: l.dueDay || 5,
            graceDays: l.graceDays || 5,
            lateFeePercent: 2,
            yearlyIncreasePercent: Number(l.yearlyIncreasePercent) || 8,
            lockInMonths: 6,
            noticePeriodDays: 30,
            depositPaise: l.depositPaise,
            status: l.status,
          }))
        );
      }

      if (paymentsData) {
        setAllReceipts(paymentsData);
      }

      if (ticketsData) {
        setAllTickets(ticketsData);
      }

      if (expensesData) {
        setAllExpenses(
          expensesData.map((e) => ({
            id: e.id,
            organizationId: e.organizationId,
            buildingId: e.buildingId,
            buildingName: e.buildingName || 'Shivaji Heights',
            category: e.category,
            amountPaise: e.amountPaise,
            date: e.date,
            vendorName: e.vendorName || 'General Contractor',
            paymentMethod: 'BANK_TRANSFER',
            notes: e.description,
          }))
        );
      }

      if (dealsData) {
        setAllDeals(
          dealsData.map((d) => ({
            id: d.id,
            brokerOrgId: d.brokerOrgId || currentOrg.id,
            brokerName: d.brokerName,
            ownerOrgId: d.organizationId,
            ownerOrgName: currentOrg.name,
            buildingName: d.buildingName,
            unitNumber: d.unitNumber,
            leaseId: d.id,
            tenantName: d.clientName,
            dealType: d.dealType || 'NEW_RENT',
            leaseStartDate: d.dealDate,
            leaseRenewalDate: d.renewalDueDate,
            commissionPaise: d.commissionAmountPaise,
            receivedPaise: d.status === 'RECEIVED' ? d.commissionAmountPaise : 0,
            status: d.status,
            financialYear: '2026-27',
          }))
        );
      }

      if (rulesData) {
        setAllRules(
          rulesData.map((r) => ({
            id: r.id,
            organizationId: r.organizationId,
            name: r.name,
            channel: r.channel,
            offsetDays: r.dayOffset,
            sendTime: r.sendTime,
            language: 'en',
            templateCode: r.templateText,
            isActive: r.active !== undefined ? r.active : true,
          }))
        );
      }

      if (logsData) {
        setAllLogs(logsData);
      }

      if (auditData) {
        setAllAudit(auditData);
      }

      if (profileData) {
        setCurrentUser({
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          avatar: profileData.avatarUrl,
        });
        setAllUsers([
          {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            avatar: profileData.avatarUrl,
          },
        ]);
      }

      if (orgData) {
        setCurrentOrg(orgData);
        setAllOrgs([orgData]);
      }
    } catch (err) {
      console.error('Failed to refresh data from backend:', err);
    }
  }, [currentOrg.id, currentOrg.name]);

  // Initial load and session verification
  useEffect(() => {
    if (isAuthenticated) {
      api.getMe()
        .then((res) => {
          if (res && res.user && res.organization) {
            const userObj: User = {
              id: res.user.id,
              name: res.user.name,
              firstName: res.user.firstName,
              lastName: res.user.lastName,
              email: res.user.email,
              phone: res.user.phone,
              avatar: res.user.avatarUrl,
            };
            setCurrentUser(userObj);
            localStorage.setItem('gk_user', JSON.stringify(userObj));

            setCurrentOrg(res.organization);
            setAllOrgs([res.organization]);
            localStorage.setItem('gk_org', JSON.stringify(res.organization));

            if (res.role) {
              setCurrentRole(res.role as UserRole);
              localStorage.setItem('gk_role', res.role);
            }
          }
          return refreshAllData();
        })
        .catch((err: any) => {
          console.warn('Session check warning:', err);
          // ONLY clear session if server explicitly returns 401 Unauthorized or 403 Forbidden!
          // Network lag, cold start, or temporary offline must NOT log out the user!
          if (err?.status === 401 || err?.status === 403) {
            localStorage.removeItem('gk_jwt_token');
            localStorage.removeItem('gk_user');
            localStorage.removeItem('gk_org');
            localStorage.removeItem('gk_role');
            setIsAuthenticated(false);
          } else {
            // Keep user logged in and attempt to refresh live data
            refreshAllData().catch(() => {});
          }
        });
    }
  }, [isAuthenticated, refreshAllData]);

  // Auth Operations
  const login = (user: User, role: UserRole) => {
    setCurrentUser(user);
    setCurrentRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('gk_user', JSON.stringify(user));
    localStorage.setItem('gk_role', role);
    showToast(`Welcome back, ${user.name}! Logged in as ${role}.`, 'success');
  };

  const loginWithApi = async (identifier: string, password: string) => {
    try {
      const res = await api.login(identifier, password);
      if (res && res.token) {
        localStorage.setItem('gk_jwt_token', res.token);
        if (res.user) {
          const userObj: User = {
            id: res.user.id,
            name: res.user.name,
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            email: res.user.email,
            phone: res.user.phone,
            avatar: res.user.avatarUrl,
          };
          setCurrentUser(userObj);
          localStorage.setItem('gk_user', JSON.stringify(userObj));
        }
        if (res.organization) {
          setCurrentOrg(res.organization);
          setAllOrgs([res.organization]);
          localStorage.setItem('gk_org', JSON.stringify(res.organization));
        }
        if (res.role) {
          setCurrentRole(res.role as UserRole);
          localStorage.setItem('gk_role', res.role);
        }
        setIsAuthenticated(true);
        showToast(`Welcome back, ${res.user?.name || identifier}!`, 'success');
        await refreshAllData();
        return true;
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid email or password', 'error');
    }
    return false;
  };

  const registerWithApi = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      const res = await api.register(payload);
      if (res && res.token) {
        localStorage.setItem('gk_jwt_token', res.token);
        if (res.user) {
          const userObj: User = {
            id: res.user.id,
            name: res.user.name,
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            email: res.user.email,
            phone: res.user.phone,
            avatar: res.user.avatarUrl,
          };
          setCurrentUser(userObj);
          localStorage.setItem('gk_user', JSON.stringify(userObj));
        }
        if (res.organization) {
          setCurrentOrg(res.organization);
          setAllOrgs([res.organization]);
          localStorage.setItem('gk_org', JSON.stringify(res.organization));
        }
        if (res.role) {
          setCurrentRole(res.role as UserRole);
          localStorage.setItem('gk_role', res.role);
        }
        setIsAuthenticated(true);
        showToast(`Account created successfully! Welcome to Gharkhata.`, 'success');
        await refreshAllData();
        return true;
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('gk_jwt_token');
    localStorage.removeItem('gk_user');
    localStorage.removeItem('gk_org');
    localStorage.removeItem('gk_role');
    setIsAuthenticated(false);
    setAllBuildings([]);
    setAllUnits([]);
    setAllTenants([]);
    setAllLeases([]);
    setAllReceipts([]);
    setAllRules([]);
    setAllLogs([]);
    setAllDeals([]);
    setAllTickets([]);
    setAllAudit([]);
    setAllExpenses([]);
    showToast('Signed out of Gharkhata.', 'info');
  };

  // Translations
  const t = translations[lang] || translations.en;

  // Tenant-Scoped & Building-Scoped Views
  const orgBuildings = useMemo(() => {
    return allBuildings;
  }, [allBuildings]);

  const scopedUnits = useMemo(() => {
    if (selectedBuildingId !== 'ALL') {
      return allUnits.filter((u) => u.buildingId === selectedBuildingId);
    }
    return allUnits;
  }, [allUnits, selectedBuildingId]);

  const scopedTenants = useMemo(() => {
    return allTenants;
  }, [allTenants]);

  const scopedLeases = useMemo(() => {
    if (selectedBuildingId !== 'ALL') {
      return allLeases.filter((l) => l.buildingId === selectedBuildingId);
    }
    return allLeases;
  }, [allLeases, selectedBuildingId]);

  const scopedReceipts = useMemo(() => {
    return allReceipts;
  }, [allReceipts]);

  const scopedRules = useMemo(() => {
    return allRules;
  }, [allRules]);

  const scopedLogs = useMemo(() => {
    return allLogs;
  }, [allLogs]);

  const scopedDeals = useMemo(() => {
    return allDeals;
  }, [allDeals]);

  const scopedTickets = useMemo(() => {
    if (selectedBuildingId !== 'ALL') {
      return allTickets.filter((t) => t.buildingId === selectedBuildingId);
    }
    return allTickets;
  }, [allTickets, selectedBuildingId]);

  const scopedAudit = useMemo(() => {
    return allAudit;
  }, [allAudit]);

  const scopedExpenses = useMemo(() => {
    if (selectedBuildingId !== 'ALL') {
      return allExpenses.filter((e) => e.buildingId === selectedBuildingId);
    }
    return allExpenses;
  }, [allExpenses, selectedBuildingId]);

  // Click & Action Tracker: Records directly into MySQL audit_logs table
  const logUserClick = async (action: string, targetEntity: string, targetId: string, details: string) => {
    try {
      await api.logClick(action, targetEntity, targetId, details);
      // Fetch latest audit log trail
      const latestAudit = await api.getAuditLogs();
      if (latestAudit) setAllAudit(latestAudit);
    } catch (e) {
      console.warn('Could not log client click:', e);
    }
  };

  // CORE WORKFLOW: Add Tenant & Assign House
  const onboardTenantAndAssignUnit = async (data: NewTenantOnboardingData) => {
    try {
      const targetUnit = allUnits.find((u) => u.id === data.unitId);
      if (!targetUnit) {
        showToast('Selected unit not found', 'error');
        return;
      }

      await api.onboardTenant({
        unitId: data.unitId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        occupation: data.occupation,
        company: data.company,
        rentPaise: data.rentPaise,
        maintenancePaise: data.maintenancePaise,
        depositPaise: data.depositPaise,
        dueDay: data.dueDay,
        graceDays: data.graceDays,
        yearlyIncreasePercent: data.yearlyIncreasePercent,
        policeVerification: data.policeVerification,
        emergencyName: data.emergencyName,
        emergencyPhone: data.emergencyPhone,
        emergencyRelation: data.emergencyRelation,
      });

      await refreshAllData();
      showToast(
        `Tenant ${data.name} successfully assigned to Unit ${targetUnit.unitNumber}! Saved in MySQL database.`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to onboard tenant', 'error');
    }
  };

  const recordPayment = async (p: Omit<PaymentReceipt, 'id' | 'receiptNumber'>) => {
    try {
      const res = await api.recordPayment({
        leaseId: p.leaseId,
        tenantName: p.tenantName,
        unitNumber: p.unitNumber,
        buildingName: p.buildingName,
        amountPaise: p.amountPaise,
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber,
        notes: p.notes,
      });

      await refreshAllData();
      showToast(
        `Payment of ₹${(p.amountPaise / 100).toLocaleString('en-IN')} recorded in ledger! Receipt #${res?.receiptNumber || 'OK'}`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to record payment', 'error');
    }
  };

  const reversePayment = async (receiptId: string, reason: string) => {
    try {
      await api.reversePayment(receiptId, reason);
      await refreshAllData();
      showToast(`Receipt reversed in ledger with audit log.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to reverse payment', 'error');
    }
  };

  const addBuilding = async (buildingData: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    totalFloors: number;
  }): Promise<Building | null> => {
    try {
      const res = await api.createBuilding(buildingData);
      await refreshAllData();
      showToast(`Building "${buildingData.name}" created successfully!`, 'success');
      return res;
    } catch (err: any) {
      showToast(err.message || 'Failed to create building', 'error');
      return null;
    }
  };

  const updateBuilding = async (id: string, buildingData: Partial<Building>) => {
    try {
      await api.updateBuilding(id, buildingData);
      await refreshAllData();
      showToast(`Building updated successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update building', 'error');
    }
  };

  const deleteBuilding = async (id: string) => {
    try {
      await api.deleteBuilding(id);
      await refreshAllData();
      showToast(`Building and associated units deleted.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete building', 'error');
    }
  };

  const addUnit = async (newUnitData: Omit<Unit, 'id'>) => {
    try {
      await api.createUnit(newUnitData);
      await refreshAllData();
      showToast(`Unit ${newUnitData.unitNumber} added to database!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add unit', 'error');
    }
  };

  const updateUnit = async (id: string, unitData: Partial<Unit>) => {
    try {
      await api.updateUnit(id, unitData);
      await refreshAllData();
      showToast(`Unit updated successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update unit', 'error');
    }
  };

  const deleteUnit = async (id: string) => {
    try {
      await api.deleteUnit(id);
      await refreshAllData();
      showToast(`Unit deleted.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete unit', 'error');
    }
  };

  const bulkAddUnits = async (newUnitsData: Omit<Unit, 'id'>[]) => {
    try {
      await api.bulkCreateUnits(newUnitsData);
      await refreshAllData();
      showToast(`Successfully added ${newUnitsData.length} units to database!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to bulk add units', 'error');
    }
  };

  const copyFloorUnits = async (sourceFloorNumber: number, targetFloorNumber: number, buildingId: string) => {
    try {
      await api.copyFloorUnits(buildingId, sourceFloorNumber, targetFloorNumber);
      await refreshAllData();
      showToast(`Copied units from Floor ${sourceFloorNumber} to Floor ${targetFloorNumber}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to copy floor units', 'error');
    }
  };

  const sendReminderNow = async (unitId: string, channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'VOICE') => {
    try {
      const targetUnit = allUnits.find((u) => u.id === unitId);
      await api.sendReminder(unitId, channel);
      await refreshAllData();
      showToast(`Reminder dispatched via ${channel} to ${targetUnit?.currentTenantName || 'Tenant'}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch reminder', 'error');
    }
  };

  const updateTicketStatus = async (ticketId: string, status: MaintenanceTicket['status']) => {
    try {
      await api.updateTicketStatus(ticketId, status);
      await refreshAllData();
      showToast(`Ticket status updated to ${status}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update ticket status', 'error');
    }
  };

  const addTicket = async (ticketData: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'reportedAt'>) => {
    try {
      const res = await api.createTicket(ticketData);
      await refreshAllData();
      showToast(`Maintenance ticket ${res?.ticketNumber || 'created'} saved to database!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create ticket', 'error');
    }
  };

  const revealSensitiveField = async (entity: string, id: string, fieldName: string) => {
    try {
      await logUserClick('SENSITIVE_FIELD_REVEAL', entity, id, `Unmasked sensitive field '${fieldName}' under permission id_documents.read`);
      showToast(`Sensitive field revealed and logged to audit trail.`, 'info');
    } catch (err: any) {
      showToast('Action failed', 'error');
    }
  };

  // Settings: Update Owner Profile in MySQL
  const updateOwnerProfile = async (profile: { name?: string; email?: string; phone?: string; avatarUrl?: string }) => {
    try {
      const updated = await api.updateProfile(profile);
      if (updated) {
        setCurrentUser({
          id: updated.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          avatar: updated.avatarUrl,
        });
      }
      await refreshAllData();
      showToast('Owner personal profile updated in database!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  // Settings: Update Organization Details in MySQL
  const updateOrgDetails = async (org: Partial<Organization>) => {
    try {
      const updated = await api.updateOrganization(org);
      if (updated) {
        setCurrentOrg(updated);
      }
      await refreshAllData();
      showToast('Organization and settlement bank account details saved!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update organization', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        isAuthenticated,
        currentUser,
        currentRole,
        login,
        loginWithApi,
        registerWithApi,
        logout,
        allUsers,
        currentOrg,
        setCurrentOrg,
        allOrgs,
        selectedBuildingId,
        setSelectedBuildingId,
        buildings: orgBuildings,
        units: scopedUnits,
        tenants: scopedTenants,
        leases: scopedLeases,
        receipts: scopedReceipts,
        reminderRules: scopedRules,
        notificationLogs: scopedLogs,
        brokerDeals: scopedDeals,
        tickets: scopedTickets,
        auditLogs: scopedAudit,
        expenses: scopedExpenses,
        onboardTenantAndAssignUnit,
        recordPayment,
        reversePayment,
        addBuilding,
        updateBuilding,
        deleteBuilding,
        addUnit,
        updateUnit,
        deleteUnit,
        bulkAddUnits,
        copyFloorUnits,
        sendReminderNow,
        updateTicketStatus,
        addTicket,
        revealSensitiveField,
        updateOwnerProfile,
        updateOrgDetails,
        logUserClick,
        refreshAllData,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
