import React, { useState } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PrimaryButton } from "../ui/primary-button";
import { toast } from "../../lib/utils/safe-toast";
import { MinervaLogo } from "../layout/minerva-logo";
import { useAuth } from "../../lib/contexts/auth-context";
import { PermissaoUtil } from "../../lib/auth-utils";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Validar formato de email
    if (!email.includes("@")) {
      toast.error("Email inválido");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success("Login realizado com sucesso!");
        
        // Chamar callback de sucesso se fornecido
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        toast.error("Email ou senha inválidos");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao fazer login. Tente novamente.");
      setIsLoading(false);
    }
  };

  // Credenciais de demonstração
  const demoCredentials = [
    { 
      role: "DIRETORIA", 
      email: "diretoria@minerva.com", 
      desc: "Acesso total ao sistema"
    },
    { 
      role: "GESTOR ADMINISTRATIVO", 
      email: "gestor.administrativo@minerva.com", 
      desc: "Gestão administrativa e financeira"
    },
    { 
      role: "GESTOR ASSESSORIA", 
      email: "gestor.assessoria@minerva.com", 
      desc: "Gestão da assessoria técnica"
    },
    { 
      role: "GESTOR OBRAS", 
      email: "gestor.obras@minerva.com", 
      desc: "Gestão de obras"
    },
    { 
      role: "COLABORADOR ADMINISTRATIVO", 
      email: "colaborador.adm@minerva.com", 
      desc: "Colaborador administrativo"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Padrão geométrico sutil - grid de pontos dourados */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23D3AF37'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Elementos decorativos - Canto superior esquerdo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

      {/* Elementos decorativos - Canto inferior direito */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div>
              <MinervaLogo variant="full" />
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8 border-t-4 border-primary">
          <h2 className="text-2xl font-semibold mb-6">
            Entrar
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email
              </Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-5 h-5 text-neutral-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@minerva.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 border-border rounded-md w-full"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium"
              >
                Senha
              </Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-5 h-5 text-neutral-400 pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-10 border-border rounded-md w-full"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-primary hover:text-primary/80 hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info(
                    "Funcionalidade em desenvolvimento",
                  );
                }}
              >
                Esqueci minha senha
              </a>
            </div>

            {/* Submit Button */}
            <PrimaryButton
              type="submit"
              className="w-full rounded-md"
              isLoading={isLoading}
              loadingText="Entrando..."
            >
              Entrar
            </PrimaryButton>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowCredentials(!showCredentials)}
              className="w-full p-3 bg-accent rounded-md border border-primary/20 hover:bg-primary/5 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    Credenciais de Demonstração
                  </span>
                </div>
                <span className="text-xs text-neutral-500">
                  {showCredentials ? "Ocultar" : "Mostrar"}
                </span>
              </div>
            </button>

            {showCredentials && (
              <div className="mt-3 p-4 bg-neutral-50 rounded-md border border-neutral-200 space-y-3">
                <p className="text-xs text-neutral-600 mb-3">
                  <strong>Ambiente de desenvolvimento:</strong> Clique em qualquer email abaixo para preencher automaticamente. Senha: qualquer texto com 6+ caracteres.
                </p>
                
                {demoCredentials.map((cred) => (
                  <button
                    key={cred.email}
                    type="button"
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword("senha123");
                      toast.success(`Credenciais preenchidas: ${cred.role}`);
                    }}
                    className="w-full text-left p-3 bg-white rounded border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary truncate">
                          {cred.role}
                        </p>
                        <p className="text-xs text-neutral-600 truncate mt-0.5">
                          {cred.email}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {cred.desc}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400 whitespace-nowrap">
                        Clique para usar
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}