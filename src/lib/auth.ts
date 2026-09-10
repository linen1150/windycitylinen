import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const COOKIE = "wcl_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET is not set (need a long random string)");
  }
  return new TextEncoder().encode(s);
}

export type AdminUser = { id: string; email: string; name: string };

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  const user = await db.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    // Constant-ish time: still run a hash comparison.
    await bcrypt.compare(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? { id: user.id, email: user.email, name: user.name } : null;
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Returns the signed-in admin, or null. Verifies the JWT and that the user still exists. */
export async function getAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = payload.sub;
    if (typeof id !== "string") return null;
    const user = await db.adminUser.findUnique({ where: { id } });
    return user ? { id: user.id, email: user.email, name: user.name } : null;
  } catch {
    return null;
  }
}

/** Use in admin pages/layouts and every admin server action. Redirects to login if not authed. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
