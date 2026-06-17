import type { HttpHandler } from 'msw';

// Default (always-on) handlers go here.
// Per-test overrides use server.use(...) inside the test file itself.
export const handlers: HttpHandler[] = [];
