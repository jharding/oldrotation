var co, redis, User;

// add appRequire to global namespace
require('./utils/app_require.js')(__dirname);

co = require('co');
User = appRequire('models/user');

process.nextTick(co(function* () {
  var maxUserId, user, rotation;

  maxUserId = yield User.maxUserId();

  for (var id = 0; id <= maxUserId; id++) {
    user = yield User.findById(id);
    rotation = user ? (yield user.rotation()) : null;

    if (rotation) {
      console.log(
        'Syncing rotation for user %d with Rdio playlist %s',
        id,
        rotation.rdioId
      );
    }

    rotation && (yield rotation.sync());
  }

  appRequire('utils/redis').quit();
}));
