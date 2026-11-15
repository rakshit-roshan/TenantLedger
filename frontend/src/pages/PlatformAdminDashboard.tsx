import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatTileStrip, StatTileItem } from '../components/ui/StatTileStrip';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { formatKolkataDate } from '../utils/formatters';
import { Shield, Building, UserCheck, KeyRound, Check, XCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const PlatformAdminDashboard: React.FC = () => {
  const { allOrgs, showToast } = useApp();

  const [brokerApplications, setBrokerApplications] = useState([
    {
      id: 'app-1',
      firmName: 'Apex Realty Advisory & Broking',
      applicantName: 'Anand Kulkarni',
      pan: 'CCCAP6621R',
      gstin: '27CCCAP6621R1Z1',
      rera: 'A52100000982',
      status: 'APPROVED',
      appliedAt: '2026-11-01T10:00:00Z',
    },
    {
      id: 'app-2',
      firmName: 'Pune Metro Prime Properties',
      applicantName: 'Sunil Deshpande',
      pan: 'AAAPD1102K',
      gstin: '27AAAPD1102K1Z3',
      rera: 'A52100001099',
      status: 'PENDING',
      appliedAt: '2026-11-12T14:20:00Z',
    },
  ]);

  const [supportGrants, setSupportGrants] = useState([
    {
      id: 'grant-1',
      orgName: 'Shree Ganesh Properties',
      requestedBy: 'Vikram Deshmukh (Owner)',
      reason: 'Assistance debugging tenant lease renewal escalation calculation.',
      grantedAt: '2026-11-14T09:00:00Z',
      expiresAt: '2026-11-14T17:00:00Z', // 8-hour grant
      status: 'ACTIVE',
    },
  ]);

  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedOrgName, setSelectedOrgName] = useState(allOrgs[0]?.name || '');
  const [grantReason, setGrantReason] = useState('');

  const statTiles: StatTileItem[] = [
    {
      label: 'Tenant Organisations',
      value: allOrgs.length,
      subValue: '100% strict row-isolated schemas',
      accent: 'normal',
    },
    {
      label: 'Broker Verification Pending',
      value: brokerApplications.filter((b) => b.status === 'PENDING').length,
      subValue: 'Requires PAN/RERA verification',
      accent: 'due',
    },
    {
      label: 'Active Support Grants',
      value: supportGrants.filter((s) => s.status === 'ACTIVE').length,
      subValue: 'Time-limited access with full audit',
      accent: 'paid',
    },
    {
      label: 'Platform SLA Uptime',
      value: '99.99%',
      subValue: 'Flyway migrations up to date',
      accent: 'paid',
    },
  ];

  const handleApproveBroker = (id: string) => {
    setBrokerApplications((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'APPROVED' } : b))
    );
    showToast('Broker organization approved and granted platform access.', 'success');
  };

  const handleRejectBroker = (id: string) => {
    setBrokerApplications((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'REJECTED' } : b))
    );
    showToast('Broker application rejected.', 'info');
  };

  const handleIssueGrant = () => {
    if (!grantReason.trim()) return;
    const now = new Date();
    const expiry = new Date(now.getTime() + 8 * 3600 * 1000); // 8 hours
    const newGrant = {
      id: `grant-${Date.now()}`,
      orgName: selectedOrgName,
      requestedBy: 'Support Ops (Admin)',
      reason: grantReason,
      grantedAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      status: 'ACTIVE',
    };
    setSupportGrants((prev) => [newGrant, ...prev]);
    showToast(`Time-limited 8-hour support grant issued for ${selectedOrgName}`, 'success');
    setShowGrantModal(false);
    setGrantReason('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Platform Admin Control Plane
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Global governance: Broker approval gate, multi-tenant organizations, and time-limited support grants.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<KeyRound size={16} />}
          onClick={() => setShowGrantModal(true)}
        >
          Issue Support Grant
        </Button>
      </div>

      <StatTileStrip tiles={statTiles} />

      {/* Broker Approvals Gate */}
      <div className="ledger-card">
        <h3 className="ledger-card-title">Broker Organization Approvals (PAN & RERA Gate)</h3>
        <p className="text-xs text-muted-text -mt-2 mb-4">
          Broker accounts stay disabled and isolated until platform admin approves PAN and RERA credentials.
        </p>

        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Firm Name</th>
                <th>Applicant</th>
                <th>PAN Card</th>
                <th>GSTIN</th>
                <th>MahaRERA #</th>
                <th>Application Date</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {brokerApplications.map((app) => (
                <tr key={app.id}>
                  <td className="font-bold">{app.firmName}</td>
                  <td>{app.applicantName}</td>
                  <td className="font-mono text-xs font-semibold">{app.pan}</td>
                  <td className="font-mono text-xs">{app.gstin || '-'}</td>
                  <td className="font-mono text-xs text-paid font-bold">{app.rera || '-'}</td>
                  <td className="text-xs text-muted-text">{formatKolkataDate(app.appliedAt)}</td>
                  <td>
                    <StatusPill status={app.status as any} />
                  </td>
                  <td className="text-right space-x-1.5">
                    {app.status === 'PENDING' ? (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<Check size={13} />}
                          onClick={() => handleApproveBroker(app.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<XCircle size={13} />}
                          onClick={() => handleRejectBroker(app.id)}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-text">Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time-Limited Support Grants */}
      <div className="ledger-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="ledger-card-title !mb-0">Time-Limited Support Grants (No Blind Access)</h3>
            <p className="text-xs text-muted-text mt-1">
              Platform admins cannot view tenant data without an explicit, time-limited, logged support grant.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<KeyRound size={14} />}
            onClick={() => setShowGrantModal(true)}
          >
            New Grant
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Target Organisation</th>
                <th>Requester</th>
                <th>Business Reason</th>
                <th>Granted At (IST)</th>
                <th>Expires At (IST)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {supportGrants.map((grant) => (
                <tr key={grant.id}>
                  <td className="font-bold text-ink">{grant.orgName}</td>
                  <td>{grant.requestedBy}</td>
                  <td className="text-xs max-w-sm">{grant.reason}</td>
                  <td className="text-xs text-muted-text">{formatKolkataDate(grant.grantedAt, true)}</td>
                  <td className="text-xs text-muted-text font-bold">{formatKolkataDate(grant.expiresAt, true)}</td>
                  <td>
                    <StatusPill status={grant.status as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Issue Support Grant */}
      <Modal
        isOpen={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        title="Issue Time-Limited Support Grant"
        subtitle="Access automatically revokes after 8 hours"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Select Organisation
            </label>
            <select
              value={selectedOrgName}
              onChange={(e) => setSelectedOrgName(e.target.value)}
              className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
            >
              {allOrgs.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name} ({o.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Justification / Customer Support Ticket # <span className="text-terracotta">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
              placeholder="e.g. Resolving ticket #GK-4912 for lease renewal reconciliation."
              className="w-full p-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-line">
            <Button variant="secondary" onClick={() => setShowGrantModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!grantReason.trim()}
              onClick={handleIssueGrant}
            >
              Issue 8-Hour Grant
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
