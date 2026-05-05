// Auth.js v5 Route-Handler für /api/auth/*
// `handlers` ist ein Objekt {GET, POST} — destructured re-exportieren
// (NICHT `export {GET, POST} from "@/auth"`, weil auth.ts nur `handlers` exportiert).
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
