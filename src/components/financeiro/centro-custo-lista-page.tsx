import { useState, useEffect } from "react";
import { useRouter } from '@tanstack/react-router';
import { 
  Building, 
  Search, 
  ArrowRight, 
  Plus,
  ShieldCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CompactTableWrapper, 
  CompactTableHead, 
  CompactTableRow, 
  CompactTableCell 
} from "@/components/shared/compact-table";
import { useCentroCusto, CentroCusto } from "@/lib/hooks/use-centro-custo";
import { PageHeader } from "@/components/shared/page-header";

export function CentroCustoListaPage() {
  const router = useRouter();
  const { listCentrosCusto } = useCentroCusto();
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [filteredCCs, setFilteredCCs] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state (client-side for now)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await listCentrosCusto();
        setCentrosCusto(data);
        setFilteredCCs(data);
      } catch (error) {
        console.error("Erro ao carregar centros de custo:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [listCentrosCusto]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = centrosCusto.filter(cc => 
      cc.nome.toLowerCase().includes(term) || 
      (cc.descricao && cc.descricao.toLowerCase().includes(term))
    );
    setFilteredCCs(filtered);
    setCurrentPage(1); // Reset page on filter
  }, [searchTerm, centrosCusto]);

  // Pagination logic
  const totalItems = filteredCCs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = filteredCCs.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Centros de Custo" 
          subtitle="Gerenciamento de projetos e centros de responsabilidade"
          showBackButton
        />
        <Button onClick={() => {
            // router.navigate({ to: '/financeiro/centro-custo/novo' })
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Centro de Custo
        </Button>
      </div>

      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-4">
           <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                className="pl-8 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </div>

        <CompactTableWrapper
          title="Listagem Geral"
          subtitle={`${totalItems} registros encontrados`}
          totalItems={totalItems}
          currentCount={paginatedItems.length}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <CompactTableHead>Nome / Identificador</CompactTableHead>
                <CompactTableHead>Descrição</CompactTableHead>
                <CompactTableHead className="w-32">Tipo</CompactTableHead>
                <CompactTableHead className="text-right w-24">Ações</CompactTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((cc) => (
                  <CompactTableRow 
                    key={cc.id} 
                    className="cursor-pointer"
                    onClick={() => router.navigate({ to: `/financeiro/centro-custo/${cc.id}` })}
                  >
                    <CompactTableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary/70" />
                        {cc.nome}
                      </div>
                    </CompactTableCell>
                    <CompactTableCell className="text-muted-foreground">
                      {cc.descricao || '-'}
                    </CompactTableCell>
                    <CompactTableCell>
                      {cc.is_sistema ? (
                        <Badge 
                          variant="outline" 
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Sistema
                        </Badge>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className={cc.tipo === 'fixo' ? 'bg-secondary/10 text-secondary-foreground border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}
                        >
                          {cc.tipo === 'fixo' ? 'Fixo' : 'Variável'}
                        </Badge>
                      )}
                    </CompactTableCell>
                    <CompactTableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.navigate({ to: `/financeiro/centro-custo/${cc.id}` });
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CompactTableCell>
                  </CompactTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Nenhum centro de custo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CompactTableWrapper>
      </div>
    </div>
  );
}
