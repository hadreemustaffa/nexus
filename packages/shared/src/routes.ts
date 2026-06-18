export function buildRoute(
  pattern: string,
  params: Record<string, string>
): string {
  return pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, key: string) => {
    const value = params[key];

    if (value == null) {
      throw new Error(`Missing route param: ${key}`);
    }

    return value;
  });
}

export const buildQuery = (
  params: Record<string, string | number | boolean | undefined | null>
): string => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : '';
};

export const api = {
  notes: {
    root: {
      path: '/',
      getRoute: () => '/notes',
    },
    search: {
      path: '/search',
      getRoute: (q: string) => '/notes/search' + buildQuery({ q }),
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
