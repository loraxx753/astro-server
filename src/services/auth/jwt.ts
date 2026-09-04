import { createHmac, timingSafeEqual } from "node:crypto";
import { jwtSecret } from "./config.js";

export type AuthTokenPayload = {
  sub: string;
  email?: string;
  name?: string;
  provider: string;
  exp: number;
};

function b64urlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(input: string): string {
  return createHmac("sha256", jwtSecret()).update(input).digest("base64url");
}

export function signAuthToken(payload: Omit<AuthTokenPayload, "exp">): string {
  const full: AuthTokenPayload = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const header = b64urlJson({ alg: "HS256", typ: "JWT" });
  const body = b64urlJson(full);
  const unsigned = `${header}.${body}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) {
    throw new Error("Invalid auth token");
  }
  const unsigned = `${header}.${body}`;
  const expected = sign(unsigned);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid auth token signature");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as AuthTokenPayload;
  if (payload.exp < Date.now()) {
    throw new Error("Auth token expired. Sign in again.");
  }
  return payload;
}
