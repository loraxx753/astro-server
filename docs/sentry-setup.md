# Sentry setup (human steps)

`astro-server` reports crashes and GraphQL resolver errors to Sentry. The DSN stays
in env, not in git. Chart payloads, GraphQL variables, and HTTP bodies are not sent.

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

From `astro-server/`:

```powershell
npx tsx scripts/sentry-verify.ts
```

Then open **Issues** in the Node project. Filter environment **development** if the list looks empty.

If the SDK logs `Sentry responded with status code 403`, the DSN is from a deleted or disabled project. Copy a new DSN from **Settings → Client Keys** on the current vanilla Node project and update `SENTRY_DSN`.
