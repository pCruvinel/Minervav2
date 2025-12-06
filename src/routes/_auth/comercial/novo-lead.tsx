import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { HardHat, ClipboardCheck } from 'lucide-react'

export const Route = createFileRoute('/_auth/comercial/novo-lead')({
  component: NovoLeadPage,
})

function NovoLeadPage() {
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    navigate({ to: path })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Qual o tipo de oportunidade?
          </h1>
          <p className="text-lg text-neutral-600">
            Selecione o tipo de lead para iniciar o processo comercial
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Obras e Reformas */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-primary border-2 p-8"
            onClick={() => handleNavigate('/os/criar/obras-lead')}
          >
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Ícone */}
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <HardHat className="w-12 h-12 text-primary" />
              </div>

              {/* Título */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Lead de Obras
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed">
                  Fachadas, Reformas Estruturais, Impermeabilização
                </p>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                OS 01-04
              </div>

              {/* CTA Hint */}
              <p className="text-sm text-neutral-500 group-hover:text-primary transition-colors">
                Clique para iniciar →
              </p>
            </div>
          </Card>

          {/* Card 2: Assessoria Técnica */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-primary border-2 p-8"
            onClick={() => handleNavigate('/os/criar/assessoria-lead')}
          >
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Ícone */}
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ClipboardCheck className="w-12 h-12 text-primary" />
              </div>

              {/* Título */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Lead de Assessoria
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed">
                  Assessoria Mensal, Laudos Técnicos, Vistorias
                </p>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                OS 05-06
              </div>

              {/* CTA Hint */}
              <p className="text-sm text-neutral-500 group-hover:text-primary transition-colors">
                Clique para iniciar →
              </p>
            </div>
          </Card>
        </div>

        {/* Footer Help Text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-500">
            Precisa de ajuda? Entre em contato com o suporte ou consulte o manual do sistema.
          </p>
        </div>
      </div>
    </div>
  )
}
