import 'dotenv/config';
import Database from 'better-sqlite3';
import express from 'express';
import initDatabase from './infrastructure/database/init';
import SQLiteNoteRepository from './infrastructure/database/SQLiteNoteRepository';
import CreateNote from './application/use-cases/CreateNote';
import SQLiteTagRepository from './infrastructure/database/SQLiteTagRepository';
import OllamaAIService from './infrastructure/ai/OllamaAIService';

const app = express();
const port = 3000;

app.use(express.json());

const db = new Database('nexus.db');
initDatabase(db);

const noteRepository = new SQLiteNoteRepository(db);
const tagRepository = new SQLiteTagRepository(db);

app.post('/notes', async (req, res) => {
  try {
    const { title, content } = req.body;

    const usecase = new CreateNote(
      noteRepository,
      tagRepository,
      new OllamaAIService()
    );

    const { note, tags } = await usecase.execute(title, content);

    res.status(201).json({
      message: 'Note created successfully.',
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

app.listen(port, () => {
  console.log(`Nexus server running on http://localhost:${port}`);
});
