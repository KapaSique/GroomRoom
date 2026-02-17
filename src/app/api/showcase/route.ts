import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  const db = getDb();
  const requests = db
    .prepare(
      `SELECT pet_name, photo_path, result_photo_path
       FROM requests
       WHERE status = 'Услуга оказана' AND result_photo_path IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 4`
    )
    .all();

  return NextResponse.json({ requests });
}
