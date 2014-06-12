var schema = require('sql'),
    thunkify = require('thunkify');

var bcrypt = require('../utils/bcrypt.js'),
    db = require('../utils/postgres.js');

var users, sql;

sql = schema.define({
  name: 'users',
  columns: ['id', 'email', 'password']
})

users = module.exports = {
  sql: sql,

  findById: findByBuilder(sql.id),
  findByEmail: findByBuilder(sql.email),
  createUser: createUser,
  isEmailTaken: isEmailTaken,
  verifyCredentials: verifyCredentials
};

function findByBuilder(col) {
  return function* findBy(val) {
    var query, results;

    query = sql
    .select()
    .where(col.equals(val))
    .limit(1)
    .toQuery();

    results = yield db.exec(query.text, query.values);

    return (results && results.rows && results.rows[0]) || null;
  }
}

function* createUser(email, password) {
  var query, hash, results;

  hash = yield bcrypt.hash(password, 10);
  query = sql.insert({ email: email, password: hash }).toQuery();

  results = yield db.exec(query.text, query.values);

  return results;
}

function* isEmailTaken(email) {
  return !!(yield users.findByEmail(email));
}

function* verifyCredentials(email, password) {
  var query, results, userObj;

  query = sql
  .select(sql.email, sql.password)
  .where(sql.email.equals(email))
  .limit(1)
  .toQuery();

  results = yield db.exec(query.text, query.values);
  userObj = results && results.rows && results.rows[0];

  return userObj ? yield bcrypt.compare(password, userObj.password) : false;
}
