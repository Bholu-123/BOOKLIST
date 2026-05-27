const { Schema, model, Types } = require('mongoose');

const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true },
    owner: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = model('Book', BookSchema);
