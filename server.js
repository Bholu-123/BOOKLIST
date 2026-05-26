require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Serve static front-end
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
