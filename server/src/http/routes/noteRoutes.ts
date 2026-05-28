import { Router } from 'express';

import CreateNote from '../../application/use-cases/CreateNote';
import DeleteNote from '../../application/use-cases/DeleteNote';
import GetAllNotes from '../../application/use-cases/GetAllNotes';
import GetRelatedNotes from '../../application/use-cases/GetRelatedNotes';
import GetSingleNote from '../../application/use-cases/GetSingleNote';
import RegenerateNoteTags from '../../application/use-cases/RegenerateNoteTags';
import SearchNotes from '../../application/use-cases/SearchNotes';
import UpdateNote from '../../application/use-cases/UpdateNote';
import { container } from '../../bootstrap/Container';
import CreateNoteController from '../controllers/notes/CreateNoteController';
import DeleteNoteController from '../controllers/notes/DeleteNoteController';
import GetAllNotesController from '../controllers/notes/GetAllNotesController';
import GetRelatedNotesController from '../controllers/notes/GetRelatedNotesController';
import GetSingleNoteController from '../controllers/notes/GetSingleNoteController';
import RegenerateNoteTagsController from '../controllers/notes/RegenerateNoteTagsController';
import SearchNotesController from '../controllers/notes/SearchNotesController';
import UpdateNoteController from '../controllers/notes/UpdateNoteController';

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
  const updateNoteUseCase = new UpdateNote(
    container.noteRepository,
    container.searchService
  );
  const deleteNoteUseCase = new DeleteNote(
    container.noteRepository,
    container.searchService
  );
  const regenerateNoteTagsUseCase = new RegenerateNoteTags(
    container.noteRepository,
    container.tagRepository,
    container.tagsDispatcher
  );

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
  const updateNoteController = new UpdateNoteController(updateNoteUseCase);
  const deleteNoteController = new DeleteNoteController(deleteNoteUseCase);
  const regenerateNoteTagsController = new RegenerateNoteTagsController(
    regenerateNoteTagsUseCase
  );

  router.post('/', createNoteController.handle);
  router.get('/', getAllNotesController.handle);
  router.get('/search', searchNotesController.handle);
  router.get('/:id', getSingleNoteController.handle);
  router.get('/:id/related', getRelatedNotesController.handle);
  router.put('/:id', updateNoteController.handle);
  router.delete('/:id', deleteNoteController.handle);
  router.post('/:id/tags', regenerateNoteTagsController.handle);

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
