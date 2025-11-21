// BACKEND HABILITADO - Upload ativo
const FRONTEND_ONLY_MODE = false;

// Credenciais do Supabase via variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials. Check .env file.');
}

const STORAGE_URL = `${SUPABASE_URL}/storage/v1`;

/**
 * Utilitário para upload de arquivos no Supabase Storage
 * Bucket: 'uploads'
 * Estrutura: uploads/os{numero}/etapa/dd-mm-yy-{osId}-{colaboradorId}-{fileId}.ext
 */

interface UploadFileOptions {
  file: File;
  osNumero: string; // ex: "os1"
  etapa: string; // ex: "follow-up1"
  osId: string;
  colaboradorId: string;
}

interface UploadedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

/**
 * Gera nome do arquivo no formato: dd-mm-yy-{osId}-{colaboradorId}-{fileId}.ext
 */
function generateFileName(osId: string, colaboradorId: string, fileId: string, extension: string): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  
  return `${day}-${month}-${year}-${osId}-${colaboradorId}-${fileId}.${extension}`;
}

/**
 * Extrai extensão do arquivo
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Valida tipo e tamanho do arquivo
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Tipos permitidos
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/msword', // DOC
    'application/vnd.ms-excel', // XLS
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de arquivo não permitido. Use: PDF, JPG, PNG, DOCX, XLSX'
    };
  }
  
  // Tamanho máximo: 10MB
  const maxSize = 10 * 1024 * 1024; // 10MB em bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Tamanho máximo: 10MB'
    };
  }
  
  return { valid: true };
}

/**
 * Faz upload de arquivo para o Supabase Storage
 */
export async function uploadFile(options: UploadFileOptions): Promise<UploadedFile> {
  const { file, osNumero, etapa, osId, colaboradorId } = options;
  
  // Validar arquivo
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Gerar ID único para o arquivo
  const fileId = crypto.randomUUID();
  
  // Extrair extensão
  const extension = getFileExtension(file.name);
  
  // Gerar nome do arquivo
  const fileName = generateFileName(osId, colaboradorId, fileId, extension);
  
  // Caminho completo no bucket: uploads/os1/follow-up1/dd-mm-yy-osId-colaboradorId-fileId.ext
  const filePath = `${osNumero}/${etapa}/${fileName}`;
  
  // MODO FRONTEND ONLY - Simular upload sem chamar Supabase
  if (FRONTEND_ONLY_MODE) {
    console.log(`🎭 MOCK Upload: ${filePath}`);
    
    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Criar URL local usando FileReader
    const localUrl = URL.createObjectURL(file);
    
    return {
      id: fileId,
      name: file.name,
      path: filePath,
      size: file.size,
      type: file.type,
      url: localUrl,
      uploadedAt: new Date().toISOString(),
    };
  }
  
  // URL da API do Supabase Storage
  const storageUrl = `${STORAGE_URL}/object/uploads/${filePath}`;

  try {
    console.log(`📤 Uploading file to: ${filePath}`);

    // Fazer upload usando API REST do Supabase Storage
    const response = await fetch(storageUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': file.type,
      },
      body: file,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Upload error:', errorData);
      throw new Error(errorData.message || 'Erro ao fazer upload do arquivo');
    }
    
    console.log('✅ File uploaded successfully');

    // URL pública do arquivo
    const publicUrl = `${STORAGE_URL}/object/public/uploads/${filePath}`;
    
    // Retornar informações do arquivo
    return {
      id: fileId,
      name: file.name,
      path: filePath,
      size: file.size,
      type: file.type,
      url: publicUrl,
      uploadedAt: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw error;
  }
}

/**
 * Deleta arquivo do Supabase Storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  // MODO FRONTEND ONLY - Simular exclusão
  if (FRONTEND_ONLY_MODE) {
    console.log(`🎭 MOCK Delete: ${filePath}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }
  
  const storageUrl = `${STORAGE_URL}/object/uploads/${filePath}`;

  try {
    console.log(`🗑️ Deleting file: ${filePath}`);

    const response = await fetch(storageUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Delete error:', errorData);
      throw new Error(errorData.message || 'Erro ao deletar arquivo');
    }
    
    console.log('✅ File deleted successfully');
    
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
}

/**
 * Baixa arquivo do Supabase Storage
 */
export function getFileUrl(filePath: string): string {
  return `${STORAGE_URL}/object/public/uploads/${filePath}`;
}

/**
 * Formata tamanho do arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}