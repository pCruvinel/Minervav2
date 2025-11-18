import React from 'react';
import { Button } from './button';
import { Loader2 } from 'lucide-react';
import { cn } from './utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'default' | 'lg';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles = {
  primary: {
    base: 'bg-[#D3AF37] text-black hover:bg-[#C29F2F] active:bg-[#B18F27]',
    disabled: 'disabled:bg-[#D3AF37] disabled:opacity-50 disabled:cursor-not-allowed',
  },
  secondary: {
    base: 'bg-[#DDC063] text-black hover:bg-[#D0B354] active:bg-[#C4A645]',
    disabled: 'disabled:bg-[#DDC063] disabled:opacity-50 disabled:cursor-not-allowed',
  },
  danger: {
    base: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    disabled: 'disabled:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
  },
  ghost: {
    base: 'bg-transparent text-black border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200',
    disabled: 'disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed',
  },
};

const sizeStyles = {
  sm: 'px-2 py-1 text-sm',
  default: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function PrimaryButton({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  loadingText = 'Carregando...',
  children,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const variantStyle = variantStyles[variant];
  const isDisabled = disabled || isLoading;

  return (
    <Button
      className={cn(
        'transition-all duration-300 font-medium shadow-sm',
        'active:scale-[0.98] active:shadow-none',
        variantStyle.base,
        variantStyle.disabled,
        fullWidth && 'w-full',
        sizeStyles[size],
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </Button>
  );
}