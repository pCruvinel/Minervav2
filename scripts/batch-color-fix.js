#!/usr/bin/env node

/**
 * Script para correção automática de violações de cores hardcoded
 * Executa correções em lote baseadas em padrões identificados
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Padrões de correção automática
const COLOR_REPLACEMENTS = [
  // Background neutros
  { from: /\bbg-neutral-50\b/g, to: 'bg-background' },
  { from: /\bbg-neutral-100\b/g, to: 'bg-muted' },
  { from: /\bbg-neutral-200\b/g, to: 'bg-muted' },
  { from: /\bbg-gray-50\b/g, to: 'bg-background' },
  { from: /\bbg-gray-100\b/g, to: 'bg-muted' },
  { from: /\bbg-gray-200\b/g, to: 'bg-muted' },

  // Text neutros
  { from: /\btext-neutral-400\b/g, to: 'text-muted-foreground' },
  { from: /\btext-neutral-500\b/g, to: 'text-muted-foreground' },
  { from: /\btext-neutral-600\b/g, to: 'text-muted-foreground' },
  { from: /\btext-neutral-700\b/g, to: 'text-muted-foreground' },
  { from: /\btext-neutral-800\b/g, to: 'text-foreground' },
  { from: /\btext-neutral-900\b/g, to: 'text-foreground' },
  { from: /\btext-gray-400\b/g, to: 'text-muted-foreground' },
  { from: /\btext-gray-500\b/g, to: 'text-muted-foreground' },
  { from: /\btext-gray-600\b/g, to: 'text-muted-foreground' },
  { from: /\btext-gray-700\b/g, to: 'text-muted-foreground' },
  { from: /\btext-gray-800\b/g, to: 'text-foreground' },
  { from: /\btext-gray-900\b/g, to: 'text-foreground' },

  // Text cores semânticas
  { from: /\btext-green-500\b/g, to: 'text-success' },
  { from: /\btext-green-600\b/g, to: 'text-success' },
  { from: /\btext-green-700\b/g, to: 'text-success' },
  { from: /\btext-green-800\b/g, to: 'text-success' },
  { from: /\btext-green-900\b/g, to: 'text-success' },
  { from: /\btext-red-500\b/g, to: 'text-destructive' },
  { from: /\btext-red-600\b/g, to: 'text-destructive' },
  { from: /\btext-red-700\b/g, to: 'text-destructive' },
  { from: /\btext-red-800\b/g, to: 'text-destructive' },
  { from: /\btext-red-900\b/g, to: 'text-destructive' },
  { from: /\btext-blue-500\b/g, to: 'text-primary' },
  { from: /\btext-blue-600\b/g, to: 'text-primary' },
  { from: /\btext-blue-700\b/g, to: 'text-primary' },
  { from: /\btext-blue-800\b/g, to: 'text-primary' },
  { from: /\btext-blue-900\b/g, to: 'text-primary' },
  { from: /\btext-amber-500\b/g, to: 'text-warning' },
  { from: /\btext-amber-600\b/g, to: 'text-warning' },
  { from: /\btext-amber-700\b/g, to: 'text-warning' },
  { from: /\btext-amber-800\b/g, to: 'text-warning' },
  { from: /\btext-amber-900\b/g, to: 'text-warning' },
  { from: /\btext-yellow-500\b/g, to: 'text-warning' },
  { from: /\btext-yellow-600\b/g, to: 'text-warning' },
  { from: /\btext-yellow-700\b/g, to: 'text-warning' },
  { from: /\btext-yellow-800\b/g, to: 'text-warning' },
  { from: /\btext-yellow-900\b/g, to: 'text-warning' },
  { from: /\btext-orange-500\b/g, to: 'text-warning' },
  { from: /\btext-orange-600\b/g, to: 'text-warning' },
  { from: /\btext-orange-700\b/g, to: 'text-warning' },
  { from: /\btext-orange-800\b/g, to: 'text-warning' },
  { from: /\btext-orange-900\b/g, to: 'text-warning' },
  { from: /\btext-purple-500\b/g, to: 'text-secondary' },
  { from: /\btext-purple-600\b/g, to: 'text-secondary' },
  { from: /\btext-purple-700\b/g, to: 'text-secondary' },
  { from: /\btext-purple-800\b/g, to: 'text-secondary' },
  { from: /\btext-purple-900\b/g, to: 'text-secondary' },
  { from: /\btext-cyan-500\b/g, to: 'text-info' },
  { from: /\btext-cyan-600\b/g, to: 'text-info' },
  { from: /\btext-cyan-700\b/g, to: 'text-info' },
  { from: /\btext-cyan-800\b/g, to: 'text-info' },
  { from: /\btext-cyan-900\b/g, to: 'text-info' },

  // Border neutros
  { from: /\bborder-neutral-200\b/g, to: 'border-border' },
  { from: /\bborder-neutral-300\b/g, to: 'border-border' },
  { from: /\bborder-neutral-400\b/g, to: 'border-border' },
  { from: /\bborder-gray-200\b/g, to: 'border-border' },
  { from: /\bborder-gray-300\b/g, to: 'border-border' },
  { from: /\bborder-gray-400\b/g, to: 'border-border' },

  // Border cores semânticas
  { from: /\bborder-green-200\b/g, to: 'border-success/20' },
  { from: /\bborder-green-300\b/g, to: 'border-success/30' },
  { from: /\bborder-green-500\b/g, to: 'border-success' },
  { from: /\bborder-red-200\b/g, to: 'border-destructive/20' },
  { from: /\bborder-red-300\b/g, to: 'border-destructive/30' },
  { from: /\bborder-red-500\b/g, to: 'border-destructive' },
  { from: /\bborder-blue-200\b/g, to: 'border-primary/20' },
  { from: /\bborder-blue-300\b/g, to: 'border-primary/30' },
  { from: /\bborder-blue-500\b/g, to: 'border-primary' },
  { from: /\bborder-amber-200\b/g, to: 'border-warning/20' },
  { from: /\bborder-amber-300\b/g, to: 'border-warning/30' },
  { from: /\bborder-amber-500\b/g, to: 'border-warning' },
  { from: /\bborder-yellow-200\b/g, to: 'border-warning/20' },
  { from: /\bborder-yellow-300\b/g, to: 'border-warning/30' },
  { from: /\bborder-yellow-500\b/g, to: 'border-warning' },
  { from: /\bborder-orange-200\b/g, to: 'border-warning/20' },
  { from: /\bborder-orange-300\b/g, to: 'border-warning/30' },
  { from: /\bborder-orange-500\b/g, to: 'border-warning' },
  { from: /\bborder-purple-200\b/g, to: 'border-secondary/20' },
  { from: /\bborder-purple-300\b/g, to: 'border-secondary/30' },
  { from: /\bborder-purple-500\b/g, to: 'border-secondary' },
  { from: /\bborder-cyan-200\b/g, to: 'border-info/20' },
  { from: /\bborder-cyan-300\b/g, to: 'border-info/30' },
  { from: /\bborder-cyan-500\b/g, to: 'border-info' },

  // Background cores semânticas
  { from: /\bbg-green-50\b/g, to: 'bg-success/5' },
  { from: /\bbg-green-100\b/g, to: 'bg-success/10' },
  { from: /\bbg-green-500\b/g, to: 'bg-success' },
  { from: /\bbg-green-600\b/g, to: 'bg-success' },
  { from: /\bbg-green-700\b/g, to: 'bg-success' },
  { from: /\bbg-red-50\b/g, to: 'bg-destructive/5' },
  { from: /\bbg-red-100\b/g, to: 'bg-destructive/10' },
  { from: /\bbg-red-500\b/g, to: 'bg-destructive' },
  { from: /\bbg-red-600\b/g, to: 'bg-destructive' },
  { from: /\bbg-red-700\b/g, to: 'bg-destructive' },
  { from: /\bbg-blue-50\b/g, to: 'bg-primary/5' },
  { from: /\bbg-blue-100\b/g, to: 'bg-primary/10' },
  { from: /\bbg-blue-500\b/g, to: 'bg-primary' },
  { from: /\bbg-blue-600\b/g, to: 'bg-primary' },
  { from: /\bbg-blue-700\b/g, to: 'bg-primary' },
  { from: /\bbg-amber-50\b/g, to: 'bg-warning/5' },
  { from: /\bbg-amber-100\b/g, to: 'bg-warning/10' },
  { from: /\bbg-amber-500\b/g, to: 'bg-warning' },
  { from: /\bbg-amber-600\b/g, to: 'bg-warning' },
  { from: /\bbg-amber-700\b/g, to: 'bg-warning' },
  { from: /\bbg-yellow-50\b/g, to: 'bg-warning/5' },
  { from: /\bbg-yellow-100\b/g, to: 'bg-warning/10' },
  { from: /\bbg-yellow-500\b/g, to: 'bg-warning' },
  { from: /\bbg-yellow-600\b/g, to: 'bg-warning' },
  { from: /\bbg-yellow-700\b/g, to: 'bg-warning' },
  { from: /\bbg-orange-50\b/g, to: 'bg-warning/5' },
  { from: /\bbg-orange-100\b/g, to: 'bg-warning/10' },
  { from: /\bbg-orange-500\b/g, to: 'bg-warning' },
  { from: /\bbg-orange-600\b/g, to: 'bg-warning' },
  { from: /\bbg-orange-700\b/g, to: 'bg-warning' },
  { from: /\bbg-purple-50\b/g, to: 'bg-secondary/5' },
  { from: /\bbg-purple-100\b/g, to: 'bg-secondary/10' },
  { from: /\bbg-purple-500\b/g, to: 'bg-secondary' },
  { from: /\bbg-purple-600\b/g, to: 'bg-secondary' },
  { from: /\bbg-purple-700\b/g, to: 'bg-secondary' },
  { from: /\bbg-cyan-50\b/g, to: 'bg-info/5' },
  { from: /\bbg-cyan-100\b/g, to: 'bg-info/10' },
  { from: /\bbg-cyan-500\b/g, to: 'bg-info' },
  { from: /\bbg-cyan-600\b/g, to: 'bg-info' },
  { from: /\bbg-cyan-700\b/g, to: 'bg-info' },

  // Cores hexadecimais específicas do projeto - substituir por classes do design system
  { from: /#D3AF37/g, to: 'var(--primary)' },
  { from: /#DDC063/g, to: 'var(--primary)' },
  { from: /#C29F2F/g, to: 'var(--primary)' },
  { from: /#B18F27/g, to: 'var(--primary)' },
  { from: /#9C7F1F/g, to: 'var(--primary)' },
  { from: /#10b981/g, to: 'var(--success)' },
  { from: /#f59e0b/g, to: 'var(--warning)' },
  { from: /#ef4444/g, to: 'var(--destructive)' },
  { from: /#93C5FD/g, to: 'var(--primary)' },
  { from: /#86EFAC/g, to: 'var(--success)' },
  { from: /#FDE047/g, to: 'var(--warning)' },
  { from: /#F9A8D4/g, to: 'var(--secondary)' },
  { from: /#C4B5FD/g, to: 'var(--secondary)' },
  { from: /#DBEAFE/g, to: 'var(--primary)' },
  { from: /#BFDBFE/g, to: 'var(--primary)' },
  { from: /#1E40AF/g, to: 'var(--primary)' },
  { from: /#D1FAE5/g, to: 'var(--success)' },
  { from: /#A7F3D0/g, to: 'var(--success)' },
  { from: /#6EE7B7/g, to: 'var(--success)' },
  { from: /#065F46/g, to: 'var(--success)' },
  { from: /#FEF3C7/g, to: 'var(--warning)' },
  { from: /#FDE68A/g, to: 'var(--warning)' },
  { from: /#FCD34D/g, to: 'var(--warning)' },
  { from: /#92400E/g, to: 'var(--warning)' },
  { from: /#E9D5FF/g, to: 'var(--secondary)' },
  { from: /#D8B4FE/g, to: 'var(--secondary)' },
  { from: /#C084FC/g, to: 'var(--secondary)' },
  { from: /#6B21A8/g, to: 'var(--secondary)' },
  { from: /#FFEDD5/g, to: 'var(--warning)' },
  { from: /#FED7AA/g, to: 'var(--warning)' },
  { from: /#FDBA74/g, to: 'var(--warning)' },
  { from: /#9A3412/g, to: 'var(--warning)' },
  { from: /#FFFFFF/g, to: 'var(--background)' },
  { from: /#F9FAFB/g, to: 'var(--muted)' },
  { from: /#F3F4F6/g, to: 'var(--muted)' },
  { from: /#111827/g, to: 'var(--foreground)' },
  { from: /#6B7280/g, to: 'var(--muted-foreground)' },
  { from: /#9CA3AF/g, to: 'var(--muted-foreground)' },
  { from: /#E5E7EB/g, to: 'var(--border)' },
  { from: /#D1D5DB/g, to: 'var(--border)' },
  { from: /#0f172a/g, to: 'var(--foreground)' },
];

async function findFiles() {
  const patterns = [
    'src/**/*.{tsx,ts,jsx,js}',
    '!src/**/*.d.ts',
    '!src/**/node_modules/**',
    '!src/**/dist/**',
    '!src/**/build/**'
  ];

  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: process.cwd() });
    files.push(...matches);
  }

  return [...new Set(files)]; // Remove duplicatas
}

