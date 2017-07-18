var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var low = require('lowdb');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var authService = require('./services/authService');

var app = express();

// connect to database
const db = low('db.json')

// set view engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// bodyParser reads a form's input and stores it in request.body
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies

// add form validation
app.use(expressValidator())

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

// display signup page
app.get('/signup', function(req, res) {
  res.render('auth/signup', { errors: [] })
})

// create user
app.post('/signup', function(req, res) {
  // remove extra spaces
  var username = req.body.username.trim();
  var password = req.body.password.trim();
  var password2 = req.body.password2.trim();

  // validate form data
  req.checkBody('username', 'Username must have at least 3 characters').isLength({min: 5});
  req.checkBody('password', 'Password must have at least 3 characters').isLength({min: 5});
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Confirm password is required').notEmpty();
  req.checkBody('password', 'Password do not match').equals(password2);

  // check for errors
  var errors = req.validationErrors();
  // if there are errors, display signup page
  if (errors) {
    return res.render('auth/signup', {errors: errors})
  }

  var options = {
    loginValue: username,
    password: password,
    successRedirectUrl: '/',
    signUpTemplate: 'auth/signup',
    table: 'users',
  }
  authService.signup(options,res);
})

// start server
app.listen(3000, function(){
  console.log('server on port 3000')
})
