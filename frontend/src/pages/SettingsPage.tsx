import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { User, Building, CreditCard, UploadCloud } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, currentOrg, updateOwnerProfile, updateOrgDetails } = useApp();

  // Owner profile form
  const [ownerName, setOwnerName] = useState(currentUser.name);
  const [ownerEmail, setOwnerEmail] = useState(currentUser.email);
  const [ownerPhone, setOwnerPhone] = useState(currentUser.phone);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser.avatar || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Org details form
  const [orgName, setOrgName] = useState(currentOrg.name);
  const [pan, setPan] = useState(currentOrg.pan);
  const [gstin, setGstin] = useState(currentOrg.gstin || '');
  const [rera, setRera] = useState(currentOrg.rera || '');
  const [address, setAddress] = useState(currentOrg.address);
  const [city, setCity] = useState(currentOrg.city);
  const [state, setState] = useState(currentOrg.state);
  const [pincode, setPincode] = useState(currentOrg.pincode);

  // Bank details
  const [bankName, setBankName] = useState(currentOrg.bankName || 'HDFC Bank, FC Road');
  const [accountNo, setAccountNo] = useState(currentOrg.accountNumberMasked || 'XXXX-XXXX-8921');
  const [ifsc, setIfsc] = useState(currentOrg.ifscCode || 'HDFC0000103');
  const [upiVpa, setUpiVpa] = useState('shreeganesh@hdfcbank');
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  useEffect(() => {
    setOwnerName(currentUser.name);
    setOwnerEmail(currentUser.email);
    setOwnerPhone(currentUser.phone);
    if (currentUser.avatar) setAvatarPreview(currentUser.avatar);
  }, [currentUser]);

  useEffect(() => {
    setOrgName(currentOrg.name);
    setPan(currentOrg.pan);
    setGstin(currentOrg.gstin || '');
    setRera(currentOrg.rera || '');
    setAddress(currentOrg.address);
    setCity(currentOrg.city);
    setState(currentOrg.state);
    setPincode(currentOrg.pincode);
    if (currentOrg.bankName) setBankName(currentOrg.bankName);
    if (currentOrg.accountNumberMasked) setAccountNo(currentOrg.accountNumberMasked);
    if (currentOrg.ifscCode) setIfsc(currentOrg.ifscCode);
  }, [currentOrg]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await updateOwnerProfile({
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      avatarUrl: avatarPreview || undefined,
    });
    setIsSavingProfile(false);
  };

  const handleSaveOrgAndBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOrg(true);
    await updateOrgDetails({
      name: orgName,
      pan,
      gstin,
      rera,
      address,
      city,
      state,
      pincode,
      bankName,
      accountNumberMasked: accountNo,
      ifscCode: ifsc,
    });
    setIsSavingOrg(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      <div>
        <h2 className="font-serif text-[28px] sm:text-[32px] text-ink leading-tight">
          Owner & Organization Settings
        </h2>
        <p className="text-sm text-muted-text mt-1">
          Manage your personal profile, contact information, legal estate organization, and settlement bank accounts.
        </p>
      </div>

      {/* 1. Owner Personal Profile & Photo */}
      <div className="ledger-card">
        <h3 className="ledger-card-title flex items-center gap-2">
          <User size={20} className="text-terracotta" />
          <span>Owner Personal Profile</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-ground rounded-[12px] border border-line">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-surface border-2 border-line overflow-hidden flex items-center justify-center text-terracotta font-serif text-2xl font-bold shadow-sm">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  ownerName.slice(0, 2).toUpperCase()
                )}
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <span className="text-xs font-bold text-ink block">Profile Photo</span>
              <p className="text-xs text-muted-text">
                JPG, PNG or WEBP up to 5MB. Displayed on tenant receipts and messages.
              </p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-surface border border-line text-xs font-semibold text-ink cursor-pointer hover:bg-ground transition-colors mt-2">
                <UploadCloud size={14} className="text-terracotta" />
                <span>Upload New Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving to Database...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Organization Details & Business KYC */}
      <div className="ledger-card">
        <h3 className="ledger-card-title flex items-center gap-2">
          <Building size={20} className="text-terracotta" />
          <span>Organization & Tax Details</span>
        </h3>

        <form onSubmit={handleSaveOrgAndBank} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Organization / Firm Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                required
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium uppercase font-mono focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="27AAACS4819M1Z5"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium uppercase font-mono focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                MahaRERA Project / Agent Reg. No.
              </label>
              <input
                type="text"
                value={rera}
                onChange={(e) => setRera(e.target.value)}
                placeholder="P52100024891"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium font-mono focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Tenant Isolation Code
              </label>
              <input
                type="text"
                disabled
                value={currentOrg.code}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground/50 border border-line text-sm text-muted-text font-mono cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                Registered Office Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                State
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                PIN Code
              </label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium font-mono focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          {/* 3. Settlement Bank & UPI Account */}
          <div className="pt-6 border-t border-line space-y-4">
            <h4 className="font-serif text-lg text-ink flex items-center gap-2">
              <CreditCard size={18} className="text-terracotta" />
              <span>Rent Settlement Bank Account</span>
            </h4>
            <p className="text-xs text-muted-text">
              Bank details where collected rent, maintenance, and advance security deposits are credited.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Bank Name & Branch
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-medium focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  required
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-mono uppercase focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  UPI VPA (QR Code handle)
                </label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-ground border border-line text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-line">
            <Button type="submit" variant="primary" disabled={isSavingOrg}>
              {isSavingOrg ? 'Saving to Database...' : 'Save Organization & Settlement Bank Details'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
