import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatKolkataDate } from '../utils/formatters';
import { exportToExcel } from '../utils/exportGenerators';
import { Button } from '../components/ui/Button';
import { History, Download, ShieldCheck, Filter } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs, currentOrg, showToast } = useApp();
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = filterAction === 'ALL'
    ? auditLogs
    : auditLogs.filter((a) => a.action.includes(filterAction));

  const handleExportAuditExcel = () => {
    const headers = ['Timestamp (IST)', 'User Name', 'Role', 'Action Type', 'Target Entity', 'Details & Narration', 'Origin IP'];
    const rows = filteredLogs.map((a) => [
      formatKolkataDate(a.timestamp, true),
      a.userName,
      a.userRole,
      a.action,
      a.targetEntity,
      a.details,
      a.ipAddress,
    ]);
    exportToExcel(`Audit_Trail_${currentOrg.code}`, headers, rows);
    showToast('Exported immutable audit trail to Excel!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Audit & Activity Trail
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Immutable tracking of financial entries, tenant clicks, KYC document reveals, reminders, and IP logs.
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<Download size={15} />}
          onClick={handleExportAuditExcel}
        >
          Export Audit Trail (.xlsx)
        </Button>
      </div>

      <div className="ledger-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="ledger-card-title !mb-0">Logged Operational Events ({filteredLogs.length})</h3>
            <p className="text-xs text-muted-text mt-1">
              Append-only tamper-evident audit journal for {currentOrg.name}
            </p>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-text flex items-center gap-1">
              <Filter size={13} /> Filter Action:
            </span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="h-[36px] px-2.5 rounded-[8px] border border-line bg-surface text-xs font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-terracotta"
            >
              <option value="ALL">All Actions</option>
              <option value="PAYMENT">Payments & Reversals</option>
              <option value="KYC">KYC Unmasking / Reveals</option>
              <option value="TENANT">Tenant Onboarding</option>
              <option value="REMINDER">Reminders & Dispatches</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>User & Role</th>
                <th>Action Log</th>
                <th>Entity Affected</th>
                <th>Narration & Event Detail</th>
                <th>Device IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-xs text-muted-text whitespace-nowrap">
                    {formatKolkataDate(entry.timestamp, true)}
                  </td>
                  <td>
                    <span className="font-bold text-ink block">{entry.userName}</span>
                    <span className="text-[11px] text-muted-text">{entry.userRole}</span>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded bg-ground text-xs font-mono font-bold">
                      {entry.action}
                    </span>
                  </td>
                  <td className="text-xs font-semibold">{entry.targetEntity}</td>
                  <td className="text-xs max-w-sm">{entry.details}</td>
                  <td className="text-xs font-mono text-muted-text whitespace-nowrap">
                    {entry.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

