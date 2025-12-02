import React from 'react';
import { Button } from './button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'default' | 'lg';

/**
 * Props para o componente PrimaryButton
 */
interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: ButtonVariant;
  /** Tamanho do botão */
  size?: ButtonSize;
  /** Se o botão está em estado de carregamento */
  isLoading?: boolean;
  /** Texto exibido durante carregamento */
  loadingText?: string;
  /** Conteúdo do botão */
  children: React.ReactNode;
  /** Ícone opcional */
  icon?: React.ReactNode;
  /** Posição do ícone */
  iconPosition?: 'left' | 'right';
  /** Se o botão deve ocupar largura total */
  fullWidth?: boolean;
  /** Renderizar como child (para uso com Link) */
  asChild?: boolean;
}

const variantStyles = {
  primary: {
    base: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary',
    disabled: 'disabled:bg-primary disabled:opacity-50 disabled:cursor-not-allowed',
  },
  secondary: {
    base: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90',
    disabled: 'disabled:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed',
  },
  danger: {
    base: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive',
    disabled: 'disabled:bg-destructive disabled:opacity-50 disabled:cursor-not-allowed',
  },
  ghost: {
    base: 'bg-transparent text-foreground border border-border hover:bg-muted active:bg-muted',
    disabled: 'disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed',
  },
};

const sizeStyles = {
  sm: 'px-2 py-1 text-sm',
  default: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * PrimaryButton - Botão customizado com cores da marca Minerva
 *
 * Estende o Button do Shadcn/UI com estilos específicos do Minerva.
 * Suporta estado de loading, ícones, e múltiplas variantes.
 *
 * @example
 * ```tsx
 * // Botão primário simples
 * <PrimaryButton onClick={handleClick}>
 *   Salvar
 * </PrimaryButton>
 *
 * // Botão com loading
 * <PrimaryButton isLoading={isSaving} loadingText="Salvando...">
 *   Salvar Dados
 * </PrimaryButton>
 *
 * // Botão com ícone
 * <PrimaryButton variant="secondary" icon={<Plus />} iconPosition="left">
 *   Novo Item
 * </PrimaryButton>
 *
 * // Botão de perigo (deleção)
 * <PrimaryButton variant="danger" size="sm">
 *   Deletar
 * </PrimaryButton>
 * ```
 */
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
  asChild = false,
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
      asChild={asChild}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText}
        </>
      ) : asChild ? (
        children
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