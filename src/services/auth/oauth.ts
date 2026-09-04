import type { AuthProviderName } from "./config.js";
import {
  githubClientId,
  githubClientSecret,
  googleClientId,
  googleClientSecret,
  oauthRedirectUri,
} from "./config.js";
import { createOAuthState } from "./state.js";

export type OAuthProfile = {
  provider: AuthProviderName;
  providerId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

export function buildAuthUrl(provider: AuthProviderName): { url: string; state: string } {
  const state = createOAuthState(provider);
  const redirectUri = oauthRedirectUri();

  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: googleClientId(),
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      state,
    };
  }

  const params = new URLSearchParams({
    client_id: githubClientId(),
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
  });
  return {
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    state,
  };
}

export async function exchangeOAuthCode(
  provider: AuthProviderName,
  code: string
): Promise<OAuthProfile> {
  if (provider === "google") {
    return exchangeGoogle(code);
  }
  return exchangeGithub(code);
}

async function exchangeGoogle(code: string): Promise<OAuthProfile> {
  const body = new URLSearchParams({
    code,
    client_id: googleClientId(),
    client_secret: googleClientSecret(),
    redirect_uri: oauthRedirectUri(),
    grant_type: "authorization_code",
  });
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.error || "Google token exchange failed");
  }
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  const user = (await userRes.json()) as {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
  };
  if (!userRes.ok || !user.id) {
    throw new Error("Google profile fetch failed");
  }
  return {
    provider: "google",
    providerId: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.picture,
  };
}

async function exchangeGithub(code: string): Promise<OAuthProfile> {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "shimmering-stars",
    },
    body: JSON.stringify({
      client_id: githubClientId(),
      client_secret: githubClientSecret(),
      code,
      redirect_uri: oauthRedirectUri(),
    }),
  });
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.error_description || tokenJson.error || "GitHub token exchange failed");
  }
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      "User-Agent": "shimmering-stars",
      Accept: "application/vnd.github+json",
    },
  });
  const user = (await userRes.json()) as {
    id?: number;
    login?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  if (!userRes.ok || user.id == null) {
    throw new Error("GitHub profile fetch failed");
  }
  let email = user.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "User-Agent": "shimmering-stars",
        Accept: "application/vnd.github+json",
      },
    });
    const emails = (await emailsRes.json()) as Array<{
      email: string;
      primary?: boolean;
      verified?: boolean;
    }>;
    email =
      emails.find((item) => item.primary && item.verified)?.email ||
      emails.find((item) => item.verified)?.email ||
      emails[0]?.email;
  }
  return {
    provider: "github",
    providerId: String(user.id),
    email,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
  };
}
