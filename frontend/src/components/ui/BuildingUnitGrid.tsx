import React, { useState } from 'react';
import { Unit } from '../../types';
import { formatRupees } from '../../utils/formatters';
import { StatusPill } from './StatusPill';
import { Button } from './Button';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';
import { Send, CreditCard, FileText, Phone, User as UserIcon, Calendar, ArrowRight } from 'lucide-react';

interface BuildingUnitGridProps {
  units: Unit[];
  onRecordPaymentClick?: (unit: Unit) => void;
  onSendReminderClick?: (unit: Unit) => void;
  onAssignTenantClick?: (unit: Unit) => void;
}

export const BuildingUnitGrid: React.FC<BuildingUnitGridProps> = ({
  units,
  onRecordPaymentClick,
  onSendReminderClick,
  onAssignTenantClick,
}) => {
  const { t, sendReminderNow } = useApp();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Group units by building, then by floor (descending so Top floor is on top, ground floor at bottom, like a real building!)
  const groupedByBuilding = units.reduce((acc, unit) => {
    if (!acc[unit.buildingName]) {
      acc[unit.buildingName] = {};
    }
    if (!acc[unit.buildingName][unit.floorNumber]) {
      acc[unit.buildingName][unit.floorNumber] = [];
    }
    acc[unit.buildingName][unit.floorNumber].push(unit);
    return acc;
  }, {} as Record<string, Record<number, Unit[]>>);

  const getTileClasses = (unit: Unit) => {
    const base =
      'unit-tile p-3 min-w-[100px] sm:min-w-[120px] flex flex-col justify-between cursor-pointer hover:shadow-md transition-all active:scale-[0.98] select-none text-left';
    switch (unit.paymentStatus) {
      case 'PAID':
        return `${base} unit-tile-paid`;
      case 'DUE':
        return `${base} unit-tile-due`;
      case 'OVERDUE':
        return `${base} unit-tile-overdue`;
      case 'NOTICE':
        return `${base} unit-tile-notice`;
      case 'VACANT':
      default:
        return `${base} unit-tile-vacant`;
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedByBuilding).map(([buildingName, floorMap]) => {
        // Sort floors descending (4th floor on top, 1st floor at bottom)
        const sortedFloors = Object.keys(floorMap)
          .map(Number)
          .sort((a, b) => b - a);

        return (
          <div key={buildingName} className="ledger-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-[22px] sm:text-[24px] text-ink leading-tight">
                  {buildingName}
                </h3>
                <div className="h-[3px] border-b-[3px] border-double border-line w-full mt-2" />
              </div>
              <div className="text-xs text-muted-text font-medium">
                {Object.values(floorMap).flat().length} Units total
              </div>
            </div>

            {/* Floors Stack */}
            <div className="space-y-4">
              {sortedFloors.map((floorNum) => {
                const floorUnits = floorMap[floorNum].sort((a, b) =>
                  a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })
                );

                return (
                  <div key={floorNum} className="floor-shelf">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold text-[#75634F] uppercase tracking-wider">
                        Floor {floorNum}
                      </span>
                      <span className="text-[11px] text-[#75634F]">
                        {floorUnits.filter((u) => u.status !== 'VACANT').length} Occupied /{' '}
                        {floorUnits.length} Total
                      </span>
                    </div>

                    {/* Unit Windows Row */}
                    <div className="flex flex-wrap gap-3 pb-2 overflow-x-auto">
                      {floorUnits.map((unit) => (
                        <div
                          key={unit.id}
                          className={getTileClasses(unit)}
                          onClick={() => setSelectedUnit(unit)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-serif text-lg font-bold">
                              {unit.unitNumber}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-black/5">
                              {unit.type}
                            </span>
                          </div>

                          <div className="my-1.5">
                            <StatusPill status={unit.paymentStatus} />
                          </div>

                          <div className="mt-1 pt-1 border-t border-black/10 flex flex-col text-[11px]">
                            {unit.currentTenantName ? (
                              <span className="truncate font-medium text-ink">
                                {unit.currentTenantName}
                              </span>
                            ) : (
                              <span className="text-muted-text italic">Ready to Lease</span>
                            )}
                            <span className="font-serif text-xs font-semibold mt-0.5 tnum">
                              {formatRupees(unit.baseRentPaise)}/mo
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 4px Floor Line */}
                    <div className="floor-shelf-line" />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Unit Action Sheet / Details Dialog */}
      <Modal
        isOpen={Boolean(selectedUnit)}
        onClose={() => setSelectedUnit(null)}
        title={selectedUnit ? `Unit ${selectedUnit.unitNumber} - ${selectedUnit.buildingName}` : ''}
        subtitle={selectedUnit ? `${selectedUnit.type} • ${selectedUnit.areaSqft} sq.ft` : ''}
      >
        {selectedUnit && (
          <div className="space-y-6">
            {/* Status and Rent Summary Strip */}
            <div className="p-4 bg-ground rounded-[12px] border border-line flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase text-muted-text font-bold block mb-1">
                  Payment Status
                </span>
                <StatusPill status={selectedUnit.paymentStatus} />
              </div>
              <div>
                <span className="text-xs uppercase text-muted-text font-bold block mb-1">
                  Monthly Rent + Maint.
                </span>
                <span className="font-serif text-xl font-bold text-ink tnum">
                  {formatRupees(selectedUnit.baseRentPaise + selectedUnit.maintenancePaise)}
                </span>
              </div>
              <div>
                <span className="text-xs uppercase text-muted-text font-bold block mb-1">
                  Security Deposit
                </span>
                <span className="font-serif text-lg font-semibold text-ink tnum">
                  {formatRupees(selectedUnit.depositPaise)}
                </span>
              </div>
            </div>

            {/* Tenant details if occupied */}
            {selectedUnit.currentTenantName ? (
              <div className="p-4 bg-surface rounded-[12px] border border-line space-y-3">
                <div className="flex items-center gap-2 text-ink font-semibold border-b border-line pb-2">
                  <UserIcon size={16} className="text-terracotta" />
                  <span>Current Tenant Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-text block">Full Name</span>
                    <span className="font-medium">{selectedUnit.currentTenantName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-text block">Phone</span>
                    <span className="font-medium flex items-center gap-1">
                      <Phone size={13} className="text-muted-text" />
                      {selectedUnit.currentTenantPhone || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-text block">Lease Agreement</span>
                    <span className="font-medium">{selectedUnit.currentLeaseId || 'Active'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-text block">Current Due Amount</span>
                    <span
                      className={`font-serif font-bold tnum ${
                        selectedUnit.amountDuePaise ? 'text-overdue' : 'text-paid'
                      }`}
                    >
                      {formatRupees(selectedUnit.amountDuePaise || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 text-center bg-ground/50 rounded-[12px] border border-dashed border-line">
                <p className="text-sm font-medium text-muted-text mb-3">
                  This unit is currently vacant and ready for leasing.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    const u = selectedUnit;
                    setSelectedUnit(null);
                    if (onAssignTenantClick) onAssignTenantClick(u);
                  }}
                >
                  + Onboard & Assign Tenant Now
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap gap-3 justify-end border-t border-line">
              {selectedUnit.currentTenantName ? (
                <>
                  <Button
                    variant="secondary"
                    icon={<Send size={15} />}
                    onClick={() => {
                      if (onSendReminderClick) {
                        onSendReminderClick(selectedUnit);
                      } else {
                        sendReminderNow(selectedUnit.id, 'WHATSAPP');
                      }
                      setSelectedUnit(null);
                    }}
                  >
                    Send Reminder
                  </Button>
                  <Button
                    variant="primary"
                    icon={<CreditCard size={15} />}
                    onClick={() => {
                      if (onRecordPaymentClick) {
                        onRecordPaymentClick(selectedUnit);
                      }
                      setSelectedUnit(null);
                    }}
                  >
                    Record Payment
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => {
                    const u = selectedUnit;
                    setSelectedUnit(null);
                    if (onAssignTenantClick) onAssignTenantClick(u);
                  }}
                >
                  + Assign Tenant to Unit {selectedUnit.unitNumber}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

