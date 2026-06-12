export const buildRoute = (
  pattern: string,
  params: Record<string, string>
): string =>
  Object.entries(params).reduce(
    (route, [key, val]) => route.replace(`:${key}`, val),
    pattern
  );

export const api = {
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
