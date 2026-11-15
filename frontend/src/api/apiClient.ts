// Typed API Client for Gharkhata REST Backend

declare const __API_BASE_URL__: string | undefined;

const BASE_URL = typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : (import.meta.env.VITE_API_BASE_URL || '/api/v1');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('gk_jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error [${response.status}] ${response.statusText}: ${errorText}`);
  }

  // If response is empty or 204
  const text = await response.text();
  return text ? JSON.parse(text) : (null as unknown as T);
}

export const api = {
  // Auth
  login: (identifier: string, password?: string) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) =>
    request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<any>('/auth/me'),

  // Buildings
  getBuildings: () => request<any[]>('/buildings'),
  createBuilding: (building: any) =>
    request<any>('/buildings', {
      method: 'POST',
      body: JSON.stringify(building),
    }),

  // Units
  getUnits: (buildingId?: string) =>
    request<any[]>(buildingId ? `/units?buildingId=${buildingId}` : '/units'),
  createUnit: (unit: any) =>
    request<any>('/units', {
      method: 'POST',
      body: JSON.stringify(unit),
    }),
  bulkCreateUnits: (units: any[]) =>
    request<any[]>('/units/bulk', {
      method: 'POST',
      body: JSON.stringify(units),
    }),
  copyFloorUnits: (buildingId: string, sourceFloor: number, targetFloor: number) =>
    request<any[]>('/units/copy-floor', {
      method: 'POST',
      body: JSON.stringify({ buildingId, sourceFloor, targetFloor }),
    }),

  // Tenants
  getTenants: () => request<any[]>('/tenants'),
  onboardTenant: (payload: any) =>
    request<any>('/tenants/onboard', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Leases
  getLeases: () => request<any[]>('/leases'),
  renewLease: (leaseId: string, newRentPaise: number, newEndDate?: string) =>
    request<any>(`/leases/${leaseId}/renew`, {
      method: 'POST',
      body: JSON.stringify({ newRentPaise, newEndDate }),
    }),

  // Payments / Receipts Ledger
  getPayments: () => request<any[]>('/payments'),
  recordPayment: (payment: any) =>
    request<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),
  reversePayment: (receiptId: string, reason: string) =>
    request<any>(`/payments/${receiptId}/reverse`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Maintenance Tickets
  getTickets: (buildingId?: string) =>
    request<any[]>(buildingId ? `/tickets?buildingId=${buildingId}` : '/tickets'),
  createTicket: (ticket: any) =>
    request<any>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    }),
  updateTicketStatus: (ticketId: string, status: string) =>
    request<any>(`/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Reminders & Notifications
  getReminderRules: () => request<any[]>('/reminders/rules'),
  getNotificationLogs: () => request<any[]>('/reminders/logs'),
  sendReminder: (unitId: string, channel: string) =>
    request<any>('/reminders/send', {
      method: 'POST',
      body: JSON.stringify({ unitId, channel }),
    }),

  // Brokerage
  getBrokerDeals: () => request<any[]>('/broker/deals'),
  createBrokerDeal: (deal: any) =>
    request<any>('/broker/deals', {
      method: 'POST',
      body: JSON.stringify(deal),
    }),

  // Expenses
  getExpenses: (buildingId?: string) =>
    request<any[]>(buildingId ? `/expenses?buildingId=${buildingId}` : '/expenses'),
  createExpense: (expense: any) =>
    request<any>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),

  // Audit Logs & Click Tracker
  getAuditLogs: () => request<any[]>('/audit'),
  logClick: (action: string, targetEntity: string, targetId: string, details: string) =>
    request<void>('/audit', {
      method: 'POST',
      body: JSON.stringify({ action, targetEntity, targetId, details }),
    }),

  // Settings
  getProfile: () => request<any>('/settings/profile'),
  updateProfile: (profile: { name?: string; email?: string; phone?: string; avatarUrl?: string }) =>
    request<any>('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
  getOrganization: () => request<any>('/settings/organization'),
  updateOrganization: (org: any) =>
    request<any>('/settings/organization', {
      method: 'PUT',
      body: JSON.stringify(org),
    }),
};

