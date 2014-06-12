var path;

// external modules
path = require('path');

// export
module.exports = function appRequire(base, defaultExt) {
  // wtf, it's already there?
  if (GLOBAL.appRequire) {
    return;
  }

  defaultExt = defaultExt || '.js';

  return GLOBAL.appRequire = function appRequire(p) {
    p = path.join(base, p);
    p = path.extname(p) ? p : p + defaultExt;

    return require(p);
  }
};
