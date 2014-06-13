var compose, controller, mw, notificationRepo, views;

// external modules
compose = require('koa-compose');

// internal modules
mw = appRequire('utils/endpoint_mw');
notificationRepo = appRequire('repos/notifications');
views = appRequire('views/notifications');

// export
controller = module.exports = {
  create: compose([
    mw.requireAuth,
    createNotification
  ]),

  show: compose([
    mw.requireAuth,
    showNotification
  ]),

  showNewForm: compose([
    mw.requireAuth,
    showNewForm
  ]),
};

function* createNotification() {
  var notification, target, title;

  target = this.user.id;
  title = this.request.body.title;

  notification = yield notificationRepo.create(target, title);

  this.redirect(notification.permalink);
}

function* showNewForm() {
  this.body = yield views.newForm.call(this);
}

function* showNotification(id) {
  this.body = yield notificationRepo.findById(id);
}
