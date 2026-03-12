const PREFIX = '[The Toast]';

export const logger = {
  info: (context: string, message: string) => {
    console.log(`${PREFIX} [${context}] ${message}`);
  },
  error: (context: string, message: string, err?: unknown) => {
    console.error(`${PREFIX} [${context}] ${message}`, err || '');
  },
  warn: (context: string, message: string) => {
    console.warn(`${PREFIX} [${context}] ${message}`);
  },
};
