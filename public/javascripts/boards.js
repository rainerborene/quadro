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

var BoardsView = Backbone.View.extend({

  template: JST["boards/boards"],

  className: "unselectable",

  events: {
    "click .new_board": "createBoard",
    "click .destroy_board": "removeBoard",
    "click .boards-items li": "selectItem",
    "click .close": "close"
  },

  initialize: function() {
    _.bindAll(this, "render", "openBoard", "close", "createBoard", "removeBoard", "selectItem");
  },

  selectItem: function(event) {
    j(event.currentTarget).siblings().removeClass("selected");
    j(event.currentTarget).addClass("selected");
  },

  openBoard: function() {
    var selected = j(".boards-items").find(".selected"), that = this;

    if (selected.length) {
      var id = selected.data("id");

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
    }
  },

  createBoard: function(event) {
    var title = prompt("Enter a title:");

    if (title == "" || title == null) return;

    Boards.create({ title: title }, { 
      success: function(model, response, xhr) {
        var item = JST["boards/board"].call(model.toJSON());

        j(item)
          .css("display", "none")
          .appendTo(".boards-items")
          .slideDown();
      }
    });
  },

  removeBoard: function() {
    var selected = j(".boards-items").find(".selected");

    if (selected.length) {
      var id = selected.data("id")
        , entry = Boards.get(id)
        , confirmed = confirm("Are you sure?");

      // Finally, destroy entry on database
      if (confirmed) {
        entry.destroy({
          success: function(model, response) {
            selected.slideUp();
          },
          error: function(model, xhr, callbacks) {
            var response = JSON.parse(xhr.responseText);
            alert(response.message);
          }
        });
      }
    }
  },

  open: function() {
    var el = j(this.el);

    el.find(".well").fadeIn("fast", function() {
      el.find(".modal").fadeIn("fast");
    });

    return false;
  },

  close: function() {
    var el = j(this.el);

    el.find(".modal").fadeOut("fast", function() {
      el.find(".well").fadeOut("fast");
    });

    return false;
  },

  render: function() {
    this.boards = Boards.map(function(b) {
      return JST["boards/board"].call(b.toJSON());
    });

    j(this.el).html(this.template({ boards: this.boards }));

    return this;
  }

});
