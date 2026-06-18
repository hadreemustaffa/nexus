import {
  api,
  createNoteBodySchema,
  type NoteIdParams,
  noteIdParamSchema,
  searchQuerySchema,
  updateNoteBodySchema,
} from '@nexus/shared';
import { Router } from 'express';

import CreateNoteUseCase from '../../application/use-cases/notes/CreateNoteUseCase';
import DeleteNoteUseCase from '../../application/use-cases/notes/DeleteNoteUseCase';
import GetAllNotesUseCase from '../../application/use-cases/notes/GetAllNotesUseCase';
import GetRelatedNotesUseCase from '../../application/use-cases/notes/GetRelatedNotesUseCase';
import GetSingleNoteUseCase from '../../application/use-cases/notes/GetSingleNoteUseCase';
import RegenerateNoteTagsUseCase from '../../application/use-cases/notes/RegenerateNoteTagsUseCase';
import SearchNotesUseCase from '../../application/use-cases/notes/SearchNotesUseCase';
import UpdateNoteUseCase from '../../application/use-cases/notes/UpdateNoteUseCase';
import type { Container } from '../../bootstrap/Container';
import CreateNoteController from '../controllers/notes/CreateNoteController';
import DeleteNoteController from '../controllers/notes/DeleteNoteController';
import GetAllNotesController from '../controllers/notes/GetAllNotesController';
import GetRelatedNotesController from '../controllers/notes/GetRelatedNotesController';
import GetSingleNoteController from '../controllers/notes/GetSingleNoteController';
import RegenerateNoteTagsController from '../controllers/notes/RegenerateNoteTagsController';
import SearchNotesController from '../controllers/notes/SearchNotesController';
import UpdateNoteController from '../controllers/notes/UpdateNoteController';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';

export function createNotesRouter(container: Container) {
  const router = Router();

  if (!container.tagsDispatcher) {
    throw new Error('Tags dispatcher is not configured');
  }

  const createNoteUseCase = new CreateNoteUseCase(
    container.noteRepository,
    container.tagsDispatcher
  );
  const getAllNotesUseCase = new GetAllNotesUseCase(container.noteRepository);
  const getSingleNoteUseCase = new GetSingleNoteUseCase(
    container.noteRepository,
    container.tagRepository
  );
  const searchNotesUseCase = new SearchNotesUseCase(
    container.noteRepository,
    container.tagRepository,
    container.searchService
  );
  const getRelatedNotesUseCase = new GetRelatedNotesUseCase(
    container.noteRepository
  );
  const updateNoteUseCase = new UpdateNoteUseCase(
    container.noteRepository,
    container.searchService
  );
  const deleteNoteUseCase = new DeleteNoteUseCase(
    container.noteRepository,
    container.searchService
  );
  const regenerateNoteTagsUseCase = new RegenerateNoteTagsUseCase(
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
    getRelatedNotesUseCase
  );
  const updateNoteController = new UpdateNoteController(updateNoteUseCase);
  const deleteNoteController = new DeleteNoteController(deleteNoteUseCase);
  const regenerateNoteTagsController = new RegenerateNoteTagsController(
    regenerateNoteTagsUseCase
  );

  router.post(
    api.notes.root.path,
    validate({ body: createNoteBodySchema }),
    asyncHandler(createNoteController.handle)
  );
  router.get(api.notes.root.path, asyncHandler(getAllNotesController.handle));
  router.get(
    api.notes.search.path,
    validate({ query: searchQuerySchema }),
    asyncHandler(searchNotesController.handle)
  );
  router.get(
    api.notes.byId.path,
    validate({ params: noteIdParamSchema }),
    asyncHandler(getSingleNoteController.handle)
  );
  router.get(
    api.notes.related.path,
    validate({ params: noteIdParamSchema }),
    asyncHandler(getRelatedNotesController.handle)
  );
  router.put(
    api.notes.byId.path,
    validate({ params: noteIdParamSchema, body: updateNoteBodySchema }),
    asyncHandler(updateNoteController.handle)
  );
  router.delete(
    api.notes.byId.path,
    validate({ params: noteIdParamSchema }),
    asyncHandler(deleteNoteController.handle)
  );
  router.post(
    api.notes.tags.path,
    validate({ params: noteIdParamSchema }),
    asyncHandler(regenerateNoteTagsController.handle)
  );

  router.get(
    api.notes.events.path,
    validate({ params: noteIdParamSchema }),
    (req, res) => {
      const { id: noteId } = req.params as NoteIdParams;

      res.setHeader('Content-Type', 'text/event-stream');

      res.setHeader('Cache-Control', 'no-cache');

      res.setHeader('Connection', 'keep-alive');

      res.flushHeaders();

      container.sseConnectionManager.addConnection(noteId, res);

      req.on('close', () => {
        container.sseConnectionManager.removeConnection(noteId);
      });
    }
  );

  return router;
}
