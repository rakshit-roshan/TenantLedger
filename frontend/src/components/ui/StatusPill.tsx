import React from 'react';
import { PaymentStatus, UnitStatus } from '../../types';

interface StatusPillProps {
  status: string;
  labelOverride?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, labelOverride }) => {
  const getStyle = () => {
    switch (status) {
      case 'PAID':
      case 'ACTIVE':
      case 'RESOLVED':
      case 'RECEIVED':
      case 'VERIFIED':
      case 'COMPLETED':
      case 'APPROVED':
        return {
          bg: 'bg-[#F2F6ED]',
          border: 'border-[#5F7A3E]',
          text: 'text-[#3E5525]',
          dot: 'bg-[#5F7A3E]',
          label: labelOverride || (status === 'COMPLETED' ? 'COMPLETED' : status === 'ACTIVE' ? 'ACTIVE' : 'PAID'),
        };
      case 'DUE':
      case 'PENDING':
      case 'PARTIAL':
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return {
          bg: 'bg-[#FAF5E8]',
          border: 'border-[#C98A1B]',
          text: 'text-[#875908]',
          dot: 'bg-[#C98A1B]',
          label: labelOverride || status.replace('_', ' '),
        };
      case 'OVERDUE':
      case 'REVERSED':
      case 'REJECTED':
      case 'TERMINATED':
      case 'EXPIRED':
      case 'OPEN':
        return {
          bg: 'bg-[#F9ECEB]',
          border: 'border-[#9C2F2A]',
          text: 'text-[#7D1E1A]',
          dot: 'bg-[#9C2F2A]',
          label: labelOverride || status,
        };
      case 'NOTICE':
        return {
          bg: 'bg-[#ECF5F5]',
          border: 'border-[#2F6B6B]',
          text: 'text-[#1D4A4A]',
          dot: 'bg-[#2F6B6B]',
          label: labelOverride || 'NOTICE',
        };
      case 'VACANT':
      case 'CLOSED':
        return {
          bg: 'bg-transparent',
          border: 'border-dashed border-[#B9A78A]',
          text: 'text-[#5E4E41]',
          dot: 'bg-[#B9A78A]',
          label: labelOverride || status,
        };
      case 'MAINTENANCE':
        return {
          bg: 'bg-[#F7F2EB]',
          border: 'border-[#B9A78A]',
          text: 'text-[#5E4E41]',
          dot: 'bg-[#A8481F]',
          label: labelOverride || 'MAINTENANCE',
        };
      default:
        return {
          bg: 'bg-surface',
          border: 'border-line',
          text: 'text-ink',
          dot: 'bg-muted-text',
          label: labelOverride || String(status),
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.border} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{style.label}</span>
    </span>
  );
};
