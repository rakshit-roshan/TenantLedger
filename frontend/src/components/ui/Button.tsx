import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 select-none';

  const sizeClasses = {
    sm: 'min-h-[36px] px-3 text-xs rounded-[10px] gap-1.5',
    md: 'min-h-[44px] px-4 text-sm rounded-[10px] gap-2',
    lg: 'min-h-[50px] px-6 text-base rounded-[12px] gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-terracotta text-white hover:opacity-95 active:scale-[0.99] border border-transparent shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'bg-surface text-ink hover:bg-ground active:scale-[0.99] border border-btn-border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
    danger:
      'bg-overdue text-white hover:opacity-90 active:scale-[0.99] border border-transparent shadow-sm disabled:opacity-50',
    ghost:
      'bg-transparent text-ink hover:bg-ground/60 border border-transparent disabled:opacity-40',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

