import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatTileStrip, StatTileItem } from '../components/ui/StatTileStrip';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { formatRupees, formatKolkataDate } from '../utils/formatters';
import { exportToExcel, generateReceiptPdf } from '../utils/exportGenerators';
import { FileSpreadsheet, FileDown, RotateCcw, Plus, Receipt } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { MoneyInput } from '../components/ui/MoneyInput';

export const AccountantDashboard: React.FC<{ onRecordPayment: () => void }> = ({
  onRecordPayment,
}) => {
  const { receipts, expenses, currentOrg, reversePayment, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'receipts' | 'expenses' | 'statements'>('receipts');
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string>('');
  const [reversalReason, setReversalReason] = useState<string>('');

  // Financial stats
  const totalCollectionsPaise = receipts
    .filter((r) => r.status === 'COMPLETED')
    .reduce((acc, r) => acc + r.amountPaise, 0);

  const totalReversedPaise = receipts
    .filter((r) => r.status === 'REVERSED')
    .reduce((acc, r) => acc + r.amountPaise, 0);

  const totalExpensesPaise = expenses.reduce((acc, e) => acc + e.amountPaise, 0);
  const netOperatingIncomePaise = totalCollectionsPaise - totalExpensesPaise;

  const statTiles: StatTileItem[] = [
    {
      label: 'Gross Collections (FY 26-27)',
      value: formatRupees(totalCollectionsPaise),
      subValue: `${receipts.filter((r) => r.status === 'COMPLETED').length} verified receipts`,
      accent: 'paid',
    },
    {
      label: 'Operating Expenses',
      value: formatRupees(totalExpensesPaise),
      subValue: 'Lift, security, utility, maintenance',
      accent: 'normal',
    },
    {
      label: 'Net Operating Income',
      value: formatRupees(netOperatingIncomePaise),
      subValue: 'Collections minus building OPEX',
      accent: netOperatingIncomePaise >= 0 ? 'paid' : 'overdue',
    },
    {
      label: 'Reversals Logged',
      value: formatRupees(totalReversedPaise),
      subValue: `${receipts.filter((r) => r.status === 'REVERSED').length} entries reversed with audit`,
      accent: 'overdue',
    },
  ];

  const handleExportReceiptsExcel = () => {
    const headers = ['Receipt #', 'Date (IST)', 'Tenant', 'Unit', 'Amount (₹)', 'Payment Method', 'Ref / UTR', 'Status', 'Recorded By'];
    const rows = receipts.map((r) => [
      r.receiptNumber,
      formatKolkataDate(r.paymentDate, true),
      r.tenantName,
      r.unitNumber,
      r.amountPaise / 100,
      r.paymentMethod,
      r.referenceNumber || '',
      r.status,
      r.recordedBy,
    ]);
    exportToExcel(`Gharkhata_Ledger_Receipts_${currentOrg.code}`, headers, rows);
    showToast('Exported Ledger Receipts to Excel successfully!', 'success');
  };

  const handleConfirmReversal = () => {
    if (!selectedReceiptId || !reversalReason.trim()) return;
    reversePayment(selectedReceiptId, reversalReason);
    setShowReversalModal(false);
    setSelectedReceiptId('');
    setReversalReason('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Accountant & Audit Ledger
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Double-entry append-only financial accounting. No financial deletions permitted; audited reversals only.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            icon={<FileSpreadsheet size={16} />}
            onClick={handleExportReceiptsExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="primary"
            icon={<Receipt size={16} />}
            onClick={onRecordPayment}
          >
            Record Payment
          </Button>
        </div>
      </div>

      <StatTileStrip tiles={statTiles} />

      {/* Tabs */}
      <div className="flex border-b border-line gap-4">
        <button
          onClick={() => setActiveTab('receipts')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'receipts'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-muted-text hover:text-ink'
          }`}
        >
          Append-Only Receipt Ledger ({receipts.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'expenses'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-muted-text hover:text-ink'
          }`}
        >
          Building Operating Expenses ({expenses.length})
        </button>
      </div>

      {activeTab === 'receipts' ? (
        <div className="ledger-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="ledger-card-title !mb-0">Official Receipts Journal</h3>
              <p className="text-xs text-muted-text mt-1">
                Sequential numbering per financial year (e.g. GK/2026-27/0412)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Date & Time (IST)</th>
                  <th>Tenant & Unit</th>
                  <th>Payment Mode</th>
                  <th>Reference / UTR</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((rcpt) => (
                  <tr
                    key={rcpt.id}
                    className={rcpt.status === 'REVERSED' ? 'opacity-60 bg-ground/40' : ''}
                  >
                    <td className="font-bold text-ink">{rcpt.receiptNumber}</td>
                    <td className="text-xs text-muted-text">
                      {formatKolkataDate(rcpt.paymentDate, true)}
                    </td>
                    <td>
                      <span className="font-semibold block">{rcpt.tenantName}</span>
                      <span className="text-xs text-muted-text">Unit {rcpt.unitNumber}</span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-ground">
                        {rcpt.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-xs font-mono">{rcpt.referenceNumber || '-'}</td>
                    <td
                      className={`font-serif font-bold tnum ${
                        rcpt.status === 'REVERSED' ? 'line-through text-muted-text' : 'text-paid'
                      }`}
                    >
                      {formatRupees(rcpt.amountPaise)}
                    </td>
                    <td>
                      <StatusPill status={rcpt.status} />
                    </td>
                    <td className="text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => generateReceiptPdf(rcpt, currentOrg)}
                      >
                        PDF
                      </Button>
                      {rcpt.status !== 'REVERSED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-overdue hover:bg-overdue/10"
                          onClick={() => {
                            setSelectedReceiptId(rcpt.id);
                            setShowReversalModal(true);
                          }}
                        >
                          <RotateCcw size={13} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="ledger-card">
          <h3 className="ledger-card-title">Building Operating Expenses (OPEX)</h3>
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Building</th>
                  <th>Expense Category</th>
                  <th>Vendor / Payee</th>
                  <th>Payment Mode</th>
                  <th>Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{formatKolkataDate(exp.date)}</td>
                    <td className="font-semibold">{exp.buildingName}</td>
                    <td>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-ground">
                        {exp.category}
                      </span>
                    </td>
                    <td>{exp.vendorName}</td>
                    <td className="text-xs">{exp.paymentMethod}</td>
                    <td className="font-serif font-bold text-ink tnum">
                      {formatRupees(exp.amountPaise)}
                    </td>
                    <td className="text-xs text-muted-text">{exp.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reversal Confirmation Modal */}
      <Modal
        isOpen={showReversalModal}
        onClose={() => setShowReversalModal(false)}
        title="Reverse Payment Receipt"
        subtitle="Permanent accounting reversal with mandatory reason"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-overdue/10 border border-overdue/20 rounded-[12px] text-xs text-overdue leading-relaxed">
            <strong>Warning:</strong> In compliance with Indian accounting standards, receipt entries are immutable. Reversing will post an equal opposing credit/debit adjustment to the ledger and log your user identity and IP to the audit trail.
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Reason for Reversal <span className="text-terracotta">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="e.g. Cheque returned unpaid / bounced or duplicate transaction entry."
              className="w-full p-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-line">
            <Button variant="secondary" onClick={() => setShowReversalModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<RotateCcw size={15} />}
              disabled={!reversalReason.trim()}
              onClick={handleConfirmReversal}
            >
              Confirm Reversal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
