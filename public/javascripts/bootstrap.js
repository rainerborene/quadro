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
      j(".mini_loader").css("visibility", "visible");
    }
  },
  complete: function() {
    if ( j(".workspace:visible").length ) {
      j(".mini_loader").css("visibility", "hidden");
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
    j("<p/>").text(v).appendTo(wrapper); 
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

/**
 * Document ready
 */

j(function() {
  _.extend(Quadro, {
    readonly: j(document.body).data("readonly"),
    board_id: j(document.body).data("board-id")
  });

  if (Quadro.authenticated || Quadro.readonly) {
    // Load board
    currentBoard = Boards.get(Quadro.board_id) || Boards.first();
    
    // Render workspace views
    Quadro.views.workspaceView = new WorkspaceView().render();
    j(Quadro.views.workspaceView.el).prependTo("#app");

    if (Quadro.readonly) {
      Quadro.views.workspaceView.setReadonly();
    }
    
    // Finally, load stickies.
    Stickies.trigger("reset");
  } else {
    Quadro.views.loginView = new LoginView().render();
    j(Quadro.views.loginView.el).prependTo("#app");
  }

  j(window).load(function() {
    j("#loading").fadeOut();
  });
});
