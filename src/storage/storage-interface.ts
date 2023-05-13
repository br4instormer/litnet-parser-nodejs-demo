import { Book } from "../client/types";

export interface IStorage {
  append(books: Book | Book[]): void;
  store(filename?: string): Promise<boolean>;
}
