var j=jQuery;var Quadro={views:{}};var LoginView=Backbone.View.extend({className:"login",template:JST["home/login"],initialize:function(){_.bindAll(this,"render")},render:function(){j(this.el).html(this.template());return this}});var WorkspaceView=Backbone.View.extend({className:"workspace",template:JST["home/workspace"],events:{"click .new":"createSticky","click .boards":"openBoardsWindow","click .feedback":"openUserVoice"},initialize:function(){_.bindAll(this,"render","createSticky","addOne","addAll","manipulateClipboard","openBoardsWindow","openUserVoice");Stickies.bind("add",this.addOne);Stickies.bind("reset",this.addAll);Boards.bind("change:title",this.didChangeTitle);StickyContextMenuView.initialize();j(document).bind("paste",this.manipulateClipboard);j(document).bind("dblclick",this.createSticky)},setReadonly:function(){j("html, body").css("overflow","auto")},didChangeTitle:function(a,b){j(".board-list").find("li[data-id="+a.id+"]").text(b)},openBoardsWindow:function(a){a.preventDefault();if(_.isUndefined(this.boardsView)){this.boardsView=new BoardsView().render();j(this.boardsView.el).appendTo("#app")}this.boardsView.open()},openUserVoice:function(a){a.preventDefault();UserVoice.showPopupWidget()},manipulateClipboard:function(a){var b=a.target.tagName=="BR"?j(a.target).parent():j(a.target);setTimeout(function(){b.find(":not(p,br)").each(function(){j(this).replaceWith("<p>"+j(this).text()+"</p>")})},1)},addOne:function(c){var b=new StickyView({model:c}).render();var a=j(b.el).appendTo(".stickies").css({top:c.get("position_y"),left:c.get("position_x")}).show()},addAll:function(){Stickies.each(this.addOne);setTimeout(function(){j(".sticky").css("height","auto")},2000)},createSticky:function(c){if(Quadro.readonly){return}var a=new Sticky(),b=new StickyView({model:a}).render(),d=zIndexMax();if(c.type=="dblclick"){if(c.target!=document.body){return}j(b.el).css({top:c.layerY,left:c.layerX})}else{j(b.el).css({left:(j(window).width()-340)*Math.random(),top:Math.max(60,parseInt((j(window).height()-250)*Math.random()))})}a.set({position_x:parseInt(j(b.el).css("left")),position_y:parseInt(j(b.el).css("top")),z_index:d});j(b.el).appendTo(".stickies").css("zIndex",d).fadeIn(function(){j(this).css({height:"auto"})});c.preventDefault()},render:function(){j(this.el).html(this.template());if(!Quadro.readonly){this.shareMenuView=new ShareMenuView().render();j(this.el).find(".feedback").parent().before(this.shareMenuView.el)}return this}});var ShareMenuView=Backbone.View.extend({tagName:"li",className:"share-menu",template:JST["boards/share"],events:{"click .share":"toggleSubmenu","click #share-public":"makeBoardPublic","click .delete-collaboration":"destroyCollaboration","keypress #username":"lookupUsername","submit form":"cancelSubmit"},initialize:function(){_.bindAll(this,"render","toggleSubmenu","makeBoardPublic","lookupUsername","destroyCollaboration","closeSubmenu");currentBoard.collaborators.bind("add",this.render);j(document).bind("click",this.closeSubmenu)},cancelSubmit:function(a){a.preventDefault()},closeSubmenu:function(a){if(!j(a.target).parents(".topbar").length){j(this.el).find(".popover:not(:animated)").fadeOut("fast");j(this.el).removeClass("active")}},destroyCollaboration:function(c){var b=j(c.currentTarget).parent(),d=b.data("id"),a=currentBoard.collaborators.get(d);a.destroy({success:function(){b.fadeOut("fast",function(){b.remove()})}});currentBoard.collaborators.remove(a);c.preventDefault()},lookupUsername:function(d){if(d.keyCode==13){var a=j(d.currentTarget),e=a.val().replace(/@/g,""),c=(e!==""&&e!==Quadro.nickname),b=currentBoard.collaborators.detect(function(f){return f.get("nickname").toLowerCase()==e.toLowerCase()});if(!b&&c){currentBoard.collaborators.create({username:e},{error:function(){a.css({backgroundColor:"#D83A2E",color:"#ffffff"}).animate({backgroundColor:"#ffffff",color:"#808080"},"slow").trigger("focus")},success:function(){}})}}},toggleSubmenu:function(a){a.preventDefault();j(this.el).find(".popover").fadeToggle("fast");j(this.el).toggleClass("active")},makeBoardPublic:function(b){var a=b.currentTarget.checked;currentBoard.set({share_public:a}).save()},render:function(){var a=j(this.el).find(".popover:visible").length;j(this.el).html(this.template(currentBoard.toJSON()));if(arguments.length&&a){j(this.el).find(".popover").show()}return this}});var Sticky=Backbone.Model.extend({defaults:{content:"Untitled\n\nClick here to start writing something useful. You can also change the background color using the right mouse button.",position_x:100,position_y:100,color:"yellow",z_index:0},url:function(){return"/boards/"+currentBoard.id+"/stickies"+(this.isNew()?"":"/"+this.id)},toJSON:function(){var a=_.clone(this.attributes);return _.extend(a,{cid:_.bind(function(){return this.cid.match(/\d+/)[0]},this),formattedContent:function(){return formatContent(this.content)}})}});var StickyCollection=Backbone.Collection.extend({model:Sticky}),Stickies=window.Stickies=new StickyCollection;Stickies.url=function(){return"/boards/"+currentBoard.id+"/stickies"};var StickyView=Backbone.View.extend({className:"sticky",template:JST["stickies/sticky"],events:{"click .remove":"remove","focus .content":"setContentEditable","blur .content":"unsetContentEditable",contextmenu:"openContextMenu",dragstop:"updateStickyPosition",dragstart:"closeContextMenu",click:"bringToFront"},initialize:function(){_.bindAll(this,"render","setContentEditable","unsetContentEditable","remove","openContextMenu","closeContextMenu","bringToFront")},bringToFront:function(c){var b=j(this.el).css("z-index"),a=zIndexMax();if(parseInt(b)!=a-1&&isOverlapping(j(this.el))){this.model.set({z_index:a}).save();j(this.el).css("zIndex",a)}},openContextMenu:function(a){a.preventDefault();StickyContextMenuView.context(this).open(a.pageX,a.pageY)},closeContextMenu:function(){StickyContextMenuView.close()},updateStickyPosition:function(b,c){var a=this;this.model.set({position_x:c.offset.left,position_y:c.offset.top}).save({},{error:function(d,e){if(e.statusText!=="abort"){a.close()}}})},setContentEditable:function(b){var a=j(b.currentTarget);if(a.text().replace(/\n+/,"")==this.model.defaults.content.replace(/\n+/,"")){a.text("");setSelection(b.currentTarget)}a.removeClass("unselectable").attr("contenteditable","true");b.preventDefault()},unsetContentEditable:function(c){var b=[],a=j(this.el).find(".content p");j(c.currentTarget).addClass("unselectable").attr("contenteditable","false");if(a.length){a.each(function(){b.push(j(this).text())});b=b.join("\n")}else{b=j(this.el).find(".content").text()}if(!j.trim(b).length){b=this.model.defaults.content;j(this.el).find(".content").empty().append(j("<p/>").text(b))}if(this.model.get("content")!==b){this.model.set({content:b}).save()}},close:function(){j(this.el).fadeOut(function(){j(this).remove()})},remove:function(b){var a=this;if(b&&"preventDefault" in b){b.preventDefault()}this.model.destroy({success:function(){a.close()}});if(this.model.isNew()){this.close()}},render:function(){j(this.el).addClass(this.model.get("color")).html(this.template(this.model.toJSON())).css({position:"absolute",zIndex:this.model.get("z_index")}).draggable({containment:"window",cancel:".content",stack:".sticky"});if(Quadro.readonly){j(this.el).unbind();j(this.el).find(".remove").remove()}if(j(".sticky:last").hasClass("even")==false){j(this.el).addClass("even")}return this}});var StickyContextMenuView={availableColors:["blue","green","pink","purple","gray"],template:JST["stickies/colors"],initialize:function(){_.bindAll(this,"changeColor","close");this.el=j(this.template()).prependTo("#app");this.el.find("li").bind("click",this.changeColor);j(document).bind("click",this.close)},changeColor:function(c){var b=this,a=j(c.currentTarget).data("color");_.each(this.availableColors,function(d){j(b.sticky.el).removeClass(d)});this.sticky.model.set({color:a}).save();j(this.sticky.el).addClass(this.sticky.model.get("color"))},context:function(a){this.sticky=a;return this},open:function(a,b){this.el.css({top:b,left:a,zIndex:998}).fadeIn(1)},close:function(){this.el.fadeOut("fast")}};var Collaborator=Backbone.Model.extend({}),CollaboratorCollection=Backbone.Collection.extend({model:Collaborator});var Board=Backbone.Model.extend({urlRoot:"/boards",defaults:{title:"Untitled",share_public:false},initialize:function(){this.collaborators=new CollaboratorCollection;this.collaborators.url="/boards/"+this.id+"/collaborators";this.collaborators.reset(this.attributes.collaborators)},toJSON:function(){var a=_.clone(this.attributes);a.collaborators=this.collaborators.toJSON();return a}});var BoardCollection=Backbone.Collection.extend({model:Board}),Boards=window.Boards=new BoardCollection,currentBoard=null;var BoardsView=Backbone.View.extend({template:JST["boards/boards"],className:"unselectable",events:{"click .create-board":"createBoard","click .remove-board":"removeBoard","click .open-board":"openBoard","click .board-list li":"selectItem","dblclick .board-list li":"changeTitle","click .close, .well":"close"},initialize:function(){_.bindAll(this,"render","openBoard","close","createBoard","removeBoard","changeTitle","selectItem","escKey");j(document).bind("keyup",this.escKey)},selectItem:function(a){j(a.currentTarget).siblings().removeClass("selected");j(a.currentTarget).addClass("selected");j(this.el).find("button[disabled]").removeAttr("disabled")},escKey:function(a){if(a.keyCode==27){this.close()}},changeTitle:function(b){var c=prompt("Enter a new title:"),d=j(b.currentTarget).attr("data-id"),a=undefined;if(c!=null&&c!=""){a=Boards.get(d);a.set({title:c}).save()}},openBoard:function(){var a=j(".board-list").find(".selected"),b=this;if(a.length){var c=a.data("id");currentBoard=Boards.get(c);Stickies.fetch({success:function(e,d){j(".stickies").empty();document.title=(currentBoard.get("title")+" • Quadro");e.trigger("reset");b.close()}});Quadro.views.workspaceView.shareMenuView.render(true)}},createBoard:function(a){var b=prompt("Enter a title:");if(b==""||b==null){return}Boards.create({title:b},{success:function(d,c,f){var e=JST["boards/board"].call(d.toJSON());j(e).css("display","none").appendTo(".board-list").slideDown()}})},removeBoard:function(c){var a=j(".board-list").find(".selected");if(a.length){var e=a.data("id"),b=Boards.get(e),d=confirm("Are you sure?");if(d){b.destroy({success:function(g,f){a.slideUp()},error:function(g,i,h){var f=JSON.parse(i.responseText);alert(f.message)}})}}c.preventDefault()},open:function(){var a=j(this.el);a.find(".well").fadeIn("fast",function(){a.find(".modal").fadeIn("fast")});return false},close:function(){var a=j(this.el);a.find(".modal").fadeOut("fast",function(){a.find(".well").fadeOut("fast")});return false},render:function(){this.boards=Boards.map(function(a){return JST["boards/board"].call(a.toJSON())});j(this.el).html(this.template({boards:this.boards}));j(this.el).find(".modal").css({position:"absolute",left:(j(window).width()-380)/2}).draggable({handle:".modal-header",containment:"window"});return this}});var currentRequests={};j.ajaxPrefilter(function(a,d,c){var b=j("meta[name='csrf-token']").attr("content");if(currentRequests[a.url]){currentRequests[a.url].abort()}c.setRequestHeader("X-CSRF-Token",b);currentRequests[a.url]=c});j.ajaxSetup({beforeSend:function(){if(j(".workspace:visible").length){j(".mini_loader").css("visibility","visible")}},complete:function(){if(j(".workspace:visible").length){j(".mini_loader").css("visibility","hidden")}}});window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;console.log(Array.prototype.slice.call(arguments))}};function formatContent(a){var b=j("<div/>");_.each(a.split("\n"),function(c){var d=j("<p/>");if(c==""){d.html("<br>")}else{d.text(c)}d.appendTo(b)});return b.html()}function zIndexMax(){var a=0;j(".sticky").each(function(){var b=parseInt(j(this).css("z-index"));if(b>a){a=b}});return a+1}function setSelection(a){setTimeout(function(){var c,b;if(window.getSelection&&document.createRange){b=document.createRange();b.selectNodeContents(a);b.collapse(true);c=window.getSelection();c.removeAllRanges();c.addRange(b)}else{if(document.body.createTextRange){b=document.body.createTextRange();b.moveToElementText(a);b.collapse(true);b.select()}}},1)}function isOverlapping(c){var d=j(".sticky").not(c),b=c.offset(),a=false;d.each(function(){var e=j(this).offset();if(Math.abs(e.top-b.top)<=j(this).outerHeight()&&Math.abs(e.left-b.left)<=j(this).outerWidth()){a=true}});return a}j(function(){_.extend(Quadro,{readonly:j(document.body).data("readonly"),board_id:j(document.body).data("board-id")});if(Quadro.authenticated||Quadro.readonly){currentBoard=Boards.get(Quadro.board_id)||Boards.first();Quadro.views.workspaceView=new WorkspaceView().render();j(Quadro.views.workspaceView.el).prependTo("#app");if(Quadro.readonly){Quadro.views.workspaceView.setReadonly()}Stickies.trigger("reset");j(window).load(function(){j(document.body).removeClass("noise");j("#loading").fadeOut()})}else{Quadro.views.loginView=new LoginView().render();j(Quadro.views.loginView.el).prependTo("#app")}});