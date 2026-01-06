/**
 * Auth Callback Route
 *
 * Handles authentication callbacks from Supabase (invites, password reset, etc.)
 * Detects the type of callback and redirects appropriately.
 */
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import { Loader2 } from 'lucide-react';
import { MinervaLogo } from '@/components/layout/minerva-logo';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters BEFORE any Supabase processing
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        // Check for error in URL
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        if (error) {
          logger.error('[AuthCallback] Error in URL:', error, errorDescription);
          setErrorMessage(errorDescription || 'Ocorreu um erro na autenticação');
          setStatus('error');
          return;
        }

        // IMPORTANTE: Capturar o type ANTES de processar a sessão
        // Com detectSessionInUrl: false, precisamos processar manualmente
        const type = hashParams.get('type') || searchParams.get('type');
        logger.log('[AuthCallback] Callback type:', type);

        // Extrair tokens da URL
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // Se há tokens na URL, processar sessão manualmente
        if (accessToken && refreshToken) {
          logger.log('[AuthCallback] Processing tokens manually...');

          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            logger.error('[AuthCallback] Error setting session:', sessionError);
            setErrorMessage('Erro ao processar autenticação');
            setStatus('error');
            return;
          }

          logger.log('[AuthCallback] Session created successfully');
        } else {
          // Sem tokens na URL, verificar se já existe sessão
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            logger.error('[AuthCallback] No tokens in URL and no existing session');
            setErrorMessage('Sessão não encontrada. O link pode ter expirado.');
            setStatus('error');
            return;
          }
        }

        // Redirect baseado no type PRESERVADO
        if (type === 'invite' || type === 'signup') {
          // Novo usuário de convite - precisa definir senha
          logger.log('[AuthCallback] Invite/signup - redirecting to setup password');
          navigate({ to: '/auth/setup-password' });
        } else if (type === 'recovery') {
          // Recuperação de senha
          logger.log('[AuthCallback] Recovery - redirecting to setup password');
          navigate({ to: '/auth/setup-password' });
        } else {
          // Magic link ou outro - determinar tipo de usuário
          logger.log('[AuthCallback] Other type - checking user type...');

          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Verificar se usuário é cliente
            const { data: clienteData } = await supabase
              .from('clientes')
              .select('id')
              .eq('auth_user_id', user.id)
              .maybeSingle();

            if (clienteData) {
              logger.log('[AuthCallback] User is a client, redirecting to portal');
              navigate({ to: '/portal' });
              return;
            }
          }

          // Default: redirect para dashboard (staff)
          logger.log('[AuthCallback] User is staff, redirecting to dashboard');
          navigate({ to: '/' });
        }
      } catch (err) {
        logger.error('[AuthCallback] Unexpected error:', err);
        setErrorMessage('Erro inesperado. Tente novamente.');
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate]);

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

        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8 border-t-4 border-primary">
          {status === 'loading' ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Processando autenticação...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive text-xl">!</span>
              </div>
              <h2 className="text-xl font-semibold text-destructive">Erro na autenticação</h2>
              <p className="text-muted-foreground text-center">{errorMessage}</p>
              <button
                onClick={() => navigate({ to: '/login' })}
                className="mt-4 text-primary hover:underline font-medium"
              >
                Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
