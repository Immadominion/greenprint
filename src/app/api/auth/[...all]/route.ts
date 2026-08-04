/**
 * Catch-all route handler that mounts every Better Auth endpoint under
 * /api/auth/* (sign-in, sign-up, sign-out, get-session, …).
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
