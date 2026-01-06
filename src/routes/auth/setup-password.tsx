/**
 * Setup Password Page
 *
 * Allows invited users to set their password for the first time.
 * Also used for password recovery flow.
 */
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import { toast } from '@/lib/utils/safe-toast';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MinervaLogo } from '@/components/layout/minerva-logo';

export const Route = createFileRoute('/auth/setup-password')({
  component: SetupPasswordPage,
});

function SetupPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation
  const passwordValidation = {
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    passwordsMatch: password === confirmPassword && password.length > 0,
  };

  const isPasswordValid =
    passwordValidation.minLength &&
    passwordValidation.passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar senha E marcar flag no user_metadata
      const { error } = await supabase.auth.updateUser({
        password,
        data: {
          senha_definida: true,
          senha_definida_em: new Date().toISOString()
        }
      });

      if (error) {
        logger.error('[SetupPassword] Error updating password:', error);
        toast.error(error.message || 'Erro ao definir senha');
        return;
      }

      logger.log('[SetupPassword] Password updated successfully');
      toast.success('Senha definida com sucesso!');

      // Verificar se é cliente ou colaborador
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Verificar se existe na tabela clientes (é cliente)
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (clienteData) {
          logger.log('[SetupPassword] User is a client, redirecting to portal');
          navigate({ to: '/portal' });
          return;
        }

        // Verificar se existe na tabela colaboradores (é staff)
        const { data: colaboradorData } = await supabase
          .from('colaboradores')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (colaboradorData) {
          logger.log('[SetupPassword] User is staff, redirecting to dashboard');
          navigate({ to: '/' });
          return;
        }
      }

      // Fallback: redirecionar para login
      logger.warn('[SetupPassword] Could not determine user type, redirecting to login');
      navigate({ to: '/login' });
    } catch (err) {
      logger.error('[SetupPassword] Unexpected error:', err);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Padrão geométrico sutil */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23D3AF37'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <MinervaLogo variant="full" />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8 border-t-4 border-primary">
          <h2 className="text-2xl font-semibold mb-2">Definir Senha</h2>
          <p className="text-muted-foreground mb-6">
            Crie uma senha segura para acessar sua conta.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Nova Senha
              </Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 border-border rounded-md w-full"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 border-border rounded-md w-full"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-muted/30 rounded-md p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Requisitos da senha:</p>
              <div className="grid grid-cols-2 gap-2">
                <ValidationItem
                  isValid={passwordValidation.minLength}
                  text="Mínimo 6 caracteres"
                />
                <ValidationItem
                  isValid={passwordValidation.passwordsMatch}
                  text="Senhas coincidem"
                />
                <ValidationItem
                  isValid={passwordValidation.hasUpperCase}
                  text="Letra maiúscula"
                  optional
                />
                <ValidationItem
                  isValid={passwordValidation.hasNumber}
                  text="Número"
                  optional
                />
              </div>
            </div>

            {/* Submit Button */}
            <PrimaryButton
              type="submit"
              className="w-full rounded-md"
              isLoading={isLoading}
              loadingText="Salvando..."
              disabled={!isPasswordValid}
            >
              Definir Senha
            </PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
}

// Validation item component
function ValidationItem({
  isValid,
  text,
  optional = false,
}: {
  isValid: boolean;
  text: string;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <CheckCircle2
        className={`w-4 h-4 ${isValid
          ? 'text-success'
          : optional
            ? 'text-muted-foreground/50'
            : 'text-muted-foreground'
          }`}
      />
      <span
        className={
          isValid
            ? 'text-success'
            : optional
              ? 'text-muted-foreground/50'
              : 'text-muted-foreground'
        }
      >
        {text}
        {optional && ' (opcional)'}
      </span>
    </div>
  );
}
