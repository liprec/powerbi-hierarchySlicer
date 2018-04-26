/**
 * jQuery CSS Customizable Scrollbar
 *
 * Copyright 2014, Yuriy Khabarov
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * If you found bug, please contact me via email <13real008@gmail.com>
 *
 * @author Yuriy Khabarov aka Gromo
 * @version 0.2.5
 * @url https://github.com/gromo/jquery.scrollbar/
 *
 */
;
(function ($, doc, win) {
    'use strict';

    // init flags & variables
    var debug = false;
    var lmb = 1, px = "px";

    var browser = {
        "data": {},
        "macosx": win.navigator.platform.toLowerCase().indexOf('mac') !== -1,
        "mobile": /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(win.navigator.userAgent),
        "overlay": null,
        "scroll": null,
        "scrolls": [],
        "webkit": /WebKit/.test(win.navigator.userAgent),

        "log": debug ? function (data, toString) {
            var output = data;
            if (toString && typeof data != "string") {
                output = [];
                $.each(data, function (i, v) {
                    output.push('"' + i + '": ' + v);
                });
                output = output.join(", ");
            }
            if (win.console && win.console.log) {
                win.console.log(output);
            } else {
                alert(output);
            }
        } : function () {

        }
    };

    var defaults = {
        "autoScrollSize": true,     // automatically calculate scrollsize
        "autoUpdate": true,         // update scrollbar if content/container size changed
        "debug": false,             // debug mode
        "disableBodyScroll": false, // disable body scroll if mouse over container
        "duration": 200,            // scroll animate duration in ms
        "ignoreMobile": true,       // ignore mobile devices
        "ignoreOverlay": true,      // ignore browsers with overlay scrollbars (mobile, MacOS)
        "scrollStep": 30,           // scroll step for scrollbar arrows
        "showArrows": false,        // add class to show arrows
        "stepScrolling": true,      // when scrolling to scrollbar mousedown position
        "type": "simple",            // [advanced|simple] scrollbar html type

        "scrollx": null,            // horizontal scroll element
        "scrolly": null,            // vertical scroll element

        "onDestroy": null,          // callback function on destroy,
        "onInit": null,             // callback function on first initialization
        "onScroll": null,           // callback function on content scrolling
        "onUpdate": null            // callback function on init/resize (before scrollbar size calculation)
    };


    var customScrollbar = function (container, options) {

        if (!browser.scroll) {
            browser.log("Init jQuery Scrollbar v0.2.5");
            browser.overlay = isScrollOverlaysContent();
            browser.scroll = getBrowserScrollSize();
            updateScrollbars();

            $(win).resize(function () {
                var forceUpdate = false;
                if (browser.scroll && (browser.scroll.height || browser.scroll.width)) {
                    var scroll = getBrowserScrollSize();
                    if (scroll.height != browser.scroll.height || scroll.width != browser.scroll.width) {
                        browser.scroll = scroll;
                        forceUpdate = true; // handle page zoom
                    }
                }
                updateScrollbars(forceUpdate);
            });
        }

        this.container = container;
        this.options = $.extend({}, defaults, win.jQueryScrollbarOptions || {});
        this.scrollTo = null;
        this.scrollx = {};
        this.scrolly = {};

        this.init(options);
    };

    customScrollbar.prototype = {

        destroy: function () {

            if (!this.wrapper) {
                return;
            }

            // init variables
            var scrollLeft = this.container.scrollLeft();
            var scrollTop = this.container.scrollTop();

            this.container.insertBefore(this.wrapper).css({
                "height": "",
                "margin": ""
            })
            .removeClass("scroll-content")
            .removeClass("scroll-scrollx_visible")
            .removeClass("scroll-scrolly_visible")
            .off(".scrollbar")
            .scrollLeft(scrollLeft)
            .scrollTop(scrollTop);

            this.scrollx.scrollbar.removeClass("scroll-scrollx_visible").find("div").andSelf().off(".scrollbar");
            this.scrolly.scrollbar.removeClass("scroll-scrolly_visible").find("div").andSelf().off(".scrollbar");

            this.wrapper.remove();

            $(doc).add("body").off(".scrollbar");

            if ($.isFunction(this.options.onDestroy))
                this.options.onDestroy.apply(this, [this.container]);
        },



        getScrollbar: function (d) {

            var scrollbar = this.options["scroll" + d];
            var html = {
                "advanced":
                '<div class="scroll-element_corner"></div>' +
                '<div class="scroll-arrow scroll-arrow_less"></div>' +
                '<div class="scroll-arrow scroll-arrow_more"></div>' +
                '<div class="scroll-element_outer">' +
                '    <div class="scroll-element_size"></div>' + // required! used for scrollbar size calculation !
                '    <div class="scroll-element_inner-wrapper">' +
                '        <div class="scroll-element_inner scroll-element_track">' + // used for handling scrollbar click
                '            <div class="scroll-element_inner-bottom"></div>' +
                '        </div>' +
                '    </div>' +
                '    <div class="scroll-bar">' +
                '        <div class="scroll-bar_body">' +
                '            <div class="scroll-bar_body-inner"></div>' +
                '        </div>' +
                '        <div class="scroll-bar_bottom"></div>' +
                '        <div class="scroll-bar_center"></div>' +
                '    </div>' +
                '</div>',

                "simple":
                '<div class="scroll-element_outer">' +
                '    <div class="scroll-element_size"></div>' + // required! used for scrollbar size calculation !
                '    <div class="scroll-element_track"></div>' + // used for handling scrollbar click
                '    <div class="scroll-bar"></div>' +
                '</div>'
            };
            var type = html[this.options.type] ? this.options.type : "advanced";

            if (scrollbar) {
                if (typeof (scrollbar) == "string") {
                    scrollbar = $(scrollbar).appendTo(this.wrapper);
                } else {
                    scrollbar = $(scrollbar);
                }
            } else {
                scrollbar = $("<div>").addClass("scroll-element").html(html[type]).appendTo(this.wrapper);
            }

            if (this.options.showArrows) {
                scrollbar.addClass("scroll-element_arrows_visible");
            }

            return scrollbar.addClass("scroll-" + d);
        },



        init: function (options) {

            // init variables
            var S = this;

            var c = this.container;
            var cw = this.containerWrapper || c;
            var o = $.extend(this.options, options || {});
            var s = {
                "x": this.scrollx,
                "y": this.scrolly
            };
            var w = this.wrapper;

            var initScroll = {
                "scrollLeft": c.scrollLeft(),
                "scrollTop": c.scrollTop()
            };

            // do not init if in ignorable browser
            if ((browser.mobile && o.ignoreMobile)
                    || (browser.overlay && o.ignoreOverlay)
                    || (browser.macosx && !browser.webkit) // still required to ignore nonWebKit browsers on Mac
                    ) {
                return false;
            }

            // init scroll container
            if (!w) {
                this.wrapper = w = $('<div>').addClass('scroll-wrapper').addClass(c.attr('class'))
                .css('position', c.css('position') == 'absolute' ? 'absolute' : 'relative')
                .insertBefore(c).append(c);

                if (c.is('textarea')) {
                    this.containerWrapper = cw = $('<div>').insertBefore(c).append(c);
                    w.addClass('scroll-textarea');
                }

                cw.addClass("scroll-content").css({
                    "height": "",
                    "margin-bottom": browser.scroll.height * -1 + px,
                    "margin-right": browser.scroll.width * -1 + px
                });

                c.on("scroll.scrollbar", function (event) {
                    if ($.isFunction(o.onScroll)) {
                        o.onScroll.call(S, {
                            "maxScroll": s.y.maxScrollOffset,
                            "scroll": c.scrollTop(),
                            "size": s.y.size,
                            "visible": s.y.visible
                        }, {
                            "maxScroll": s.x.maxScrollOffset,
                            "scroll": c.scrollLeft(),
                            "size": s.x.size,
                            "visible": s.x.visible
                        });
                    }
                    s.x.isVisible && s.x.scroller.css("left", c.scrollLeft() * s.x.kx + px);
                    s.y.isVisible && s.y.scroller.css("top", c.scrollTop() * s.y.kx + px);
                });

                /* prevent native scrollbars to be visible on #anchor click */
                w.on("scroll", function () {
                    w.scrollTop(0).scrollLeft(0);
                });

                if (o.disableBodyScroll) {
                    var handleMouseScroll = function (event) {
                        isVerticalScroll(event) ?
                        s.y.isVisible && s.y.mousewheel(event) :
                        s.x.isVisible && s.x.mousewheel(event);
                    };
                    w.on({
                        "MozMousePixelScroll.scrollbar": handleMouseScroll,
                        "mousewheel.scrollbar": handleMouseScroll
                    });

                    if (browser.mobile) {
                        w.on("touchstart.scrollbar", function (event) {
                            var touch = event.originalEvent.touches && event.originalEvent.touches[0] || event;
                            var originalTouch = {
                                "pageX": touch.pageX,
                                "pageY": touch.pageY
                            };
                            var originalScroll = {
                                "left": c.scrollLeft(),
                                "top": c.scrollTop()
                            };
                            $(doc).on({
                                "touchmove.scrollbar": function (event) {
                                    var touch = event.originalEvent.targetTouches && event.originalEvent.targetTouches[0] || event;
                                    c.scrollLeft(originalScroll.left + originalTouch.pageX - touch.pageX);
                                    c.scrollTop(originalScroll.top + originalTouch.pageY - touch.pageY);
                                    event.preventDefault();
                                },
                                "touchend.scrollbar": function () {
                                    $(doc).off(".scrollbar");
                                }
                            });
                        });
                    }
                }
                if ($.isFunction(o.onInit))
                    o.onInit.apply(this, [c]);
            } else {
                cw.css({
                    "height": "",
                    "margin-bottom": browser.scroll.height * -1 + px,
                    "margin-right": browser.scroll.width * -1 + px
                });
            }

            // init scrollbars & recalculate sizes
            $.each(s, function (d, scrollx) {

                var scrollCallback = null;
                var scrollForward = 1;
                var scrollOffset = (d == "x") ? "scrollLeft" : "scrollTop";
                var scrollStep = o.scrollStep;
                var scrollTo = function () {
                    var currentOffset = c[scrollOffset]();
                    c[scrollOffset](currentOffset + scrollStep);
                    if (scrollForward == 1 && (currentOffset + scrollStep) >= scrollToValue)
                        currentOffset = c[scrollOffset]();
                    if (scrollForward == -1 && (currentOffset + scrollStep) <= scrollToValue)
                        currentOffset = c[scrollOffset]();
                    if (c[scrollOffset]() == currentOffset && scrollCallback) {
                        scrollCallback();
                    }
                }
                var scrollToValue = 0;

                if (!scrollx.scrollbar) {

                    scrollx.scrollbar = S.getScrollbar(d);
                    scrollx.scroller = scrollx.scrollbar.find(".scroll-bar");

                    scrollx.mousewheel = function (event) {

                        if (!scrollx.isVisible || (d == 'x' && isVerticalScroll(event))) {
                            return true;
                        }
                        if (d == 'y' && !isVerticalScroll(event)) {
                            s.x.mousewheel(event);
                            return true;
                        }

                        var delta = event.originalEvent.wheelDelta * -1 || event.originalEvent.detail;
                        var maxScrollValue = scrollx.size - scrollx.visible - scrollx.offset;

                        if (!((scrollToValue <= 0 && delta < 0) || (scrollToValue >= maxScrollValue && delta > 0))) {
                            scrollToValue = scrollToValue + delta;
                            if (scrollToValue < 0)
                                scrollToValue = 0;
                            if (scrollToValue > maxScrollValue)
                                scrollToValue = maxScrollValue;

                            S.scrollTo = S.scrollTo || {};
                            S.scrollTo[scrollOffset] = scrollToValue;
                            setTimeout(function () {
                                if (S.scrollTo) {
                                    c.stop().animate(S.scrollTo, 240, 'linear', function () {
                                        scrollToValue = c[scrollOffset]();
                                    });
                                    S.scrollTo = null;
                                }
                            }, 1);
                        }

                        event.preventDefault();
                        return false;
                    };

                    scrollx.scrollbar.on({
                        "MozMousePixelScroll.scrollbar": scrollx.mousewheel,
                        "mousewheel.scrollbar": scrollx.mousewheel,
                        "mouseenter.scrollbar": function () {
                            scrollToValue = c[scrollOffset]();
                        }
                    });

                    // handle arrows & scroll inner mousedown event
                    scrollx.scrollbar.find(".scroll-arrow, .scroll-element_track")
                    .on("mousedown.scrollbar", function (event) {

                        if (event.which != lmb)
                            return true;

                        scrollForward = 1;

                        var data = {
                            "eventOffset": event[(d == "x") ? "pageX" : "pageY"],
                            "maxScrollValue": scrollx.size - scrollx.visible - scrollx.offset,
                            "scrollbarOffset": scrollx.scroller.offset()[(d == "x") ? "left" : "top"],
                            "scrollbarSize": scrollx.scroller[(d == "x") ? "outerWidth" : "outerHeight"]()
                        };
                        var timeout = 0, timer = 0;

                        if ($(this).hasClass('scroll-arrow')) {
                            scrollForward = $(this).hasClass("scroll-arrow_more") ? 1 : -1;
                            scrollStep = o.scrollStep * scrollForward;
                            scrollToValue = scrollForward > 0 ? data.maxScrollValue : 0;
                        } else {
                            scrollForward = (data.eventOffset > (data.scrollbarOffset + data.scrollbarSize) ? 1
                                : (data.eventOffset < data.scrollbarOffset ? -1 : 0));
                            scrollStep = Math.round(scrollx.visible * 0.75) * scrollForward;
                            scrollToValue = (data.eventOffset - data.scrollbarOffset -
                                (o.stepScrolling ? (scrollForward == 1 ? data.scrollbarSize : 0)
                                    : Math.round(data.scrollbarSize / 2)));
                            scrollToValue = c[scrollOffset]() + (scrollToValue / scrollx.kx);
                        }

                        S.scrollTo = S.scrollTo || {};
                        S.scrollTo[scrollOffset] = o.stepScrolling ? c[scrollOffset]() + scrollStep : scrollToValue;

                        if (o.stepScrolling) {
                            scrollCallback = function () {
                                scrollToValue = c[scrollOffset]();
                                clearInterval(timer);
                                clearTimeout(timeout);
                                timeout = 0;
                                timer = 0;
                            };
                            timeout = setTimeout(function () {
                                timer = setInterval(scrollTo, 40);
                            }, o.duration + 100);
                        }

                        setTimeout(function () {
                            if (S.scrollTo) {
                                c.animate(S.scrollTo, o.duration);
                                S.scrollTo = null;
                            }
                        }, 1);

                        return handleMouseDown(scrollCallback, event);
                    });

                    // handle scrollbar drag'n'drop
                    scrollx.scroller.on("mousedown.scrollbar", function (event) {

                        if (event.which != lmb)
                            return true;

                        var eventPosition = event[(d == "x") ? "pageX" : "pageY"];
                        var initOffset = c[scrollOffset]();

                        scrollx.scrollbar.addClass("scroll-draggable");

                        $(doc).on("mousemove.scrollbar", function (event) {
                            var diff = parseInt((event[(d == "x") ? "pageX" : "pageY"] - eventPosition) / scrollx.kx, 10);
                            c[scrollOffset](initOffset + diff);
                        });

                        return handleMouseDown(function () {
                            scrollx.scrollbar.removeClass("scroll-draggable");
                            scrollToValue = c[scrollOffset]();
                        }, event);
                    });
                }
            });

            // remove classes & reset applied styles
            $.each(s, function (d, scrollx) {
                var scrollClass = "scroll-scroll" + d + "_visible";
                var scrolly = (d == "x") ? s.y : s.x;

                scrollx.scrollbar.removeClass(scrollClass);
                scrolly.scrollbar.removeClass(scrollClass);
                cw.removeClass(scrollClass);
            });

            // calculate init sizes
            $.each(s, function (d, scrollx) {
                $.extend(scrollx, (d == "x") ? {
                    "offset": parseInt(c.css("left"), 10) || 0,
                    "size": c.prop("scrollWidth"),
                    "visible": w.width()
                } : {
                    "offset": parseInt(c.css("top"), 10) || 0,
                    "size": c.prop("scrollHeight"),
                    "visible": w.height()
                });
            });


            var updateScroll = function (d, scrollx) {

                var scrollClass = "scroll-scroll" + d + "_visible";
                var scrolly = (d == "x") ? s.y : s.x;
                var offset = parseInt(c.css((d == "x") ? "left" : "top"), 10) || 0;

                var AreaSize = scrollx.size;
                var AreaVisible = scrollx.visible + offset;

                scrollx.isVisible = (AreaSize - AreaVisible) > 1; // bug in IE9/11 with 1px diff
                if (scrollx.isVisible) {
                    scrollx.scrollbar.addClass(scrollClass);
                    scrolly.scrollbar.addClass(scrollClass);
                    cw.addClass(scrollClass);
                } else {
                    scrollx.scrollbar.removeClass(scrollClass);
                    scrolly.scrollbar.removeClass(scrollClass);
                    cw.removeClass(scrollClass);
                }

                if (d == "y" && (scrollx.isVisible || scrollx.size < scrollx.visible)) {
                    cw.css("height", (AreaVisible + browser.scroll.height) + px);
                }

                if (s.x.size != c.prop("scrollWidth")
                    || s.y.size != c.prop("scrollHeight")
                    || s.x.visible != w.width()
                    || s.y.visible != w.height()
                    || s.x.offset != (parseInt(c.css("left"), 10) || 0)
                    || s.y.offset != (parseInt(c.css("top"), 10) || 0)
                    ) {
                    $.each(s, function (d, scrollx) {
                        $.extend(scrollx, (d == "x") ? {
                            "offset": parseInt(c.css("left"), 10) || 0,
                            "size": c.prop("scrollWidth"),
                            "visible": w.width()
                        } : {
                            "offset": parseInt(c.css("top"), 10) || 0,
                            "size": c.prop("scrollHeight"),
                            "visible": w.height()
                        });
                    });
                    updateScroll(d == "x" ? "y" : "x", scrolly);
                }
            };
            $.each(s, updateScroll);

            if ($.isFunction(o.onUpdate))
                o.onUpdate.apply(this, [c]);

            // calculate scroll size
            $.each(s, function (d, scrollx) {

                var cssOffset = (d == "x") ? "left" : "top";
                var cssFullSize = (d == "x") ? "outerWidth" : "outerHeight";
                var cssSize = (d == "x") ? "width" : "height";
                var offset = parseInt(c.css(cssOffset), 10) || 0;

                var AreaSize = scrollx.size;
                var AreaVisible = scrollx.visible + offset;

                var scrollSize = scrollx.scrollbar.find(".scroll-element_size");
                scrollSize = scrollSize[cssFullSize]() + (parseInt(scrollSize.css(cssOffset), 10) || 0);

                if (o.autoScrollSize) {
                    scrollx.scrollbarSize = parseInt(scrollSize * AreaVisible / AreaSize, 10);
                    scrollx.scroller.css(cssSize, scrollx.scrollbarSize + px);
                }

                scrollx.scrollbarSize = scrollx.scroller[cssFullSize]();
                scrollx.kx = ((scrollSize - scrollx.scrollbarSize) / (AreaSize - AreaVisible)) || 1;
                scrollx.maxScrollOffset = AreaSize - AreaVisible;
            });

            c.scrollLeft(initScroll.scrollLeft).scrollTop(initScroll.scrollTop).trigger("scroll");
        }
    };

    /*
     * Extend jQuery as plugin
     *
     * @param {object|string} options or command to execute
     * @param {object|array} args additional arguments as array []
     */
    $.fn.scrollbar = function (options, args) {

        var toReturn = this;

        if (options === "get")
            toReturn = null;

        this.each(function () {

            var container = $(this);

            if (container.hasClass("scroll-wrapper")
                || container.get(0).nodeName == "body") {
                return true;
            }

            var instance = container.data("scrollbar");
            if (instance) {
                if (options === "get") {
                    toReturn = instance;
                    return false;
                }

                var func = (typeof options == "string" && instance[options]) ? options : "init";
                instance[func].apply(instance, $.isArray(args) ? args : []);

                if (options === "destroy") {
                    container.removeData("scrollbar");
                    while ($.inArray(instance, browser.scrolls) >= 0)
                        browser.scrolls.splice($.inArray(instance, browser.scrolls), 1);
                }
            } else {
                if (typeof options != "string") {
                    instance = new customScrollbar(container, options);
                    container.data("scrollbar", instance);
                    browser.scrolls.push(instance);
                }
            }
            return true;
        });

        return toReturn;
    };

    /**
     * Connect default options to global object
     */
    $.fn.scrollbar.options = defaults;

    /**
     * Extend AngularJS as UI directive
     *
     *
     */
    if (win.angular) {
        (function (angular) {
            var app = angular.module('jQueryScrollbar', []);
            app.directive('jqueryScrollbar', function () {
                return {
                    "link": function (scope, element) {
                        element.scrollbar(scope.options).on('$destroy', function () {
                            element.scrollbar('destroy');
                        });
                    },
                    "restring": "AC",
                    "scope": {
                        "options": "=jqueryScrollbar"
                    }
                };
            });
        })(win.angular);
    }

    /**
     * Check if scroll content/container size is changed
     */
    var timer = 0, timerCounter = 0;
    var updateScrollbars = function (force) {
        var i, c, o, s, w, x, y;
        for (i = 0; i < browser.scrolls.length; i++) {
            s = browser.scrolls[i];
            c = s.container;
            o = s.options;
            w = s.wrapper;
            x = s.scrollx;
            y = s.scrolly;
            if (force || (o.autoUpdate && w && w.is(":visible") &&
                (c.prop("scrollWidth") != x.size
                    || c.prop("scrollHeight") != y.size
                    || w.width() != x.visible
                    || w.height() != y.visible
                    ))) {
                s.init();

                if (debug) {
                    browser.log({
                        "scrollHeight": c.prop("scrollHeight") + ":" + s.scrolly.size,
                        "scrollWidth": c.prop("scrollWidth") + ":" + s.scrollx.size,
                        "visibleHeight": w.height() + ":" + s.scrolly.visible,
                        "visibleWidth": w.width() + ":" + s.scrollx.visible
                    }, true);
                    timerCounter++;
                }
            }
        }
        if (debug && timerCounter > 10) {
            browser.log("Scroll updates exceed 10");
            updateScrollbars = function () { };
        } else {
            clearTimeout(timer);
            timer = setTimeout(updateScrollbars, 300);
        }
    };

    /* ADDITIONAL FUNCTIONS */
    /**
     * Get native browser scrollbar size (height/width)
     *
     * @param {Boolean} actual size or CSS size, default - CSS size
     * @returns {Object} with height, width
     */
    function getBrowserScrollSize(actualSize) {

        if (browser.webkit && !actualSize) {
            return {
                "height": 0,
                "width": 0
            };
        }

        if (!browser.data.outer) {
            var css = {
                "border": "none",
                "box-sizing": "content-box",
                "height": "200px",
                "margin": "0",
                "padding": "0",
                "width": "200px"
            };
            browser.data.inner = $("<div>").css($.extend({}, css));
            browser.data.outer = $("<div>").css($.extend({
                "left": "-1000px",
                "overflow": "scroll",
                "position": "absolute",
                "top": "-1000px"
            }, css)).append(browser.data.inner).appendTo("body");
        }

        browser.data.outer.scrollLeft(1000).scrollTop(1000);

        return {
            "height": Math.ceil((browser.data.outer.offset().top - browser.data.inner.offset().top) || 0),
            "width": Math.ceil((browser.data.outer.offset().left - browser.data.inner.offset().left) || 0)
        };
    }

    function handleMouseDown(callback, event) {
        $(doc).on({
            "blur.scrollbar": function () {
                $(doc).add('body').off('.scrollbar');
                callback && callback();
            },
            "dragstart.scrollbar": function (event) {
                event.preventDefault();
                return false;
            },
            "mouseup.scrollbar": function () {
                $(doc).add('body').off('.scrollbar');
                callback && callback();
            }
        });
        $("body").on({
            "selectstart.scrollbar": function (event) {
                event.preventDefault();
                return false;
            }
        });
        event && event.preventDefault();
        return false;
    }

    /**
     * Check if native browser scrollbars overlay content
     *
     * @returns {Boolean}
     */
    function isScrollOverlaysContent() {
        var scrollSize = getBrowserScrollSize(true);
        return !(scrollSize.height || scrollSize.width);
    }

    function isVerticalScroll(event) {
        var e = event.originalEvent;
        if (e.axis && e.axis === e.HORIZONTAL_AXIS)
            return false;
        if (e.wheelDeltaX)
            return false;
        return true;
    }

})(jQuery, document, window);

