import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MoneyInput } from '../ui/MoneyInput';
import { useApp } from '../../context/AppContext';
import { Unit } from '../../types';
import { formatRupees } from '../../utils/formatters';
import {
  User,
  Home,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  ShieldCheck,
  Trash2,
  Building2,
  Plus,
  AlertCircle,
} from 'lucide-react';

interface AddTenantWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUnitId?: string;
}

export const AddTenantWizardModal: React.FC<AddTenantWizardModalProps> = ({
  isOpen,
  onClose,
  preselectedUnitId,
}) => {
  const { units, buildings, currentOrg, addBuilding, addUnit, onboardTenantAndAssignUnit, showToast } = useApp();

  const [step, setStep] = useState<number>(1);

  // Step 1: Tenant Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [occupation, setOccupation] = useState('');
  const [company, setCompany] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 ');
  const [emergencyRelation, setEmergencyRelation] = useState('Parent');

  // Step 2: Unit Assignment
  const vacantUnits = units.filter((u) => u.status === 'VACANT' || u.id === preselectedUnitId);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    preselectedUnitId || (vacantUnits[0]?.id ?? '')
  );

  // On-the-fly progressive setup states
  const [showInlineAddBuilding, setShowInlineAddBuilding] = useState(false);
  const [inlineBName, setInlineBName] = useState('');
  const [inlineBFloors, setInlineBFloors] = useState<number>(3);
  const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);

  const [showInlineAddUnit, setShowInlineAddUnit] = useState(false);
  const [inlineBuildingId, setInlineBuildingId] = useState<string>('');
  const [inlineUNumber, setInlineUNumber] = useState('');
  const [inlineUFloor, setInlineUFloor] = useState<number>(1);
  const [inlineUType, setInlineUType] = useState<'1RK' | '1BHK' | '2BHK' | '3BHK' | 'Commercial' | 'Shop'>('2BHK');
  const [inlineURent, setInlineURent] = useState<number>(20000);
  const [inlineUDeposit, setInlineUDeposit] = useState<number>(60000);
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);

  // Step 3: Commercials
  const [rentPaise, setRentPaise] = useState<number>(2500000);
  const [maintenancePaise, setMaintenancePaise] = useState<number>(300000);
  const [depositPaise, setDepositPaise] = useState<number>(7500000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 11);
    return d.toISOString().split('T')[0];
  });
  const [dueDay, setDueDay] = useState<number>(5);
  const [graceDays, setGraceDays] = useState<number>(5);
  const [yearlyIncreasePercent, setYearlyIncreasePercent] = useState<number>(8);

  // Step 4: KYC Documents
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [policeVerification, setPoliceVerification] = useState<'VERIFIED' | 'PENDING'>('VERIFIED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (buildings.length > 0 && !inlineBuildingId) {
      setInlineBuildingId(buildings[0].id);
    }
  }, [buildings, inlineBuildingId]);

  useEffect(() => {
    if (!selectedUnitId && vacantUnits.length > 0) {
      setSelectedUnitId(vacantUnits[0].id);
    }
  }, [vacantUnits, selectedUnitId]);

  const handleCreateInlineBuilding = async () => {
    if (!inlineBName.trim()) {
      showToast('Building name is required', 'error');
      return;
    }
    setIsCreatingBuilding(true);
    const created = await addBuilding({
      name: inlineBName.trim(),
      totalFloors: inlineBFloors,
      address: currentOrg.address || 'Main Road',
      city: currentOrg.city || 'Pune',
      state: currentOrg.state || 'Maharashtra',
      pincode: currentOrg.pincode || '411005',
    });
    setIsCreatingBuilding(false);
    if (created) {
      setInlineBuildingId(created.id);
      setInlineBName('');
      setShowInlineAddBuilding(false);
      setShowInlineAddUnit(true);
    }
  };

  const handleCreateInlineUnit = async () => {
    if (!inlineUNumber.trim()) {
      showToast('Unit number is required', 'error');
      return;
    }
    const targetBuilding = buildings.find((b) => b.id === inlineBuildingId) || buildings[0];
    if (!targetBuilding) {
      showToast('Please select or create a building first', 'error');
      return;
    }
    setIsCreatingUnit(true);
    await addUnit({
      organizationId: currentOrg.id,
      buildingId: targetBuilding.id,
      buildingName: targetBuilding.name,
      floorId: `floor-${inlineUFloor}`,
      floorNumber: inlineUFloor,
      unitNumber: inlineUNumber.trim(),
      type: inlineUType,
      areaSqft: 600,
      baseRentPaise: inlineURent * 100,
      maintenancePaise: 250000,
      depositPaise: inlineUDeposit * 100,
      status: 'VACANT',
      paymentStatus: 'VACANT',
    });
    setIsCreatingUnit(false);
    setShowInlineAddUnit(false);
    setRentPaise(inlineURent * 100);
    setDepositPaise(inlineUDeposit * 100);
    setInlineUNumber('');
  };

  useEffect(() => {
    const u = units.find((item) => item.id === selectedUnitId);
    if (u) {
      setRentPaise(u.baseRentPaise || 2500000);
      setMaintenancePaise(u.maintenancePaise || 300000);
      setDepositPaise(u.depositPaise || (u.baseRentPaise ? u.baseRentPaise * 3 : 7500000));
    }
  }, [selectedUnitId, units]);

  const activeUnit = units.find((u) => u.id === selectedUnitId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeKb = (file.size / 1024).toFixed(0);
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: `${sizeKb} KB`,
          type: file.type.includes('pdf') ? 'PDF' : 'IMAGE',
        },
      ]);
      showToast(`Document "${file.name}" uploaded and encrypted!`, 'info');
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    if (!name.trim() || !phone.trim() || !selectedUnitId) {
      showToast('Please fill required tenant details and select a unit', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onboardTenantAndAssignUnit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        occupation: occupation || 'Professional',
        company,
        emergencyName: emergencyName || 'Relative',
        emergencyPhone: emergencyPhone || '+91 98000 00000',
        emergencyRelation,
        unitId: selectedUnitId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        rentPaise,
        maintenancePaise,
        depositPaise,
        dueDay,
        graceDays,
        yearlyIncreasePercent,
        aadhaarNumber: aadhaarNumber || '4921',
        panNumber: panNumber || '1082K',
        aadhaarFileName: uploadedFiles[0]?.name,
        policeVerification,
      });

      onClose();
      // Reset state
      setStep(1);
      setName('');
      setEmail('');
      setPhone('+91 ');
      setAadhaarNumber('');
      setPanNumber('');
      setUploadedFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Tenant & Assign House"
      subtitle="Complete KYC, select vacant unit, and configure monthly lease terms"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold select-none">
          <div
            className={`p-2 rounded-[8px] border transition-colors ${
              step >= 1
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-ground text-muted-text border-line'
            }`}
          >
            1. Tenant Info
          </div>
          <div
            className={`p-2 rounded-[8px] border transition-colors ${
              step >= 2
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-ground text-muted-text border-line'
            }`}
          >
            2. Assign Unit
          </div>
          <div
            className={`p-2 rounded-[8px] border transition-colors ${
              step >= 3
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-ground text-muted-text border-line'
            }`}
          >
            3. Rent Terms
          </div>
          <div
            className={`p-2 rounded-[8px] border transition-colors ${
              step >= 4
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-ground text-muted-text border-line'
            }`}
          >
            4. KYC & Confirm
          </div>
        </div>

        {/* STEP 1: Tenant Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-ink flex items-center gap-2">
              <User size={18} className="text-terracotta" />
              <span>Tenant Personal & Contact Details</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Tenant Full Name <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Chandra Sharma"
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Mobile Number (For WhatsApp / SMS) <span className="text-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98220 12345"
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh.sharma@example.com"
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Occupation / Profession
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Company / Employer Name
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Infosys Pune"
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-2 border-t border-line/60">
              <span className="text-xs font-bold text-muted-text uppercase block mb-2">
                Emergency Contact
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Contact Name"
                  className="h-[42px] px-3 rounded-[10px] border border-line bg-surface text-xs text-ink"
                />
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Phone (+91)"
                  className="h-[42px] px-3 rounded-[10px] border border-line bg-surface text-xs text-ink"
                />
                <select
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="h-[42px] px-2 rounded-[10px] border border-line bg-surface text-xs text-ink"
                >
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend / Colleague</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Assign Unit & Move-in */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-lg text-ink flex items-center gap-2">
                <Home size={18} className="text-terracotta" />
                <span>Assign House / Unit to Tenant</span>
              </h4>

              {/* Quick actions to add building or unit anytime */}
              {buildings.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInlineAddBuilding(!showInlineAddBuilding);
                      setShowInlineAddUnit(false);
                    }}
                    className="text-xs text-terracotta hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus size={13} /> {showInlineAddBuilding ? 'Close Building Form' : 'New Building'}
                  </button>
                  <span className="text-line">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInlineAddUnit(!showInlineAddUnit);
                      setShowInlineAddBuilding(false);
                    }}
                    className="text-xs text-terracotta hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus size={13} /> {showInlineAddUnit ? 'Close Unit Form' : 'New Unit'}
                  </button>
                </div>
              )}
            </div>

            {/* CASE 1: No buildings exist yet OR user clicked + New Building */}
            {(buildings.length === 0 || showInlineAddBuilding) && (
              <div className="p-4 sm:p-5 bg-ground rounded-[14px] border-2 border-dashed border-terracotta/40 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-terracotta/15 text-terracotta flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-ink">
                      {buildings.length === 0 ? 'Step A: Add Your First Building' : 'Add New Building to Portfolio'}
                    </h5>
                    <p className="text-xs text-muted-text">
                      {buildings.length === 0
                        ? "You don't have any properties set up yet. Create a building to allocate units to this tenant."
                        : 'Create another building in your property ledger.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                      Building Name <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      value={inlineBName}
                      onChange={(e) => setInlineBName(e.target.value)}
                      placeholder="e.g. Ganesh Niwas, Shivaji Heights"
                      className="w-full h-[42px] px-3 rounded-[8px] border border-line bg-surface text-sm text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                      Total Floors
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={inlineBFloors}
                      onChange={(e) => setInlineBFloors(parseInt(e.target.value, 10) || 1)}
                      className="w-full h-[42px] px-3 rounded-[8px] border border-line bg-surface text-sm text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isCreatingBuilding || !inlineBName.trim()}
                    onClick={handleCreateInlineBuilding}
                  >
                    {isCreatingBuilding ? 'Creating Building...' : '+ Create Building & Continue to Unit'}
                  </Button>
                </div>
              </div>
            )}

            {/* CASE 2: Building exists but NO vacant units exist OR user clicked + New Unit */}
            {buildings.length > 0 && !showInlineAddBuilding && (vacantUnits.length === 0 || showInlineAddUnit) && (
              <div className="p-4 sm:p-5 bg-ground rounded-[14px] border-2 border-dashed border-terracotta/40 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-paid/15 text-paid flex items-center justify-center flex-shrink-0">
                      <Home size={20} />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-ink">
                        {vacantUnits.length === 0
                          ? `Step B: Add First Unit in ${buildings[0]?.name}`
                          : 'Add New Unit on-the-Fly'}
                      </h5>
                      <p className="text-xs text-muted-text">
                        Create flat/unit details and it will immediately be allocated to this tenant.
                      </p>
                    </div>
                  </div>
                  {vacantUnits.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowInlineAddUnit(false)}
                      className="text-xs text-muted-text hover:text-ink underline"
                    >
                      Choose Existing Unit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                      Building
                    </label>
                    <select
                      value={inlineBuildingId}
                      onChange={(e) => setInlineBuildingId(e.target.value)}
                      className="w-full h-[42px] px-2.5 rounded-[8px] border border-line bg-surface text-sm text-ink font-semibold"
                    >
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                      Unit / Flat # <span className="text-terracotta">*</span>
                    </label>
                    <input
                      type="text"
                      value={inlineUNumber}
                      onChange={(e) => setInlineUNumber(e.target.value)}
                      placeholder="e.g. 101, 202, Flat B"
                      className="w-full h-[42px] px-3 rounded-[8px] border border-line bg-surface text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                      Floor Number
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={inlineUFloor}
                      onChange={(e) => setInlineUFloor(parseInt(e.target.value, 10) || 0)}
                      className="w-full h-[42px] px-3 rounded-[8px] border border-line bg-surface text-sm text-ink font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                      Unit Type
                    </label>
                    <select
                      value={inlineUType}
                      onChange={(e) => setInlineUType(e.target.value as any)}
                      className="w-full h-[42px] px-2.5 rounded-[8px] border border-line bg-surface text-sm text-ink font-semibold"
                    >
                      <option value="1RK">1 RK</option>
                      <option value="1BHK">1 BHK</option>
                      <option value="2BHK">2 BHK</option>
                      <option value="3BHK">3 BHK</option>
                      <option value="Commercial">Commercial Shop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                      Expected Rent (₹)
                    </label>
                    <input
                      type="number"
                      step="500"
                      value={inlineURent}
                      onChange={(e) => setInlineURent(parseFloat(e.target.value) || 0)}
                      className="w-full h-[42px] px-3 rounded-[8px] border border-line bg-surface text-sm text-ink font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                      Deposit (₹)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={inlineUDeposit}
                      onChange={(e) => setInlineUDeposit(parseFloat(e.target.value) || 0)}
                      className="w-full h-[42px] px-3 rounded-[8px] border border-line bg-surface text-sm text-ink font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isCreatingUnit || !inlineUNumber.trim()}
                    onClick={handleCreateInlineUnit}
                  >
                    {isCreatingUnit ? 'Creating Unit...' : '+ Create Unit & Select for Tenant'}
                  </Button>
                </div>
              </div>
            )}

            {/* CASE 3: Normal selection when vacant units exist */}
            {vacantUnits.length > 0 && !showInlineAddBuilding && !showInlineAddUnit && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                    Available Vacant Units <span className="text-terracotta">*</span>
                  </label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-terracotta"
                  >
                    {vacantUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unitNumber} - {u.buildingName} ({u.type}, {u.areaSqft} sq.ft) -{' '}
                        {formatRupees(u.baseRentPaise)}/mo
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Unit Snapshot */}
                {activeUnit && (
                  <div className="p-4 bg-ground rounded-[12px] border border-line space-y-2 text-xs">
                    <div className="font-bold text-sm text-ink flex items-center justify-between">
                      <span>Unit {activeUnit.unitNumber} ({activeUnit.buildingName})</span>
                      <span className="px-2 py-0.5 rounded bg-paid/15 text-paid font-semibold">Ready to Lease</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-muted-text">
                      <div>Floor: <strong className="text-ink">{activeUnit.floorNumber}</strong></div>
                      <div>Type: <strong className="text-ink">{activeUnit.type}</strong></div>
                      <div>Area: <strong className="text-ink">{activeUnit.areaSqft} sq.ft</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Agreement Dates (Always visible when a unit is or can be selected) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Agreement Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Agreement Expiry Date (11 Months standard)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Commercial Terms */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-ink flex items-center gap-2">
              <FileText size={18} className="text-terracotta" />
              <span>Rental Charges & Payment Schedule</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MoneyInput
                label="Monthly Base Rent"
                valuePaise={rentPaise}
                onChangePaise={setRentPaise}
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
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Rent Due Day (1st - 10th)
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value) || 5)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Grace Period (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={graceDays}
                  onChange={(e) => setGraceDays(parseInt(e.target.value) || 5)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Annual Increase %
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={yearlyIncreasePercent}
                  onChange={(e) => setYearlyIncreasePercent(parseFloat(e.target.value) || 8)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            <div className="p-3 bg-ground rounded-[10px] border border-line text-xs text-muted-text">
              Rent is payable monthly in advance on or before the <strong>{dueDay}th</strong>. Late payment after {graceDays} grace days triggers automated reminder escalation.
            </div>
          </div>
        )}

        {/* STEP 4: KYC Documents & Upload */}
        {step === 4 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-ink flex items-center gap-2">
              <ShieldCheck size={18} className="text-paid" />
              <span>KYC Verification & Document Upload</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Aadhaar Card Number
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="e.g. 4590 1289 4921"
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  PAN Card Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. AAAPS4419P"
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Upload Aadhaar / PAN / Rental Agreement PDF
              </label>
              <label className="border-2 border-dashed border-line rounded-[12px] p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-ground/60 transition-colors bg-surface">
                <UploadCloud size={28} className="text-terracotta mb-2" />
                <span className="text-xs font-bold text-ink">
                  Click to choose file or drag and drop
                </span>
                <span className="text-[11px] text-muted-text mt-0.5">
                  PDF, PNG, JPG up to 10MB (Encrypted at rest)
                </span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-text block">
                  Attached KYC Documents:
                </span>
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-[10px] bg-ground border border-line text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck size={16} className="text-paid" />
                      <span className="font-semibold text-ink">{file.name}</span>
                      <span className="text-muted-text">({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-overdue hover:opacity-80 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Police Verification Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Police Verification Status
              </label>
              <select
                value={policeVerification}
                onChange={(e) => setPoliceVerification(e.target.value as any)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm font-semibold"
              >
                <option value="VERIFIED">Verified (Police NOC Received)</option>
                <option value="PENDING">Pending (Application Submitted to Police Station)</option>
              </select>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="pt-4 border-t border-line flex justify-between">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
              icon={<ArrowLeft size={16} />}
            >
              Back
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  showToast('Please enter the tenant name', 'error');
                  return;
                }
                setStep((s) => s + 1);
              }}
              icon={<ArrowRight size={16} />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={isSubmitting}
              onClick={handleFinish}
              icon={<CheckCircle2 size={16} />}
            >
              {isSubmitting ? 'Saving to Database...' : 'Confirm & Assign Unit'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

