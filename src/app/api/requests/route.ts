import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import getDb from "@/lib/db";
import path from "path";
import fs from "fs";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const requests = db
    .prepare(
      "SELECT id, pet_name, photo_path, result_photo_path, status, created_at FROM requests WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(session.userId);

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const petName = (formData.get("pet_name") as string || "").trim();
  const photo = formData.get("photo") as File | null;

  const errors: Record<string, string> = {};

  if (!petName) {
    errors.name = "Укажите кличку животного";
  }

  if (!photo || photo.size === 0) {
    errors.photo = "Загрузите фотографию";
  } else {
    const ext = photo.name.split(".").pop()?.toLowerCase();
    if (!["jpeg", "jpg", "bmp"].includes(ext || "")) {
      errors.photo = "Допустимые форматы: JPEG, BMP";
    }
    if (photo.size > 2 * 1024 * 1024) {
      errors.photo = "Максимальный размер файла 2 МБ";
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "pets");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = photo!.name.split(".").pop()?.toLowerCase();
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);
  const buffer = Buffer.from(await photo!.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const dbPath = `/uploads/pets/${fileName}`;
  const db = getDb();
  db.prepare(
    "INSERT INTO requests (user_id, pet_name, photo_path, status) VALUES (?, ?, ?, ?)"
  ).run(session.userId, petName, dbPath, "Новая");

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  const db = getDb();

  interface RequestRow {
    id: number;
    user_id: number;
    status: string;
  }

  const request = db
    .prepare("SELECT id, user_id, status FROM requests WHERE id = ?")
    .get(id) as RequestRow | undefined;

  if (!request) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }

  if (request.user_id !== session.userId) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  if (request.status !== "Новая") {
    return NextResponse.json(
      { error: "Нельзя удалить заявку со статусом отличным от «Новая»" },
      { status: 400 }
    );
  }

  db.prepare("DELETE FROM requests WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
