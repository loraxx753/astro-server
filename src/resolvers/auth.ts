import type { GraphQLContext } from "../context.js";
import { graphqlProviderToName } from "../services/auth/config.js";
import { buildAuthUrl, exchangeOAuthCode as exchangeProviderCode } from "../services/auth/oauth.js";
import { getUserById, upsertUserFromOAuth } from "../services/auth/session.js";
import { readOAuthState } from "../services/auth/state.js";

export const authResolvers = {
  Query: {
    authUrl(_: unknown, { provider }: { provider: string }) {
      return buildAuthUrl(graphqlProviderToName(provider));
    },
    async me(_: unknown, __: unknown, ctx: GraphQLContext) {
      if (!ctx.userId) {
        return null;
      }
      return getUserById(ctx.userId);
    },
  },
  Mutation: {
    async exchangeOAuthCode(
      _: unknown,
      { code, state }: { code: string; state: string }
    ) {
      const { provider } = readOAuthState(state);
      const profile = await exchangeProviderCode(provider, code);
      return upsertUserFromOAuth(profile);
    },
  },
};
