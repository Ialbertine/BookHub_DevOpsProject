const Book = require("../model/book");

// search function
const searchQuery = (queryParams) => {
  const {
    search,
    genre,
    author,
    language,
    year,
  } = queryParams;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (genre) {
    query.genre = genre;
  }

  if (author) {
    query.author = author;
  }

  if (language) {
    query.language = language;
  }

  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    query.publishedDate = { $gte: startDate, $lte: endDate };
  }

  return query;
};

// get all books
const getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const search = searchQuery(req.query);
    const books = await Book.find(search)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalBooks = await Book.countDocuments(search);

    const genres = await Book.distinct("genre");
    const authors = await Book.distinct("author");
    const languages = await Book.distinct("language");

    return res.status(200).json({
      data: {
        books,
        pagination: {
          page,
          limit,
          total: totalBooks,
          pages: Math.ceil(totalBooks / limit),
          hasNext: page < Math.ceil(totalBooks / limit),
          hasPrev: page > 1,
        },
        filters: {
          genres,
          authors,
          languages,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get single book
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    return res.status(500).json({ error: error.message });
  }
};

// create book librarian only
const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      genre,
      ISBN,
      language,
      publishedDate,
    } = req.body;

    // Check if book with ISBN already exists
    const existingBook = await Book.findOne({ ISBN });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }

    const book = await Book.create({
      title,
      author,
      description,
      genre,
      ISBN,
      language,
      publishedDate,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while creating book",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// update book librarian only
const updateBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      genre,
      ISBN,
      language,
      publishedDate,
    } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if ISBN is being changed to one that already exists
    if (ISBN && ISBN !== book.ISBN) {
      const existingBook = await Book.findOne({ ISBN });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: "Another book with this ISBN already exists",
        });
      }
    }

    // Update fields if provided
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (description !== undefined) book.description = description;
    if (genre !== undefined) book.genre = genre;
    if (ISBN !== undefined) book.ISBN = ISBN;
    if (language !== undefined) book.language = language;
    if (publishedDate !== undefined) book.publishedDate = publishedDate;
    book.updatedBy = req.user._id;

    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Another book with this ISBN already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while updating book",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete book librarian only
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while deleting book",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
