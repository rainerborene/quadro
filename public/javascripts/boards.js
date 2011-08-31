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
    "click .new-board": "newBoard",
    "blur .title-field": "saveWhenBlur",
    "keypress .title-field": "saveWhenEnter",
    "click .remove-board": "removeBoard",
    "click .open-board": "openBoard",
    "click .board-list li": "selectItem",
    "dblclick .board-list li": "changeTitle",
    "click .close, .overlay": "close"
  },

  initialize: function() {
    _.bindAll(this, "render", "openBoard", "close", "newBoard", "saveWhenBlur", "saveWhenEnter", "saveBoard", "removeBoard", "changeTitle", "selectItem", "escKey");

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
          that.close();
          button.removeAttr("disabled");
        }
      });

      Quadro.views.shareMenuView.render();
    }
  },

  changeTitle: function(event) {
    var input = j(this.make("input", { 'class': "title-field", maxlength: 28 }))
      , item = j(event.currentTarget)
      , id = item.attr("data-id");

    input.val(item.find(".item-title").text());
    item.find(".item-title").replaceWith(input);
    item.data("replaced", false);

    input.focus();
  },

  newBoard: function(event) {
    var template = JST['boards/board']()
      , input = this.make("input", { 'class': "title-field", maxlength: 28 })
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
      , el = j("<span/>", { "class": "item-title", text: title });

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

    if (id == "") {
      Boards.create({ title: title }, options);
    } else {
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
          success: function(model, response) {
            selected.slideUp();
            button.removeAttr("disabled");
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

    j(".boards").parent().addClass("active");

    el
      .find(".overlay")
      .css("display", "none")
      .fadeIn("fast", function() {
        el.find(".modal").fadeIn("fast");
      });

    return false;
  },

  close: function() {
    var el = j(this.el);

    el
      .find(".modal")
      .fadeOut("fast", function() {
        el.find(".overlay").fadeOut("fast");
        j(".boards").parent().removeClass("active");
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
        containment: "window" ,
        handle: ".modal-header",
        cancel: ".close"
      });

    return this;
  }

});
