var utils;

// export
utils = module.exports =  {
  findByBuilder: function findByBuilder(db, sql, col, Model) {
    return function* findBy(val) {
      var json, query, results;

      query = sql
      .select()
      .where(col.equals(val))
      .limit(1)
      .toQuery();

      results = yield db.exec(query.text, query.values);
      json = results && results.rows && results.rows[0];

      return json ? new Model(json) : null;
    }
  }
};
