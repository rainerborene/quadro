(function(){window.JST=window.JST||{};window.JST["boards/board"]=_.template('<li data-id="<%= this.id %>">\n  <%= this.title %>\n  <% if (this.user.name != Quadro.name) { %>\n    <div class="meta">\n      <span class="status">shared with you</span>\n      <img src="<%= this.user.profile_image %>" width="20" height="20" title="<%= this.user.name %>" />\n    </div>\n  <% } %>\n</li>\n');window.JST["boards/boards"]=_.template('<div class="modal">\n  <div class="modal-header">\n    <h3>Boards</h3>\n    <a href="#close" class="close">×</a>\n  </div>\n  <div class="modal-body">\n    <ul class="board-list">\n      <% _.each(boards, function(item) { %>\n        <%= item %>\n      <% }); %>\n    </ul>\n    <p class="help">Double click to edit the title, or select an item to open or remove.</p>\n  </div>\n  <div class="modal-footer">\n    <button disabled="disabled" class="btn small primary open-board">Open</button>\n    <button disabled="disabled" class="btn small danger remove-board">Delete</button>\n    <button class="btn small create-board">New</button>\n  </div>\n</div>\n<div class="well"></div>\n');window.JST["boards/share"]=_.template('<a href="#share" class="share">Share</a>\n<div class="popover below">\n  <div class="arrow"></div>\n  <div class="inner">\n    <h3 class="title">Sharing Settings</h3>\n    <div class="content">\n      <form>\n        <div class="clearfix">\n          <ol class="inputs-list">\n            <li>\n              <label>\n                <input type="checkbox" id="share-public" name="share-public" value="true" <% if (share_public) { %>checked="checked"<% } %> />\n                <span>Allow other people to read my notes.</span>\n              </label>\n              <a href="/share/<%= secret_token %>" class="public-address">quadroapp.com/share/<%= secret_token %></a>\n            </li>\n          </ol>\n        </div>\n\n        <div class="clearfix">\n          <div class="input-prepend">\n            <span class="add-on">@</span>\n            <input class="large" id="username" name="username" size="16" type="text" placeholder="invite your friends">\n          </div>\n        </div>\n      </form>\n\n      <div class="collaborators custom-scrollbar">\n        <% _.each(collaborators, function(item) { %>\n          <div class="user-item" data-id="<%= item.id %>">\n            <img src="<%= item.profile_image %>" width="20" height="20" /> <%= item.name %>\n            <button class="btn danger delete-collaboration">Delete</button>\n          </div>\n        <% }); %>\n      </div>\n    </div>\n  </div>\n</div>\n');window.JST["home/login"]=_.template('<h1>Quadro</h1>\n<a href="/auth/twitter" class="twitter_button">Sign in with Twitter</a>\n<p>We currently have <em><%= Quadro.stickies %> notes</em> spread over <em><%= Quadro.boards %> boards</em> right now.</p>\n');window.JST["home/workspace"]=_.template('<% if (Quadro.readonly == false) { %>\n  <div class="topbar unselectable">\n    <div class="fill">\n      <div class="container">\n        <h3 class="logo"><a class="unlink">Quadro</a></h3>\n        <ul>\n          <li><a href="#new" class="new">New Note</a></li>\n          <li><a href="#boards" class="boards">Boards</a></li>\n          <li><a href="#feedback" class="feedback">Feedback</a></li>\n        </ul>\n        <ul class="nav secondary-nav">\n          <li>\n            <a class="profile unlink">\n              <img src="<%= Quadro.profile_image %>" /> <%= Quadro.name %>\n            </a>\n          </li>\n          <li>\n            <a href="/logout">Logout</a>\n          </li>\n        </ul>\n      </div>\n    </div>\n  </div>\n<% } %>\n<div class="stickies"></div>\n');window.JST["stickies/colors"]=_.template('<ul class="colors">\n  <li data-color="yellow">Yellow</li>\n  <li data-color="blue">Blue</li>\n  <li data-color="green">Green</li>\n  <li data-color="pink">Pink</li>\n  <li data-color="purple">Purple</li>\n  <li data-color="gray">Gray</li>\n</ul>\n');window.JST["stickies/sticky"]=_.template('<a href="#" class="remove">Excluir</a>\n<div class="content unselectable" tabindex="<%= cid() %>"><%= formattedContent() %></div>\n')})();