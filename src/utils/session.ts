// Edge-compatible signed sessions. Password rotation invalidates all sessions.
export const SESSION_COOKIE = "research_session";
export const SESSION_SECONDS = 7 * 24 * 60 * 60;
const encoder = new TextEncoder();
async function sessionKey(password: string) {
  return crypto.subtle.importKey("raw", encoder.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
export async function createSession(password: string, now = Date.now()) {
  const expires = String(now + SESSION_SECONDS * 1000);
  const signature = await crypto.subtle.sign("HMAC", await sessionKey(password), encoder.encode(`research-session:${expires}`));
  return `${expires}.${Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, "0")).join("")}`;
}
export async function verifySession(token: string | undefined, password: string, now = Date.now()) {
  if (!password || !token) return false;
  const match = /^(\d{13})\.([a-f0-9]{64})$/.exec(token);
  if (!match || Number(match[1]) <= now || Number(match[1]) > now + SESSION_SECONDS * 1000) return false;
  const signature = Uint8Array.from(match[2].match(/../g)!, h => parseInt(h, 16));
  return crypto.subtle.verify("HMAC", await sessionKey(password), signature, encoder.encode(`research-session:${match[1]}`));
}
export async function passwordMatches(candidate: string, password: string) {
  if (!password) return false;
  const key = await sessionKey(password);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(password));
  return crypto.subtle.verify("HMAC", key, signature, encoder.encode(candidate));
}
