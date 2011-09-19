/**
 * Models
 */

var Sticky = Backbone.Model.extend({

  defaults: {
    content: "Getting Started\n\nJust click and start writing. Choose different note colors using the right mouse button upon the note.",
    top: 100,
    left: 100,
    width: 300,
    height: 200,
    color: "yellow",
    z_index: 0
  },

  url: function() {
    return "/boards/" + currentBoard.id + "/stickies" + (this.isNew() ? "" : "/" + this.id);
  },

  toJSON: function() {
    var attrs = _.clone(this.attributes);

    return _.extend(attrs, {
      cid: _.bind(function() {
        return this.cid.match(/\d+/)[0];
      }, this),
      formattedContent: function() {
        return formatContent(this.content);
      }
    });
  }

});

var StickyCollection = Backbone.Collection.extend({ model: Sticky, localStorage: new Store("stickies") })
  , Stickies = window.Stickies = new StickyCollection;

Stickies.url = function() {
  return "/boards/" + currentBoard.id + "/stickies";
};


/**
 * Views
 */

var StickyView = Backbone.View.extend({

  className: "sticky unselectable",

  template: JST["stickies/sticky"],

  events: {
    "click .remove": "remove",
    "focus .content": "setContentEditable",
    "blur .content": "unsetContentEditable",
    "contextmenu": "openContextMenu",
    "dragstop": "updateStickyPosition",
    "dragstart": "closeContextMenu",
    "click": "bringToFront"
  },

  initialize: function() {
    _.bindAll(this, "render");
  },

  bringToFront: function(event) {
    var curIndex = j(this.el).css("z-index")
      , newIndex = zIndexMax();

    if (parseInt(curIndex) != newIndex - 1 && isOverlapping(j(this.el))) {
      this.model.set({ "z_index": newIndex }).save();
      j(this.el).css("zIndex", newIndex);
    }
  },

  openContextMenu: function(event) {
    event.preventDefault();
    StickyContextMenuView.context(this).open(event.pageX, event.pageY);
  },

  closeContextMenu: function() {
    StickyContextMenuView.close();
  },

  updateStickyPosition: function(event, ui) {
    var that = this;

    this.model.set({
      top: ui.offset.top,
      left: ui.offset.left
    }).save({}, {
      error: function(model, xhr) {
        if (xhr.statusText !== "abort") {
          that.close();
        }
      }
    });
  },
  
  setContentEditable: function(event) {
    var el = j(event.currentTarget);

    if (el.text().replace(/\n+/, "") == this.model.defaults.content.replace(/\n+/, "")) {
      el.text(""); 
      setSelection(event.currentTarget);
    }

    el.removeClass("unselectable").attr("contenteditable", "true");
    j(this.el).removeClass("unselectable");

    event.preventDefault();
  },

  unsetContentEditable: function(event) {
    var content = []
      , paragraphs = j(this.el).find(".content p");

    j(event.currentTarget).addClass("unselectable").attr("contenteditable", "false");
    j(this.el).addClass("unselectable");

    if (paragraphs.length) {
      paragraphs.each(function() { content.push( j(this).text() ); });
      content = content.join("\n");
    } else {
      content = this.$(".content").text();
    }

    if (!j.trim(content).length) {
      content = this.model.defaults.content;
      this.$(".content").empty().append(j("<p/>").text(content));
    }

    if (this.model.get("content") !== content) {
      this.model.set({ content: content }).save();
    }
  },

  close: function() {
    j(this.el).fadeOut(function() {
      j(this).remove();
    });
  },

  remove: function(event) {
    var that = this;

    if (event && 'preventDefault' in event) {
      event.preventDefault();
    }

    this.model.destroy({
      success: function() {
        that.close(); 
      }
    });

    if ( this.model.isNew() ) {
      this.close();  
    }
  },

  render: function() {
    var that = this;

    j(this.el)
      .addClass(this.model.get("color"))
      .html(this.template(this.model.toJSON()))
      .css({
        position: "absolute",
        zIndex: this.model.get("z_index")
      })
      .draggable({
        containment: "window",
        cancel: ".content",
        stack: ".sticky"
      })
      .resizable({
        handles: "se",
        minHeight: 200,
        minWidth: 300,
        resize: function(event, ui) {
          j(ui.element).find(".content").css({
            width: ui.size.width,
            height: ui.size.height
          });
        },
        stop: function(event, ui) {
          that.model.set({
            width: ui.size.width,
            height: ui.size.height
          }).save();
        }
      });

    if (Quadro.readonly == true) {
      j(this.el).removeClass("unselectable").unbind();
      this.$(".remove, .ui-resizable-handle").remove();
      this.$(".content").removeClass("unselectable");
    }

    if ( j(".sticky:last").hasClass("even") == false ) {
      j(this.el).addClass("even");
    }

    return this;
  }

});

/**
 * TODO: THIS SHOULD BE REFACTORED!
 */

var StickyContextMenuView = {

  availableColors: ["blue", "green", "pink", "purple", "gray"],

  template: JST['stickies/colors'],
  
  initialize: function() {
    _.bindAll(this, "changeColor", "close");

    this.el = j(this.template()).prependTo("#app");
    this.el.find("li").bind("click", this.changeColor);

    j(document).bind("click", this.close);
  },

  changeColor: function(event) {
    var that = this, color = j(event.currentTarget).data("color");

    _.each(this.availableColors, function(color) {
      j(that.sticky.el).removeClass(color);
    });

    this.sticky.model.set({ color: color }).save();
    j(this.sticky.el).addClass(this.sticky.model.get("color"));
  },

  context: function(sticky) {
    this.sticky = sticky;
    return this;
  },

  open: function(x, y) {
    this.el.css({
      top: y,
      left: x,
      zIndex: 998
    }).fadeIn(1);
  },

  close: function() {
    this.el.fadeOut("fast");
  }

};
