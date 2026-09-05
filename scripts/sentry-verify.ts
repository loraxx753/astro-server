import * as Sentry from "@sentry/node";
import { flushSentry } from "../src/instrument.ts";

const client = Sentry.getClient();
const dsn = client?.getDsn();
const eventId = Sentry.captureException(
  new Error("Sentry local verify: astro-server")
);
const flushed = await flushSentry();
await Sentry.close(5000);

console.log(
  JSON.stringify({
    dsnConfigured: Boolean(process.env.SENTRY_DSN?.trim()),
    clientInitialized: Boolean(client),
    ingestHost: dsn?.host ?? null,
    eventId: eventId || null,
    flushed,
  })
);
