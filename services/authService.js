var bcrypt = require('bcryptjs');

// creates a hash password
exports.hashPassword = function hashPassword(plaintextPassword) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plaintextPassword, salt);
}


