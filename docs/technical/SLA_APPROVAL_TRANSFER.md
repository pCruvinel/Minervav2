# Documentação Técnica: SLA, Aprovação e Transferência

> **Última atualização:** 05/01/2026
> **Módulos:** SLA (Prazos), Workflow de Aprovação, Transferência de Setor
> **Status:** Em Produção

Esta documentação detalha a arquitetura técnica, implementação e uso dos três pilares centrais de governança do sistema MinervaV2: controle de prazos (SLA), validação hierárquica (Aprovação) e fluxo de responsabilidade (Transferência).

---

## 1. Sistema de SLA (Service Level Agreement)

O sistema de SLA gerencia os prazos de cada etapa das Ordens de Serviço, fornecendo indicadores visuais de saúde do processo (semáforo) e permitindo configuração dinâmica pela diretoria.

### 1.1 Arquitetura de Dados

A configuração dos prazos reside na tabela `os_etapas_config`:

```sql
CREATE TABLE os_etapas_config (
  id uuid PRIMARY KEY,
  tipo_os_id uuid REFERENCES tipos_os,
  etapa_numero integer, -- Número da etapa no workflow (1-15)
  prazo_dias_uteis integer DEFAULT 2, -- O SLA configurado
  requer_aprovacao boolean DEFAULT false, -- Configuração de Aprovação
  ...
);
```

### 1.2 Cálculo de Status (Lógica de Negócio)

O cálculo do status situacional é armazenado na coluna `status_situacao` da tabela `ordens_servico` e calculado com base no prazo da etapa.

> **📖 Documentação completa:** [STATUS_SYSTEM.md](./STATUS_SYSTEM.md)

A lógica segue a regra "Data de Início da Etapa + Prazo (Dias Úteis) vs Data Atual":

| Status Situação | Código | Regra Lógica | UI (Cor) |
|-----------------|--------|--------------|----------|
| **Ação Pendente** | `acao_pendente` | Default | 🔵 Azul (`bg-primary/10`) |
| **Alerta** | `alerta_prazo` | Data Atual >= (Prazo - 2 dias) E Data Atual <= Prazo | 🟡 Amarelo (`bg-warning`) |
| **Atrasado** | `atrasado` | Data Atual > Prazo | 🔴 Vermelho (`bg-destructive`) |
| **Aguard. Aprovação** | `aguardando_aprovacao` | Etapa com `requer_aprovacao = true` | 🟣 Secundário (`bg-secondary`) |
| **Aguard. Info** | `aguardando_info` | Marcação manual pelo usuário | 🟠 Warning (`bg-warning/20`) |
| **Finalizado** | `finalizado` | OS concluída ou cancelada | ⚪ Muted (`bg-muted`) |

### 1.3 Componentes Frontend

#### Hook de Configuração (`useSlaConfig`)
Local: `src/lib/hooks/use-sla-config.ts`

Gerencia a leitura e escrita das configurações de SLA.
- **Funcionalidades:** `fetchEtapas`, `updatePrazo`, `updateMultiplosPrazos`, `restaurarPadrao`.
- **Auditoria:** Toda alteração é logada na tabela `os_etapas_config_audit`.

#### Interface de Gestão (`SlaSettingsTab`)
Local: `src/components/dashboard/executive/sla-settings-tab.tsx`

Acessível apenas para `admin` e `diretor` via Dashboard Executivo. Permite:
- Visualizar todos os prazos por Tipo de OS.
- Editar prazos em lote.
- Restaurar padrões.
- Ativar/Desativar obrigatoriedade de aprovação.

### 1.4 Cálculo Automático de Prazo (Deadline)

O sistema calcula automaticamente a `data_prazo` da OS no momento da criação.

#### Lógica de Cálculo
Fórmula: `Data Abertura + Soma(Prazos das Etapas) + 1 dia útil`

1.  **Soma de Prazos:** Agrega o `prazo_dias_uteis` de todas as etapas ativas do Tipo de OS.
2.  **Adicional:** Acrescenta +1 dia útil (regra de negócio para gordura/margem).
3.  **Dias Úteis:** O cálculo ignora:
    - Fins de semana (Sábado e Domingo).
    - Feriados e bloqueios registrados na tabela `calendario_bloqueios`.

#### Componentes de Banco de Dados
- **Tabela `calendario_bloqueios`**: Fonte de dados para dias não úteis.
- **Função `is_business_day(date)`**: Verifica se um dia é útil.
- **Função `add_business_days(date, int)`**: Adiciona N dias úteis a uma data.
- **Função `calculate_os_deadline(tipo_os_id, start_date)`**: Orquestra o cálculo total.
- **Trigger `trg_set_os_deadline`**: Define `data_prazo` automaticamente no `INSERT` em `ordens_servico`.

---

