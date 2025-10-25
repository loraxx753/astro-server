import { ApolloServer } from "@apollo/server";
import typeDefs from "./schemas/typeDefs.js";
import { resolvers } from "./resolvers.js";
import mongoose from 'mongoose';
import { startStandaloneServer } from "@apollo/server/standalone";

const server = new ApolloServer({ typeDefs, resolvers });

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/astrodb';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Start the server
startStandaloneServer(server, { listen: { port: 7004 } }).then(({ url }) => {
  console.log(`🚀 madrox-graphql ready at ${url}`);
});