var FILE_EXT, jade, jadeRender, render, thunkify;

// external modules
jade = require('jade');
thunkify = require('thunkify');

// constants
FILE_EXT = '.jade';

jadeRender = thunkify(jade.renderFile);

// export
render = module.exports = function* render(path, ctx) {
  path += FILE_EXT;
  return yield jadeRender(path, ctx);
};
