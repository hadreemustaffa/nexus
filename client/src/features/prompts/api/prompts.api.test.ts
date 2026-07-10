import { http, HttpResponse } from 'msw';

import { server } from '../../../tests/mocks/server';
import { createPrompt, getAllPrompts } from './prompts.api';

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

it('createPrompt POSTs to the create route with key and content as the body', async () => {
  const newPrompt = { key: 'tagging', content: 'Some prompt content.' };
  const createdPrompt = {
    id: '1',
    ...newPrompt,
    version: 1,
    isDefault: false,
    isActive: false,
    created_at: new Date().toISOString(),
  };

  let capturedBody: unknown;

  server.use(
    http.post('http://localhost:3000/prompts/create', async ({ request }) => {
      capturedBody = await request.json();
      return HttpResponse.json(
        { message: 'Prompt created successfully', data: createdPrompt },
        { status: 201 }
      );
    })
  );

  const result = await createPrompt(newPrompt);

  expect(capturedBody).toEqual(newPrompt);
  expect(result).toEqual({
    message: 'Prompt created successfully',
    data: createdPrompt,
  });
});

it('getAllPrompts GETs the prompts root route and returns all prompts', async () => {
  const prompts = [
    {
      id: '1',
      key: 'tagging',
      content: 'Prompt A',
      version: 1,
      isDefault: true,
      isActive: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      key: 'tagging',
      content: 'Prompt B',
      version: 2,
      isDefault: false,
      isActive: false,
      created_at: new Date().toISOString(),
    },
  ];

  server.use(
    http.get('http://localhost:3000/prompts', () => {
      return HttpResponse.json({
        message: 'Prompts found.',
        data: { prompts },
      });
    })
  );

  const result = await getAllPrompts();

  expect(result).toEqual({
    message: 'Prompts found.',
    data: { prompts },
  });
});
