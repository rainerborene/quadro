 /*
 * Fallr v1.0.5 - jQuery Plugin
 * Simple & elegant modal box jQuery plugin
 *
 * Copyright 2011 amatyr4n
 * http://codecanyon.net/user/amatyr4n
 *
 * licensed under Envato licenses
 * http://wiki.envato.com/support/legal-terms/licensing-terms/
 *
 * Any suggestions, bug report, or whatever feedback are welcome :)
 */

(function ($) {
  var defaults = {
    buttons: {
      button1: {
        text: 'OK',
        danger: false,
        onclick: function () {
          $.fallr('hide');
        }
      }
    },
    icon: 'check',
    content: 'Hello',
    position: 'top',
    closeKey: false,
    closeOverlay: false,
    useOverlay: true,
    autoclose: false,
    easingDuration: 300,
    easingIn: 'swing',
    easingOut: 'swing',
    height: 'auto',
    width: '360px',
    zIndex: 100
  },
  opts, $w = $(window),
  methods = {
    hide: function (options, callback, self) {
      if (helpers.isActive()) {
        $('#fallr-wrapper').stop(true, true);
        var $f = $('#fallr-wrapper'),
        pos = $f.css('position'),
        yminpos = 0;
        switch (opts.position) {
          case 'bottom':
          case 'center':
            yminpos = ((pos === 'fixed') ? $w.height() : $f.offset().top + $f.height()) + 10;
            break;
          default:
            yminpos = ((pos === 'fixed') ? (-1) * ($f.outerHeight()) : $f.offset().top) - 10
        };
        $f.animate({ 'top': (yminpos) }, (opts.easingDuration || opts.duration), opts.easingOut, function () {
          if ($.browser.msie) {
            $('#fallr-overlay').css('display', 'none')
          } else {
            $('#fallr-overlay').fadeOut('fast')
          };
          $f.remove();
          if (typeof callback === "function") {
            callback.call(self)
          }
        });
        $(document).unbind('keydown', helpers.enterKeyHandler).unbind('keydown', helpers.closeKeyHandler).unbind('keydown', helpers.tabKeyHandler)
      }
    },
    resize: function (options, callback, self) {
      var $f = $('#fallr-wrapper'),
      newWidth = parseInt(options.width, 10),
      newHeight = parseInt(options.height, 10),
      diffWidth = Math.abs($f.outerWidth() - newWidth),
      diffHeight = Math.abs($f.outerHeight() - newHeight);
      if (helpers.isActive() && (diffWidth > 5 || diffHeight > 5)) {
        $f.animate({
          'width': newWidth
        }, function () {
          $(this).animate({
            'height': newHeight
          }, function () {
            helpers.fixPos()
          })
        });
        $('#fallr').animate({
          'width': newWidth - 94
        }, function () {
          $(this).animate({
            'height': newHeight - 131
          }, function () {
            if (typeof callback === "function") {
              callback.call(self)
            } }) })
      }
    },
    show: function (options, callback, self) {
      if (helpers.isActive()) {
        $.error('Can\'t create new message with content: "' + options.content + '", past message with content "' + opts.content + '" is still active')
      } else {
        opts = $.extend({}, defaults, options);
        $('<div id="fallr-wrapper"></div>').appendTo('body');
        var $f = $('#fallr-wrapper'),
        $o = $('#fallr-overlay');
        $f.css({
          'width': opts.width,
          'height': opts.height,
          'position': 'absolute',
          'top': '-9999px',
          'left': '-9999px'
        }).html('<div id="fallr-icon"></div>' + '<div id="fallr"></div>' + '<div id="fallr-buttons"></div>').find('#fallr-icon').addClass('icon-' + opts.icon).end().find('#fallr').html(opts.content).css({
          'height': (opts.height == 'auto') ? 'auto' : $f.height() - 131,
          'width': $f.width() - 94
        }).end().find('#fallr-buttons').html((function () {
          var buttons = '';
          var i;
          for (i in opts.buttons) {
            if (opts.buttons.hasOwnProperty(i)) {
              klass = (opts.buttons[i].className || "");
              buttons = buttons + '<a href="#" class="fallr-button ' + (opts.buttons[i].danger ? 'fallr-button-danger' : '') + klass + '" id="fallr-button-' + i + '">' + opts.buttons[i].text + '</a>'
            }
          };
          return buttons
        }())).find('.fallr-button').bind('click', function (event) {
          var buttonId = $(this).attr('id').substring(13);
          if (typeof opts.buttons[buttonId].onclick === 'function' && opts.buttons[buttonId].onclick != false) {
            var scope = document.getElementById('fallr');
            opts.buttons[buttonId].onclick.apply(scope)
          } else {
            methods.hide()
          };
          event.preventDefault();
          return false;
        });
        var showFallr = function () {
          $f.show();
          var xpos = ($w.width() - $f.outerWidth()) / 2 + $w.scrollLeft(),
          yminpos, ymaxpos, pos = ($w.height() > $f.height() && $w.width() > $f.width()) ? 'fixed' : 'absolute';
          switch (opts.position) {
            case 'bottom':
              yminpos = (pos === 'fixed') ? $w.height() : $w.scrollTop() + $w.height();
              ymaxpos = yminpos - $f.outerHeight();
              break;
            case 'center':
              yminpos = (pos === 'fixed') ? (-1) * $f.outerHeight() : $o.offset().top - $f.outerHeight();
              ymaxpos = yminpos + $f.outerHeight() + (($w.height() - $f.outerHeight()) / 2);
              break;
            default:
              ymaxpos = (pos === 'fixed') ? 32 : $w.scrollTop();
              yminpos = ymaxpos - $f.outerHeight()
          };
          $f.css({
            'left': xpos,
            'position': pos,
            'top': yminpos,
            'z-index': opts.zIndex + 1
          }).animate({
            'top': ymaxpos
          }, opts.easingDuration, opts.easingIn, function () {
            if (typeof callback === "function") {
              callback.call(self)
            };
            if (opts.autoclose) {
              setTimeout(methods.hide, opts.autoclose)
            }
          })
        };
        if (opts.useOverlay) {
          if ($.browser.msie && $.browser.version < 9) {
            $o.css({
              'display': 'block',
              'z-index': opts.zIndex
            });
            showFallr()
          } else {
            $o.css({
              'z-index': opts.zIndex
            }).fadeIn(showFallr)
          }
        } else {
          showFallr()
        };
        $(document).bind('keydown', helpers.enterKeyHandler).bind('keydown', helpers.closeKeyHandler).bind('keydown', helpers.tabKeyHandler);
        $('#fallr-buttons').children().eq(-1).bind('focus', function () {
          $(this).bind('keydown', helpers.tabKeyHandler)
        });
        $f.find(':input').bind('focus', function () {
          $(document).unbind('keydown', helpers.enterKeyHandler).unbind('keydown', helpers.tabKeyHandler)
        })
      }
    },
    set: function (options, callback, self) {
      for (var i in options) {
        if (options.hasOwnProperty(i)) {
          defaults[i] = options[i];
          opts[i] = options[i]
        }
      };
      if (typeof callback === "function") {
        callback.call(self)
      }
    }
  },
  helpers = {
    blink: function () {
      $('#fallr-wrapper').fadeOut(150, function () {
        $(this).fadeIn(150)
      })
    },
    fixPos: function () {
      var $f = $('#fallr-wrapper'),
      pos = $f.css('position');
      if ($w.width() > $f.outerWidth() && $w.height() > $f.outerHeight()) {
        var newLeft = ($w.width() - $f.outerWidth()) / 2,
        newTop = $w.height() - $f.outerHeight();
        switch (opts.position) {
          case 'center':
            newTop = newTop / 2;
            break;
          case 'bottom':
            break;
          default:
            newTop = 32;
        };
        if (pos == 'fixed') {
          $f.animate({
            'left': newLeft
          }, function () {
            $(this).animate({
              'top': newTop
            })
          })
        } else {
          $f.css({
            'position': 'fixed',
            'left': newLeft,
            'top': newTop
          })
        }
      } else {
        var newLeft = ($w.width() - $f.outerWidth()) / 2 + $w.scrollLeft();
        var newTop = $w.scrollTop();
        if (pos != 'fixed') {
          $f.animate({
            'left': newLeft
          }, function () {
            $(this).animate({
              'top': newTop
            })
          })
        } else {
          $f.css({
            'position': 'absolute',
            'top': newTop,
            'left': (newLeft > 0 ? newLeft : 0)
          })
        }
      }
    },
    isActive: function () {
      return !!($('#fallr-wrapper').length > 0)
    },
    enterKeyHandler: function (e) {
      if (e.keyCode === 13) {
        $('#fallr-buttons').children().eq(0).focus();
        $(document).unbind('keydown', helpers.enterKeyHandler);
        $(document).unbind('keydown', helpers.tabKeyHandler)
      }
    },
    tabKeyHandler: function (e) {
      if (e.keyCode === 9) {
        $('#fallr-wrapper').find(':input, .fallr-button').eq(0).focus();
        $(document).unbind('keydown', helpers.enterKeyHandler);
        $(document).unbind('keydown', helpers.tabKeyHandler);
        e.preventDefault();
      }
    },
    closeKeyHandler: function (e) {
      if (e.keyCode === 27 && opts.closeKey) {
        methods.hide();
      }
    }
  };
  $(document).ready(function () {
    $('body').append('<div id="fallr-overlay"></div>');
    $('#fallr-overlay').bind('click', function () {
      if (opts.closeOverlay) {
        methods.hide();
      } else {
        helpers.blink();
      }
    })
  });
  $(window).resize(function () {
    if (helpers.isActive()) {
      helpers.fixPos();
    }
  });
  $.fallr = function (method, options, callback) {
    var self = window;
    if (typeof method === 'object') {
      options = method;
      method = 'show'
    };
    if (methods[method]) {
      if (typeof options === 'function') {
        callback = options;
        options = null
      };
      methods[method](options, callback, self)
    } else {
      $.error('Method "' + method + '" does not exist in $.fallr')
    }
  }
}(jQuery));
