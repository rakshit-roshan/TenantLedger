import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MoneyInput } from '../ui/MoneyInput';
import { Unit, PaymentMethod } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupees, formatKolkataDate } from '../../utils/formatters';
import { generateReceiptPdf } from '../../utils/exportGenerators';
import { CreditCard, Download, Check } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUnit?: Unit | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedUnit,
}) => {
  const { units, currentOrg, currentUser, currentRole, recordPayment, t } = useApp();

  const occupiedUnits = units.filter((u) => u.currentTenantName);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(preselectedUnit?.id || '');
  const [amountPaise, setAmountPaise] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('Rent & maintenance settlement.');
  const [lastGeneratedReceipt, setLastGeneratedReceipt] = useState<any | null>(null);

  useEffect(() => {
    if (preselectedUnit) {
      setSelectedUnitId(preselectedUnit.id);
      const defaultAmount =
        preselectedUnit.amountDuePaise ||
        preselectedUnit.baseRentPaise + preselectedUnit.maintenancePaise;
      setAmountPaise(defaultAmount);
    } else if (occupiedUnits.length > 0 && !selectedUnitId) {
      setSelectedUnitId(occupiedUnits[0].id);
      const defaultAmount =
        occupiedUnits[0].amountDuePaise ||
        occupiedUnits[0].baseRentPaise + occupiedUnits[0].maintenancePaise;
      setAmountPaise(defaultAmount);
    }
  }, [preselectedUnit, isOpen]);

  const activeUnit = units.find((u) => u.id === selectedUnitId);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uId = e.target.value;
    setSelectedUnitId(uId);
    const u = units.find((item) => item.id === uId);
    if (u) {
      const defaultAmount =
        u.amountDuePaise || u.baseRentPaise + u.maintenancePaise;
      setAmountPaise(defaultAmount);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUnit || amountPaise <= 0) return;

    const receiptPayload = {
      organizationId: currentOrg.id,
      leaseId: activeUnit.currentLeaseId || 'lease-active',
      tenantName: activeUnit.currentTenantName || 'Tenant',
      unitNumber: activeUnit.unitNumber,
      buildingName: activeUnit.buildingName,
      amountPaise,
      paymentMethod,
      referenceNumber: referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date(paymentDate).toISOString(),
      status: 'COMPLETED' as const,
      recordedBy: `${currentUser.name} (${currentRole})`,
      notes,
    };

    recordPayment(receiptPayload);
    setLastGeneratedReceipt({
      ...receiptPayload,
      receiptNumber: `GK/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  const handleDownloadPdf = () => {
    if (lastGeneratedReceipt) {
      generateReceiptPdf(lastGeneratedReceipt, currentOrg);
    }
  };

  const handleResetAndClose = () => {
    setLastGeneratedReceipt(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={lastGeneratedReceipt ? 'Payment Receipt Issued' : t.recordPayment}
      subtitle={
        lastGeneratedReceipt
          ? 'Transaction recorded in append-only ledger'
          : 'Allocate collection against tenant lease charges'
      }
    >
      {lastGeneratedReceipt ? (
        <div className="text-center py-4 space-y-5">
          <div className="w-14 h-14 bg-paid/15 text-paid rounded-full flex items-center justify-center mx-auto">
            <Check size={32} />
          </div>
          <div>
            <h4 className="font-serif text-xl text-ink">
              Receipt #{lastGeneratedReceipt.receiptNumber}
            </h4>
            <p className="text-sm text-muted-text mt-1">
              Received {formatRupees(lastGeneratedReceipt.amountPaise)} from{' '}
              {lastGeneratedReceipt.tenantName} (Unit {lastGeneratedReceipt.unitNumber})
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              icon={<Download size={16} />}
              onClick={handleDownloadPdf}
            >
              Download PDF Receipt
            </Button>
            <Button variant="primary" onClick={handleResetAndClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unit & Tenant Selector */}
          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Select Unit & Tenant <span className="text-terracotta">*</span>
            </label>
            <select
              value={selectedUnitId}
              onChange={handleUnitChange}
              required
              className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
            >
              {occupiedUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  Unit {u.unitNumber} ({u.buildingName}) - {u.currentTenantName} [Due:{' '}
                  {formatRupees(u.amountDuePaise || u.baseRentPaise + u.maintenancePaise)}]
                </option>
              ))}
            </select>
          </div>

          {/* Amount in Paise / Rupees */}
          <MoneyInput
            label="Payment Amount Received"
            valuePaise={amountPaise}
            onChangePaise={setAmountPaise}
            required
            helperText="Partial payments and advance settlements are automatically credited to the oldest charge."
          />

          {/* Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Payment Mode <span className="text-terracotta">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash (Caretaker receipt)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Transaction / UTR / Cheque Ref #
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. UPI/631902481920 or CHQ-10492"
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          {/* Date & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Internal Notes / Ledger Narration
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Settled for Nov 2026 rent"
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-line">
            <Button variant="secondary" type="button" onClick={handleResetAndClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={<CreditCard size={16} />}
              disabled={amountPaise <= 0}
            >
              Generate Receipt & Record
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
