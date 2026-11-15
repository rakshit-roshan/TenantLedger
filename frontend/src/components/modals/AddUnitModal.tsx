import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MoneyInput } from '../ui/MoneyInput';
import { UnitType, UnitStatus, Unit } from '../../types';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Copy, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { parseRupeesToPaise } from '../../utils/formatters';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose }) => {
  const { buildings, addUnit, bulkAddUnits, copyFloorUnits, currentOrg, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'copy' | 'csv'>('single');

  // Single unit form state
  const [buildingId, setBuildingId] = useState<string>(buildings[0]?.id || '');
  const [floorNumber, setFloorNumber] = useState<number>(1);
  const [unitNumber, setUnitNumber] = useState<string>('501');
  const [unitType, setUnitType] = useState<UnitType>('2BHK');
  const [areaSqft, setAreaSqft] = useState<number>(950);
  const [baseRentPaise, setBaseRentPaise] = useState<number>(2800000);
  const [maintenancePaise, setMaintenancePaise] = useState<number>(350000);
  const [depositPaise, setDepositPaise] = useState<number>(7500000);
  const [status, setStatus] = useState<UnitStatus>('VACANT');

  // Bulk add form state
  const [bulkBuildingId, setBulkBuildingId] = useState<string>(buildings[0]?.id || '');
  const [bulkFloorNumber, setBulkFloorNumber] = useState<number>(2);
  const [bulkUnitsCount, setBulkUnitsCount] = useState<number>(4);
  const [bulkPrefix, setBulkPrefix] = useState<string>('20'); // 201, 202, 203...
  const [bulkType, setBulkType] = useState<UnitType>('2BHK');
  const [bulkRentPaise, setBulkRentPaise] = useState<number>(2800000);

  // Copy floor state
  const [copyBuildingId, setCopyBuildingId] = useState<string>(buildings[0]?.id || '');
  const [sourceFloor, setSourceFloor] = useState<number>(1);
  const [targetFloor, setTargetFloor] = useState<number>(5);

  // CSV import state
  const [csvPreviewRows, setCsvPreviewRows] = useState<Array<{
    unitNumber: string;
    floor: number;
    type: string;
    area: number;
    rent: number;
    valid: boolean;
    error?: string;
  }>>([
    { unitNumber: '301-B', floor: 3, type: '2BHK', area: 980, rent: 2900000, valid: true },
    { unitNumber: '302-B', floor: 3, type: '2BHK', area: 980, rent: 2900000, valid: true },
    { unitNumber: '303-B', floor: 3, type: '1BHK', area: 650, rent: 1800000, valid: true },
    { unitNumber: 'INVALID_NO', floor: 0, type: 'Unknown', area: -50, rent: 0, valid: false, error: 'Invalid floor and negative area' },
  ]);

  const selectedBuilding = buildings.find((b) => b.id === (activeTab === 'single' ? buildingId : bulkBuildingId)) || buildings[0];

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) return;

    addUnit({
      organizationId: currentOrg.id,
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      floorId: `flr-${selectedBuilding.id}-${floorNumber}`,
      floorNumber,
      unitNumber,
      type: unitType,
      areaSqft,
      baseRentPaise,
      maintenancePaise,
      depositPaise,
      status,
      paymentStatus: status === 'VACANT' ? 'VACANT' : 'PAID',
    });
    onClose();
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bld = buildings.find((b) => b.id === bulkBuildingId) || buildings[0];
    if (!bld) return;

    const newUnits: Omit<Unit, 'id'>[] = [];
    for (let i = 1; i <= bulkUnitsCount; i++) {
      const uNum = `${bulkPrefix}${i}`;
      newUnits.push({
        organizationId: currentOrg.id,
        buildingId: bld.id,
        buildingName: bld.name,
        floorId: `flr-${bld.id}-${bulkFloorNumber}`,
        floorNumber: bulkFloorNumber,
        unitNumber: uNum,
        type: bulkType,
        areaSqft: 900,
        baseRentPaise: bulkRentPaise,
        maintenancePaise: 350000,
        depositPaise: bulkRentPaise * 3,
        status: 'VACANT',
        paymentStatus: 'VACANT',
      });
    }

    bulkAddUnits(newUnits);
    onClose();
  };

  const handleCopyFloorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    copyFloorUnits(sourceFloor, targetFloor, copyBuildingId);
    onClose();
  };

  const handleCsvImportCommit = () => {
    const validRows = csvPreviewRows.filter((r) => r.valid);
    if (!selectedBuilding) return;

    const newUnits: Omit<Unit, 'id'>[] = validRows.map((r) => ({
      organizationId: currentOrg.id,
      buildingId: selectedBuilding.id,
      buildingName: selectedBuilding.name,
      floorId: `flr-${selectedBuilding.id}-${r.floor}`,
      floorNumber: r.floor,
      unitNumber: r.unitNumber,
      type: (r.type as UnitType) || '2BHK',
      areaSqft: r.area,
      baseRentPaise: r.rent,
      maintenancePaise: 350000,
      depositPaise: r.rent * 3,
      status: 'VACANT',
      paymentStatus: 'VACANT',
    }));

    bulkAddUnits(newUnits);
    showToast(`Imported ${newUnits.length} valid units. Skipped 1 invalid row.`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Building Units"
      subtitle="Single unit, bulk generation, floor copying or CSV spreadsheet import"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Tab Selection */}
        <div className="flex border-b border-line gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'single'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-muted-text hover:text-ink'
            }`}
          >
            Single Unit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'bulk'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-muted-text hover:text-ink'
            }`}
          >
            Bulk Generate
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('copy')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'copy'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-muted-text hover:text-ink'
            }`}
          >
            Copy Floor Layout
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'csv'
                ? 'border-terracotta text-terracotta'
                : 'border-transparent text-muted-text hover:text-ink'
            }`}
          >
            CSV Import Preview
          </button>
        </div>

        {/* Tab 1: Single Unit Add */}
        {activeTab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Building
                </label>
                <select
                  value={buildingId}
                  onChange={(e) => setBuildingId(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Floor Number
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(parseInt(e.target.value) || 1)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Unit Number (e.g. 501 or A-01)
                </label>
                <input
                  type="text"
                  required
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Unit Type
                </label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as UnitType)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  <option value="1RK">1 RK</option>
                  <option value="1BHK">1 BHK</option>
                  <option value="2BHK">2 BHK</option>
                  <option value="3BHK">3 BHK</option>
                  <option value="4BHK">4 BHK</option>
                  <option value="Commercial">Commercial Office</option>
                  <option value="Shop">Retail Shop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Super Built-up Area (Sq.ft)
                </label>
                <input
                  type="number"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(parseInt(e.target.value) || 0)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MoneyInput
                label="Monthly Base Rent"
                valuePaise={baseRentPaise}
                onChangePaise={setBaseRentPaise}
                required
              />
              <MoneyInput
                label="Monthly Maintenance"
                valuePaise={maintenancePaise}
                onChangePaise={setMaintenancePaise}
              />
              <MoneyInput
                label="Security Deposit"
                valuePaise={depositPaise}
                onChangePaise={setDepositPaise}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-line">
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<PlusCircle size={16} />}>
                Save Unit
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Bulk Add */}
        {activeTab === 'bulk' && (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="p-4 bg-ground rounded-[12px] border border-line text-xs text-muted-text">
              Quickly create repetitive floor units. For example, setting prefix <strong>20</strong> and count <strong>4</strong> will generate units <strong>201, 202, 203, 204</strong>.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Target Building
                </label>
                <select
                  value={bulkBuildingId}
                  onChange={(e) => setBulkBuildingId(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Floor Number
                </label>
                <input
                  type="number"
                  value={bulkFloorNumber}
                  onChange={(e) => setBulkFloorNumber(parseInt(e.target.value) || 1)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Number of Units to create
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={bulkUnitsCount}
                  onChange={(e) => setBulkUnitsCount(parseInt(e.target.value) || 1)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Unit Number Prefix
                </label>
                <input
                  type="text"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  placeholder="e.g. 20 or A-0"
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Default Type
                </label>
                <select
                  value={bulkType}
                  onChange={(e) => setBulkType(e.target.value as UnitType)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  <option value="1BHK">1 BHK</option>
                  <option value="2BHK">2 BHK</option>
                  <option value="3BHK">3 BHK</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            <MoneyInput
              label="Default Base Rent per Unit"
              valuePaise={bulkRentPaise}
              onChangePaise={setBulkRentPaise}
              required
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-line">
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Bulk Create {bulkUnitsCount} Units
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Copy Floor Layout */}
        {activeTab === 'copy' && (
          <form onSubmit={handleCopyFloorSubmit} className="space-y-4">
            <div className="p-4 bg-ground rounded-[12px] border border-line text-xs text-muted-text">
              Duplicate an entire floor&apos;s unit configuration (unit numbers, types, area and rents) to a new floor.
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Target Building
              </label>
              <select
                value={copyBuildingId}
                onChange={(e) => setCopyBuildingId(e.target.value)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Source Floor (Copy from)
                </label>
                <input
                  type="number"
                  value={sourceFloor}
                  onChange={(e) => setSourceFloor(parseInt(e.target.value) || 1)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Destination Floor (Paste to)
                </label>
                <input
                  type="number"
                  value={targetFloor}
                  onChange={(e) => setTargetFloor(parseInt(e.target.value) || 2)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-line">
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<Copy size={16} />}>
                Execute Floor Copy
              </Button>
            </div>
          </form>
        )}

        {/* Tab 4: CSV Import Preview */}
        {activeTab === 'csv' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-text">
                Previewing parsed spreadsheet rows with real-time schema validation:
              </span>
              <span className="text-xs font-bold text-paid flex items-center gap-1">
                <CheckCircle2 size={14} /> 3 Valid / 1 Error
              </span>
            </div>

            <div className="border border-line rounded-[12px] overflow-hidden">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Unit #</th>
                    <th>Floor</th>
                    <th>Type</th>
                    <th>Area (sq.ft)</th>
                    <th>Rent</th>
                    <th>Validation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreviewRows.map((row, idx) => (
                    <tr key={idx} className={!row.valid ? 'bg-overdue/10' : ''}>
                      <td className="font-semibold">{row.unitNumber}</td>
                      <td>{row.floor}</td>
                      <td>{row.type}</td>
                      <td>{row.area}</td>
                      <td className="font-serif tnum">₹{(row.rent / 100).toLocaleString('en-IN')}</td>
                      <td>
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-xs text-paid font-semibold">
                            <CheckCircle2 size={13} /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-overdue font-semibold">
                            <AlertTriangle size={13} /> {row.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-line">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<Upload size={16} />}
                onClick={handleCsvImportCommit}
              >
                Import 3 Valid Units
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

