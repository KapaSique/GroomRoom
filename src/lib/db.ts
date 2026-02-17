import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "groomroom.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fio TEXT NOT NULL,
      login TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pet_name TEXT NOT NULL,
      photo_path TEXT NOT NULL,
      result_photo_path TEXT,
      status TEXT NOT NULL DEFAULT 'Новая',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  const admin = db
    .prepare("SELECT id FROM users WHERE login = ?")
    .get("admin");
  if (!admin) {
    const hash = bcrypt.hashSync("grooming", 10);
    db.prepare(
      "INSERT INTO users (fio, login, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
    ).run("Администратор", "admin", "admin@groomroom.ru", hash, "admin");
  }
}

export default getDb;
