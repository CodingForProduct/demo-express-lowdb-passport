var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var routes = require('./routes');

var app = express();

// set view engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// bodyParser reads a form's input and stores it in request.body
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies

// routes
app.use('/', routes);

// start server
app.listen(3000, function(){
  console.log('server on port 3000')
})
