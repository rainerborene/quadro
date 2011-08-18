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
    j(document).bind("dblclick", this.createSticky);
  },

  setReadonly: function() {
    j(this.el).undelegate(".board_title", "click");
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

  menuHoverFx: function(event) {
    j(event.currentTarget).animate({ color: "#fff" }, "fast");
  },

  menuLeaveFx: function(event) {
    j(event.currentTarget).animate({ color: "#ccc" }, "fast");
  },

  openBoardsWindow: function(event) {
    event.preventDefault();

    if (_.isUndefined(this.boardsView)) {
      this.boardsView = new BoardsView().render();
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
    _.bindAll(this, "render", "toggleSubmenu", "makeBoardPublic", "lookupUsername", "destroyCollaboration", "closeSubmenu");

    currentBoard.collaborators.bind("add", this.render);

    j(document).bind("click", this.closeSubmenu);
  },

  closeSubmenu: function(event) {
    if ( ! j(event.target).parents(".actions").length ) {
      j(this.el).find(".share_menu:not(:animated)").fadeOut("fast");
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
      var username = j(event.currentTarget).val().replace(/@/g, "")
        , valid = (username !== "" && username !== Quadro.nickname)
        , exists = currentBoard.collaborators.detect(function(i) { 
            return i.get("nickname").toLowerCase() == username.toLowerCase() 
          });

      if (!exists && valid) {
        currentBoard.collaborators.create({ username: username }, { 
          error: function() {
            console.log(this);
            console.log(arguments);
          }
        });
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
