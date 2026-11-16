import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  MoreHorizontal,
  Plus,
  Receipt,
  Send,
  PlusCircle,
  FileCheck2,
  BellRing,
  Briefcase,
  Wrench,
  BarChart3,
  Settings,
  History,
} from 'lucide-react';
import { NavItemKey } from './Sidebar';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface BottomBarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  onQuickRecordPayment?: () => void;
  onQuickAddUnit?: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentTab,
  onSelectTab,
  onQuickRecordPayment,
  onQuickAddUnit,
}) => {
  const { t } = useApp();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <>
      {/* 84px Phone Bottom Bar on #FBF7EF */}
      <nav className="fixed bottom-0 left-0 right-0 h-[84px] bg-[#FBF7EF] border-t border-line flex items-center justify-around px-2 z-40 select-none pb-2">
        {/* Home */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-colors ${
            currentTab === 'dashboard' ? 'text-terracotta' : 'text-muted-text hover:text-ink'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-semibold">{t.navDashboard}</span>
        </button>

        {/* Rent Ledger */}
        <button
          onClick={() => onSelectTab('rent')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-colors ${
            currentTab === 'rent' ? 'text-terracotta' : 'text-muted-text hover:text-ink'
          }`}
        >
          <Receipt size={20} />
          <span className="text-[10px] font-semibold">{t.navRent}</span>
        </button>

        {/* Centre Add Button: 58px #A8481F circle with 4px #F4ECDF ring */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            onClick={() => setShowQuickActions(true)}
            aria-label="Quick Actions"
            className="w-[58px] h-[58px] rounded-full bg-[#A8481F] text-white flex items-center justify-center shadow-float ring-4 ring-[#F4ECDF] active:scale-95 transition-transform"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
          <span className="text-[10px] font-bold text-ink mt-0.5">Quick</span>
        </div>

        {/* Tenants */}
        <button
          onClick={() => onSelectTab('tenants')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-colors ${
            currentTab === 'tenants' ? 'text-terracotta' : 'text-muted-text hover:text-ink'
          }`}
        >
          <Users size={20} />
          <span className="text-[10px] font-semibold">{t.navTenants}</span>
        </button>

        {/* More Menu */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-colors ${
            ['buildings', 'leases', 'rent', 'reminders', 'brokerage', 'tickets', 'reports', 'settings', 'audit'].includes(
              currentTab
            )
              ? 'text-terracotta'
              : 'text-muted-text hover:text-ink'
          }`}
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>

      {/* Quick Actions Sheet */}
      <Modal
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        title="Quick Ledger Actions"
        subtitle="Perform frequent tasks instantly"
      >
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => {
              setShowQuickActions(false);
              if (onQuickAddUnit) onQuickAddUnit();
            }}
            className="flex items-center gap-3 p-4 rounded-[12px] bg-ground border border-line text-left hover:bg-ground/70 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-terracotta/15 text-terracotta flex items-center justify-center flex-shrink-0">
              <PlusCircle size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-ink">+ Add Tenant & Assign House</div>
              <div className="text-xs text-muted-text">Onboard resident, allocate vacant unit, upload KYC & terms</div>
            </div>
          </button>

          <button
            onClick={() => {
              setShowQuickActions(false);
              if (onQuickRecordPayment) onQuickRecordPayment();
            }}
            className="flex items-center gap-3 p-4 rounded-[12px] bg-ground border border-line text-left hover:bg-ground/70 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-paid/15 text-paid flex items-center justify-center flex-shrink-0">
              <Receipt size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-ink">{t.recordPayment}</div>
              <div className="text-xs text-muted-text">Issue numbered receipt and allocate to oldest charge</div>
            </div>
          </button>

          <button
            onClick={() => {
              setShowQuickActions(false);
              onSelectTab('reminders');
            }}
            className="flex items-center gap-3 p-4 rounded-[12px] bg-ground border border-line text-left hover:bg-ground/70 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-terracotta/15 text-terracotta flex items-center justify-center flex-shrink-0">
              <Send size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-ink">{t.sendReminder}</div>
              <div className="text-xs text-muted-text">Dispatch WhatsApp, SMS or Voice calls to tenants</div>
            </div>
          </button>
        </div>
      </Modal>

      {/* More Navigation Menu Modal */}
      <Modal
        isOpen={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        title="Gharkhata Navigation"
        subtitle="All modules, profile settings, and audit logs"
      >
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <button
            onClick={() => {
              onSelectTab('leases');
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 p-3 rounded-[10px] border text-left transition-colors ${
              currentTab === 'leases'
                ? 'bg-terracotta/10 border-terracotta text-terracotta font-bold'
                : 'bg-ground border-line text-ink hover:bg-ground/70 font-semibold'
            }`}
          >
            <FileCheck2 size={16} className="text-terracotta flex-shrink-0" />
            <span className="truncate">{t.navLeases}</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('rent');
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 p-3 rounded-[10px] border text-left transition-colors ${
              currentTab === 'rent'
                ? 'bg-terracotta/10 border-terracotta text-terracotta font-bold'
                : 'bg-ground border-line text-ink hover:bg-ground/70 font-semibold'
            }`}
          >
            <Receipt size={16} className="text-paid flex-shrink-0" />
            <span className="truncate">{t.navRent}</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('reminders');
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 p-3 rounded-[10px] border text-left transition-colors ${
              currentTab === 'reminders'
                ? 'bg-terracotta/10 border-terracotta text-terracotta font-bold'
                : 'bg-ground border-line text-ink hover:bg-ground/70 font-semibold'
            }`}
          >
            <BellRing size={16} className="text-terracotta flex-shrink-0" />
            <span className="truncate">{t.navReminders}</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('brokerage');
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 p-3 rounded-[10px] border text-left transition-colors ${
              currentTab === 'brokerage'
                ? 'bg-terracotta/10 border-terracotta text-terracotta font-bold'
                : 'bg-ground border-line text-ink hover:bg-ground/70 font-semibold'
            }`}
          >
            <Briefcase size={16} className="text-terracotta flex-shrink-0" />
            <span className="truncate">{t.navBrokerage}</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('tickets');
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 p-3 rounded-[10px] border text-left transition-colors ${
              currentTab === 'tickets'
                ? 'bg-terracotta/10 border-terracotta text-terracotta font-bold'
                : 'bg-ground border-line text-ink hover:bg-ground/70 font-semibold'
            }`}
          >
            <Wrench size={16} className="text-terracotta flex-shrink-0" />
            <span className="truncate">{t.navTickets}</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('reports');
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 p-3 rounded-[10px] border text-left transition-colors ${
              currentTab === 'reports'
                ? 'bg-terracotta/10 border-terracotta text-terracotta font-bold'
                : 'bg-ground border-line text-ink hover:bg-ground/70 font-semibold'
            }`}
          >
            <BarChart3 size={16} className="text-terracotta flex-shrink-0" />
            <span className="truncate">{t.navReports}</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('buildings');
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 p-3 rounded-[10px] border text-left transition-colors ${
              currentTab === 'buildings'
                ? 'bg-terracotta/10 border-terracotta text-terracotta font-bold'
                : 'bg-ground border-line text-ink hover:bg-ground/70 font-semibold'
            }`}
          >
            <Building2 size={16} className="text-terracotta flex-shrink-0" />
            <span className="truncate">{t.navBuildings}</span>
          </button>

          {/* 1. Dedicated Settings Option */}
          <button
            onClick={() => {
              onSelectTab('settings');
              setShowMoreMenu(false);
            }}
            className={`flex items-center gap-2 p-3 rounded-[10px] border text-left transition-colors ${
              currentTab === 'settings'
                ? 'bg-terracotta/10 border-terracotta text-terracotta font-bold'
                : 'bg-ground border-line text-ink hover:bg-ground/70 font-semibold'
            }`}
          >
            <Settings size={16} className="text-terracotta flex-shrink-0" />
            <span className="truncate">{t.navSettings}</span>
          </button>

          {/* 2. Dedicated Audit Log Option */}
          <button
            onClick={() => {
              onSelectTab('audit');
              setShowMoreMenu(false);
            }}
            className={`col-span-2 flex items-center gap-2 p-3 rounded-[10px] border text-left transition-colors ${
              currentTab === 'audit'
                ? 'bg-terracotta/10 border-terracotta text-terracotta font-bold'
                : 'bg-ground border-line text-ink hover:bg-ground/70 font-semibold'
            }`}
          >
            <History size={16} className="text-terracotta flex-shrink-0" />
            <span className="truncate">{t.navAudit}</span>
          </button>
        </div>
      </Modal>
    </>
  );
};

