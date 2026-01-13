import { supabase } from '@/lib/supabase-client';
import { PDFType } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

export interface UploadResult {
  path: string;
  publicUrl: string; // Keeping name provided it is a usable URL (signed)
  signedUrl: string;
}

/**
 * Uploads a generated PDF blob to Supabase Storage
 */
export async function uploadPDFToStorage(
  pdfBlob: Blob,
  tipo: PDFType,
  osId: string
): Promise<UploadResult> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${tipo}_${osId}_${timestamp}.pdf`;
    const path = `os/${osId}/documentos/${tipo}/${filename}`;

    logger.log(`[PDF Upload] Uploading to ${path}...`);

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(path, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Generate Signed URL (valid for 1 hour)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('uploads')
      .createSignedUrl(path, 3600);
      
    if (signedError || !signedData?.signedUrl) {
        throw signedError || new Error('Failed to generate signed URL');
    }

    const publicUrl = signedData.signedUrl; // Use signed URL as the usable "public" URL for immediate use

    logger.log(`[PDF Upload] Success! URL: ${publicUrl}`);

    return {
      path,
      publicUrl,
      signedUrl: publicUrl
    };
  } catch (error) {
    logger.error('[PDF Upload] Error uploading PDF:', error);
    throw error;
  }
}
