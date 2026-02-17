import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import getDb from "@/lib/db";
import path from "path";
import fs from "fs";

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();
  const requests = db
    .prepare(
      `SELECT r.id, r.pet_name, r.photo_path, r.result_photo_path, r.status, r.created_at, u.fio, u.login
       FROM requests r JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    )
    .all();

  return NextResponse.json({ requests });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const id = formData.get("id") as string;
  const newStatus = formData.get("status") as string;
  const resultPhoto = formData.get("result_photo") as File | null;

  const db = getDb();

  interface RequestRow {
    id: number;
    status: string;
  }

  const request = db
    .prepare("SELECT id, status FROM requests WHERE id = ?")
    .get(Number(id)) as RequestRow | undefined;

  if (!request) {
    return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
  }

  if (request.status === "Услуга оказана") {
    return NextResponse.json(
      { error: "Нельзя изменить статус завершённой заявки" },
      { status: 400 }
    );
  }

  if (
    request.status === "Новая" &&
    newStatus !== "Обработка данных"
  ) {
    return NextResponse.json(
      { error: "Заявку со статусом «Новая» можно перевести только в «Обработка данных»" },
      { status: 400 }
    );
  }

  if (
    request.status === "Обработка данных" &&
    newStatus !== "Услуга оказана"
  ) {
    return NextResponse.json(
      { error: "Заявку со статусом «Обработка данных» можно перевести только в «Услуга оказана»" },
      { status: 400 }
    );
  }

  if (newStatus === "Услуга оказана") {
    if (!resultPhoto || resultPhoto.size === 0) {
      return NextResponse.json(
        { error: "Необходимо прикрепить фотографию результата" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "results");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = resultPhoto.name.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    const buffer = Buffer.from(await resultPhoto.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const dbPath = `/uploads/results/${fileName}`;
    db.prepare(
      "UPDATE requests SET status = ?, result_photo_path = ? WHERE id = ?"
    ).run(newStatus, dbPath, Number(id));
  } else {
    db.prepare("UPDATE requests SET status = ? WHERE id = ?").run(
      newStatus,
      Number(id)
    );
  }

  return NextResponse.json({ success: true });
}
