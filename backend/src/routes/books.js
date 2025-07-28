const { verifyToken, restrictTo } = require("../middleware/auth");
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const router = require("express").Router();

// member routes access
router.get("/all", verifyToken, getAllBooks);
router.get("/:id", verifyToken, getBookById);

// librarian only routes and also librarian can get all the book too as well
router.post("/create", verifyToken, restrictTo("librarian"), createBook);
router.put("/:id", verifyToken, restrictTo("librarian"), updateBook);
router.delete("/:id", verifyToken, restrictTo("librarian"), deleteBook);

module.exports = router;
