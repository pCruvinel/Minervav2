/**
 * Lead Cadastro Components
 * 
 * Componentes reutilizáveis para cadastro de Lead:
 * - LeadCadastro: Componente orquestrador principal
 * - LeadSelector: Combobox de seleção de lead
 * - LeadFormIdentificacao: Formulário de identificação
 * - LeadFormEdificacao: Formulário de dados da edificação
 * - LeadFormEndereco: Formulário de endereço
 * 
 * @example
 * ```tsx
 * import { LeadCadastro, type LeadCadastroHandle } from '@/components/os/shared/lead-cadastro';
 * 
 * const ref = useRef<LeadCadastroHandle>(null);
 * 
 * <LeadCadastro
 *   ref={ref}
 *   selectedLeadId={leadId}
 *   onLeadChange={(id, data) => setLeadId(id)}
 * />
 * ```
 */

// Componentes
export { LeadCadastro } from './lead-cadastro';
export { LeadSelector } from './lead-selector';
export { LeadFormIdentificacao } from './lead-form-identificacao';
export { LeadFormEdificacao } from './lead-form-edificacao';
export { LeadFormEndereco } from './lead-form-endereco';

// Tipos
export type {
  TipoCliente,
  TipoEmpresa,
  TipoEdificacao,
  TipoTelhado,
  LeadIdentificacao,
  LeadEdificacao,
  LeadEndereco,
  LeadCompleto,
  LeadCadastroProps,
  LeadCadastroHandle,
  FormDataCompleto,
} from './types';

// Utilitários
export {
  formDataToLeadCompleto,
  leadCompletoToFormData,
  EMPTY_FORM_DATA,
} from './types';
