var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var low = require('lowdb');
var path = require('path');

var app = express();

// connect to database
// path.join will take the parameters and create a path using the
// right type of slashes (\ vs /) based on the operatin system
const db = low(path.join('data', 'db.json'));

// set view engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// display home page
app.get('/', function(req, res) {
  res.render('home')
})

// display all books
app.get('/books', function(req, res) {
  var books = db.get('books').value()

  res.render('books', { books: books })
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
