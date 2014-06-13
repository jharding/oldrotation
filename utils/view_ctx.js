var _;

// internal modules
_ = appRequire('utils/utils');

// export
module.exports = function* viewCtx(next) {
  this.viewCtx = buildCtx;
  yield next;
};

function buildCtx(o) {
  return _.extend(o, {
    csrfParam: this.csrfParam,
    csrfToken: this.csrf,
    user: this.user
  });
}
