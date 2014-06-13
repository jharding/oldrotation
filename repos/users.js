var bcrypt, db, repoUtils, schema, sql, User, users;

// external modules
schema = require('sql');

// internal modules
bcrypt = appRequire('utils/bcrypt');
db = appRequire('utils/postgres');
repoUtils = appRequire('utils/repo_utils');
User = appRequire('models/user');

sql = schema.define({
  name: 'users',
  columns: ['id', 'email', 'password']
});

// export
users = module.exports = {
  sql: sql,

  findById: repoUtils.findByBuilder(db, sql, sql.id, User),

  findByEmail: repoUtils.findByBuilder(db, sql, sql.email, User),

  create: function* createUser(email, password) {
    var hash, json, query, results;

    hash = yield bcrypt.hash(password, 10);
    query = sql
    .insert({ email: email, password: hash })
    .returning(sql.star())
    .toQuery();

    results = yield db.exec(query.text, query.values);
    json = results && results.rows && results.rows[0];

    return json ? new User(json) : null;
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
