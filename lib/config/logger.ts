import pino, { LoggerOptions } from 'pino';
import { env } from './env';

const loggerConfig: LoggerOptions = {
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
};

export const logger = pino(loggerConfig);

export type Logger = typeof logger;
