import { createBrowserRouter, redirect } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { paths } from '../config/paths';
import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  getRelatedNotes,
  regenerateNoteTags,
  updateNote,
} from '../features/notes/api/notes.api';
import CreateNote from '../features/notes/components/CreateNote';
import EditNote from '../features/notes/components/EditNote';
import EmptyNote from '../features/notes/components/EmptyNote';
import NoteDetail from '../features/notes/components/NoteDetail';
import {
  createPrompt,
  getAllPrompts,
} from '../features/prompts/api/prompts.api';
import CreatePrompt from '../features/prompts/components/CreatePrompt';
import PromptList from '../features/prompts/components/PromptList';
import PromptRoot from '../features/prompts/components/PromptRoot';
import { ApiError } from '../shared/api/client';
import Settings from '../shared/ui/settings/Settings';
import {
  AppRootErrorBoundary,
  AppRootLoader,
  default as AppRoot,
} from './routes/app/Root';

const router = createBrowserRouter([
  {
    path: paths.app.root.path,
    Component: AppRoot,
    HydrateFallback: AppRootLoader,
    loader: async () => {
      try {
        return await getNotes();
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Response('Failed to load notes', { status: error.status });
        }
        throw error;
      }
    },
    errorElement: <AppRootErrorBoundary />,
    children: [
      {
        index: true,
        Component: EmptyNote,
      },
      {
        path: paths.app.notes.path,
        children: [
          {
            index: true,
            Component: EmptyNote,
          },
          {
            path: paths.app.notes.note.path,
            Component: NoteDetail,
            loader: async ({ params }) => {
              const { noteId } = params;

              if (!noteId)
                throw new Response('Note ID is required', { status: 400 });

              try {
                const [note, related] = await Promise.all([
                  getNote(noteId),
                  getRelatedNotes(noteId),
                ]);
                return { note, related };
              } catch (error) {
                if (error instanceof ApiError) {
                  if (error.status === 404) {
                    throw new Response('Note not found', { status: 404 });
                  }
                  throw new Response('Failed to load note', {
                    status: error.status,
                  });
                }
                throw error;
              }
            },
            action: async ({ params }) => {
              const { noteId } = params;

              if (!noteId)
                throw new Response('Note ID is required', { status: 400 });

              try {
                await deleteNote(noteId);
                return redirect(paths.app.notes.path);
              } catch (error) {
                if (error instanceof ApiError) {
                  return { error: 'Failed to delete note' };
                }
                throw error;
              }
            },
          },
          {
            path: paths.app.notes.create.path,
            Component: CreateNote,
            action: async ({ request }) => {
              const formData = await request.formData();

              const title = formData.get('title') as string;
              const content = formData.get('content') as string;

              try {
                const { data } = await createNote({ title, content });

                if (!data?.note.id) {
                  throw new Error('Note not found');
                }

                return redirect(paths.app.notes.note.getHref(data.note.id));
              } catch (error) {
                if (error instanceof ApiError) {
                  return { error: 'Failed to create note' };
                }
                throw error;
              }
            },
          },
          {
            path: paths.app.notes.edit.path,
            Component: EditNote,
            loader: async ({ params }) => {
              const { noteId } = params;

              if (!noteId)
                throw new Response('Note ID is required', { status: 400 });

              try {
                const note = await getNote(noteId);
                return { note };
              } catch (error) {
                if (error instanceof ApiError) {
                  if (error.status === 404) {
                    throw new Response('Note not found', { status: 404 });
                  }
                  throw new Response('Failed to load note', {
                    status: error.status,
                  });
                }
                throw error;
              }
            },
            action: async ({ request }) => {
              const formData = await request.formData();

              const id = formData.get('id') as string;
              const title = formData.get('title') as string;
              const content = formData.get('content') as string;

              try {
                const { data } = await updateNote(id, { title, content });

                if (!data?.note.id) {
                  throw new Error('Note not found');
                }

                return redirect(paths.app.notes.note.getHref(data.note.id));
              } catch (error) {
                if (error instanceof ApiError) {
                  return { error: error.message };
                }
                throw error;
              }
            },
          },
          {
            path: paths.app.notes.regenerateNoteTags.path,
            action: async ({ params }) => {
              const noteId = params.noteId!;

              try {
                await regenerateNoteTags(noteId);
                return null;
              } catch (error) {
                if (error instanceof ApiError) {
                  return { error: 'Failed to regenerate tags' };
                }
                throw error;
              }
            },
          },
        ],
      },
      {
        path: paths.app.settings.path,
        Component: Settings,
        children: [
          {
            path: paths.app.settings.prompts.path,
            Component: PromptRoot,
            children: [
              {
                index: true,
                loader: async () => {
                  try {
                    const result = await getAllPrompts();
                    return result;
                  } catch (error) {
                    if (error instanceof ApiError) {
                      return { error: error.message };
                    }
                    throw error;
                  }
                },
                Component: PromptList,
              },
              {
                path: paths.app.settings.prompts.create.path,
                action: async ({ request }) => {
                  const formData = await request.formData();

                  const key = formData.get('key') as string;
                  const content = formData.get('content') as string;

                  try {
                    const { data } = await createPrompt({
                      key,
                      content,
                    });

                    if (!data?.id) {
                      throw new Error('Prompt not found');
                    }

                    return redirect(paths.app.settings.prompts.getHref());
                  } catch (error) {
                    if (error instanceof ApiError) {
                      return { error: error.message };
                    }
                    throw error;
                  }
                },
                Component: CreatePrompt,
              },
            ],
          },
        ],
      },
    ],
  },

  {
    path: '*',
    lazy: () =>
      import('./routes/NotFound').then((module) => ({
        Component: module.default,
      })),
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
