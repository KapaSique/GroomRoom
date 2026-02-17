import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "groomroom.db");

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

  // Seed admin user
  const admin = db
    .prepare("SELECT id FROM users WHERE login = ?")
    .get("admin");
  if (!admin) {
    const hash = bcrypt.hashSync("grooming", 10);
    db.prepare(
      "INSERT INTO users (fio, login, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
    ).run("Администратор", "admin", "admin@groomroom.ru", hash, "admin");
  }

  // Seed demo showcase user and requests
  const demoUser = db
    .prepare("SELECT id FROM users WHERE login = ?")
    .get("demo_showcase") as { id: number } | undefined;
  if (!demoUser) {
    const demoHash = bcrypt.hashSync("demo_showcase", 10);
    const info = db.prepare(
      "INSERT INTO users (fio, login, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
    ).run("Демо Витрина", "demo_showcase", "demo@groomroom.ru", demoHash, "user");

    const demoUserId = info.lastInsertRowid;
    const pets = [
      { name: "Барсик", photo: "/demo/demo1.jpg" },
      { name: "Рекс", photo: "/demo/demo2.jpg" },
      { name: "Пушок", photo: "/demo/demo3.jpg" },
      { name: "Макс", photo: "/demo/demo4.jpg" },
      { name: "Бим", photo: "/demo/demo5.jpg" },
      { name: "Мурка", photo: "/demo/demo6.jpg" },
    ];

    const insertReq = db.prepare(
      "INSERT INTO requests (user_id, pet_name, photo_path, result_photo_path, status) VALUES (?, ?, ?, ?, ?)"
    );
    for (const pet of pets) {
      insertReq.run(demoUserId, pet.name, pet.photo, pet.photo, "Услуга оказана");
    }
  }
}

export default getDb;
