var j=jQuery;var Quadro={views:{}};var WorkspaceView=Backbone.View.extend({className:"workspace",template:JST["home/workspace"],events:{"click .new":"createSticky","click .boards":"openBoardsModal","click .share":"openSharePopover","click .feedback":"openUserVoice","click .quick-view":"toggleQuickView"},initialize:function(){_.bindAll(this,"render","addOne","addAll","manipulateClipboard");Stickies.bind("add",this.addOne);Stickies.bind("reset",this.addAll);Boards.bind("change:title",this.didChangeTitle);j(document).bind("paste",this.manipulateClipboard);j(document).bind("dblclick",this.createSticky)},openSharePopover:function(a){this.shareView.toggle();j(a.currentTarget).parent().toggleClass("active");a.preventDefault()},toggleQuickView:function(c){var b=j(c.currentTarget),a=this.$(".topbar");if(a.css("display")=="none"){b.animate({opacity:0.2});a.stop().css("display","block").animate({top:0});j.cookie("__quick_view","false")}else{a.stop().animate({top:(a.height()+4)*-1},function(){j(this).css("display","none")});b.animate({opacity:0.5});j.cookie("__quick_view","true")}},setReadonly:function(){j("html, body").css("overflow","auto")},didChangeTitle:function(a,b){j(".board-list").find("li[data-id="+a.id+"] .item-title").text(b)},openBoardsModal:function(b){var a=j(b.currentTarget);if(a.parent().next().hasClass("active")){a.parent().next().find("a").trigger("click")}b.preventDefault()},openUserVoice:function(a){a.preventDefault();UserVoice.showPopupWidget()},manipulateClipboard:function(a){var b=a.target.tagName=="BR"?j(a.target).parent():j(a.target);setTimeout(function(){b.find(":not(p,br)").each(function(){j(this).replaceWith("<p>"+j(this).text()+"</p>")})},1)},addOne:function(c){var b=new StickyView({model:c}).render();var a=j(b.el).appendTo(".stickies").css({top:c.get("top"),left:c.get("left")});a.find(".content").andSelf().css({width:c.get("width"),height:c.get("height")});a.show()},addAll:function(){Stickies.each(this.addOne)},createSticky:function(c){if(Quadro.readonly){return}var a=new Sticky(),b=new StickyView({model:a}).render(),d=zIndexMax();a.collection=Stickies;if(c.type=="dblclick"){if(c.target!=document.body){return}j(b.el).css({top:c.layerY,left:c.layerX})}else{j(b.el).css({left:(j(window).width()-340)*Math.random(),top:Math.max(60,parseInt((j(window).height()-250)*Math.random()))})}a.set({top:j(b.el).position().top,left:j(b.el).position().left,z_index:d});j(b.el).appendTo(".stickies").css("zIndex",d).fadeIn(function(){j(this).css({height:"auto"})});c.preventDefault()},render:function(){j(this.el).html(this.template());if(j.cookie("__quick_view")=="true"){this.$(".quick-view").css("opacity",0.5);this.$(".topbar").css({display:"none",top:-45})}if(_.isUndefined(this.boardsView)){this.boardsView=new BoardsView().render();j(this.boardsView.el).appendTo("#app")}if(_.isUndefined(this.shareView)){this.shareView=new ShareView().render();j(this.shareView.el).appendTo("#app")}return this}});var ShareView=Backbone.View.extend({className:"share-view popover below hide",template:JST["boards/share"],events:{"click #share-public":"togglePublished","click .delete-collaboration":"destroyCollaboration","keypress #username":"lookupUsername","submit form":"preventSubmit"},initialize:function(){_.bindAll(this,"render","toggle","closePopover");j(document).bind("click",this.closePopover)},preventSubmit:function(a){a.preventDefault()},closePopover:function(a){if(!j(a.target).parents(".topbar, .share-view").length&&j(this.el).is(":not(:animated)")){j(this.el).fadeOut("fast");j(".share").parent().removeClass("active")}},destroyCollaboration:function(c){var b=j(c.currentTarget).parent(),d=b.data("id"),a=currentBoard.collaborators.get(d);j(c.currentTarget).attr("disabled","disabled");a.destroy({success:function(){b.fadeOut("fast",function(){b.remove()})}});currentBoard.collaborators.remove(a);c.preventDefault()},lookupUsername:function(e){if(e.keyCode==13){var d=this,a=j(e.currentTarget),f=a.val().replace(/@/g,""),c=(f!==""&&f!==Quadro.nickname),b=currentBoard.collaborators.detect(function(g){return g.get("nickname").toLowerCase()==f.toLowerCase()});if(!b&&c){a.attr("disabled","disabled");currentBoard.collaborators.create({username:f},{error:function(){a.removeAttr("disabled").css({backgroundColor:"#D83A2E",color:"#ffffff"}).animate({backgroundColor:"#ffffff",color:"#808080"},"slow").trigger("focus")},success:function(i,h,m){var k=JST["boards/collaborator"],o=j(".collaborators"),n=j("#username"),l=j(k({item:h})),g=Math.abs(o[0].scrollHeight-o.height())-o.scrollTop()+25;l.css("display","none");o.append(l).animate({scrollTop:"+="+g},"slow");l.fadeIn();n.val("").removeAttr("disabled")}})}}},toggle:function(){j(this.el).fadeToggle("fast")},togglePublished:function(b){var a=b.currentTarget.checked;currentBoard.set({share_public:a}).save()},render:function(){j(this.el).html(this.template(currentBoard.toJSON()));return this}});_.mixin({capitalize:function(a){return a.charAt(0).toUpperCase()+a.substring(1).toLowerCase()}});var Sticky=Backbone.Model.extend({defaults:{content:"Getting Started\n\nJust click and start writing. Choose different note colors using the right mouse button upon the note.",top:100,left:100,width:300,height:200,color:"yellow",z_index:0},url:function(){return"/boards/"+currentBoard.id+"/stickies"+(this.isNew()?"":"/"+this.id)},toJSON:function(){var a=_.clone(this.attributes);return _.extend(a,{cid:_.bind(function(){return this.cid.match(/\d+/)[0]},this),formattedContent:function(){return formatContent(this.content)}})}});var StickyCollection=Backbone.Collection.extend({model:Sticky,localStorage:new Store("stickies")}),Stickies=window.Stickies=new StickyCollection;Stickies.url=function(){return"/boards/"+currentBoard.id+"/stickies"};var StickyView=Backbone.View.extend({className:"sticky unselectable",template:JST["stickies/sticky"],events:{"click .remove":"remove","focus .content":"setContentEditable","blur .content":"unsetContentEditable",contextmenu:"openContextMenu",dragstop:"updateStickyPosition",dragstart:"closeContextMenu",click:"bringToFront"},initialize:function(){_.bindAll(this,"render")},bringToFront:function(c){var b=j(this.el).css("z-index"),a=zIndexMax();if(parseInt(b)!=a-1&&isOverlapping(j(this.el))){this.model.set({z_index:a}).save();j(this.el).css("zIndex",a)}},openContextMenu:function(a){a.preventDefault();StickyContextMenuView.context(this).open(a.pageX,a.pageY)},closeContextMenu:function(){StickyContextMenuView.close()},updateStickyPosition:function(b,c){var a=this;this.model.set({top:c.offset.top,left:c.offset.left}).save({},{error:function(d,e){if(e.statusText!=="abort"){a.close()}}})},setContentEditable:function(b){var a=j(b.currentTarget);this.bringToFront();if(a.text().replace(/\n+/,"")==this.model.defaults.content.replace(/\n+/,"")){a.text("");setSelection(b.currentTarget)}a.removeClass("unselectable").attr("contenteditable","true");j(this.el).removeClass("unselectable");b.preventDefault()},unsetContentEditable:function(c){var b=[],a=j(this.el).find(".content p");j(c.currentTarget).addClass("unselectable").attr("contenteditable","false");j(this.el).addClass("unselectable");if(a.length){a.each(function(){b.push(j(this).text())});b=b.join("\n")}else{b=this.$(".content").text()}if(!j.trim(b).length){b=this.model.defaults.content;this.$(".content").empty().append(j("<p/>").text(b))}if(this.model.get("content")!==b){this.model.set({content:b}).save()}},close:function(){j(this.el).fadeOut(function(){j(this).remove()})},remove:function(b){var a=this;if(b&&"preventDefault" in b){b.preventDefault()}this.model.destroy({success:function(){a.close()}});if(this.model.isNew()){this.close()}},render:function(){var a=this;j(this.el).addClass(this.model.get("color")).html(this.template(this.model.toJSON())).css({position:"absolute",zIndex:this.model.get("z_index")}).draggable({containment:"window",cancel:".content",stack:".sticky"}).resizable({handles:"se",minHeight:200,minWidth:300,resize:function(b,c){j(c.element).find(".content").css({width:c.size.width,height:c.size.height})},stop:function(b,c){a.model.set({width:c.size.width,height:c.size.height}).save()}});if(Quadro.readonly==true){j(this.el).removeClass("unselectable").unbind();this.$(".remove, .ui-resizable-handle").remove();this.$(".content").removeClass("unselectable")}if(j(".sticky:last").hasClass("even")==false){j(this.el).addClass("even")}return this}});var ContextMenu=Backbone.View.extend({tagName:"ul",className:"colors",events:{"click li":"changeColor"},initialize:function(){_.bindAll(this,"render","close");j(document).bind("click",this.close)},context:function(a){this.sticky=a;return this},open:function(a,b){j(this.el).css({top:b,left:a,zIndex:998}).fadeIn(1)},colors:["yellow","blue","green","pink","purple","gray"],changeColor:function(c){var a=j(c.currentTarget).data("color"),b=this;_.each(this.colors,function(d){j(b.sticky.el).removeClass(d)});this.sticky.model.set({color:a}).save();j(this.sticky.el).addClass(this.sticky.model.get("color"))},close:function(){j(this.el).fadeOut("fast")},render:function(){var a=this;_.each(this.colors,function(d){var b=a.make("li",{"data-color":d},_(d).capitalize());$(b).appendTo(a.el)});j(this.el).prependTo("#app");return this}});var StickyContextMenuView=new ContextMenu().render();var Collaborator=Backbone.Model.extend({}),CollaboratorCollection=Backbone.Collection.extend({model:Collaborator});var Board=Backbone.Model.extend({urlRoot:"/boards",defaults:{title:"Untitled",share_public:false,secret_token:guid()},initialize:function(){this.collaborators=new CollaboratorCollection;this.collaborators.url="/boards/"+this.id+"/collaborators";this.collaborators.reset(this.attributes.collaborators)},toJSON:function(){var a=_.clone(this.attributes);a.collaborators=this.collaborators.toJSON();return a}});var BoardCollection=Backbone.Collection.extend({model:Board}),Boards=window.Boards=new BoardCollection,currentBoard=null;var BoardsView=Backbone.View.extend({id:"boards-modal",className:"modal unselectable hide fade",template:JST["boards/boards"],events:{"click .new-board":"newBoard","blur .title-field":"saveWhenBlur","keypress .title-field":"saveWhenEnter","click .remove-board":"removeBoard","click .open-board":"openBoard","click .board-list li":"selectItem","dblclick .board-list li":"changeTitle",},initialize:function(){_.bindAll(this,"render","saveBoard")},selectItem:function(a){j(a.currentTarget).siblings().removeClass("selected");j(a.currentTarget).addClass("selected");this.$("button[disabled]").removeAttr("disabled")},openBoard:function(d){var b=j(".board-list").find(".selected"),a=j(d.currentTarget),c=this;if(b.length){var e=b.data("id");currentBoard=Boards.get(e);a.attr("disabled","disabled");Stickies.fetch({success:function(g,f){j(".stickies").empty();updateWindowTitle();g.trigger("reset");a.removeAttr("disabled");j(c.el).modal(true).hide()}});Quadro.views.workspaceView.shareView.render()}},changeTitle:function(c){var a=this.make("input",{"class":"title-field",maxlength:28}),b=j(c.currentTarget),d=b.attr("data-id");a.value=b.find(".item-title").text();b.find(".item-title").replaceWith(a);b.data("replaced",false);a.focus()},newBoard:function(d){var b=JST["boards/board"](),a=this.make("input",{"class":"title-field",maxlength:28}),c=j(b);j(".board-list").find(".selected").removeClass("selected");c.css("display","none").find(".item-title").replaceWith(a).end().appendTo(".board-list").trigger("click").slideDown();c.find("input").focus()},saveWhenBlur:function(a){this.saveBoard(j(a.currentTarget))},saveWhenEnter:function(a){if(a.type=="keypress"&&a.keyCode=="13"){this.saveBoard(j(a.currentTarget))}},saveBoard:function(a){var d=a.parent(),e=a.val()||"Untitled",f=a.parent().attr("data-id"),c=this.make("span",{"class":"item-title"},e);if(a.parent().data("replaced")){return}var b={success:function(h,g,i){d.attr("data-id",g.id);if(g.id==currentBoard.id){currentBoard.set({title:g.title});updateWindowTitle()}},error:function(){d.parent().slideUp()}};a.parent().data("replaced",true);a.replaceWith(c);if(f==""){Boards.create({title:e},b)}else{Boards.get(f).save({title:e},b)}},removeBoard:function(d){var b=j(".board-list").find(".selected"),a=j(d.currentTarget);if(b.length){var f=b.data("id"),c=Boards.get(f),e=confirm("Are you sure?");if(e){a.attr("disabled","disabled");c.destroy({success:function(h,g){b.slideUp();a.removeAttr("disabled")},error:function(h,k,i){var g=JSON.parse(k.responseText);alert(g.message)}})}}d.preventDefault()},open:function(){var a=j(this.el);j(".boards").parent().addClass("active");a.find(".overlay").css("display","none").fadeIn("fast",function(){a.find(".modal").fadeIn("fast")});return false},render:function(){var a=JST["boards/board"],b=Boards.map(function(c){return a.call(c.toJSON())});j(this.el).html(this.template({boards:b}));return this}});var NotificationView=Backbone.View.extend({className:"alert-message warning",template:JST["notifications/notification"],pool:[],events:{"click .close":"close"},initialize:function(){_.bindAll(this,"render","open","openWithMessage","redraw");j(window).bind("resize",this.redraw)},redraw:function(){var a=Math.max(0,(j(window).width()-640)/2);j(this.el).css("left",a)},openWithMessage:function(b,a){this.pool.push({message:b,type:a||"warning"});this.open()},open:function(){if(j(this.el).is(":visible")){return}var a=this.pool.shift();if(!_.isUndefined(a)){j(this.el).find("p").html(a.message).end().removeClass("error").removeClass("warning").removeClass("info").addClass(a.type);j(this.el).slideDown("slow");this.timeoutId=setTimeout(this.close,4000)}},close:function(a){if(!_.isUndefined(a)){a.preventDefault()}clearTimeout(this.timeoutId);j(this.el).slideUp("slow",this.open)},render:function(){j(this.el).html(this.template());j(window).trigger("resize");return this}});function showMessage(c,b){var a=Quadro.views.notificationView;return a.openWithMessage(c,b)}var currentRequests={};j.ajaxPrefilter(function(a,d,c){var b=j("meta[name='csrf-token']").attr("content");if(currentRequests[a.url]){currentRequests[a.url].abort()}c.setRequestHeader("X-CSRF-Token",b);currentRequests[a.url]=c});j.ajaxSetup({beforeSend:function(){if(j(".workspace:visible").length){j(".mini-loader").css("display","block")}},complete:function(){if(j(".workspace:visible").length){j(".mini-loader").css("display","none")}}});window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;console.log(Array.prototype.slice.call(arguments))}};function formatContent(a){var b=j("<div/>");_.each(a.split("\n"),function(c){var d=j("<p/>");if(c==""){d.html("<br>")}else{d.text(c)}d.appendTo(b)});return b.html()}function zIndexMax(){var a=0;j(".sticky").each(function(){var b=parseInt(j(this).css("z-index"));if(b>a){a=b}});return a+1}function setSelection(a){setTimeout(function(){var c,b;if(window.getSelection&&document.createRange){b=document.createRange();b.selectNodeContents(a);b.collapse(true);c=window.getSelection();c.removeAllRanges();c.addRange(b)}else{if(document.body.createTextRange){b=document.body.createTextRange();b.moveToElementText(a);b.collapse(true);b.select()}}},1)}function isOverlapping(e){var f=j(".sticky").not(e),d=e.offset(),c=d.left+e.outerWidth(),b=d.top+e.outerHeight(),a=false;f.each(function(){var i=j(this).offset(),h=i.left+j(this).outerWidth(),g=i.top+j(this).outerHeight();if(i.left>c||h<d.left){return}else{if(i.top>b||g<d.top){return}}if(d.left<h&&c>d.left&&d.top<g&&b>i.top){a=true}});return a}function updateWindowTitle(){document.title=(currentBoard.get("title")+" • Quadro")}j(function(){_.extend(Quadro,{readonly:j("#app").data("readonly"),board_id:j("#app").data("board-id")});if(!Quadro.authenticated&&!Quadro.readonly){Backbone.localStorage();Stickies.fetch()}currentBoard=Boards.get(Quadro.board_id)||new Board();Quadro.views.workspaceView=new WorkspaceView().render();j(Quadro.views.workspaceView.el).prependTo("#app");if(Quadro.readonly){Quadro.views.workspaceView.setReadonly()}Stickies.trigger("reset");j(window).load(function(){j("#loading").fadeOut()})});