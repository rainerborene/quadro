/**
 * Views
 */

var WorkspaceView = Backbone.View.extend({

  className: "workspace",

  template: JST['home/workspace'],

  events: {
    "click .new": "createSticky",
    "click .boards": "openBoardsWindow",
    "click .feedback": "openUserVoice"
  },

  initialize: function() {
    _.bindAll(this, "render", "createSticky", "addOne", "addAll", "manipulateClipboard", "openBoardsWindow", "openUserVoice");

    Stickies.bind("add", this.addOne);
    Stickies.bind("reset", this.addAll);

    Boards.bind("change:title", this.didChangeTitle);

    StickyContextMenuView.initialize();

    // http://developer.apple.com/library/mac/#documentation/AppleApplications/Conceptual/SafariJSProgTopics/Tasks/CopyAndPaste.html
    j(document).bind("paste", this.manipulateClipboard);
    j(document).bind("dblclick", this.createSticky);
  },

  setReadonly: function() {
    j("html, body").css("overflow", "auto");
  },

  didChangeTitle: function(model, title) {
    j(".board-list").find("li[data-id=" + model.id + "]").text(title);
  },

  openBoardsWindow: function(event) {
    event.preventDefault();

    if (_.isUndefined(this.boardsView)) {
      this.boardsView = new BoardsView().render();
      j(this.boardsView.el).appendTo("#app");
    }

    this.boardsView.open();
  },

  openUserVoice: function(event) {
    event.preventDefault();
    UserVoice.showPopupWidget();
  },

  manipulateClipboard: function(event) {
    var obj = event.target.tagName == "BR" 
            ? j(event.target).parent() 
            : j(event.target);

    setTimeout(function() {
      obj.find(":not(p,br)").each(function() {
        j(this).replaceWith("<p>" + j(this).text() + "</p>");
      });
    }, 1);
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

    setTimeout(function() {
      j(".sticky").css("height", "auto");
    }, 2000);
  },

  createSticky: function(event) {
    if (Quadro.readonly) { 
      return; 
    }

    var model = new Sticky()
      , stickyView = new StickyView({ model: model }).render()
      , zIndex = zIndexMax();

    if (event.type == "dblclick") {
      if (event.target != document.body) {
        return; 
      }

      j(stickyView.el).css({ 
        top: event.layerY,
        left: event.layerX 
      });
    } else {
      j(stickyView.el).css({
        left: (j(window).width() - 340) * Math.random(),
        top: Math.max(60, parseInt((j(window).height() - 250) * Math.random()))
      });
    }
    
    model.set({
      position_x: parseInt(j(stickyView.el).css("left")),
      position_y: parseInt(j(stickyView.el).css("top")),
      z_index: zIndex
    });

    j(stickyView.el)
      .appendTo(".stickies")
      .css("zIndex", zIndex)
      .fadeIn(function() { 
        j(this).css({ height: "auto" });
      });

    event.preventDefault();
  },

  render: function() {
    j(this.el).html(this.template());

    if (!Quadro.readonly) {
      this.shareMenuView = new ShareMenuView().render();
      j(this.el).find(".feedback").parent().before(this.shareMenuView.el);
    }

    return this;
  }

});

var ShareMenuView = Backbone.View.extend({

  tagName: "li",

  className: "share-menu",

  template: JST["boards/share"],

  events: {
    "click .share": "toggleSubmenu",
    "click #share-public": "makeBoardPublic",
    "click .delete-collaboration": "destroyCollaboration",
    "keypress #username": "lookupUsername",
    "submit form": "cancelSubmit"
  },

  initialize: function() {
    _.bindAll(this, "render", "toggleSubmenu", "makeBoardPublic", "lookupUsername", "destroyCollaboration", "closeSubmenu");

    j(document).bind("click", this.closeSubmenu);
  },

  cancelSubmit: function(event) {
    event.preventDefault();
  },

  closeSubmenu: function(event) {
    if ( ! j(event.target).parents(".topbar").length ) {
      j(this.el).find(".popover:not(:animated)").fadeOut("fast");
      j(this.el).removeClass("active");
    }
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
      var that = this
        , input = j(event.currentTarget)
        , username = input.val().replace(/@/g, "")
        , valid = (username !== "" && username !== Quadro.nickname)
        , exists = currentBoard.collaborators.detect(function(i) { 
            return i.get("nickname").toLowerCase() == username.toLowerCase() 
          });

      if (!exists && valid) {
        currentBoard.collaborators.create({ username: username }, { 
          error: function() { 
            input
              .css({ backgroundColor: "#D83A2E", color: "#ffffff" })
              .animate({ backgroundColor: "#ffffff", color: "#808080" }, "slow")
              .trigger("focus");
          },
          success: function() {
            that.render();

            var collaborators = j(".collaborators")
              , scroll = Math.abs(collaborators[0].scrollHeight - collaborators.height());

            collaborators.animate({ scrollTop: scroll }, "slow");
          }
        });
      }
    }
  },

  toggleSubmenu: function(event) {
    event.preventDefault();
    j(this.el).find(".popover").fadeToggle("fast");
    j(this.el).toggleClass("active");
  },

  makeBoardPublic: function(event) {
    var checked = event.currentTarget.checked;
    currentBoard.set({ share_public: checked }).save();
  },

  render: function() {
    var autoOpen = j(this.el).find(".popover:visible").length;

    j(this.el).html(this.template(currentBoard.toJSON()));

    if (autoOpen) {
      j(this.el).find(".popover").show();
    }

    return this;
  }

});
