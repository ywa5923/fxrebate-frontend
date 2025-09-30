const logger = {
  error: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(message, meta);
    }
    // In production, send to a service like Sentry:
    // Sentry.captureException(new Error(message), { extra: meta });
  },
  warn: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(message, meta);
    }
  },
  info: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message, meta);
    }
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(message, meta);
    }
  },
};

export default logger;
