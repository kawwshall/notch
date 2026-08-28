import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_URL ?? "sessionpack.db";

// Next dev server hot-reloads modules; without this we'd open a new SQLite
// handle on every reload and eventually hit "too many open files".
const globalForDb = globalThis as unknown as { __sessionpackDb?: Database.Database };

const sqlite =
  globalForDb.__sessionpackDb ??
  (() => {
    const conn = new Database(DB_PATH);
    conn.pragma("journal_mode = WAL");
    conn.pragma("foreign_keys = ON");
    return conn;
  })();

if (process.env.NODE_ENV !== "production") globalForDb.__sessionpackDb = sqlite;

export const db = drizzle(sqlite, { schema });
export { schema };
