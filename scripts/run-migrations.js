/**
 * Script para executar migrations SQL no Supabase
 * Uso: node scripts/run-migrations.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Credenciais do Supabase
const projectId = 'zxfevlkssljndqqhxkjb';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmV2bGtzc2xqbmRxcWh4a2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDkxNTcsImV4cCI6MjA3ODIyNTE1N30.cODYFIRpNluf8tUZqyL8y0GC46GCEGxELHVxrKcAH7c';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

async function runMigration(filePath, name) {
  console.log(`\n🚀 Executando migration: ${name}...`);

  try {
    // Ler arquivo SQL
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`📄 Arquivo: ${filePath}`);
    console.log(`📏 Tamanho: ${sql.length} caracteres`);

    // Executar SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      console.error(`❌ Erro ao executar ${name}:`, error);
      return false;
    }

    console.log(`✅ ${name} executado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao processar ${name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 Iniciando execução de migrations...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Project ID: ${projectId}\n`);

  const migrations = [
    {
      name: 'Criar Tabela de Delegações',
      path: path.join(__dirname, '../supabase/migrations/create_delegacoes_table.sql')
    },
    {
      name: 'Seed de Usuários Auth',
      path: path.join(__dirname, '../supabase/migrations/seed_auth_users.sql')
    }
  ];

  let success = 0;
  let failed = 0;

  for (const migration of migrations) {
    const result = await runMigration(migration.path, migration.name);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Resumo da Execução:');
  console.log(`✅ Sucesso: ${success}`);
  console.log(`❌ Falhas: ${failed}`);
  console.log('='.repeat(50));

  if (failed > 0) {
    console.log('\n⚠️  Algumas migrations falharam.');
    console.log('💡 Tente executar manualmente no Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/${projectId}/sql/new`);
    process.exit(1);
  } else {
    console.log('\n🎉 Todas as migrations foram executadas com sucesso!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('\n💥 Erro fatal:', error);
  process.exit(1);
});
