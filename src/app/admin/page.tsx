import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import getDb from "@/lib/db";
import AdminClient from "@/components/AdminClient";

interface RequestRow {
  id: number;
  pet_name: string;
  photo_path: string;
  result_photo_path: string | null;
  status: string;
  created_at: string;
  fio: string;
  login: string;
}

export default async function AdminPage() {
  const session = await getSession();

  if (!session.userId) redirect("/");
  if (session.role !== "admin") redirect("/dashboard");

  const db = getDb();
  const requests = db
    .prepare(
      `SELECT r.id, r.pet_name, r.photo_path, r.result_photo_path, r.status, r.created_at, u.fio, u.login
       FROM requests r JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    )
    .all() as RequestRow[];

  return <AdminClient requests={requests} />;
}
