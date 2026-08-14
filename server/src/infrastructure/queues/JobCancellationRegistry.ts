import type JobCanceller from '../../application/ports/JobCanceller';

export default class JobCancellationRegistry implements JobCanceller {
  private controllers = new Map<string, AbortController>();

  begin(key: string): AbortController {
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  end(key: string): void {
    this.controllers.delete(key);
  }

  cancel(key: string): void {
    const controller = this.controllers.get(key);
    controller?.abort();
  }
}
