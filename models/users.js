var schema = require('sql'),
    thunkify = require('thunkify');

var bcrypt = require('../utils/bcrypt.js'),
    db = require('../utils/postgres.js');

var users = module.exports = {
  sql: schema.define({
    name: 'users',
    columns: ['id', 'email', 'password']
  }),

  createUser: createUser,
  isEmailTaken: isEmailTaken,
  verifyCredentials: verifyCredentials
};

function* createUser(email, password) {
  var query, hash, results;

  hash = yield bcrypt.hash(password, 10);
  query = users.sql.insert({ email: email, password: hash }).toQuery();

  results = yield db.exec(query.text, query.values);

  return results;
}

function* isEmailTaken(email) {
  var query, results;

  query = users.sql
  .select(users.sql.id)
  .where(users.sql.email.equals(email))
  .limit(1)
  .toQuery();

  results = yield db.exec(query.text, query.values);

  return results && !!results.rowCount;
}

function* verifyCredentials(email, password) {
  var query, results, userObj;

  query = users.sql
  .select(users.sql.email, users.sql.password)
  .where(users.sql.email.equals(email))
  .limit(1)
  .toQuery();

  results = yield db.exec(query.text, query.values);
  userObj = results && results.rows && results.rows[0];

  return userObj ? yield bcrypt.compare(password, userObj.password) : false;
}
