var _, router, routes;

// external modules
router = require('koa-route');

// internal modules
_ = appRequire('utils/utils');

// maintains a record of the registered routes
routes = {};

// exports
module.exports = function registerController(app, controller) {
  if (!app || !controller) {
    throw new Error('unable to register controller');
  }

  _.each(controller, function(fn, route) {
    var method, parts, path;

    parts = route.split(/\s+/);
    method = parts[0].toLowerCase();
    path = parts[1];

    if (routes[route]) {
      throw new Error(_.format('route %s has already been registered', path));
    }

    app.use(router[method](path, fn));
    routes[route] = true;
  });
};
