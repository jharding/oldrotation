// export
module.exports = {
  logout: function* logout(next) {
    this.logout();
    yield next;
  },

  redirectTo: function redirectTo() {
    var args = [].slice.call(arguments, 0);

    return function* redirectTo() {
      this.redirect.apply(this, args);
    };
  },

  requireAuth: function* requireAuth(next) {
    if (this.isUnauthenticated()) {
      this.redirect('/');
      return;
    }

    yield next;
  },

  requireUnauth: function* requireUnauth(next) {
    if (this.isAuthenticated()) {
      this.redirect('back');
      return;
    }

    yield next;
  }
};
