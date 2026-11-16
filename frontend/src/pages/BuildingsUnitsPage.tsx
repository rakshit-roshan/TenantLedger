import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building, Unit } from '../types';
import { formatRupees } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { StatusPill } from '../components/ui/StatusPill';
import {
  Building2,
  Home,
  Plus,
  Pencil,
  Trash2,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';

export const BuildingsUnitsPage: React.FC = () => {
  const {
    buildings,
    units,
    currentOrg,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    addUnit,
    updateUnit,
    deleteUnit,
    showToast,
  } = useApp();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(() => {
    return buildings[0]?.id || '';
  });

  // Modal States
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [deletingBuilding, setDeletingBuilding] = useState<Building | null>(null);

  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

  // Form State: Building
  const [bName, setBName] = useState('');
  const [bFloors, setBFloors] = useState<number>(3);
  const [bAddress, setBAddress] = useState(currentOrg.address || '');
  const [bCity, setBCity] = useState(currentOrg.city || 'Pune');
  const [bState, setBState] = useState(currentOrg.state || 'Maharashtra');
  const [bPincode, setBPincode] = useState(currentOrg.pincode || '411005');
  const [isSubmittingBuilding, setIsSubmittingBuilding] = useState(false);

  // Form State: Unit
  const [uNumber, setUNumber] = useState('');
  const [uFloor, setUFloor] = useState<number>(1);
  const [uType, setUType] = useState<'1BHK' | '2BHK' | '3BHK' | '1RK' | 'Commercial' | 'Shop'>('2BHK');
  const [uArea, setUArea] = useState<number>(650);
  const [uRentPaise, setURentPaise] = useState<number>(2000000);
  const [uMaintPaise, setUMaintPaise] = useState<number>(250000);
  const [uDepositPaise, setUDepositPaise] = useState<number>(6000000);
  const [uStatus, setUStatus] = useState<Unit['status']>('VACANT');
  const [isSubmittingUnit, setIsSubmittingUnit] = useState(false);

  // Active Building Selection
  const activeBuilding = buildings.find((b) => b.id === selectedBuildingId) || buildings[0];
  const activeBuildingUnits = units.filter((u) => u.buildingId === (activeBuilding?.id || ''));

  // Building Handlers
  const handleOpenAddBuilding = () => {
    setBName('');
    setBFloors(3);
    setBAddress(currentOrg.address || '');
    setBCity(currentOrg.city || 'Pune');
    setBState(currentOrg.state || 'Maharashtra');
    setBPincode(currentOrg.pincode || '411005');
    setShowAddBuildingModal(true);
  };

  const handleOpenEditBuilding = (b: Building) => {
    setEditingBuilding(b);
    setBName(b.name);
    setBFloors(b.totalFloors || 1);
    setBAddress(b.address || '');
    setBCity(b.city || '');
    setBState(b.state || '');
    setBPincode(b.pincode || '');
  };

  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim()) {
      showToast('Building name is required', 'error');
      return;
    }
    setIsSubmittingBuilding(true);
    if (editingBuilding) {
      await updateBuilding(editingBuilding.id, {
        name: bName.trim(),
        totalFloors: bFloors,
        address: bAddress.trim() || 'Main Road',
        city: bCity.trim() || 'Pune',
        state: bState.trim() || 'Maharashtra',
        pincode: bPincode.trim() || '411001',
      });
      setEditingBuilding(null);
    } else {
      const created = await addBuilding({
        name: bName.trim(),
        totalFloors: bFloors,
        address: bAddress.trim() || 'Main Road',
        city: bCity.trim() || 'Pune',
        state: bState.trim() || 'Maharashtra',
        pincode: bPincode.trim() || '411001',
      });
      if (created) {
        setSelectedBuildingId(created.id);
      }
      setShowAddBuildingModal(false);
    }
    setIsSubmittingBuilding(false);
  };

  const handleDeleteBuilding = async () => {
    if (!deletingBuilding) return;
    await deleteBuilding(deletingBuilding.id);
    setDeletingBuilding(null);
    if (selectedBuildingId === deletingBuilding.id) {
      setSelectedBuildingId(buildings.find((b) => b.id !== deletingBuilding.id)?.id || '');
    }
  };

  // Unit Handlers
  const handleOpenAddUnit = (targetBuildingId?: string) => {
    const bId = targetBuildingId || activeBuilding?.id;
    if (!bId) {
      showToast('Please add a building first', 'error');
      return;
    }
    setUNumber('');
    setUFloor(1);
    setUType('2BHK');
    setUArea(650);
    setURentPaise(2000000);
    setUMaintPaise(250000);
    setUDepositPaise(6000000);
    setUStatus('VACANT');
    setShowAddUnitModal(true);
  };

  const handleOpenEditUnit = (u: Unit) => {
    setEditingUnit(u);
    setUNumber(u.unitNumber);
    setUFloor(u.floorNumber);
    setUType((u.type as any) || '2BHK');
    setUArea(u.areaSqft);
    setURentPaise(u.baseRentPaise);
    setUMaintPaise(u.maintenancePaise);
    setUDepositPaise(u.depositPaise);
    setUStatus(u.status);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uNumber.trim()) {
      showToast('Unit number is required', 'error');
      return;
    }
    if (!activeBuilding) {
      showToast('No active building selected', 'error');
      return;
    }

    setIsSubmittingUnit(true);
    if (editingUnit) {
      await updateUnit(editingUnit.id, {
        unitNumber: uNumber.trim(),
        floorNumber: uFloor,
        type: uType,
        areaSqft: uArea,
        baseRentPaise: uRentPaise,
        maintenancePaise: uMaintPaise,
        depositPaise: uDepositPaise,
        status: uStatus,
      });
      setEditingUnit(null);
    } else {
      await addUnit({
        organizationId: currentOrg.id,
        buildingId: activeBuilding.id,
        buildingName: activeBuilding.name,
        floorId: `floor-${uFloor}`,
        floorNumber: uFloor,
        unitNumber: uNumber.trim(),
        type: uType,
        areaSqft: uArea,
        baseRentPaise: uRentPaise,
        maintenancePaise: uMaintPaise,
        depositPaise: uDepositPaise,
        status: 'VACANT',
        paymentStatus: 'VACANT',
      });
      setShowAddUnitModal(false);
    }
    setIsSubmittingUnit(false);
  };

  const handleDeleteUnit = async () => {
    if (!deletingUnit) return;
    await deleteUnit(deletingUnit.id);
    setDeletingUnit(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
            Buildings & Units Management
          </h2>
          <p className="text-sm text-muted-text mt-1">
            Configure your real estate properties, edit floor layouts, and manage individual units.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenAddBuilding}
          >
            + Add Building
          </Button>
        </div>
      </div>

      {/* Zero Buildings Empty State */}
      {buildings.length === 0 ? (
        <div className="ledger-card text-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Building2 size={32} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-ink">No Buildings Configured Yet</h3>
          <p className="text-sm text-muted-text max-w-md mx-auto mt-2">
            Get started by adding your first building. You can then add floors, units, and onboard tenants with lease agreements.
          </p>
          <div className="mt-6">
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAddBuilding}>
              Create Your First Building
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Building Tabs & Cards Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildings.map((b) => {
              const isSelected = activeBuilding?.id === b.id;
              const buildingUnitsCount = units.filter((u) => u.buildingId === b.id).length;
              const occupiedUnitsCount = units.filter((u) => u.buildingId === b.id && u.status === 'OCCUPIED').length;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBuildingId(b.id)}
                  className={`p-4 rounded-[14px] border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-surface border-terracotta shadow-warm-sm ring-2 ring-terracotta/20'
                      : 'bg-ground border-line hover:border-terracotta/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-terracotta text-white' : 'bg-surface border border-line text-ink'
                        }`}
                      >
                        <Building2 size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-base text-ink truncate leading-snug">
                          {b.name}
                        </h4>
                        <div className="text-xs text-muted-text flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={12} className="flex-shrink-0" />
                          <span className="truncate">{b.city || 'Pune'}, {b.pincode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Edit & Delete Building */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditBuilding(b);
                        }}
                        title="Edit Building"
                        className="p-1.5 rounded-[8px] text-muted-text hover:text-ink hover:bg-surface transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingBuilding(b);
                        }}
                        title="Delete Building"
                        className="p-1.5 rounded-[8px] text-muted-text hover:text-overdue hover:bg-overdue/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-line/60 text-center">
                    <div>
                      <div className="text-[10px] text-muted-text uppercase font-semibold">Floors</div>
                      <div className="text-xs font-bold text-ink mt-0.5">{b.totalFloors || 1}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-text uppercase font-semibold">Total Units</div>
                      <div className="text-xs font-bold text-ink mt-0.5">{buildingUnitsCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-text uppercase font-semibold">Occupied</div>
                      <div className="text-xs font-bold text-paid mt-0.5">
                        {occupiedUnitsCount} / {buildingUnitsCount}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Building Units Section */}
          {activeBuilding && (
            <div className="ledger-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
                <div>
                  <h3 className="ledger-card-title !mb-0 flex items-center gap-2">
                    <Home size={20} className="text-terracotta" />
                    <span>Units in {activeBuilding.name} ({activeBuildingUnits.length})</span>
                  </h3>
                  <p className="text-xs text-muted-text mt-1">
                    {activeBuilding.address}, {activeBuilding.city} • {activeBuilding.totalFloors} Floors Total
                  </p>
                </div>
                <Button
                  variant="primary"
                  icon={<Plus size={15} />}
                  onClick={() => handleOpenAddUnit(activeBuilding.id)}
                >
                  + Add Unit to {activeBuilding.name}
                </Button>
              </div>

              {activeBuildingUnits.length === 0 ? (
                <div className="text-center py-12 bg-ground rounded-[12px] border border-line">
                  <Home size={32} className="text-muted-text mx-auto mb-2" />
                  <p className="text-sm font-semibold text-ink">No units added in {activeBuilding.name} yet</p>
                  <p className="text-xs text-muted-text mt-1">Click the button below to add your first flat or unit.</p>
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      icon={<Plus size={14} />}
                      onClick={() => handleOpenAddUnit(activeBuilding.id)}
                    >
                      + Add Unit Now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs font-semibold text-muted-text uppercase tracking-wider bg-ground/50">
                        <th className="py-3 px-4">Unit #</th>
                        <th className="py-3 px-4">Floor</th>
                        <th className="py-3 px-4">Type & Area</th>
                        <th className="py-3 px-4">Monthly Rent</th>
                        <th className="py-3 px-4">Deposit</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Tenant</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {activeBuildingUnits.map((u) => (
                        <tr key={u.id} className="hover:bg-ground/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-ink">
                            Unit {u.unitNumber}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-muted-text">
                            Floor {u.floorNumber}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-ink font-medium">
                            {u.type} • {u.areaSqft} sq.ft
                          </td>
                          <td className="py-3.5 px-4 font-bold text-ink">
                            {formatRupees(u.baseRentPaise)}
                            <span className="text-[10px] text-muted-text font-normal block">
                              + {formatRupees(u.maintenancePaise)} maint
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-muted-text">
                            {formatRupees(u.depositPaise)}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusPill status={u.status} />
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            {u.currentTenantName ? (
                              <div>
                                <span className="font-bold text-ink block">{u.currentTenantName}</span>
                                <span className="text-muted-text text-[11px]">{u.currentTenantPhone}</span>
                              </div>
                            ) : (
                              <span className="text-muted-text italic">Vacant</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditUnit(u)}
                              title="Edit Unit"
                              className="p-1.5 rounded-[8px] text-muted-text hover:text-ink hover:bg-ground transition-colors inline-block"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeletingUnit(u)}
                              title="Delete Unit"
                              className="p-1.5 rounded-[8px] text-muted-text hover:text-overdue hover:bg-overdue/10 transition-colors inline-block"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add / Edit Building */}
      <Modal
        isOpen={showAddBuildingModal || editingBuilding !== null}
        onClose={() => {
          setShowAddBuildingModal(false);
          setEditingBuilding(null);
        }}
        title={editingBuilding ? `Edit ${editingBuilding.name}` : 'Add New Building'}
        subtitle="Manage building structure and address in your property portfolio"
      >
        <form onSubmit={handleSaveBuilding} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Building Name <span className="text-terracotta">*</span>
            </label>
            <input
              type="text"
              required
              value={bName}
              onChange={(e) => setBName(e.target.value)}
              placeholder="e.g. Ganesh Niwas, Shivaji Heights"
              className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Total Floors
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={bFloors}
                onChange={(e) => setBFloors(parseInt(e.target.value, 10) || 1)}
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                PIN Code
              </label>
              <input
                type="text"
                required
                value={bPincode}
                onChange={(e) => setBPincode(e.target.value)}
                placeholder="411005"
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              required
              value={bAddress}
              onChange={(e) => setBAddress(e.target.value)}
              placeholder="e.g. 104, FC Road, Shivajinagar"
              className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                required
                value={bCity}
                onChange={(e) => setBCity(e.target.value)}
                placeholder="Pune"
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                State
              </label>
              <input
                type="text"
                required
                value={bState}
                onChange={(e) => setBState(e.target.value)}
                placeholder="Maharashtra"
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-line">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddBuildingModal(false);
                setEditingBuilding(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmittingBuilding}>
              {isSubmittingBuilding ? 'Saving to Database...' : editingBuilding ? 'Update Building' : '+ Create Building'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Building Confirmation */}
      <Modal
        isOpen={deletingBuilding !== null}
        onClose={() => setDeletingBuilding(null)}
        title="Confirm Building Deletion"
        subtitle="This action will delete the building and all its units"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-[12px] bg-overdue/10 border border-overdue/30 text-overdue text-xs flex items-start gap-2.5">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong>Warning:</strong> Deleting <strong>{deletingBuilding?.name}</strong> will also permanently delete all units associated with this building.
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setDeletingBuilding(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteBuilding}>
              Yes, Delete Building
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add / Edit Unit */}
      <Modal
        isOpen={showAddUnitModal || editingUnit !== null}
        onClose={() => {
          setShowAddUnitModal(false);
          setEditingUnit(null);
        }}
        title={editingUnit ? `Edit Unit ${editingUnit.unitNumber}` : `Add Unit to ${activeBuilding?.name}`}
        subtitle="Specify unit number, floor, configuration, and standard monthly rent"
      >
        <form onSubmit={handleSaveUnit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Unit / Flat Number <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={uNumber}
                onChange={(e) => setUNumber(e.target.value)}
                placeholder="e.g. 101, 202, Flat B"
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Floor Number
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={uFloor}
                onChange={(e) => setUFloor(parseInt(e.target.value, 10) || 0)}
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Unit Type
              </label>
              <select
                value={uType}
                onChange={(e) => setUType(e.target.value as any)}
                className="w-full h-[44px] px-3 rounded-[10px] bg-ground border border-line text-sm text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                <option value="1RK">1 RK</option>
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="Commercial">Commercial / Office</option>
                <option value="Shop">Retail Shop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Carpet Area (sq.ft)
              </label>
              <input
                type="number"
                min="100"
                value={uArea}
                onChange={(e) => setUArea(parseInt(e.target.value, 10) || 500)}
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={uRentPaise / 100}
                onChange={(e) => setURentPaise((parseFloat(e.target.value) || 0) * 100)}
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Maintenance (₹)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={uMaintPaise / 100}
                onChange={(e) => setUMaintPaise((parseFloat(e.target.value) || 0) * 100)}
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={uDepositPaise / 100}
                onChange={(e) => setUDepositPaise((parseFloat(e.target.value) || 0) * 100)}
                className="w-full h-[44px] px-3.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          {editingUnit && (
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Occupancy Status
              </label>
              <select
                value={uStatus}
                onChange={(e) => setUStatus(e.target.value as any)}
                className="w-full h-[44px] px-3 rounded-[10px] bg-ground border border-line text-sm text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                <option value="VACANT">VACANT</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="NOTICE_SERVED">NOTICE SERVED</option>
                <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-4 border-t border-line">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddUnitModal(false);
                setEditingUnit(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmittingUnit}>
              {isSubmittingUnit ? 'Saving to Database...' : editingUnit ? 'Update Unit' : '+ Add Unit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Unit Confirmation */}
      <Modal
        isOpen={deletingUnit !== null}
        onClose={() => setDeletingUnit(null)}
        title="Confirm Unit Deletion"
        subtitle="This action will remove the unit from the building"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-[12px] bg-overdue/10 border border-overdue/30 text-overdue text-xs flex items-start gap-2.5">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              Are you sure you want to delete <strong>Unit {deletingUnit?.unitNumber}</strong>?
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setDeletingUnit(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUnit}>
              Yes, Delete Unit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
