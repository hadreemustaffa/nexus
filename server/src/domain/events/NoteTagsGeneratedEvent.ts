import type Tag from '../entities/Tag';
import type DomainEvent from './DomainEvent';

export interface NoteTagsGeneratedEvent extends DomainEvent {
  payload: {
    noteId: string;
    tags: Tag[];
  };
}
