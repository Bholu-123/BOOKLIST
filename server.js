const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklist';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const PORT = process.env.PORT || 3000;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

const app = express();

app.use(express.json());

// APIs
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic health endpoint
app.get('/healthz', (req, res) => res.json({ ok: true }));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
});
