import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const fio = (formData.get("fio") as string || "").trim();
  const login = (formData.get("login") as string || "").trim();
  const email = (formData.get("email") as string || "").trim();
  const password = formData.get("password") as string || "";
  const password2 = formData.get("password2") as string || "";
  const agree = formData.get("agree");

  const errors: Record<string, string> = {};

  if (!fio) {
    errors.fio = "Поле ФИО обязательно для заполнения";
  } else if (!/^[а-яА-ЯёЁ\s]+$/.test(fio)) {
    errors.fio = "ФИО должно содержать только кириллические буквы и пробелы";
  }

  if (!login) {
    errors.login = "Поле Логин обязательно для заполнения";
  } else if (!/^[a-zA-Z-]+$/.test(login)) {
    errors.login = "Логин должен содержать только латиницу и дефис";
  }

  if (!email) {
    errors.email = "Поле Email обязательно для заполнения";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Некорректный формат email";
  }

  if (!password) {
    errors.pass = "Поле Пароль обязательно для заполнения";
  }

  if (!password2) {
    errors.pass2 = "Поле Повтор пароля обязательно для заполнения";
  } else if (password !== password2) {
    errors.pass2 = "Пароли не совпадают";
  }

  if (!agree || agree === "false") {
    errors.agree = "Необходимо дать согласие на обработку персональных данных";
  }

  if (!errors.login && login) {
    const db = getDb();
    const existing = db
      .prepare("SELECT id FROM users WHERE login = ?")
      .get(login);
    if (existing) {
      errors.login = "Пользователь с таким логином уже существует";
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const db = getDb();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT INTO users (fio, login, email, password_hash, role) VALUES (?, ?, ?, ?, ?)"
  ).run(fio, login, email, hash, "user");

  return NextResponse.json({ success: true });
}
