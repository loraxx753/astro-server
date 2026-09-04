import type { IncomingMessage } from "node:http";
import { verifyAuthToken } from "./services/auth/jwt.js";

export type GraphQLContext = {
  userId?: string;
};

export function createContext(req: IncomingMessage): GraphQLContext {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return {};
  }
  try {
    const payload = verifyAuthToken(header.slice("Bearer ".length));
    return { userId: payload.sub };
  } catch {
    return {};
  }
}
