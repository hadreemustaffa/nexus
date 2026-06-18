import { api, buildQuery, buildRoute } from './routes';

const noteId = '3e0542a3-f7f1-4d64-af56-043fb72ec5fa';
const promptId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

describe('buildRoute', () => {
  it('replaces a single route param', () => {
    const expected = `/notes/${noteId}`;

    const actual = buildRoute('/notes/:id', { id: noteId });

    expect(actual).toBe(expected);
  });

  it('replaces multiple route params', () => {
    const expected = `/notes/${noteId}/edit`;

    const actual = buildRoute('/notes/:id/:type', {
      id: noteId,
      type: 'edit',
    });

    expect(actual).toBe(expected);
  });

  it('replaces repeated occurrences of the same param', () => {
    const expected = `/${noteId}/${noteId}`;

    const actual = buildRoute('/:id/:id', { id: noteId });

    expect(actual).toBe(expected);
  });

  it('ignores extra params not used in the pattern', () => {
    const expected = `/notes/${noteId}`;

    const actual = buildRoute('/notes/:id', {
      id: noteId,
      unused: 'value',
    });

    expect(actual).toBe(expected);
  });

  it('handles empty string values', () => {
    const expected = '/notes/';

    const actual = buildRoute('/notes/:id', { id: '' });

    expect(actual).toBe(expected);
  });

  it('returns the pattern unchanged when it has no params', () => {
    const expected = '/notes/create';

    const actual = buildRoute('/notes/create', {});

    expect(actual).toBe(expected);
  });

  it('throws when a required route param is missing entirely', () => {
    const actual = () => buildRoute('/notes/:id', {});

    expect(actual).toThrow('Missing route param: id');
  });

  it('throws when a route param is explicitly null', () => {
    const actual = () =>
      buildRoute('/notes/:id', { id: null as unknown as string });

    expect(actual).toThrow('Missing route param: id');
  });

  it('throws when a route param is explicitly undefined', () => {
    const actual = () =>
      buildRoute('/notes/:id', { id: undefined as unknown as string });

    expect(actual).toThrow('Missing route param: id');
  });

  it('inserts param values literally, even if they contain $-style replacement patterns', () => {
    const expected = '/notes/$&-$1';

    const actual = buildRoute('/notes/:id', { id: '$&-$1' });

    expect(actual).toBe(expected);
  });

  it('does not encode special characters in param values (documents current behavior)', () => {
    const expected = '/notes/a/b:c';

    const actual = buildRoute('/notes/:id', { id: 'a/b:c' });

    expect(actual).toBe(expected);
  });
});

describe('buildQuery', () => {
  const searchRoute = '/notes/search';

  it('builds a single query param', () => {
    const expected = `${searchRoute}?q=hello+world`;

    const actual = searchRoute + buildQuery({ q: 'hello world' });

    expect(actual).toBe(expected);
  });

  it('builds multiple query params', () => {
    const expected = `${searchRoute}?q=hello+world&sort=asc&page=1`;

    const actual =
      searchRoute + buildQuery({ q: 'hello world', sort: 'asc', page: 1 });

    expect(actual).toBe(expected);
  });

  it('returns an empty string for an empty params object', () => {
    expect(buildQuery({})).toBe('');
  });

  it('returns an empty string when every value is filtered out', () => {
    expect(buildQuery({ q: undefined, sort: null, page: '' })).toBe('');
  });

  it('keeps falsy-but-valid values like 0 and false', () => {
    expect(buildQuery({ page: 0, active: false })).toBe('?page=0&active=false');
  });

  it('drops filtered keys while keeping valid ones, preserving order', () => {
    expect(buildQuery({ q: 'x', sort: undefined, page: 2 })).toBe(
      '?q=x&page=2'
    );
  });

  it('percent-encodes special characters', () => {
    expect(buildQuery({ q: 'a&b=c#d' })).toBe('?q=a%26b%3Dc%23d');
  });

  it('encodes unicode characters', () => {
    expect(buildQuery({ q: '日本語' })).toBe(
      `?q=${encodeURIComponent('日本語').replace(/%20/g, '+')}`
    );
  });
});

describe('api.notes', () => {
  it('builds the root route', () => {
    expect(api.notes.root.getRoute()).toBe('/notes');
  });

  it('builds the search route with a query', () => {
    expect(api.notes.search.getRoute('hello')).toBe('/notes/search?q=hello');
  });

  it('builds the search route with an empty query (no trailing "?")', () => {
    expect(api.notes.search.getRoute('')).toBe('/notes/search');
  });

  it('builds the create route', () => {
    expect(api.notes.create.getRoute()).toBe('/notes/create');
  });

  it('builds the byId route', () => {
    expect(api.notes.byId.getRoute(noteId)).toBe(`/notes/${noteId}`);
  });

  it('builds the related route', () => {
    expect(api.notes.related.getRoute(noteId)).toBe(`/notes/${noteId}/related`);
  });

  it('builds the tags route', () => {
    expect(api.notes.tags.getRoute(noteId)).toBe(`/notes/${noteId}/tags`);
  });

  it('builds the delete route', () => {
    expect(api.notes.delete.getRoute(noteId)).toBe(`/notes/${noteId}/delete`);
  });

  it('builds the events route', () => {
    expect(api.notes.events.getRoute(noteId)).toBe(`/notes/${noteId}/events`);
  });
});

describe('api.prompts', () => {
  it('builds the root route', () => {
    expect(api.prompts.root.getRoute()).toBe('/prompts');
  });

  it('builds the create route', () => {
    expect(api.prompts.create.getRoute()).toBe('/prompts/create');
  });

  it('builds the byId route', () => {
    expect(api.prompts.byId.getRoute(promptId)).toBe(`/prompts/${promptId}`);
  });

  it('builds the delete route', () => {
    expect(api.prompts.delete.getRoute(promptId)).toBe(
      `/prompts/${promptId}/delete`
    );
  });
});

describe('api path/getRoute consistency', () => {
  // Guards against drift between the declarative `path` (used for route
  // registration) and the literal pattern hardcoded inside `getRoute`.
  // If someone edits one and forgets the other, this catches it.
  const idRoutes: Array<{
    name: string;
    root: string;
    entry: { path: string; getRoute: (id: string) => string };
  }> = [
    {
      name: 'notes.byId',
      root: api.notes.root.getRoute(),
      entry: api.notes.byId,
    },
    {
      name: 'notes.related',
      root: api.notes.root.getRoute(),
      entry: api.notes.related,
    },
    {
      name: 'notes.tags',
      root: api.notes.root.getRoute(),
      entry: api.notes.tags,
    },
    {
      name: 'notes.delete',
      root: api.notes.root.getRoute(),
      entry: api.notes.delete,
    },
    {
      name: 'notes.events',
      root: api.notes.root.getRoute(),
      entry: api.notes.events,
    },
    {
      name: 'prompts.byId',
      root: api.prompts.root.getRoute(),
      entry: api.prompts.byId,
    },
    {
      name: 'prompts.delete',
      root: api.prompts.root.getRoute(),
      entry: api.prompts.delete,
    },
  ];

  it.each(idRoutes)(
    '$name getRoute matches root + declared path',
    ({ root, entry }) => {
      const expected = root + entry.path.replace(':id', noteId);

      expect(entry.getRoute(noteId)).toBe(expected);
    }
  );
});
