import * as Sentry from "@sentry/node";

try {
  process.loadEnvFile();
} catch {
  // Railway injects env vars; a local .env is optional.
}

const dsn = process.env.SENTRY_DSN?.trim();

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0,
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

export async function flushSentry(): Promise<void> {
  if (!dsn) {
    return;
  }
  await Sentry.flush(2000);
}
