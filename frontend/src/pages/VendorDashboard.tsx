import React from 'react';
import { useApp } from '../context/AppContext';
import { StatTileStrip, StatTileItem } from '../components/ui/StatTileStrip';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { formatKolkataDate } from '../utils/formatters';
import { Wrench, CheckCircle, Clock } from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const { tickets, updateTicketStatus, currentOrg } = useApp();

  const assignedTickets = tickets.filter(
    (t) => t.status !== 'RESOLVED' || t.assignedVendorName
  );

  const openCount = assignedTickets.filter((t) => t.status === 'ASSIGNED' || t.status === 'OPEN').length;
  const inProgressCount = assignedTickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = assignedTickets.filter((t) => t.status === 'RESOLVED').length;
  const totalHandled = resolvedCount + inProgressCount;

  const statTiles: StatTileItem[] = [
    {
      label: 'New Assigned Tickets',
      value: openCount,
      subValue: openCount > 0 ? 'Requires onsite visit' : 'No new assignments',
      accent: openCount > 0 ? 'due' : 'normal',
    },
    {
      label: 'Work In Progress',
      value: inProgressCount,
      subValue: inProgressCount > 0 ? 'Active repairs under SLA' : 'No active repairs',
      accent: 'normal',
    },
    {
      label: 'Completed / Billed',
      value: resolvedCount,
      subValue: resolvedCount > 0 ? 'Work orders verified' : 'No orders completed yet',
      accent: resolvedCount > 0 ? 'paid' : 'normal',
    },
    {
      label: 'SLA Performance',
      value: totalHandled > 0 ? '100%' : '-',
      subValue: totalHandled > 0 ? 'All orders within SLA deadline' : 'Awaiting work order activity',
      accent: totalHandled > 0 ? 'paid' : 'normal',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
          Vendor Service Partner Desk
        </h2>
        <p className="text-sm text-muted-text mt-1">
          Assigned maintenance orders, service level agreements (SLA), and completion approvals for{' '}
          <span className="font-semibold text-ink">{currentOrg.name}</span>
        </p>
      </div>

      <StatTileStrip tiles={statTiles} />

      <div className="ledger-card">
        <h3 className="ledger-card-title">Assigned Work Orders</h3>
        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Building & Unit</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Tenant Description</th>
                <th>Assigned Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-text">
                    No open maintenance work orders assigned at this time.
                  </td>
                </tr>
              ) : (
                assignedTickets.map((t) => (
                  <tr key={t.id}>
                    <td className="font-bold text-ink font-mono">{t.ticketNumber}</td>
                    <td>
                      <span className="font-bold block">{t.buildingName}</span>
                      <span className="text-xs text-muted-text">Unit {t.unitNumber}</span>
                    </td>
                    <td>{t.category}</td>
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
                        {t.priority} ({t.slaHours}h SLA)
                      </span>
                    </td>
                    <td className="text-xs max-w-sm truncate" title={t.description}>{t.description}</td>
                    <td className="text-xs text-muted-text">{formatKolkataDate(t.reportedAt)}</td>
                    <td>
                      <StatusPill status={t.status} />
                    </td>
                    <td className="text-right space-x-1.5">
                      {t.status === 'ASSIGNED' || t.status === 'OPEN' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateTicketStatus(t.id, 'IN_PROGRESS')}
                        >
                          Start Work
                        </Button>
                      ) : null}
                      {t.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => updateTicketStatus(t.id, 'RESOLVED')}
                        >
                          Complete Order
                        </Button>
                      )}
                      {t.status === 'RESOLVED' && (
                        <span className="text-xs text-paid font-semibold">Done</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
