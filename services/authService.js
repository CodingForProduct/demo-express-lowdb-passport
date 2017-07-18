var uuid = require('uuid');
var bcrypt = require('bcryptjs');
var low = require('lowdb');
var path = require('path');

var db = low(path.join('data', 'db.json'));

// takes a plain text password and returns a hash
function hashPassword(plaintextPassword) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plaintextPassword, salt);
}

exports.signup = function signup(options, res) {
  // get all values for the username that are in the database
  var usernames = db.get('users').map('username').value()
  // check if username is already taken
  var usernameIsTaken = usernames.includes(options.username)

  // if username is already taken, show error
  if (usernameIsTaken) {
    return res.render(options.signUpTemplate, {errors: ['This username is already taken']})

  // else create user
  } else {
    // save new user to database
    db.get('users')
      .push({
        username: options.username,
        // creates random id
        id: uuid(),
        // creates hash Password
        password: hashPassword(options.password)
      })
      .write()

    // redirect
    res.redirect(options.successRedirectUrl)
  }
}

