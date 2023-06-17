const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const functions = require('firebase-functions');

const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const flashcardsRoutes = require('./routes/flashcardsRoutes');
const deckRoutes = require('./routes/deckRoutes');
const sessionsRoutes = require('./routes/sessionsRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
  console.log('%s %s', req.method, req.url);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/flashcards', flashcardsRoutes);
app.use('/decks', deckRoutes);
app.use('/sessions', sessionsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

exports.api = functions.https.onRequest(app);
