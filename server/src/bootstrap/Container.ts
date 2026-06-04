import Database, { type Database as DB } from 'better-sqlite3';

import type EventBus from '../application/events/EventBus';
import type { Env } from '../config/env';
import type NoteRepository from '../domain/repositories/NoteRepository';
import PromptRepository from '../domain/repositories/PromptRepository';
import type TagRepository from '../domain/repositories/TagRepository';
import type AIService from '../domain/services/AIService';
import type SearchService from '../domain/services/SearchService';
import OllamaAIService from '../infrastructure/ai/OllamaAIService';
import SQLitePromptService from '../infrastructure/ai/SQLitePromptService';
import initDatabase from '../infrastructure/database/init';
import SQLiteNoteRepository from '../infrastructure/database/SQLiteNoteRepository';
import SQLitePromptRepository from '../infrastructure/database/SQLitePromptRepository';
import SQLiteTagRepository from '../infrastructure/database/SQLiteTagRepository';
import InMemoryEventBus from '../infrastructure/events/InMemoryEventBus';
import SSEConnectionManager from '../infrastructure/messaging/SSEConnectionManager';
import type Dispatcher from '../infrastructure/queues/Dispatcher';
import InMemorySearchService from '../infrastructure/search/InMemorySearchService';

export interface Container {
  db: DB;
  noteRepository: NoteRepository;
  tagRepository: TagRepository;
  promptRepository: PromptRepository;
  aiService: AIService;
  eventBus: EventBus;
  sseConnectionManager: SSEConnectionManager;
  searchService: SearchService;
  tagsDispatcher?: Dispatcher<'GENERATE_TAGS'>;
}

export function createContainer(env: Env): Container {
  const db = new Database(env.DATABASE_PATH);

  initDatabase(db);

  const noteRepository = new SQLiteNoteRepository(db);
  const tagRepository = new SQLiteTagRepository(db);
  const promptRepository = new SQLitePromptRepository(db);
  const promptService = new SQLitePromptService(promptRepository);

  const aiService = new OllamaAIService({
    ollamaUrl: env.OLLAMA_URL,
    ollamaModel: env.OLLAMA_MODEL,
    promptService: promptService,
  });
  const eventBus = new InMemoryEventBus();
  const sseConnectionManager = new SSEConnectionManager();
  const searchService = new InMemorySearchService();

  return {
    db,
    noteRepository,
    tagRepository,
    promptRepository,
    aiService,
    eventBus,
    sseConnectionManager,
    searchService,
  };
}
