/**
 * Forgot Password Page
 *
 * Allows users to request a password reset email.
 * Uses supabase.auth.resetPasswordForEmail() to send the reset link.
 */
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import { toast } from '@/lib/utils/safe-toast';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MinervaLogo } from '@/components/layout/minerva-logo';

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, informe seu e-mail');
      return;
    }

    if (!email.includes('@')) {
      toast.error('E-mail inválido');
      return;
    }

    setIsLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      logger.log('[ForgotPassword] Sending reset email to:', email);
      logger.log('[ForgotPassword] Redirect URL:', redirectTo);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        logger.error('[ForgotPassword] Error:', error);
        toast.error(error.message || 'Erro ao enviar e-mail de recuperação');
        return;
      }

      logger.log('[ForgotPassword] Reset email sent successfully');
      setIsSuccess(true);
    } catch (err) {
      logger.error('[ForgotPassword] Unexpected error:', err);
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
          backgroundSize: '40px 40px',
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
          {isSuccess ? (
            // Success State
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-semibold">E-mail enviado!</h2>
              <p className="text-muted-foreground">
                Se existe uma conta associada ao e-mail <strong>{email}</strong>, você
                receberá um link para redefinir sua senha.
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique também sua caixa de spam.
              </p>
              <Link
                to="/login"
                className="mt-4 text-primary hover:text-primary/80 hover:underline font-medium flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            // Form State
            <>
              <h2 className="text-2xl font-semibold mb-2">Esqueci minha senha</h2>
              <p className="text-muted-foreground mb-6">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail
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
                      autoFocus
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <PrimaryButton
                  type="submit"
                  className="w-full rounded-md"
                  isLoading={isLoading}
                  loadingText="Enviando..."
                >
                  Enviar link de recuperação
                </PrimaryButton>

                {/* Back to Login Link */}
                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
