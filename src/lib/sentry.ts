import * as Sentry from '@sentry/react';

// Sentry configuration for error tracking
export const initSentry = () => {
  // Only initialize in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',

      // Release tracking
      release: process.env.VITE_APP_VERSION || '1.0.0',

      // Environment
      environment: process.env.NODE_ENV || 'development',

      // Error filtering
      beforeSend(event, hint) {
        // Filter out development errors
        if (process.env.NODE_ENV === 'development') {
          return null;
        }

        // Filter out known non-critical errors
        const error = hint.originalException;
        if (error && typeof error === 'string') {
          // Filter out network errors that are expected
          if (error.includes('Failed to fetch') && error.includes('chrome-extension://')) {
            return null;
          }
        }

        return event;
      }
    });

    // Set user context if available
    const setUserContext = (user: any) => {
      Sentry.setUser({
        id: user?.id,
        email: user?.email,
        username: user?.nome_completo || user?.nome
      });
    };

    // Set tags for better error categorization
    Sentry.setTag('app', 'minerva-os');
    Sentry.setTag('version', process.env.VITE_APP_VERSION || '1.0.0');

    return { setUserContext };
  }

  // Return mock functions for development
  return {
    setUserContext: () => {},
    captureException: (error: any) => console.warn('Sentry not initialized:', error),
    captureMessage: (message: string) => console.info('Sentry message:', message)
  };
};

// Error boundary wrapper for React components
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Custom error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setTag(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Error reported:', error, context);
  }
};

// User interaction tracking
export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      category: 'user',
      message: action,
      level: 'info',
      data: properties
    });
  } else {
    console.info('User action:', action, properties);
  }
};