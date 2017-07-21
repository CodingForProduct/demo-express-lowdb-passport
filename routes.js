var router = require('express').Router();
var low = require('lowdb');
var path = require('path');
var uuid = require('uuid');
var authService = require('./services/authService');
var passport = require('passport');
authService.configurePassport(passport)


// connect to database
// path.join will take the parameters and create a path using the
// right type of slashes (\ vs /) based on the operatin system
var db = low(path.join('data', 'db.json'));

//==========================
// root route
//==========================

// display home page
router.get('/', function(req, res) {
  res.render('home')
})

//==========================
// book routes
//==========================

// display all books
router.get('/books', function(req, res) {
  var books = db.get('books').value()
  var authors = db.get('authors').value()

  res.render('books', { books: books, authors: authors })
})

// create a new book
router.post('/createBook', function(req, res) {
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
router.get('/books/:id', function(req, res) {
  var book = db.get('books').find({ id: req.params.id }).value()
  var author;
  if(book) {
    author = db.get('authors').find({ id: book.author_id }).value()
  }

  res.render('book', { book: book || {}, author: author || {}})
})

//==========================
// auth routes
//==========================

var signup_view_path = path.join('auth', 'signup');
var login_view_path = path.join('auth', 'login');

// display signup page only if user is not logged in
router.get('/signup', isLoggedOut(), function(req, res) {
  res.render(signup_view_path)
})

// create user
router.post('/signup', function(req, res) {
  // remove extra spaces
  var username = req.body.username.trim();
  var password = req.body.password.trim();
  var password2 = req.body.password2.trim();

  // validate form data
  req.checkBody('username', 'Username must have at least 3 characters').isLength({min: 3});
  req.checkBody('password', 'Password must have at least 3 characters').isLength({min: 3});
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Confirm password is required').notEmpty();
  req.checkBody('password', 'Password do not match').equals(password2);

  // check for errors
  var errors = req.validationErrors();
  // if there are errors, display signup page
  if (errors) {
    return res.render(signup_view_path, {errors: errors.map(function(error) {return error.msg})})
  }

  var options = {
    username: username,
    password: password,
    successRedirectUrl: '/',
    signUpTemplate: signup_view_path,
  }
  authService.signup(options,res);
})

// display login page  if user is not logged in
router.get('/login', isLoggedOut(), function(req, res) {
  res.render(login_view_path, { errors: [] })
})

// peform login
router.post(
  '/login',
  passport.authenticate(
    'local',
    {
      successRedirect:'/',
      failureRedirect:'/login',
      failureFlash: true,
      successFlash: 'You are logged in',
    }
  )
)

// logout user
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/')
})

// display profile page if user is logged in
router.get('/profile', isLoggedIn(), function(req, res) {
  var dbUser =  db.get('users').find({ id: req.user.id }).value();

  res.render('profile', { dbUser:  dbUser })
})

//==========================
// middleware
//==========================

// isAuthenticated comes from passport;
// when a user is logged in, isAuthenticated return true.

function isLoggedIn () {
	return (req, res, next) => {
    // if there is a logged in user, do the next thing, and execute the
    // function for the route
    if (req.isAuthenticated()) { return next() };

    // if there isn't a login user, skip the function for the route, and
    // redirect to the login page
    return res.redirect('/login')
	}
}

function isLoggedOut () {
	return (req, res, next) => {
    // if there isn't a login user, execute the function for the route
    if (!req.isAuthenticated()) { return next() };

    // if there is a logged in user, redirect
    return res.redirect('/')
	}
}

module.exports = router;
