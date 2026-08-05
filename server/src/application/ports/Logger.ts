type LogContext = Record<string, unknown>;

export default interface Logger {
  info(args: LogContext, msg?: string): void;
  warn(args: LogContext, msg?: string): void;
  error(args: LogContext, msg?: string): void;
  debug(args: LogContext, msg?: string): void;
}
