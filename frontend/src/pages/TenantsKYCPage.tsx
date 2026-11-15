import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Tenant } from '../types';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, ShieldCheck, UserCheck, AlertTriangle, Phone, Mail, Car, Users } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

interface TenantsKYCPageProps {
  onOpenAddTenant?: () => void;
}

export const TenantsKYCPage: React.FC<TenantsKYCPageProps> = ({ onOpenAddTenant }) => {
  const { tenants, units, leases, revealSensitiveField, showToast } = useApp();

  const [revealedAadhaars, setRevealedAadhaars] = useState<Record<string, boolean>>({});
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const toggleReveal = (tenantId: string) => {
    if (revealedAadhaars[tenantId]) {
      setRevealedAadhaars((prev) => ({ ...prev, [tenantId]: false }));
    } else {
      revealSensitiveField('TenantKYC', tenantId, 'Aadhaar & PAN Number');
      setRevealedAadhaars((prev) => ({ ...prev, [tenantId]: true }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Tenants & KYC Verification
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Resident profiles, encrypted KYC documents, police verification certificates, and house assignments.
          </p>
        </div>
        {onOpenAddTenant && (
          <Button
            variant="primary"
            onClick={onOpenAddTenant}
          >
            + Onboard New Tenant
          </Button>
        )}
      </div>

      <div className="ledger-card">
        <h3 className="ledger-card-title">Resident Directory & Identity Verification</h3>
        <p className="text-xs text-muted-text -mt-2 mb-4">
          Government IDs (Aadhaar & PAN) are masked by default to the last 4 digits. Revealing triggers an unmasking audit entry.
        </p>

        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Tenant Name & Assigned House</th>
                <th>Contact & Occupation</th>
                <th>Aadhaar Number & KYC Docs</th>
                <th>PAN Card</th>
                <th>Police Verification</th>
                <th>Vehicles</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => {
                const aadhaarKyc = tenant.kyc.find((k) => k.documentType === 'AADHAAR');
                const panKyc = tenant.kyc.find((k) => k.documentType === 'PAN');
                const isRevealed = Boolean(revealedAadhaars[tenant.id]);
                const assignedUnit = units.find((u) => u.id === tenant.currentUnitId);

                return (
                  <tr key={tenant.id}>
                    <td>
                      <span className="font-bold text-ink text-sm block">{tenant.name}</span>
                      <span className="text-xs text-paid font-semibold inline-flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-paid"></span>
                        {assignedUnit ? `${assignedUnit.buildingName} - Unit ${assignedUnit.unitNumber}` : 'House Assigned'}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs space-y-0.5">
                        <span className="font-medium flex items-center gap-1">
                          <Phone size={12} className="text-muted-text" /> {tenant.phone}
                        </span>
                        <span className="text-muted-text flex items-center gap-1">
                          <Mail size={12} className="text-muted-text" /> {tenant.email}
                        </span>
                        <span className="text-ink font-semibold">{tenant.occupation}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold">
                          {isRevealed
                            ? aadhaarKyc?.rawDocumentNumberEncrypted.replace('ENC-7819-AADH-', '4590 1289 ') || '4590 1289 4921'
                            : aadhaarKyc?.documentNumberMasked || 'XXXX-XXXX-4921'}
                        </span>
                        <button
                          onClick={() => toggleReveal(tenant.id)}
                          title={isRevealed ? 'Mask document number' : 'Reveal unmasked document (Logged)'}
                          className="text-muted-text hover:text-terracotta transition-colors"
                        >
                          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs">
                        {isRevealed ? 'AAAPS4419P' : panKyc?.documentNumberMasked || 'XXXX-XX-4419P'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          tenant.policeVerificationStatus === 'VERIFIED'
                            ? 'bg-paid/10 text-paid border border-paid/30'
                            : 'bg-due/10 text-due border border-due/30'
                        }`}
                      >
                        <ShieldCheck size={12} />
                        {tenant.policeVerificationStatus}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs space-y-0.5">
                        {tenant.vehicles.map((v, i) => (
                          <div key={i} className="flex items-center gap-1 text-muted-text">
                            <Car size={11} />
                            <span>{v.regNumber}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        Full Profile
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Profile Modal */}
      <Modal
        isOpen={Boolean(selectedTenant)}
        onClose={() => setSelectedTenant(null)}
        title={selectedTenant?.name || 'Tenant Details'}
        subtitle={selectedTenant?.occupation}
      >
        {selectedTenant && (
          <div className="space-y-5 text-sm">
            {/* Emergency Contact */}
            <div className="p-4 bg-ground rounded-[12px] border border-line">
              <h4 className="font-serif font-bold text-ink mb-2">Emergency Contact</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-text block">Name</span>
                  <span className="font-semibold">{selectedTenant.emergencyContact.name}</span>
                </div>
                <div>
                  <span className="text-muted-text block">Relation & Phone</span>
                  <span className="font-semibold">
                    {selectedTenant.emergencyContact.relation} • {selectedTenant.emergencyContact.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Co-Tenants */}
            <div className="p-4 bg-surface rounded-[12px] border border-line">
              <h4 className="font-serif font-bold text-ink mb-2 flex items-center gap-1.5">
                <Users size={16} className="text-terracotta" />
                <span>Family & Co-Tenants</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                {selectedTenant.coTenants.length === 0 ? (
                  <span className="text-muted-text italic">Single occupant</span>
                ) : (
                  selectedTenant.coTenants.map((c, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-line/40 last:border-b-0">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-text">
                        {c.relation}, Age {c.age}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedTenant(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
