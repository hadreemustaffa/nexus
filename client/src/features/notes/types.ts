export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  created_at: Date;
};

export type NoteWithTags = {
  note: Note;
  tags: Tag[];
};
