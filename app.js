var express = require('express');
var expressLayouts = require('express-ejs-layouts');

var app = express();

// set view engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// display home page
app.get('/', function(req, res) {
  res.render('home')
})

// start server
app.listen(3000, function(){
  console.log('server on port 3000')
})
