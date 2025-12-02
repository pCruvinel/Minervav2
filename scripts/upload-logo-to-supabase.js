/**
 * Script para fazer upload da logo Minerva para o Supabase Storage
 * Execução: node scripts/upload-logo-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase (hardcoded para simplicidade)
const SUPABASE_URL = 'https://zxfevlkssljndqqhxkjb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function uploadLogo() {
  try {
    console.log('📤 Iniciando upload da logo...');

    // Ler arquivo da logo
    const logoPath = join(__dirname, '..', 'src', 'img', 'logo.png');
    const logoBuffer = await readFile(logoPath);

    console.log('✅ Logo lida:', logoPath);
    console.log('📊 Tamanho:', (logoBuffer.length / 1024).toFixed(2), 'KB');

    // Upload para o bucket 'uploads'
    const fileName = 'logo/minerva-logo.png';
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, logoBuffer, {
        contentType: 'image/png',
        upsert: true // Sobrescrever se já existe
      });

    if (error) {
      throw error;
    }

    console.log('✅ Upload realizado com sucesso!');

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    console.log('\n🎉 Logo hospedada com sucesso!');
    console.log('🔗 URL Pública:', publicUrl);
    console.log('\n📝 Próximo passo:');
    console.log('Adicione esta linha no arquivo:');
    console.log('supabase/functions/generate-pdf/handlers/proposta-handler.ts');
    console.log('Linha 165 (dentro de propostaData):');
    console.log(`\nempresaLogo: '${publicUrl}',\n`);

    return publicUrl;
  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error);
    process.exit(1);
  }
}

uploadLogo();