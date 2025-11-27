// Feature flags for gradual deployment and A/B testing

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  percentage: number; // 0-100, percentage of users who see this feature
  conditions?: {
    userId?: string[];
    environment?: string[];
    userType?: string[];
  };
}

// Feature flags configuration
const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // OS Workflow features
  'os-workflow-pagination': {
    name: 'OS Workflow Pagination',
    enabled: true,
    percentage: 100
  },
  'os-workflow-filters': {
    name: 'OS Workflow Filters',
    enabled: true,
    percentage: 100
  },
  'os-workflow-theme-toggle': {
    name: 'OS Workflow Theme Toggle',
    enabled: true,
    percentage: 100
  },
  'os-workflow-realtime-updates': {
    name: 'OS Workflow Real-time Updates',
    enabled: true,
    percentage: 100
  },

  // Analytics and monitoring
  'analytics-tracking': {
    name: 'Analytics Tracking',
    enabled: process.env.NODE_ENV === 'production',
    percentage: 100
  },
  'error-tracking': {
    name: 'Error Tracking',
    enabled: process.env.NODE_ENV === 'production',
    percentage: 100
  },

  // Experimental features (gradual rollout)
  'os-advanced-search': {
    name: 'Advanced Search',
    enabled: false,
    percentage: 0, // Disabled for now
    conditions: {
      environment: ['development']
    }
  },
  'os-bulk-operations': {
    name: 'Bulk Operations',
    enabled: false,
    percentage: 0, // Disabled for now
  },

  // Beta features
  'os-ai-assistant': {
    name: 'AI Assistant',
    enabled: false,
    percentage: 10, // 10% of users
    conditions: {
      userType: ['admin', 'manager']
    }
  }
};

// User context for feature flag evaluation
export interface UserContext {
  id?: string;
  type?: string;
  environment?: string;
}

// Check if a feature is enabled for a user
export const isFeatureEnabled = (featureName: string, userContext?: UserContext): boolean => {
  const flag = FEATURE_FLAGS[featureName];

  if (!flag) {
    console.warn(`Feature flag '${featureName}' not found`);
    return false;
  }

  // Check if feature is globally disabled
  if (!flag.enabled) {
    return false;
  }

  // Check conditions
  if (flag.conditions) {
    // Environment check
    if (flag.conditions.environment && userContext?.environment) {
      if (!flag.conditions.environment.includes(userContext.environment)) {
        return false;
      }
    }

    // User type check
    if (flag.conditions.userType && userContext?.type) {
      if (!flag.conditions.userType.includes(userContext.type)) {
        return false;
      }
    }

    // Specific user check
    if (flag.conditions.userId && userContext?.id) {
      if (!flag.conditions.userId.includes(userContext.id)) {
        return false;
      }
    }
  }

  // Percentage-based rollout
  if (flag.percentage < 100) {
    // Use user ID or generate a hash for consistent rollout
    const seed = userContext?.id || 'anonymous';
    const hash = simpleHash(seed + featureName);
    const percentage = (hash % 100 + 100) % 100; // Ensure positive

    return percentage < flag.percentage;
  }

  return true;
};

// Simple hash function for consistent user distribution
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
};

// Get all enabled features for a user
export const getEnabledFeatures = (userContext?: UserContext): string[] => {
  return Object.keys(FEATURE_FLAGS).filter(featureName =>
    isFeatureEnabled(featureName, userContext)
  );
};

// Get feature flag details
export const getFeatureFlag = (featureName: string): FeatureFlag | null => {
  return FEATURE_FLAGS[featureName] || null;
};

// Update feature flag (for runtime configuration)
export const updateFeatureFlag = (featureName: string, updates: Partial<FeatureFlag>): void => {
  if (FEATURE_FLAGS[featureName]) {
    FEATURE_FLAGS[featureName] = { ...FEATURE_FLAGS[featureName], ...updates };
  }
};

// Feature flag hooks for React components
export const useFeatureFlag = (featureName: string, userContext?: UserContext): boolean => {
  return isFeatureEnabled(featureName, userContext);
};

// Analytics integration
export const trackFeatureUsage = (featureName: string, userContext?: UserContext) => {
  if (isFeatureEnabled(featureName, userContext)) {
    // Import analytics dynamically to avoid circular dependencies
    import('./analytics').then(({ trackFeatureUsage }) => {
      trackFeatureUsage(featureName, { user_context: userContext });
    });
  }
};

// Configuration helpers
export const getFeatureFlagsConfig = () => {
  return { ...FEATURE_FLAGS };
};

export const setFeatureFlagsConfig = (config: Record<string, FeatureFlag>) => {
  Object.assign(FEATURE_FLAGS, config);
};

// Environment-based feature flags
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isTest = () => process.env.NODE_ENV === 'test';

// Feature flag groups
export const FEATURE_GROUPS = {
  osWorkflow: [
    'os-workflow-pagination',
    'os-workflow-filters',
    'os-workflow-theme-toggle',
    'os-workflow-realtime-updates'
  ],
  analytics: [
    'analytics-tracking',
    'error-tracking'
  ],
  experimental: [
    'os-advanced-search',
    'os-bulk-operations'
  ],
  beta: [
    'os-ai-assistant'
  ]
} as const;