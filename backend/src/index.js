require('dotenv').config();
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
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      let userContext = {};
      if (token) {
        try {
          const payload = verifyToken(token.replace('Bearer ', ''));
          userContext.user = payload;
        } catch (e) {
          console.error('Invalid token', e);
        }
      }
      return { ...userContext, req };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL);
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();
