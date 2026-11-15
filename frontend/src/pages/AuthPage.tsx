import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Mail, Lock, User, Phone, LogIn, UserPlus, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC<{ onSuccessfulAuth?: () => void }> = ({ onSuccessfulAuth }) => {
  const { loginWithApi, registerWithApi, showToast } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state (Email & Password only)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state (First Name, Last Name, Email, Mobile with validation, Password)
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Validation errors
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Standard Indian 10-digit phone validation
  const validatePhone = (value: string): boolean => {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    let core10 = digitsOnly;
    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      core10 = digitsOnly.substring(2);
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
      core10 = digitsOnly.substring(1);
    }

    if (!core10) {
      setPhoneError('Mobile number is required');
      return false;
    }
    if (core10.length !== 10) {
      setPhoneError('Please enter a 10-digit mobile number');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(core10)) {
      setPhoneError('Mobile number must start with 6, 7, 8, or 9');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits and spaces only
    const clean = raw.replace(/[^\d\s]/g, '');
    setRegPhone(clean);
    if (clean.replace(/\s/g, '').length >= 10) {
      validatePhone(clean);
    } else {
      setPhoneError(null);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast('Please enter your email and password', 'error');
      return;
    }

    setIsSubmitting(true);
    const ok = await loginWithApi(loginEmail.trim(), loginPassword.trim());
    setIsSubmitting(false);
    if (ok && onSuccessfulAuth) {
      onSuccessfulAuth();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFirstName.trim()) {
      showToast('Please enter your first name', 'error');
      return;
    }
    if (!regLastName.trim()) {
      showToast('Please enter your last name', 'error');
      return;
    }
    if (!regEmail.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }

    const isPhoneValid = validatePhone(regPhone);
    if (!isPhoneValid) {
      showToast('Please enter a valid 10-digit Indian mobile number', 'error');
      return;
    }

    if (regPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError(null);

    setIsSubmitting(true);
    const ok = await registerWithApi({
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword,
    });
    setIsSubmitting(false);

    if (ok && onSuccessfulAuth) {
      onSuccessfulAuth();
    }
  };

  return (
    <div className="min-h-screen bg-ground flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-terracotta selection:text-white">
      {/* Top Header / Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-terracotta/10 border border-line flex items-center justify-center mx-auto shadow-md p-1.5">
          <img
            src="/logo.png"
            alt="Gharkhata Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <h1 className="mt-3 font-serif text-3xl font-normal text-ink tracking-tight">
          Gharkhata (घरखाता)
        </h1>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted-text font-semibold">
          Multi-Tenant Rent Management Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-7 px-6 shadow-float border border-line sm:rounded-[20px] sm:px-9">
          {/* Navigation Tabs: Sign In vs Register */}
          <div className="flex border-b border-line mb-6">
            <button
              onClick={() => {
                setMode('LOGIN');
                setPhoneError(null);
                setPasswordError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                mode === 'LOGIN'
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-muted-text hover:text-ink'
              }`}
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              onClick={() => {
                setMode('REGISTER');
                setPhoneError(null);
                setPasswordError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                mode === 'REGISTER'
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-muted-text hover:text-ink'
              }`}
            >
              <UserPlus size={16} /> Register as Owner
            </button>
          </div>

          {mode === 'LOGIN' ? (
            /* Sign In Form (Production Real Authentication) */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full h-[42px] pl-9 pr-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full h-[42px] pl-9 pr-10 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-ink p-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>

              <div className="pt-3 text-center">
                <p className="text-xs text-muted-text">
                  New property owner?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('REGISTER')}
                    className="text-terracotta font-semibold hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Registration Form (First Name, Last Name, Email, Mobile with validation, Password) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Separate First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                    First Name <span className="text-terracotta">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full h-[40px] pl-8 pr-2.5 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                    <User
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                    Last Name <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="e.g. Kulkarni"
                    className="w-full h-[40px] px-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                  Email Address <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    autoComplete="email"
                    className="w-full h-[40px] pl-8 pr-3 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                  <Mail
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
                  />
                </div>
              </div>

              {/* Mobile Phone Number with Standard Indian Validation */}
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                  Mobile Number <span className="text-terracotta">*</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-[10px] border border-r-0 border-line bg-ground text-ink text-xs font-bold font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={regPhone}
                    onChange={handlePhoneChange}
                    onBlur={() => regPhone && validatePhone(regPhone)}
                    placeholder="98220 11223"
                    className={`w-full h-[40px] px-3 rounded-r-[10px] border bg-surface text-ink text-sm font-medium focus:outline-none focus:ring-2 ${
                      phoneError
                        ? 'border-overdue focus:ring-overdue'
                        : 'border-line focus:ring-terracotta'
                    }`}
                  />
                </div>
                {phoneError ? (
                  <p className="text-[11px] text-overdue mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {phoneError}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-text mt-1">
                    Standard 10-digit Indian mobile number (e.g. 9822011223)
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                  Password <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="At least 6 characters"
                    className="w-full h-[40px] pl-8 pr-10 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                  <Lock
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-ink p-1"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="Re-enter password"
                    className="w-full h-[40px] pl-8 pr-10 rounded-[10px] border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                  <Lock
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-ink p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-overdue mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} /> {passwordError}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Creating Owner Account...' : 'Register as Property Owner'}
                </Button>
              </div>

              <div className="p-2.5 rounded-[10px] bg-ground border border-line text-[11px] text-muted-text flex items-start gap-2">
                <ShieldCheck size={16} className="text-terracotta shrink-0 mt-0.5" />
                <span>
                  Each owner receives an isolated tenant environment. Your buildings, units, tenants, and rental ledgers are strictly private and isolated.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
