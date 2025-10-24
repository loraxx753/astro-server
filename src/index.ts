import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schemas/typeDefs.js";
import { resolvers } from "./resolvers.js";
import mongoose from 'mongoose';

const server = new ApolloServer({ typeDefs, resolvers });

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/astrodb';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

server.listen({ port: 7004 }).then(({ url }) => {
  console.log(`🚀  madrox-graphql ready at ${url}`);
});
