var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var low = require('lowdb');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var uuid = require('uuid');
var NedbStore = require('connect-nedb-session')(session);
var authService = require('./services/authService');

var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;

var app = express();

// connect to database
const db = low('data/db.json')

// set view engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// bodyParser reads a form's input and stores it in request.body
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies

// cookie, session, passport is for authentication
app.use(cookieParser());

// Express Session
var sess = {
  secret: 'secret',
  cookie: {},
  resave: false,
  saveUninitialized: false,
  store: new NedbStore({ filename: 'data/sessionFile.json' }),
}
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies for https
}
app.use(session(sess))

// intialize passport
app.use(passport.initialize());
app.use(passport.session());

// add form validation
app.use(expressValidator())

// use flash; enalbe cookieParser and session before flash
app.use(flash());

// set variables for the view
app.use(function(req, res, next) {
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  res.locals.user = req.user || null;
  next();
})


// display home page
app.get('/', function(req, res) {
  req.flash('error', 'Flash is back!')
  // console.log('home:' ,req.user)
  // res.render('home')
  res.render('home', { error: req.flash('error') });
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
    successRedirectUrl: '/login',
    signUpTemplate: 'auth/signup',
    table: 'users',
  }
  authService.signup(options,res);
})

// display login page
app.get('/login', function(req, res) {
  res.render('auth/login', { errors: [] })
})

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user)
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  var user = db.get('users').find({id: id}).value()
    console.log('deserializeUser:', id, user)

  if(!user) {
    done({ message: 'Invalid credentials.' }, null);
  } else {
    done(null, {id: user.id, username: user.username})
  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    // look for user in database
    var user = db.get('users').find({ username: username }).value()

    // if user not found, return error
    if(!user) {
      console.log('user not found')
      return done(null, false, { message: 'Invalid user.' });
    }

    // check if password matches
    var passwordsMatch = authService.comparePassword(password, user.password);
    // if passowrd don't match, return error
    if(!passwordsMatch) {
      console.log('bad password')
      return done(null, false, { message: 'Invalid password.' });
    }
    console.log('user & password good')

    //else return the user
    return done(null, user)
  }
));



// display logout
app.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/')
})


// peform login
app.post(
  '/login',
  passport.authenticate(
    'local',
    {
      successRedirect:'/',
      failureRedirect:'/login',
      failureFlash: true,
      successFlash: 'You are logged in',
    }
  ),
)


// start server
app.listen(3000, function(){
  console.log('server on port 3000')
})
