// tj holowaychuk's style
var j = jQuery;

// app namespace
var Quadro = { views: {} };

/**
 * Views
 */

var WorkspaceView = Backbone.View.extend({

  className: "workspace",

  template: JST['home/workspace'],

  events: {
    "click .new": "createSticky",
    "click .boards": "openBoardsModal",
    "click .share": "openSharePopover",
    "click .feedback": "openUserVoice",
    "click .quick-view": "toggleQuickView"
  },

  initialize: function() {
    _.bindAll(this, "render",  "addOne", "addAll", "manipulateClipboard");

    Stickies.bind("add", this.addOne);
    Stickies.bind("reset", this.addAll);

    j(document).bind("paste", this.manipulateClipboard);
    j(document).bind("dblclick", this.createSticky);
  },

  openSharePopover: function(event) {
    this.shareView.toggle();
    j(event.currentTarget).parent().toggleClass("active");
    event.preventDefault();
  },

  toggleQuickView: function(event) {
    var button = j(event.currentTarget)
      , topbar = this.$(".topbar");

    if (topbar.css("display") == "none") {
      button.animate({ opacity: 0.2 });
      topbar.stop().css("display", "block").animate({ top: 0 });
      j.cookie('__quick_view', 'false');
    } else {
      topbar.stop().animate({ top: (topbar.height() + 4) * -1 }, function() {
        j(this).css("display", "none");
      });

      button.animate({ opacity: 0.5 });
      j.cookie('__quick_view', 'true');
    }
  },

  setReadonly: function() {
    j("html, body").css("overflow", "auto");
  },

  openBoardsModal: function(event) {
    var el = j(event.currentTarget);

    if (el.parent().next().hasClass("active")) {
      el.parent().next().find("a").trigger("click");
    }

    event.preventDefault();
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
      if (obj.hasClass("content")) {
        obj.find(":not(p,br)").each(function() {
          j(this).replaceWith("<p>" + j(this).text() + "</p>");
        });
      }
    }, 1);
  },

  addOne: function(sticky) {
    var stickyView = new StickyView({ model: sticky }).render();

    var el = j(stickyView.el)
      .appendTo(".stickies")
      .css({
        top: sticky.get("top"),
        left: sticky.get("left")
      });

    el.find(".content").andSelf().css({
      width: sticky.get("width"),
      height: sticky.get("height")
    });

    el.show();
  },

  addAll: function() {
    Stickies.each(this.addOne);
  },

  createSticky: function(event) {
    if (Quadro.readonly) { 
      return; 
    }

    var model = new Sticky()
      , stickyView = new StickyView({ model: model }).render()
      , zIndex = zIndexMax();

    model.collection = Stickies;

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
      top: parseInt(j(stickyView.el).css("top")),
      left: parseInt(j(stickyView.el).css("left")),
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

    if (j.cookie('__quick_view') == 'true') {
      this.$(".quick-view").css("opacity", 0.5);
      this.$(".topbar").css({ display: "none", top: -45 });
    }

    if (_.isUndefined(this.boardsView)) {
      this.boardsView = new BoardsView().render();
      j(this.boardsView.el).appendTo("#app");
    }

    if (_.isUndefined(this.shareView)) {
      this.shareView = new ShareView().render();
      j(this.shareView.el).appendTo("#app");
    }

    return this;
  }

});

/**
 * Sharing Settings
 */

var ShareView = Backbone.View.extend({

  className: "share-view popover below hide",

  template: JST["boards/share"],

  events: {
    "click #share-public": "togglePublished",
    "click .delete-collaboration": "destroyCollaboration",
    "keypress #username": "lookupUsername",
    "submit form": "preventSubmit"
  },

  initialize: function() {
    _.bindAll(this, "render", "toggle", "closePopover");
    j(document).bind("click", this.closePopover);
  },

  preventSubmit: function(event) {
    event.preventDefault();
  },

  closePopover: function(event) {
    if ( ! j(event.target).parents(".topbar, .share-view").length 
        && j(this.el).is(":not(:animated)") ) {
           j(this.el).fadeOut("fast");
           j(".share").parent().removeClass("active");
        }
  },

  destroyCollaboration: function(event) {
    var el = j(event.currentTarget).parent()
      , id = el.data("id")
      , model = currentBoard.collaborators.get(id);

    j(event.currentTarget).attr("disabled", "disabled");

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
        input.attr("disabled", "disabled");

        currentBoard.collaborators.create({ username: username }, { 
          error: function() { 
            input
              .removeAttr("disabled")
              .css({ backgroundColor: "#D83A2E", color: "#ffffff" })
              .animate({ backgroundColor: "#ffffff", color: "#808080" }, "slow")
              .trigger("focus");
          },
          success: function(model, attributes, xhr) {
            var template = JST['boards/collaborator']
              , collaborators = j(".collaborators")
              , username = j("#username")
              , item = j(template({ item: attributes }))
              , scroll = Math.abs(collaborators[0].scrollHeight - collaborators.height()) - collaborators.scrollTop() + 25;

            item.css("display", "none");
            collaborators.append(item).animate({ scrollTop: "+=" + scroll }, "slow");
            item.fadeIn();

            username.val("").removeAttr("disabled");
          }
        });
      }
    }
  },

  toggle: function() {
    j(this.el).fadeToggle("fast");
  },

  togglePublished: function(event) {
    var checked = event.currentTarget.checked;
    currentBoard.set({ share_public: checked }).save();
  },

  render: function() {
    j(this.el).html(this.template(currentBoard.toJSON()));
    
    return this;
  }

});
