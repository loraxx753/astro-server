# OAuth setup (human steps)

The SPA never holds client secrets. Google and GitHub talk to `astro-server`, which
exchanges the code, upserts a `User`, and returns a JWT. Chart queries still work
without Mongo or OAuth env vars; **sign-in fails until this file is done**.

Redirect URI already used by the frontend callback page:

- Local: `http://localhost:5173/signin/callback`
- Production: `https://shimmeringstars.org/signin/callback`

GitHub OAuth apps allow **one** callback URL. Use two GitHub apps (local vs prod).
Google can list both redirect URIs on one Web client.

## 1. JWT secret

From `astro-server/`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into `JWT_SECRET` (local `.env` and Railway). Do not commit it.

## 2. MongoDB Atlas

1. Open [MongoDB Atlas](https://cloud.mongodb.com) and create a free cluster.
2. **Database Access**: create a user with Atlas admin or read/write on the app database.
3. **Network Access**: add `0.0.0.0/0` so Railway and your laptop can connect. Tighten this later if you want.
4. **Database** → **Connect** → **Drivers** → copy the `mongodb+srv://...` URI.
5. Replace `<password>` and set a database name (for example `/shimmering-stars`).
6. Put the connection string in `MONGO_URL` (Railway's Mongo variable name).

Users land in a `users` collection after the first successful sign-in.

## 3. Google Cloud OAuth client

1. Open [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials).
2. Create or select a project (for example `shimmering-stars`).
3. **APIs & Services** → **OAuth consent screen**:
   - User type: External.
   - App name: Shimmering Stars.
   - Add your email as a developer and as a test user while the app is in Testing.
4. **Credentials** → **Create credentials** → **OAuth client ID** → **Web application**.
5. Authorized JavaScript origins:
   - `http://localhost:5173`
   - `https://shimmeringstars.org`
6. Authorized redirect URIs:
   - `http://localhost:5173/signin/callback`
   - `https://shimmeringstars.org/signin/callback`
7. Copy Client ID → `GOOGLE_CLIENT_ID`.
8. Copy Client secret → `GOOGLE_CLIENT_SECRET`.

Google shows an “unverified app” warning for test users. That is expected until you publish the consent screen.

## 4. GitHub OAuth apps (two of them)

GitHub: [Developer settings → OAuth Apps](https://github.com/settings/developers).

### Local app

- Application name: `Shimmering Stars (local)`
- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:5173/signin/callback`

Put that Client ID / secret in **local** `astro-server/.env`.

### Production app

- Application name: `Shimmering Stars`
- Homepage URL: `https://shimmeringstars.org`
- Authorization callback URL: `https://shimmeringstars.org/signin/callback`

Put that Client ID / secret in **Railway** variables.

## 5. Local `astro-server/.env`

Copy `.env.example` and fill:

```
MONGO_URL=mongodb+srv://...
JWT_SECRET=...
OAUTH_REDIRECT_URI=http://localhost:5173/signin/callback
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

`OAUTH_REDIRECT_URI` must match the Google/GitHub callback URL **exactly**, including `http` vs `https` and the port.

Restart `npm run dev` after editing `.env`.

The frontend still only needs `VITE_GRAPHQL_API_URL=http://localhost:7004`.

## 6. Railway (production)

On the `astro-server` service, set:

| Variable | Production value |
| --- | --- |
| `MONGO_URL` | Atlas / Railway Mongo URL |
| `JWT_SECRET` | Same generator as step 1 (can differ from local) |
| `OAUTH_REDIRECT_URI` | `https://shimmeringstars.org/signin/callback` |
| `GOOGLE_CLIENT_ID` | Same Google Web client as local |
| `GOOGLE_CLIENT_SECRET` | Same Google secret as local |
| `GITHUB_CLIENT_ID` | **Production** GitHub app |
| `GITHUB_CLIENT_SECRET` | **Production** GitHub app |

Redeploy after saving variables.

## 7. Smoke test

1. `astro-server`: `npm run dev` on port 7004.
2. `shimmering-stars`: `npm run dev` on port 5173.
3. Open `http://localhost:5173/signin`.
4. Click Google or GitHub, approve, land on `/signin/callback`, then home.
5. Header should show your name (or email) and **Sign out**.

If Google/GitHub says redirect_uri mismatch, the console callback URL does not match `OAUTH_REDIRECT_URI` and the browser URL.

If exchange fails with `MONGO_URL is not set`, step 2/5 is incomplete.

Charts (`planetaryPositions` / `housePositions`) stay public and do not require a session.
