import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import getDb from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

interface RequestRow {
  id: number;
  pet_name: string;
  photo_path: string;
  result_photo_path: string | null;
  status: string;
  created_at: string;
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session.userId) redirect("/");
  if (session.role === "admin") redirect("/admin");

  const db = getDb();
  const requests = db
    .prepare(
      "SELECT id, pet_name, photo_path, result_photo_path, status, created_at FROM requests WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(session.userId) as RequestRow[];

  return (
    <DashboardClient
      userFio={session.fio || ""}
      requests={requests}
    />
  );
}
