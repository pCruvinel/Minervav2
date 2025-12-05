import React, { ReactNode } from 'react';

export interface StepLayoutProps {
  /**
   * Título principal do step
   */
  title: string;

  /**
   * Descrição do step (texto auxiliar)
   */
  description?: string;

  /**
   * Conteúdo do formulário do step
   */
  children: ReactNode;

  /**
   * Ações do footer (botões de navegação, etc.)
   */
  footerActions?: ReactNode;

  /**
   * Classes CSS adicionais para customização
   */
  className?: string;
}

/**
 * Layout genérico para os steps de formulário de OS
 *
 * Features:
 * - Design consistente com cabeçalho e descrição
 * - Animações de entrada suaves
 * - Mobile-first e responsivo
 * - Suporte a footer customizável para botões de navegação
 * - Espaçamento padronizado
 *
 * @example
 * ```tsx
 * <StepLayout
 *   title="Identificação do Solicitante"
 *   description="Preencha as informações do solicitante"
 *   footerActions={
 *     <div className="flex gap-2">
 *       <Button onClick={onBack}>Voltar</Button>
 *       <Button onClick={onNext}>Próximo</Button>
 *     </div>
 *   }
 * >
 *   <form>...</form>
 * </StepLayout>
 * ```
 */
export const StepLayout: React.FC<StepLayoutProps> = ({
  title,
  description,
  children,
  footerActions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 ${className}`}
      style={{
        '--animate-duration': '0.3s'
      } as React.CSSProperties}
    >
      {/* Cabeçalho do Step */}
      <div className="space-y-2 border-b border-border pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Conteúdo do Formulário */}
      <div className="py-2">
        {children}
      </div>

      {/* Footer com Ações (Botões de Navegação) */}
      {footerActions && (
        <div className="border-t border-border pt-6 mt-4">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            {footerActions}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente auxiliar para criar seções dentro do StepLayout
 * Padroniza o visual dos títulos de seção
 */
export interface StepSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const StepSection: React.FC<StepSectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3
        className="text-base border-b border-border pb-2"
        style={{ color: 'var(--primary)' }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};
