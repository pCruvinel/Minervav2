/**
 * Design System Showcase - Minerva v2.0
 * 
 * Componente para visualizar todas as classes tipográficas,
 * cores, sombras e utilitários do Design System.
 * 
 * Uso: Importar no App.tsx para debug/visualização
 * 
 * NOTA IMPORTANTE:
 * - Não use classes como bg-primary-hover (não existem no Tailwind)
 * - Use escala numérica: hover:bg-primary-600
 * - Use componentes base (Button, Badge) para estados automáticos
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

export function DesignSystemShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1>Minerva Design System v2.0</h1>
          <p className="text-body-large text-muted">
            Showcase de Tipografia, Cores, Sombras e Componentes
          </p>
        </div>

        <Separator />

        {/* ==================== TIPOGRAFIA ==================== */}
        <section>
          <h2 className="mb-6">Tipografia</h2>
          
          {/* Headings */}
          <Card className="shadow-card mb-6">
            <CardHeader className="bg-primary">
              <CardTitle className="text-primary-foreground">
                Hierarquia de Headings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <span className="text-overline">Heading 1</span>
                <h1>Minerva Engenharia - Sistema ERP</h1>
                <code className="text-caption">text-3xl leading-tight tracking-tight font-semibold</code>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-overline">Heading 2</span>
                <h2>Ordens de Serviço</h2>
                <code className="text-caption">text-2xl leading-snug tracking-tight font-semibold</code>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-overline">Heading 3</span>
                <h3>Detalhes da OS-001</h3>
                <code className="text-caption">text-xl leading-snug font-semibold</code>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-overline">Heading 4</span>
                <h4>Informações do Cliente</h4>
                <code className="text-caption">text-lg leading-normal font-medium</code>
              </div>
              
              <Separator />
              
              <div>
                <span className="text-overline">Heading 5 & 6</span>
                <h5>Dados de Contato</h5>
                <h6>Observações</h6>
              </div>
            </CardContent>
          </Card>

          {/* Text Utilities */}
          <Card className="shadow-card">
            <CardHeader className="bg-secondary">
              <CardTitle className="text-secondary-foreground">
                Classes Utilitárias de Texto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <span className="text-overline">Caption</span>
                <p className="text-caption">
                  Última atualização: 09/11/2025 às 14:30
                </p>
              </div>
              
              <div>
                <span className="text-overline">Overline (este texto)</span>
                <p className="text-muted">Uppercase, tracking-wide, 12px</p>
              </div>
              
              <div>
                <label className="text-label">Label (rótulos de formulário)</label>
                <p className="text-muted">14px, font-medium, neutral-700</p>
              </div>
              
              <div>
                <span className="text-overline">Body Variants</span>
                <p className="text-body-small">Body Small - Texto menor para detalhes</p>
                <p className="text-body">Body Normal - Texto padrão do corpo</p>
                <p className="text-body-large">Body Large - Texto maior para destaque</p>
              </div>
              
              <div>
                <p className="text-muted">Muted - Informação complementar</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-success">✓ Success - Operação bem-sucedida</p>
                <p className="text-warning">⚠ Warning - Atenção necessária</p>
                <p className="text-error">✗ Error - Erro de validação</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ==================== LINE CLAMP ==================== */}
        <section>
          <h2 className="mb-6">Line Clamp (Truncamento)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>1 Linha</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-1">
                  Este texto muito longo será truncado com reticências após uma linha, 
                  não importa o quanto você escreva aqui.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>2 Linhas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2">
                  Este texto ocupará no máximo duas linhas antes de ser truncado.
                  Tudo que passar disso será cortado com reticências ao final.
                  Esta terceira frase não aparecerá completamente.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>3 Linhas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco.
                  Esta quarta linha será cortada. E esta quinta também.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ==================== SOMBRAS ==================== */}
        <section>
          <h2 className="mb-6">Sistema de Elevação (Sombras)</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="shadow-card">
              <CardContent className="p-6 text-center">
                <p className="text-label">shadow-card</p>
                <p className="text-caption">Elevation 1</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card-hover">
              <CardContent className="p-6 text-center">
                <p className="text-label">shadow-card-hover</p>
                <p className="text-caption">Elevation 2</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-elevated">
              <CardContent className="p-6 text-center">
                <p className="text-label">shadow-elevated</p>
                <p className="text-caption">Elevation 3</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-float">
              <CardContent className="p-6 text-center">
                <p className="text-label">shadow-float</p>
                <p className="text-caption">Elevation 4</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Card Interativo */}
          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 mt-6">
            <CardContent className="p-6 text-center">
              <p className="text-label">Card Interativo</p>
              <p className="text-caption">Hover para ver transição de sombra</p>
            </CardContent>
          </Card>
        </section>

        {/* ==================== CORES ==================== */}
        <section>
          <h2 className="mb-6">Paleta de Cores</h2>
          
          {/* Primary */}
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle>Primary (Dourado)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {[
                  { shade: 50, color: 'rgb(252 249 241)' },
                  { shade: 100, color: 'rgb(247 240 220)' },
                  { shade: 200, color: 'rgb(239 228 186)' },
                  { shade: 300, color: 'rgb(231 215 151)' },
                  { shade: 400, color: 'rgb(223 202 117)' },
                  { shade: 500, color: 'rgb(211 175 55)' },
                  { shade: 600, color: 'rgb(189 158 50)' },
                  { shade: 700, color: 'rgb(169 140 44)' },
                  { shade: 800, color: 'rgb(126 105 33)' },
                  { shade: 900, color: 'rgb(84 70 22)' },
                ].map(({ shade, color }) => (
                  <div key={shade} className="text-center">
                    <div 
                      className="h-16 rounded mb-2"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-caption">{shade}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button>
                  Hover me
                </Button>
                <Button variant="secondary">
                  Secondary
                </Button>
                <Button variant="outline">
                  Outline
                </Button>
                <Button disabled>
                  Disabled
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Semantic Colors */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-card">
              <CardHeader className="bg-success">
                <CardTitle className="text-white">Success</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Badge className="bg-success text-white">
                  Concluído
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardHeader className="bg-warning">
                <CardTitle className="text-white">Warning</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Badge className="bg-warning text-white">
                  Atenção
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardHeader className="bg-error">
                <CardTitle className="text-white">Error</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Badge className="bg-error text-white">
                  Cancelado
                </Badge>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardHeader className="bg-info">
                <CardTitle className="text-white">Info</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Badge className="bg-info text-white">
                  Informação
                </Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ==================== FORMULÁRIO DATA-DENSE ==================== */}
        <section>
          <h2 className="mb-6">Formulário Data-Dense</h2>
          
          <Card className="shadow-card">
            <CardHeader className="bg-primary">
              <CardTitle className="text-primary-foreground">
                Exemplo de Formulário Compacto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="nome" className="text-label">
                    Nome Completo
                  </Label>
                  <Input id="nome" placeholder="Digite o nome" className="h-9" />
                  <p className="text-muted">Este campo é obrigatório</p>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-label">
                    E-mail
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="exemplo@email.com"
                    className="h-9" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="telefone" className="text-label">
                      Telefone
                    </Label>
                    <Input 
                      id="telefone" 
                      placeholder="(00) 00000-0000"
                      className="h-9" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="cep" className="text-label">
                      CEP
                    </Label>
                    <Input 
                      id="cep" 
                      placeholder="00000-000"
                      className="h-9" 
                    />
                  </div>
                </div>
                
                <div className="pt-2 flex gap-3">
                  <Button type="submit">
                    Salvar
                  </Button>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* ==================== SCROLLBAR ==================== */}
        <section>
          <h2 className="mb-6">Scrollbar Customizada</h2>
          
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Teste de Scroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto pr-4 space-y-2">
                {Array.from({ length: 30 }, (_, i) => (
                  <p key={i} className="text-body-small">
                    Linha {i + 1}: Scrolle para ver a barra customizada com estilo Minerva
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ==================== ACESSIBILIDADE ==================== */}
        <section>
          <h2 className="mb-6">Acessibilidade</h2>
          
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Focus Rings & Screen Readers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-label mb-3">Navegue com Tab para ver focus rings:</p>
                <div className="flex gap-3">
                  <Button>Botão 1</Button>
                  <Button variant="secondary">Botão 2</Button>
                  <Button variant="outline">Botão 3</Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-label mb-3">Screen Reader Only:</p>
                <button className="px-4 py-2 bg-primary hover:bg-primary-600 rounded">
                  <span className="sr-only">Fechar modal de confirmação</span>
                  <span aria-hidden="true">✕</span>
                </button>
                <p className="text-caption mt-2">
                  O texto "Fechar modal" está oculto visualmente mas acessível
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center pt-12 pb-6 space-y-2">
          <p className="text-muted">
            Minerva Design System v2.0
          </p>
          <p className="text-caption">
            Última atualização: 09/11/2025 - Fase 2 Completa
          </p>
        </div>
      </div>
    </div>
  );
}
