import React, { useState } from 'react';
import { LayoutDashboard, Building2, Users, MoreHorizontal, Plus, Receipt, Send, PlusCircle } from 'lucide-react';
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
            ['leases', 'rent', 'reminders', 'brokerage', 'tickets', 'reports', 'settings'].includes(
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
        subtitle="All modules and settings"
      >
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Button
            variant="secondary"
            className="justify-start h-auto py-3 px-3 text-left"
            onClick={() => {
              onSelectTab('leases');
              setShowMoreMenu(false);
            }}
          >
            {t.navLeases}
          </Button>
          <Button
            variant="secondary"
            className="justify-start h-auto py-3 px-3 text-left"
            onClick={() => {
              onSelectTab('rent');
              setShowMoreMenu(false);
            }}
          >
            {t.navRent}
          </Button>
          <Button
            variant="secondary"
            className="justify-start h-auto py-3 px-3 text-left"
            onClick={() => {
              onSelectTab('reminders');
              setShowMoreMenu(false);
            }}
          >
            {t.navReminders}
          </Button>
          <Button
            variant="secondary"
            className="justify-start h-auto py-3 px-3 text-left"
            onClick={() => {
              onSelectTab('brokerage');
              setShowMoreMenu(false);
            }}
          >
            {t.navBrokerage}
          </Button>
          <Button
            variant="secondary"
            className="justify-start h-auto py-3 px-3 text-left"
            onClick={() => {
              onSelectTab('tickets');
              setShowMoreMenu(false);
            }}
          >
            {t.navTickets}
          </Button>
          <Button
            variant="secondary"
            className="justify-start h-auto py-3 px-3 text-left"
            onClick={() => {
              onSelectTab('reports');
              setShowMoreMenu(false);
            }}
          >
            {t.navReports}
          </Button>
          <Button
            variant="secondary"
            className="justify-start h-auto py-3 px-3 text-left"
            onClick={() => {
              onSelectTab('onboarding');
              setShowMoreMenu(false);
            }}
          >
            {t.navOnboarding}
          </Button>
          <Button
            variant="secondary"
            className="justify-start h-auto py-3 px-3 text-left"
            onClick={() => {
              onSelectTab('settings');
              setShowMoreMenu(false);
            }}
          >
            {t.navSettings}
          </Button>
        </div>
      </Modal>
    </>
  );
};

