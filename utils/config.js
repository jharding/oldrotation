var defaults, env, url;

// external modules
url = require('url');

// internal modules
defaults = appRequire('config/config.json');

env = process.env;

// exports
module.exports = {
  app: {
    get url() {
      return env.APP_URL || defaults.app.url;
    }
  },

  rdio: {
    get consumerKey() {
      return env.RDIO_CONSUMER_KEY || defaults.rdio.consumerKey;
    },

    get consumerSecret() {
      return env.RDIO_CONSUMER_SECRET || defaults.rdio.consumerSecret;
    }
  },

  redis: {
    get url() {
      return url.parse(env.REDISCLOUD_URL || defaults.redis.url);
    }
  }
};
