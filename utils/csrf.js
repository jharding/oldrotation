var _csrf, compose, csrf, DEFAULT_PARAM;

// external modules
_csrf = require('koa-csrf');
compose = require('koa-compose');

// constants
DEFAULT_PARAM = '_csrf';

// export
csrf = module.exports = {

  protect: function protect(app) {
    _csrf(app);

    app.context.__defineGetter__('csrfParam', function() {
      return DEFAULT_PARAM;
    });

    return verify;
  }
}

function* verify(next) {
  if (this.method == 'POST') {
    this.assertCsrf(this.request.body);
  }

  yield next;
}
