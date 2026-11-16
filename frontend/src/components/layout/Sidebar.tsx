import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileCheck2,
  Receipt,
  BellRing,
  Briefcase,
  Wrench,
  BarChart3,
  Settings,
  ShieldCheck,
  PlusCircle,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type NavItemKey =
  | 'dashboard'
  | 'tenants'
  | 'leases'
  | 'rent'
  | 'reminders'
  | 'brokerage'
  | 'tickets'
  | 'reports'
  | 'audit'
  | 'settings'
  | 'onboarding';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
}

declare const __APP_NAME__: string | undefined;

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { t, currentRole, currentOrg } = useApp();

  const navItems: Array<{
    key: NavItemKey;
    label: string;
    icon: React.ReactNode;
    roles?: string[];
  }> = [
    {
      key: 'dashboard',
      label: t.navDashboard,
      icon: <LayoutDashboard size={18} />,
    },
    {
      key: 'tenants',
      label: t.navTenants,
      icon: <Users size={18} />,
      roles: ['OWNER', 'CO_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT', 'BROKER'],
    },
    {
      key: 'leases',
      label: t.navLeases,
      icon: <FileCheck2 size={18} />,
      roles: ['OWNER', 'CO_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT', 'TENANT'],
    },
    {
      key: 'rent',
      label: t.navRent,
      icon: <Receipt size={18} />,
      roles: ['OWNER', 'CO_OWNER', 'PROPERTY_MANAGER', 'ACCOUNTANT', 'CARETAKER', 'TENANT'],
    },
    {
      key: 'reminders',
      label: t.navReminders,
      icon: <BellRing size={18} />,
      roles: ['OWNER', 'CO_OWNER', 'PROPERTY_MANAGER'],
    },
    {
      key: 'brokerage',
      label: t.navBrokerage,
      icon: <Briefcase size={18} />,
      roles: ['OWNER', 'CO_OWNER', 'BROKER', 'BROKER_STAFF'],
    },
    {
      key: 'tickets',
      label: t.navTickets,
      icon: <Wrench size={18} />,
      roles: ['OWNER', 'CO_OWNER', 'PROPERTY_MANAGER', 'CARETAKER', 'TENANT', 'VENDOR'],
    },
    {
      key: 'reports',
      label: t.navReports,
      icon: <BarChart3 size={18} />,
      roles: ['OWNER', 'CO_OWNER', 'ACCOUNTANT'],
    },
    {
      key: 'audit',
      label: t.navAudit,
      icon: <History size={18} />,
      roles: ['OWNER', 'CO_OWNER', 'ACCOUNTANT', 'PLATFORM_ADMIN'],
    },
    {
      key: 'settings',
      label: t.navSettings,
      icon: <Settings size={18} />,
      roles: ['OWNER', 'CO_OWNER', 'PLATFORM_ADMIN'],
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (currentRole === 'PLATFORM_ADMIN') return true;
    return item.roles.includes(currentRole);
  });

  return (
    <aside className="w-[248px] bg-sidebar text-[#EFE4D2] flex flex-col h-full flex-shrink-0 select-none border-r border-[#3D2D22]">
      {/* Brand Header */}
      <div className="p-6 pb-5 border-b border-[#3D2D22] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-terracotta flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm shrink-0">
            <img
              src="/logo.png"
              alt="Gharkhata Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-tight text-[#FAF3E8] leading-none">
              {typeof __APP_NAME__ !== 'undefined' ? __APP_NAME__ : t.appName}
            </h1>
            <p className="text-[10px] text-[#A69280] tracking-wider uppercase mt-1">
              घरखाता • Rent Ledger
            </p>
          </div>
        </div>

        {/* Current Org Pill */}
        <div className="mt-4 p-2.5 rounded-[10px] bg-[#1E150F] border border-[#3D2D22]">
          <div className="text-[10px] text-[#A69280] uppercase tracking-wider font-semibold">
            Active Ledger
          </div>
          <div className="text-xs font-semibold text-[#FAF3E8] truncate mt-0.5">
            {currentOrg.name}
          </div>
          <div className="text-[10px] text-[#CDBBA0] mt-0.5">
            PAN: {currentOrg.pan}
          </div>
        </div>
      </div>

      {/* Nav List - Fixed within viewport */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-sidebar-active text-ink font-semibold shadow-sm'
                  : 'text-[#EFE4D2] hover:bg-[#3D2D22]/60 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-terracotta' : 'text-[#CDBBA0]'}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Security & Tenant Isolation Footer */}
      <div className="p-4 border-t border-[#3D2D22] text-[11px] text-[#A69280] flex items-center gap-2 flex-shrink-0">
        <ShieldCheck size={14} className="text-paid flex-shrink-0" />
        <span className="truncate">Row-Level Isolated: {currentOrg.code}</span>
      </div>
    </aside>
  );
};
