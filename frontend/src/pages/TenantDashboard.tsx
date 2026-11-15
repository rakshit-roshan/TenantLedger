import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatTileStrip, StatTileItem } from '../components/ui/StatTileStrip';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { formatRupees, formatKolkataDate } from '../utils/formatters';
import { generateAgreementDraftPdf, generateReceiptPdf } from '../utils/exportGenerators';
import { CreditCard, FileText, Wrench, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const TenantDashboard: React.FC = () => {
  const { currentOrg, leases, units, tenants, receipts, tickets, addTicket, showToast } = useApp();

  // Tenant view: Unit 201 Priya Sharma
  const myUnit = units.find((u) => u.unitNumber === '201') || units[0];
  const myLease = leases.find((l) => l.unitNumber === '201') || leases[0];
  const myTenant = tenants.find((t) => t.id === 'ten-priya') || tenants[0];
  const myReceipts = receipts.filter((r) => r.unitNumber === '201');

  const [showPayModal, setShowPayModal] = useState(false);
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<'PLUMBING' | 'ELECTRICAL' | 'CARPENTRY'>('PLUMBING');
  const [ticketDesc, setTicketDesc] = useState('');

  const rentDuePaise = myUnit?.amountDuePaise || myUnit.baseRentPaise + myUnit.maintenancePaise;

  const statTiles: StatTileItem[] = [
    {
      label: 'Current Amount Due',
      value: formatRupees(rentDuePaise),
      subValue: `Due Day: ${myLease?.dueDay}th of each month`,
      accent: myUnit?.paymentStatus === 'OVERDUE' ? 'overdue' : 'due',
    },
    {
      label: 'Security Deposit Paid',
      value: formatRupees(myLease?.depositPaise),
      subValue: 'Interest-free refundable holding',
      accent: 'normal',
    },
    {
      label: 'Lease Expiry Date',
      value: formatKolkataDate(myLease?.endDate),
      subValue: `Notice period: ${myLease?.noticePeriodDays} days`,
      accent: 'normal',
    },
    {
      label: 'KYC & Police Verification',
      value: myTenant?.policeVerificationStatus || 'VERIFIED',
      subValue: 'Govt. verified resident',
      accent: 'paid',
    },
  ];

  const handleDownloadAgreement = () => {
    if (myLease && myTenant && myUnit) {
      generateAgreementDraftPdf(myLease, myTenant, myUnit, currentOrg);
      showToast('Downloaded official lease agreement draft PDF', 'success');
    }
  };

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDesc.trim()) return;

    addTicket({
      organizationId: currentOrg.id,
      buildingId: myUnit.buildingId,
      buildingName: myUnit.buildingName,
      unitNumber: myUnit.unitNumber,
      tenantName: myTenant.name,
      category: ticketCategory,
      priority: 'MEDIUM',
      slaHours: 48,
      status: 'OPEN',
      description: ticketDesc,
    });
    setShowRaiseTicketModal(false);
    setTicketDesc('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Tenant Resident Portal
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Welcome, <span className="font-semibold text-ink">{myTenant.name}</span> • Unit{' '}
            {myUnit.unitNumber}, {myUnit.buildingName}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            icon={<Wrench size={16} />}
            onClick={() => setShowRaiseTicketModal(true)}
          >
            Raise Maintenance Ticket
          </Button>
          <Button
            variant="primary"
            icon={<CreditCard size={16} />}
            onClick={() => setShowPayModal(true)}
          >
            Pay Rent Online
          </Button>
        </div>
      </div>

      <StatTileStrip tiles={statTiles} />

      {/* Payment Settlement Alert if due */}
      {rentDuePaise > 0 && (
        <div className="p-5 rounded-[16px] bg-[#FAF5E8] border border-[#C98A1B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-[#634306]">
              Rent Settlement Notice: {formatRupees(rentDuePaise)}
            </h4>
            <p className="text-xs text-[#875908] mt-1">
              Includes Base Rent ({formatRupees(myUnit.baseRentPaise)}) + Society Maintenance (
              {formatRupees(myUnit.maintenancePaise)}). Pay via UPI, NetBanking or Debit Card.
            </p>
          </div>
          <Button
            variant="primary"
            icon={<CreditCard size={16} />}
            onClick={() => setShowPayModal(true)}
          >
            Pay {formatRupees(rentDuePaise)}
          </Button>
        </div>
      )}

      {/* Tenancy Agreement & Covenants */}
      <div className="ledger-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="ledger-card-title !mb-0">My Tenancy Agreement</h3>
            <p className="text-xs text-muted-text mt-1">
              Legally binding agreement executed with {currentOrg.name}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleDownloadAgreement}
          >
            Download Draft PDF
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-ground rounded-[12px] border border-line text-xs">
          <div>
            <span className="text-muted-text block">Monthly Rent</span>
            <span className="font-serif text-base font-bold text-ink">
              {formatRupees(myLease.rentPaise)}
            </span>
          </div>
          <div>
            <span className="text-muted-text block">Maintenance</span>
            <span className="font-serif text-base font-bold text-ink">
              {formatRupees(myLease.maintenancePaise)}
            </span>
          </div>
          <div>
            <span className="text-muted-text block">Annual Escalation</span>
            <span className="font-serif text-base font-bold text-ink">
              +{myLease.yearlyIncreasePercent}% / yr
            </span>
          </div>
          <div>
            <span className="text-muted-text block">Late Fee Penalty</span>
            <span className="font-serif text-base font-bold text-ink">
              {myLease.lateFeePercent}% after {myLease.graceDays} days
            </span>
          </div>
        </div>
      </div>

      {/* Payment Receipts History */}
      <div className="ledger-card">
        <h3 className="ledger-card-title">Payment Receipts History</h3>
        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Amount Paid</th>
                <th>Payment Mode</th>
                <th>Reference #</th>
                <th>Status</th>
                <th className="text-right">Receipt PDF</th>
              </tr>
            </thead>
            <tbody>
              {myReceipts.map((rcpt) => (
                <tr key={rcpt.id}>
                  <td className="font-bold">{rcpt.receiptNumber}</td>
                  <td>{formatKolkataDate(rcpt.paymentDate)}</td>
                  <td className="font-serif font-bold text-paid tnum">
                    {formatRupees(rcpt.amountPaise)}
                  </td>
                  <td>{rcpt.paymentMethod}</td>
                  <td className="text-xs font-mono">{rcpt.referenceNumber}</td>
                  <td>
                    <StatusPill status={rcpt.status} />
                  </td>
                  <td className="text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => generateReceiptPdf(rcpt, currentOrg)}
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online UPI Gateway Simulation Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="Pay Rent Online (Razorpay / UPI)"
        subtitle="Zero transaction fee on UPI payments"
      >
        <div className="space-y-5 text-center py-2">
          <div className="p-4 bg-ground rounded-[12px] border border-line">
            <span className="text-xs text-muted-text uppercase font-bold block mb-1">
              Settlement Amount
            </span>
            <span className="font-serif text-3xl font-bold text-ink tnum">
              {formatRupees(rentDuePaise)}
            </span>
            <span className="text-xs text-muted-text block mt-1">
              Unit {myUnit.unitNumber} • {myUnit.buildingName}
            </span>
          </div>

          <div className="p-4 bg-surface rounded-[12px] border border-dashed border-line space-y-2">
            <span className="text-xs font-semibold text-muted-text block">
              Scan UPI QR Code to Pay instantly:
            </span>
            <div className="w-36 h-36 bg-white border border-line rounded-lg mx-auto flex items-center justify-center text-xs font-mono text-muted-text shadow-inner">
              [UPI QR CODE]
            </div>
            <p className="text-xs text-muted-text font-mono">
              VPA: gharkhata.{currentOrg.code.toLowerCase()}@hdfcbank
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowPayModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                showToast('Payment completed via UPI gateway! Receipt generated.', 'success');
                setShowPayModal(false);
              }}
            >
              Simulate Successful Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Raise Ticket Modal */}
      <Modal
        isOpen={showRaiseTicketModal}
        onClose={() => setShowRaiseTicketModal(false)}
        title="Raise Maintenance Ticket"
        subtitle="Notified to property caretaker and owner"
      >
        <form onSubmit={handleRaiseTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Service Category
            </label>
            <select
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value as any)}
              className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
            >
              <option value="PLUMBING">Plumbing Issue (Tap leak, drainage)</option>
              <option value="ELECTRICAL">Electrical Issue (Switch, wiring, meter)</option>
              <option value="CARPENTRY">Carpentry & Lock (Door, window, cabinet)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Description of the Issue
            </label>
            <textarea
              required
              rows={3}
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              placeholder="Please describe the issue in detail..."
              className="w-full p-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-line">
            <Button variant="secondary" type="button" onClick={() => setShowRaiseTicketModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
