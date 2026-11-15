import React from 'react';
import { useApp } from '../context/AppContext';
import { StatTileStrip, StatTileItem } from '../components/ui/StatTileStrip';
import { BuildingUnitGrid } from '../components/ui/BuildingUnitGrid';
import { BilledVsCollectedChart } from '../components/ui/BilledVsCollectedChart';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { formatRupees, formatKolkataDate } from '../utils/formatters';
import { Unit } from '../types';
import {
  Send,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  CreditCard,
  PlusCircle,
  TrendingUp,
  UserPlus,
} from 'lucide-react';

interface OwnerDashboardProps {
  onRecordPaymentClick: (unit?: Unit) => void;
  onSendReminderClick: (unit?: Unit) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenAddUnit: () => void;
  onOpenAddTenant?: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  onRecordPaymentClick,
  onSendReminderClick,
  onNavigateToTab,
  onOpenAddUnit,
  onOpenAddTenant,
}) => {
  const {
    t,
    units,
    leases,
    receipts,
    tickets,
    notificationLogs,
    currentOrg,
    sendReminderNow,
  } = useApp();

  // Metrics calculations
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status !== 'VACANT');
  const vacantUnits = units.filter((u) => u.status === 'VACANT');
  const occupancyRate = totalUnits > 0 ? ((occupiedUnits.length / totalUnits) * 100).toFixed(1) : '0';

  // Total Billed for current month (Rent + Maintenance for all occupied units)
  const monthlyBilledPaise = occupiedUnits.reduce(
    (acc, u) => acc + (u.baseRentPaise + u.maintenancePaise),
    0
  );

  // Total Collected in current month receipts
  const monthlyCollectedPaise = receipts
    .filter((r) => r.status === 'COMPLETED')
    .reduce((acc, r) => acc + r.amountPaise, 0);

  // Still to collect (Overdue + Due)
  const overdueUnits = units.filter((u) => u.paymentStatus === 'OVERDUE');
  const dueSoonUnits = units.filter((u) => u.paymentStatus === 'DUE');

  const totalOverduePaise = overdueUnits.reduce(
    (acc, u) => acc + (u.amountDuePaise || u.baseRentPaise + u.maintenancePaise),
    0
  );
  const totalDueSoonPaise = dueSoonUnits.reduce(
    (acc, u) => acc + (u.amountDuePaise || u.baseRentPaise + u.maintenancePaise),
    0
  );

  const stillToCollectPaise = totalOverduePaise + totalDueSoonPaise;

  // Vacancy Loss per month
  const vacancyLossPaise = vacantUnits.reduce(
    (acc, u) => acc + (u.baseRentPaise + u.maintenancePaise),
    0
  );

  // Total Deposits Held
  const totalDepositsPaise = occupiedUnits.reduce(
    (acc, u) => acc + u.depositPaise,
    0
  );

  // Top Tile Strip items matching Prompt 5 & 6
  const statTiles: StatTileItem[] = [
    {
      label: t.tileCollectedVsBilled,
      value: `${formatRupees(monthlyCollectedPaise)}`,
      subValue: `Billed: ${formatRupees(monthlyBilledPaise)} (${monthlyBilledPaise > 0 ? Math.round((monthlyCollectedPaise / monthlyBilledPaise) * 100) : 0}%)`,
      accent: 'paid',
      onClick: () => onNavigateToTab('rent'),
    },
    {
      label: t.tileStillToCollect,
      value: formatRupees(stillToCollectPaise),
      subValue: `Overdue: ${formatRupees(totalOverduePaise)} • Due: ${formatRupees(totalDueSoonPaise)}`,
      accent: overdueUnits.length > 0 ? 'overdue' : 'normal',
      onClick: () => onNavigateToTab('rent'),
    },
    {
      label: t.tileOccupancy,
      value: `${occupancyRate}%`,
      subValue: `${occupiedUnits.length}/${totalUnits} occupied • Loss: ${formatRupees(vacancyLossPaise)}/mo`,
      accent: 'normal',
      onClick: () => onNavigateToTab('buildings'),
    },
    {
      label: t.tileDepositsHeld,
      value: formatRupees(totalDepositsPaise),
      subValue: `Across ${occupiedUnits.length} active lease covenants`,
      accent: 'normal',
      onClick: () => onNavigateToTab('leases'),
    },
  ];

  // Agreements ending soon (Within next 90 days)
  const expiringLeases = leases.filter((l) => {
    const end = new Date(l.endDate).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90;
  });

  const handleBulkRemindOverdue = () => {
    overdueUnits.forEach((u) => {
      sendReminderNow(u.id, 'WHATSAPP');
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Owner Command Center
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Real-time financial rent ledger and floor-by-floor occupancy for{' '}
            <span className="font-semibold text-ink">{currentOrg.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {onOpenAddTenant && (
            <Button
              variant="primary"
              icon={<UserPlus size={16} />}
              onClick={onOpenAddTenant}
            >
              + Onboard Tenant
            </Button>
          )}
          <Button
            variant="secondary"
            icon={<PlusCircle size={16} />}
            onClick={onOpenAddUnit}
          >
            {t.addNewUnit}
          </Button>
          <Button
            variant="secondary"
            icon={<CreditCard size={16} />}
            onClick={() => onRecordPaymentClick()}
          >
            {t.recordPayment}
          </Button>
        </div>
      </div>

      {/* Top Stat Tile Strip */}
      <StatTileStrip tiles={statTiles} />

      {/* Today's Action Center */}
      <div className="ledger-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="ledger-card-title !mb-0">Today&apos;s Immediate Actions</h3>
          </div>
          <span className="text-xs text-muted-text font-medium">Automated triggers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Overdue Action */}
          <div className="p-4 rounded-[12px] bg-ground border border-line flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-overdue tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={14} /> {overdueUnits.length} Overdue Units
                </span>
                <span className="font-serif font-bold text-ink tnum">
                  {formatRupees(totalOverduePaise)}
                </span>
              </div>
              <p className="text-xs text-muted-text">
                Tenants past grace days requiring WhatsApp & SMS escalation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-line flex gap-2">
              <Button
                size="sm"
                variant="primary"
                icon={<Send size={13} />}
                onClick={handleBulkRemindOverdue}
                disabled={overdueUnits.length === 0}
              >
                Bulk Remind All ({overdueUnits.length})
              </Button>
            </div>
          </div>

          {/* Expiring Leases Action */}
          <div className="p-4 rounded-[12px] bg-ground border border-line flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-due tracking-wider flex items-center gap-1.5">
                  <Clock size={14} /> {expiringLeases.length} Leases Expiring
                </span>
                <span className="text-xs font-semibold text-muted-text">&lt; 90 Days</span>
              </div>
              <p className="text-xs text-muted-text">
                Annual renewal agreements with 7-10% standard escalation clause.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-line flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                icon={<FileText size={13} />}
                onClick={() => onNavigateToTab('leases')}
              >
                Review Renewals
              </Button>
            </div>
          </div>

          {/* Open Maintenance Tickets */}
          <div className="p-4 rounded-[12px] bg-ground border border-line flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-terracotta tracking-wider flex items-center gap-1.5">
                  <CheckCircle size={14} /> {tickets.filter((t) => t.status !== 'RESOLVED').length} Active Tickets
                </span>
                <span className="text-xs font-semibold text-muted-text">
                  {tickets.filter((t) => t.status !== 'RESOLVED').length > 0 ? 'SLA Tracked' : 'Zero Defect'}
                </span>
              </div>
              <p className="text-xs text-muted-text">
                {tickets.filter((t) => t.status !== 'RESOLVED').length > 0
                  ? 'Active plumbing, electrical, and facility work orders under SLA.'
                  : 'All units and common premises operating normally with zero open repairs.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-line flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onNavigateToTab('tickets')}
              >
                Manage Tickets
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floor-by-Floor Building Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-2xl text-ink">Floor-by-Floor Live Units</h3>
          <div className="flex items-center gap-2 text-xs text-muted-text">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-paid"></span> Paid</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-due"></span> Due</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-overdue"></span> Overdue</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-notice"></span> Notice</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#B9A78A]"></span> Vacant</span>
          </div>
        </div>
        <BuildingUnitGrid
          units={units}
          onRecordPaymentClick={onRecordPaymentClick}
          onSendReminderClick={onSendReminderClick}
          onAssignTenantClick={onOpenAddTenant}
        />
      </div>

      {/* Overdue Rent Aging Buckets Table */}
      <div className="ledger-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="ledger-card-title !mb-0">Overdue Rent Aging Buckets</h3>
            <p className="text-xs text-muted-text mt-1">
              Categorized by overdue tenure (1-15 days, 16-30 days, 30+ days default)
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<Send size={13} />}
            onClick={handleBulkRemindOverdue}
            disabled={overdueUnits.length === 0}
          >
            Remind All Overdue
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Unit & Building</th>
                <th>Tenant Name</th>
                <th>Contact</th>
                <th>Overdue Days</th>
                <th>Due Amount</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {overdueUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-muted-text">
                    No overdue payments! All occupied units are settled or current.
                  </td>
                </tr>
              ) : (
                overdueUnits.map((unit) => (
                  <tr key={unit.id}>
                    <td className="font-semibold">
                      Unit {unit.unitNumber}
                      <span className="text-xs text-muted-text block font-normal">
                        {unit.buildingName}
                      </span>
                    </td>
                    <td>{unit.currentTenantName}</td>
                    <td className="text-xs">{unit.currentTenantPhone || '-'}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-overdue/10 text-overdue font-bold text-xs">
                        {unit.overdueDays || 14} Days Overdue
                      </span>
                    </td>
                    <td className="font-serif font-bold text-overdue tnum">
                      {formatRupees(unit.amountDuePaise || unit.baseRentPaise + unit.maintenancePaise)}
                    </td>
                    <td>
                      <StatusPill status="OVERDUE" />
                    </td>
                    <td className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onSendReminderClick(unit)}
                      >
                        Remind
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onRecordPaymentClick(unit)}
                      >
                        Pay
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 12-Month Billed vs Collected Trend & Reminder Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 12-Month Chart */}
        <div className="ledger-card lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="ledger-card-title !mb-0">12-Month Collection Trend</h3>
              <p className="text-xs text-muted-text mt-1">
                Billed versus collected revenue comparison (Paise converted to Lakhs)
              </p>
            </div>
            <TrendingUp size={18} className="text-paid" />
          </div>
          <div className="mt-4">
            <BilledVsCollectedChart />
          </div>
        </div>

        {/* Live Reminder Engine Activity */}
        <div className="ledger-card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="ledger-card-title !mb-0">Reminder Activity</h3>
              <p className="text-xs text-muted-text mt-1">Recent automated dispatches</p>
            </div>
            <Clock size={16} className="text-terracotta" />
          </div>

          <div className="space-y-3 mt-4">
            {notificationLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-[10px] bg-ground border border-line text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{log.recipientName}</span>
                  <span className="text-[10px] text-muted-text">
                    {formatKolkataDate(log.sentAt, true)}
                  </span>
                </div>
                <div className="text-muted-text text-[11px] mt-0.5">
                  Channel: <span className="font-semibold text-ink">{log.channel}</span> • Cost:{' '}
                  {log.costPaise}p
                </div>
                <div className="truncate text-ink mt-1 bg-surface p-1.5 rounded border border-line/60">
                  {log.messagePreview}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
