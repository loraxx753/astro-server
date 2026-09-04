import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { AuthProviderName } from "./config.js";
import { jwtSecret } from "./config.js";

type OAuthState = {
  provider: AuthProviderName;
  nonce: string;
  exp: number;
};

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", jwtSecret()).update(payload).digest("base64url");
}

export function createOAuthState(provider: AuthProviderName): string {
  const body: OAuthState = {
    provider,
    nonce: randomBytes(16).toString("base64url"),
    exp: Date.now() + 10 * 60 * 1000,
  };
  const payload = b64url(JSON.stringify(body));
  return `${payload}.${sign(payload)}`;
}

export function readOAuthState(state: string): OAuthState {
  const [payload, signature] = state.split(".");
  if (!payload || !signature) {
    throw new Error("Invalid OAuth state");
  }
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid OAuth state signature");
  }
  const body = JSON.parse(Buffer.from(payload, "base64url").toString()) as OAuthState;
  if (body.exp < Date.now()) {
    throw new Error("OAuth state expired. Start sign-in again.");
  }
  return body;
}
