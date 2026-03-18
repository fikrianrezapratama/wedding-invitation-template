import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "lamaran_admin_session";

type AuthPayload = {
  role: "admin";
  exp: number;
};

function getSecret() {
  return process.env.AUTH_SECRET || "local-development-secret";
}

export function shouldUseSecureCookie() {
  const explicit = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase();

  if (explicit === "true") {
    return true;
  }

  if (explicit === "false") {
    return false;
  }

  return process.env.NODE_ENV === "production";
}

function encode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function decode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createAuthToken() {
  const payload: AuthPayload = {
    role: "admin",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  };
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAuthToken(token?: string | null) {
  if (!token) return false;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expected = sign(encodedPayload);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(decode(encodedPayload)) as AuthPayload;
    return payload.role === "admin" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminLoggedIn() {
  const cookieStore = await cookies();
  return verifyAuthToken(cookieStore.get(AUTH_COOKIE)?.value);
}
