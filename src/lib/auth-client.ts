/**
 * Greenprint · Better Auth browser client
 * ----------------------------------------
 * Used by client components for sign-in / sign-up / sign-out and to read the
 * current session reactively via `useSession()`.
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? undefined, // same-origin by default
});

export const { signIn, signUp, signOut, useSession } = authClient;
