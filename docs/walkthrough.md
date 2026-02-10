# Walkthrough: Centro de Custo Module Alignment

## 🎯 Objetivos Alcançados

1.  **Eliminação de Mock Data**: O frontend agora consome dados 100% reais do banco de dados.
2.  **Automação Financeira**: Custos iniciais (Impostos e Comissões) são gerados automaticamente ao criar um CC, baseados na configuração global.
3.  **Gestão de Overhead**: Nova estrutura para rateio de custos indiretos.

## 🛠 Alterações Realizadas

### 1. Banco de Dados (Schema)

- **Nova Tabela**: `custos_overhead_mensal` para rateio de custos administrativos.
- **Seeding**: Categorias financeiras críticas ('Impostos', 'Comissão', 'Overhead') garantidas no banco.
- **Configuração**: Adicionado suporte para OS-13 (Obras) em `precificacao_config` (Imposto 17%, Comissão 1.5%).

### 2. Backend Logic (PL/pgSQL)

- **Trigger**: `gerar_custos_iniciais_cc()` executa após insert de CC. Lê configurações dinâmicas e insere em `contas_pagar`.
- **Views**:
    - `vw_lucratividade_cc`: Agora consolida Overhead.
    - `vw_overhead_por_cc`: Agrega custos indiretos.
    - `vw_receitas_por_cc` / `vw_custos_operacionais_por_cc`: Refinadas para maior precisão de status.

### 3. Frontend

- **Página de Detalhes (`centro-custo-detalhes-page.tsx`)**:
    - Removidos objetos `mockCentroCusto`, `mockLancamentos`.
    - Integrado com hooks `useLucratividadeCC`, `useCCDetalhes`.
    - Adicionada aba **Overhead**.
- **Hooks**:
    - `use-cc-detalhes.ts`: Adicionado suporte a Overhead.
    - `use-lucratividade-cc.ts`: Migrado para nova View consolidada.

## 📸 Demonstração

### Fluxo Automático
1. Criar Nota Fiscal / OS.
2. Trigger dispara -> Cria "Provisão de Impostos" em `contas_pagar`.
3. Dashboard Financeiro reflete custos previstos imediatamente.

### Nova Aba Overhead
Exibe o histórico de rateio mensal, separado por Escritório e Setor.

```sql
-- Exemplo de consulta de overhead
SELECT * FROM custos_overhead_mensal WHERE cc_id = '...';
```

## ✅ Validação
- **Build**: Sucesso (`npm run build` passed).
- **Tipagem**: Interfaces TypeScript atualizadas para refletir o schema real.