function applyReplacements(content) {
  let modified = content;
  let changes = 0;

  for (const replacement of COLOR_REPLACEMENTS) {
    const before = modified;
    modified = modified.replace(replacement.from, replacement.to);
    if (before !== modified) {
      changes++;
    }
  }

  return { content: modified, changes };
}

async function processFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const { content: newContent, changes } = applyReplacements(content);

    if (changes > 0) {
      fs.writeFileSync(fullPath, newContent, 'utf-8');
      console.log(`✅ ${filePath}: ${changes} correções aplicadas`);
      return changes;
    } else {
      console.log(`⏭️  ${filePath}: sem alterações necessárias`);
      return 0;
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return 0;
  }
}

async function main() {
  console.log('🎨 Iniciando correção automática de cores hardcoded...\n');

  const files = await findFiles();
  console.log(`📁 Encontrados ${files.length} arquivos para processar\n`);

  let totalChanges = 0;
  let processedFiles = 0;

  for (const file of files) {
    const changes = await processFile(file);
    totalChanges += changes;
    processedFiles++;
  }

  console.log(`\n📊 RESULTADO:`);
  console.log(`   • Arquivos processados: ${processedFiles}`);
  console.log(`   • Correções aplicadas: ${totalChanges}`);

  if (totalChanges > 0) {
    console.log(`\n✅ Execute 'npm run validate-colors' para verificar o progresso.`);
  } else {
    console.log(`\n🎉 Nenhum arquivo precisou de correções automáticas!`);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyReplacements, COLOR_REPLACEMENTS };