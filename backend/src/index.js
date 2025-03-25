// src/index.js

import 'dotenv/config'; // or import dotenv from 'dotenv'; dotenv.config();
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import typeDefs from './schema.js';
import resolvers from './resolvers/index.js';
import { verifyToken } from './services/auth.js';
import webhookRoutes from './webhook.js';

// Recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'http://192.168.1.9:3000',
        'https://studio.apollographql.com',
        'http://192.168.1.9:4000',
        'https://cdn2.vdicheck.com',
        'http://localhost:4000',
        'http://localhost:3001',
        'https://admin.vehicledatainformation.co.uk',
      ],
      credentials: true,
    })
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      let userContext = {};
      if (token.startsWith('Bearer ')) {
        try {
          const payload = verifyToken(token.replace('Bearer ', ''));
          console.log('Decoded token payload:', payload);
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

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL);
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }

  // Use webhook routes
  app.use('/webhook', webhookRoutes);

  // Serve React from /frontend/build
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}${server.graphqlPath}`);
  });
}

startServer();
