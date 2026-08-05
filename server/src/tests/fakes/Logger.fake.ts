import type Logger from '../../application/ports/Logger';

export default class FakeLogger implements Logger {
  private logger = vi.fn();

  info(args: Record<string, unknown>, msg?: string): void {
    this.logger(args, msg);
  }
  warn(args: Record<string, unknown>, msg?: string): void {
    this.logger(args, msg);
  }
  error(args: Record<string, unknown>, msg?: string): void {
    this.logger(args, msg);
  }
  debug(args: Record<string, unknown>, msg?: string): void {
    this.logger(args, msg);
  }
}
