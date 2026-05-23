import { Router } from 'express';

import CreateNote from '../../application/use-cases/CreateNote';
import GetAllNotes from '../../application/use-cases/GetAllNotes';
import GetRelatedNotes from '../../application/use-cases/GetRelatedNotes';
import GetSingleNote from '../../application/use-cases/GetSingleNote';
import SearchNotes from '../../application/use-cases/SearchNotes';
import { container } from '../../bootstrap/Container';
import CreateNoteController from '../controllers/notes/CreateNoteController';
import GetAllNotesController from '../controllers/notes/GetAllNotesController';
import GetRelatedNotesController from '../controllers/notes/GetRelatedNotesController';
import GetSingleNoteController from '../controllers/notes/GetSingleNoteController';
import SearchNotesController from '../controllers/notes/SearchNotesController';

export function createNoteRouter() {
  const router = Router();

  if (!container.tagsDispatcher) {
    throw new Error('Tags dispatcher is not configured');
  }

  const createNoteUseCase = new CreateNote(
    container.noteRepository,
    container.tagsDispatcher
  );
  const getAllNotesUseCase = new GetAllNotes(container.noteRepository);
  const getSingleNoteUseCase = new GetSingleNote(
    container.noteRepository,
    container.tagRepository
  );
  const searchNotesUseCase = new SearchNotes(
    container.noteRepository,
    container.tagRepository,
    container.searchService
  );
  const getRelatedNotesUseCase = new GetRelatedNotes(container.noteRepository);

  const createNoteController = new CreateNoteController(createNoteUseCase);
  const getAllNotesController = new GetAllNotesController(getAllNotesUseCase);
  const searchNotesController = new SearchNotesController(searchNotesUseCase);
  const getSingleNoteController = new GetSingleNoteController(
    getSingleNoteUseCase
  );
  const getRelatedNotesController = new GetRelatedNotesController(
    getRelatedNotesUseCase,
    container.noteRepository
  );

  router.post('/', createNoteController.handle.bind(createNoteController));
  router.get('/', getAllNotesController.handle.bind(getAllNotesController));
  router.get(
    '/search',
    searchNotesController.handle.bind(searchNotesController)
  );
  router.get(
    '/:id',
    getSingleNoteController.handle.bind(getSingleNoteController)
  );
  router.get(
    '/:id/related',
    getRelatedNotesController.handle.bind(getRelatedNotesController)
  );

  router.get('/:id/events', (req, res) => {
    const noteId = req.params.id;

    res.setHeader('Content-Type', 'text/event-stream');

    res.setHeader('Cache-Control', 'no-cache');

    res.setHeader('Connection', 'keep-alive');

    res.flushHeaders();

    container.sseConnectionManager.addConnection(noteId, res);

    req.on('close', () => {
      container.sseConnectionManager.removeConnection(noteId);
    });
  });

  return router;
}
