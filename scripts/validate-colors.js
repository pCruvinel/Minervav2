#!/usr/bin/env node

/**
 * Script de Validação de Cores - Design System Minerva
 *
 * Valida automaticamente se há uso de cores hardcoded no projeto,
 * garantindo conformidade com o design system.
 *
 * Uso: npm run validate-colors
 * Ou: node scripts/validate-colors.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Padrões de cores hardcoded PROIBIDAS
const HARDCODED_PATTERNS = [
  // Cores Tailwind hardcoded
  /\bbg-(gray|blue|green|red|yellow|purple|pink|indigo|orange|cyan|teal|lime|emerald|violet|fuchsia|rose|sky|slate|zinc|neutral|stone|amber)-\d+/g,
  /\btext-(gray|blue|green|red|yellow|purple|pink|indigo|orange|cyan|teal|lime|emerald|violet|fuchsia|rose|sky|slate|zinc|neutral|stone|amber)-\d+/g,
  /\bborder-(gray|blue|green|red|yellow|purple|pink|indigo|orange|cyan|teal|lime|emerald|violet|fuchsia|rose|sky|slate|zinc|neutral|stone|amber)-\d+/g,

  // Cores hexadecimais hardcoded
  /#[0-9a-fA-F]{3,8}/g,

  // Cores RGB hardcoded (exceto variáveis CSS)
  /\brgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,

  // Cores HSL hardcoded (exceto variáveis CSS)
  /\bhsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)/g,
];

// Arquivos PERMITIDOS (onde cores hardcoded são aceitáveis)
const ALLOWED_FILES = [
  'src/components/design-system/', // Componentes do design system
  'src/lib/color-utils.ts', // Utilitários de cores (deprecated)
  'tailwind.config.js', // Configuração do Tailwind
  'src/index.css', // CSS global com variáveis
  'src/styles/', // Diretório de estilos
];

// Padrões PERMITIDOS (cores do design system)
const ALLOWED_PATTERNS = [
  /\bbg-(primary|secondary|success|warning|destructive|info|muted|background|card|popover)/g,
  /\btext-(primary|secondary|success|warning|destructive|info|muted|foreground|muted-foreground)/g,
  /\bborder-(primary|secondary|success|warning|destructive|info|muted|border|input)/g,
  /\bhsl\(var\(--[\w-]+\)\)/g, // Variáveis CSS hsl(var(--primary))
];

async function validateColors() {
  console.log('🎨 Validando conformidade com Design System Minerva...\n');

  try {
    // Buscar todos os arquivos TypeScript/React
    const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
      ignore: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/vite.config.ts',
        '**/vitest.config.ts'
      ]
    });

    let totalFiles = 0;
    let filesWithErrors = 0;
    let totalViolations = 0;

    for (const file of files) {
      totalFiles++;

      // Verificar se arquivo é permitido
      const isAllowed = ALLOWED_FILES.some(allowed => file.includes(allowed));
      if (isAllowed) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf8');
      const violations = [];

      // Verificar padrões proibidos
      for (const pattern of HARDCODED_PATTERNS) {
        const matches = content.match(pattern);
        if (matches) {
          // Filtrar matches que são permitidos
          const filteredMatches = matches.filter(match => {
            return !ALLOWED_PATTERNS.some(allowedPattern => allowedPattern.test(match));
          });

          if (filteredMatches.length > 0) {
            violations.push(...filteredMatches);
          }
        }
      }

      if (violations.length > 0) {
        filesWithErrors++;
        totalViolations += violations.length;

        console.log(`❌ ${file}:`);
        violations.forEach(violation => {
          console.log(`   • ${violation}`);
        });
        console.log('');
      }
    }

    // Resultado final
    console.log('📊 RESULTADO DA VALIDAÇÃO:');
    console.log(`   • Arquivos analisados: ${totalFiles}`);
    console.log(`   • Arquivos com problemas: ${filesWithErrors}`);
    console.log(`   • Total de violações: ${totalViolations}`);

    if (filesWithErrors > 0) {
      console.log('\n🚫 FALHA: Cores hardcoded detectadas!');
      console.log('💡 Corrija as violações antes de fazer commit.');
      console.log('🔧 Use variáveis do design system:');
      console.log('   - bg-primary, text-success, border-destructive');
      console.log('   - hsl(var(--primary)), hsl(var(--success))');
      console.log('   - Componentes: <StatusBadge>, <PriorityBadge>');
      process.exit(1);
    } else {
      console.log('\n✅ SUCESSO: Todas as cores estão conformes com o design system!');
      console.log('🎉 Pronto para commit!');
    }

  } catch (error) {
    console.error('❌ Erro durante validação:', error.message);
    process.exit(1);
  }
}

// Executar validação
validateColors();