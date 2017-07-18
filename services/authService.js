var uuid = require('uuid');
var bcrypt = require('bcryptjs');
var low = require('lowdb');

var db = low('db.json')

// takes a plain text password and returns a hash
function hashPassword(plaintextPassword) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plaintextPassword, salt);
}

exports.signup = function signup(options, res) {
  // set the field that will be used for login; default is 'username'
  var loginField = options.loginField || 'username';
  // get all values for the login field
  var loginValues = db.get(options.table).map(loginField).value()
  // check if  is already taken
  var loginValueIsTaken = loginValues.includes(options.loginValue)

  // if username is already taken, show error
  if (loginValueIsTaken) {
    return res.render(options.signUpTemplate, {errors: [{ msg: 'This '+ loginField +' is already taken'}]})

    // else create new user and redirect
  } else {
    db.get(options.table)
      .push({
        [loginField]: options.loginValue,
        // creates random id
        id: uuid(),
        // creates hash Password
        password: hashPassword(options.password)
      })
      .write()
    res.redirect(options.successRedirectUrl)
  }
}

