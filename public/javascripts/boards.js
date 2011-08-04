/**
 * Models
 */

var Collaborator = Backbone.Model.extend({})
  , CollaboratorCollection = Backbone.Collection.extend({ model: Collaborator })
 
var Board = Backbone.Model.extend({

  urlRoot: "/boards",

  defaults: {
    title: "Untitled",
    share_public: false
  },

  initialize: function() {
    this.collaborators = new CollaboratorCollection;
    this.collaborators.url = "/boards/" + this.id + "/collaborators";
    this.collaborators.reset(this.attributes.collaborators);
  },

  toJSON: function() {
    var attrs = _.clone(this.attributes);
    attrs.collaborators = this.collaborators.toJSON();
    return attrs;
  }

});

var BoardCollection = Backbone.Collection.extend({ model: Board })
  , Boards = window.Boards = new BoardCollection
  , currentBoard = null;

/**
 * Views
 */

// Actually this is the boards window (not an item)
var BoardsView = Backbone.View.extend({

  className: "boards_window",

  template: JST["boards/boards"],

  events: {
    "click .ui-overlay": "close",
    "click .open_board": "openBoard",
    "click .new_board": "createBoard",
    "click .destroy_board": "removeBoard"
  },

  initialize: function() {
    _.bindAll(this, "render", "close", "escKey", "openBoard", "createBoard", "removeBoard");

    j(document).bind("keyup", this.escKey);
  },

  escKey: function(event) {
    if (event.keyCode == 27) {
      this.close();
    }
  },

  openBoard: function(event) {
    var id = j(event.currentTarget).parents("li").data("id"), that = this;

    currentBoard = Boards.get(id);

    Stickies.fetch({
      success: function(collection, response) {
        j(".stickies").empty();
        j(".board_title").text(currentBoard.get("title"));

        collection.trigger("reset");

        that.close();
      }
    });

    Quadro.views.workspaceView.shareMenuView.render(true);

    event.preventDefault();   
  },

  createBoard: function(event) {
    var title = prompt("Enter a title:") || "Untitled";

    Boards.create({ title: title }, { 
      success: function(model, response, xhr) {
        var item = JST["boards/board"].call(model.toJSON());

        j(item)
          .css("display", "none")
          .appendTo(".boards_window ul")
          .slideDown();
      }
    });

    event.preventDefault();
  },

  removeBoard: function(event) {
    var el = j(event.currentTarget)
      , id = el.parent().data("id")
      , entry = Boards.get(id)
      , confirmed = confirm("Are you sure?");

    // Finally, destroy entry on database
    if (confirmed) {
      entry.destroy({
        success: function(model, response) {
          el.parent().slideUp();
        },
        error: function(model, xhr, callbacks) {
          var response = JSON.parse(xhr.responseText);
          alert(response.message);
        }
      });
    }

    event.preventDefault();
  },

  open: function() {
    j(this.el).show();
  },

  close: function() {
    j(this.el).hide();
  },

  render: function() {
    this.boards = Boards.map(function(b) {
      return JST["boards/board"].call(b.toJSON());
    });

    j(this.el).html(this.template({ boards: this.boards }));

    return this;
  }

});
