import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  HardHat, 
  ClipboardCheck, 
  FileText, 
  Eye,
  Wrench,
  ChevronLeft
} from 'lucide-react'

export const Route = createFileRoute('/_auth/comercial/novo-contrato')({
  component: NovoContratoPage,
})

interface ContratoOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  route: string
  badge: string
  color: string
}

const contratoOptions: ContratoOption[] = [
  {
    id: 'obra',
    title: 'Contrato de Obras',
    description: 'Reformas, Fachadas, Impermeabilização',
    icon: <HardHat className="w-10 h-10" />,
    route: '/os/criar/start-contrato-obra',
    badge: 'OS-13',
    color: 'text-orange-600',
  },
  {
    id: 'laudo',
    title: 'Laudo Pontual',
    description: 'Laudo técnico avulso para condomínios',
    icon: <FileText className="w-10 h-10" />,
    route: '/os/criar/laudo-pontual',
    badge: 'OS-11',
    color: 'text-blue-600',
  },
  {
    id: 'assessoria',
    title: 'Assessoria Técnica',
    description: 'Contrato mensal ou anual de assessoria',
    icon: <ClipboardCheck className="w-10 h-10" />,
    route: '/os/criar/assessoria-recorrente',
    badge: 'OS-12',
    color: 'text-green-600',
  },
  {
    id: 'parecer',
    title: 'Parecer Técnico',
    description: 'Visita técnica e emissão de parecer',
    icon: <Eye className="w-10 h-10" />,
    route: '/os/criar/vistoria',
    badge: 'OS-08',
    color: 'text-purple-600',
  },
  {
    id: 'reforma',
    title: 'Solicitação de Reforma',
    description: 'Reforma em unidade autônoma',
    icon: <Wrench className="w-10 h-10" />,
    route: '/os/criar/solicitacao-reforma',
    badge: 'OS-07',
    color: 'text-amber-600',
  },
]

function NovoContratoPage() {
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    navigate({ to: path })
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate({ to: '/comercial/contratos' })}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Contratos
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Qual tipo de contrato deseja criar?
            </h1>
            <p className="text-lg text-neutral-600">
              Selecione o tipo de serviço para iniciar um novo contrato
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contratoOptions.map((option) => (
              <Card
                key={option.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-primary border-2 p-6"
                onClick={() => handleNavigate(option.route)}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Ícone */}
                  <div className={`w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors ${option.color}`}>
                    {option.icon}
                  </div>

                  {/* Título */}
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-1">
                      {option.title}
                    </h2>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {option.badge}
                  </div>

                  {/* CTA Hint */}
                  <p className="text-sm text-neutral-500 group-hover:text-primary transition-colors">
                    Clique para iniciar →
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Footer Help Text */}
          <div className="mt-12 text-center">
            <p className="text-sm text-neutral-500">
              Precisa de ajuda? Entre em contato com o suporte ou consulte o manual do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
