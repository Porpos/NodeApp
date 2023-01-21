const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const multer = require("multer");
const path = require("path");
const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});
//All Books Route
router.get("/", async (req, res) => {
  let searchOptions = {};

  if (req.query.title !== null || req.query.title !== "") {
    searchOptions.title = new RegExp(req.query.title, "i");
  }

  const books = await Book.find(searchOptions);
  res.render("books/index", { books: books, searchOptions:req.query.title});
});

//New Books Route

router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

//Create Books Route
router.post("/", upload.single("cover"), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author.trim(" "),
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description,
  });
  try {
    const newBook = book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`);
  } catch {
    renderNewPage(res, book, true);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { book: book, authors: authors };

    if (hasError) params.errorMessage = "Error Creating Book";

    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}

module.exports = router;
