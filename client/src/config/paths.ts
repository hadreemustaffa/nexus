export const paths = {
  app: {
    root: {
      path: '/',
      getHref: () => '/',
    },
    notes: {
      path: '/notes',
      getHref: () => '/notes',
    },
    note: {
      path: '/notes/:noteId',
      getHref: (noteId: string) => `/notes/${noteId}`,
    },
    create: {
      path: '/notes/create',
      getHref: () => '/notes/create',
    },
  },
} as const;
