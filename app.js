var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var low = require('lowdb');
var path = require('path');
var bodyParser = require('body-parser');
const uuid = require('uuid');

var app = express();

// connect to database
// path.join will take the parameters and create a path using the
// right type of slashes (\ vs /) based on the operatin system
const db = low(path.join('data', 'db.json'));

// set view engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// bodyParser reads a form's input and stores it in request.body
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies

// display home page
app.get('/', function(req, res) {
  res.render('home')
})

// display all books
app.get('/books', function(req, res) {
  var books = db.get('books').value()
  var authors = db.get('authors').value()

  res.render('books', { books: books, authors: authors })
})

// create a new book
app.post('/createBook', function(req, res) {
  // get data from form
  var title = req.body.title;
  var author_id = req.body.author_id;

  // insert new book into database
  db.get('books')
    .push({title: title, id: uuid(), author_id: author_id})
    .write()

  // redirect
  res.redirect('/books')
})

// display one book
app.get('/books/:id', function(req, res) {
  var book = db.get('books').find({ id: req.params.id }).value()
  var author;
  if(book) {
    author = db.get('authors').find({ id: book.author_id }).value()
  }

  res.render('book', { book: book || {}, author: author || {}})
})

// start server
app.listen(3000, function(){
  console.log('server on port 3000')
})
