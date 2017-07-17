var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var low = require('lowdb');

var app = express();

// connect to database
const db = low('db.json')

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

// start server
app.listen(3000, function(){
  console.log('server on port 3000')
})
