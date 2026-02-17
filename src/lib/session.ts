import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: number;
  login?: string;
  role?: string;
  fio?: string;
}

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "groomroom-super-secret-key-that-is-at-least-32-chars-long!",
  cookieName: "groomroom_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
