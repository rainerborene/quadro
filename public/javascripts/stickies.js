/**
 * Models
 */

var Sticky = Backbone.Model.extend({

  defaults: {
    title: "Untitled",
    content: "Click here to start writing something useful. You can also change the background color using the right mouse button.",
    position_x: 100,
    position_y: 100,
    color: "yellow"
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

var StickyCollection = Backbone.Collection.extend({ model: Sticky })
  , Stickies = window.Stickies = new StickyCollection;

Stickies.url = function() {
  return "/boards/" + currentBoard.id + "/stickies";
};


/**
 * Views
 */

var StickyView = Backbone.View.extend({

  className: "sticky",

  template: JST["stickies/sticky"],

  events: {
    "click .remove": "remove",
    "focus .title, .content": "setContentEditable",
    "blur .title, .content": "unsetContentEditable",
    "keypress .title": "didChangeTitle",
    "contextmenu": "openContextMenu",
    "dragstop": "updateStickyPosition",
    "dragstart": "closeContextMenu"
    
  },

  initialize: function() {
    _.bindAll(this, "render", "setContentEditable", "unsetContentEditable", "remove", "didChangeTitle", "openContextMenu", "closeContextMenu"); 
  },

  openContextMenu: function(event) {
    event.preventDefault();
    StickyContextMenuView.context(this).open(event.pageX, event.pageY);
  },

  closeContextMenu: function() {
    StickyContextMenuView.close();
  },

  // Prevents user from adding newlines to the title.
  didChangeTitle: function(event) {
    return event.which != 13;
  },

  updateStickyPosition: function(event, ui) {
    var that = this;

    this.model.set({
      position_x: ui.offset.left,
      position_y: ui.offset.top
    }).save({}, {
      error: function(model, xhr) {
        if (xhr.statusText !== "abort") {
          that.close();
        }
      }
    });
  },

  setContentEditable: function(event) {
    j(event.currentTarget).attr("contenteditable", "true");
  },

  unsetContentEditable: function(event) {
    var content = [], title = j(this.el).find(".title").text();

    j(event.currentTarget).attr("contenteditable", "false");
    j(this.el).find(".content p").each(function() {
      content.push( j(this).text() );
    });

    content = content.join("\n");

    if (this.model.get("title") !== title || this.model.get("content") !== content) {
      this.model.set({ title: title, content: content }).save();
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
    j(this.el)
      .addClass(this.model.get("color"))
      .html(this.template(this.model.toJSON()))
      .css("position", "absolute")
      .draggable({
        containment: "window",
        cancel: ".title, .content",
        stack: ".sticky"
      });

    if (Quadro.readonly) {
      j(this.el).unbind();
      j(this.el).find(".remove").remove();
    } 

    if ( j(".sticky:last").hasClass("even") == false ) {
      j(this.el).addClass("even");
    }

    return this;
  }

});

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

