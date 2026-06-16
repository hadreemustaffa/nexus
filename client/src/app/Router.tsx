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
import { handleActionError, handleLoaderError } from '../shared';
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
        return handleLoaderError(error, 'Failed to load notes');
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
              const noteId = params.noteId!;

              try {
                const [note, related] = await Promise.all([
                  getNote(noteId),
                  getRelatedNotes(noteId),
                ]);
                return { note, related };
              } catch (error) {
                return handleLoaderError(error, 'Failed to load note');
              }
            },
            action: async ({ params }) => {
              const noteId = params.noteId!;

              try {
                await deleteNote(noteId);
                return redirect(paths.app.notes.path);
              } catch (error) {
                return handleActionError(error, 'Failed to delete note');
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

                return redirect(paths.app.notes.note.getHref(data.note.id));
              } catch (error) {
                return handleActionError(error, 'Failed to create note');
              }
            },
          },
          {
            path: paths.app.notes.edit.path,
            Component: EditNote,
            loader: async ({ params }) => {
              const noteId = params.noteId!;

              try {
                const note = await getNote(noteId);
                return note;
              } catch (error) {
                return handleLoaderError(error, 'Failed to load note');
              }
            },
            action: async ({ request }) => {
              const formData = await request.formData();

              const id = formData.get('id') as string;
              const title = formData.get('title') as string;
              const content = formData.get('content') as string;

              try {
                const { data } = await updateNote(id, { title, content });

                return redirect(paths.app.notes.note.getHref(data.note.id));
              } catch (error) {
                return handleActionError(error, 'Failed to save note');
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
                return handleActionError(error, 'Failed to regenerate tags');
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
                    return handleLoaderError(error, 'Failed to load prompts');
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
                    await createPrompt({
                      key,
                      content,
                    });

                    return redirect(paths.app.settings.prompts.getHref());
                  } catch (error) {
                    return handleActionError(error, 'Failed to create prompt');
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
