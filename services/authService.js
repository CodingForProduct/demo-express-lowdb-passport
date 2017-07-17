var bcrypt = require('bcryptjs');

// creates a hash password
exports.hashPassword = function hashPassword(plaintextPassword) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plaintextPassword, salt);
}

// compare if plain text password matches hash password
function comparePassword(plaintextPassword, hashPassword) {
  return bcrypt.compareSync(plaintextPassword, hashPassword);
}

exports.authenticate = function(options, req, res, db) {
  // check if username exists in database
  var user = db.get('users').find({ username: options.username }).value()
  if(user) {
    // check if password matches
    var passwordsMatch = comparePassword(options.password, user.password);

    // if password matches, create session and redirect
    if(passwordsMatch){
      req.session.user = {id: user.id, username: user.username };
      req.session.isAuthenticated = true;
      res.redirect(options.successRedirectUrl);
    // else display error on login page
    } else {
      res.render(options.loginTemplate, { errors: [{msg: 'Invalid credentials'}] })
    }

  // else display error on login page
  } else {
    res.render(options.loginTemplate, { errors: [{msg: 'Invalid credentials'}] })
  }
}
