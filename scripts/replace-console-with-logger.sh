#!/bin/bash
# Script para substituir console.* por logger.* em arquivos TypeScript/React

# Lista de arquivos a processar
FILES=(
  "src/components/admin/seed-usuarios-page.tsx"
  "src/components/auth/login-page.tsx"
  "src/components/calendario/calendario-dia.tsx"
  "src/components/calendario/calendario-semana.tsx"
  "src/components/clientes/cliente-detalhes-page.tsx"
  "src/components/colaboradores/colaboradores-lista-page.tsx"
  "src/components/colaboradores/controle-presenca-page.tsx"
  "src/components/colaboradores/controle-presenca-tabela-page.tsx"
  "src/components/comercial/detalhes-lead.tsx"
  "src/components/comercial/lista-leads.tsx"
  "src/components/comercial/propostas-comerciais.tsx"
  "src/components/configuracoes/usuarios-permissoes-page.tsx"
  "src/components/delegacao/modal-delegar-os.tsx"
  "src/components/financeiro/conciliacao-bancaria-page.tsx"
  "src/components/layout/font-loader.tsx"
  "src/components/os/etapa-filter.tsx"
  "src/components/os/os-details-assessoria-page.tsx"
  "src/components/os/os-details-workflow-page.tsx"
  "src/components/os/os-list-page.tsx"
  "src/components/os/os-workflow-page.tsx"
  "src/components/os/os07-analise-page.tsx"
  "src/components/os/os07-form-publico.tsx"
  "src/components/os/steps/shared/step-identificacao-lead-completo.tsx"
  "src/components/os/workflow-stepper.tsx"
  "src/components/portal/portal-cliente-assessoria.tsx"
  "src/components/portal/portal-cliente-obras.tsx"
)

echo "🔧 Substituindo console.* por logger.* em ${#FILES[@]} arquivos..."
echo ""

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processando: $file"

    # Adicionar import do logger se não existir
    if ! grep -q "from '@/lib/utils/logger'" "$file" && ! grep -q 'from "@/lib/utils/logger"' "$file"; then
      # Encontrar linha do primeiro import
      first_import_line=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)

      if [ -n "$first_import_line" ]; then
        # Adicionar import antes do primeiro import existente
        sed -i "${first_import_line}i import { logger } from '@/lib/utils/logger';" "$file"
      else
        # Se não houver imports, adicionar no topo após comentários
        sed -i "1i import { logger } from '@/lib/utils/logger';\n" "$file"
      fi
    fi

    # Substituir console.log por logger.log
    sed -i 's/console\.log/logger.log/g' "$file"

    # Substituir console.debug por logger.debug
    sed -i 's/console\.debug/logger.debug/g' "$file"

    # Substituir console.info por logger.info
    sed -i 's/console\.info/logger.info/g' "$file"

    # Substituir console.warn por logger.warn
    sed -i 's/console\.warn/logger.warn/g' "$file"

    # console.error permanece (já é loggado em produção)
    # mas vamos substituir também para consistência
    sed -i 's/console\.error/logger.error/g' "$file"

    echo "   ✅ Concluído"
  else
    echo "   ⚠️  Arquivo não encontrado: $file"
  fi
done

echo ""
echo "✅ Substituição concluída em ${#FILES[@]} arquivos!"
echo ""
echo "📊 Verificando resultado:"
remaining=$(grep -r "console\.\(log\|warn\|debug\|info\|error\)" src/components/ --include="*.tsx" -l 2>/dev/null | wc -l)
echo "   Arquivos restantes com console.*: $remaining"
