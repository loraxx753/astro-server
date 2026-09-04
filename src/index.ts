import { flushSentry } from "./instrument.js";
import * as Sentry from "@sentry/node";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import net from "node:net";
import { createContext, type GraphQLContext } from "./context.js";
import typeDefs from "./schemas/typeDefs.js";
import { resolvers } from "./resolvers.js";

process.on("uncaughtException", (err) => {
  console.error("uncaughtException", err);
  Sentry.captureException(err);
  void flushSentry().finally(() => process.exit(1));
});
process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection", err);
  Sentry.captureException(err);
  void flushSentry().finally(() => process.exit(1));
});

const parsedPort = Number(process.env.PORT);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 7004;
const host = "0.0.0.0";

const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

async function listenOnFallbackPort() {
  if (port === 7004) return;
  await new Promise<void>((resolve, reject) => {
    const proxy = net.createServer((client) => {
      const upstream = net.connect({ host: "127.0.0.1", port });
      client.pipe(upstream);
      upstream.pipe(client);
      client.on("error", () => upstream.destroy());
      upstream.on("error", () => client.destroy());
    });
    proxy.once("error", reject);
    proxy.listen(7004, host, () => {
      console.log(`Also listening on ${host}:7004 (Railway target-port fallback)`);
      resolve();
    });
  });
}

try {
  console.log(`Starting GraphQL server on ${host}:${port}`);
  const { url } = await startStandaloneServer(server, {
    listen: { host, port },
    context: async ({ req }) => createContext(req),
  });
  await listenOnFallbackPort();
  console.log(`🚀 madrox-graphql ready at ${url}`);
} catch (err) {
  console.error("Failed to start GraphQL server:", err);
  Sentry.captureException(err);
  await flushSentry();
  process.exit(1);
}
