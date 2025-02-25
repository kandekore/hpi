require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { verifyToken } = require('./services/auth');

async function startServer() {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'http://192.168.1.9:3000',
        'https://studio.apollographql.com',
        'http://192.168.1.9:4000', // no leading space
        'http://localhost:4000'
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

  const webhookRoutes = require('./webhook'); // or wherever webhook.js is located
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
