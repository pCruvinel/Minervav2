import { useState, useEffect, useMemo } from "react";
import { useRouter } from '@tanstack/react-router';
import { 
  Building, 
  Search, 
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useLucratividadeAllCCs, LucratividadeCC } from "@/lib/hooks/use-lucratividade-cc";
import { formatCurrency as formatarMoeda } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";

export function CentroCustoListaPage() {
  const router = useRouter();
  const { listCentrosCusto } = useCentroCusto();
  const { data: lucratividadeData } = useLucratividadeAllCCs();

  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await listCentrosCusto();
        setCentrosCusto(data);
      } catch (error) {
        console.error("Erro ao carregar centros de custo:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [listCentrosCusto]);

  // Map de lucratividade por CC ID para lookup rápido
  const lucratividadeMap = useMemo(() => {
    const map = new Map<string, LucratividadeCC>();
    lucratividadeData?.forEach((item) => {
      map.set(item.cc_id, item);
    });
    return map;
  }, [lucratividadeData]);

  // Filter: excluir CCs do tipo "Sistema" + busca textual
  const filteredCCs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return centrosCusto
      .filter(cc => !cc.is_sistema) // Exclui CCs de sistema
      .filter(cc =>
        cc.nome.toLowerCase().includes(term) ||
        (cc.descricao && cc.descricao.toLowerCase().includes(term))
      );
  }, [searchTerm, centrosCusto]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
                <CompactTableHead align="right" className="w-32">Receita</CompactTableHead>
                <CompactTableHead align="right" className="w-32">Custo</CompactTableHead>
                <CompactTableHead align="right" className="w-32">Lucro</CompactTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((cc) => {
                  const fin = lucratividadeMap.get(cc.id);
                  const receita = Number(fin?.receita_realizada ?? 0);
                  const custo = Number(fin?.custo_total_realizado ?? 0);
                  const lucro = Number(fin?.lucro_realizado ?? 0);

                  return (
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
                      <CompactTableCell className="text-right tabular-nums">
                        {formatarMoeda(receita)}
                      </CompactTableCell>
                      <CompactTableCell className="text-right tabular-nums">
                        {formatarMoeda(custo)}
                      </CompactTableCell>
                      <CompactTableCell className={`text-right font-medium tabular-nums ${lucro >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatarMoeda(lucro)}
                      </CompactTableCell>
                    </CompactTableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
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
