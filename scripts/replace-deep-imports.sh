#!/bin/bash
# Script para substituir deep relative imports por path alias @/

echo "🔧 Substituindo deep relative imports por @/ alias..."
echo ""

# Encontrar todos os arquivos com imports relativos profundos
files=$(find src/components/os/steps -name "*.tsx" -exec grep -l "\.\./\.\./\.\." {} \;)

count=0
for file in $files; do
  echo "📝 Processando: $file"

  # Substituir imports de 3 níveis acima
  sed -i "s|from '../../../lib/|from '@/lib/|g" "$file"
  sed -i "s|from \"../../../lib/|from \"@/lib/|g" "$file"

  sed -i "s|from '../../../components/|from '@/components/|g" "$file"
  sed -i "s|from \"../../../components/|from \"@/components/|g" "$file"

  sed -i "s|from '../../../hooks/|from '@/hooks/|g" "$file"
  sed -i "s|from \"../../../hooks/|from \"@/hooks/|g" "$file"

  sed -i "s|from '../../../utils/|from '@/utils/|g" "$file"
  sed -i "s|from \"../../../utils/|from \"@/utils/|g" "$file"

  # Substituir imports de 2 níveis acima (se houver)
  sed -i "s|from '../../lib/|from '@/lib/|g" "$file"
  sed -i "s|from \"../../lib/|from \"@/lib/|g" "$file"

  sed -i "s|from '../../components/|from '@/components/|g" "$file"
  sed -i "s|from \"../../components/|from \"@/components/|g" "$file"

  sed -i "s|from '../../hooks/|from '@/hooks/|g" "$file"
  sed -i "s|from \"../../hooks/|from \"@/hooks/|g" "$file"

  sed -i "s|from '../../utils/|from '@/utils/|g" "$file"
  sed -i "s|from \"../../utils/|from \"@/utils/|g" "$file"

  echo "   ✅ Concluído"
  count=$((count + 1))
done

echo ""
echo "✅ Substituição concluída em $count arquivos!"
echo ""
echo "📊 Verificando resultado:"
remaining=$(find src/components/os/steps -name "*.tsx" -exec grep -l "\.\./\.\./\.\." {} \; | wc -l)
echo "   Arquivos restantes com deep imports: $remaining"
