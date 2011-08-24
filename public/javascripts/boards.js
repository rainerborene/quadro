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
    "click .create-board": "createBoard",
    "click .remove-board": "removeBoard",
    "click .open-board": "openBoard",
    "click .board-list li": "selectItem",
    "dblclick .board-list li": "changeTitle",
    "click .close, .well": "close"
  },

  initialize: function() {
    _.bindAll(this, "render", "openBoard", "close", "createBoard", "removeBoard", "selectItem", "escKey");

    j(document).bind("keyup", this.escKey);
  },

  selectItem: function(event) {
    j(event.currentTarget).siblings().removeClass("selected");
    j(event.currentTarget).addClass("selected");
    j(this.el).find("button[disabled]").removeAttr("disabled");
  },

  escKey: function(event) {
    if (event.keyCode == 27) {
      this.close();
    }
  },

  changeTitle: function() {
    var title = prompt("Enter a new title:");
    
    if (title != null && title != "") {
      currentBoard.set({ title: title }).save();
    }
  },

  openBoard: function() {
    var selected = j(".board-list").find(".selected"), that = this;

    if (selected.length) {
      var id = selected.data("id");

      currentBoard = Boards.get(id);
      document.title = (currentBoard.get("title") + " • Quadro");

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
          .appendTo(".board-list")
          .slideDown();
      }
    });
  },

  removeBoard: function(event) {
    var selected = j(".board-list").find(".selected");

    if (selected.length) {
      var id = selected.data("id")
        , entry = Boards.get(id)
        , confirmed = confirm("Are you sure?");

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

    event.preventDefault();
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
    j(this.el)
      .find(".modal")
      .css({
        position: "absolute",
        left: (j(window).width() - 380) / 2
      })
      .draggable({ 
        handle: ".modal-header",
        containment: "window" 
      });

    return this;
  }

});
