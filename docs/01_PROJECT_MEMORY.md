# 🧠 Memória do Projeto

> **Status**: Ativo
> **Última Atualização**: 2026-01-14

## 📌 Contexto Atual
O projeto está em fase de **Estabilidade e Produção**. O foco recente foi na implementação de funcionalidades críticas de workflow e delegação de responsabilidades.

## 🚀 Funcionalidades Recentes

### Sistema de Delegação (Jan/2026)
Foi implementado um sistema robusto para delegação de etapas de OS:
- **Componente**: `OSHeaderDelegacao` (refatorado para autonomia).
- **Interface**: Acessível via menu "três pontos" na tela de detalhes da OS (`OSDetailsRedesignPage`).
- **Banco de Dados**: Tabelas `os_participantes` e `os_etapas_responsavel`.
- **Correção Crítica**: Adaptação das queries para usar `os_id` na tabela `os_etapas` (o schema original sugeria `ordem_servico_id`).

## 🛠 Decisões Técnicas
1. **Centralização da Lógica de Delegação**: Manter toda a lógica de negócio (busca de usuários, validação de regras) dentro do componente `OSHeaderDelegacao` para facilitar reuso.
2. **Modal vs Inline**: Optou-se por usar um Modal (`Dialog`) acionado pelo menu para a delegação na tela de detalhes, mantendo a interface principal limpa.
3. **Tipagem de Usuário**: Utilização de `cargo_slug` em vez de `funcao` para verificar permissões, alinhando com o `AuthProvider` atual.

## 🐛 Bugs Conhecidos e Correções
- **Erro 400 em Fetch de Etapas**: Causado por nome de coluna incorreta (`ordem_servico_id` explicita vs `os_id` real). **Corrigido**.
- **Acessibilidade Dialog**: Avisos de falta de `DialogDescription` corrigidos.

## 📝 Próximos Passos Sugeridos
- Monitorar uso da funcionalidade de delegação.
- Expandir testes automatizados para cobrir fluxos de delegação.
