import './styles/globals.css';
import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from './components/ui/sonner';
import { FontLoader } from './components/layout/font-loader';
import { AuthProvider, useAuth } from './lib/contexts/auth-context';
import { router } from './router';

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

export default function App() {
  return (
    <AuthProvider>
      <FontLoader />
      <Toaster />
      <InnerApp />
    </AuthProvider>
  );
}