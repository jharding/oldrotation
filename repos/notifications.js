var db, schema, sql, Notification, notifications, repoUtils;

// external modules
schema = require('sql');

// internal modules
db = appRequire('utils/postgres');
Notification = appRequire('models/notification');
repoUtils = appRequire('utils/repo_utils');

sql = schema.define({
  name: 'notifications',
  columns: ['id', 'target', 'title']
});

// export
notifications = module.exports = {
  sql: sql,

  findById: repoUtils.findByBuilder(db, sql, sql.id, Notification),

  create: function* createNotification(target, title) {
    var hash, json, query, results;

    query = sql
    .insert({ target: target, title: title })
    .returning(sql.star())
    .toQuery();

    results = yield db.exec(query.text, query.values);
    json = results && results.rows && results.rows[0];

    return json ? new Notification(json) : null;
  }
};
