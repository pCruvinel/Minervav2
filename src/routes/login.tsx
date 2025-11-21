import { createFileRoute, useRouter } from '@tanstack/react-router'
import { LoginPage } from '../components/auth/login-page'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  const router = useRouter()
  
  const handleLoginSuccess = () => {
    router.navigate({ to: '/' })
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />
}
