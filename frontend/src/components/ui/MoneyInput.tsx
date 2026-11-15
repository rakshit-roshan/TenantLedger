import React, { useState, useEffect } from 'react';
import { parseRupeesToPaise } from '../../utils/formatters';

interface MoneyInputProps {
  label: string;
  valuePaise: number;
  onChangePaise: (paise: number) => void;
  required?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  label,
  valuePaise,
  onChangePaise,
  required = false,
  helperText,
  error,
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(
    valuePaise ? Math.floor(valuePaise / 100).toString() : ''
  );

  useEffect(() => {
    setDisplayValue(valuePaise ? Math.floor(valuePaise / 100).toString() : '');
  }, [valuePaise]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const paise = parseRupeesToPaise(raw);
    onChangePaise(paise);
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-muted-text uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-terracotta">*</span>}
      </label>
      <div className="relative rounded-[10px] shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <span className="text-muted-text font-serif text-lg font-bold">₹</span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          className={`block w-full min-h-[44px] rounded-[10px] border pl-9 pr-14 text-sm font-semibold text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-terracotta tnum ${
            error ? 'border-overdue' : 'border-line'
          } ${disabled ? 'opacity-60 bg-ground/50 cursor-not-allowed' : ''}`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-xs text-muted-text font-medium">INR</span>
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-overdue">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-muted-text">{helperText}</p>
      ) : null}
    </div>
  );
};

