#!/bin/bash
# Script para encontrar componentes potencialmente não utilizados

echo "🔍 Analisando componentes não utilizados..."
echo ""

# Lista para armazenar componentes não usados
unused=()

# Função para converter nome de arquivo para nome de componente
get_component_name() {
  local filename=$(basename "$1" .tsx)
  # Converter kebab-case para PascalCase
  echo "$filename" | sed -r 's/(^|-)([a-z])/\U\2/g'
}

# Buscar todos os componentes
for file in $(find src/components -name "*.tsx" -type f); do
  # Pular UI components (Shadcn)
  if [[ "$file" == *"/ui/"* ]]; then
    continue
  fi

  # Pular design system showcase (já sabemos que é dev-only)
  if [[ "$file" == *"design-system-showcase"* ]]; then
    continue
  fi

  # Extrair nome do arquivo
  basename=$(basename "$file" .tsx)

  # Tentar várias variações do nome
  component_name=$(get_component_name "$file")

  # Buscar imports deste componente em toda a aplicação
  # Buscar por: import { ComponentName } ou import ComponentName
  import_count=$(grep -r "import.*$component_name" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "$file" | wc -l)

  # Também buscar por uso direto do componente (JSX)
  usage_count=$(grep -r "<$component_name" src/ --include="*.tsx" 2>/dev/null | grep -v "$file" | wc -l)

  # Buscar em rotas
  route_count=$(grep -r "$basename" src/routes/ --include="*.tsx" 2>/dev/null | wc -l)

  total=$((import_count + usage_count + route_count))

  if [ $total -eq 0 ]; then
    unused+=("$file")
  fi
done

echo "📊 Resultado da análise:"
echo ""

if [ ${#unused[@]} -eq 0 ]; then
  echo "✅ Nenhum componente não utilizado encontrado!"
else
  echo "⚠️  Componentes potencialmente não utilizados: ${#unused[@]}"
  echo ""
  echo "Lista:"
  for component in "${unused[@]}"; do
    echo "  - $component"
  done
  echo ""
  echo "⚠️  ATENÇÃO: Verifique manualmente antes de deletar!"
  echo "   - Componentes podem ser usados em rotas dinâmicas"
  echo "   - Podem ser importados via lazy loading"
  echo "   - Podem estar em desenvolvimento"
fi

echo ""
echo "✅ Análise concluída"
