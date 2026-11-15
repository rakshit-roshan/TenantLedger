import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { formatRupees, formatKolkataDate } from '../utils/formatters';
import { exportToExcel } from '../utils/exportGenerators';
import { FileSpreadsheet, FileText, Download, Filter } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { units, receipts, expenses, currentOrg, showToast } = useApp();

  const [reportType, setReportType] = useState<'rent_roll' | 'defaulters' | 'collections' | 'gst'>('rent_roll');

  const handleExport = () => {
    if (reportType === 'rent_roll') {
      const headers = ['Building', 'Unit #', 'Type', 'Area (sqft)', 'Tenant', 'Base Rent (₹)', 'Maintenance (₹)', 'Deposit (₹)', 'Status'];
      const rows = units.map((u) => [
        u.buildingName,
        u.unitNumber,
        u.type,
        u.areaSqft,
        u.currentTenantName || 'VACANT',
        u.baseRentPaise / 100,
        u.maintenancePaise / 100,
        u.depositPaise / 100,
        u.status,
      ]);
      exportToExcel(`RentRoll_${currentOrg.code}`, headers, rows);
    } else if (reportType === 'defaulters') {
      const headers = ['Building', 'Unit #', 'Tenant', 'Phone', 'Overdue Days', 'Due Amount (₹)'];
      const overdueUnits = units.filter((u) => u.paymentStatus === 'OVERDUE');
      const rows = overdueUnits.map((u) => [
        u.buildingName,
        u.unitNumber,
        u.currentTenantName,
        u.currentTenantPhone || '',
        u.overdueDays || 14,
        (u.amountDuePaise || u.baseRentPaise + u.maintenancePaise) / 100,
      ]);
      exportToExcel(`Defaulters_Report_${currentOrg.code}`, headers, rows);
    } else {
      const headers = ['Receipt #', 'Date', 'Tenant', 'Unit', 'Amount (₹)', 'Payment Method', 'Ref #'];
      const rows = receipts.map((r) => [
        r.receiptNumber,
        formatKolkataDate(r.paymentDate),
        r.tenantName,
        r.unitNumber,
        r.amountPaise / 100,
        r.paymentMethod,
        r.referenceNumber || '',
      ]);
      exportToExcel(`Collections_Ledger_${currentOrg.code}`, headers, rows);
    }
    showToast(`Generated & downloaded ${reportType.replace('_', ' ').toUpperCase()} report!`, 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Financial & Compliance Reports
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Generate auditor-certified Rent Rolls, Defaulter Aging schedules, GST schedules, and Cashflow summaries.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Download size={16} />}
          onClick={handleExport}
        >
          Export Active Report to Excel (.xlsx)
        </Button>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex border-b border-line gap-4">
        <button
          onClick={() => setReportType('rent_roll')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            reportType === 'rent_roll'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-muted-text hover:text-ink'
          }`}
        >
          Comprehensive Rent Roll ({units.length} Units)
        </button>
        <button
          onClick={() => setReportType('defaulters')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            reportType === 'defaulters'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-muted-text hover:text-ink'
          }`}
        >
          Defaulters & Aging Schedule
        </button>
        <button
          onClick={() => setReportType('collections')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            reportType === 'collections'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-muted-text hover:text-ink'
          }`}
        >
          Collection Realization Ledger
        </button>
      </div>

      {/* Report Table Preview */}
      <div className="ledger-card">
        <h3 className="ledger-card-title">
          {reportType === 'rent_roll'
            ? 'Property Rent Roll & Unit Inventory'
            : reportType === 'defaulters'
            ? 'Tenant Defaulters Aging Schedule'
            : 'Collections Realization Report'}
        </h3>

        <div className="overflow-x-auto">
          {reportType === 'rent_roll' && (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Building</th>
                  <th>Unit</th>
                  <th>Type & Area</th>
                  <th>Tenant Name</th>
                  <th>Base Rent</th>
                  <th>Maintenance</th>
                  <th>Security Deposit</th>
                  <th>Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold">{u.buildingName}</td>
                    <td className="font-bold">Unit {u.unitNumber}</td>
                    <td className="text-xs">
                      {u.type} • {u.areaSqft} sqft
                    </td>
                    <td>{u.currentTenantName || <span className="text-muted-text italic">Vacant</span>}</td>
                    <td className="font-serif tnum">{formatRupees(u.baseRentPaise)}</td>
                    <td className="font-serif tnum">{formatRupees(u.maintenancePaise)}</td>
                    <td className="font-serif font-medium text-muted-text tnum">
                      {formatRupees(u.depositPaise)}
                    </td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-ground">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'defaulters' && (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Building & Unit</th>
                  <th>Tenant Name</th>
                  <th>Contact</th>
                  <th>Aging Bucket</th>
                  <th>Overdue Rent</th>
                  <th>Due Day</th>
                </tr>
              </thead>
              <tbody>
                {units
                  .filter((u) => u.paymentStatus === 'OVERDUE')
                  .map((u) => (
                    <tr key={u.id}>
                      <td className="font-bold">
                        {u.buildingName} - Unit {u.unitNumber}
                      </td>
                      <td>{u.currentTenantName}</td>
                      <td className="text-xs">{u.currentTenantPhone}</td>
                      <td>
                        <span className="text-xs font-bold text-overdue bg-overdue/10 px-2 py-0.5 rounded">
                          {u.overdueDays || 14} Days (Bucket 1-15d)
                        </span>
                      </td>
                      <td className="font-serif font-bold text-overdue tnum">
                        {formatRupees(u.amountDuePaise || u.baseRentPaise + u.maintenancePaise)}
                      </td>
                      <td className="text-xs text-muted-text">1st of month</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {reportType === 'collections' && (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Date</th>
                  <th>Tenant</th>
                  <th>Building & Unit</th>
                  <th>Payment Mode</th>
                  <th>Amount Realized</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id}>
                    <td className="font-bold">{r.receiptNumber}</td>
                    <td className="text-xs text-muted-text">{formatKolkataDate(r.paymentDate)}</td>
                    <td>{r.tenantName}</td>
                    <td>
                      {r.buildingName} - Unit {r.unitNumber}
                    </td>
                    <td>{r.paymentMethod}</td>
                    <td className="font-serif font-bold text-paid tnum">
                      {formatRupees(r.amountPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
