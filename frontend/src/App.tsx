import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BottomBar } from './components/layout/BottomBar';
import { ToastContainer } from './components/ui/ToastContainer';

// Authentication page
import { AuthPage } from './pages/AuthPage';

// Dashboards per role
import { OwnerDashboard } from './pages/OwnerDashboard';
import { BrokerDashboard } from './pages/BrokerDashboard';
import { ManagerCaretakerDashboard } from './pages/ManagerCaretakerDashboard';
import { AccountantDashboard } from './pages/AccountantDashboard';
import { TenantDashboard } from './pages/TenantDashboard';
import { VendorDashboard } from './pages/VendorDashboard';
import { PlatformAdminDashboard } from './pages/PlatformAdminDashboard';

// Subpages
import { TenantsKYCPage } from './pages/TenantsKYCPage';
import { LeasesAgreementsPage } from './pages/LeasesAgreementsPage';
import { RemindersPage } from './pages/RemindersPage';
import { ReportsPage } from './pages/ReportsPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogPage } from './pages/AuditLogPage';

// Common Modals
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { SendReminderModal } from './components/modals/SendReminderModal';
import { AddUnitModal } from './components/modals/AddUnitModal';
import { AddTenantWizardModal } from './components/modals/AddTenantWizardModal';
import { Unit } from './types';

export const App: React.FC = () => {
  const { isAuthenticated, currentRole, logUserClick } = useApp();

  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');

  const handleTabChange = (tab: NavItemKey) => {
    setCurrentTab(tab);
    logUserClick('TAB_NAVIGATE', 'Navigation', tab, `User switched view to ${tab}`);
  };

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSelectedUnit, setPaymentSelectedUnit] = useState<Unit | null>(null);

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderSelectedUnit, setReminderSelectedUnit] = useState<Unit | null>(null);

  const [showAddUnitModal, setShowAddUnitModal] = useState(false);

  // Core onboarding modal: Add Tenant & Assign House
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [tenantPreselectedUnitId, setTenantPreselectedUnitId] = useState<string | undefined>(undefined);

  const handleOpenPayment = (unit?: Unit) => {
    setPaymentSelectedUnit(unit || null);
    setShowPaymentModal(true);
    logUserClick('MODAL_OPEN', 'Modal', 'RECORD_PAYMENT', unit ? `Payment modal opened for Unit ${unit.unitNumber}` : 'Payment modal opened');
  };

  const handleOpenReminder = (unit?: Unit) => {
    setReminderSelectedUnit(unit || null);
    setShowReminderModal(true);
    logUserClick('MODAL_OPEN', 'Modal', 'SEND_REMINDER', unit ? `Reminder modal opened for Unit ${unit.unitNumber}` : 'Reminder modal opened');
  };

  const handleOpenAddTenant = (unit?: Unit) => {
    setTenantPreselectedUnitId(unit?.id);
    setShowAddTenantModal(true);
    logUserClick('MODAL_OPEN', 'Modal', 'ADD_TENANT_WIZARD', unit ? `Onboarding wizard opened for Unit ${unit.unitNumber}` : 'Onboarding wizard opened');
  };

  // If user signed out, show authentic login & registration page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Render content according to tab and role
  const renderMainContent = () => {
    if (currentTab === 'onboarding') {
      return <OnboardingWizard onComplete={() => setCurrentTab('dashboard')} />;
    }
    if (currentTab === 'tenants') {
      return <TenantsKYCPage onOpenAddTenant={() => handleOpenAddTenant()} />;
    }
    if (currentTab === 'leases') {
      return <LeasesAgreementsPage />;
    }
    if (currentTab === 'rent') {
      return <AccountantDashboard onRecordPayment={() => handleOpenPayment()} />;
    }
    if (currentTab === 'reminders') {
      return <RemindersPage onOpenSendReminder={() => handleOpenReminder()} />;
    }
    if (currentTab === 'brokerage') {
      return <BrokerDashboard />;
    }
    if (currentTab === 'tickets') {
      return <ManagerCaretakerDashboard onRecordCashPayment={() => handleOpenPayment()} />;
    }
    if (currentTab === 'reports') {
      return <ReportsPage />;
    }
    if (currentTab === 'audit') {
      return <AuditLogPage />;
    }
    if (currentTab === 'settings') {
      return <SettingsPage />;
    }

    // Role-specific view
    switch (currentRole) {
      case 'BROKER':
      case 'BROKER_STAFF':
        return <BrokerDashboard />;
      case 'PROPERTY_MANAGER':
      case 'CARETAKER':
        return <ManagerCaretakerDashboard onRecordCashPayment={() => handleOpenPayment()} />;
      case 'ACCOUNTANT':
        return <AccountantDashboard onRecordPayment={() => handleOpenPayment()} />;
      case 'TENANT':
        return <TenantDashboard />;
      case 'VENDOR':
        return <VendorDashboard />;
      case 'PLATFORM_ADMIN':
        return <PlatformAdminDashboard />;
      case 'OWNER':
      case 'CO_OWNER':
      default:
        return (
          <OwnerDashboard
            onRecordPaymentClick={handleOpenPayment}
            onSendReminderClick={handleOpenReminder}
            onNavigateToTab={handleTabChange}
            onOpenAddUnit={() => setShowAddUnitModal(true)}
            onOpenAddTenant={() => handleOpenAddTenant()}
          />
        );
    }
  };

  return (
    <div className="h-screen flex bg-ground text-ink selection:bg-terracotta selection:text-white overflow-hidden">
      {/* 248px Fixed Dark Sidebar on Desktop: h-screen, fixed, non-shrinking */}
      <div className="hidden md:block h-screen flex-shrink-0 z-30">
        <Sidebar currentTab={currentTab} onSelectTab={handleTabChange} />
      </div>

      {/* Main Body: Only center content scrolls! */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <TopBar onNavigateToTab={handleTabChange} />

        {/* Scrollable Center Content Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 pb-28 md:pb-12">
          <div className="max-w-7xl mx-auto">{renderMainContent()}</div>
        </main>

        {/* Mobile Bottom Bar for viewport < 768px (Phone App View) */}
        <div className="md:hidden flex-shrink-0">
          <BottomBar
            currentTab={currentTab}
            onSelectTab={handleTabChange}
            onQuickRecordPayment={() => handleOpenPayment()}
            onQuickAddUnit={() => handleOpenAddTenant()}
          />
        </div>
      </div>

      <ToastContainer />

      {/* Core Onboarding Modal: Add Tenant & Assign House */}
      <AddTenantWizardModal
        isOpen={showAddTenantModal}
        onClose={() => setShowAddTenantModal(false)}
        preselectedUnitId={tenantPreselectedUnitId}
      />

      {/* Payment Settlement Modal */}
      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        preselectedUnit={paymentSelectedUnit}
      />

      {/* Reminder Dispatch Modal */}
      <SendReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        targetUnit={reminderSelectedUnit}
      />

      {/* Add Unit / Bulk Floor Setup Modal */}
      <AddUnitModal
        isOpen={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
      />
    </div>
  );
};
