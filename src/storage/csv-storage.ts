import { writeFile } from "node:fs/promises";
import { unparse } from "papaparse";
import { Book } from "../client/types";
import { IStorage } from "./storage-interface";

export default class CSVStorage implements IStorage {
  private _rows: Map<string, Book> = new Map();
  private _filename: string | undefined;

  constructor(filename?: string) {
    this._filename = filename;
  }

  append(books: Book | Book[]): void {
    let nextId = this._rows.size;

    if (Array.isArray(books)) {
      for (const book of books) {
        this._rows.set(`${nextId}`, book);
        nextId++;
      }

      return;
    }

    this._rows.set(`${nextId}`, books);
  }

  async store(filename?: string): Promise<boolean> {
    const count = this._rows.size;
    const realFilename = filename || this._filename;
    const isSkip = !count || !realFilename;

    if (isSkip) {
      return false;
    }

    const csv = unparse(Array.from(this._rows.values()));

    try {
      const wrote = await writeFile(realFilename, csv, {
        encoding: "utf-8",
      });

      return wrote === undefined;
    } catch (e) {
      return false;
    }
  }
}
