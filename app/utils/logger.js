/**
 * Système de logging optimisé pour la production
 * Compatible Next.js (SSR) et React Native (Expo)
 */

// ⚡ On sécurise l'accès à __DEV__ pour éviter les erreurs côté SSR
const isDev = (typeof __DEV__ !== 'undefined') ? __DEV__ : process.env.NODE_ENV !== 'production';

/**
 * Logger conditionnel qui ne fonctionne qu'en développement
 */
export const logger = {
  info: (message, data) => {
    if (isDev) {
      data !== undefined ? console.log(`ℹ️ ${message}`, data) : console.log(`ℹ️ ${message}`);
    }
  },

  success: (message, data) => {
    if (isDev) {
      data !== undefined ? console.log(`✅ ${message}`, data) : console.log(`✅ ${message}`);
    }
  },

  warn: (message, data) => {
    if (isDev) {
      data !== undefined ? console.warn(`⚠️ ${message}`, data) : console.warn(`⚠️ ${message}`);
    }
  },

  error: (message, error) => {
    error !== undefined ? console.error(`❌ ${message}`, error) : console.error(`❌ ${message}`);
  },

  debug: (message, data) => {
    if (isDev) {
      data !== undefined ? console.log(`🔍 DEBUG: ${message}`, data) : console.log(`🔍 DEBUG: ${message}`);
    }
  },

  performance: (operation, startTime) => {
    if (isDev) {
      const duration = Date.now() - startTime;
      console.log(`⏱️ PERF: ${operation} took ${duration}ms`);
    }
  },

  network: (method, url, data) => {
    if (isDev) {
      console.log(`🌐 ${method.toUpperCase()} ${url}`, data);
    }
  },

  redux: (action, payload) => {
    if (isDev) {
      console.log(`🔄 REDUX: ${action}`, payload);
    }
  },

  navigation: (from, to) => {
    if (isDev) {
      console.log(`🧭 NAVIGATION: ${from} → ${to}`);
    }
  },

  userData: (message, data) => {
    if (isDev) {
      const sanitizedData = sanitizeUserData(data);
      console.log(`👤 USER: ${message}`, sanitizedData);
    }
  },

  group: (groupName, logFn) => {
    if (isDev) {
      console.group(`📁 ${groupName}`);
      logFn();
      console.groupEnd();
    }
  }
};

function sanitizeUserData(data) {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = ['password', 'token', 'pushToken', 'telephone', 'email'];
  const sanitized = { ...data };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = typeof sanitized[field] === 'string'
        ? sanitized[field].substring(0, 3) + '***'
        : '***';
    }
  });

  return sanitized;
}

export const createPerformanceTimer = (operation) => {
  if (!isDev) return () => {};

  const startTime = Date.now();
  logger.debug(`Starting ${operation}...`);

  return () => logger.performance(operation, startTime);
};

export const logError = (context, operation, error) => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  const errorData = {
    context,
    operation,
    message: errorMessage,
    stack: error?.stack,
    timestamp: new Date().toISOString()
  };

  logger.error(`[${context}] ${operation} failed: ${errorMessage}`, errorData);
};

export const withErrorLogging = (context, operation, asyncFn) => {
  return async (...args) => {
    const stopTimer = createPerformanceTimer(`${context}.${operation}`);

    try {
      logger.debug(`[${context}] Starting ${operation}`);
      const result = await asyncFn(...args);
      logger.success(`[${context}] ${operation} completed successfully`);
      return result;
    } catch (error) {
      logError(context, operation, error);
      throw error;
    } finally {
      stopTimer();
    }
  };
};

export default logger;
