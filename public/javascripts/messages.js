/**
 * Models
 */

var Message = Backbone.Model.extend({})
  , MessageCollection = Backbone.Collection.extend({ 
      model: Message,
      url: function() {
        return '/boards/' + currentBoard.id + '/messages';
      }
    });

/**
 * Views
 */

var MessagesView = Backbone.View.extend({

  className: "messages",

  template: JST['messages/index'],

  messageTemplate: JST['messages/message'],

  events: {
    "keydown textarea": "onEnter"
  },

  initialize: function() {
    _.bindAll(this, "render", "redraw", "onEnter", "createMessageView");

    j(window).bind("resize", this.redraw);

    this.messages = new MessageCollection();
  },

  onEnter: function(event) {
    var textarea = j(event.currentTarget)
      , message = textarea.val()
      , that = this;

    textarea.attr("disabled");

    if (event.keyCode == 13 && !event.shiftKey) {
      this.messages.create({ message: message }, {
        success: function(model, attributes, xhr) {
          that.createMessageView({ message: message });
          textarea.removeAttr("disabled");
        }
      });
    }
  },

  createMessageView: function(attributes) {
    var values = {
      author: {
        name: attributes.name || Quadro.name,
        message: attributes.message
      }
    };

    var view = j(this.messageTemplate(values));

    view
      .css("display", "none")
      .insertBefore(j(this.el).find("form"))
      .fadeIn();
  },

  redraw: function() {
    j(this.el).css("height", j(window).height() - 40);
  },

  render: function() {
    j(this.el).html(this.template());
    j(window).trigger("resize");
    return this;
  }

});
