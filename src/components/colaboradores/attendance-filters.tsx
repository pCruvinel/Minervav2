import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface AttendanceFiltersProps {
    searchTerm: string;
    setorFilter: string;
    statusFilter: string;
    onSearchChange: (value: string) => void;
    onSetorChange: (value: string) => void;
    onStatusChange: (value: string) => void;
}

export function AttendanceFilters({
    searchTerm,
    setorFilter,
    statusFilter,
    onSearchChange,
    onSetorChange,
    onStatusChange,
}: AttendanceFiltersProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Busca por Nome */}
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar colaborador..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Filtro por Setor */}
                    <Select value={setorFilter} onValueChange={onSetorChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por Setor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Setores</SelectItem>
                            <SelectItem value="obras">Obras</SelectItem>
                            <SelectItem value="administrativo">Administrativo</SelectItem>
                            <SelectItem value="assessoria">Assessoria</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filtro por Status */}
                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Status</SelectItem>
                            <SelectItem value="OK">Presente (OK)</SelectItem>
                            <SelectItem value="ATRASADO">Atrasado</SelectItem>
                            <SelectItem value="FALTA">Falta</SelectItem>
                            <SelectItem value="FALTA_JUSTIFICADA">Falta Justificada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
