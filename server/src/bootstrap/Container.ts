import Database, { type Database as DB } from 'better-sqlite3';

import type EventBus from '../application/events/EventBus';
import type NoteRepository from '../domain/repositories/NoteRepository';
import type TagRepository from '../domain/repositories/TagRepository';
import type AIService from '../domain/services/AIService';
import type SearchService from '../domain/services/SearchService';
import OllamaAIService from '../infrastructure/ai/OllamaAIService';
import initDatabase from '../infrastructure/database/init';
import SQLiteNoteRepository from '../infrastructure/database/SQLiteNoteRepository';
import SQLiteTagRepository from '../infrastructure/database/SQLiteTagRepository';
import InMemoryEventBus from '../infrastructure/events/InMemoryEventBus';
import SSEConnectionManager from '../infrastructure/messaging/SSEConnectionManager';
import type Dispatcher from '../infrastructure/queues/Dispatcher';
import InMemorySearchService from '../infrastructure/search/InMemorySearchService';

interface Container {
  db: DB;
  noteRepository: NoteRepository;
  tagRepository: TagRepository;
  aiService: AIService;
  eventBus: EventBus;
  sseConnectionManager: SSEConnectionManager;
  searchService: SearchService;
  tagsDispatcher?: Dispatcher<'GENERATE_TAGS'>;
}

const db = new Database('nexus.db');

initDatabase(db);

const noteRepository = new SQLiteNoteRepository(db);

const tagRepository = new SQLiteTagRepository(db);

const aiService = new OllamaAIService();

const eventBus = new InMemoryEventBus();

const sseConnectionManager = new SSEConnectionManager();

const searchService = new InMemorySearchService();

export const container: Container = {
  db,
  noteRepository,
  tagRepository,
  aiService,
  eventBus,
  sseConnectionManager,
  searchService,
};
