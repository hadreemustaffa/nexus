import pino, { Logger as PinoInstance } from 'pino';

import type Logger from '../../application/ports/Logger';
import { LogLevel, NodeEnv } from '../../config/env';

export type PinoConfig = {
  logLevel: LogLevel;
  nodeEnv: NodeEnv;
};

export default class PinoLogger implements Logger {
  private logger: PinoInstance;

  constructor(config: PinoConfig) {
    this.logger = pino({
      level: config.logLevel,
      transport:
        config.nodeEnv === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    });
  }

  info(args: Record<string, unknown>, msg?: string): void {
    this.logger.info(args, msg);
  }

  warn(args: Record<string, unknown>, msg?: string): void {
    this.logger.warn(args, msg);
  }

  error(args: Record<string, unknown>, msg?: string): void {
    this.logger.error(args, msg);
  }

  debug(args: Record<string, unknown>, msg?: string): void {
    this.logger.debug(args, msg);
  }
}
