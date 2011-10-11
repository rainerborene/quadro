/**
 * Configuration
 */

var currentRequests = {};

j.ajaxPrefilter(function(options, originalOptions, jxhr) {
  var token = j("meta[name='csrf-token']").attr("content");
  if (currentRequests[options.url]) {
    currentRequests[options.url].abort();
  }
  jxhr.setRequestHeader("X-CSRF-Token", token);
  currentRequests[options.url] = jxhr;
});

j.ajaxSetup({
  beforeSend: function() {
    if ( j(".workspace:visible").length ) {
      j(".mini-loader").css("display", "block");
    }
  },
  complete: function() {
    if ( j(".workspace:visible").length ) {
      j(".mini-loader").css("display", "none");
    }
  }
});

/**
 * Helpers
 */

window.log = function() {
  log.history = log.history || []; // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    console.log( Array.prototype.slice.call(arguments) );
  }
};

function formatContent(content) {
  var wrapper = j("<div/>");

  _.each(content.split("\n"), function(v) {
    var item = j("<p/>");

    if (v == "") {
      item.html("<br>");
    } else {
      item.text(v);
    }

    item.appendTo(wrapper); 
  });
  
  return wrapper.html();
}

function zIndexMax() {
  var zIndex = 0;

  j(".sticky").each(function() {
    var i = parseInt(j(this).css("z-index"));
    if (i > zIndex) {
      zIndex = i;
    }
  });

  return zIndex + 1;
}

function setSelection(div) {
  setTimeout(function() {
    var sel, range;
    if (window.getSelection && document.createRange) {
        range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(true);
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(div);
        range.collapse(true);
        range.select();
    }
  }, 1);
}

// Credits: http://silentmatt.com/rectangle-intersection/
function isOverlapping(sticky) {
  var stickies = j(".sticky").not(sticky)
    , originOffset = sticky.offset()
    , originX = originOffset.left + sticky.outerWidth()
    , originY = originOffset.top + sticky.outerHeight()
    , overlap = false;

  stickies.each(function() {
    var targetOffset = j(this).offset()
      , targetX = targetOffset.left + j(this).outerWidth()
      , targetY = targetOffset.top + j(this).outerHeight();

    if (targetOffset.left > originX || targetX < originOffset.left) {
      return;
    } else if (targetOffset.top > originY || targetY < originOffset.top) {
      return;
    }

    if (originOffset.left < targetX
     && originX > originOffset.left
     && originOffset.top < targetY
     && originY > targetOffset.top) {
        overlap = true;
     }
  });

  return overlap;
}

function updateWindowTitle() {
  document.title = (currentBoard.get("title") + " • Quadro");
}

/**
 * Initialization
 */

Quadro.initialize = function() {
  _.extend(Quadro, {
    readonly: j("#app").data("readonly"),
    board_id: j("#app").data("board-id")
  });

  if (!Quadro.authenticated && !Quadro.readonly) {
    Backbone.localStorage();
    Stickies.fetch();
  }

  // Load board
  currentBoard = Boards.get(Quadro.board_id) || new Board();
  
  // Render calls
  Quadro.views.workspaceView = new WorkspaceView().render();
  j(Quadro.views.workspaceView.el).prependTo("#app");

  if (Quadro.readonly) {
    Quadro.views.workspaceView.setReadonly();
  } 

  // Finally, load stickies.
  Stickies.trigger("reset");
};

/**
 * Document ready
 */

j(function() {
  Quadro.initialize();
 
  j(window).bind({
    load: function() {
      j("#loading").fadeOut();
    },
    beforeunload: function() {
      j(".sticky").find(".content").trigger("blur", { async: false });
    }
  });
});
