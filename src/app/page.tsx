import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import getDb from "@/lib/db";
import MainPageClient from "@/components/MainPageClient";

interface ShowcaseRequest {
  pet_name: string;
  photo_path: string;
  result_photo_path: string;
}

export default async function HomePage() {
  const session = await getSession();

  if (session.userId) {
    if (session.role === "admin") redirect("/admin");
    else redirect("/dashboard");
  }

  const db = getDb();
  const showcaseRequests = db
    .prepare(
      `SELECT pet_name, photo_path, result_photo_path
       FROM requests
       WHERE status = 'Услуга оказана' AND result_photo_path IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 4`
    )
    .all() as ShowcaseRequest[];

  return <MainPageClient showcaseRequests={showcaseRequests} />;
}
