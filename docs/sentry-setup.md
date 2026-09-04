# Sentry setup (human steps)

`astro-server` reports crashes and unhandled errors to Sentry. The DSN stays in env, not in git.
Chart payloads, GraphQL variables, and HTTP bodies are not sent.

Charts still run if `SENTRY_DSN` is unset.

## 1. Create the project

1. Open [Sentry](https://sentry.io) and create a **Node.js** (vanilla) project for `astro-server`.
2. Copy the DSN from the SDK setup page.

Do not use the Express snippet. This server is Apollo standalone, not Express.

## 2. Local `.env`

```
SENTRY_DSN=https://...@....ingest.us.sentry.io/...
```

Restart `npm run dev` after saving.

## 3. Railway

On the `astro-server` service Variables, add the same `SENTRY_DSN`. Redeploy after this code is on `main`.

## 4. Verify

In Sentry: **Take me to Issues**. A captured `uncaughtException` or a thrown resolver error should appear within a minute. Do not leave a deliberate crash in production.
