const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// protect all routes below
router.use(auth);

// GET /api/books - list books for current user
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/books - create a new book
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn } = req.body;
    if (!title || !author || !isbn) {
      return res.status(400).json({ message: 'title, author, and isbn are required' });
    }
    const book = await Book.create({ title, author, isbn, owner: req.userId });
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