/*
 * Custom compiled version of FilterManager with SOME MODIFICATIONS special for HierarchySlicer visual.
 * Thanks Microsoft for sharing!
*/
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var filter = {};
        (function (filter) {
            var SQExprKind;
            (function (SQExprKind) {
                SQExprKind[SQExprKind["Entity"] = 0] = "Entity";
                SQExprKind[SQExprKind["SubqueryRef"] = 1] = "SubqueryRef";
                SQExprKind[SQExprKind["ColumnRef"] = 2] = "ColumnRef";
                SQExprKind[SQExprKind["MeasureRef"] = 3] = "MeasureRef";
                SQExprKind[SQExprKind["Aggregation"] = 4] = "Aggregation";
                SQExprKind[SQExprKind["PropertyVariationSource"] = 5] = "PropertyVariationSource";
                SQExprKind[SQExprKind["Hierarchy"] = 6] = "Hierarchy";
                SQExprKind[SQExprKind["HierarchyLevel"] = 7] = "HierarchyLevel";
                SQExprKind[SQExprKind["And"] = 8] = "And";
                SQExprKind[SQExprKind["Between"] = 9] = "Between";
                SQExprKind[SQExprKind["In"] = 10] = "In";
                SQExprKind[SQExprKind["Or"] = 11] = "Or";
                SQExprKind[SQExprKind["Contains"] = 12] = "Contains";
                SQExprKind[SQExprKind["Compare"] = 13] = "Compare";
                SQExprKind[SQExprKind["StartsWith"] = 14] = "StartsWith";
                SQExprKind[SQExprKind["Exists"] = 15] = "Exists";
                SQExprKind[SQExprKind["Not"] = 16] = "Not";
                SQExprKind[SQExprKind["Constant"] = 17] = "Constant";
                SQExprKind[SQExprKind["DateSpan"] = 18] = "DateSpan";
                SQExprKind[SQExprKind["DateAdd"] = 19] = "DateAdd";
                SQExprKind[SQExprKind["Now"] = 20] = "Now";
                SQExprKind[SQExprKind["AnyValue"] = 21] = "AnyValue";
                SQExprKind[SQExprKind["DefaultValue"] = 22] = "DefaultValue";
                SQExprKind[SQExprKind["Arithmetic"] = 23] = "Arithmetic";
                SQExprKind[SQExprKind["FillRule"] = 24] = "FillRule";
                SQExprKind[SQExprKind["ResourcePackageItem"] = 25] = "ResourcePackageItem";
                SQExprKind[SQExprKind["ScopedEval"] = 26] = "ScopedEval";
                SQExprKind[SQExprKind["WithRef"] = 27] = "WithRef";
                SQExprKind[SQExprKind["Percentile"] = 28] = "Percentile";
                SQExprKind[SQExprKind["SelectRef"] = 29] = "SelectRef";
                SQExprKind[SQExprKind["TransformTableRef"] = 30] = "TransformTableRef";
                SQExprKind[SQExprKind["TransformOutputRoleRef"] = 31] = "TransformOutputRoleRef";
                SQExprKind[SQExprKind["ThemeDataColor"] = 32] = "ThemeDataColor";
                SQExprKind[SQExprKind["GroupRef"] = 33] = "GroupRef";
                SQExprKind[SQExprKind["Floor"] = 34] = "Floor";
                SQExprKind[SQExprKind["RoleRef"] = 35] = "RoleRef";
                SQExprKind[SQExprKind["Discretize"] = 36] = "Discretize";
                SQExprKind[SQExprKind["NamedQueryRef"] = 37] = "NamedQueryRef";
                SQExprKind[SQExprKind["Member"] = 38] = "Member";
                SQExprKind[SQExprKind["FilteredEval"] = 39] = "FilteredEval";
                SQExprKind[SQExprKind["Conditional"] = 40] = "Conditional";
            })(SQExprKind = filter.SQExprKind || (filter.SQExprKind = {}));
            var QueryComparisonKind;
            (function (QueryComparisonKind) {
                QueryComparisonKind[QueryComparisonKind["Equal"] = 0] = "Equal";
                QueryComparisonKind[QueryComparisonKind["GreaterThan"] = 1] = "GreaterThan";
                QueryComparisonKind[QueryComparisonKind["GreaterThanOrEqual"] = 2] = "GreaterThanOrEqual";
                QueryComparisonKind[QueryComparisonKind["LessThan"] = 3] = "LessThan";
                QueryComparisonKind[QueryComparisonKind["LessThanOrEqual"] = 4] = "LessThanOrEqual";
                QueryComparisonKind[QueryComparisonKind["Contains"] = 12] = "Contains";
                QueryComparisonKind[QueryComparisonKind["Is"] = 13] = "Is";
                QueryComparisonKind[QueryComparisonKind["StartsWith"] = 14] = "StartsWith";
                QueryComparisonKind[QueryComparisonKind["DoesNotContain"] = 16] = "DoesNotContain";
            })(QueryComparisonKind = filter.QueryComparisonKind || (filter.QueryComparisonKind = {}));
        })(filter = powerbi.visuals.filter || (powerbi.visuals.filter = {}));

        (function (filter_1) {
            var FilterManager = (function () {
                function FilterManager() {
                }

                FilterManager.restoreFilter = function (filter) {
                    if (!filter
                        || !filter.whereItems
                        || !filter.whereItems[0]
                        || !filter.whereItems[0].condition) {
                        return undefined;
                    }
                    var expr = filter.whereItems[0].condition;
                    return FilterManager.restoreAdvancedFilter(expr);
                };
                /*
                    Restores AdvancedFilter instance from filter
                */
                FilterManager.restoreAdvancedFilter = function (expr) {
                    var logicalOperator = FilterManager.getLogicalOperatorNameByKind(expr._kind);
                    var conditions;
                    if (logicalOperator === "And" || logicalOperator === "Or") {
                        conditions = FilterManager.getConditions([expr.left, expr.right]);
                    }
                    else {
                        logicalOperator = "And";
                        conditions = FilterManager.getConditions([expr]);
                    }
                    var advancedFilter = {target: null, logicalOperator: logicalOperator, conditions: conditions};
                    return advancedFilter;
                };

                FilterManager.getConditions = function (exprs) {
                    var conditions = [];
                    exprs.forEach(function (expr) {
                        if (expr) {
                            if ((expr.left && expr.right || expr.arg) &&
                                (typeof expr.comparison === "undefined" || expr.comparison === 0) &&
                                (expr._kind === filter_1.QueryComparisonKind.Contains ||
                                    expr._kind === filter_1.QueryComparisonKind.Is ||
                                    expr._kind === filter_1.QueryComparisonKind.DoesNotContain ||
                                    expr._kind === filter_1.QueryComparisonKind.StartsWith ||
                                    expr._kind === filter_1.SQExprKind.Or ||
                                    expr._kind === filter_1.SQExprKind.And
                                    )) {
                                var internal = FilterManager
                                    .getConditions([expr.left, expr.right, expr.arg]
                                    .filter(function (expr) { return expr; }))
                                    .filter(function (con) { return typeof con.value !== "undefined"; }); // null must be considered as value
                                internal.forEach(function (con) {
                                    if (con.operator === "None") {
                                        con.operator = FilterManager.getCondictionOperatorByComparison(expr._kind);
                                    }
                                    // IsBlank stores inside semantic filter as "value is null"
                                    if (con.value === null && con.operator === "Is") {
                                        con.operator = "IsBlank";
                                    }
                                    if (con.value === null && con.operator === "DoesNotContain") {
                                        con.operator = "IsNotBlank";
                                    }
                                });
                                // check DoesNotStartsWith as  DoesNotContain values as StartsWith value
                                if (internal.every(function (con) { return con.operator === "StartsWith"; }) && expr._kind === filter_1.QueryComparisonKind.DoesNotContain) {
                                    internal.forEach(function (con) {
                                        con.operator = "DoesNotStartWith";
                                    });
                                }
                                if (internal.every(function (con) { return con.operator === "Contains"; }) && expr._kind === filter_1.QueryComparisonKind.DoesNotContain) {
                                    internal.forEach(function (con) {
                                        con.operator = "DoesNotContain";
                                    });
                                }
                                if (internal.every(function (con) { return con.operator === "Is"; }) && expr._kind === filter_1.QueryComparisonKind.DoesNotContain) {
                                    internal.forEach(function (con) {
                                        con.operator = "IsNot";
                                    });
                                }
                                if (internal.every(function (con) { return con.operator === "IsBlank"; }) && expr._kind === filter_1.QueryComparisonKind.DoesNotContain) {
                                    internal.forEach(function (con) {
                                        con.operator = "IsNotBlank";
                                    });
                                }
                                conditions = conditions.concat(internal);
                                return;
                            }
                            let cond = FilterManager.getCondition(expr);
                            // try to get level
                            let level = FilterManager.getLevel(exprs);
                            if (level) {
                                cond.level = level;
                            }
                            conditions.push(cond);
                        }
                    });
                    return conditions;
                };
                FilterManager.getLevel = function (expr) {
                    let level = null;
                    try {
                        expr.forEach(function (exr) {
                            if (typeof exr !== 'undefined' && exr._kind === filter_1.SQExprKind.HierarchyLevel) {
                                level = exr.level;
                            }
                        });
                    } catch(ex) {
                        
                    }
                    return level;
                }
                FilterManager.getValue = function (expr) {
                    if (!expr) {
                        return undefined;
                    }
                    if (expr._kind === filter_1.SQExprKind.Constant) {
                        return expr.value;
                    }
                    if (expr._kind === filter_1.SQExprKind.Contains) {
                        return expr.value;
                    }
                    var exprs = [
                        expr.left,
                        expr.right,
                        expr.arg,
                    ];
                    for (var _i = 0, exprs_1 = exprs; _i < exprs_1.length; _i++) {
                        var currentExpr = exprs_1[_i];
                        var value = FilterManager.getValue(currentExpr);
                        if (value !== undefined) {
                            return value;
                        }
                    }
                };
                FilterManager.getCondition = function (expr) {
                    return {
                        value: FilterManager.getValue(expr),
                        operator: FilterManager.getCondictionOperatorByComparison(expr.comparison),
                    };
                };
                FilterManager.getLogicalOperatorNameByKind = function (kind) {
                    switch (kind) {
                        case filter_1.SQExprKind.And: {
                            return "And";
                        }
                        case filter_1.SQExprKind.Or: {
                            return "Or";
                        }
                        default:
                            return null;
                    }
                };
                FilterManager.getCondictionOperatorByComparison = function (comparison) {
                    switch (comparison) {
                        case filter_1.QueryComparisonKind.Equal: {
                            return "Is";
                        }
                        case filter_1.QueryComparisonKind.Is: {
                            return "Is";
                        }
                        case filter_1.QueryComparisonKind.GreaterThan: {
                            return "GreaterThan";
                        }
                        case filter_1.QueryComparisonKind.GreaterThanOrEqual: {
                            return "GreaterThanOrEqual";
                        }
                        case filter_1.QueryComparisonKind.LessThan: {
                            return "LessThan";
                        }
                        case filter_1.QueryComparisonKind.LessThanOrEqual: {
                            return "LessThanOrEqual";
                        }
                        case filter_1.QueryComparisonKind.Contains: {
                            return "Contains";
                        }
                        case filter_1.QueryComparisonKind.DoesNotContain: {
                            return "DoesNotContain";
                        }
                        case filter_1.QueryComparisonKind.StartsWith: {
                            return "StartsWith";
                        }
                    }
                    return "None";
                };
                return FilterManager;
            }());

            filter_1.FilterManager = FilterManager;
        })(filter = powerbi.visuals.filter || (powerbi.visuals.filter = {}));

    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));

