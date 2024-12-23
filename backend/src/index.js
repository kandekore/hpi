// backend/src/index.js
require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const path = require('path'); // Possibly no longer needed if you use absolute paths directly
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { verifyToken } = require('./services/auth');

async function startServer() {
  const app = express();

  // Use the absolute path given by your host
  app.use(express.static('/home/virtual/vps-abaa2c/8/875bf0ee83/public_html/frontend/build'));

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

  // Serve the index.html for any route not handled by GraphQL or static files
  app.get('*', (req, res) => {
    res.sendFile('/home/virtual/vps-abaa2c/8/875bf0ee83/public_html/frontend/build/index.html');
  });

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer();
