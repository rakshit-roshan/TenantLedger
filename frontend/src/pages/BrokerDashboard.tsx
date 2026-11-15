import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatTileStrip, StatTileItem } from '../components/ui/StatTileStrip';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { formatRupees, formatKolkataDate } from '../utils/formatters';
import { Briefcase, Calendar, DollarSign, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { MoneyInput } from '../components/ui/MoneyInput';

export const BrokerDashboard: React.FC = () => {
  const { brokerDeals, currentOrg, currentUser, showToast } = useApp();
  const [showAddDealModal, setShowAddDealModal] = useState(false);

  // Broker metrics
  const totalCommissionPaise = brokerDeals.reduce((acc, d) => acc + d.commissionPaise, 0);
  const receivedPaise = brokerDeals.reduce((acc, d) => acc + d.receivedPaise, 0);
  const pendingPaise = totalCommissionPaise - receivedPaise;

  // Upcoming renewals in 30, 60, 90 days
  const renewals30Days = brokerDeals.filter((d) => {
    const diff = Math.ceil((new Date(d.leaseRenewalDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    return diff > 0 && diff <= 30;
  });

  const renewals60Days = brokerDeals.filter((d) => {
    const diff = Math.ceil((new Date(d.leaseRenewalDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    return diff > 30 && diff <= 60;
  });

  const renewals90Days = brokerDeals.filter((d) => {
    const diff = Math.ceil((new Date(d.leaseRenewalDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    return diff > 60 && diff <= 90;
  });

  const statTiles: StatTileItem[] = [
    {
      label: 'Commission Received (FY 26-27)',
      value: formatRupees(receivedPaise),
      subValue: 'Settled to broker account',
      accent: 'paid',
    },
    {
      label: 'Brokerage Pending',
      value: formatRupees(pendingPaise),
      subValue: 'Awaiting invoice clearance',
      accent: 'due',
    },
    {
      label: 'Renewals in 30 Days',
      value: renewals30Days.length,
      subValue: 'High-priority brokerage renewal triggers',
      accent: renewals30Days.length > 0 ? 'overdue' : 'normal',
    },
    {
      label: 'Renewals in 60-90 Days',
      value: renewals60Days.length + renewals90Days.length,
      subValue: 'Upcoming deal pipeline',
      accent: 'normal',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Broker Pipeline & Renewal Radar
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Track deals logged against owner grants, scheduled brokerage events, and annual renewals.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Briefcase size={16} />}
          onClick={() => setShowAddDealModal(true)}
        >
          Log New Broker Deal
        </Button>
      </div>

      {/* Tiles */}
      <StatTileStrip tiles={statTiles} />

      {/* Upcoming Renewals Radar */}
      <div className="ledger-card">
        <h3 className="ledger-card-title">Renewal Pipeline & Commission Ledger</h3>
        <p className="text-xs text-muted-text -mt-2 mb-4">
          Brokerage events scheduled at lease expiration date (reminders triggered automatically at 60 & 30 days)
        </p>

        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Owner Org & Building</th>
                <th>Unit</th>
                <th>Tenant</th>
                <th>Deal Type</th>
                <th>Lease Renewal Date</th>
                <th>Commission</th>
                <th>Received</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {brokerDeals.map((deal) => {
                const diffDays = Math.ceil(
                  (new Date(deal.leaseRenewalDate).getTime() - Date.now()) / (1000 * 3600 * 24)
                );
                return (
                  <tr key={deal.id}>
                    <td>
                      <span className="font-bold text-ink block">{deal.ownerOrgName}</span>
                      <span className="text-xs text-muted-text">{deal.buildingName}</span>
                    </td>
                    <td className="font-semibold">{deal.unitNumber}</td>
                    <td>{deal.tenantName}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded bg-ground text-xs font-semibold">
                        {deal.dealType.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="block font-medium">
                        {formatKolkataDate(deal.leaseRenewalDate)}
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          diffDays <= 30
                            ? 'text-overdue'
                            : diffDays <= 60
                            ? 'text-due'
                            : 'text-muted-text'
                        }`}
                      >
                        {diffDays > 0 ? `${diffDays} days away` : 'Renewed'}
                      </span>
                    </td>
                    <td className="font-serif font-semibold tnum">
                      {formatRupees(deal.commissionPaise)}
                    </td>
                    <td className="font-serif font-bold text-paid tnum">
                      {formatRupees(deal.receivedPaise)}
                    </td>
                    <td>
                      <StatusPill status={deal.status} />
                    </td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          showToast(
                            `Renewal reminder dispatched to ${deal.ownerOrgName} for Unit ${deal.unitNumber}`,
                            'success'
                          )
                        }
                      >
                        Notify Owner
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Deal Modal */}
      <Modal
        isOpen={showAddDealModal}
        onClose={() => setShowAddDealModal(false)}
        title="Log Brokerage Deal"
        subtitle="Associate a lease with broker commission terms"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Client Tenant Name
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Chandra"
              className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Unit Number
              </label>
              <input
                type="text"
                placeholder="e.g. 302"
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Deal Type
              </label>
              <select className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta">
                <option value="NEW_RENT">New Rental (1 Month Rent)</option>
                <option value="RENEWAL">Renewal (15 Days Rent)</option>
                <option value="SALE">Outright Sale (1-2%)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Commission Amount
            </label>
            <input
              type="text"
              placeholder="₹25,000"
              className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-line">
            <Button variant="secondary" onClick={() => setShowAddDealModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                showToast('Broker deal recorded into pipeline!', 'success');
                setShowAddDealModal(false);
              }}
            >
              Save Deal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
