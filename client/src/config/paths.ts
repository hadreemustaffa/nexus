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
    settings: {
      path: '/settings',
      getHref: () => '/settings',

      general: {
        path: 'general',
        getHref: () => '/settings/general',
      },

      prompts: {
        path: 'prompts',
        getHref: () => '/settings/prompts',

        create: {
          path: 'create',
          getHref: () => '/settings/prompts/create',
        },
      },
    },
  },
} as const;
