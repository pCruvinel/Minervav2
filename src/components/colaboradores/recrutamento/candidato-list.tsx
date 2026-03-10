import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Users } from 'lucide-react';
import { useCandidatosByVaga } from '@/lib/hooks/use-recrutamento';
import { CandidatoCard } from './candidato-card';
import { ModalAdicionarCandidato } from './modal-adicionar-candidato';

interface CandidatoListProps {
  vagaId: string;
}

export function CandidatoList({ vagaId }: CandidatoListProps) {
  const { candidatos, loading, refetch } = useCandidatosByVaga(vagaId);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSuccess = () => {
    setModalOpen(false);
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Mural de Candidatos ({candidatos.length})
        </h4>
        <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="bg-muted/20 rounded-lg p-4 min-h-[150px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-sm">Carregando candidatos...</p>
          </div>
        ) : candidatos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">Nenhum candidato vinculado ainda.</p>
            <p className="text-xs mt-1">Candidatos adicionados aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidatos.map((vinculo) => (
              <CandidatoCard key={vinculo.id} vinculo={vinculo} />
            ))}
          </div>
        )}
      </div>

      <ModalAdicionarCandidato
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        vagaId={vagaId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
