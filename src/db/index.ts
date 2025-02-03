import Dexie, { Table } from "dexie";

export interface Chat {
  id: string;
  description: string;
  totalTokens: number;
  createdAt: Date;
  pinned: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  role: "system" | "assistant" | "user";
  content: string;
  createdAt: Date;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export class Database extends Dexie {
  chats!: Table<Chat>;
  messages!: Table<Message>;
  prompts!: Table<Prompt>;

  constructor() {
    super("keathgpt");
    this.version(1).stores({
      chats: "id, createdAt",
      messages: "id, chatId, createdAt",
      prompts: "id, createdAt"
    });
  }
}

export const db = new Database();