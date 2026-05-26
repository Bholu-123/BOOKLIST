const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/books - list books for current user
router.get('/', auth, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error('List books error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/books - create a book for current user
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, isbn } = req.body;
    if (!title || !author || !isbn) {
      return res.status(400).json({ message: 'Title, author, and isbn are required' });
    }
    const book = await Book.create({ title, author, isbn, user: req.user.id });
    res.status(201).json(book);
  } catch (err) {
    console.error('Create book error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
