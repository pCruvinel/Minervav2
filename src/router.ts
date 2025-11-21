import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { useAuth } from './lib/contexts/auth-context';

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register router types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
