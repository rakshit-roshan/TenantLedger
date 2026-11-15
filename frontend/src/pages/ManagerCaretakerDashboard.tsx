import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatTileStrip, StatTileItem } from '../components/ui/StatTileStrip';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { formatRupees, formatKolkataDate } from '../utils/formatters';
import { Wrench, Gauge, Receipt, Plus, CheckCircle, Clock } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { MoneyInput } from '../components/ui/MoneyInput';

interface MeterReading {
  id: string;
  unitNumber: string;
  meterType: 'ELECTRICITY' | 'WATER';
  previousReading: number;
  currentReading: number;
  ratePerUnitPaise: number;
  totalPaise: number;
  recordedAt: string;
}

export const ManagerCaretakerDashboard: React.FC<{ onRecordCashPayment: () => void }> = ({
  onRecordCashPayment,
}) => {
  const { tickets, updateTicketStatus, addTicket, units, buildings, currentOrg, showToast } = useApp();
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);

  // Meter readings state (starts clean with zero dummy records)
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([]);

  // Meter modal state
  const [meterUnitNumber, setMeterUnitNumber] = useState('');
  const [meterType, setMeterType] = useState<'ELECTRICITY' | 'WATER'>('ELECTRICITY');
  const [prevReading, setPrevReading] = useState(0);
  const [currReading, setCurrReading] = useState(0);
  const [ratePerUnitPaise, setRatePerUnitPaise] = useState(950); // ₹9.50 per unit default

  // Ticket modal state
  const [ticketUnitId, setTicketUnitId] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'PLUMBING' | 'ELECTRICAL' | 'CARPENTRY' | 'PAINTING' | 'APPLIANCE' | 'CLEANING' | 'OTHER'>('PLUMBING');
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [ticketVendor, setTicketVendor] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  const activeTickets = tickets.filter((t) => t.status !== 'RESOLVED');
  const urgentTickets = tickets.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH');
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED');

  const statTiles: StatTileItem[] = [
    {
      label: 'Open Maintenance Tasks',
      value: activeTickets.length,
      subValue: activeTickets.length > 0 ? `${urgentTickets.length} marked high / urgent SLA` : 'All tasks completed on schedule',
      accent: urgentTickets.length > 0 ? 'overdue' : 'normal',
    },
    {
      label: 'Meter Sub-Bills Logged',
      value: meterReadings.length,
      subValue: meterReadings.length > 0 ? 'Electricity & water consumption' : 'No active sub-meters billed',
      accent: 'normal',
    },
    {
      label: 'Units Under Supervision',
      value: units.length,
      subValue: 'Caretaker physical verification',
      accent: 'normal',
    },
    {
      label: 'Resolved This Month',
      value: resolvedTickets.length,
      subValue: resolvedTickets.length > 0 ? `${resolvedTickets.length} tasks closed` : 'No tickets resolved this month',
      accent: resolvedTickets.length > 0 ? 'paid' : 'normal',
    },
  ];

  const handleResolve = (ticketId: string) => {
    updateTicketStatus(ticketId, 'RESOLVED');
  };

  const handlePostMeterReading = () => {
    const unitNo = meterUnitNumber || (units[0] ? units[0].unitNumber : '101');
    const consumed = Math.max(0, currReading - prevReading);
    const totalPaise = consumed * ratePerUnitPaise;

    const newReading: MeterReading = {
      id: 'meter-' + Date.now(),
      unitNumber: unitNo,
      meterType,
      previousReading: prevReading,
      currentReading: currReading,
      ratePerUnitPaise,
      totalPaise,
      recordedAt: new Date().toISOString(),
    };

    setMeterReadings((prev) => [newReading, ...prev]);
    showToast(`Sub-meter entry recorded for Unit ${unitNo}! Billed ${formatRupees(totalPaise)}.`, 'success');
    setShowMeterModal(false);
    setPrevReading(0);
    setCurrReading(0);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDesc.trim()) {
      showToast('Please provide a description of the repair or maintenance issue', 'error');
      return;
    }

    const targetUnit = units.find((u) => u.id === ticketUnitId) || units[0];
    const slaHours = ticketPriority === 'URGENT' ? 12 : ticketPriority === 'HIGH' ? 24 : ticketPriority === 'MEDIUM' ? 48 : 72;

    await addTicket({
      organizationId: currentOrg.id,
      buildingId: targetUnit ? targetUnit.buildingId : (buildings[0]?.id || 'bld-1'),
      buildingName: targetUnit ? targetUnit.buildingName : (buildings[0]?.name || 'Building'),
      unitId: targetUnit ? targetUnit.id : 'unit-1',
      unitNumber: targetUnit ? targetUnit.unitNumber : '101',
      tenantName: targetUnit?.currentTenantName || 'Resident',
      category: ticketCategory,
      priority: ticketPriority,
      slaHours,
      status: 'OPEN',
      description: ticketDesc.trim(),
      assignedVendorName: ticketVendor.trim() || 'General Maintenance Team',
    });

    setShowAddTicketModal(false);
    setTicketDesc('');
    setTicketVendor('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Property Manager & Caretaker Ops
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Building maintenance, utility sub-metering, and cash rent receipt collection desk.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="secondary"
            icon={<Wrench size={16} />}
            onClick={() => setShowAddTicketModal(true)}
          >
            Create Ticket
          </Button>
          <Button
            variant="secondary"
            icon={<Gauge size={16} />}
            onClick={() => {
              if (units.length > 0 && !meterUnitNumber) {
                setMeterUnitNumber(units[0].unitNumber);
              }
              setShowMeterModal(true);
            }}
          >
            Record Sub-Meter Reading
          </Button>
          <Button
            variant="primary"
            icon={<Receipt size={16} />}
            onClick={onRecordCashPayment}
          >
            Issue Cash Receipt
          </Button>
        </div>
      </div>

      <StatTileStrip tiles={statTiles} />

      {/* Maintenance Tasks with SLA */}
      <div className="ledger-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="ledger-card-title !mb-0">Maintenance Tickets & SLA Tracking</h3>
            <p className="text-xs text-muted-text mt-1">Live service level agreement monitoring per work order</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => setShowAddTicketModal(true)}
          >
            New Ticket
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Building & Unit</th>
                <th>Category</th>
                <th>Priority / SLA</th>
                <th>Assigned Vendor</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-text">
                    No maintenance tickets logged yet. All units and common areas are operating normally with zero SLA delays.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id}>
                    <td className="font-bold text-ink font-mono">{t.ticketNumber}</td>
                    <td>
                      <span className="font-semibold block">{t.buildingName}</span>
                      <span className="text-xs text-muted-text">Unit {t.unitNumber}</span>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded bg-ground text-xs font-semibold">
                        {t.category}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          t.priority === 'URGENT'
                            ? 'bg-overdue/10 text-overdue'
                            : t.priority === 'HIGH'
                            ? 'bg-due/10 text-due'
                            : 'bg-ground text-ink'
                        }`}
                      >
                        {t.priority} ({t.slaHours || 48}h SLA)
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-ink">{t.assignedVendorName || 'Unassigned'}</span>
                    </td>
                    <td className="text-xs max-w-xs truncate" title={t.description}>
                      {t.description}
                    </td>
                    <td>
                      <StatusPill status={t.status} />
                    </td>
                    <td className="text-right">
                      {t.status !== 'RESOLVED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleResolve(t.id)}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meter Sub-billing Readings */}
      <div className="ledger-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="ledger-card-title !mb-0">Utility Sub-Meter Log</h3>
            <p className="text-xs text-muted-text mt-1">
              Monthly electricity & water consumption billed directly to tenant ledgers
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={14} />}
            onClick={() => {
              if (units.length > 0 && !meterUnitNumber) {
                setMeterUnitNumber(units[0].unitNumber);
              }
              setShowMeterModal(true);
            }}
          >
            Add Meter Entry
          </Button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Meter Type</th>
                <th>Previous Units</th>
                <th>Current Units</th>
                <th>Units Consumed</th>
                <th>Rate / Unit</th>
                <th>Total Billed</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {meterReadings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-text">
                    No utility sub-meter readings recorded yet. Click "Add Meter Entry" to log electricity or water consumption.
                  </td>
                </tr>
              ) : (
                meterReadings.map((m) => {
                  const consumed = m.currentReading - m.previousReading;
                  return (
                    <tr key={m.id}>
                      <td className="font-bold">Unit {m.unitNumber}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded bg-ground text-xs font-semibold">
                          {m.meterType}
                        </span>
                      </td>
                      <td className="tnum">{m.previousReading}</td>
                      <td className="tnum">{m.currentReading}</td>
                      <td className="font-bold text-ink tnum">{consumed}</td>
                      <td className="tnum">₹{(m.ratePerUnitPaise / 100).toFixed(2)}</td>
                      <td className="font-serif font-bold text-ink tnum">
                        {formatRupees(m.totalPaise)}
                      </td>
                      <td className="text-xs text-muted-text">
                        {formatKolkataDate(m.recordedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={showAddTicketModal}
        onClose={() => setShowAddTicketModal(false)}
        title="Log Maintenance Ticket"
        subtitle="Schedules repair work order with SLA deadline"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Unit / Premises <span className="text-terracotta">*</span>
            </label>
            <select
              value={ticketUnitId}
              onChange={(e) => setTicketUnitId(e.target.value)}
              className="w-full h-[42px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            >
              <option value="">Select unit...</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  Unit {u.unitNumber} ({u.buildingName}) {u.currentTenantName ? `• Tenant: ${u.currentTenantName}` : '• Vacant'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value as any)}
                className="w-full h-[42px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                <option value="PLUMBING">Plumbing (Pipes, Taps, Drainage)</option>
                <option value="ELECTRICAL">Electrical (Wiring, Meter, Switches)</option>
                <option value="CARPENTRY">Carpentry (Doors, Locks, Cabinets)</option>
                <option value="PAINTING">Painting & Touchup</option>
                <option value="APPLIANCE">Appliance Repair</option>
                <option value="CLEANING">Deep Cleaning</option>
                <option value="OTHER">General Repairs</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Priority & SLA
              </label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value as any)}
                className="w-full h-[42px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                <option value="LOW">Low (72 Hours SLA)</option>
                <option value="MEDIUM">Standard (48 Hours SLA)</option>
                <option value="HIGH">High (24 Hours SLA)</option>
                <option value="URGENT">Urgent (12 Hours Emergency SLA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Assigned Vendor / Technician
            </label>
            <input
              type="text"
              value={ticketVendor}
              onChange={(e) => setTicketVendor(e.target.value)}
              placeholder="e.g. Pune City Plumbing Services"
              className="w-full h-[42px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Description <span className="text-terracotta">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              placeholder="Describe the defect, location, and required repair..."
              className="w-full p-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-line">
            <Button variant="secondary" type="button" onClick={() => setShowAddTicketModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save & Dispatch Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Meter Modal */}
      <Modal
        isOpen={showMeterModal}
        onClose={() => setShowMeterModal(false)}
        title="Record Utility Sub-Meter Reading"
        subtitle="Calculates consumption and generates ledger charge"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Unit Number
              </label>
              <select
                value={meterUnitNumber}
                onChange={(e) => setMeterUnitNumber(e.target.value)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              >
                {units.length === 0 ? (
                  <option value="">No units added yet</option>
                ) : (
                  units.map((u) => (
                    <option key={u.id} value={u.unitNumber}>
                      Unit {u.unitNumber} ({u.buildingName})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Meter Type
              </label>
              <select
                value={meterType}
                onChange={(e) => setMeterType(e.target.value as any)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              >
                <option value="ELECTRICITY">Electricity (kWh)</option>
                <option value="WATER">Water Meter (kL)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Previous Reading
              </label>
              <input
                type="number"
                min={0}
                value={prevReading}
                onChange={(e) => setPrevReading(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Current Reading
              </label>
              <input
                type="number"
                min={0}
                value={currReading}
                onChange={(e) => setCurrReading(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Rate Per Unit (₹)
            </label>
            <input
              type="number"
              step="0.1"
              value={ratePerUnitPaise / 100}
              onChange={(e) => setRatePerUnitPaise(Math.round((Number(e.target.value) || 0) * 100))}
              className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
            />
            <p className="text-[11px] text-muted-text mt-1">
              Units consumed: {Math.max(0, currReading - prevReading)} • Total amount:{' '}
              {formatRupees(Math.max(0, currReading - prevReading) * ratePerUnitPaise)}
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-line">
            <Button variant="secondary" onClick={() => setShowMeterModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={currReading <= prevReading}
              onClick={handlePostMeterReading}
            >
              Post Reading
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
