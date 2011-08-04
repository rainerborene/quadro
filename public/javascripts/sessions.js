// tj Holowaychuk's style
var j = jQuery;

// app namespace
var Quadro = { views: {} };

/**
 * Views
 */

var LoginView = Backbone.View.extend({

  className: "login",

  template: JST['home/login'],

  initialize: function() {
    _.bindAll(this, "render"); 
  },

  render: function() {
    j(this.el).html(this.template());
    return this;
  }

});
