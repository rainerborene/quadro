/**
 * Pusher
 */

if (location.hostname.match(/(quadro.dev|localhost)/)) {
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

  events: {
    "click .close": "close"
  },

  initialize: function() {
    _.bindAll(this, "render", "open", "close", "redraw");
    j(window).bind("resize", this.redraw);
  },

  redraw: function() {
    var leftPosition = Math.max(0, (j(window).width() - 640) / 2);
    j(this.el).css("left", leftPosition);
  },

  openWithMessage: function(message, type) {
    j(this.el)
      .find("p")
        .text(message)
    .end()
      .removeClass("error")
      .removeClass("warning")
      .addClass(type || "warning")
    end();

    this.open();
  },

  open: function() {
    j(this.el).slideDown(); 
    setTimeout(this.close, 2000);
  },

  close: function() {
    j(this.el).slideUp();
  },

  render: function() {
    j(this.el).html(this.template());
    j(window).trigger("resize");
    return this;
  }

});

