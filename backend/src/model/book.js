const mongoose = require('mongoose');
const validator = require('validator');

//validations for the book schema
const bookValidators = {
  title: {
    validator: (value) => {
      if (!value) return false;
      return value.trim().length > 2;
    },
    message: 'Title must be a string with at least 3 characters'
  },
  author: {
    validator: (value) => {
      if (!value) return false;
      return value.trim().length > 2;
    },
    message: 'Author must be a string with at least 3 characters'
  },
  description: {
    validator: (value) => {
      if (!value) return false;
      return value.trim().length > 2;
    },
    message: 'Description must be a string with at least 3 characters'
  },
  ISBN: {
    validator: (value) => {
      if (!value) return false;
      return /^\d{9}$/.test(value);
    },
    message: 'ISBN must be a valid ISBN format'
  },
  genre: {
    validator: (value) => {
      if (!value) return false;
      return value.trim().length > 2;
    },
    message: 'Genre must be a string with at least 3 characters'
  },
  publishedDate: {
    validator: (value) => {
      if (!value) return false;
      return value instanceof Date && !isNaN(value);
    },
    message: 'Published date must be a valid date'
  },
  language: {
    validator: (value) => {
      if (!value) return false;
      return value.trim().length > 2;
    },
    message: 'Language must be a string with at least 3 characters'
  }
};

// Book schema 
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    validate: bookValidators.title
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    validate: bookValidators.author
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    validate: bookValidators.description
  },
  ISBN: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    validate: bookValidators.ISBN
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    validate: bookValidators.genre
  },
  publishedDate: {
    type: Date,
    required: [true, 'Published date is required'],
    validate: bookValidators.publishedDate
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    validate: bookValidators.language
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Book', bookSchema);