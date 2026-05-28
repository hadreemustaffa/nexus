import { createBrowserRouter, redirect } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { paths } from '../config/paths';
import {
  deleteNote,
  getNote,
  getNotes,
  getRelatedNotes,
  regenerateNoteTags,
} from '../features/notes/api/notes.api';
import CreateNote from '../features/notes/components/CreateNote';
import EditNote from '../features/notes/components/EditNote';
import EmptyNote from '../features/notes/components/EmptyNote';
import NoteDetail from '../features/notes/components/NoteDetail';
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
      const res = await getNotes();
      return res;
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

              if (!noteId) throw new Error('Note ID is required');

              const [note, related] = await Promise.all([
                getNote(noteId),
                getRelatedNotes(noteId),
              ]);

              return { note, related };
            },
            action: async ({ params }) => {
              const noteId = params.noteId!;
              await deleteNote(noteId);
              return redirect(paths.app.notes.path);
            },
          },
          {
            path: paths.app.notes.create.path,
            Component: CreateNote,
          },
          {
            path: paths.app.notes.edit.path,
            Component: EditNote,
            loader: async ({ params }) => {
              const { noteId } = params;

              if (!noteId) throw new Error('Note ID is required');

              const note = await getNote(noteId);

              return { note };
            },
          },
          {
            path: paths.app.notes.regenerateNoteTags.path,
            action: async ({ params }) => {
              const noteId = params.noteId!;
              await regenerateNoteTags(noteId);
            },
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
