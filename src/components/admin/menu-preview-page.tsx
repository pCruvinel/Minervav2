// Página de Demonstração: Visualização de Menu por Perfil
// Permite visualizar como o menu lateral é exibido para cada tipo de usuário

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  LayoutDashboard,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { RoleLevel, ROLE_NAMES } from '../../lib/types';

// ============================================================
// INTERFACE DOS ITENS DE MENU
// ============================================================

interface MenuItem {
  id: string;
  label: string;
  icon: any;
}

interface MenuPreviewPageProps {
  onBack?: () => void;
}

const allMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projetos', label: 'Projetos / OS', icon: FileText },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'colaboradores', label: 'Colaboradores', icon: Users },
  { id: 'clientes', label: 'Clientes', icon: Building2 },
  { id: 'calendario', label: 'Calendário', icon: Calendar },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

// ============================================================
// MAPEAMENTO DE ITENS VISÍVEIS POR PERFIL
// ============================================================

const visibilityByRole: Record<RoleLevel, string[]> = {
  // DIRETORIA: Acesso completo
  'diretoria': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],

  // GESTORES: Acesso completo
  'gestor_administrativo': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  'gestor_assessoria': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  'gestor_obras': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],

  // COLABORADORES: Acesso limitado
  'colaborador': ['dashboard', 'projetos', 'clientes', 'calendario'],

  // ADMIN
  'admin': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],

  // MOBRA: Acesso mínimo
  'mao_de_obra': ['dashboard'],
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function MenuPreviewPage({ onBack }: MenuPreviewPageProps) {
  const [selectedRole, setSelectedRole] = useState<RoleLevel>('colaborador');

  const availableRoles: RoleLevel[] = [
    'diretoria',
    'gestor_administrativo',
    'gestor_assessoria',
    'gestor_obras',
    'colaborador',
    'mao_de_obra',
    'admin'
  ];

  const visibleItems = visibilityByRole[selectedRole];

  return (
    <div className="p-8 space-y-8 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Preview de Menu por Perfil</h1>
        <p className="text-neutral-600">
          Visualize como o menu lateral aparece para diferentes perfis de usuário no sistema.
        </p>
      </div>

      {/* Seletor de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione um Perfil</CardTitle>
          <CardDescription>
            Escolha um perfil para ver quais itens do menu estarão visíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableRoles.map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                onClick={() => setSelectedRole(role)}
                className="justify-start h-auto py-3 px-4"
              >
                <div className="text-left w-full">
                  <div className="text-sm">{ROLE_NAMES[role]}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {role === 'diretoria' || role === 'admin' ? 'Acesso Total' :
                      role.includes('gestor') ? 'Acesso Completo' :
                        role === 'colaborador' ? 'Acesso Limitado' :
                          'Acesso Mínimo'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visualização do Menu */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Lista de Itens Visíveis */}
        <Card>
          <CardHeader className="bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <CardTitle className="text-green-900">Itens Visíveis</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Estes itens aparecem no menu lateral para {ROLE_NAMES[selectedRole]}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {visibleItems.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  Nenhum item visível para este perfil
                </p>
              ) : (
                visibleItems.map((itemId) => {
                  const item = allMenuItems.find(m => m.id === itemId);
                  if (!item) return null;

                  const Icon = item.icon;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <Icon className="w-5 h-5 text-green-700" />
                      <span className="flex-1">{item.label}</span>
                      <Badge variant="outline" className="bg-white border-green-300 text-green-700">
                        Visível
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Itens Ocultos */}
        <Card>
          <CardHeader className="bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Itens Ocultos</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Estes itens NÃO aparecem no menu para {ROLE_NAMES[selectedRole]}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {allMenuItems.filter(item => !visibleItems.includes(item.id)).length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  Todos os itens são visíveis para este perfil
                </p>
              ) : (
                allMenuItems
                  .filter(item => !visibleItems.includes(item.id))
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50 opacity-60"
                      >
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <Icon className="w-5 h-5 text-red-700" />
                        <span className="flex-1 line-through">{item.label}</span>
                        <Badge variant="outline" className="bg-white border-red-300 text-red-700">
                          Oculto
                        </Badge>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Visibilidade</CardTitle>
          <CardDescription>
            Estatísticas de acesso para o perfil selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-neutral-50 rounded-lg border">
              <div className="text-3xl mb-2">{allMenuItems.length}</div>
              <div className="text-sm text-neutral-600">Total de Itens</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl text-green-700 mb-2">{visibleItems.length}</div>
              <div className="text-sm text-green-800">Itens Visíveis</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-3xl text-red-700 mb-2">
                {allMenuItems.length - visibleItems.length}
              </div>
              <div className="text-sm text-red-800">Itens Ocultos</div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Regras de Visibilidade */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Regras de Visibilidade
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                <p>
                  <strong>DIRETORIA:</strong> Acesso completo a todos os módulos do sistema
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                <p>
                  <strong>GESTORES:</strong> Acesso completo aos módulos operacionais e gerenciais
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                <p>
                  <strong>COLABORADORES:</strong> Acesso limitado - Dashboard, Projetos/OS, Clientes e Calendário
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                <p>
                  <strong>MOBRA:</strong> Acesso mínimo - Apenas Dashboard (se aplicável)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Voltar */}
      {onBack && (
        <Button
          variant="outline"
          className="mt-8"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Button>
      )}
    </div>
  );
}