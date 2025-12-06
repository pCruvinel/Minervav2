"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  Send,
  Building2,
  MapPin,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner@2.0.3";
// TODO: Arquivo mock-data-colaborador foi removido - implementar fetch do Supabase
// import { mockOrdensServico } from "@/lib/mock-data-colaborador";

// TODO: Substituir mock por fetch real do Supabase (tabela ordens_servico)
const mockOS: Record<number, any> = {};

export default function DetalhesOSExecucaoPage() {
  const params = useParams();
  const router = useRouter();
  const osId = Number(params.id);
  const os = mockOS[osId as keyof typeof mockOS];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    observacoes: "",
    checklistItems: {
      estrutura: false,
      instalacoes: false,
      acabamento: false,
      seguranca: false,
      acessibilidade: false,
    },
    medicoes: "",
    fotos: "",
  });

  if (!os) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 border-border">
          <p className="text-muted-foreground">OS não encontrada</p>
          <Link href="/colaborador/minhas-os">
            <Button className="mt-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-black">
              Voltar para Minhas OS
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleSalvarRascunho = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Rascunho salvo com sucesso!");
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSubmeterAprovacao = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("OS enviada para aprovação do gestor!");
      setIsSubmitting(false);
      router.push("/colaborador/minhas-os");
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "atrasado":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "em_andamento":
        return "bg-primary/10 text-primary border-primary/20";
      case "pendente":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/colaborador/minhas-os">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-black"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Badge variant="outline" className={getStatusColor(os.status)}>
              {os.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-black mb-2">{os.codigo}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{os.cliente}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{os.endereco}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Formulário de Execução */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações da Etapa */}
            <Card className="p-6 border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h2 className="text-black">
                    {os.etapaAtual.replace(/_/g, " ")}
                  </h2>
                  <p className="text-muted-foreground">Formulário de Execução</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Checklist de Vistoria */}
                {os.etapaAtual === "VISTORIA" && (
                  <div>
                    <Label className="text-black mb-3 block">
                      Checklist de Vistoria
                    </Label>
                    <div className="space-y-3 bg-background p-4 rounded-lg border border-border">
                      {[
                        {
                          id: "estrutura",
                          label: "Estrutura (pilares, vigas, lajes)",
                        },
                        {
                          id: "instalacoes",
                          label: "Instalações elétricas e hidráulicas",
                        },
                        { id: "acabamento", label: "Acabamento e revestimentos" },
                        { id: "seguranca", label: "Segurança e sinalização" },
                        { id: "acessibilidade", label: "Acessibilidade" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <Checkbox
                            id={item.id}
                            checked={
                              formData.checklistItems[
                                item.id as keyof typeof formData.checklistItems
                              ]
                            }
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                checklistItems: {
                                  ...formData.checklistItems,
                                  [item.id]: checked,
                                },
                              })
                            }
                          />
                          <Label
                            htmlFor={item.id}
                            className="text-muted-foreground cursor-pointer"
                          >
                            {item.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medições e Observações */}
                <div>
                  <Label htmlFor="medicoes" className="text-black mb-2 block">
                    Medições e Dados Técnicos
                  </Label>
                  <Textarea
                    id="medicoes"
                    placeholder="Registre medidas, cálculos e informações técnicas coletadas..."
                    value={formData.medicoes}
                    onChange={(e) =>
                      setFormData({ ...formData, medicoes: e.target.value })
                    }
                    className="min-h-[120px] border-border"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="observacoes"
                    className="text-black mb-2 block"
                  >
                    Observações Gerais
                  </Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Descreva observações importantes, anomalias encontradas ou recomendações..."
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    className="min-h-[120px] border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="fotos" className="text-black mb-2 block">
                    Evidências Fotográficas
                  </Label>
                  <Input
                    id="fotos"
                    type="file"
                    multiple
                    accept="image/*"
                    className="border-border"
                  />
                  <p className="text-muted-foreground mt-1">
                    Anexe fotos da vistoria/execução (máx. 10 arquivos)
                  </p>
                </div>
              </div>
            </Card>

            {/* Ações de Execução */}
            <Card className="p-6 border-border">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleSalvarRascunho}
                  disabled={isSubmitting}
                  className="flex-1 border-border text-black hover:bg-muted"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button
                  onClick={handleSubmeterAprovacao}
                  disabled={isSubmitting}
                  className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-black"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submeter para Aprovação
                </Button>
              </div>
              <p className="text-muted-foreground mt-3 text-center">
                Após submeter, a OS será bloqueada para edição e enviada ao
                gestor
              </p>
            </Card>
          </div>

          {/* Sidebar - Informações da OS */}
          <div className="space-y-6">
            <Card className="p-6 border-border">
              <h3 className="text-black mb-4">Informações</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground mb-1">Tipo de OS</p>
                  <Badge
                    variant="outline"
                    className="border-[var(--primary)] text-black bg-[var(--primary)]/10"
                  >
                    {os.tipo}
                  </Badge>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Cliente</p>
                  <p className="text-black">{os.cliente}</p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Endereço</p>
                  <p className="text-black">{os.endereco}</p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Telefone</p>
                  <p className="text-black">{os.telefone}</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Responsável</p>
                  </div>
                  <p className="text-black">{os.responsavel}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Prazo</p>
                  </div>
                  <p className="text-black">
                    {new Date(os.prazo).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Prioridade</p>
                  <Badge
                    variant="outline"
                    className={
                      os.prioridade === "ALTA"
                        ? "bg-destructive/5 text-destructive border-destructive/30"
                        : os.prioridade === "MEDIA"
                        ? "bg-warning/5 text-warning border-warning/30"
                        : "bg-success/5 text-success border-success/30"
                    }
                  >
                    {os.prioridade}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border">
              <h3 className="text-black mb-2">Descrição</h3>
              <p className="text-muted-foreground">{os.descricao}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}