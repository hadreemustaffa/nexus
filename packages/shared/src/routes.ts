export const buildRoute = (
  pattern: string,
  params: Record<string, string>
): string =>
  Object.entries(params).reduce(
    (route, [key, val]) => route.replace(`:${key}`, val),
    pattern
  );

export const api = {
  notes: {
    root: {
      path: '/',
      getRoute: () => '/notes',
    },
    search: {
      path: '/search',
      getRoute: (q: string) => buildRoute('/notes/search?q=:q', { q }),
    },
    create: {
      path: '/create',
      getRoute: () => '/notes/create',
    },
    byId: {
      path: '/:id',
      getRoute: (id: string) => buildRoute('/notes/:id', { id }),
    },
    related: {
      path: '/:id/related',
      getRoute: (id: string) => buildRoute('/notes/:id/related', { id }),
    },
    tags: {
      path: '/:id/tags',
      getRoute: (id: string) => buildRoute('/notes/:id/tags', { id }),
    },
    delete: {
      path: '/:id/delete',
      getRoute: (id: string) => buildRoute('/notes/:id/delete', { id }),
    },
    events: {
      path: '/:id/events',
      getRoute: (id: string) => buildRoute('/notes/:id/events', { id }),
    },
  },
  prompts: {
    root: {
      path: '/',
      getRoute: () => '/prompts',
    },
    byId: {
      path: '/:id',
      getRoute: (id: string) => buildRoute('/prompts/:id', { id }),
    },
    create: {
      path: '/create',
      getRoute: () => '/prompts/create',
    },
    delete: {
      path: '/:id/delete',
      getRoute: (id: string) => buildRoute('/prompts/:id/delete', { id }),
    },
  },
} as const;
