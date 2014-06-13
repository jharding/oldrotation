var pg = require('pg'),
    thunkify = require('thunkify');

var config;

var postgres = module.exports = {
  configure: configure,
  connect: thunkify(pg.connect).bind(pg),
  exec: exec
};

function configure(o) {
  config = o;
}

function* exec(text, values) {
  var connection, client, done, results;

  console.log(text, values);

  connection = yield postgres.connect(config);
  client = connection[0];
  done = connection[1];

  results = yield thunkify(client.query).bind(client)(text, values);
  done();

  return results;
}
