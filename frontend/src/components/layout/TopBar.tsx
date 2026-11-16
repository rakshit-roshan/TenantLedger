import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  Search,
  Bell,
  CheckCircle,
  User,
  LogOut,
  ChevronDown,
  Settings,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { formatKolkataDate } from '../../utils/formatters';
import { NavItemKey } from './Sidebar';

interface TopBarProps {
  onSearch?: (term: string) => void;
  onOpenAddTenantWizard?: () => void;
  onOpenAuthModal?: () => void;
  onNavigateToTab?: (tab: NavItemKey) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSearch,
  onOpenAddTenantWizard,
  onOpenAuthModal,
  onNavigateToTab,
}) => {
  const {
    t,
    lang,
    setLang,
    buildings,
    selectedBuildingId,
    setSelectedBuildingId,
    currentOrg,
    currentUser,
    currentRole,
    logout,
    notificationLogs,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="h-[70px] bg-surface border-b border-line px-4 sm:px-6 flex items-center justify-between gap-3 select-none">
      {/* Left: Building Selector & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Building Selector */}
        <div className="relative min-w-[160px] sm:min-w-[190px]">
          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            className="w-full h-[40px] pl-8 pr-7 rounded-[10px] border border-line bg-surface text-ink text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-terracotta cursor-pointer truncate"
          >
            <option value="ALL">{t.allBuildings} ({buildings.length})</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <Building2
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
          />
        </div>

        {/* Global Search */}
        <div className="relative flex-1 hidden md:block">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t.searchPlaceholder}
            className="w-full h-[40px] pl-9 pr-4 rounded-[10px] border border-line bg-surface text-xs text-ink placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
          />
        </div>
      </div>

      {/* Right: Language, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <div className="flex items-center rounded-[10px] border border-line bg-ground p-0.5">
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 text-xs font-semibold rounded-[8px] transition-colors ${
              lang === 'en' ? 'bg-surface text-ink shadow-xs' : 'text-muted-text hover:text-ink'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-2 py-1 text-xs font-semibold rounded-[8px] transition-colors ${
              lang === 'hi' ? 'bg-surface text-ink shadow-xs' : 'text-muted-text hover:text-ink'
            }`}
          >
            हि
          </button>
          <button
            onClick={() => setLang('mr')}
            className={`px-2 py-1 text-xs font-semibold rounded-[8px] transition-colors ${
              lang === 'mr' ? 'bg-surface text-ink shadow-xs' : 'text-muted-text hover:text-ink'
            }`}
          >
            म
          </button>
        </div>

        {/* Notifications */}
        <button
          onClick={() => setShowNotificationsModal(true)}
          className="relative h-[38px] w-[38px] rounded-[10px] border border-line bg-surface hover:bg-ground flex items-center justify-center text-ink transition-colors"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-overdue ring-2 ring-surface" />
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-[10px] border border-line bg-surface hover:bg-ground transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-terracotta/15 text-terracotta font-serif font-bold text-xs flex items-center justify-center border border-terracotta/30">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-ink leading-none truncate max-w-[110px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-muted-text capitalize mt-0.5">
                {currentRole.replace('_', ' ').toLowerCase()}
              </div>
            </div>
            <ChevronDown size={14} className="text-muted-text hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border border-line rounded-[14px] shadow-float py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-line">
                <div className="font-bold text-sm text-ink">{currentUser.name}</div>
                <div className="text-xs text-muted-text truncate">{currentUser.email}</div>
                <div className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ground text-terracotta border border-line">
                  {currentRole.replace('_', ' ')}
                </div>
              </div>

              {/* Organisation info */}
              <div className="px-4 py-2.5 border-b border-line bg-ground/50">
                <div className="text-[10px] font-bold uppercase text-muted-text tracking-wider mb-1">
                  Active Organization
                </div>
                <div className="text-xs font-bold text-ink truncate">
                  {currentOrg.name}
                </div>
                {currentOrg.pan && (
                  <div className="text-[10px] text-muted-text font-mono mt-0.5">
                    PAN: {currentOrg.pan} {currentOrg.code ? `• ${currentOrg.code}` : ''}
                  </div>
                )}
              </div>

              {/* Navigation links to Settings & Audit */}
              {onNavigateToTab && (
                <div className="px-2 py-1.5 border-b border-line space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigateToTab('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs text-ink hover:bg-ground font-medium transition-colors text-left"
                  >
                    <Settings size={14} className="text-terracotta" />
                    <span>{t.navSettings}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigateToTab('audit');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs text-ink hover:bg-ground font-medium transition-colors text-left"
                  >
                    <History size={14} className="text-terracotta" />
                    <span>{t.navAudit}</span>
                  </button>
                </div>
              )}

              {/* Sign out */}
              <div className="px-2 pt-2">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    if (onOpenAuthModal) onOpenAuthModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs text-overdue hover:bg-overdue/10 font-bold transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Modal */}
      <Modal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title="Automated Reminder & Job Activity"
        subtitle="Live delivery status across WhatsApp, SMS and Voice"
      >
        <div className="space-y-3">
          {notificationLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-ground rounded-[12px] border border-line flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-surface border border-line text-paid mt-0.5">
                <CheckCircle size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink">{log.recipientName}</span>
                  <span className="text-muted-text">{formatKolkataDate(log.sentAt, true)}</span>
                </div>
                <div className="text-xs text-muted-text mt-0.5">
                  via {log.channel} • {log.recipientPhoneOrEmail}
                </div>
                <p className="text-xs text-ink mt-1 bg-surface p-2 rounded border border-line font-mono">
                  {log.messagePreview}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </header>
  );
};
