var _, format, User;

// exports
_ = module.exports = require('underscore');

// external modules
format = require('util').format;

// internal modules
User = appRequire('models/user');

_.mixin({
  format: format,

  isUser: function isUser(obj) {
    return obj instanceof User;
  }
});
