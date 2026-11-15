import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { PaymentReceipt, Organization, Lease, Tenant, Unit } from '../types';
import { formatRupees, formatKolkataDate } from './formatters';

export function generateReceiptPdf(receipt: PaymentReceipt, org: Organization) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a5',
    orientation: 'portrait',
  });

  // Warm theme header matching Gharkhata brand
  doc.setFillColor(42, 31, 23); // #2A1F17
  doc.rect(0, 0, 148, 24, 'F');

  doc.setTextColor(239, 228, 210); // #EFE4D2
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GHARKHATA (घरखाता)', 12, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Rent Payment Receipt', 12, 18);

  doc.setTextColor(42, 31, 23);
  doc.setFontSize(10);
  doc.text(`Receipt No: ${receipt.receiptNumber}`, 12, 34);
  doc.text(`Date: ${formatKolkataDate(receipt.paymentDate, true)}`, 12, 40);
  doc.text(`Status: ${receipt.status}`, 12, 46);

  doc.setFont('helvetica', 'bold');
  doc.text(`Organisation: ${org.name}`, 80, 34);
  doc.setFont('helvetica', 'normal');
  doc.text(`PAN: ${org.pan || '-'}`, 80, 40);
  if (org.gstin) doc.text(`GSTIN: ${org.gstin}`, 80, 46);

  // Divider
  doc.setDrawColor(221, 207, 184); // #DDCFB8
  doc.setLineWidth(0.5);
  doc.line(12, 50, 136, 50);

  // Table
  autoTable(doc, {
    startY: 55,
    head: [['Particulars', 'Details']],
    body: [
      ['Tenant Name', receipt.tenantName],
      ['Building & Unit', `${receipt.buildingName} - Unit ${receipt.unitNumber}`],
      ['Payment Mode', receipt.paymentMethod.replace('_', ' ')],
      ['Reference / UTR', receipt.referenceNumber || 'N/A'],
      ['Amount Paid', formatRupees(receipt.amountPaise)],
      ['Recorded By', receipt.recordedBy],
      ['Notes / Remarks', receipt.notes || 'Rent & maintenance paid.'],
    ],
    theme: 'plain',
    headStyles: {
      fillColor: [244, 236, 223],
      textColor: [42, 31, 23],
      fontStyle: 'bold',
    },
    styles: {
      textColor: [42, 31, 23],
      cellPadding: 3,
      fontSize: 9,
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 130;

  // Stamp / Signature section
  doc.setFontSize(8);
  doc.setTextColor(94, 78, 65);
  doc.text('This is a computer-generated, immutable receipt from Gharkhata Ledger.', 12, finalY + 15);
  doc.text('Authorized Signatory / Landlord Stamp', 80, finalY + 25);
  doc.line(80, finalY + 22, 136, finalY + 22);

  doc.save(`Receipt_${receipt.receiptNumber.replace(/[\/\\]/g, '_')}.pdf`);
}

export function generateAgreementDraftPdf(lease: Lease, tenant: Tenant, unit: Unit, org: Organization) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.text('RESIDENTIAL / COMMERCIAL LEASE AGREEMENT (DRAFT)', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('times', 'italic');
  doc.text('(Subject to Stamp Duty and Registration under applicable Indian State Laws)', 105, 26, { align: 'center' });

  doc.setDrawColor(42, 31, 23);
  doc.line(20, 30, 190, 30);

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  const text = `
This Lease Agreement is executed on this ${formatKolkataDate(lease.startDate)} by and between:

LESSOR / LANDLORD:
${org.name}, having registered office/address at: ${org.address}, ${org.city}, ${org.state} - ${org.pincode}, PAN: ${org.pan} (hereinafter referred to as the 'Owner/Lessor').

AND

LESSEE / TENANT:
Mr./Ms. ${tenant.name}, Occupation: ${tenant.occupation}, Contact: ${tenant.phone}, Email: ${tenant.email} (hereinafter referred to as the 'Tenant/Lessee').

WHEREAS the Lessor is the absolute and lawful owner of Premises: Unit ${unit.unitNumber}, ${unit.buildingName}, with super built-up area of approx ${unit.areaSqft} sq.ft.

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:
1. TENURE: The lease shall be for a period commencing from ${formatKolkataDate(lease.startDate)} to ${formatKolkataDate(lease.endDate)}.
2. RENT & MAINTENANCE: The monthly rent agreed is ${formatRupees(lease.rentPaise)} plus maintenance charges of ${formatRupees(lease.maintenancePaise)}, payable in advance on or before the ${lease.dueDay}th day of each calendar month.
3. SECURITY DEPOSIT: The Lessee has deposited an interest-free refundable security deposit of ${formatRupees(lease.depositPaise)} with the Lessor.
4. LATE CHARGES: Late payment beyond grace period of ${lease.graceDays} days shall attract a late fee of ${lease.lateFeePercent}% per month.
5. YEARLY INCREASE: Upon annual renewal, rent shall escalate by ${lease.yearlyIncreasePercent}%.
6. LOCK-IN & NOTICE: The minimum lock-in period is ${lease.lockInMonths} months, and notice period for termination is ${lease.noticePeriodDays} days.
7. POLICE VERIFICATION: Mandatory verification status: ${tenant.policeVerificationStatus}.

IN WITNESS WHEREOF, the Lessor and Lessee have signed this document on the date above mentioned.
  `;

  doc.text(text, 20, 36, { maxWidth: 170 });

  // Signatures
  doc.text('LESSOR (Owner)', 30, 240);
  doc.line(30, 235, 75, 235);

  doc.text('LESSEE (Tenant)', 135, 240);
  doc.line(135, 235, 180, 235);

  doc.save(`Lease_Agreement_Draft_Unit_${unit.unitNumber}.pdf`);
}

export function exportToExcel(filename: string, headers: string[], rows: any[][]) {
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

