#!/usr/bin/env node
// Usage: node scripts/hash-password.mjs [password]
// Prints an scrypt hash for ADMIN_PASSWORD_HASH. Prompts if no arg is given.
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

const N = 16384, r = 8, p = 1, KEYLEN = 64;

function hash(pw) {
  const salt = randomBytes(16);
  const key = scryptSync(pw.normalize("NFKC"), salt, KEYLEN, { N, r, p });
  // ":" separators (not "$") so dotenv variable expansion can't mangle it.
  return `scrypt:${N}:${r}:${p}:${salt.toString("base64url")}:${key.toString("base64url")}`;
}

let pw = process.argv[2];
if (!pw) {
  const rl = createInterface({ input: process.stdin, output: process.stderr, terminal: true });
  let muted = false;
  rl._writeToOutput = (str) => { if (!muted) rl.output.write(str); };
  pw = await new Promise((res) => {
    rl.question("Password: ", (ans) => { rl.close(); process.stderr.write("\n"); res(ans); });
    muted = true;
  });
}
if (!pw || pw.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
console.log(hash(pw));
