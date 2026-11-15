import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building, Unit } from '../types';
import { Button } from '../components/ui/Button';
import { MoneyInput } from '../components/ui/MoneyInput';
import { Building2, Layers, CreditCard, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export const OnboardingWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { currentOrg, bulkAddUnits, showToast } = useApp();

  const [step, setStep] = useState<number>(1);

  // Step 1: Building Details
  const [bldName, setBldName] = useState('Vaikunth Residency');
  const [bldAddress, setBldAddress] = useState('Survey 48/2, Kothrud');
  const [bldCity, setBldCity] = useState('Pune');
  const [bldState, setBldState] = useState('Maharashtra');
  const [bldPincode, setBldPincode] = useState('411038');

  // Step 2: Floors & Units
  const [totalFloors, setTotalFloors] = useState<number>(3);
  const [unitsPerFloor, setUnitsPerFloor] = useState<number>(3);
  const [numberingPattern, setNumberingPattern] = useState<'NUMERIC' | 'ALPHA'>('NUMERIC'); // 101 or A-01

  // Step 3: Default Commercials
  const [defaultRentPaise, setDefaultRentPaise] = useState<number>(2500000);
  const [defaultMaintPaise, setDefaultMaintPaise] = useState<number>(300000);
  const [defaultDepositPaise, setDefaultDepositPaise] = useState<number>(7500000);

  // Step 4: Bank Details
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNo, setAccountNo] = useState('50100291048123');
  const [ifsc, setIfsc] = useState('HDFC0000103');
  const [upiId, setUpiId] = useState('vaikunth@hdfcbank');

  const handleFinishWizard = () => {
    // Generate units across floors
    const generatedUnits: Omit<Unit, 'id'>[] = [];
    for (let f = 1; f <= totalFloors; f++) {
      for (let u = 1; u <= unitsPerFloor; u++) {
        const uNum = numberingPattern === 'NUMERIC' ? `${f}0${u}` : `F${f}-0${u}`;
        generatedUnits.push({
          organizationId: currentOrg.id,
          buildingId: `bld-wizard-${Date.now()}`,
          buildingName: bldName,
          floorId: `flr-w-${f}`,
          floorNumber: f,
          unitNumber: uNum,
          type: u % 2 === 0 ? '2BHK' : '1BHK',
          areaSqft: u % 2 === 0 ? 950 : 650,
          baseRentPaise: defaultRentPaise,
          maintenancePaise: defaultMaintPaise,
          depositPaise: defaultDepositPaise,
          status: 'VACANT',
          paymentStatus: 'VACANT',
        });
      }
    }

    bulkAddUnits(generatedUnits);
    showToast(`Building ${bldName} with ${generatedUnits.length} units configured!`, 'success');
    onComplete();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      <div>
        <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
          New Property Onboarding Wizard
        </h2>
        <p className="text-sm text-muted-text mt-1">
          Set up your building, floor layout, auto-generate unit numbers, and link bank details in 4 simple steps.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold select-none">
        <div
          className={`p-2.5 rounded-[10px] border ${
            step >= 1 ? 'bg-terracotta text-white border-terracotta' : 'bg-surface border-line text-muted-text'
          }`}
        >
          1. Building
        </div>
        <div
          className={`p-2.5 rounded-[10px] border ${
            step >= 2 ? 'bg-terracotta text-white border-terracotta' : 'bg-surface border-line text-muted-text'
          }`}
        >
          2. Floors & Units
        </div>
        <div
          className={`p-2.5 rounded-[10px] border ${
            step >= 3 ? 'bg-terracotta text-white border-terracotta' : 'bg-surface border-line text-muted-text'
          }`}
        >
          3. Rent & Deposits
        </div>
        <div
          className={`p-2.5 rounded-[10px] border ${
            step >= 4 ? 'bg-terracotta text-white border-terracotta' : 'bg-surface border-line text-muted-text'
          }`}
        >
          4. Bank & Settlement
        </div>
      </div>

      {/* Step Contents */}
      <div className="ledger-card">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="ledger-card-title">Building Details</h3>
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Building Name
              </label>
              <input
                type="text"
                value={bldName}
                onChange={(e) => setBldName(e.target.value)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Street Address / Plot
              </label>
              <input
                type="text"
                value={bldAddress}
                onChange={(e) => setBldAddress(e.target.value)}
                className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={bldCity}
                  onChange={(e) => setBldCity(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={bldState}
                  onChange={(e) => setBldState(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  value={bldPincode}
                  onChange={(e) => setBldPincode(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="ledger-card-title">Floors & Unit Numbering Pattern</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Total Floors
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(parseInt(e.target.value) || 1)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Units per Floor
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={unitsPerFloor}
                  onChange={(e) => setUnitsPerFloor(parseInt(e.target.value) || 1)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Numbering Schema
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setNumberingPattern('NUMERIC')}
                  className={`p-3 rounded-[10px] border text-left text-xs ${
                    numberingPattern === 'NUMERIC'
                      ? 'border-terracotta bg-terracotta/10 text-ink font-bold'
                      : 'border-line bg-surface text-muted-text'
                  }`}
                >
                  Numeric Standard (101, 102, 201, 202)
                </button>
                <button
                  type="button"
                  onClick={() => setNumberingPattern('ALPHA')}
                  className={`p-3 rounded-[10px] border text-left text-xs ${
                    numberingPattern === 'ALPHA'
                      ? 'border-terracotta bg-terracotta/10 text-ink font-bold'
                      : 'border-line bg-surface text-muted-text'
                  }`}
                >
                  Alpha-Wing Style (F1-01, F1-02, F2-01)
                </button>
              </div>
            </div>

            <div className="p-4 bg-ground rounded-[12px] border border-line text-xs">
              This layout will automatically generate <strong>{totalFloors * unitsPerFloor} units</strong> across {totalFloors} floors.
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="ledger-card-title">Default Unit Commercials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MoneyInput
                label="Default Monthly Base Rent"
                valuePaise={defaultRentPaise}
                onChangePaise={setDefaultRentPaise}
              />
              <MoneyInput
                label="Monthly Maintenance"
                valuePaise={defaultMaintPaise}
                onChangePaise={setDefaultMaintPaise}
              />
              <MoneyInput
                label="Security Deposit"
                valuePaise={defaultDepositPaise}
                onChangePaise={setDefaultDepositPaise}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="ledger-card-title">Settlement Bank Account & UPI</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  UPI VPA Handle
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full h-[44px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-6 mt-6 border-t border-line flex justify-between">
          <Button
            variant="secondary"
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
            icon={<ArrowLeft size={16} />}
          >
            Back
          </Button>

          {step < 4 ? (
            <Button
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
              icon={<ArrowRight size={16} />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleFinishWizard}
              icon={<CheckCircle2 size={16} />}
            >
              Create Building & Units
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
