import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { User } from '../../lib/types';
import { tiposOS, mockUsers } from '../../lib/mock-data';

interface OSFiltersCardProps {
  currentUser: User;
  searchTerm: string;
  statusFilter: string;
  tipoOSFilter: string;
  setorFilter: string;
  responsavelFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTipoOSChange: (value: string) => void;
  onSetorChange: (value: string) => void;
  onResponsavelChange: (value: string) => void;
}

export function OSFiltersCard({
  currentUser,
  searchTerm,
  statusFilter,
  tipoOSFilter,
  setorFilter,
  responsavelFilter,
  onSearchChange,
  onStatusChange,
  onTipoOSChange,
  onSetorChange,
  onResponsavelChange,
}: OSFiltersCardProps) {
  const canViewSetorFilter = currentUser.role === 'diretoria' || currentUser.role === 'gestor_adm';
  const canViewResponsavelFilter = currentUser.role !== 'colaborador';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Busca */}
          <Input
            placeholder="Buscar por Código ou Cliente..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          {/* Filtro por Status */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="em_triagem">Em Triagem</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
              <SelectItem value="atrasada">Atrasada</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro por Tipo de OS */}
          <Select value={tipoOSFilter} onValueChange={onTipoOSChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              {tiposOS.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por Setor (apenas para Diretoria e Gestor ADM) */}
          {canViewSetorFilter && (
            <Select value={setorFilter} onValueChange={onSetorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Setores</SelectItem>
                <SelectItem value="obras">Obras</SelectItem>
                <SelectItem value="assessoria">Assessoria</SelectItem>
                <SelectItem value="interno">Interno</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Filtro por Responsável (não visível para Colaborador) */}
          {canViewResponsavelFilter && (
            <Select value={responsavelFilter} onValueChange={onResponsavelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Responsáveis</SelectItem>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
