/**
 * Format integer paise into Indian Rupee string (₹ XX,XX,XXX)
 * e.g., 2500000 paise -> "₹25,000"
 */
export function formatRupees(paise: number | undefined | null): string {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0';
  const rupees = Math.floor(paise / 100);
  return '₹' + rupees.toLocaleString('en-IN');
}

/**
 * Format integer paise into Indian Rupee string with paise decimals if any
 */
export function formatRupeesWithPaise(paise: number | undefined | null): string {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0.00';
  const rupees = paise / 100;
  return '₹' + rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Parse input string rupees to integer paise
 */
export function parseRupeesToPaise(rupeesStr: string | number): number {
  if (typeof rupeesStr === 'number') return Math.round(rupeesStr * 100);
  const clean = rupeesStr.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Format UTC date string to Asia/Kolkata time
 */
export function formatKolkataDate(dateStr: string | undefined | null, includeTime = false): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
    };
    return new Intl.DateTimeFormat('en-IN', options).format(d);
  } catch (e) {
    return dateStr;
  }
}

/**
 * Mask sensitive string leaving only the last 4 characters visible
 * e.g. "4590 1289 4921" -> "XXXX-XXXX-4921"
 */
export function maskSensitive(val: string | undefined | null, visibleChars = 4): string {
  if (!val) return 'XXXX';
  const clean = val.replace(/\s+/g, '');
  if (clean.length <= visibleChars) return clean;
  const maskedLength = clean.length - visibleChars;
  return 'X'.repeat(maskedLength) + clean.slice(-visibleChars);
}

