import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as Sentry from "@sentry/node";
import type { ApolloServerPlugin } from "@apollo/server";

try {
  process.loadEnvFile();
} catch {
  // Railway injects env vars; a local .env is optional.
}

const dsn = process.env.SENTRY_DSN?.trim();

function packageRelease(): string {
  try {
    const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string; version?: string };
    return `${pkg.name ?? "astro-server"}@${pkg.version ?? "0.0.0"}`;
  } catch {
    return "astro-server@0.0.0";
  }
}

if (dsn) {
  Sentry.init({
    dsn,
    release: packageRelease(),
    sendDefaultPii: false,
    tracesSampleRate: 0,
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
    debug: process.env.SENTRY_DEBUG === "1",
    dataCollection: {
      userInfo: false,
      cookies: false,
      urlQueryParams: false,
      httpBodies: [],
      graphQL: { document: false, variables: false },
      databaseQueryData: false,
      stackFrameVariables: false,
    },
  });
}

export async function flushSentry(): Promise<boolean> {
  if (!dsn) {
    return false;
  }
  return Sentry.flush(5000);
}

export function captureSentryException(error: unknown): void {
  if (!dsn) {
    return;
  }
  Sentry.captureException(error);
}

/** Report GraphQL resolver failures without attaching variables or chart payloads. */
export const sentryApolloPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async didEncounterErrors(ctx) {
        if (!dsn) {
          return;
        }
        for (const err of ctx.errors) {
          Sentry.withScope((scope) => {
            scope.setTag("kind", ctx.operation?.operation ?? "unknown");
            if (ctx.operationName) {
              scope.setTag("operationName", ctx.operationName);
            }
            Sentry.captureException(err);
          });
        }
      },
    };
  },
};