/*
*
* Copyright (c) 2017 Jan Pieter Posthuma / DataScenarios
* 
* All rights reserved.
* 
* MIT License.
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the "Software"), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var HierarchySlicer1458836712039;
        (function (HierarchySlicer1458836712039) {
            var SelectionManager = visuals.utility.SelectionManager;
            var createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
            var PixelConverter = jsCommon.PixelConverter;
            var TreeViewFactory;
            (function (TreeViewFactory) {
                function createTreeView(options) {
                    return new TreeView(options);
                }
                TreeViewFactory.createTreeView = createTreeView;
            })(TreeViewFactory = HierarchySlicer1458836712039.TreeViewFactory || (HierarchySlicer1458836712039.TreeViewFactory = {}));
            /**
             * A UI Virtualized List, that uses the D3 Enter, Update & Exit pattern to update rows.
             * It can create lists containing either HTML or SVG elements.
             */
            var TreeView = (function () {
                function TreeView(options) {
                    var _this = this;
                    // make a copy of options so that it is not modified later by caller
                    this.options = $.extend(true, {}, options);
                    this.scrollbarInner = options.baseContainer.append("div").classed("scrollbar-inner", true).on("scroll", function () { return _this.renderImpl(_this.options.rowHeight); });
                    this.scrollContainer = this.scrollbarInner.append("div").classed("scrollRegion", true);
                    this.visibleGroupContainer = this.scrollContainer.append("div").classed("visibleGroup", true);
                    var scrollInner = $(this.scrollbarInner.node());
                    scrollInner.scrollbar({ignoreOverlay: false, ignoreMobile: false, onDestroy: function () { return scrollInner.off("scroll");}});
                    $(options.baseContainer.node()).find(".scroll-element").attr("drag-resize-disabled", "true");
                    this.scrollToFrame = this.options.scrollToFrame || this.defaultScrollToFrame;
                    TreeView.SetDefaultOptions(options);
                };
                TreeView.prototype.getContainerHeight = function () {
                    return $(this.options.baseContainer.node()).outerHeight();
                };
                TreeView.SetDefaultOptions = function (options) {
                    options.rowHeight = options.rowHeight || TreeView.defaultRowHeight;
                };
                TreeView.prototype.rowHeight = function (rowHeight) {
                    this.options.rowHeight = Math.ceil(rowHeight); // + 2; // Margin top/bottom
                    return this;
                };
                TreeView.prototype.data = function (data, getDatumIndex, dataReset) {
                    if (dataReset === void 0) { dataReset = false; }
                    this._data = data;
                    this.getDatumIndex = getDatumIndex;
                    this.setTotalRows();
                    if (dataReset)
                        $(this.scrollbarInner.node()).scrollTop(0);
                    this.render();
                    return this;
                };
                TreeView.prototype.viewport = function (viewport) {
                    //this.options.viewport = viewport;
                    this.render();
                    return this;
                };
                TreeView.prototype.empty = function () {
                    this._data = [];
                    this.render();
                };
                TreeView.prototype.render = function () {
                    var _this = this;
                    if (this.renderTimeoutId)
                        window.clearTimeout(this.renderTimeoutId);
                    this.renderTimeoutId = window.setTimeout(function () {
                        _this.getRowHeight().then((function (rowHeight) {
                            _this.renderImpl(rowHeight);
                        }));
                        _this.renderTimeoutId = undefined;
                    }, 0);
                };
                TreeView.prototype.renderImpl = function (rowHeight) {
                    var totalHeight = this.options.scrollEnabled ? Math.max(0, (this._totalRows * rowHeight)) : this.getContainerHeight();
                    this.scrollContainer.style("height", totalHeight + "px").attr("height", totalHeight);
                    this.scrollToFrame(this, true /*loadMoreData*/, this.options.rowHeight || TreeView.defaultRowHeight, this.scrollbarInner.node().scrollTop, this._totalRows, this.visibleGroupContainer, this.options.baseContainer);
                };
                /*
                *  This method is called in order to prevent a bug found in the Interact.js.
                *  The bug is caused when finishing a scroll outside the scroll area.
                *  In that case the Interact doesn"t process a touchcancel event and thinks a touch point still exists.
                *  since the Interact listens on the visualContainer, by stoping the propagation we prevent the bug from taking place.
                */
                TreeView.prototype.stopTouchPropagation = function () {
                    //Stop the propagation only in read mode so the drag won"t be affected.
                    if (this.options.isReadMode()) {
                        if (d3.event.type === "touchstart") {
                            var event_1 = d3.event;
                            //If there is another touch point outside this visual than the event should be propagated.
                            //This way the pinch to zoom will not be affected.
                            if (event_1.touches && event_1.touches.length === 1) {
                                d3.event.stopPropagation();
                            }
                        }
                        if (d3.event.type === "touchmove") {
                            d3.event.stopPropagation();
                        }
                    }
                };
                TreeView.prototype.defaultScrollToFrame = function (treeView, loadMoreData, rowHeight, scrollTop, totalElements, visibleGroupContainer, baseContainer) {
                    var visibleRows = this.getVisibleRows();
                    var scrollPosition = (scrollTop === 0) ? 0 : Math.floor(scrollTop / rowHeight);
                    var transformAttr = visuals.SVGUtil.translateWithPixels(0, scrollPosition * rowHeight);
                    visibleGroupContainer.style({
                        //order matters for proper overriding
                        "transform": function (d) { return transformAttr; },
                        "-webkit-transform": transformAttr
                    });
                    var position0 = Math.max(0, Math.min(scrollPosition, totalElements - visibleRows + 1)), position1 = position0 + visibleRows;
                    this.performScrollToFrame(position0, position1, totalElements, visibleRows, loadMoreData);
                };
                TreeView.prototype.performScrollToFrame = function (position0, position1, totalRows, visibleRows, loadMoreData) {
                    var options = this.options;
                    var visibleGroupContainer = this.visibleGroupContainer;
                    var rowSelection = visibleGroupContainer.selectAll(".row")
                        .data(this._data.slice(position0, Math.min(position1, totalRows)), this.getDatumIndex);
                    rowSelection
                        .enter()
                        .append("div")
                        .classed("row", true)
                        .call((function (d) { return options.enter(d); }));
                    rowSelection.order();
                    var rowUpdateSelection = visibleGroupContainer.selectAll(".row:not(.transitioning)");
                    rowUpdateSelection.call((function (d) { return options.update(d); }));
                    rowSelection
                        .exit()
                        .call((function (d) { return options.exit(d); }))
                        .remove();
                    if (loadMoreData && visibleRows !== totalRows && position1 >= totalRows * TreeView.loadMoreDataThreshold)
                        options.loadMoreData();
                };
                TreeView.prototype.setTotalRows = function () {
                    var data = this._data;
                    this._totalRows = data ? data.length : 0;
                };
                TreeView.prototype.getVisibleRows = function () {
                    var minimumVisibleRows = 1;
                    var options = this.options;
                    var rowHeight = options.rowHeight;
                    var containerHeight = this.getContainerHeight();
                    if (!rowHeight || rowHeight < 1)
                        return minimumVisibleRows;
                    // How many rows of space the viewport can hold (not the number of rows it can display).
                    var viewportRowCount = containerHeight / rowHeight;    
                    if (this.options.scrollEnabled) {
                        // Ceiling the count since we can have items be partially displayed when scrolling.
                        // Add 1 to make sure we always render enough rows to cover the entire viewport (handles when rows are partially visible when scrolling).
                        // Ex. If you have a viewport that can show 280 (viewport height) / 100 (row height) = 2.8 rows, you need to have up to Math.ceil(2.8) + 1 = 4 rows of data to cover the viewport.
                        // If you only had Math.ceil(2.8) = 3 rows of data, and the top rows was 50% visible (scrolled up), you"d only be able to cover .5 + 1 + 1 = 2.5 rows of the viewport.
                        // This makes a gap at the bottom of the treeview.
                        // Add an extra row of data and we can cover .5 + 1 + 1 + 1 = 3.5 rows of the viewport. 3.5 is enough to cover the entire viewport as only 2.8 is needed.
                        // 1 is always added, even if not needed, to keep logic simple. Advanced logic would figure out what % of the top row is visible and use that to add 1 if needed.
                        return Math.min(Math.ceil(viewportRowCount) + 1, this._totalRows) || minimumVisibleRows;
                    }
                    // Floor the count since that"s the maximum number of entire rows we can display without scrolling.
                    return Math.min(Math.floor(viewportRowCount), this._totalRows) || minimumVisibleRows;
                };
                TreeView.prototype.getRowHeight = function () {
                    var deferred = $.Deferred();
                    var treeView = this;
                    var options = treeView.options;
                    if (this.cancelMeasurePass)
                        this.cancelMeasurePass();
                    // if there is no data, resolve and return
                    if (!(this._data && this._data.length && options)) {
                        treeView.rowHeight(TreeView.defaultRowHeight);
                        return deferred.resolve(options.rowHeight).promise();
                    }
                    //render the first item to calculate the row height
                    this.scrollToFrame(this, false /*loadMoreData*/, this.options.rowHeight || TreeView.defaultRowHeight, this.scrollbarInner.node().scrollTop, this._totalRows, this.visibleGroupContainer, this.options.baseContainer);
                    var requestAnimationFrameId = window.requestAnimationFrame((function () {
                        // Measure row height. Take non empty rows to measure the row height because if the first row is empty, it returns incorrect height
                        // which causes scrolling issues. 
                        var rows = treeView.visibleGroupContainer.selectAll(".row").filter((function () { return this.textContent !== ""; }));
                        // For image slicer, the text content will be empty. Hence just select the rows for that and then we use the first row height
                        if (rows.empty()) {
                            rows = treeView.visibleGroupContainer.select(".row");
                        }
                        if (!rows.empty()) {
                            var firstRow = rows.node();
                            // If the container (child) has margins amd the row (parent) doesn"t, the child"s margins will collapse into the parent.
                            // outerHeight doesn"t report the correct height for the parent in this case, but it does measure the child properly.
                            // Fix for #7497261 Measures both and take the max to work around this issue.
                            var rowHeight = Math.max($(firstRow).outerHeight(true), $(firstRow).children().first().outerHeight(true));
                            treeView.rowHeight(rowHeight);
                            deferred.resolve(rowHeight);
                        }
                        treeView.cancelMeasurePass = undefined;
                        window.cancelAnimationFrame(requestAnimationFrameId);
                    }));
                    this.cancelMeasurePass = function () {
                        window.cancelAnimationFrame(requestAnimationFrameId);
                        deferred.reject();
                    };
                    return deferred.promise();
                };
                /**
                 * The value indicates the percentage of data already shown
                 * in the list view that triggers a loadMoreData call.
                 */
                TreeView.loadMoreDataThreshold = 0.8;
                TreeView.defaultRowHeight = 1;
                return TreeView;
            })();
            var HierarchySlicerWebBehavior = (function () {
                function HierarchySlicerWebBehavior() {
                    this.initFilter = true;
                }
                HierarchySlicerWebBehavior.prototype.bindEvents = function (options, selectionHandler) {
                    var _this = this;
                    var expanders = this.expanders = options.expanders;
                    var slicers = this.slicers = options.slicerItemContainers;
                    this.slicerItemLabels = options.slicerItemLabels;
                    this.slicerItemInputs = options.slicerItemInputs;
                    this.dataPoints = options.dataPoints;
                    this.fullTree = options.fullTree;
                    this.interactivityService = options.interactivityService;
                    this.selectionHandler = selectionHandler;
                    this.settings = options.slicerSettings;
                    this.hostServices = options.hostServices;
                    this.levels = options.levels;
                    this.options = options;
                    var slicerClear = options.slicerClear;
                    var slicerExpand = options.slicerExpand;
                    var slicerCollapse = options.slicerCollapse;
                    if ((this.dataPoints.filter(function (d) { return d.selected; }).length > 0) && this.initFilter) {
                        this.initFilter = false;
                        this.applyFilter();
                    } else {
                        this.renderSelection()
                    }
                    expanders.on("click", function (d, i) {
                        d.isExpand = !d.isExpand;
                        var currentExpander = expanders.filter(function (e, l) { return i === l; });
                        var height = $(currentExpander[0][0].firstChild).height();
                        var width = $(currentExpander[0][0].firstChild).width();
                        var scale = height / 26.0;
                        currentExpander.select(".icon").remove();
                        var container = currentExpander.select(".spinner-icon").style("display", "inline");
                        var margin = _this.settings.slicerText.textSize / 1.25;
                        var spinner = container.append("div").classed("xsmall", true).classed("powerbi-spinner", true).style({
                            "top": "25%",
                            "right": "50%",
                            "transform": "scale("+ scale + ")",
                            "margin": "0px;",
                            "padding-left": "5px;",
                            "display": "block;",
                            "top": "25%",
                            "right": "50%",
                            "margin-top": _this.settings.slicerText.textSize < 12 ? "0px" : margin + "px",
                            "margin-left": _this.settings.slicerText.textSize < 12 ? "0px" : (margin * .6) + "px"
                        }).attr("ng-if", "viewModel.showProgressBar") //.attr("delay", "500")
                            .append("div").classed("spinner", true);
                        for (var i = 0; i < 5; i++) {
                            spinner.append("div").classed("circle", true);
                        }
                        _this.persistExpand(false);
                    }); 
                    slicerCollapse.on("click", function (d) {
                        $(".scrollbar-inner").scrollTop(0);
                        _this.dataPoints.filter(function (d) { return !d.isLeaf; }).forEach(function (d) { return d.isExpand = false; });
                        _this.persistExpand(true);
                    });
                    slicerExpand.on("click", function (d) {
                        _this.dataPoints.filter(function (d) { return !d.isLeaf; }).forEach(function (d) { return d.isExpand = true; });
                        _this.persistExpand(true);
                    });
                    options.slicerContainer.classed("hasSelection", true);
                    slicers.on("mouseover", function (d) {
                        if (d.selectable) {
                            d.mouseOver = true;
                            d.mouseOut = false;
                            _this.renderMouseover();
                        }
                    });
                    slicers.on("mouseout", function (d) {
                        if (d.selectable) {
                            d.mouseOver = false;
                            d.mouseOut = true;
                            _this.renderMouseover();
                        }
                    });
                    slicers.on("click", function (d, index) {
                        if (!d.selectable) {
                            return;
                        }
                        var currentExpander = expanders.filter(function (e, l) { return index === l; });
                        var height = $(currentExpander[0][0].firstChild).height();
                        var width = $(currentExpander[0][0].firstChild).width();
                        var scale = height / 26.0;
                        currentExpander.select(".icon").remove();
                        var container = currentExpander.select(".spinner-icon").style("display", "inline");
                        var margin = _this.settings.slicerText.textSize / 1.25;
                        var spinner = container.append("div").classed("xsmall", true).classed("powerbi-spinner", true).style({
                            "top": "25%",
                            "right": "50%",
                            "transform": "scale("+ scale + ")",
                            "margin": "0px;",
                            "padding-left": "5px;",
                            "display": "block;",
                            "top": "25%",
                            "right": "50%",
                            "margin-top": _this.settings.slicerText.textSize < 12 ? "0px" : margin + "px",
                            "margin-left": _this.settings.slicerText.textSize < 12 ? "0px" : (margin * .6) + "px"
                        }).attr("ng-if", "viewModel.showProgressBar") //.attr("delay", "500")
                            .append("div").classed("spinner", true);
                        for (var i = 0; i < 5; i++) {
                            spinner.append("div").classed("circle", true);
                        }
                        var selected = d.partialSelected ? !d.selected : d.selected;
                        if (d.ownId==="selectAll") {
                            _this.dataPoints.forEach(function(dp) { dp.selected = !selected; });
                            d.selected =  !selected;
                            _this.applyFilter();
                            return
                        }
                        var settings = _this.settings;
                        let multiSelect = !settings.general.singleselect;
                        let selectionDataPoints = [];
                        if (multiSelect && settings.search.addSelection) {
                            selectionDataPoints = _this.fullTree;
                        } else {
                            selectionDataPoints = _this.dataPoints;
                        }
                        d3.event.preventDefault();
                        if (multiSelect) {
                            d.selected = !selected; // Toggle selection
                            if (!selected) {
                                var selectDataPoints = selectionDataPoints.filter(function (dp) { return dp.parentId.indexOf(d.ownId) >= 0; });
                                for (var i = 0; i < selectDataPoints.length; i++) {
                                    if (selected === selectDataPoints[i].selected) {
                                        selectDataPoints[i].selected = !selected;
                                    }
                                }
                                selectDataPoints = _this.getParentDataPoints(selectionDataPoints, d.parentId);
                                for (var i = 0; i < selectDataPoints.length; i++) {
                                    if (!selected && !selectDataPoints[i].selected) {
                                        selectDataPoints[i].selected = !selected;
                                    }
                                    else if (selected && (selectionDataPoints.filter(function (dp) { return dp.selected && dp.level === d.level && dp.parentId === d.parentId; }).length === 0)) {
                                        selectDataPoints[i].selected = !selected;
                                    }
                                }
                            } else if (!d.isLeaf) {
                                var selectDataPoints = selectionDataPoints.filter(function (dp) { return dp.parentId.indexOf(d.ownId) >= 0; });
                                for (var i = 0; i < selectDataPoints.length; i++) {
                                    if (selected === selectDataPoints[i].selected) {
                                        selectDataPoints[i].selected = !selected;
                                    }
                                }
                            }
                            if (selectionDataPoints.filter(function(dp) { return (dp.parentId === d.parentId) && dp.selected }).length===0) { // Last Child Standing
                                var p = selectionDataPoints.filter(function(dp) { return dp.ownId === d.parentId })[0];
                                if (p) {
                                    p.selected = !selected;
                                    var parentId = p.parentId;
                                    for(var i = d.level-1; i > 0; i--) {
                                        var p = selectionDataPoints.filter(function(dp) { return dp.ownId === parentId })[0];
                                        if (selectionDataPoints.filter(function(dp) { return (dp.parentId === p.ownId) && dp.selected }).length===0) {
                                            p.selected = !selected;
                                        }
                                        parentId = p.parentId;
                                    }
                                }
                            }
                        }
                        else {
                            selectionDataPoints.forEach(function(dp) { dp.selected = false; } );
                            d.selected = !selected;
                            if (!selected) {
                                var selectDataPoints = [d]; //Self
                                selectDataPoints = selectDataPoints.concat(selectionDataPoints.filter(function (dp) { return dp.parentId.indexOf(d.ownId) >= 0; })); // Children
                                selectDataPoints = selectDataPoints.concat(_this.getParentDataPoints(selectionDataPoints, d.parentId)); // Parents
                                if (selectDataPoints) {
                                    for (var i = 0; i < selectDataPoints.length; i++) {
                                        selectDataPoints[i].selected = true;
                                    }
                                }
                            } else if (selectionDataPoints.filter(function(dp) { return (dp.parentId === d.parentId) && dp.selected }).length===0) { // Last Child Standing
                                var p = selectionDataPoints.filter(function(dp) { return dp.ownId === d.parentId })[0];
                                if (p) { // Not parent level
                                    p.selected = !selected;
                                    var parentId = p.parentId;
                                    for(var i = d.level-1; i > 0; i--) {
                                        var p = selectionDataPoints.filter(function(dp) { return dp.ownId === parentId })[0];
                                        if (selectionDataPoints.filter(function(dp) { return (dp.parentId === p.ownId) && dp.selected }).length===0) {
                                            p.selected = !selected;
                                        }
                                        parentId = p.parentId;
                                    }
                                }
                            }
                        }
                        _this.applyFilter(selectionDataPoints);
                    });
                    slicerClear.on("click", function (d) {
                        _this.selectionHandler.handleClearSelection();
                        _this.persistFilter(null);
                    });
                };
                HierarchySlicerWebBehavior.prototype.renderMouseover = function () {
                    var _this = this;
                    this.slicerItemLabels.style({
                        "color": function (d) {
                            if (d.mouseOver)
                                return _this.settings.slicerText.hoverColor;
                            //else if (d.mouseOut) {
                                if (d.selected)
                                    return _this.settings.slicerText.selectedColor;
                                else
                                    return _this.settings.slicerText.fontColor;
                            //}
                            //else
                            //    return _this.settings.slicerText.fontColor; //fallback
                        }
                    });
                    this.slicerItemInputs.selectAll("span").style({
                        "border-color": function (d) {
                            if (d.mouseOver)
                                return _this.settings.slicerText.hoverColor;
                            //else if (d.mouseOut) {
                                if (d.selected)
                                    return _this.settings.slicerText.selectedColor;
                                else
                                    return _this.settings.slicerText.fontColor;
                            //}
                            //else
                            //    return _this.settings.slicerText.fontColor; //fallback
                        }
                    });
                    this.expanders.style({
                        "fill": function (d) {
                            if (d.mouseOver)
                                return _this.settings.slicerText.hoverColor;
                            else if (d.mouseOut) {
                                if (d.selected)
                                    return _this.settings.slicerText.selectedColor;
                                else
                                    return _this.settings.slicerText.fontColor;
                            }
                            else
                                return _this.settings.slicerText.fontColor; //fallback
                        }
                    });
                };
                HierarchySlicerWebBehavior.prototype.renderSelection = function (hasSelection) {
                    if (!hasSelection && !this.interactivityService.isSelectionModeInverted()) {
                        this.slicerItemInputs.filter(".selected").classed("selected", false);
                        this.slicerItemInputs.filter(".partiallySelected").classed("partiallySelected", false);
                        var input = this.slicerItemInputs.selectAll("input");
                        if (input) {
                            input.property("checked", false);
                        }
                    }
                    else {
                        this.styleSlicerInputs(this.slicers, hasSelection);
                    }
                };
                HierarchySlicerWebBehavior.prototype.styleSlicerInputs = function (slicers, hasSelection) {
                    var _this = this;
                    slicers.each(function (d, i) {
                        var slicerItem = this.getElementsByTagName("div")[0];
                        var shouldCheck = d.selected;
                        var partialCheck = d.partialSelected;
                        var input = slicerItem.getElementsByTagName("input")[0];
                        if (input)
                            input.checked = shouldCheck;
                        if (shouldCheck && partialCheck) {
                            slicerItem.classList.remove("selected");
                            slicerItem.classList.add("partiallySelected");
                            //slicerItem.getElementsByTagName("span")[0].style.background = _this.settings.slicerText.selectedColor;
                        } else if (shouldCheck && (!partialCheck)){
                            slicerItem.classList.remove("partiallySelected");
                            slicerItem.classList.add("selected");
                            //slicerItem.getElementsByTagName("span")[0].style.background = _this.settings.slicerText.selectedColor;
                        } else
                            slicerItem.classList.remove("selected");
                        var slicerSpan = slicerItem.getElementsByTagName("span")[0];
                        slicerSpan.style.borderColor = d.selected ? _this.settings.slicerText.selectedColor : _this.settings.slicerText.fontColor;
                        slicerSpan.style.backgroundColor = d.selected ? _this.settings.slicerText.selectedColor : "transparent";
                        _this.slicerItemLabels[0][i].style.color = d.selected ? _this.settings.slicerText.selectedColor : _this.settings.slicerText.fontColor;                                                
                    });
                };
                HierarchySlicerWebBehavior.prototype.visitDataPoint = function (dataPoint, exprMap) {
                    var name = dataPoint.columnExpr.queryName;
                    var expr = dataPoint.columnExpr.expr;

                    if (!exprMap[name]) {
                        exprMap[name] = {
                            expr: expr,
                            ids: []
                        };
                    }

                    exprMap[name].ids.push(dataPoint.id);

                    if (dataPoint.parentDataPoint) {
                        this.visitDataPoint(dataPoint.parentDataPoint, exprMap);
                    }
                }
                HierarchySlicerWebBehavior.prototype.applyFilter = function (dataPoints) {
                    if (dataPoints.length === 0) {
                        return;
                    }
                    
                    var rootLevels = dataPoints.filter(function (d) {
                        return d.level === 0 && d.selected && d.ownId !== "selectAll";
                    });

                    if (!rootLevels || (rootLevels.length === 0)) {
                        this.selectionHandler.handleClearSelection();
                        this.persistFilter(null);
                    } else {
                        var exprMap = {};

                        var self = this;

                        dataPoints.forEach(function (dataPoint) {
                            if (dataPoint.selected && dataPoint.ownId !== "selectAll" && dataPoint.isLeaf) {
                                self.visitDataPoint(dataPoint, exprMap)
                            }
                        });

                        var args = [];
                        var values = [];

                        Object.keys(exprMap).forEach(function (key) {
                            var expr = exprMap[key];

                            args.push(expr.expr);

                            expr.ids.forEach(function (id, index) {
                                if (!values[index]) {
                                    values.push([]);
                                }

                                values[index].push(id);
                            });
                        });

                        var finalExpr = powerbi.data.SQExprBuilder.inValues(args, values);

                        var filter = powerbi.data.SemanticFilter.fromSQExpr(finalExpr);

                        this.persistFilter(filter);
                    }
                };
                HierarchySlicerWebBehavior.prototype.getParentDataPoints = function (dataPoints, parentId) {
                    var parent = dataPoints.filter(function (d) { return d.ownId === parentId; });
                    if (!parent || (parent.length === 0)) {
                        return [];
                    }
                    else if (parent[0].level === 0) {
                        return parent;
                    }
                    else {
                        var returnParents = [];
                        returnParents = returnParents.concat(parent, this.getParentDataPoints(dataPoints, parent[0].parentId));
                        return returnParents;
                    }
                };
                HierarchySlicerWebBehavior.prototype.persistFilter = function (filter) {
                    var properties = {};
                    if (filter) {
                        properties[HierarchySlicer1458836712039.hierarchySlicerProperties.filterPropertyIdentifier.propertyName] = filter;
                    }
                    else {
                        properties[HierarchySlicer1458836712039.hierarchySlicerProperties.filterPropertyIdentifier.propertyName] = "";
                    }
                    var filterValues = this.dataPoints.filter(function (d) { return d.selected; }).map(function (d) { return d.ownId; }).join(",");
                    if (filterValues) {
                        properties[HierarchySlicer1458836712039.hierarchySlicerProperties.filterValuePropertyIdentifier.propertyName] = filterValues;
                    }
                    else {
                        properties[HierarchySlicer1458836712039.hierarchySlicerProperties.filterValuePropertyIdentifier.propertyName] = "";
                    }
                    var objects = {
                        merge: [
                            {
                                objectName: HierarchySlicer1458836712039.hierarchySlicerProperties.filterPropertyIdentifier.objectName,
                                selector: undefined,
                                properties: properties,
                            }
                        ]
                    };
                    this.hostServices.persistProperties(objects);
                    this.hostServices.onSelect({ data: [] });
                };
                HierarchySlicerWebBehavior.prototype.persistExpand = function (updateScrollbar) {
                    var properties = {};
                    properties[HierarchySlicer1458836712039.hierarchySlicerProperties.expandedValuePropertyIdentifier.propertyName] = this.dataPoints.filter(function (d) { return d.isExpand; }).map(function (d) { return d.ownId; }).join(",");
                    var objects = {
                        merge: [
                            {
                                objectName: HierarchySlicer1458836712039.hierarchySlicerProperties.expandedValuePropertyIdentifier.objectName,
                                selector: undefined,
                                properties: properties,
                            }
                        ]
                    };
                    this.hostServices.persistProperties(objects);
                    this.hostServices.onSelect({ data: [] });
                };
                return HierarchySlicerWebBehavior;
            })();
            HierarchySlicer1458836712039.HierarchySlicerWebBehavior = HierarchySlicerWebBehavior;
            HierarchySlicer1458836712039.hierarchySlicerProperties = {
                selection: {
                    singleselect: { objectName: "selection", propertyName: "singleSelect" },
                    emptyLeafs: { objectName: "selection", propertyName: "emptyLeafs" },
                    selectAll: { objectName: "selection", propertyName: "selectAll" },
                    selectAllLabel: { objectName: "selection", propertyName: "selectAllLabel" },
                },
                header: {
                    show: { objectName: "header", propertyName: "show" },
                    title: { objectName: "header", propertyName: "title" },
                    fontColor: { objectName: "header", propertyName: "fontColor" },
                    background: { objectName: "header", propertyName: "background" },
                    hoverColor: { objectName: "header", propertyName: "hoverColor" },
                    textSize: { objectName: "header", propertyName: "textSize" },
                },
                items: {
                    fontColor: { objectName: "items", propertyName: "fontColor" },
                    selectedColor: { objectName: "items", propertyName: "selectedColor" },
                    background: { objectName: "items", propertyName: "background" },
                    hoverColor: { objectName: "items", propertyName: "hoverColor" },
                    textSize: { objectName: "items", propertyName: "textSize" },
                },
                search: {
                    addSelection: { objectName: "search", propertyName: "addSelection" },
                    fontColor: { objectName: "search", propertyName: "fontColor" },
                    iconColor: { objectName: "search", propertyName: "iconColor" },
                    background: { objectName: "search", propertyName: "background" },
                    textSize: { objectName: "search", propertyName: "textSize" }
                },
                selectedPropertyIdentifier: { objectName: "general", propertyName: "selected" },
                expandedValuePropertyIdentifier: { objectName: "general", propertyName: "expanded" },
                filterPropertyIdentifier: { objectName: "general", propertyName: "filter" },
                filterValuePropertyIdentifier: { objectName: "general", propertyName: "filterValues" },
                defaultValue: { objectName: "general", propertyName: "defaultValue" },
                selfFilterEnabled: { objectName: "general", propertyName: "selfFilterEnabled" },
                // store version
                version: { objectName: "general", propertyName: "version" },
            };
            var HierarchySlicer = (function () {
                function HierarchySlicer(options) {
                    this.IconSet = {
                        expandAll: "<svg  width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M19 19h-6v6h-2v-6H5v-2h6V11h2v6h6v2z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
                        collapseAll: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M19 19H5v-2h14v2z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
                        clearAll: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M5 19h14v-2H5v2zm-2 4h14v-2H3v2zM7 13v2h14V13H7z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
                        collapse: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M9 5l7 7l-7 7Z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
                        expand: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M17 9l0 10l-10 0Z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
                        checkboxTick: "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 1 1\"><path d=\"M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z\" style=\"fill:#ffffff;fill-opacity:1;stroke:none\" /></svg>",
                        search: "<svg  width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M15.75 15q1.371 0 2.602-0.521t2.168-1.459 1.459-2.168 0.521-2.602-0.521-2.602-1.459-2.168-2.168-1.459-2.602-0.521-2.602 0.521-2.168 1.459-1.459 2.168-0.521 2.602 0.521 2.602 1.459 2.168 2.168 1.459 2.602 0.521zM7.5 8.25q0-3.41 1.98-5.391t3.568-2.42 3.85-0.439 4.242 1.98 2.42 3.568 0.439 3.85-1.98 4.242-3.568 2.42-2.701 0.439q-2.93 0-5.273-1.91l-9.199 9.188q-0.223 0.223-0.527 0.223t-0.527-0.223-0.223-0.527 0.223-0.527l9.188-9.199q-1.91-2.344-1.91-5.273z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>",
                        delete: "<svg  width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\"><path d=\"M10.889 10l8.926 8.936-0.879 0.879-8.936-8.926-8.936 8.926-0.879-0.879 8.926-8.936-8.926-8.936 0.879-0.879 8.936 8.926 8.936-8.926 0.879 0.879z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>"
                    };
                    if (options) {
                        if (options.margin) {
                            this.margin = options.margin;
                        }
                        if (options.behavior) {
                            this.behavior = options.behavior;
                        }
                    }
                    if (!this.behavior) {
                        this.behavior = new HierarchySlicerWebBehavior();
                    }
                }
                HierarchySlicer.DefaultSlicerSettings = function () {
                    return {
                        general: {
                            rows: 0,
                            singleselect: true,
                            showDisabled: "",
                            outlineColor: "#808080",
                            outlineWeight: 1,
                            selfFilterEnabled: false,
                            version: 801,
                            emptyLeafs: true,
                            selectAll: false,
                            selectAllLabel: "Select All"
                        },
                        margin: {
                            top: 50,
                            bottom: 50,
                            right: 50,
                            left: 50
                        },
                        header: {
                            borderBottomWidth: 1,
                            show: true,
                            outline: "BottomOnly",
                            fontColor: "#808080",
                            hoverColor: "#666666",
                            background: undefined,
                            textSize: 10,
                            outlineColor: "#a6a6a6",
                            outlineWeight: 1,
                            title: "",
                        },
                        headerText: {
                            marginLeft: 8,
                            marginTop: 0
                        },
                        slicerText: {
                            textSize: 10,
                            height: 18,
                            width: 0,
                            fontColor: "#808080",
                            hoverColor: "#666666",
                            selectedColor: "#212121",
                            unselectedColor: "#ffffff",
                            disabledColor: "grey",
                            marginLeft: 8,
                            outline: "Frame",
                            background: undefined,
                            transparency: 0,
                            outlineColor: "#000000",
                            outlineWeight: 1,
                            borderStyle: "Cut",
                        },
                        search: {
                            addSelection: true,
                            fontColor: "#808080",
                            iconColor: "#666666",
                            background: undefined,
                            textSize: 10,
                        },
                        slicerItemContainer: {
                            // The margin is assigned in the less file. This is needed for the height calculations.
                            marginTop: 5,
                            marginLeft: 0,
                        },
                    };
                };
                HierarchySlicer.prototype.getSelected = function (value, selectedScopeIds) {
                    if (!value || _.isEmpty(selectedScopeIds))
                        return false;
                    for (var i = 0, len = selectedScopeIds.length; i < len; i++) {
                        var retainedValueScopeId = selectedScopeIds[i];
                        if (powerbi.DataViewScopeIdentity.equals(value, retainedValueScopeId, false)) {
                            selectedScopeIds.splice(i, 1);
                            return true;
                        }
                    }
                    return false;
                };
                HierarchySlicer.prototype.converter = function (dataView, searchText) {
                    if (!dataView || !dataView.table || !dataView.table.rows || !(dataView.table.rows.length > 0) || !dataView.table.columns || !(dataView.table.columns.length > 0)) {
                        return {
                            dataPoints: [],
                            fullTree: [],
                            settings: null,
                            levels: null,
                        };
                    }
                    var rows = dataView.table.rows;
                    var identities = dataView.table.identity;
                    var hierarchyRows = dataView.metadata.columns.filter(function(d) { return d.roles.Fields}).length // Filter out 'Values' level
                    var columns = dataView.table.columns;
                    var levels = hierarchyRows - 1;
                    var dataPoints = [];
                    let fullTree = [];
                    var defaultSettings = HierarchySlicer.DefaultSlicerSettings();
                    var identityValues = [];
                    var selectedIds = [];
                    var expandedIds = [];
                    var selectionFilter;
                    var order = 0;
                    var objects = dataView.metadata.objects;
                    var isRagged = false;
                    var raggedParents = [];
                    var filter = (
                        dataView.metadata &&
                        dataView.metadata.objects &&
                        powerbi.DataViewObjects.getValue(dataView.metadata.objects, HierarchySlicer1458836712039.hierarchySlicerProperties.filterPropertyIdentifier));

                    defaultSettings.general.singleselect = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selection.singleselect, defaultSettings.general.singleselect);
                    defaultSettings.general.emptyLeafs = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selection.emptyLeafs, defaultSettings.general.emptyLeafs);
                    var selectAll = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selection.selectAll, defaultSettings.general.selectAll);
                    var selectAllLabel = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selection.selectAllLabel, defaultSettings.general.selectAllLabel);
                    defaultSettings.general.selectAll = selectAll;
                    defaultSettings.general.selectAllLabel = selectAllLabel;
                    defaultSettings.header.title = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.title, dataView.metadata.columns[0].displayName);
                    
                    // get FilterManager
                    let FilterManager = powerbi.visuals.filter.FilterManager;
                    if (filter
                        && filter.whereItems
                        && filter.whereItems[0]
                        && filter.whereItems[0].condition) {
                        let childIdentityFields = dataView.tree.root.childIdentityFields;
                        let restoredAdvancedFilter = filter.whereItems[0].condition
                        // convert advanced filter conditions list to HierarchySlicer selected values format
                        selectedIds = this.convertAdvancedFilterConditionsToSlicerData(restoredAdvancedFilter,childIdentityFields, "");
                    }
                    expandedIds = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.expandedValuePropertyIdentifier, "").split(",");
                    defaultSettings.general.selfFilterEnabled = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selfFilterEnabled, defaultSettings.general.selfFilterEnabled);
                    if (selectAll) {
                        dataPoints.push({
                            identity: null,
                            selected: false,
                            value: selectAllLabel,
                            tooltip: selectAllLabel,
                            level: 0,
                            selectable: true,
                            partialSelected: false,
                            isLeaf: true,
                            isExpand: false,
                            isHidden: false,
                            id: "selectAll",
                            ownId: "selectAll",
                            parentId: "none",
                            order: order++,
                        });
                    }
                    for (var r = 0; r < rows.length; r++) {
                        var parentId = "";
                        var parentDataPoint = null;
                        for (var c = 0; c < hierarchyRows; c++) {
                            if ((rows[r][c] === null) && (!defaultSettings.general.emptyLeafs)) {
                                isRagged = true;
                                raggedParents.push(parentId);
                                break;
                            }
                            var format = dataView.table.columns[c].format;
                            var dataType = dataView.table.columns[c].type;
                            var labelValue = visuals.valueFormatter.format(rows[r][c], format);
                            labelValue = labelValue === null ? "(blank)" : labelValue;
                            var value;
                            if (rows[r][c] === null) {
                                value = powerbi.data.SQExprBuilder.nullConstant();
                            } else {
                                if (dataType.text) {
                                    value = powerbi.data.SQExprBuilder.text(rows[r][c]);
                                } else if (dataType.integer) {
                                    value = powerbi.data.SQExprBuilder.integer(rows[r][c]);
                                } else if (dataType.numeric) {
                                    value = powerbi.data.SQExprBuilder.double(rows[r][c]);
                                } else if (dataType.bool) {
                                    value = powerbi.data.SQExprBuilder.boolean(rows[r][c]);
                                } else if (dataType.dateTime) {
                                    value = powerbi.data.SQExprBuilder.dateTime(rows[r][c]);
                                } else {
                                    value = powerbi.data.SQExprBuilder.text(rows[r][c]);
                                }
                            }
                            if (c <= 0) {
                                parentId = "";
                                parentSearchStr = "";
                            }
                            let ownId = parentId + (parentId === "" ? "" : "_") + labelValue.replace(/,/g, "") + "-" + c;
                            let searchStr = parentSearchStr + labelValue.replace(/,/g, "")
                            let isLeaf = c === hierarchyRows - 1;
                            let dataPoint = {
                                parentDataPoint: parentDataPoint,
                                columnExpr: dataView.table.columns[c],
                                identity: null,
                                selected: selectedIds.filter(function (d) {
                                    return d === ownId;
                                }).length > 0,
                                value: labelValue,
                                tooltip: labelValue,
                                level: c,
                                selectable: true,
                                partialSelected: false,
                                isLeaf: isLeaf,
                                isExpand: expandedIds === [] ? false : expandedIds.filter(function (d) {
                                    return d === ownId; 
                                }).length > 0 || false,
                                isHidden: c === 0 ? false : true,
                                id: value,
                                ownId: ownId,
                                parentId: parentId,
                                searchStr: searchStr,
                                order: order++,
                            };

                            parentDataPoint = dataPoint;
                            
                            parentId = ownId;
                            parentSearchStr = searchStr;
                            if (identityValues.indexOf(ownId) === -1) {
                                identityValues.push(ownId);
                                dataPoints.push(dataPoint);
                            }
                        }
                    }

                    if (isRagged) {
                        dataPoints.forEach(function(d) { if (raggedParents.filter(function (d1) { return d1 === d.ownId }).length > 0) { d.isLeaf = true;} });
                    }

                    if (!defaultSettings.general.singleselect) {
                        fullTree = dataPoints;
                    }

                    if (defaultSettings.general.selfFilterEnabled && searchText) {
                        searchText = searchText.toLowerCase();
                        var filteredDataPoints = dataPoints.filter(function (d) { return d.searchStr.toLowerCase().indexOf(searchText) >= 0; });
                        var unique = {};
                        for (var i in filteredDataPoints) {
                            unique[filteredDataPoints[i].ownId] = 0;
                        }
                        for (var l = levels; l >= 1; l--) {
                            var levelDataPoints = filteredDataPoints.filter(function (d) { return d.level === l; });
                            var missingParents = {};
                            for (var i in levelDataPoints) {
                                if (typeof (unique[levelDataPoints[i].parentId]) == "undefined") {
                                    missingParents[levelDataPoints[i].parentId] = 0;
                                }
                                unique[levelDataPoints[i].parentId] = 0;
                            }
                            for (var mp in missingParents) {
                                filteredDataPoints.push(dataPoints.filter(function (d) { return d.ownId === mp; })[0]);
                            }
                        }
                        dataPoints = filteredDataPoints.filter(function (value, index, self) { return self.indexOf(value) === index; }).sort(function (d1, d2) { return d1.order - d2.order; }); // set new dataPoints based on the searchText
                        var parent = {};
                        for (var dp in dataPoints) {
                            if (typeof (parent[dataPoints[dp].parentId]) == "undefined") {
                                parent[dataPoints[dp].parentId] = 0;
                            }
                        }
                        dataPoints.map(function (d) { return d.isLeaf = parent[d.ownId] !== 0; });
                        // Add
                        var leafs = dataPoints.filter(function(d) { return d.isLeaf });
                    } else {
                        dataPoints = dataPoints.sort(function (d1, d2) { return d1.order - d2.order; });
                    }
                    // Set isHidden property
                    var parentRootNodes = [];
                    var parentRootNodesTemp = [];
                    var parentRootNodesTotal = [];
                    for (var l = 0; l < levels; l++) {
                        var expandedRootNodes = dataPoints.filter(function (d) { return d.isExpand && d.level === l; });
                        if (expandedRootNodes.length > 0) {
                            for (var n = 0; n < expandedRootNodes.length; n++) {
                                parentRootNodesTemp = parentRootNodes.filter(function (p) { return expandedRootNodes[n].parentId === p.ownId; }); //Is parent expanded?                        
                                if (l === 0 || (parentRootNodesTemp.length > 0)) {
                                    parentRootNodesTotal = parentRootNodesTotal.concat(expandedRootNodes[n]);
                                    dataPoints.filter(function (d) { return d.parentId === expandedRootNodes[n].ownId && d.level === l + 1; }).forEach(function (d) { return d.isHidden = false; });
                                }
                            }
                        }
                        parentRootNodes = parentRootNodesTotal;
                    }
                    // Determine partiallySelected
                    for (var l = levels; l >= 1; l--) {
                        var selectedNodes = dataPoints.filter(function(d) { return d.selected && d.level === l; });
                        if (selectedNodes.length > 0) {
                            for (var n = 0; n < selectedNodes.length; n++) {
                                var parents = dataPoints.filter(function(d) { return d.ownId === selectedNodes[n].parentId; })
                                                        .filter((value, index, self) => self.indexOf(value) === index) // Make unique
                                for (var p = 0; p < parents.length; p++) {
                                    var children = dataPoints.filter(function(d) { return d.parentId === parents[p].ownId; })
                                    if (children.length > children.filter(function(d) { return d.selected && !d.partialSelected; }).length) {
                                        parents[p].partialSelected = true;
                                        parents[p].selected = true;
                                    }
                                    if (children.length === children.filter(function(d) { return d.selected && !d.partialSelected; }).length) {
                                        parents[p].selected = true;
                                    }
                                }
                            }
                        }
                    }
                    // Select All level
                    if (selectAll) {
                        var selected = dataPoints.filter(function(d) { return d.selected }).length
                        dataPoints[0].selected = selected > 0 ? true : false;
                        dataPoints[0].partialSelected = (selected===0) || dataPoints.filter(function(d) { return d.selected }).length === dataPoints.length ? false : true;
                    }
                    return {
                        dataPoints: dataPoints,
                        fullTree: fullTree,
                        settings: defaultSettings,
                        levels: levels,
                        hasSelectionOverride: true,
                    };
                };
                HierarchySlicer.prototype.init = function (options) {
                    var headerButtonData = [
                        { title: "Clear", class: HierarchySlicer.Clear.class, icon: this.IconSet.clearAll },
                        { title: "Expand all", class: HierarchySlicer.Expand.class, icon: this.IconSet.expandAll },
                        { title: "Collapse all", class: HierarchySlicer.Collapse.class, icon: this.IconSet.collapseAll }
                    ];
                    var _this = this;
                    var hostServices = this.hostServices = options.host;
                    this.element = options.element;
                    this.viewport = options.viewport;
                    this.hostServices = options.host;
                    this.hostServices.canSelect = function () { return true; };
                    this.settings = HierarchySlicer.DefaultSlicerSettings();
                    this.selectionManager = new SelectionManager({ hostServices: options.host });
                    this.selectionManager.clear();
                    if (this.behavior)
                        this.interactivityService = visuals.createInteractivityService(hostServices);
                    this.slicerContainer = d3.select(this.element.get(0)).append("div").classed(HierarchySlicer.Container.class, true);
                    this.slicerHeaderContainer = this.slicerContainer.append("div").classed(HierarchySlicer.HeaderContainer.class, true);
                    this.slicerHeader = this.slicerHeaderContainer.append("div").classed(HierarchySlicer.Header.class, true);
                    this.slicerHeader
                        .selectAll(HierarchySlicer.Icon.class)
                        .data(headerButtonData)
                        .enter()
                        .append("div")
                        .classed(HierarchySlicer.Icon.class, true)
                        .classed("hiddenicon", true)
                        .attr("title", function (d) { return d.title; })
                        .each(function (d) { this.classList.add(d.class); })
                        //.on("mouseover", function (d) { d3.select(this).style("color", _this.settings.slicerText.hoverColor); })
                        //.on("mouseout", function (d) { d3.select(this).style("color", _this.settings.slicerText.fontColor); })
                        .html(function (d) { return d.icon; });
                    this.slicerHeader.append("div").classed(HierarchySlicer.HeaderText.class, true);
                    this.createSearchHeader(this.slicerHeaderContainer);

                    let bodyViewPort = this.getBodyViewport(this.viewport)
                    this.slicerBody = this.slicerContainer.append("div").classed(HierarchySlicer.Body.class, true).style({
                        "height": PixelConverter.toString(bodyViewPort.height),
                        "width": PixelConverter.toString(bodyViewPort.width),
                    });
                    var rowEnter = function (rowSelection) {
                        _this.onEnterSelection(rowSelection);
                    };
                    var rowUpdate = function (rowSelection) {
                        _this.onUpdateSelection(rowSelection, _this.interactivityService);
                    };
                    var rowExit = function (rowSelection) {
                        rowSelection.remove();
                    };
                    var treeViewOptions = {
                        rowHeight: this.getRowHeight(),
                        enter: rowEnter,
                        exit: rowExit,
                        update: rowUpdate,
                        loadMoreData: function () { return _this.onLoadMoreData(); },
                        scrollEnabled: true,
                        viewport: bodyViewPort,
                        baseContainer: this.slicerBody,
                        isReadMode: function () {
                            return (_this.hostServices.getViewMode() !== powerbi.ViewMode.Edit);
                        },
                        scrollToFrame: undefined
                    };
                    this.treeView = TreeViewFactory.createTreeView(treeViewOptions);
                };
                HierarchySlicer.prototype.update = function (options) {
                    this.viewport = options.viewport;
                    this.dataView = options.dataViews ? options.dataViews[0] : undefined;
                    if (options.viewport.height === this.viewport.height && options.viewport.width === this.viewport.width) {
                        this.waitingForData = false;
                    }
                    this.updateInternal(false);
                };
                HierarchySlicer.prototype.onDataChanged = function (options) {
                    var dataViews = options.dataViews;
                    if (_.isEmpty(dataViews)) {
                        return;
                    }
                    var existingDataView = this.dataView;
                    this.dataView = dataViews[0];
                    var resetScrollbarPosition = options.operationKind !== powerbi.VisualDataChangeOperationKind.Append && !powerbi.DataViewAnalysis.hasSameCategoryIdentity(existingDataView, this.dataView);
                    this.updateInternal(resetScrollbarPosition);
                };
                HierarchySlicer.prototype.onResizing = function (viewPort) {
                    this.viewport = viewPort;
                    this.updateInternal(false);
                };
                HierarchySlicer.prototype.convertAdvancedFilterConditionsToSlicerData = function (conditions, childIdentityFields) {
                    if (conditions.Count === 0) {
                        return [];
                    }
                    
                    let result = [];
                    conditions.values.forEach(function(value) {
                        let res = "";
                        
                        value.reverse().forEach(function(level, index) {
                            res += (res === "" ? "" : "_") + level.value.replace(/,/g, "") + "-" + index;
                        });

                        result.push(res);
                    });
                    
                    return result;
                };
                HierarchySlicer.prototype.updateInternal = function (resetScrollbar) {
                    var dataView = this.dataView, data = this.data = this.converter(dataView, $(this.searchInput)[0][0].value);
                    this.settings = this.data.settings;
                    this.maxLevels = this.data.levels + 1;
                    if (data.dataPoints.length === 0) {
                        this.treeView.empty();
                        return;
                    }
                    
                    this.updateSettings();
                    this.updateSlicerBodyDimensions();
                    this.treeView.viewport(this.getBodyViewport(this.viewport)).rowHeight(this.getRowHeight()).data(data.dataPoints.filter(function (d) { return !d.isHidden; }), function (d) { return $.inArray(d, data.dataPoints); }, resetScrollbar).render();
                    this.updateSearchHeader();
                };
                HierarchySlicer.prototype.updateSettings = function () {
                    this.updateSelectionStyle();
                    this.updateFontStyle();
                    this.updateHeaderStyle();
                    this.updateSearchStyle();
                };
                HierarchySlicer.prototype.updateSelectionStyle = function () {
                    var objects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
                    if (objects) {
                        this.settings.general.singleselect = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selection.singleselect, this.settings.general.singleselect);
                        this.slicerContainer.classed("isMultiSelectEnabled", !this.settings.general.singleselect);
                    }
                };
                HierarchySlicer.prototype.updateFontStyle = function () {
                    var objects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
                    if (objects) {
                        this.settings.slicerText.fontColor = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.fontColor, this.settings.slicerText.fontColor);
                        this.settings.slicerText.selectedColor = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.selectedColor, this.settings.slicerText.selectedColor);
                        this.settings.slicerText.background = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.background, this.settings.slicerText.background);
                        this.settings.slicerText.hoverColor = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.hoverColor, this.settings.slicerText.hoverColor);
                        this.settings.slicerText.textSize = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.textSize, this.settings.slicerText.textSize);
                    }
                };
                HierarchySlicer.prototype.updateHeaderStyle = function () {
                    var objects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
                    if (objects) {
                        this.settings.header.show = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.show, this.settings.header.show);
                        this.settings.header.fontColor = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.fontColor, this.settings.header.fontColor);
                        this.settings.header.hoverColor = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.hoverColor, this.settings.header.hoverColor);
                        this.settings.header.background = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.background, this.settings.header.background);
                        this.settings.header.textSize = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.textSize, this.settings.header.textSize);
                    }
                };
                HierarchySlicer.prototype.updateSearchStyle = function () {
                    var objects = this.dataView && this.dataView.metadata && this.dataView.metadata.objects;
                    if (objects) {
                        this.settings.search.fontColor = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.addSelection, this.settings.search.addSelection);
                        this.settings.search.fontColor = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.fontColor, this.settings.search.fontColor);
                        this.settings.search.iconColor = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.iconColor, this.settings.search.iconColor);
                        this.settings.search.background = powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.background, this.settings.search.background);
                        this.settings.search.textSize = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.textSize, this.settings.search.textSize);
                    }
                };
                HierarchySlicer.prototype.updateSlicerBodyDimensions = function () {
                    var slicerViewport = this.getBodyViewport(this.viewport);
                    this.slicerBody.style({
                        "height": PixelConverter.toString(slicerViewport.height),
                        "width": "100%",
                    });
                };
                HierarchySlicer.prototype.onEnterSelection = function (rowSelection) {
                    var _this = this;
                    var settings = this.settings;
                    if (!settings) {
                        return
                    }
                    var treeItemElementParent = rowSelection
                        .selectAll("li")
                        .data(function(d) {
                            return [d];
                    });
                    treeItemElementParent
                        .exit()
                        .remove();
        
                    treeItemElementParent
                        .style({
                            "background-color": settings.slicerText.background,
                            "height": "100%"
                        });
        
                    treeItemElementParent
                        .enter()
                        .append("li")
                        .classed(HierarchySlicer.ItemContainer.class, true);
    
                    // Expand/collapse
                    if (this.maxLevels > 1) {
                        var expandCollapse = treeItemElementParent
                            .selectAll(HierarchySlicer.ItemContainerExpander.selectorName)
                            .data(function(d) {
                                return [d];
                        });
                        expandCollapse.exit().remove();
                        expandCollapse
                            .enter()
                            .append("div", ":first-child")
                            .classed(HierarchySlicer.ItemContainerExpander.class, true)
                            .insert("div")
                            .classed("icon", true)
                            .classed("icon-left", true)
                            .style({
                                "visibility": function (d) { return d.isLeaf ? "hidden" : "visible"; },
                                "font-size": PixelConverter.toString(PixelConverter.fromPointToPixel(settings.slicerText.textSize)),
                                "margin-left" :  function(d) { return PixelConverter.toString(-settings.slicerText.textSize / (2.5)); },
                                "width": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(settings.slicerText.textSize))),
                                "height": PixelConverter.toString(Math.ceil(1.35 * PixelConverter.fromPointToPixel(settings.slicerText.textSize))),
                                "fill": settings.slicerText.fontColor,
                            })
                                .html(function(d) { return d.isExpand ? _this.IconSet.expand : _this.IconSet.collapse });

                                //.classed("collapsed", function(d) { return !d.isExpand })
                                //.classed("expanded", function(d) { return d.isExpand })
                            
                        expandCollapse.selectAll(HierarchySlicer.ItemContainerExpander.selectorName)
                            .data(function(d) {
                                return [d];
                            })
                            .enter()
                            .insert("div") // Spinner location
                            .classed("spinner-icon", true)
                            .style({
                                "display": "none",
                                "font-size": PixelConverter.toString(PixelConverter.fromPointToPixel(settings.slicerText.textSize)),
                                "padding-bottom" : function(d) { return PixelConverter.toString(settings.slicerText.textSize / (d.isExpand ? 3 : 1.8)); },
                                "margin-left" :  function(d) { return PixelConverter.toString(-settings.slicerText.textSize / (2.5)); },
                                "width": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(settings.slicerText.textSize))),
                                "height": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(settings.slicerText.textSize))) 
                            });
                        //});
                    }
                    var treeItemElement = treeItemElementParent.append("div").classed(HierarchySlicer.ItemContainerChild.class, true);
                    var checkBoxParent = treeItemElement.selectAll(HierarchySlicer.Input.selector).data(function(d) {return [d];});
                    checkBoxParent.enter().append("div").classed(HierarchySlicer.Input.class, true);
                    var checkBoxInput = checkBoxParent.selectAll("input").data(function(d) {return [d];});
                    checkBoxInput.enter().append("input").attr("type", "checkbox");
                    var checkBoxSpan = checkBoxParent.selectAll(HierarchySlicer.Checkbox.selector).data(function(d) {return [d];});
                    checkBoxSpan.enter().append("span").classed(HierarchySlicer.Checkbox.class, true);;
                    checkBoxSpan.style({
                            "width": (.75 * settings.slicerText.textSize) + "px",
                            "height": (.75 * settings.slicerText.textSize) + "px",
                            "margin-right": PixelConverter.fromPointToPixel(.25 * settings.slicerText.textSize) + "px",
                            "margin-bottom": PixelConverter.fromPointToPixel(.25 * settings.slicerText.textSize) + "px"
                        });
                    var labelElement = treeItemElement.selectAll(HierarchySlicer.LabelText.selector).data(function(d) {return [d];});
                    labelElement.enter().append("span").classed(HierarchySlicer.LabelText.class, true);
                    labelElement.style({
                            "color": settings.slicerText.fontColor,
                            "font-size": settings.slicerText.textSize + "pt"
                        });
                    var maxLevel = this.maxLevels;
                    treeItemElementParent.each(function (d, i) {
                        let item = d3.select(this);
                        item.style("padding-left", (maxLevel === 1 ? 8 : (d.level * settings.slicerText.textSize)) + "px");
                    });
                };
                HierarchySlicer.prototype.onUpdateSelection = function (rowSelection, interactivityService) {
                    var settings = this.settings;
                    if (!settings) {
                        return
                    }
                    var data = this.data;
                    if (data) {
                        if (settings.header.show) {
                            this.slicerHeader.style("display", "block");
                        }
                        else {
                            this.slicerHeader.style("display", "none");
                        }
                        this.slicerHeader.select(HierarchySlicer.HeaderText.selector).text(settings.header.title.trim()).style({
                            "color": settings.header.fontColor,
                            "background-color": settings.header.background,
                            "border-style": "solid",
                            "border-color": settings.general.outlineColor,
                            "border-width": this.getBorderWidth(settings.header.outline, settings.header.outlineWeight),
                            "font-size": settings.header.textSize + "pt" //PixelConverter.fromPoint(settings.header.textSize),
                        });
                        let icons = this.slicerHeader.selectAll(HierarchySlicer.Icon.selector);
                        icons.style({
                                "height": PixelConverter.toString(PixelConverter.fromPointToPixel(settings.header.textSize)),
                                "width": PixelConverter.toString(PixelConverter.fromPointToPixel(settings.header.textSize)),
                                "fill": settings.header.fontColor,
                                "background-color": settings.header.background
                            })
                            .on("mouseover", function (d) { d3.select(this).style("fill", settings.header.hoverColor); })
                            .on("mouseout", function (d) { d3.select(this).style("fill", settings.header.fontColor); })
                        this.slicerBody.classed("slicerBody", true);
                        var slicerText = rowSelection.selectAll(HierarchySlicer.LabelText.selector);
                        slicerText.text(function (d) {
                            return d.value;
                        });
                        if (interactivityService && this.slicerBody) {
                            var body = this.slicerBody.attr("width", this.viewport.width);
                            var expanders = body.selectAll(HierarchySlicer.ItemContainerExpander.selector);
                            var slicerItemContainers = body.selectAll(HierarchySlicer.ItemContainerChild.selector);
                            var slicerItemLabels = body.selectAll(HierarchySlicer.LabelText.selector);
                            var slicerItemInputs = body.selectAll(HierarchySlicer.Input.selector);
                            var slicerClear = this.slicerHeader.select(HierarchySlicer.Clear.selector);
                            var slicerExpand = this.slicerHeader.select(HierarchySlicer.Expand.selector);
                            var slicerCollapse = this.slicerHeader.select(HierarchySlicer.Collapse.selector);
                            var behaviorOptions = {
                                hostServices: this.hostServices,
                                dataPoints: data.dataPoints,
                                fullTree: data.fullTree,
                                expanders: expanders,
                                slicerContainer: this.slicerContainer,
                                slicerItemContainers: slicerItemContainers,
                                slicerItemLabels: slicerItemLabels,
                                slicerItemInputs: slicerItemInputs,
                                slicerClear: slicerClear,
                                slicerExpand: slicerExpand,
                                slicerCollapse: slicerCollapse,
                                interactivityService: interactivityService,
                                slicerSettings: data.settings,
                                levels: data.levels,
                            };
                            try {
                                interactivityService.bind(data.dataPoints, this.behavior, behaviorOptions, {
                                    overrideSelectionFromData: true,
                                    hasSelectionOverride: data.hasSelectionOverride
                                });
                            }
                            catch (e) {
                            }
                            this.behavior.styleSlicerInputs(rowSelection.select(HierarchySlicer.ItemContainerChild.selector), interactivityService.hasSelection());
                        }
                        else {
                            this.behavior.styleSlicerInputs(rowSelection.select(HierarchySlicer.ItemContainerChild.selector), false);
                        }
                    }
                };
                HierarchySlicer.prototype.onLoadMoreData = function () {
                    var dataView = this.dataView;
                    if (!dataView)
                        return;
                    var dataViewMetadata = dataView.metadata;
                    // Making sure that hostservices.loadMoreData is not invoked when waiting for server to load the next segment of data
                    if (!this.waitingForData && dataViewMetadata && dataViewMetadata.segment) {
                        this.hostServices.loadMoreData();
                        this.waitingForData = true;
                    }
                };
                HierarchySlicer.getTextProperties = function (textSize) {
                    return {
                        fontFamily: HierarchySlicer.DefaultFontFamily,
                        fontSize: PixelConverter.fromPoint(textSize || HierarchySlicer.DefaultFontSizeInPt),
                    };
                };
                HierarchySlicer.prototype.getSearchHeight = function () {
                    if (this.settings.general.selfFilterEnabled) {
                        return powerbi.TextMeasurementService.estimateSvgTextHeight(HierarchySlicer.getTextProperties(this.settings.search.textSize)) + 2; // 2 for marge
                    }
                    return 0;
                }
                HierarchySlicer.prototype.getHeaderHeight = function () {
                    if (this.settings.header.show) {
                        return powerbi.TextMeasurementService.estimateSvgTextHeight(HierarchySlicer.getTextProperties(this.settings.header.textSize));
                    }
                    return 0;
                };
                HierarchySlicer.prototype.getRowHeight = function () {
                    return powerbi.TextMeasurementService.estimateSvgTextHeight(HierarchySlicer.getTextProperties(this.settings.slicerText.textSize));
                };
                HierarchySlicer.prototype.getBodyViewport = function (currentViewport) {
                    var settings = this.settings;
                    var headerHeight;
                    var slicerBodyHeight;
                    if (settings) {
                        headerHeight = this.getHeaderHeight() + this.getSearchHeight();
                        slicerBodyHeight = currentViewport.height - (headerHeight + settings.header.borderBottomWidth);
                    }
                    else {
                        headerHeight = 0;
                        slicerBodyHeight = currentViewport.height - (headerHeight + 1);
                    }
                    return {
                        height: slicerBodyHeight,
                        width: currentViewport.width
                    };
                };
                HierarchySlicer.prototype.getBorderWidth = function (outlineElement, outlineWeight) {
                    switch (outlineElement) {
                        case "None":
                            return "0px";
                        case "BottomOnly":
                            return "0px 0px " + outlineWeight + "px 0px";
                        case "TopOnly":
                            return outlineWeight + "px 0px 0px 0px";
                        case "TopBottom":
                            return outlineWeight + "px 0px " + outlineWeight + "px 0px";
                        case "LeftRight":
                            return "0px " + outlineWeight + "px 0px " + outlineWeight + "px";
                        case "Frame":
                            return outlineWeight + "px";
                        default:
                            return outlineElement.replace("1", outlineWeight.toString());
                    }
                };
                HierarchySlicer.prototype.createSearchHeader = function (container) {
                    var _this = this;
                    this.searchHeader = container.append("div")
                                                .classed(HierarchySlicer.SearchHeader.class, true)
                                                .classed("collapsed", true);
                    var counter = 0;
                    //$("<div>").appendTo(this.searchHeader)
                    this.searchHeader.append("div")
                        .attr("title", "Search")
                        .classed(HierarchySlicer.Icon.class, true)
                        .classed("search", true)
                        .style({
                            "fill": this.settings.search.iconColor,
                            "width": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSize))),
                            "height": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSize))),
                        })
                        .html(this.IconSet.search)
                        .on("click", function () {
                            return _this.hostServices.persistProperties({
                                merge: [{
                                    objectName: "general",
                                    selector: null,
                                    properties: {
                                        counter: counter++
                                    }
                                }]
                            });
                        });
                    this.searchInput = this.searchHeader.append("input")
                        .attr("type", "text")
                        .attr("drag-resize-disabled", "true")
                        .classed("searchInput", true)
                        .style({
                            "color": this.settings.search.fontColor,
                            "background-color": this.settings.search.background
                        })
                        .on("input", function () {
                            return _this.hostServices.persistProperties({
                                merge: [{
                                    objectName: "general",
                                    selector: null,
                                    properties: {
                                        counter: counter++
                                    }
                                }]
                            }); 
                        });
                    this.searchHeader.append("div")
                        .attr("title", "Delete")
                        .classed(HierarchySlicer.Icon.class, true)
                        .classed("delete", true)
                        .style({
                            "fill": this.settings.search.iconColor,
                            "width": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSize))),
                            "height": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSize))),
                        })
                        .html(this.IconSet.delete)
                        .on("click", function () {
                            $(_this.searchInput)[0][0].value = "";
                            _this.hostServices.persistProperties({
                                merge: [{
                                    objectName: "general",
                                    selector: null,
                                    properties: {
                                        counter: counter++
                                    }
                                }]
                            });
                        });
                };
                HierarchySlicer.prototype.updateSearchHeader = function () {
                    this.searchHeader.classed("show", this.settings.general.selfFilterEnabled);
                    this.searchHeader.classed("collapsed", !this.settings.general.selfFilterEnabled);
                    if (this.settings.general.selfFilterEnabled) {
                        let icons = this.searchHeader.selectAll(HierarchySlicer.Icon.selector);
                        icons.style({
                            "fill": this.settings.search.iconColor,
                            "width": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSize))),
                            "height": PixelConverter.toString(Math.ceil(.95 * PixelConverter.fromPointToPixel(this.settings.search.textSize))),
                        });
                        let searchInput = this.searchHeader.selectAll(".searchInput");
                        searchInput.style({
                            "color": this.settings.search.fontColor,
                            "background-color": this.settings.search.background,
                            "font-size": this.settings.search.textSize
                        });
                    }
                };
                HierarchySlicer.prototype.enumerateObjectInstances = function (options) {
                    var instances = [];
                    var objects = this.dataView.metadata.objects;
                    switch (options.objectName) {
                        case "selection":
                            var singleSelect = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selection.singleselect, this.settings.general.singleselect);
                            var emptyLeafs = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selection.emptyLeafs, this.settings.general.emptyLeafs)
                            var selectAll = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selection.selectAll, this.settings.general.selectAll);
                            var selectAllLabel = powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.selection.selectAllLabel, this.settings.general.selectAllLabel)
                            var selectionOptions = selectAll ? {
                                objectName: "selection",
                                displayName: "Selection",
                                selector: null,
                                properties: {
                                    singleSelect: singleSelect,
                                    emptyLeafs: emptyLeafs,
                                    selectAll: selectAll,
                                    selectAllLabel: selectAllLabel
                                }
                            } : {
                                objectName: "selection",
                                displayName: "Selection",
                                selector: null,
                                properties: {
                                    singleSelect: singleSelect,
                                    emptyLeafs: emptyLeafs,
                                    selectAll: selectAll
                                }
                            };
                            instances.push(selectionOptions);
                            break;
                        case "header":
                            var headerOptions = {
                                objectName: "header",
                                displayName: "Header",
                                selector: null,
                                properties: {
                                    show: powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.show, this.settings.header.show),
                                    title: powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.title, this.settings.header.title),
                                    fontColor: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.fontColor, this.settings.header.fontColor),
                                    hoverColor: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.hoverColor, this.settings.header.hoverColor),
                                    background: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.background, this.settings.header.background),
                                    textSize: powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.header.textSize, this.settings.header.textSize),
                                }
                            };
                            instances.push(headerOptions);
                            break;
                        case "items":
                            var items = {
                                objectName: "items",
                                displayName: "Items",
                                selector: null,
                                properties: {
                                    fontColor: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.fontColor, this.settings.slicerText.fontColor),
                                    selectedColor: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.selectedColor, this.settings.slicerText.selectedColor),
                                    background: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.background, this.settings.slicerText.background),
                                    hoverColor: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.hoverColor, this.settings.slicerText.hoverColor),
                                    textSize: powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.items.textSize, this.settings.slicerText.textSize),
                                }
                            };
                            instances.push(items);
                            break;
                        case "search":
                            let search = {
                                objectName: "search",
                                displayName: "Search",
                                selector: null,
                                properties: {
                                    addSelection: powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.addSelection, this.settings.search.addSelection),
                                    fontColor: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.fontColor, this.settings.search.fontColor),
                                    iconColor: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.iconColor, this.settings.search.iconColor),
                                    background: powerbi.DataViewObjects.getFillColor(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.background, this.settings.search.background),
                                    textSize: powerbi.DataViewObjects.getValue(objects, HierarchySlicer1458836712039.hierarchySlicerProperties.search.textSize, this.settings.search.textSize),
                                }
                            };
                            instances.push(search);
                            break;
                    }
                    return instances;
                };
                HierarchySlicer.capabilities = {
                    dataRoles: [{
                        name: "Fields",
                        kind: powerbi.VisualDataRoleKind.Grouping,
                        displayName: "Fields"
                    }, {
                        name: "Values",
                        kind: powerbi.VisualDataRoleKind.Measure,
                        displayName: "Values",
                    }],
                    dataViewMappings: [{
                        conditions: [{
                            "Values": { min: 0, max: 1 }
                        }],
                        table: {
                            rows: {
                                select: 
                                [
                                    {for: { in: "Fields" } },
                                    {for: { in: "Values" } }
                                ], dataReductionAlgorithm: { bottom: { count: 30000 } }
                            },
                        }
                    }],
                    objects: {
                        general: {
                            displayName: "General",
                            properties: {
                                filter: {
                                    type: { filter: {} }
                                },
                                filterValues: {
                                    type: { text: true }
                                },
                                expanded: {
                                    type: { text: true }
                                },
                                hidden: {
                                    type: { text: true }
                                },
                                defaultValue: {
                                    type: { expression: { defaultValue: true } },
                                },
                                formatString: {
                                    type: {
                                        formatting: { formatString: true }
                                    },
                                },
                                selfFilter: {
                                    type: { filter: { selfFilter: true } },
                                },
                                selfFilterEnabled: {
                                    type: { operations: { searchEnabled: true } }
                                },
                                version: {
                                    type: { numeric: true }
                                },
                            },
                        },
                        selection: {
                            displayName: "Selection",
                            properties: {
                                singleSelect: {
                                    displayName: "Single Select",
                                    type: { bool: true }
                                },
                                emptyLeafs: {
                                    displayName: "Empty Leaves",
                                    description: "Show empty leaves as (Blank)",
                                    type: { bool: true }
                                },
                                selectAll: {
                                    displayName: "Select All",
                                    description: "Show the 'Select All' member",
                                    type: { bool: true }
                                },
                                selectAllLabel: {
                                    displayName: "Select All Label",
                                    description: "Label for 'Select All' member",
                                    type: { text: true }
                                }
                            },
                        },
                        header: {
                            displayName: "Header",
                            properties: {
                                show: {
                                    displayName: "Show",
                                    type: { bool: true }
                                },
                                title: {
                                    displayName: "Title",
                                    type: { text: true }
                                },
                                fontColor: {
                                    displayName: "Font color",
                                    description: "Font color of the title",
                                    type: { fill: { solid: { color: true } } }
                                },
                                hoverColor: {
                                    displayName: "Hover",
                                    description: "Title color of the cells when the mouse if hovered over",
                                    type: { fill: { solid: { color: true } } }
                                },
                                background: {
                                    displayName: "Background",
                                    type: { fill: { solid: { color: true } } }
                                },
                                textSize: {
                                    displayName: "Text Size",
                                    type: { formatting: { fontSize: true } }
                                },
                            },
                        },
                        items: {
                            displayName: "Items",
                            properties: {
                                fontColor: {
                                    displayName: "Font color",
                                    description: "Font color of the cells",
                                    type: { fill: { solid: { color: true } } }
                                },
                                selectedColor: {
                                    displayName: "Select color",
                                    description: "Font color of the selected cells",
                                    type: { fill: { solid: { color: true } } }
                                },
                                hoverColor: {
                                    displayName: "Hover",
                                    description: "Color of the cells when the mouse if hovered over",
                                    type: { fill: { solid: { color: true } } }
                                },
                                background: {
                                    displayName: "Background",
                                    type: { fill: { solid: { color: true } } }
                                },
                                textSize: {
                                    displayName: "Text Size",
                                    type: { formatting: { fontSize: true } }
                                },
                            },
                        },
                        search: {
                            displayName: "Search",
                            properties: {
                                addSelection: {
                                    displayName: "Add to selection",
                                    description: "Add search selection to \ncurrent selection (multiselect only)",
                                    type: { bool: true }
                                },
                                fontColor: {
                                    displayName: "Font color",
                                    description: "Font color of the search",
                                    type: { fill: { solid: { color: true } } }
                                },
                                iconColor: {
                                    displayName: "Icon color",
                                    description: "Color of the search icons",
                                    type: { fill: { solid: { color: true } } }
                                },
                                background: {
                                    displayName: "Background",
                                    discription: "Background color of the searchbox",
                                    type: { fill: { solid: { color: true } } }
                                },
                                textSize: {
                                    displayName: "Text Size",
                                    type: { formatting: { fontSize: true } }
                                },
                            },
                        }
                    },
                    supportsHighlight: true,
                    suppressDefaultTitle: true,
                    //supportsSynchronizingFilterState: true,
                    //supportsMultiVisualSelection: true,
                    filterMappings: {
                        measureFilter: { targetRoles: ["Fields"] },
                    },
                    sorting: {
                        default: {},
                    }
                };
                HierarchySlicer.formatStringProp = {
                    objectName: "general",
                    propertyName: "formatString",
                };
                HierarchySlicer.DefaultFontFamily = "Segoe UI, Tahoma, Verdana, Geneva, sans-serif";
                HierarchySlicer.DefaultFontSizeInPt = 11;
                HierarchySlicer.Container = createClassAndSelector("slicerContainer");
                HierarchySlicer.Body = createClassAndSelector("slicerBody");
                HierarchySlicer.ItemContainer = createClassAndSelector("slicerItemContainer");
                HierarchySlicer.ItemContainerSpinner = createClassAndSelector("slicerItemContainerSpinner");
                HierarchySlicer.ItemContainerExpander = createClassAndSelector("slicerItemContainerExpander");
                HierarchySlicer.ItemContainerChild = createClassAndSelector("slicerItemContainerChild");
                HierarchySlicer.LabelText = createClassAndSelector("slicerText");
                HierarchySlicer.CountText = createClassAndSelector("slicerCountText");
                HierarchySlicer.Checkbox = createClassAndSelector("checkbox");
                HierarchySlicer.HeaderContainer = createClassAndSelector("slicerHeaderContainer");
                HierarchySlicer.Header = createClassAndSelector("slicerHeader");
                HierarchySlicer.HeaderText = createClassAndSelector("headerText");
                HierarchySlicer.SearchHeader = createClassAndSelector("searchHeader");
                HierarchySlicer.Collapse = createClassAndSelector("collapse");
                HierarchySlicer.Expand = createClassAndSelector("expand");
                HierarchySlicer.Clear = createClassAndSelector("clear");
                HierarchySlicer.Icon = createClassAndSelector("icon");
                HierarchySlicer.Input = createClassAndSelector("slicerCheckbox");
                return HierarchySlicer;
            })();
            HierarchySlicer1458836712039.HierarchySlicer = HierarchySlicer;
        })(HierarchySlicer1458836712039 = visuals.HierarchySlicer1458836712039 || (visuals.HierarchySlicer1458836712039 = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.HierarchySlicer1458836712039 = {
                name: "HierarchySlicer1458836712039",
                class: "HierarchySlicer1458836712039",
                capabilities: powerbi.visuals.HierarchySlicer1458836712039.HierarchySlicer.capabilities,
                custom: true,
                create: function (options) { return new powerbi.visuals.HierarchySlicer1458836712039.HierarchySlicer(options); },
                apiVersion: null
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
