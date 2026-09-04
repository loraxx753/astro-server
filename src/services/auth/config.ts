export type AuthProviderName = "google" | "github";

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is not set. Follow the human setup steps in docs/oauth-setup.md.`
    );
  }
  return value;
}

export function jwtSecret(): string {
  return requireEnv("JWT_SECRET");
}

export function oauthRedirectUri(): string {
  return requireEnv("OAUTH_REDIRECT_URI");
}

export function googleClientId(): string {
  return requireEnv("GOOGLE_CLIENT_ID");
}

export function googleClientSecret(): string {
  return requireEnv("GOOGLE_CLIENT_SECRET");
}

export function githubClientId(): string {
  return requireEnv("GITHUB_CLIENT_ID");
}

export function githubClientSecret(): string {
  return requireEnv("GITHUB_CLIENT_SECRET");
}

export function graphqlProviderToName(provider: string): AuthProviderName {
  const normalized = provider.toLowerCase();
  if (normalized === "google" || normalized === "github") {
    return normalized;
  }
  throw new Error(`Unsupported auth provider: ${provider}`);
}
