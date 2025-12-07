import React, { useState, useEffect, useRef } from "react";
import { Link } from '@tanstack/react-router';
import { logger } from '@/lib/utils/logger';
import { Mail, Lock } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PrimaryButton } from "../ui/primary-button";
import { toast } from "../../lib/utils/safe-toast";
import { MinervaLogo } from "../layout/minerva-logo";
import { useAuth } from "../../lib/contexts/auth-context";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login, currentUser, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isLoggingInRef = useRef(false); // Flag para saber se estamos fazendo login

  // ✅ FIX: Monitorar quando o usuário está pronto após login e navegar
  useEffect(() => {
    // Se estamos logando E o auth terminou de carregar E temos um usuário
    if (isLoggingInRef.current && !authLoading && currentUser) {
      logger.log('[LoginPage] Usuário pronto, redirecionando...');
      toast.success("Login realizado com sucesso!");
      isLoggingInRef.current = false;
      setIsLoading(false);

      // Navegar após o usuário estar pronto
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  }, [authLoading, currentUser, onLoginSuccess]);

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
    isLoggingInRef.current = true; // Marca que estamos fazendo login

    try {
      const success = await login(email, password);

      if (!success) {
        // Login falhou (credenciais inválidas)
        toast.error("Email ou senha inválidos");
        setIsLoading(false);
        isLoggingInRef.current = false;
      }
      // ✅ Se sucesso, o useEffect acima vai lidar com o redirecionamento quando currentUser estiver pronto
    } catch (error) {
      logger.error("Erro ao fazer login:", error);
      toast.error("Erro ao fazer login. Tente novamente.");
      setIsLoading(false);
      isLoggingInRef.current = false;
    }
  };

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
                <Mail className="absolute left-3 w-5 h-5 text-muted-foreground pointer-events-none" />
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
                <Lock className="absolute left-3 w-5 h-5 text-muted-foreground pointer-events-none" />
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
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary hover:text-primary/80 hover:underline font-medium"
              >
                Esqueci minha senha
              </Link>
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
        </div>
      </div>
    </div>
  );
}