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
    "click .board_title": "changeBoardTitle"
  },

  initialize: function() {
    _.bindAll(this, "render", "createSticky", "addOne", "addAll", "manipulateClipboard", "openBoardsWindow", "openUserVoice", "changeBoardTitle");

    Stickies.bind("add", this.addOne);
    Stickies.bind("reset", this.addAll);

    Boards.bind("change:title", this.didChangeTitle);

    StickyContextMenuView.initialize();

    // http://developer.apple.com/library/mac/#documentation/AppleApplications/Conceptual/SafariJSProgTopics/Tasks/CopyAndPaste.html
    j(document).bind("paste", this.manipulateClipboard);
    j(document).bind("dblclick", this.createSticky);
  },

  setReadonly: function() {
    j(this.el).undelegate(".board_title", "click");
    j("html, body").css("overflow", "auto");
  },

  changeBoardTitle: function(event) {
    if ( j("#fallr:visible").length ) { 
      return; 
    }

    var template = [
        '<p>Enter a new title:</p>'
      , '<input type="text" id="new_title" class="editing" />'
    ];

    j("#fallr").removeAttr("style");

    j.fallr('show', {
      zIndex: parseInt(j(".actions").css("z-index")) - 2,
      closeKey: true,
      closeOverlay: true,
      position: '400px',
      buttons: {
        button1: { 
          text: 'Continue',
          onclick: function() {
            var title = j(this).find('#new_title').val();
            if (title != "") {
              currentBoard.set({ title: title }).save();
            }
            j.fallr('hide');
          }
        },
        button2: { text: 'Cancel' }
      },
      content: template.join(""),
      icon: 'form'
    }, function() {
      j("#new_title").keydown(function(event) {
        if (event.keyCode == 13) {
          j("#fallr-button-button1").trigger("click");
        }
      }).focus();
    });
  },

  didChangeTitle: function(model, title) {
    j(".board_title").text(title);
    j(".boards_window").find("li[data-id=" + model.id + "] .title").text(title);
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
    if (Quadro.readonly) { return; }

    var stickyView = new StickyView({ model: new Sticky }).render();

    if (event.type == "dblclick") {
      if (event.target != document.body) { return; }

      j(stickyView.el).css({
        top: event.layerY,
        left: event.layerX
      });
    }

    j(stickyView.el)
      .appendTo(".stickies")
      .fadeIn(function() { 
        j(this).css({ height: "auto" });
      })
      .css("zIndex", zIndexMax());

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

    currentBoard.collaborators.bind("add", this.render);

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
      var input = j(event.currentTarget)
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
            // TODO: Should scroll to bottom instead. (render timeout)
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

    // that means was triggered from an event
    if (arguments.length && autoOpen) {
      j(this.el).find(".popover").show();
    }

    return this;
  }

});
