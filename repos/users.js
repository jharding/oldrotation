var bcrypt, db, schema, sql, User, users;

// external modules
schema = require('sql');

// internal modules
bcrypt = appRequire('utils/bcrypt');
db = appRequire('utils/postgres');
User = appRequire('models/user');

sql = schema.define({
  name: 'users',
  columns: ['id', 'email', 'password']
});

// export
users = module.exports = {
  sql: sql,

  findById: findByBuilder(sql.id),

  findByEmail: findByBuilder(sql.email),

  create: function* createUser(email, password) {
    var query, hash, results;

    hash = yield bcrypt.hash(password, 10);
    query = sql.insert({ email: email, password: hash }).toQuery();

    results = yield db.exec(query.text, query.values);

    return results;
  },

  isEmailTaken: function* isEmailTaken(email) {
    return !!(yield users.findByEmail(email));
  },

  verifyCredentials: function* verifyCredentials(email, password) {
    var json, query, results;

    query = sql
    .select(sql.email, sql.password)
    .where(sql.email.equals(email))
    .limit(1)
    .toQuery();

    results = yield db.exec(query.text, query.values);
    json = results && results.rows && results.rows[0];

    return json ? yield bcrypt.compare(password, json.password) : false;
  }
};

function findByBuilder(col) {
  return function* findBy(val) {
    var json, query, results;

    query = sql
    .select()
    .where(col.equals(val))
    .limit(1)
    .toQuery();

    results = yield db.exec(query.text, query.values);
    json = results && results.rows && results.rows[0];

    return json ? new User(json) : null;
  }
}
