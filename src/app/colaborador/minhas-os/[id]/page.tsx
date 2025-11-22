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
import { mockOrdensServico } from "@/lib/mock-data-colaborador";

// Mock de dados - substituir por API real
const mockOS = mockOrdensServico.reduce((acc, os) => {
  acc[os.id] = os;
  return acc;
}, {} as Record<number, typeof mockOrdensServico[0]>);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 border-gray-200">
          <p className="text-gray-600">OS não encontrada</p>
          <Link href="/colaborador/minhas-os">
            <Button className="mt-4 bg-[#D3AF37] hover:bg-[#D3AF37]/90 text-black">
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
        return "bg-red-100 text-red-800 border-red-200";
      case "em_andamento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/colaborador/minhas-os">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-black"
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
              <div className="flex items-center gap-4 text-gray-600">
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
            <Card className="p-6 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#D3AF37]/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#D3AF37]" />
                </div>
                <div>
                  <h2 className="text-black">
                    {os.etapaAtual.replace(/_/g, " ")}
                  </h2>
                  <p className="text-gray-600">Formulário de Execução</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Checklist de Vistoria */}
                {os.etapaAtual === "VISTORIA" && (
                  <div>
                    <Label className="text-black mb-3 block">
                      Checklist de Vistoria
                    </Label>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                            className="text-gray-700 cursor-pointer"
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
                    className="min-h-[120px] border-gray-300"
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
                    className="min-h-[120px] border-gray-300"
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
                    className="border-gray-300"
                  />
                  <p className="text-gray-500 mt-1">
                    Anexe fotos da vistoria/execução (máx. 10 arquivos)
                  </p>
                </div>
              </div>
            </Card>

            {/* Ações de Execução */}
            <Card className="p-6 border-gray-200">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleSalvarRascunho}
                  disabled={isSubmitting}
                  className="flex-1 border-gray-300 text-black hover:bg-gray-100"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button
                  onClick={handleSubmeterAprovacao}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#D3AF37] hover:bg-[#D3AF37]/90 text-black"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submeter para Aprovação
                </Button>
              </div>
              <p className="text-gray-500 mt-3 text-center">
                Após submeter, a OS será bloqueada para edição e enviada ao
                gestor
              </p>
            </Card>
          </div>

          {/* Sidebar - Informações da OS */}
          <div className="space-y-6">
            <Card className="p-6 border-gray-200">
              <h3 className="text-black mb-4">Informações da OS</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 mb-1">Tipo de OS</p>
                  <Badge
                    variant="outline"
                    className="border-[#D3AF37] text-black bg-[#D3AF37]/10"
                  >
                    {os.tipo}
                  </Badge>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Cliente</p>
                  <p className="text-black">{os.cliente}</p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Endereço</p>
                  <p className="text-black">{os.endereco}</p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Telefone</p>
                  <p className="text-black">{os.telefone}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-600">Responsável</p>
                  </div>
                  <p className="text-black">{os.responsavel}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-600">Prazo</p>
                  </div>
                  <p className="text-black">
                    {new Date(os.prazo).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Prioridade</p>
                  <Badge
                    variant="outline"
                    className={
                      os.prioridade === "ALTA"
                        ? "bg-red-50 text-red-700 border-red-300"
                        : os.prioridade === "MEDIA"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                        : "bg-green-50 text-green-700 border-green-300"
                    }
                  >
                    {os.prioridade}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-gray-200">
              <h3 className="text-black mb-2">Descrição</h3>
              <p className="text-gray-700">{os.descricao}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}