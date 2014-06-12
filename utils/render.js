var _, FILE_EXT, jade, jadeRender, path, OPTS_MIXIN, render, thunkify;

// external modules
_ = require('underscore');
jade = require('jade');
path = require('path');
thunkify = require('thunkify');

// constants
FILE_EXT = '.jade';
OPTS_MIXIN = {
  basedir: path.join(__dirname, '../templates')
};

jadeRender = thunkify(jade.renderFile);

// export
render = module.exports = function* render(path, ctx) {
  path += FILE_EXT;
  return yield jadeRender(path, _.extend(ctx, OPTS_MIXIN));
};
