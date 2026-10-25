// Deliberately free of `server-only` so the seeder and CLI scripts can reuse it.
import { hash, verify } from "@node-rs/argon2";

// Argon2id (library default) with the OWASP minimum recommended cost.
const OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1, outputLen: 32 };

export const MIN_PASSWORD_LENGTH = 12;

export function hashPassword(password: string) {
  return hash(password, OPTIONS);
}

// A valid hash of a random value, verified when the username does not exist so
// response time does not reveal which usernames are registered.
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHRzb21lc2FsdA$Lw8eAMIaWl8YdvBbhWs1d8bPJVhVCW6cj4ma+rCmOrk";

export async function verifyPassword(passwordHash: string | null, password: string) {
  try {
    const ok = await verify(passwordHash ?? DUMMY_HASH, password);
    return passwordHash !== null && ok;
  } catch {
    return false;
  }
}
