import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

interface UserRow {
  id: number;
  login: string;
  fio: string;
  role: string;
  password_hash: string;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const login = (formData.get("login") as string || "").trim();
  const password = formData.get("password") as string || "";

  const errors: Record<string, string> = {};

  if (!login) errors.login = "Введите логин";
  if (!password) errors.pass = "Введите пароль";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT id, login, fio, role, password_hash FROM users WHERE login = ?")
    .get(login) as UserRow | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json(
      {
        success: false,
        errors: { login: "Неверный логин или пароль", pass: "Неверный логин или пароль" },
      },
      { status: 401 }
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.login = user.login;
  session.role = user.role;
  session.fio = user.fio;
  await session.save();

  return NextResponse.json({
    success: true,
    role: user.role,
    redirect: user.role === "admin" ? "/admin" : "/dashboard",
  });
}
