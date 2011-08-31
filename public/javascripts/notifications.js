/**
 * Pusher
 */

if (location.hostname.match(/(quadro.dev|localhost)/) && typeof(Pusher) != "undefined") {
  Pusher.log = function(message) {
    if (window.console && window.console.log) {
      window.console.log(message);
    }
  };
}

/**
 * Views
 */

var NotificationView = Backbone.View.extend({

  className: "alert-message warning",

  template: JST['notifications/notification'],

  pool: [],

  events: {
    "click .close": "close"
  },

  initialize: function() {
    _.bindAll(this, "render", "open", "openWithMessage", "close", "redraw");
    j(window).bind("resize", this.redraw);
  },

  redraw: function() {
    var leftPosition = Math.max(0, (j(window).width() - 640) / 2);
    j(this.el).css("left", leftPosition);
  },

  openWithMessage: function(message, type) {
    this.pool.push({ message: message, type: type || "warning" });
    this.open();
  },

  open: function() {
    if (j(this.el).is(":visible")) {
      return;
    }

    var item = this.pool.shift();

    if (!_.isUndefined(item)) {
      j(this.el)
        .find("p")
          .html(item.message)
      .end()
        .removeClass("error")
        .removeClass("warning")
        .removeClass("info")
        .addClass(item.type);

      j(this.el).slideDown("slow"); 

      this.timeoutId = setTimeout(this.close, 4000);
    }
  },

  close: function(event) {
    if (!_.isUndefined(event)) {
      event.preventDefault();
    }

    clearTimeout(this.timeoutId);

    j(this.el).slideUp("slow", this.open);
  },

  render: function() {
    j(this.el).html(this.template());
    j(window).trigger("resize");
    return this;
  }

});

/**
 * Helpers
 */

function showMessage(message, type) {
  var notificationView = Quadro.views.notificationView;
  return notificationView.openWithMessage(message, type);
}
