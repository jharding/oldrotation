var bcrypt = require('bcryptjs'),
    thunkify = require('thunkify');

module.exports = {
  hash: thunkify(bcrypt.hash).bind(bcrypt),
  compare: thunkify(bcrypt.compare).bind(bcrypt)
};
