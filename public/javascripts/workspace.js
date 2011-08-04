/**
 * Views
 */

var WorkspaceView = Backbone.View.extend({

  className: "workspace",

  template: JST['home/workspace'],

  events: {
    "click .new": "createSticky",
    "click .boards": "openBoardsWindow",
    "click .feedback": "openUserVoice",
    "click .board_title": "changeBoardTitle",
    "mouseenter li > a": "menuHoverFx",
    "mouseleave li > a": "menuLeaveFx"
  },

  initialize: function() {
    _.bindAll(this, "render", "createSticky", "addOne", "addAll", "manipulateClipboard", "openBoardsWindow", "openUserVoice", "changeBoardTitle");

    Stickies.bind("add", this.addOne);
    Stickies.bind("reset", this.addAll);

    Boards.bind("change:title", this.didChangeTitle);

    StickyContextMenuView.initialize();

    // http://developer.apple.com/library/mac/#documentation/AppleApplications/Conceptual/SafariJSProgTopics/Tasks/CopyAndPaste.html
    j(document).bind("paste", this.manipulateClipboard);
  },

  setReadonly: function() {
    j(this.el).undelegate(".board_title", "click");
  },

  changeBoardTitle: function(event) {
    var title = prompt("Enter a new title:");
    if (title !== null) {
      currentBoard.set({ title: title }).save();
    }
  },

  didChangeTitle: function(model, title) {
    j(".board_title").text(title);
    j(".boards_window").find("li[data-id=" + model.id + "] .title").text(title);
  },

  menuHoverFx: function(event) {
    j(event.currentTarget).animate({ color: "#fff" }, "fast");
  },

  menuLeaveFx: function(event) {
    j(event.currentTarget).animate({ color: "#ccc" }, "fast");
  },

  openBoardsWindow: function(event) {
    event.preventDefault();

    if (_.isUndefined(this.boardsView)) {
      this.boardsView = new BoardsView;
      j(this.boardsView.render().el).prependTo("#app");
    }

    this.boardsView.open();
  },

  openUserVoice: function(event) {
    event.preventDefault();
    UserVoice.showPopupWidget();
  },

  manipulateClipboard: function(event) {
    var clipboardData = event.originalEvent.clipboardData
    , content = clipboardData.getData("text/html") || clipboardData.getData("text/plain")
    , data = j("<p/>").html(content).text();

    j(event.target).append(data);

    event.preventDefault();
  },

  addOne: function(sticky) {
    var stickyView = new StickyView({ model: sticky }).render();

    var el = j(stickyView.el)
    .appendTo(".stickies")
    .css({
      top: sticky.get("position_y"),
      left: sticky.get("position_x")
    }) 
    .show();
  },

  addAll: function() {
    Stickies.each(this.addOne);
  },

  // new sticky button action
  createSticky: function(event) {
    var stickyView = new StickyView({ model: new Sticky }).render();
    j(stickyView.el).appendTo(".stickies").fadeIn().css("z-index", zIndexMax());
    event.preventDefault();
  },

  render: function() {
    j(this.el).html(this.template());

    if (!Quadro.readonly) {
      this.shareMenuView = new ShareMenuView().render();
      j(this.el).find(".right").parent().before(this.shareMenuView.el);
    }

    return this;
  }

});

var ShareMenuView = Backbone.View.extend({

  tagName: "li",

  template: JST["boards/share"],

  events: {
    "click .share": "toggleSubmenu",
    "click #share_public": "makeBoardPublic",
    "keypress #username": "lookupUsername",
    "click .destroy_relationship": "destroyCollaboration"
  },

  initialize: function() {
    _.bindAll(this, "render", "toggleSubmenu", "makeBoardPublic", "lookupUsername", "destroyCollaboration");

    currentBoard.collaborators.bind("add", this.render);
  },

  destroyCollaboration: function(event) {
    var el = j(event.currentTarget).parent()
      , id = el.data("id")
      , model = currentBoard.collaborators.get(id);

    model.destroy({
      success: function() {
        el.fadeOut("fast", function() {
          el.remove();
        });
      }
    });
    
    // entry not removed from collections. it's a bug?
    currentBoard.collaborators.remove(model);

    event.preventDefault();
  },

  lookupUsername: function(event) {
    if (event.keyCode == 13) {
      var username = j(event.currentTarget).val()
        , valid = (username !== "" && username !== Quadro.nickname)
        , exists = currentBoard.collaborators.detect(function(i) { 
            return i.get("nickname").toLowerCase() == username.toLowerCase() 
          });

      if (!exists && valid) {
        currentBoard.collaborators.create({ username: username });
      }
    }
  },

  toggleSubmenu: function(event) {
    event.preventDefault();
    j(this.el).find(".share_menu").fadeToggle("fast");
  },

  makeBoardPublic: function(event) {
    var checked = event.currentTarget.checked;
    currentBoard.set({ share_public: checked }).save();
  },

  render: function() {
    var autoOpen = j(this.el).find(".share_menu:visible").length;

    j(this.el).html(this.template(currentBoard.toJSON()));

    // that means was triggered from an event
    if (arguments.length && autoOpen) {
      j(this.el).find(".share_menu").show();
    }

    return this;
  }

});
