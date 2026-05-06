import 'dotenv/config';
import Database from 'better-sqlite3';
import express from 'express';
import initDatabase from './infrastructure/database/init';
import SQLiteNoteRepository from './infrastructure/database/SQLiteNoteRepository';
import CreateNote from './application/use-cases/CreateNote';
import SQLiteTagRepository from './infrastructure/database/SQLiteTagRepository';
import OllamaAIService from './infrastructure/ai/OllamaAIService';
import InMemorySearchService from './infrastructure/search/InMemorySearchService';
import SearchNotes from './application/use-cases/SearchNotes';
import GetRelatedNotes from './application/use-cases/GetRelatedNotes';
import ParseAndSaveLinks from './application/use-cases/ParseAndSaveLinks';
import GenerateAndAttachTags from './application/use-cases/GenerateAndAttachTags';

const app = express();
const port = 3000;

app.use(express.json());

const searchService = new InMemorySearchService();

const db = new Database('nexus.db');
initDatabase(db);

const noteRepository = new SQLiteNoteRepository(db);
const tagRepository = new SQLiteTagRepository(db);
const aiService = new OllamaAIService();

// create a note
app.post('/notes', async (req, res) => {
  try {
    const { title, content } = req.body;

    const createNote = new CreateNote(noteRepository, tagRepository, aiService);

    const { note, tags } = await createNote.execute(title, content);

    res.status(201).json({
      message: 'Note created successfully.',
      data: { note, tags },
    });

    await searchService.indexNote(note.getId(), note.getContent());
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }
  }
});

// get all notes
app.get('/notes', async (req, res) => {
  try {
    const allNotes = await noteRepository.findAll();

    if (allNotes.length === 0) {
      return res.status(200).json({
        message: 'Success, but no notes found.',
        data: [],
      });
    }

    const data = await Promise.all(
      allNotes.map(async (note) => {
        const tags = await tagRepository.findAllByNoteId(note.getId());
        return { note, tags };
      })
    );

    res.status(200).json({
      message: 'Found notes.',
      data: data,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }
  }
});

// search note
app.get('/notes/search', async (req, res) => {
  try {
    const q = req.query.q as string;

    if (!q) {
      return res
        .status(400)
        .json({ error: 'Bad Request', message: 'query is required' });
    }

    const searchNotes = new SearchNotes(
      noteRepository,
      tagRepository,
      searchService
    );

    const results = await searchNotes.execute(q);

    res.status(200).json({
      message: 'Search found some notes.',
      data: results,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }
  }
});

// get single note
app.get('/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;

    const note = await noteRepository.findById(noteId);

    if (!note) {
      return res
        .status(404)
        .json({ error: 'Not Found', message: 'Note not found' });
    }

    const tags = await tagRepository.findAllByNoteId(noteId);

    res.status(200).json({
      message: 'Note found.',
      data: { note, tags },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }
  }
});

// get related note
app.get('/notes/:id/related', async (req, res) => {
  try {
    const relatedNoteId = req.params.id;

    const note = await noteRepository.findById(relatedNoteId);

    if (!note) {
      return res
        .status(404)
        .json({ error: 'Not Found', message: 'Note not found' });
    }

    const getRelatedNotes = new GetRelatedNotes(noteRepository);

    const relatedNotes = await getRelatedNotes.execute(relatedNoteId);

    res.status(200).json({
      message: 'Found related notes.',
      data: relatedNotes,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }
  }
});

// update note
app.put('/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;

    const note = await noteRepository.findById(noteId);

    if (!note) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Note not found',
      });
    }

    // remove note from index, delete all wikilinks & delete tags
    await searchService.deleteNote(note.getId(), note.getContent());
    await noteRepository.deleteLink(noteId);
    await tagRepository.deleteByNoteId(noteId);

    note.update(title, content);

    // persist and re-index note
    await noteRepository.update(note);
    await searchService.indexNote(note.getId(), note.getContent());

    // re-parse links
    const parseAndSaveLinks = new ParseAndSaveLinks(noteRepository);
    await parseAndSaveLinks.execute(note.getId(), note.getContent());

    // re-generate tags since content might change significantly
    const generateAndAttachTags = new GenerateAndAttachTags(
      tagRepository,
      aiService
    );
    const tags = await generateAndAttachTags.execute(
      note.getId(),
      note.getContent()
    );

    res.status(200).json({
      message: 'Note is updated successfully.',
      data: { note, tags },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }
  }
});

// delete note
app.delete('/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;

    const note = await noteRepository.findById(noteId);

    if (!note) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Note not found',
      });
    }

    await searchService.deleteNote(note.getId(), note.getContent());
    await noteRepository.delete(noteId);

    res.status(200).json({
      message: 'Note is deleted successfully.',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }
  }
});

async function bootstrap() {
  const allNotes = await noteRepository.findAll();
  for (const note of allNotes) {
    await searchService.indexNote(note.getId(), note.getContent());
  }

  app.listen(port, () => {
    console.log(`Nexus server running on http://localhost:${port}`);
  });
}

bootstrap();
