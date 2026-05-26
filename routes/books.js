const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// protect all routes below
router.use(auth);

// GET /api/books - list books for the authenticated user
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(books);
  } catch (err) {
    console.error('List books error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/books - create a new book for the authenticated user
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn } = req.body || {};
    if (!title || !author || !isbn) {
      return res.status(400).json({ error: 'title, author and isbn are required' });
    }
    const book = await Book.create({ title, author, isbn, user: req.user.id });
    return res.status(201).json(book);
  } catch (err) {
    console.error('Create book error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
