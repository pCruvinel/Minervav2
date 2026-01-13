/**
 * Cliente Completar Components
 * 
 * Componentes para completar dados do Cliente (Nível 2):
 * - ClienteCompletar: Componente orquestrador principal
 * - ClienteDocumentosUpload: Upload de documentos obrigatórios
 * 
 * @example
 * ```tsx
 * import { ClienteCompletar, type ClienteCompletarHandle } from '@/components/os/shared/cliente-completar';
 * 
 * const ref = useRef<ClienteCompletarHandle>(null);
 * 
 * <ClienteCompletar
 *   ref={ref}
 *   clienteId={clienteId}
 *   onDocumentosChange={handleDocChange}
 * />
 * ```
 */

// Componentes
export { ClienteCompletar } from './cliente-completar';
export { ClienteDocumentosUpload } from './cliente-documentos-upload';

// Tipos
export type {
  TipoDocumentoCliente,
  ClienteDocumentoUpload,
  ClienteCompletarProps,
  ClienteCompletarHandle,
} from '../lead-cadastro/types';
