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

const app = express();
const port = 3000;

app.use(express.json());

const searchService = new InMemorySearchService();

const db = new Database('nexus.db');
initDatabase(db);

const noteRepository = new SQLiteNoteRepository(db);
const tagRepository = new SQLiteTagRepository(db);

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

app.post('/notes', async (req, res) => {
  try {
    const { title, content } = req.body;

    const createNote = new CreateNote(
      noteRepository,
      tagRepository,
      new OllamaAIService()
    );

    const data = await createNote.execute(title, content);

    res.status(201).json({
      message: 'Note created successfully.',
      data: data,
    });

    await searchService.indexNote(data.note.getId(), data.note.getContent());
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }
  }
});
