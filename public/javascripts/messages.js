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
  usersTemplate: JST['messages/users'],

  events: {
    "keydown textarea": "onEnter"
  },

  initialize: function() {
    _.bindAll(this, "render", "redraw", "onEnter", "createMessageView", "subscriptionSucceeded", "memberAdded", "memberRemoved", "memberMessage");

    j(window).bind("resize", this.redraw);

    this.messages = new MessageCollection();
    this.pusher = new Pusher("90dec57321c37e962a0c");
    this.connect();
  },

  clear: function() {
    j(this.el).find("textarea").val("");
    j(this.el).find(".inner").empty();
    return this;
  },

  connect: function() {
    this.channel = this.pusher.subscribe("presence-" + currentBoard.get("secret_token"));
    this.channel.bind("pusher:subscription_succeeded", this.subscriptionSucceeded);
    this.channel.bind("pusher:member_removed", this.memberRemoved);
    this.channel.bind("pusher:member_added", this.memberAdded);
    this.channel.bind("message", this.memberMessage);
  },

  subscriptionSucceeded: function(members) {
    var users = this.usersTemplate({ members: members });
    j(this.el).find(".logged-users").remove();
    j(this.el).find(".inner").prepend(users);
  },

  memberAdded: function(member) {
    log("memberAdded: ", member);
  },

  memberRemoved: function(member) {
    log("memberRemoved: ", member);
  },

  memberMessage: function(data) {
    var name = (currentBoard.collaborators.get(data.user_id) 
      ? currentBoard.collaborators.get(data.user_id).get("name")
      : currentBoard.get("user").id == data.user_id ?  
         currentBoard.get("user").name : undefined);
        
    this.createMessageView({ 
      name: name,
      message: data.message,
    });
  },

  onEnter: function(event) {
    var textarea = j(event.currentTarget)
      , message = textarea.val()
      , that = this;

    if (event.keyCode == 13 && !event.shiftKey) {
      textarea.attr("disabled", "disabled");

      this.messages.create({ message: message }, {
        success: function(model, attributes, xhr) {
          textarea.val("").removeAttr("disabled").focus();
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
      .appendTo(".messages .inner")
      .fadeIn()
    .end();
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
