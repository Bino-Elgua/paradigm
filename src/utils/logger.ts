import pino from 'pino';
import fs from 'fs';
import path from 'path';

const logDir = process.env.LOG_DIR || './logs';

// Create log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Base logger configuration
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
      : undefined,
};

export const logger = pino(loggerConfig);

// Component loggers
export const apiLogger = logger.child({ component: 'api' });
export const queryLogger = logger.child({ component: 'query' });
export const ralphLogger = logger.child({ component: 'ralph' });
export const mcpLogger = logger.child({ component: 'mcp' });
export const rlmLogger = logger.child({ component: 'rlm' });
export const llmLogger = logger.child({ component: 'llm' });
export const ragLogger = logger.child({ component: 'rag' });
export const vectordbLogger = logger.child({ component: 'vectordb' });
export const embeddingLogger = logger.child({ component: 'embedding' });
export const ccaLogger = logger.child({ component: 'cca' });
export const persistenceLogger = logger.child({ component: 'persistence' });

// Consumption tracking logger (writes consumption metrics)
export const consumptionLogger = pino(
  {
    level: 'info',
  },
  pino.destination(path.join(logDir, 'consumption.log'))
);

// Paradigm metrics logger
export const paradigmLogger = pino(
  {
    level: 'info',
  },
  pino.destination(path.join(logDir, 'paradigm-metrics.log'))
);

// Void pressure logger
export const voidLogger = pino(
  {
    level: 'info',
  },
  pino.destination(path.join(logDir, 'void-pressure.log'))
);

export interface LogContext {
  queryId?: string;
  reasonerId?: string;
  level?: number;
  paradigm?: string;
}

export function createChildLogger(
  parentLogger: pino.Logger,
  context: LogContext
) {
  return parentLogger.child(context);
}
