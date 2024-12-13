require('dotenv').config();
console.log("JWT_SECRET is", process.env.JWT_SECRET);
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { verifyToken } = require('./services/auth');

async function startServer() {
  const app = express();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      if (token) {
        try {
          const payload = verifyToken(token.replace('Bearer ', ''));
          return { user: payload };
        } catch (e) {
          console.error('Invalid token', e);
        }
      }
      return {};
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  app.listen({ port: 4000 }, () => {
    console.log('Server running at http://localhost:4000/graphql');
  });
}

startServer();
