export const paths = {
  app: {
    root: {
      path: '/',
      getHref: () => '/',
    },
    notes: {
      path: '/notes',
      getHref: () => '/notes',

      note: {
        path: ':noteId',
        getHref: (noteId: string) => `/notes/${noteId}`,
      },

      create: {
        path: 'create',
        getHref: () => '/notes/create',
      },

      edit: {
        path: ':noteId/edit',
        getHref: (noteId: string) => `/notes/${noteId}/edit`,
      },

      regenerateNoteTags: {
        path: ':noteId/tags',
        getHref: (noteId: string) => `/notes/${noteId}/tags`,
      },
    },
  },
} as const;
