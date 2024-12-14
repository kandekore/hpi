require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { verifyToken } = require('./services/auth');

// Import the webhook router
const webhookRouter = require('./webhook');

async function startServer() {
  const app = express();

  // Webhook route needs raw body, so no app.use(express.json()) before it
  app.use('/webhook', webhookRouter);

  // After adding webhook, now you can use JSON middleware if needed
  app.use(express.json()); // For other endpoints if required

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
