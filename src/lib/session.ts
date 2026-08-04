/**
 * Greenprint · Server-side session helpers
 * ----------------------------------------
 * `getSession()` reads the current Better Auth session on the server.
 * `requireUser()` does the same but redirects unauthenticated visitors to /login,
 * so any protected page/action can start with `const user = await requireUser()`.
 */
import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session.user;
}