## 2. Sistema de Aprovação (Approval Workflow)

O sistema de aprovação introduz "Checkpoints de Validação" no fluxo, impedindo o avanço da OS até que um gestor autorize.

### 2.1 Fluxo de Estados

Uma etapa com `requer_aprovacao = true` passa pelos seguintes estados (`StatusAprovacao`):

1.  **`pendente`**: O colaborador concluiu o trabalho, mas ainda não solicitou aprovação.
    *   *Ação:* Colaborador clica "Solicitar Aprovação".
2.  **`solicitada`**: A solicitação foi enviada.
    *   *Bloqueio:* O botão "Avançar Etapa" fica bloqueado.
    *   *Notificação:* Coordenadores recebem alerta.
3.  **`aprovada`**: O gestor aprovou.
    *   *Ação:* O fluxo é desbloqueado e avança automaticamente ou permite avanço manual.
4.  **`rejeitada`**: O gestor rejeitou com motivo.
    *   *Ação:* Retorna ao estado inicial para correção. O colaborador é notificado.

### 2.2 Hook de Controle (`useAprovacaoEtapa`)
Local: `src/lib/hooks/use-aprovacao-etapa.ts`

Centraliza a lógica de aprovação:
- **Verificação:** `verificarAprovacao()` checa o status atual no banco.
- **Ações:** `solicitarAprovacao()`, `confirmarAprovacao()`, `rejeitarAprovacao()`.
- **Notificações:** Envia notificações automáticas para envolvidos via tabela `notificacoes`.

### 2.3 Componente UI (`AprovacaoModal`)
Local: `src/components/os/shared/components/aprovacao-modal.tsx`

Modal responsivo que se adapta ao perfil do usuário:
- **Operacional:** Vê campo de justificativa e botão "Solicitar".
- **Gestor:** Vê detalhes da solicitação e botões "Aprovar" / "Rejeitar".

**Exemplo de Uso:**
```tsx
const { statusAprovacao, solicitarAprovacao } = useAprovacaoEtapa(osId, currentStep);

// No render:
<AprovacaoModal
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  osId={osId}
  etapaOrdem={currentStep}
  etapaNome="Gerar Proposta"
/>
```

---

## 3. Sistema de Transferência (Setor Handoffs)

Automatiza a passagem de bastão entre departamentos (ex: Administrativo -> Obras -> Assessoria) baseada no avanço das etapas.

### 3.1 Regras de Propriedade (`Ownership Rules`)
Local: `src/lib/constants/os-ownership-rules.ts`

Define estaticamente quem é dono de cada etapa e onde ocorrem as trocas:

```typescript
// Exemplo parcial
export const OS_OWNERSHIP = {
  'OS-01': {
    // ...
    handoffs: [
      { fromStep: 4, toStep: 5, toSetor: 'obras' }, // Admin -> Obras
      { fromStep: 9, toStep: 10, toSetor: 'administrativo' } // Obras -> Admin
    ]
  }
}
```

### 3.2 Hook de Execução (`useTransferenciaSetor`)
Local: `src/lib/hooks/use-transferencia-setor.ts`

Monitora o avanço de etapas e executa a transferência se detectar um `handoff`:
1.  **Detecção:** `verificarMudancaSetor(etapaAtual, proximaEtapa)`.
2.  **Execução:** `executarTransferencia(...)`.
    *   Atualiza `setor_atual_id` e `responsavel_id` na OS.
    *   Registra na tabela `os_transferencias`.
    *   Cria log em `os_atividades`.
    *   Notifica o coordenador do setor de destino.

### 3.3 Componente UI (`FeedbackTransferencia`)
Local: `src/components/os/shared/components/feedback-transferencia.tsx`

Modal de feedback imediato ao usuário que realizou a ação que desencadeou a transferência.
- Exibe: "Etapa Concluída! OS transferida para [Novo Setor]".
- Timer: Redirecionamento automático em 5 segundos para a página de detalhes (update de UI).

---

## 4. Integração Geral

### Onde tudo se conecta
No arquivo `src/components/os/shared/pages/os-details-workflow-page.tsx`:

1.  **Hook `useTransferenciaSetor`** é instanciado.
2.  **Hook `useAprovacaoEtapa`** é instanciado.
3.  O avanço de etapa checa `podeAprovar`.
4.  Se aprovado/não requer aprovação, o avanço chama `executarTransferencia`.
5.  Se houve transferência, exibe `FeedbackTransferencia`.
6.  Se requer aprovação, exibe `AprovacaoModal`.

### Database Tables Essenciais
*   `os_etapas_config`: Configurações de SLA e Aprovação.
*   `os_transferencias`: Histórico de todas as transferências.
*   `os_atividades`: Log unificado de ações (aprovações, rejeições, transferências).
*   `notificacoes`: Alertas gerados pelos hooks.
