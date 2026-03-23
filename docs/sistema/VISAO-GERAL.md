# 01 - Visão Geral do Projeto - Minerva ERP v2.7

## 📋 Informações Básicas

| Campo | Valor |
|-------|-------|
| **Nome do Projeto** | Minerva ERP |
| **Versão** | 2.7 (Transferência Automática de Setor) |
| **Data de Início** | Setembro/2025 |
| **Status** | Em Desenvolvimento Ativo |
| **Cliente/Stakeholder** | Minerva Engenharia |
| **Equipe** | Desenvolvimento Interno + IA |

## 🎯 Resumo Executivo

O **Minerva ERP** é uma plataforma SaaS para gestão de engenharia civil e construção, projetada para a Minerva Engenharia. O sistema centraliza 13 tipos de Ordens de Serviço (OS) com workflows polimórficos, garantindo padronização operacional e segurança de dados por setor.

A versão 2.7 introduz o **Sistema de Transferência Automática de Setor**, que detecta mudanças de responsabilidade entre etapas e executa handoffs automáticos com notificação de coordenadores.

## 💡 Problema e Solução

### Problema
Empresas de engenharia operam com processos fragmentados: planilhas paralelas, comunicação informal para delegação de tarefas, e falta de visibilidade do status dos projetos. Isso gera retrabalho, perda de informações e atrasos.

### Solução Proposta
Uma plataforma unificada onde equipes podem:
- Criar e gerenciar OS com workflows guiados (1 a 17 etapas)
- Transferir automaticamente responsabilidade entre setores
- Agendar visitas com controle de vagas e conflitos
- Gerar propostas e contratos em PDF automaticamente
- Acompanhar progresso em dashboards personalizados

## 👥 Personas

### Persona 1: Gestor Administrativo (Super Gestor)
- **Contexto**: Gerencia processos comerciais e contratos
- **Acesso**: Transversal (Obras + Assessoria + Financeiro)
- **Objetivos**: Garantir fluxo contínuo de OS, conciliação financeira
- **Como usa**: Dashboard diário, gestão de contratos, delegações

### Persona 2: Gestor de Obras
- **Contexto**: Coordena equipes de campo e execução técnica
- **Acesso**: Isolado ao setor Obras
- **Objetivos**: Receber OS prontas para execução, controlar cronogramas
- **Como usa**: Lista de OS, calendário de visitas, relatórios técnicos

### Persona 3: Colaborador
- **Contexto**: Executa tarefas operacionais dentro de sua área
- **Acesso**: Restrito às próprias OS e delegações
- **Objetivos**: Completar etapas atribuídas eficientemente
- **Como usa**: Workflow de etapas, checklists, upload de documentos

## 🚀 Escopo do Projeto

### Features MVP (v2.0 - v2.7)
1. **13 Tipos de OS** com workflows personalizados
2. **Sistema de Permissões (RLS)** por setor e nível
3. **Calendário de Agendamentos** com turnos e vagas
4. **Geração de PDFs** (propostas, contratos, laudos)
5. **Dashboard Responsivo** com KPIs por perfil
6. **Transferência Automática de Setor** (v2.7)

### Features Pós-MVP
- App Mobile Offline-First
- Integração WhatsApp Business
- Portal de Documentos para Clientes
- Business Intelligence avançado

### Fora do Escopo (v2.7)
- ❌ Integração com outros ERPs
- ❌ E-commerce de serviços
- ❌ Video calls integrados

## 🏗️ Stack Tecnológica

### Frontend
- **Framework**: React 18 + Vite
- **Linguagem**: TypeScript (strict mode)
- **Estilização**: Tailwind CSS v3
- **Componentes**: Shadcn/ui (Radix + Tailwind)
- **Forms**: React Hook Form + Zod
- **Roteamento**: TanStack Router

### Backend
- **BaaS**: Supabase
  - PostgreSQL Database
  - Authentication (JWT)
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Edge Functions (Hono, React-PDF)
  - Storage (arquivos, documentos)

### Infraestrutura
- **Hosting Frontend**: Vercel
- **Hosting Backend**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Supabase Logs

---

**Status**: ✅ Preenchido para Minerva v2.7
**Última Atualização**: 11/12/2025
**Próximo Documento**: [02-ARQUITETURA.md](./ARQUITETURA.md)