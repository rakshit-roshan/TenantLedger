import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lease } from '../types';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { formatRupees, formatKolkataDate } from '../utils/formatters';
import { generateAgreementDraftPdf } from '../utils/exportGenerators';
import { FileText, RefreshCw, LogOut, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const LeasesAgreementsPage: React.FC = () => {
  const { leases, units, tenants, currentOrg, showToast } = useApp();

  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showMoveOutModal, setShowMoveOutModal] = useState(false);

  // Renewal form
  const [renewalIncreasePercent, setRenewalIncreasePercent] = useState<number>(8);

  // Move-out settlement state
  const [checklist, setChecklist] = useState({
    keysReturned: true,
    deepCleaningDone: true,
    repairsDeduction: 500000, // ₹5,000 in paise
    unpaidBillsDeduction: 0,
  });

  const handleGeneratePdf = (lease: Lease) => {
    const tenant = tenants.find((t) => t.id === lease.tenantId) || tenants[0];
    const unit = units.find((u) => u.id === lease.unitId) || units[0];
    generateAgreementDraftPdf(lease, tenant, unit, currentOrg);
    showToast(`Draft agreement PDF generated for Unit ${lease.unitNumber}`, 'success');
  };

  const handleExecuteRenewal = () => {
    if (!selectedLease) return;
    const newRent = Math.round(selectedLease.rentPaise * (1 + renewalIncreasePercent / 100));
    showToast(
      `Lease renewed for 12 months with ${renewalIncreasePercent}% increase! New Rent: ${formatRupees(newRent)}`,
      'success'
    );
    setShowRenewalModal(false);
  };

  const handleExecuteMoveOut = () => {
    if (!selectedLease) return;
    const refundPaise = selectedLease.depositPaise - checklist.repairsDeduction - checklist.unpaidBillsDeduction;
    showToast(
      `Move-out settlement executed. Refund of ${formatRupees(refundPaise)} processed to tenant.`,
      'success'
    );
    setShowMoveOutModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Leases & Tenancy Agreements
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Automated expiry radar (90, 60, 30 days), 1-click renewal with escalation, and move-out settlement.
          </p>
        </div>
      </div>

      <div className="ledger-card">
        <h3 className="ledger-card-title">Active Lease Covenants & Expiry Radar</h3>
        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Tenant Name</th>
                <th>Start Date</th>
                <th>End Date (Expiry)</th>
                <th>Monthly Rent</th>
                <th>Security Deposit</th>
                <th>Annual Escalation</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leases.map((lease) => {
                const diffDays = Math.ceil(
                  (new Date(lease.endDate).getTime() - Date.now()) / (1000 * 3600 * 24)
                );

                return (
                  <tr key={lease.id}>
                    <td className="font-bold text-ink">Unit {lease.unitNumber}</td>
                    <td>{lease.tenantName}</td>
                    <td className="text-xs text-muted-text">{formatKolkataDate(lease.startDate)}</td>
                    <td>
                      <span className="font-medium block">{formatKolkataDate(lease.endDate)}</span>
                      <span
                        className={`text-[11px] font-bold ${
                          diffDays <= 30
                            ? 'text-overdue'
                            : diffDays <= 90
                            ? 'text-due'
                            : 'text-paid'
                        }`}
                      >
                        {diffDays > 0 ? `${diffDays} days remaining` : 'Expired'}
                      </span>
                    </td>
                    <td className="font-serif font-bold text-ink tnum">
                      {formatRupees(lease.rentPaise)}
                    </td>
                    <td className="font-serif font-semibold text-muted-text tnum">
                      {formatRupees(lease.depositPaise)}
                    </td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-ground">
                        +{lease.yearlyIncreasePercent}% / yr
                      </span>
                    </td>
                    <td>
                      <StatusPill status={lease.status} />
                    </td>
                    <td className="text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Download size={13} />}
                        onClick={() => handleGeneratePdf(lease)}
                      >
                        Draft PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<RefreshCw size={13} />}
                        onClick={() => {
                          setSelectedLease(lease);
                          setRenewalIncreasePercent(lease.yearlyIncreasePercent);
                          setShowRenewalModal(true);
                        }}
                      >
                        Renew
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-overdue hover:bg-overdue/10"
                        icon={<LogOut size={13} />}
                        onClick={() => {
                          setSelectedLease(lease);
                          setShowMoveOutModal(true);
                        }}
                      >
                        Move-Out
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal Modal */}
      <Modal
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        title={`Renew Lease - Unit ${selectedLease?.unitNumber}`}
        subtitle={`Tenant: ${selectedLease?.tenantName}`}
      >
        {selectedLease && (
          <div className="space-y-4">
            <div className="p-4 bg-ground rounded-[12px] border border-line text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-text">Current Monthly Rent:</span>
                <span className="font-bold font-serif text-ink">{formatRupees(selectedLease.rentPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Standard Escalation Clause:</span>
                <span className="font-bold text-ink">{selectedLease.yearlyIncreasePercent}%</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2">
                <span className="text-muted-text font-bold">New Proposed Monthly Rent:</span>
                <span className="font-serif font-bold text-paid text-sm">
                  {formatRupees(
                    Math.round(selectedLease.rentPaise * (1 + renewalIncreasePercent / 100))
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Annual Rent Escalation Percentage (%)
              </label>
              <input
                type="number"
                value={renewalIncreasePercent}
                onChange={(e) => setRenewalIncreasePercent(parseFloat(e.target.value) || 0)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-line">
              <Button variant="secondary" onClick={() => setShowRenewalModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" icon={<RefreshCw size={15} />} onClick={handleExecuteRenewal}>
                Execute 1-Click Renewal
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Move Out Checklist Modal */}
      <Modal
        isOpen={showMoveOutModal}
        onClose={() => setShowMoveOutModal(false)}
        title={`Move-out Checklist & Deposit Settlement`}
        subtitle={`Unit ${selectedLease?.unitNumber} • ${selectedLease?.tenantName}`}
      >
        {selectedLease && (
          <div className="space-y-4">
            <div className="space-y-2.5 p-4 bg-ground rounded-[12px] border border-line text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.keysReturned}
                  onChange={(e) => setChecklist({ ...checklist, keysReturned: e.target.checked })}
                  className="rounded text-terracotta focus:ring-terracotta"
                />
                <span>All physical unit keys & RFID access tags returned</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.deepCleaningDone}
                  onChange={(e) => setChecklist({ ...checklist, deepCleaningDone: e.target.checked })}
                  className="rounded text-terracotta focus:ring-terracotta"
                />
                <span>Premises handed over clean; fixtures verified undamaged</span>
              </label>
            </div>

            <div className="p-4 bg-surface rounded-[12px] border border-line space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-text">Security Deposit Paid:</span>
                <span className="font-serif font-bold text-ink">{formatRupees(selectedLease.depositPaise)}</span>
              </div>
              <div className="flex justify-between text-overdue">
                <span>Deduction for Repairs/Painting:</span>
                <span className="font-serif font-semibold">-{formatRupees(checklist.repairsDeduction)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-sm">
                <span className="font-bold text-ink">Net Refund Amount to Tenant:</span>
                <span className="font-serif font-bold text-paid">
                  {formatRupees(selectedLease.depositPaise - checklist.repairsDeduction)}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-line">
              <Button variant="secondary" onClick={() => setShowMoveOutModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleExecuteMoveOut}>
                Settle & Mark Unit Vacant
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
