/**
 * Models
 */

var Collaborator = Backbone.Model.extend({})
  , CollaboratorCollection = Backbone.Collection.extend({ model: Collaborator });
 
var Board = Backbone.Model.extend({

  urlRoot: "/boards",

  defaults: {
    title: "Untitled",
    share_public: false,
    secret_token: guid(),
    user: { name: "" }
  },

  initialize: function() {
    this.collaborators = new CollaboratorCollection();
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
  , Boards = window.Boards = new BoardCollection()
  , currentBoard = null;

/**
 * Views
 */

var BoardsView = Backbone.View.extend({

  id: "boards-modal",

  className: "modal unselectable hide fade",

  template: JST["boards/boards"],

  events: {
    "click .new-board": "newBoard",
    "blur .title-field": "saveWhenBlur",
    "keypress .title-field": "saveWhenEnter",
    "click .remove-board": "removeBoard",
    "click .open-board": "openBoard",
    "click .board-list li": "selectItem",
    "dblclick .board-list li": "changeTitle",
  },

  initialize: function() {
    _.bindAll(this, "render", "saveBoard", "hasDestroyed");

    Boards.bind("destroy", this.hasDestroyed);
  },

  hasDestroyed: function(model, collection, xhr) {
    this.$("li[data-id=" + model.id + "]").delay(500).slideUp();
    this.$(".remove-board").removeAttr("disabled");
  },

  selectItem: function(event) {
    j(event.currentTarget).siblings().removeClass("selected");
    j(event.currentTarget).addClass("selected");
    this.$("button[disabled]").removeAttr("disabled");
  },

  openBoard: function(event) {
    var selected = j(".board-list").find(".selected")
      , button = j(event.currentTarget)
      , that = this;

    if (selected.length) {
      var id = selected.data("id");

      currentBoard = Boards.get(id);
      button.attr("disabled", "disabled");

      Stickies.fetch({
        success: function(collection, response) {
          j(".stickies").empty();
          updateWindowTitle();
          collection.trigger("reset");
          button.removeAttr("disabled");
          j(that.el).modal(true).hide();
        }
      });

      Quadro.views.workspaceView.shareView.render();
    }
  },

  changeTitle: function(event) {
    var input = this.make("input", { "class": "title-field", maxlength: 28 })
      , item = j(event.currentTarget)
      , id = item.attr("data-id");

    input.value = item.find(".item-title").text();
    item.find(".item-title").replaceWith(input);
    item.data("replaced", false);

    input.focus();
  },

  newBoard: function(event) {
    var template = JST['boards/board']()
      , input = this.make("input", { "class": "title-field", maxlength: 28 })
      , item = j(template);

    j(".board-list")
      .find(".selected")
      .removeClass("selected");

    item
      .css("display", "none")
      .find(".item-title")
      .replaceWith(input)
    .end()
      .appendTo(".board-list")
      .trigger("click")
      .slideDown();

    item.find("input").focus();
  },

  saveWhenBlur: function(event) {
    this.saveBoard(j(event.currentTarget));
  },

  saveWhenEnter: function(event) {
    if (event.type == "keypress" && event.keyCode == "13") {
      this.saveBoard(j(event.currentTarget));
    }
  },

  // create or update
  saveBoard: function(input) {
    var item = input.parent()
      , title = input.val() || "Untitled"
      , id = input.parent().attr("data-id")
      , el = this.make("span", { "class": "item-title" }, title);

    if (input.parent().data("replaced")) {
      return;
    }

    var options = {
      success: function(model, attributes, xhr) {
        item.attr("data-id", attributes.id);

        if (attributes.id == currentBoard.id) {
          currentBoard.set({ title: attributes.title });
          updateWindowTitle();
        }
      },
      error: function() {
        item.parent().slideUp();
      }
    };

    input.parent().data("replaced", true);
    input.replaceWith(el);

    if (id === "" || id === undefined) {
      Boards.create({ title: title }, options);
    } else {
      console.log(id);
      console.log(title);
      console.log(options);
      Boards.get(id).save({ title: title }, options);
    }
  },

  removeBoard: function(event) {
    var selected = j(".board-list").find(".selected")
      , button = j(event.currentTarget);

    if (selected.length) {
      var id = selected.data("id")
        , entry = Boards.get(id)
        , confirmed = confirm("Are you sure?");

      if (confirmed) {
        button.attr("disabled", "disabled");

        entry.destroy({
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

    j(".boards").parent().addClass("active");

    el.find(".overlay")
      .css("display", "none")
      .fadeIn("fast", function() {
        el.find(".modal").fadeIn("fast");
      });

    return false;
  },

  render: function() {
    var template = JST["boards/board"]
      , boards = Boards.map(function(i) { 
          return template.call(i.toJSON());
        });

    j(this.el).html(this.template({ boards: boards }));

    return this;
  }

});
