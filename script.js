/******************************************************************************************************
 *                                             SPIME START 
 ******************************************************************************************************/
var LightBox = {};

/******************************************************************************************************
 *                                               MAIN
 *                                  called from body onLoad func    
 ******************************************************************************************************/

LightBox.initLinks = function(holder) {
    //Only in viewer mode
    if (typeof window["EditorHelper"] == "undefined") {
        var links;
        if (holder) {
            links = holder.find("a[data-link-type='LIGHTBOX']");
        } else {
            links = $("a[data-link-type='LIGHTBOX']");
        }
        links.each(function() {
            var currentLink = $(this);
            currentLink.removeAttr("href");
            currentLink.removeAttr("target");
            currentLink.addClass("clickable");
            //blocking media widgets to show lightbox
            if (currentLink.closest(".item-box").find("[data-menu-name='PREVIEW_RAW']").length > 0 && currentLink.is(".image-link")) {
                currentLink.remove();
            }
            currentLink.unbind("click").bind("click", function(e) {
                e.stopPropagation();
                //blocking media widgets to show lightbox
                if (currentLink.closest(".item-box").find("[data-menu-name='PREVIEW_RAW']").length > 0) {
                    e.preventDefault();
                    return false;
                }
                LightBox.itemClick($(this).closest(".item-content"));
                return false;
            });
        });

        var registerLinks;
        if (holder) {
            registerLinks = holder.find("a[href^='register://'] , a[href^='registers://']");
        } else {
            registerLinks = $("a[href^='register://'], a[href^='registers://']");
        }
        if (registerLinks.length > 0) {
            if (typeof XPRSTranslator == "undefined") {
                $("<script/>").attr("src", XPRSHelper.getServerPath() + "/translation_js").appendTo("head");
                $("<script/>").attr("src", XPRSHelper.getServerPath() + "/js/lib/jquery.cookie.min.js").appendTo("head");
                var loginWrapper = $("<div/>").attr("id", "lightbox-menus-holder").css({ "height": "100%", "width": "100%", "position": "fixed", "top": "0px", "left": "0px", "display": "table", "background-color": "rgba(0,0,0,0.1)", "z-index": "99999999" }).hide();
                $("body").append(loginWrapper);
                loginWrapper.load(XPRSHelper.getServerPath() + "/login?form_only=true")
            }
        }
        registerLinks.each(function() {
            var currentLink = $(this);
            currentLink.attr("data-href", currentLink.attr("href").replace("register://", "http://").replace("registers://", "https://"));
            currentLink.removeAttr("href");
            currentLink.removeAttr("target");
            currentLink.addClass("clickable");
            currentLink.unbind("click").bind("click", function(e) {
                e.stopPropagation();
                XPRSHelper.invokeLogin(function() {
                    location.href = currentLink.attr("data-href");
                }, "register");
                return false;
            });
        });

    }
};


LightBox.itemClick = function(currentItem) {
    var imageSrc = currentItem.attr("data-bgimg");
    var videoSrc = "";
    var videoFrame = currentItem.find(".video-frame");
    if (videoFrame.length > 0) {
        //var videoFrame = currentItem.find(".video-frame");
        if (videoFrame.length > 0) {
            videoSrc = videoFrame.attr("src");
        }
    }
    if (imageSrc == "") {
        //no image
        return;
    }

    var title = currentItem.find(".preview-title");
    var subtitle = currentItem.find(".preview-subtitle");

    var currentHolder = currentItem.closest(".item-box");
    var itemSiblings = currentHolder.siblings(".sub.item-box").not(":has([data-menu-name='PREVIEW_RAW'])");
    if (itemSiblings.length > 0) {
        itemSiblings = itemSiblings.add(currentHolder);
    }
    var lightboxWrapper = $(".light-box-wrapper");
    var closeBtn = lightboxWrapper.find(".close-lightbox-btn");
    closeBtn.unbind("click").bind("click", function(e) {
        e.stopPropagation();
        //remove the video before closing
        $(".light-box-wrapper").find("iframe").remove();
        $(".light-box-wrapper").hide();
    });
    var stripe = currentHolder.closest(".master.item-box");
    var downloadBtn = lightboxWrapper.find(".download-gallery-btn");
    if (stripe.find(".container").attr("data-allow-download") == "true") {
        downloadBtn.show();
        downloadBtn.unbind("click").bind("click", function(e) {
            e.stopPropagation();
            location.href = XPRSHelper.getStaticServerPath() + "/download_gallery?vbid=" + stripe.attr("id");
        });
    } else {
        downloadBtn.hide();
    }

    //Close lightbox when clicking outside the image
    lightboxWrapper.unbind("click").bind("click", function(e) {
        e.stopPropagation();
        //remove the video before closing
        $(".light-box-wrapper").find("iframe").remove();
        $(".light-box-wrapper").hide();
    });


    var lightboxImageHolder = lightboxWrapper.find(".light-box-image-holder");
    var lightboxImage = lightboxImageHolder.find(".light-box-image");

    //Catch the click (do not close when clicking on the image
    lightboxImage.unbind("click").bind("click", function(e) {
        e.stopPropagation();
    });

    var textWrapper = lightboxWrapper.find(".lightbox-text-wrapper");
    var textHolder = textWrapper.find(".lightbox-text-holder");
    var titleHolder = textWrapper.find(".lightbox-title").text(title.text());
    var subtitleHolder = textWrapper.find(".lightbox-subtitle").text(subtitle.text());
    var imageOrigHeight = currentItem.attr("data-orig-thumb-height");
    var imageOrigWidth = currentItem.attr("data-orig-thumb-width");
    var newWidth = parseInt(imageOrigWidth);
    if (isNaN(newWidth)) {
        newWidth = 1600;
    } else {
        newWidth = Math.min(parseInt(imageOrigWidth), 1600)
    }
    var imageId = currentItem.attr("data-vbid");
    lightboxImage.find("iframe").remove();
    if (videoSrc != "") {
        lightboxImage.attr("data-videosrc", videoSrc);
        var videoIframe = $("<iframe />").css({ "width": "100%", "height": "100%", "border": "none" }).attr("src", videoSrc);
        lightboxImage.append(videoIframe);
        lightboxImage.css("background-image", "");
    } else {
        if (!currentHolder.closest(".master.item-box").is(".showing-feed")) {
            lightboxImage.css("background-image", "url('" + imageSrc + "=s" + newWidth + "')");
        } else {
            lightboxImage.css("background-image", "url('" + imageSrc + "')");
        }
        lightboxImage.attr("data-orig-thumb-height", imageOrigHeight);
        lightboxImage.attr("data-orig-thumb-width", imageOrigWidth);
    }

    //lightboxImage.attr("data-orig-thumb-height",imageOrigHeight);
    //lightboxImage.attr("data-orig-thumb-width",imageOrigWidth);

    lightboxImage.attr("data-vbid", imageId);
    //titleHolder.css({"color":title.css("color"),"text-shadow":title.css("text-shadow"),"font-family":title.css("font-family")});
    //subtitleHolder.css({"color":subtitle.css("color"),"text-shadow":subtitle.css("text-shadow"),"font-family":subtitle.css("font-family")});
    titleHolder.css({ "font-family": title.css("font-family"), "text-align": title.css("text-align") });
    if (title.css("text-align") == "center") {
        titleHolder.css({ "margin-left": "auto", "margin-right": "auto" });
    } else if (title.css("text-align") == "right") {
        titleHolder.css({ "margin-left": "auto", "margin-right": "" });
    } else {
        titleHolder.css({ "margin-left": "", "margin-right": "" });
    }
    subtitleHolder.css({ "font-family": subtitle.css("font-family"), "text-align": subtitle.css("text-align") });
    if (subtitle.css("text-align") == "center") {
        subtitle.css({ "margin-left": "auto", "margin-right": "auto" });
    } else if (subtitle.css("text-align") == "right") {
        subtitle.css({ "margin-left": "auto", "margin-right": "" });
    } else {
        subtitle.css({ "margin-left": "", "margin-right": "" });
    }
    lightboxWrapper.show();
    setTimeout(function() {
        XPRSHelper.onCssTransitionFinish(lightboxImage, function() {
            textHolder.css("opacity", "1");
            closeBtn.css("opacity", "1");
            LightBox.arrange();
        });

    }, 0);
    LightBox.addPagination(textHolder, lightboxWrapper, itemSiblings);
};

LightBox.arrange = function() {
    var lightboxWrapper = $(".light-box-wrapper");
    var offset = (typeof window["EditorHelper"] == "undefined") ? 0 : 50;
    if (lightboxWrapper.is(":visible")) {
        var lightboxImageHolder = lightboxWrapper.find(".light-box-image-holder");
        var lightboxImage = lightboxImageHolder.find(".light-box-image");
        var lightboxTextWrapper = lightboxWrapper.find(".lightbox-text-wrapper");
        var deviceWidth = $(".main-page").width();
        var deviceHeight = Math.min($(window).height(), $(".main-page").height()) - offset; //$(".main-page").height() - lightboxTextWrapper.height();

        var borderWidth = deviceWidth * 0.1;
        var borderHeight = deviceHeight * 0.2;
        var imageOrigHeight = lightboxImage.attr("data-orig-thumb-height");
        var imageOrigWidth = lightboxImage.attr("data-orig-thumb-width");
        lightboxImage.css({ "width": deviceWidth - borderWidth, "height": deviceHeight - borderHeight, "max-width": imageOrigWidth + "px", "max-height": imageOrigHeight + "px" });
    }
};

LightBox.addPagination = function(paginatorHolder, wrapper, items) {
    var paginator = wrapper.find("#paginator");
    paginator.empty();
    var lightboxWrapper = $(".light-box-wrapper");
    var lightboxImageHolder = lightboxWrapper.find(".light-box-image-holder");
    var lightboxImage = lightboxImageHolder.find(".light-box-image");
    items.each(function() {
        var currentHolder = $(this);
        var currentItem = currentHolder.find(".item-content");

        var videoSrc = "";
        var videoFrame = currentItem.find(".video-frame");
        if (videoFrame.length > 0) {
            //var videoFrame = currentItem.find(".video-frame");
            if (videoFrame.length > 0) {
                videoSrc = videoFrame.attr("src");
            } else {
                return;
            }
        }
        var imageOrigHeight = currentItem.attr("data-orig-thumb-height");
        var imageOrigWidth = currentItem.attr("data-orig-thumb-width");
        var newWidth = parseInt(imageOrigWidth);
        if (isNaN(parseInt(newWidth))) {
            newWidth = 1600;
        } else {
            newWidth = Math.min(parseInt(imageOrigWidth), 1600)
        }
        var imageSrc = currentItem.attr("data-bgimg");

        if (imageSrc == "") {
            return;
        } else if (!currentHolder.closest(".master.item-box").is(".showing-feed")) {
            imageSrc += "=s" + newWidth;
        }
        var imageId = currentItem.attr("data-vbid");
        var title = currentItem.find(".preview-title").text();
        var subtitle = currentItem.find(".preview-subtitle").text();
        var pageNavigator = $("<div />").addClass("page-navigator");
        if (videoSrc != "") {
            pageNavigator.attr("data-videosrc", videoSrc);
        } else {
            pageNavigator.attr("data-bgimg", imageSrc);
            pageNavigator.attr("data-orig-thumb-height", imageOrigHeight);
            pageNavigator.attr("data-orig-thumb-width", imageOrigWidth);
        }
        pageNavigator.attr("data-title", title);
        pageNavigator.attr("data-subtitle", subtitle);
        pageNavigator.attr("data-vbid", imageId);


        pageNavigator.unbind("click").bind("click", function() {
            var currentPaginator = $(this);
            lightboxImage.find("iframe").remove();
            if (currentPaginator.attr("data-videosrc")) {
                var videoIframe = $("<iframe />").css({ "width": "100%", "height": "100%", "border": "none" }).attr("src", currentPaginator.attr("data-videosrc"));
                lightboxImage.append(videoIframe);
                lightboxImage.css("background-image", "");
            } else {
                lightboxImage.css("background-image", "url('" + currentPaginator.attr("data-bgimg") + "')");
                lightboxImage.attr("data-orig-thumb-height", imageOrigHeight);
                lightboxImage.attr("data-orig-thumb-width", imageOrigWidth);
            }


            lightboxImage.attr("data-vbid", imageId);
            wrapper.find(".lightbox-title").text(currentPaginator.attr("data-title"));
            wrapper.find(".lightbox-subtitle").text(currentPaginator.attr("data-subtitle"));
            setTimeout(function() {
                LightBox.arrange();
            }, 0);
        });
        paginator.append(pageNavigator);
    });

    if (items.length > 1) {
        lightboxWrapper.find(".lightbox-arrow").show();
        lightboxWrapper.find(".lightbox-arrow").unbind("click").bind("click", function(e) {
            e.stopPropagation();
            lightboxImage.find("iframe").remove();
            var currentShownId = lightboxImage.attr("data-vbid");
            var relevantPaginationHolder = paginator.find(".page-navigator[data-vbid='" + currentShownId + "']");
            var currentPaginator = relevantPaginationHolder.next();
            if ($(this).hasClass("lightbox-left")) {
                currentPaginator = relevantPaginationHolder.prev();
            }
            if (currentPaginator.length == 0) {
                currentPaginator = relevantPaginationHolder.siblings().first();
                if ($(this).hasClass("lightbox-left")) {
                    currentPaginator = relevantPaginationHolder.siblings().last();
                }
            }
            if (currentPaginator.attr("data-videosrc")) {
                var videoIframe = $("<iframe />").css({ "width": "100%", "height": "100%", "border": "none" }).attr("src", currentPaginator.attr("data-videosrc"));
                lightboxImage.append(videoIframe);
                lightboxImage.css("background-image", "");
            } else {
                lightboxImage.css("background-image", "url('" + currentPaginator.attr("data-bgimg") + "')");
                lightboxImage.attr("data-orig-thumb-height", currentPaginator.attr("data-orig-thumb-height"));
                lightboxImage.attr("data-orig-thumb-width", currentPaginator.attr("data-orig-thumb-width"));
            }
            lightboxImage.attr("data-vbid", currentPaginator.attr("data-vbid"));
            wrapper.find(".lightbox-title").text(currentPaginator.attr("data-title"));
            wrapper.find(".lightbox-subtitle").text(currentPaginator.attr("data-subtitle"));
            setTimeout(function() {
                LightBox.arrange();
            }, 0);

        });

        lightboxWrapper.unbind("swipeleft").bind("swipeleft", function() {
            LightBox.changePic("left");
        });

        lightboxWrapper.unbind("swiperight").bind("swiperight", function() {
            LightBox.changePic("right");
        });

        lightboxWrapper.unbind("keyup").bind("keyup", function(e) {
            if (e.keyCode == 37) { // left
                LightBox.changePic("left");
            } else if (e.keyCode == 39) { // right
                LightBox.changePic("right");
            } else if (e.keyCode === 27) {
                lightboxWrapper.find("iframe").remove();
                lightboxWrapper.hide();
            }
        });

        lightboxWrapper.focus();


    } else {
        lightboxWrapper.find(".lightbox-arrow").hide();
    }
};

LightBox.changePic = function(dir) {
    var lightboxWrapper = $(".light-box-wrapper");
    var lightboxImageHolder = lightboxWrapper.find(".light-box-image-holder");
    var lightboxImage = lightboxImageHolder.find(".light-box-image");
    var paginator = lightboxWrapper.find("#paginator");


    lightboxImage.find("iframe").remove();
    var currentShownId = lightboxImage.attr("data-vbid");
    var relevantPaginationHolder = paginator.find(".page-navigator[data-vbid='" + currentShownId + "']");
    var currentPaginator = relevantPaginationHolder.next();
    if (dir == "left") {
        currentPaginator = relevantPaginationHolder.prev();
    }
    if (currentPaginator.length == 0) {
        currentPaginator = relevantPaginationHolder.siblings().first();
        if (dir == "left") {
            currentPaginator = relevantPaginationHolder.siblings().last();
        }
    }
    if (currentPaginator.attr("data-videosrc")) {
        var videoIframe = $("<iframe />").css({ "width": "100%", "height": "100%", "border": "none" }).attr("src", currentPaginator.attr("data-videosrc"));
        lightboxImage.append(videoIframe);
        lightboxImage.css("background-image", "");
    } else {
        lightboxImage.css("background-image", "url('" + currentPaginator.attr("data-bgimg") + "')");
        lightboxImage.attr("data-orig-thumb-height", currentPaginator.attr("data-orig-thumb-height"));
        lightboxImage.attr("data-orig-thumb-width", currentPaginator.attr("data-orig-thumb-width"));
    }
    lightboxImage.attr("data-vbid", currentPaginator.attr("data-vbid"));
    lightboxWrapper.find(".lightbox-title").text(currentPaginator.attr("data-title"));
    lightboxWrapper.find(".lightbox-subtitle").text(currentPaginator.attr("data-subtitle"));
    setTimeout(function() {
        LightBox.arrange();
    }, 0);
}

/*! jQuery Mobile v1.4.5 | Copyright 2010, 2014 jQuery Foundation, Inc. | jquery.org/license */

(function(e, t, n) { typeof define == "function" && define.amd ? define(["jquery"], function(r) { return n(r, e, t), r.mobile }) : n(e.jQuery, e, t) })(this, document, function(e, t, n, r) {
    (function(e, t, n, r) {
        function T(e) { while (e && typeof e.originalEvent != "undefined") e = e.originalEvent; return e }

        function N(t, n) { var i = t.type,
                s, o, a, l, c, h, p, d, v;
            t = e.Event(t), t.type = n, s = t.originalEvent, o = e.event.props, i.search(/^(mouse|click)/) > -1 && (o = f); if (s)
                for (p = o.length, l; p;) l = o[--p], t[l] = s[l];
            i.search(/mouse(down|up)|click/) > -1 && !t.which && (t.which = 1); if (i.search(/^touch/) !== -1) { a = T(s), i = a.touches, c = a.changedTouches, h = i && i.length ? i[0] : c && c.length ? c[0] : r; if (h)
                    for (d = 0, v = u.length; d < v; d++) l = u[d], t[l] = h[l] } return t }

        function C(t) { var n = {},
                r, s; while (t) { r = e.data(t, i); for (s in r) r[s] && (n[s] = n.hasVirtualBinding = !0);
                t = t.parentNode } return n }

        function k(t, n) { var r; while (t) { r = e.data(t, i); if (r && (!n || r[n])) return t;
                t = t.parentNode } return null }

        function L() { g = !1 }

        function A() { g = !0 }

        function O() { E = 0, v.length = 0, m = !1, A() }

        function M() { L() }

        function _() { D(), c = setTimeout(function() { c = 0, O() }, e.vmouse.resetTimerDuration) }

        function D() { c && (clearTimeout(c), c = 0) }

        function P(t, n, r) { var i; if (r && r[t] || !r && k(n.target, t)) i = N(n, t), e(n.target).trigger(i); return i }

        function H(t) { var n = e.data(t.target, s),
                r;!m && (!E || E !== n) && (r = P("v" + t.type, t), r && (r.isDefaultPrevented() && t.preventDefault(), r.isPropagationStopped() && t.stopPropagation(), r.isImmediatePropagationStopped() && t.stopImmediatePropagation())) }

        function B(t) { var n = T(t).touches,
                r, i, o;
            n && n.length === 1 && (r = t.target, i = C(r), i.hasVirtualBinding && (E = w++, e.data(r, s, E), D(), M(), d = !1, o = T(t).touches[0], h = o.pageX, p = o.pageY, P("vmouseover", t, i), P("vmousedown", t, i))) }

        function j(e) { if (g) return;
            d || P("vmousecancel", e, C(e.target)), d = !0, _() }

        function F(t) { if (g) return; var n = T(t).touches[0],
                r = d,
                i = e.vmouse.moveDistanceThreshold,
                s = C(t.target);
            d = d || Math.abs(n.pageX - h) > i || Math.abs(n.pageY - p) > i, d && !r && P("vmousecancel", t, s), P("vmousemove", t, s), _() }

        function I(e) { if (g) return;
            A(); var t = C(e.target),
                n, r;
            P("vmouseup", e, t), d || (n = P("vclick", e, t), n && n.isDefaultPrevented() && (r = T(e).changedTouches[0], v.push({ touchID: E, x: r.clientX, y: r.clientY }), m = !0)), P("vmouseout", e, t), d = !1, _() }

        function q(t) { var n = e.data(t, i),
                r; if (n)
                for (r in n)
                    if (n[r]) return !0;
            return !1 }

        function R() {}

        function U(t) { var n = t.substr(1); return { setup: function() { q(this) || e.data(this, i, {}); var r = e.data(this, i);
                    r[t] = !0, l[t] = (l[t] || 0) + 1, l[t] === 1 && b.bind(n, H), e(this).bind(n, R), y && (l.touchstart = (l.touchstart || 0) + 1, l.touchstart === 1 && b.bind("touchstart", B).bind("touchend", I).bind("touchmove", F).bind("scroll", j)) }, teardown: function() {--l[t], l[t] || b.unbind(n, H), y && (--l.touchstart, l.touchstart || b.unbind("touchstart", B).unbind("touchmove", F).unbind("touchend", I).unbind("scroll", j)); var r = e(this),
                        s = e.data(this, i);
                    s && (s[t] = !1), r.unbind(n, R), q(this) || r.removeData(i) } } } var i = "virtualMouseBindings",
            s = "virtualTouchID",
            o = "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split(" "),
            u = "clientX clientY pageX pageY screenX screenY".split(" "),
            a = e.event.mouseHooks ? e.event.mouseHooks.props : [],
            f = e.event.props.concat(a),
            l = {},
            c = 0,
            h = 0,
            p = 0,
            d = !1,
            v = [],
            m = !1,
            g = !1,
            y = "addEventListener" in n,
            b = e(n),
            w = 1,
            E = 0,
            S, x;
        e.vmouse = { moveDistanceThreshold: 10, clickDistanceThreshold: 10, resetTimerDuration: 1500 }; for (x = 0; x < o.length; x++) e.event.special[o[x]] = U(o[x]);
        y && n.addEventListener("click", function(t) { var n = v.length,
                r = t.target,
                i, o, u, a, f, l; if (n) { i = t.clientX, o = t.clientY, S = e.vmouse.clickDistanceThreshold, u = r; while (u) { for (a = 0; a < n; a++) { f = v[a], l = 0; if (u === r && Math.abs(f.x - i) < S && Math.abs(f.y - o) < S || e.data(u, s) === f.touchID) { t.preventDefault(), t.stopPropagation(); return } }
                    u = u.parentNode } } }, !0) })(e, t, n),
    function(e) { e.mobile = {} }(e),
    function(e, t) { var r = { touch: "ontouchend" in n };
        e.mobile.support = e.mobile.support || {}, e.extend(e.support, r), e.extend(e.mobile.support, r) }(e),
    function(e, t, r) {
        function l(t, n, i, s) { var o = i.type;
            i.type = n, s ? e.event.trigger(i, r, t) : e.event.dispatch.call(t, i), i.type = o } var i = e(n),
            s = e.mobile.support.touch,
            o = "touchmove scroll",
            u = s ? "touchstart" : "mousedown",
            a = s ? "touchend" : "mouseup",
            f = s ? "touchmove" : "mousemove";
        e.each("touchstart touchmove touchend tap taphold swipe swipeleft swiperight scrollstart scrollstop".split(" "), function(t, n) { e.fn[n] = function(e) { return e ? this.bind(n, e) : this.trigger(n) }, e.attrFn && (e.attrFn[n] = !0) }), e.event.special.scrollstart = { enabled: !0, setup: function() {
                function s(e, n) { r = n, l(t, r ? "scrollstart" : "scrollstop", e) } var t = this,
                    n = e(t),
                    r, i;
                n.bind(o, function(t) { if (!e.event.special.scrollstart.enabled) return;
                    r || s(t, !0), clearTimeout(i), i = setTimeout(function() { s(t, !1) }, 50) }) }, teardown: function() { e(this).unbind(o) } }, e.event.special.tap = { tapholdThreshold: 750, emitTapOnTaphold: !0, setup: function() { var t = this,
                    n = e(t),
                    r = !1;
                n.bind("vmousedown", function(s) {
                    function a() { clearTimeout(u) }

                    function f() { a(), n.unbind("vclick", c).unbind("vmouseup", a), i.unbind("vmousecancel", f) }

                    function c(e) { f(), !r && o === e.target ? l(t, "tap", e) : r && e.preventDefault() }
                    r = !1; if (s.which && s.which !== 1) return !1; var o = s.target,
                        u;
                    n.bind("vmouseup", a).bind("vclick", c), i.bind("vmousecancel", f), u = setTimeout(function() { e.event.special.tap.emitTapOnTaphold || (r = !0), l(t, "taphold", e.Event("taphold", { target: o })) }, e.event.special.tap.tapholdThreshold) }) }, teardown: function() { e(this).unbind("vmousedown").unbind("vclick").unbind("vmouseup"), i.unbind("vmousecancel") } }, e.event.special.swipe = { scrollSupressionThreshold: 30, durationThreshold: 1e3, horizontalDistanceThreshold: 30, verticalDistanceThreshold: 30, getLocation: function(e) { var n = t.pageXOffset,
                    r = t.pageYOffset,
                    i = e.clientX,
                    s = e.clientY; if (e.pageY === 0 && Math.floor(s) > Math.floor(e.pageY) || e.pageX === 0 && Math.floor(i) > Math.floor(e.pageX)) i -= n, s -= r;
                else if (s < e.pageY - r || i < e.pageX - n) i = e.pageX - n, s = e.pageY - r; return { x: i, y: s } }, start: function(t) { var n = t.originalEvent.touches ? t.originalEvent.touches[0] : t,
                    r = e.event.special.swipe.getLocation(n); return { time: (new Date).getTime(), coords: [r.x, r.y], origin: e(t.target) } }, stop: function(t) { var n = t.originalEvent.touches ? t.originalEvent.touches[0] : t,
                    r = e.event.special.swipe.getLocation(n); return { time: (new Date).getTime(), coords: [r.x, r.y] } }, handleSwipe: function(t, n, r, i) { if (n.time - t.time < e.event.special.swipe.durationThreshold && Math.abs(t.coords[0] - n.coords[0]) > e.event.special.swipe.horizontalDistanceThreshold && Math.abs(t.coords[1] - n.coords[1]) < e.event.special.swipe.verticalDistanceThreshold) { var s = t.coords[0] > n.coords[0] ? "swipeleft" : "swiperight"; return l(r, "swipe", e.Event("swipe", { target: i, swipestart: t, swipestop: n }), !0), l(r, s, e.Event(s, { target: i, swipestart: t, swipestop: n }), !0), !0 } return !1 }, eventInProgress: !1, setup: function() { var t, n = this,
                    r = e(n),
                    s = {};
                t = e.data(this, "mobile-events"), t || (t = { length: 0 }, e.data(this, "mobile-events", t)), t.length++, t.swipe = s, s.start = function(t) { if (e.event.special.swipe.eventInProgress) return;
                    e.event.special.swipe.eventInProgress = !0; var r, o = e.event.special.swipe.start(t),
                        u = t.target,
                        l = !1;
                    s.move = function(t) { if (!o || t.isDefaultPrevented()) return;
                        r = e.event.special.swipe.stop(t), l || (l = e.event.special.swipe.handleSwipe(o, r, n, u), l && (e.event.special.swipe.eventInProgress = !1)), Math.abs(o.coords[0] - r.coords[0]) > e.event.special.swipe.scrollSupressionThreshold && t.preventDefault() }, s.stop = function() { l = !0, e.event.special.swipe.eventInProgress = !1, i.off(f, s.move), s.move = null }, i.on(f, s.move).one(a, s.stop) }, r.on(u, s.start) }, teardown: function() { var t, n;
                t = e.data(this, "mobile-events"), t && (n = t.swipe, delete t.swipe, t.length--, t.length === 0 && e.removeData(this, "mobile-events")), n && (n.start && e(this).off(u, n.start), n.move && i.off(f, n.move), n.stop && i.off(a, n.stop)) } }, e.each({ scrollstop: "scrollstart", taphold: "tap", swipeleft: "swipe.left", swiperight: "swipe.right" }, function(t, n) { e.event.special[t] = { setup: function() { e(this).bind(n, e.noop) }, teardown: function() { e(this).unbind(n) } } }) }(e, this) });
(function(e,t,n){typeof define=="function"&&define.amd?define(["jquery"],function(r){return n(r,e,t),r.mobile}):n(e.jQuery,e,t)})(this,document,function(e,t,n,r){(function(e,t,n,r){function T(e){while(e&&typeof e.originalEvent!="undefined")e=e.originalEvent;return e}function N(t,n){var i=t.type,s,o,a,l,c,h,p,d,v;t=e.Event(t),t.type=n,s=t.originalEvent,o=e.event.props,i.search(/^(mouse|click)/)>-1&&(o=f);if(s)for(p=o.length,l;p;)l=o[--p],t[l]=s[l];i.search(/mouse(down|up)|click/)>-1&&!t.which&&(t.which=1);if(i.search(/^touch/)!==-1){a=T(s),i=a.touches,c=a.changedTouches,h=i&&i.length?i[0]:c&&c.length?c[0]:r;if(h)for(d=0,v=u.length;d<v;d++)l=u[d],t[l]=h[l]}return t}function C(t){var n={},r,s;while(t){r=e.data(t,i);for(s in r)r[s]&&(n[s]=n.hasVirtualBinding=!0);t=t.parentNode}return n}function k(t,n){var r;while(t){r=e.data(t,i);if(r&&(!n||r[n]))return t;t=t.parentNode}return null}function L(){g=!1}function A(){g=!0}function O(){E=0,v.length=0,m=!1,A()}function M(){L()}function _(){D(),c=setTimeout(function(){c=0,O()},e.vmouse.resetTimerDuration)}function D(){c&&(clearTimeout(c),c=0)}function P(t,n,r){var i;if(r&&r[t]||!r&&k(n.target,t))i=N(n,t),e(n.target).trigger(i);return i}function H(t){var n=e.data(t.target,s),r;!m&&(!E||E!==n)&&(r=P("v"+t.type,t),r&&(r.isDefaultPrevented()&&t.preventDefault(),r.isPropagationStopped()&&t.stopPropagation(),r.isImmediatePropagationStopped()&&t.stopImmediatePropagation()))}function B(t){var n=T(t).touches,r,i,o;n&&n.length===1&&(r=t.target,i=C(r),i.hasVirtualBinding&&(E=w++,e.data(r,s,E),D(),M(),d=!1,o=T(t).touches[0],h=o.pageX,p=o.pageY,P("vmouseover",t,i),P("vmousedown",t,i)))}function j(e){if(g)return;d||P("vmousecancel",e,C(e.target)),d=!0,_()}function F(t){if(g)return;var n=T(t).touches[0],r=d,i=e.vmouse.moveDistanceThreshold,s=C(t.target);d=d||Math.abs(n.pageX-h)>i||Math.abs(n.pageY-p)>i,d&&!r&&P("vmousecancel",t,s),P("vmousemove",t,s),_()}function I(e){if(g)return;A();var t=C(e.target),n,r;P("vmouseup",e,t),d||(n=P("vclick",e,t),n&&n.isDefaultPrevented()&&(r=T(e).changedTouches[0],v.push({touchID:E,x:r.clientX,y:r.clientY}),m=!0)),P("vmouseout",e,t),d=!1,_()}function q(t){var n=e.data(t,i),r;if(n)for(r in n)if(n[r])return!0;return!1}function R(){}function U(t){var n=t.substr(1);return{setup:function(){q(this)||e.data(this,i,{});var r=e.data(this,i);r[t]=!0,l[t]=(l[t]||0)+1,l[t]===1&&b.bind(n,H),e(this).bind(n,R),y&&(l.touchstart=(l.touchstart||0)+1,l.touchstart===1&&b.bind("touchstart",B).bind("touchend",I).bind("touchmove",F).bind("scroll",j))},teardown:function(){--l[t],l[t]||b.unbind(n,H),y&&(--l.touchstart,l.touchstart||b.unbind("touchstart",B).unbind("touchmove",F).unbind("touchend",I).unbind("scroll",j));var r=e(this),s=e.data(this,i);s&&(s[t]=!1),r.unbind(n,R),q(this)||r.removeData(i)}}}var i="virtualMouseBindings",s="virtualTouchID",o="vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split(" "),u="clientX clientY pageX pageY screenX screenY".split(" "),a=e.event.mouseHooks?e.event.mouseHooks.props:[],f=e.event.props.concat(a),l={},c=0,h=0,p=0,d=!1,v=[],m=!1,g=!1,y="addEventListener"in n,b=e(n),w=1,E=0,S,x;e.vmouse={moveDistanceThreshold:10,clickDistanceThreshold:10,resetTimerDuration:1500};for(x=0;x<o.length;x++)e.event.special[o[x]]=U(o[x]);y&&n.addEventListener("click",function(t){var n=v.length,r=t.target,i,o,u,a,f,l;if(n){i=t.clientX,o=t.clientY,S=e.vmouse.clickDistanceThreshold,u=r;while(u){for(a=0;a<n;a++){f=v[a],l=0;if(u===r&&Math.abs(f.x-i)<S&&Math.abs(f.y-o)<S||e.data(u,s)===f.touchID){t.preventDefault(),t.stopPropagation();return}}u=u.parentNode}}},!0)})(e,t,n),function(e){e.mobile={}}(e),function(e,t){var r={touch:"ontouchend"in n};e.mobile.support=e.mobile.support||{},e.extend(e.support,r),e.extend(e.mobile.support,r)}(e),function(e,t,r){function l(t,n,i,s){var o=i.type;i.type=n,s?e.event.trigger(i,r,t):e.event.dispatch.call(t,i),i.type=o}var i=e(n),s=e.mobile.support.touch,o="touchmove scroll",u=s?"touchstart":"mousedown",a=s?"touchend":"mouseup",f=s?"touchmove":"mousemove";e.each("touchstart touchmove touchend tap taphold swipe swipeleft swiperight scrollstart scrollstop".split(" "),function(t,n){e.fn[n]=function(e){return e?this.bind(n,e):this.trigger(n)},e.attrFn&&(e.attrFn[n]=!0)}),e.event.special.scrollstart={enabled:!0,setup:function(){function s(e,n){r=n,l(t,r?"scrollstart":"scrollstop",e)}var t=this,n=e(t),r,i;n.bind(o,function(t){if(!e.event.special.scrollstart.enabled)return;r||s(t,!0),clearTimeout(i),i=setTimeout(function(){s(t,!1)},50)})},teardown:function(){e(this).unbind(o)}},e.event.special.tap={tapholdThreshold:750,emitTapOnTaphold:!0,setup:function(){var t=this,n=e(t),r=!1;n.bind("vmousedown",function(s){function a(){clearTimeout(u)}function f(){a(),n.unbind("vclick",c).unbind("vmouseup",a),i.unbind("vmousecancel",f)}function c(e){f(),!r&&o===e.target?l(t,"tap",e):r&&e.preventDefault()}r=!1;if(s.which&&s.which!==1)return!1;var o=s.target,u;n.bind("vmouseup",a).bind("vclick",c),i.bind("vmousecancel",f),u=setTimeout(function(){e.event.special.tap.emitTapOnTaphold||(r=!0),l(t,"taphold",e.Event("taphold",{target:o}))},e.event.special.tap.tapholdThreshold)})},teardown:function(){e(this).unbind("vmousedown").unbind("vclick").unbind("vmouseup"),i.unbind("vmousecancel")}},e.event.special.swipe={scrollSupressionThreshold:30,durationThreshold:1e3,horizontalDistanceThreshold:30,verticalDistanceThreshold:30,getLocation:function(e){var n=t.pageXOffset,r=t.pageYOffset,i=e.clientX,s=e.clientY;if(e.pageY===0&&Math.floor(s)>Math.floor(e.pageY)||e.pageX===0&&Math.floor(i)>Math.floor(e.pageX))i-=n,s-=r;else if(s<e.pageY-r||i<e.pageX-n)i=e.pageX-n,s=e.pageY-r;return{x:i,y:s}},start:function(t){var n=t.originalEvent.touches?t.originalEvent.touches[0]:t,r=e.event.special.swipe.getLocation(n);return{time:(new Date).getTime(),coords:[r.x,r.y],origin:e(t.target)}},stop:function(t){var n=t.originalEvent.touches?t.originalEvent.touches[0]:t,r=e.event.special.swipe.getLocation(n);return{time:(new Date).getTime(),coords:[r.x,r.y]}},handleSwipe:function(t,n,r,i){if(n.time-t.time<e.event.special.swipe.durationThreshold&&Math.abs(t.coords[0]-n.coords[0])>e.event.special.swipe.horizontalDistanceThreshold&&Math.abs(t.coords[1]-n.coords[1])<e.event.special.swipe.verticalDistanceThreshold){var s=t.coords[0]>n.coords[0]?"swipeleft":"swiperight";return l(r,"swipe",e.Event("swipe",{target:i,swipestart:t,swipestop:n}),!0),l(r,s,e.Event(s,{target:i,swipestart:t,swipestop:n}),!0),!0}return!1},eventInProgress:!1,setup:function(){var t,n=this,r=e(n),s={};t=e.data(this,"mobile-events"),t||(t={length:0},e.data(this,"mobile-events",t)),t.length++,t.swipe=s,s.start=function(t){if(e.event.special.swipe.eventInProgress)return;e.event.special.swipe.eventInProgress=!0;var r,o=e.event.special.swipe.start(t),u=t.target,l=!1;s.move=function(t){if(!o||t.isDefaultPrevented())return;r=e.event.special.swipe.stop(t),l||(l=e.event.special.swipe.handleSwipe(o,r,n,u),l&&(e.event.special.swipe.eventInProgress=!1)),Math.abs(o.coords[0]-r.coords[0])>e.event.special.swipe.scrollSupressionThreshold&&t.preventDefault()},s.stop=function(){l=!0,e.event.special.swipe.eventInProgress=!1,i.off(f,s.move),s.move=null},i.on(f,s.move).one(a,s.stop)},r.on(u,s.start)},teardown:function(){var t,n;t=e.data(this,"mobile-events"),t&&(n=t.swipe,delete t.swipe,t.length--,t.length===0&&e.removeData(this,"mobile-events")),n&&(n.start&&e(this).off(u,n.start),n.move&&i.off(f,n.move),n.stop&&i.off(a,n.stop))}},e.each({scrollstop:"scrollstart",taphold:"tap",swipeleft:"swipe.left",swiperight:"swipe.right"},function(t,n){e.event.special[t]={setup:function(){e(this).bind(n,e.noop)},teardown:function(){e(this).unbind(n)}}})}(e,this)});

var rowcol_arranger = {};

rowcol_arranger.init = function(container,items,whatsNext){
	 SpimeEngine.DebugPrint("rowcol arranger init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	 
	 /******************************************************************
		 *           HANDLING THE ELEMENTS
	 ********************************************************************/
	var elements = items.not(".element-box").first().siblings(".element-box");
	elements.remove();
	 
	 /******************************************************************
		 *           HANDLING THE ITEMS
	********************************************************************/
	 var itemsHolder = container.find("#items-holder");
	 var itemsHolderWrapper = container.find("#items-holder-wrapper");
	 //backward compatibility
	 if (itemsHolder.length == 0){
		 items = container.find(".sub.item-box");
		 itemsHolder = $("<div id='items-holder' />");
		 itemsHolderWrapper = $("<div id='items-holder-wrapper' />");
		 itemsHolder.append(items);
		 itemsHolderWrapper.append(itemsHolder);
		 container.find("#children").append(itemsHolderWrapper);
	 }
	 
	 var pagHolder = container.find("#pagination-holder");
	 if (pagHolder.length == 0){
		 rowcol_arranger.initPaginationHolder(container);
	 }
	 
	 if (typeof  whatsNext != "undefined"){
		 whatsNext();
	 }
};

rowcol_arranger.arrange = function(items,container,whatsNext){
	SpimeEngine.DebugPrint("rowcol arranger arrange for " + items.length + " items and container: " + container.width() + " X " + container.height());
	
	/******************************************************************
	 *           HANDLING THE ELEMENTS
	 ********************************************************************/
	//var elementsHolder = container.find("#elements-holder");
	var itemsHolder = container.find("#items-holder");
	items = itemsHolder.children();
	var calculatedElementsHeight = 0;
	
	var stripe = container.closest(".master.item-box");
	stripe.css("min-height","initial");
	var stripeType = stripe.attr("data-preset-type-id");
	var isFeatures = XPRSHelper.inPresetGroup(stripeType,"FEATURES");


	/******************************************************************
	 *           LOADING ARRANGER SETTINGS
	 ********************************************************************/
	
	var settings = container.closest(".item-wrapper").find(".arranger-settings");
	var ratio = parseFloat(settings.attr('data-arranger_item_ratio')) ;
	var colsFromSettings = parseInt(settings.attr('data-arranger_cols'));
	colsFromSettings = isFeatures ? items.length : colsFromSettings;
	var itemsMargin =  parseInt(settings.attr('data-arranger_item_spacing'));
	var itemMinWidth = parseInt(settings.attr('data-arranger_item_min_width'));
	var itemMaxWidth = parseInt(settings.attr('data-arranger_item_max_width'));
	var itemsPerPage = settings.attr('data-arranger_items_per_page');
	itemsPerPage = isFeatures ? items.length : itemsPerPage;
	itemsPerPage = (itemsPerPage == "all") ? items.length : parseInt(itemsPerPage);
	
	
	/******************************************************************
	 * DEFINE PARTICIPATING DIVS        
	 ********************************************************************/
	//ParentWrapper is the source for our max width
	var parentWrapper = itemsHolder.closest(".gallery-wrapper");
	
	var forcedArrange = (typeof stripe.attr("data-forced-arrange") != "undefined");
	var fromHeightResize = (typeof stripe.attr("data-height-resize") != "undefined");
	var fromWidthResize = forcedArrange || (typeof stripe.attr("data-width-resize") != "undefined") || (typeof stripe.attr("data-arranger_cols-from-settings") != "undefined")|| (typeof stripe.attr("data-arranger_item_spacing-from-settings") != "undefined");
	stripe.removeAttr("data-forced-arrange");
	var paginationWrapper =  container.find("#pagination-wrapper");
	var paginationHeight = paginationWrapper.is(':visible') ? paginationWrapper.outerHeight(true) : 0;
	//var stripeHeight = stripe.height() - calculatedElementsHeight - paginationHeight;//- parseInt(stripe.css("padding-top")) - parseInt(stripe.css("padding-bottom"));
	
	/******************************************************************
	 * START CALCULATIONS WITH ITEM MIN WIDTH AND HEIGHT * RATIO AND COLS AS THE NUMBER OF ITEMS      
	 ********************************************************************/
	var percentagePaddingFix = 0;
	if (parseInt(stripe.css("padding-left")) > 0){
		percentagePaddingFix = 1;
	}
	var wrapperWidth = parentWrapper.width() - percentagePaddingFix;
	//Min width can not be larger than  screen or the max item width
	itemMinWidth = Math.min(itemMinWidth,itemMaxWidth);
	itemMinWidth = Math.min(itemMinWidth,wrapperWidth);
	items.find(".preview-content-holder").css("min-height","");
	
	var cols = Math.floor((wrapperWidth + itemsMargin*2) / (itemMinWidth + itemsMargin*2));
	cols = Math.min(colsFromSettings,cols);
	if (fromWidthResize){
		var wrapperWidthForTest = wrapperWidth - colsFromSettings*itemsMargin*2 + itemsMargin*2;
		itemMinWidth =   Math.floor(wrapperWidthForTest / colsFromSettings);
		itemMinWidth = Math.min(itemMinWidth,itemMaxWidth);
		itemMinWidth *= 0.7;
		cols = colsFromSettings;
	}
	//cols must be at least 1
	cols =  Math.max(cols,1);
	
	if (cols == 2 && colsFromSettings != 2 && items.length == 3){
		cols = 1;
	}
	
	if (cols == 3 && items.length == 4 && colsFromSettings != 3){
		cols = 2;
	}
	if (cols == 5 && items.length == 6 && colsFromSettings != 5){
		cols = 3;
	}
	
	//The total number of rows we have
	var rows = Math.ceil(items.length / cols);
	//Restoring items defaults (if change during previous arrange)
	items.show();
	items.css({"clear":""});
	var itemRow = 0;
	
	/******************************************************************
	 * BREAK THE ITEMS ACCORDING TO CALCULATED COLS AND GIVE EACH ONE ROW IDENTIFIER 
	 ********************************************************************/
	
	var maxContentHeight = 0;
	items.removeClass("top-side").removeClass("bottom-side").removeClass("left-side").removeClass("right-side");;
	items.each(function(idx){
		if (idx % cols == 0){
			$(this).css({"clear":"left"});
			$(this).addClass("left-side");
			itemRow++;
		}
		if (idx % cols == cols-1){
			$(this).addClass("right-side");
		}
		if (itemRow == 1){
			$(this).addClass("top-side");
		}
		if (itemRow == rows){
			$(this).addClass("bottom-side");
		}
		$(this).attr("data-row",itemRow);
		maxContentHeight = Math.max(maxContentHeight,$(this).find(".preview-content-holder").height()); 
	});
	//maxContentHeight = Math.max(itemsHolder.height(),maxContentHeight);
	
	
	//if we have more space we enlarge the items 
	var extraSpace = Math.floor(    (wrapperWidth - (cols*itemMinWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
	var	calculatedItemWidth = Math.floor(itemMinWidth + extraSpace);//Math.round((wrapperWidth)/cols) - ((cols-1)*(itemsMargin*2));
	calculatedItemWidth = Math.min(calculatedItemWidth,itemMaxWidth);
	
	setTimeout(function(){
		if (wrapperWidth - parentWrapper.width() > 3){
			extraSpace = Math.floor(    (parentWrapper.width() - (cols*itemMinWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
			calculatedItemWidth = Math.floor(itemMinWidth + extraSpace);//Math.round((wrapperWidth)/cols) - ((cols-1)*(itemsMargin*2));
			calculatedItemWidth = Math.min(calculatedItemWidth,itemMaxWidth);
			items.width(calculatedItemWidth);
		}
	},10);
	
	if (fromWidthResize){
		//calculatedItemWidth = itemMinWidth;
		settings.attr('data-arranger_item_min_width',itemMinWidth);
		stripe.attr("data-items-min-width",itemMinWidth);
	}

	/******************************************************************
	 * CHANGE ITEMS WIDTH HEIGHT AND SPACING ACCORDING TO CALCULATIONS
	 ********************************************************************/
	items.width(calculatedItemWidth).css({"margin":itemsMargin});
	items.filter(".top-side").css("margin-top",itemsMargin*2);
	items.filter(".bottom-side").css("margin-bottom",itemsMargin*2);
	items.filter(".left-side").css("margin-left",0);
	items.filter(".right-side").css("margin-right",0);
	

	itemsHolder.css({"width":"100%","text-align":""});
	
	items.slice(itemsPerPage,items.length).hide();
	
	if (fromHeightResize && isFeatures){
		ratio = (stripe.height() - itemsMargin*4) / calculatedItemWidth;
		stripe.attr("data-item-ratio",ratio.toFixed(2));
		settings.attr('data-arranger_item_ratio',ratio);
	}
		var	calculatedItemHeight = calculatedItemWidth*ratio;
		items.css({"min-height":calculatedItemHeight});
		items.find(".item-wrapper").css({"min-height":calculatedItemHeight});
		
		
		items.each(function(idx){
			maxContentHeight = Math.max(maxContentHeight,$(this).find(".preview-content-holder").height()); 
		});
		//if (items.find(".helper-div.top-center").length == 0){
		if (items.find(".helper-div.middle-center,.helper-div.bottom-right,.helper-div.bottom-left,.helper-div.top-left,.helper-div.top-right").length == 0){
			items.find(".preview-content-holder").css("min-height",maxContentHeight);
		}else{
			//items.find(".vertical-aligner").css("min-height",maxContentHeight);
		}
		//}else{
		//	items.find(".text-side .vertical-aligner").css("min-height",maxContentHeight);
		//}
	
	
	
	/******************************************************************
	 * HANDLE PAGINATION
	 ********************************************************************/
	// If we need pagination (not all items fit the given height)
	var inMoreMode = (typeof stripe.attr("data-more-clicked") != "undefined");
	if (itemsPerPage < items.length ){
		if (inMoreMode){
			paginationWrapper.hide();
			items.show();
		}else{
			paginationWrapper.show();
		}
	}else{
		//Hide paginator
		paginationWrapper.hide();
	}
	
	
	extraSpace = Math.floor(    (wrapperWidth - (cols*itemMaxWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
	if(calculatedItemWidth == itemMaxWidth && extraSpace > 0){
		itemsHolder.css("text-align","center");
		var currentRowWidth = (itemMaxWidth * cols) + (cols*itemsMargin*2) - itemsMargin*2;
		itemsHolder.width(currentRowWidth);
	}else{
		itemsHolder.css("width","");
	}

	if (typeof  whatsNext != "undefined"){
		var originalItemMinWidth = parseInt(settings.attr('data-arranger_item_min_width'));
		var actualItemMinWidth = itemMinWidth;
		if (actualItemMinWidth != originalItemMinWidth){
			stripe.attr("data-items-min-width",actualItemMinWidth);
		}
		whatsNext();
	 }

};

rowcol_arranger.showMore = function(stripe){
	
	var itemsHolder = stripe.find("#items-holder");
	var items = itemsHolder.children();
	var paginationWrapper = stripe.find("#pagination-wrapper");
	paginationWrapper.hide();
	var itemsWrapper = stripe.find("#items-holder-wrapper");
	var topMargin = parseInt(itemsWrapper.css("margin-top"));
	itemsWrapper.css("margin-bottom",topMargin);
	items.show();
	SpimeEngine.fitVideos(stripe);
	stripe.attr("data-more-clicked","true");
};

rowcol_arranger.showLess = function(stripe){
	var itemsHolder = stripe.find("#items-holder");
	var items = itemsHolder.children();
	var paginationWrapper = stripe.find("#pagination-wrapper");
	var itemsWrapper = stripe.find("#items-holder-wrapper");
	//var topMargin = parseInt(itemsWrapper.css("margin-top"));
	itemsWrapper.css("margin-bottom","");
	var itemsToShow = parseInt(stripe.attr("data-items-to-show"));
	if (itemsToShow < items.length){
		paginationWrapper.show();
	}
	items.hide();
	items.slice(0,itemsToShow).show();
	stripe.removeAttr("data-more-clicked");
};



rowcol_arranger.initPaginationHolder = function(container){
	var paginationBtn = $("<div id='pagination-btn' />");
	paginationBtn.text("More");
	var paginationHolder = $("<div id='pagination-holder' />").addClass("magic-circle-holder").attr("data-menu-name","PAGINATION_SETTINGS");
	var paginationHolderWrapper = $("<div id='pagination-wrapper' class='layer5' />");
	paginationHolder.append(paginationBtn);
	paginationHolderWrapper.append(paginationHolder);
	container.find("#children").append(paginationHolderWrapper);
	paginationHolder.unbind("click").bind("click",function(e){
		e.stopPropagation();
		var stripe = container.closest(".master.item-box");
		rowcol_arranger.showMore(stripe);
	});
};; var bottom_layout = {};

bottom_layout.init = function(container,items){
	 SpimeEngine.DebugPrint("bottom layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	// var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//	items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
};

bottom_layout.applyLayout = function(container,items,paramsFromRealTime){
	var maxContentHeight = 0;
	var calculatedItemHeight = 0;
	var innerMaxHeight = 0;
	items.find(".image-cover").css("height","");
	items.find(".preview-content-holder").css("min-height","");
	items.filter(":visible").each(function(){
		var currentItem = $(this);
		if ( typeof currentItem.attr("data-height-from-arranger") != "undefined"){
			calculatedItemHeight = parseInt(currentItem.attr("data-height-from-arranger"));
		}else{
			calculatedItemHeight = Math.max(currentItem.height(),calculatedItemHeight);
		}
		
		var contentHolder = currentItem.find(".preview-content-holder");
		var contentHeight = contentHolder.outerHeight(true);
		maxContentHeight = Math.max(contentHeight,maxContentHeight);
		innerMaxHeight = Math.max(innerMaxHeight,$(this).find(".item-details").outerHeight());
	});
	var newImageHeight = calculatedItemHeight - maxContentHeight;
	items.each(function(){
		var currentItem = $(this);
		currentItem.find(".image-cover").css("height",newImageHeight);
		
		$(this).find(".preview-content-holder").css("min-height",maxContentHeight);
//		var textElement = currentItem.find(".preview-title");
//		var contentHolder = currentItem.find(".preview-content-holder");
//		var contentWrapper = currentItem.find(".preview-content-wrapper");
//		var originalFontSize = parseInt(textElement.attr("data-orig-font-size"));
//		textElement.css("font-size",originalFontSize);
//		if (contentHolder.outerWidth(true) > contentWrapper.width()){
//			var newFontSize =  SpimeEngine.shrinkTextToFit(originalFontSize,contentWrapper,contentHolder,textElement,0,30);
//			textElement.css("font-size",newFontSize);
//		}
	});
};; var dual_layout = {};

dual_layout.init = function(container,items){
	SpimeEngine.DebugPrint("dual layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	items.find(".preview-title").attr("original-font-size",originalFontSize);
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var originalMaxWidth = parseInt(previewContentHolder.css("max-width"));
		previewContentHolder.attr("data-orig-max-width", originalMaxWidth)
				
	});
}

dual_layout.applyLayout = function(container,items){
	SpimeEngine.DebugPrint("dual layout applyLayout for ");
	//TODO: width for flip should be set in the layout settings
	if (container.width() < 500){
		items.each(function(){
			dual_layout.flipVertically($(this));
		});
	}else{
		items.each(function(){
			dual_layout.unflip($(this));
		});
	}
	
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var margins = parseInt(previewContentHolder.css("margin-left")) + parseInt(previewContentHolder.css("margin-right")) + parseInt(previewContentHolder.css("padding-left")) + parseInt(previewContentHolder.css("padding-right"))
		var previewContentWrapper = $(this).find(".item-content ");
		//console.log("--------------------------- > " + previewContentWrapper.width())
		var maxWidthVal = (previewContentWrapper.width() / 2) - margins;
		var originalMaxWith = previewContentHolder.attr("data-orig-max-width");
		maxWidthVal = Math.min(maxWidthVal,originalMaxWith)
		previewContentHolder.css("max-width",maxWidthVal)
				
	});
	
	
	
//	var originalFontSize = parseInt(items.find(".preview-title").attr("original-font-size"));
//	var shrinkPlease = true;
//	if (typeof paramsFromRealTime != "undefined" ){
//		if (typeof paramsFromRealTime.value != "undefined"){
//			originalFontSize = parseInt(paramsFromRealTime.value);
//			items.find(".preview-title").attr("original-font-size",originalFontSize);
//			shrinkPlease = false;
//			
//		}
//	}
//	if (shrinkPlease){
//		items.find(".preview-title").css("font-size",originalFontSize)
//		var minFontSize = 9999;
//		items.each(function(){
//			var itemDetails = $(this).find(".item-details")//.outerHeight(true);
//			var stripe = itemDetails.closest(".item-wrapper")//.outerHeight(true);
//			minFontSize = Math.min(minFontSize,dual_layout.shrinker(originalFontSize,itemDetails,$(this).find(".preview-title")));
//		});
//		items.each(function(){
//			$(this).find(".helper-div").css("padding",$(this).css("padding"));
//			$(this).find(".preview-title").css("font-size",minFontSize)
//		});
//		//items.find(".preview-title").css("font-size",minFontSize)
//	}
	
}


dual_layout.flipVertically = function(item){	
	if (typeof item.attr("data-flipped") == "undefined"){
		item.attr("data-flipped","true")
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.children(".item-preview");
		var itemDetails = helperDiv.children(".item-details");
		var textWrapper = $("<div id='text-wrapper' />");
		var imageWrapper = $("<div id='image-wrapper' />");
		textWrapper.append(itemDetails);
		imageWrapper.append(itemPreview);
		helperDiv.append(textWrapper);
		helperDiv.append(imageWrapper);
	}
}

dual_layout.unflip = function(item){
	if (typeof item.attr("data-flipped") != "undefined"){
		item.removeAttr("data-flipped","true")
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.find(".item-preview");
		var itemDetails = helperDiv.find(".item-details");
		itemPreview.unwrap();
		itemDetails.unwrap();
		itemPreview.after(itemDetails);
	}
}

dual_layout.shrinker = function(fontSize,parent,content){
	if (content.width() > parent.width()){
		//console.log("shrink please")
		var previewTitle = content.find(".preview-title");
		var shrinkedFontSize =  fontSize * 0.9 ;
		if (shrinkedFontSize < 15){
			//console.debug("cant SHRINK no more!");
		}else{
			content.find(".preview-title").css("font-size",shrinkedFontSize)
			return dual_layout.shrinker(shrinkedFontSize,parent,content)
		}
		
	}else{
		//console.log("dont shrink")
		return parseInt(content.find(".preview-title").css("font-size"));
	}
}; var right_layout = {};

right_layout.init = function(container,items){
	SpimeEngine.DebugPrint("right layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	//var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var originalMaxWidth = parseInt(previewContentHolder.css("max-width"));
		previewContentHolder.attr("data-orig-max-width", originalMaxWidth);
	});
};

right_layout.applyLayout = function(container,items,paramsFromRealTime){
	SpimeEngine.DebugPrint("right layout applyLayout for ");
	//TODO: width for flip should be set in the layout settings
	if (container.width() < 500){
		items.each(function(){
			right_layout.flipVertically($(this));
		});
	}else{
		items.each(function(){
			right_layout.unflip($(this));
		});
	}
	
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var margins = parseInt(previewContentHolder.css("margin-left")) + parseInt(previewContentHolder.css("margin-right")) + parseInt(previewContentHolder.css("padding-left")) + parseInt(previewContentHolder.css("padding-right"));
		var previewContentWrapper = $(this).find(".item-content ");
		var maxWidthVal = (previewContentWrapper.width() / 2) - margins;
		var originalMaxWith = previewContentHolder.attr("data-orig-max-width");
		maxWidthVal = Math.min(maxWidthVal,originalMaxWith);
		//previewContentHolder.css("max-width",maxWidthVal)
				
	});
	
	items.each(function(idx){
		var currentItem = $(this);
		//var textElement = currentItem.find(".preview-title");
		//var contentHolder = currentItem.find(".preview-content-holder");
		var contentWrapper = currentItem.find(".preview-content-wrapper");
		//var originalFontSize = parseInt(textElement.attr("data-orig-font-size"));
		if (typeof currentItem.attr("data-flipped") != "undefined"){
			contentWrapper.removeClass("shrinker-parent");
			currentItem.find(".helper-div").addClass("shrinker-parent"); 
		}else{
			contentWrapper.addClass("shrinker-parent");
			currentItem.find(".helper-div").removeClass("shrinker-parent"); 
		}
		//textElement.css("font-size",originalFontSize);
		//if (contentHolder.outerWidth(true) > contentWrapper.width()){
		//	var newFontSize = SpimeEngine.shrinkTextToFit(originalFontSize,contentWrapper,contentHolder,textElement,0,30);
		//	textElement.css("font-size",newFontSize);
		//}
	});	
	
	

	
};


right_layout.flipVertically = function(item){	
	if (typeof item.attr("data-flipped") == "undefined"){
		item.attr("data-flipped","true");
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.children(".item-preview");
		var itemDetails = helperDiv.children(".item-details");
		var textWrapper = $("<div id='text-wrapper' />");
		var imageWrapper = $("<div id='image-wrapper' class='preview image-cover' />");
		textWrapper.append(itemDetails);
		imageWrapper.append(itemPreview);
		helperDiv.append(textWrapper);
		helperDiv.append(imageWrapper);
	}
};

right_layout.unflip = function(item){
	if (typeof item.attr("data-flipped") != "undefined"){
		item.removeAttr("data-flipped","true");
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.find(".item-preview");
		var itemDetails = helperDiv.find(".item-details");
		itemPreview.unwrap();
		itemDetails.unwrap();
		itemPreview.after(itemDetails);
	}
};; var left_layout = {};

left_layout.init = function(container,items){
	SpimeEngine.DebugPrint("left layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	//var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var originalMaxWidth = parseInt(previewContentHolder.css("max-width"));
		previewContentHolder.attr("data-orig-max-width", originalMaxWidth);
	});
};

left_layout.applyLayout = function(container,items,paramsFromRealTime){
	SpimeEngine.DebugPrint("left layout applyLayout for ");
	//TODO: width for flip should be set in the layout settings
	if (container.width() < 500){
		items.each(function(){
			left_layout.flipVertically($(this));
		});
	}else{
		items.each(function(){
			left_layout.unflip($(this));
		});
	}
	
	
	items.each(function(){
		var previewContentHolder = $(this).find(".preview-content-holder");
		var margins = parseInt(previewContentHolder.css("margin-left")) + parseInt(previewContentHolder.css("margin-right")) + parseInt(previewContentHolder.css("padding-left")) + parseInt(previewContentHolder.css("padding-right"));
		var previewContentWrapper = $(this).find(".item-content ");
		var maxWidthVal = (previewContentWrapper.width() / 2) - margins;
		var originalMaxWith = previewContentHolder.attr("data-orig-max-width");
		maxWidthVal = Math.min(maxWidthVal,originalMaxWith);
	//	previewContentHolder.css("max-width",maxWidthVal);		
	});
	

	items.each(function(idx){
		var currentItem = $(this);
		//var textElement = currentItem.find(".preview-title");
		//var contentHolder = currentItem.find(".preview-content-holder");
		var contentWrapper = currentItem.find(".preview-content-wrapper");
		//var originalFontSize = parseInt(textElement.attr("data-orig-font-size"));
		if (typeof currentItem.attr("data-flipped") != "undefined"){
			contentWrapper.removeClass("shrinker-parent");
			currentItem.find(".helper-div").addClass("shrinker-parent"); 
		}else{
			contentWrapper.addClass("shrinker-parent");
			currentItem.find(".helper-div").removeClass("shrinker-parent"); 
		}
//		textElement.css("font-size",originalFontSize);
//		if (contentHolder.outerWidth(true) > contentWrapper.width()){
//			var newFontSize =  SpimeEngine.shrinkTextToFit(originalFontSize,contentWrapper,contentHolder,textElement,0,30);
//			textElement.css("font-size",newFontSize);
//		}
	});	
};


left_layout.flipVertically = function(item){	
	if (typeof item.attr("data-flipped") == "undefined"){
		item.attr("data-flipped","true");
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.children(".item-preview");
		var itemDetails = helperDiv.children(".item-details");
		var textWrapper = $("<div id='text-wrapper' />");
		var imageWrapper = $("<div id='image-wrapper' class='preview image-cover' />");
		textWrapper.append(itemDetails);
		imageWrapper.append(itemPreview);
		helperDiv.append(textWrapper);
		helperDiv.append(imageWrapper);
	}
};

left_layout.unflip = function(item){
	if (typeof item.attr("data-flipped") != "undefined"){
		item.removeAttr("data-flipped","true");
		var helperDiv = item.find(".helper-div");
		var itemPreview = helperDiv.find(".item-preview");
		var itemDetails = helperDiv.find(".item-details");
		itemPreview.unwrap();
		itemDetails.unwrap();
		itemPreview.before(itemDetails);
	}
};; var top_layout = {};

top_layout.init = function(container,items){
	SpimeEngine.DebugPrint("top layout init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	//var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
};

top_layout.applyLayout = function(container,items,paramsFromRealTime){
	SpimeEngine.DebugPrint("top layout applyLayout for ");
	items.find(".item-details").css("height","");
	items.find(".image-cover").css("height","");
	items.find(".image-cover").css("min-height","");
	
	var maxHeight = 0;
	var innerMaxHeight = 0;
	var maxItemBoxHeight = 0;
	items.each(function(){
		itemDetailsHeight = $(this).find(".item-details").outerHeight(true);
		maxHeight = Math.max(maxHeight,itemDetailsHeight);
		var itemContent = $(this).find(".item-content").andSelf().filter(".item-content");
		maxItemBoxHeight = Math.max(maxItemBoxHeight,itemContent.height());
		innerMaxHeight = Math.max(innerMaxHeight,$(this).find(".item-details").outerHeight());
	});
	
	items.each(function(){
		$(this).find(".item-details").height(innerMaxHeight);
		var itemContent = $(this).find(".item-content").andSelf().filter(".item-content");
		itemBoxHeight =  itemContent.height();
		$(this).find(".image-cover").css("height",maxItemBoxHeight - maxHeight ).css("min-height",maxItemBoxHeight - maxHeight );
	});
};; var middle_layout = {};

middle_layout.init = function(container,items){
	//var originalFontSize = Math.round(parseInt(items.find(".preview-title").css("font-size")));
	//items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
	items.find(".image-cover").css("min-height","inherit");
};

middle_layout.applyLayout = function(container,items,paramsFromRealTime){
	items.find(".item-content , .item-preview").css("min-height","initial");
	//container.closest(".master.item-box").removeAttr("data-min-stripe-height");
	//var originalFontSize = parseInt(items.find(".preview-title").attr("data-orig-font-size"));
	//var shrinkPlease = true;
//	if (typeof paramsFromRealTime != "undefined" ){
//		if (typeof paramsFromRealTime.value != "undefined"){
//			originalFontSize = parseInt(paramsFromRealTime.value);
//			items.find(".preview-title").attr("data-orig-font-size",originalFontSize);
//			shrinkPlease = false;
//		}
//	}
//	if (shrinkPlease){
	//	items.find(".preview-title").css("font-size",originalFontSize);
		//var minFontSize = 9999;
		//items.each(function(){
		//	var itemDetails = $(this).find(".item-details");
		//	var stripe = itemDetails.closest(".item-wrapper");
		//	var textElement = $(this).find(".preview-title");
		//	minFontSize = Math.min(minFontSize,SpimeEngine.shrinkTextToFit(originalFontSize,stripe,itemDetails,textElement,0,30));
		//});
		items.each(function(){
			$(this).find(".helper-div").css("padding",$(this).css("padding"));
			$(this).find(".item-content, .item-preview").css("min-height","inherit");
			//$(this).find(".preview-title").css("font-size",minFontSize);
		});
//	}
};; var matrix_arranger = {};

matrix_arranger.init = function(container,items,whatsNext){
	 SpimeEngine.DebugPrint("rowcol arranger init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	 var settings = container.closest(".item-wrapper").find(".arranger-settings");
	 /******************************************************************
		 *           HANDLING THE ELEMENTS
	 ********************************************************************/
//	var elements = items.not(".element-box").first().siblings(".element-box");
	//var stripeHeader
//	elements.remove();
	 
	 /******************************************************************
		 *           HANDLING THE ITEMS
	********************************************************************/
	 var itemsHolder = container.find("#items-holder");
	 var itemsHolderWrapper = container.find("#items-holder-wrapper");
	 //backward compatibility
	 if (itemsHolder.length == 0){
		 items = container.find(".sub.item-box");
		 itemsHolder = $("<div id='items-holder' />");
		 itemsHolderWrapper = $("<div id='items-holder-wrapper' />");
		 itemsHolder.append(items);
		 itemsHolderWrapper.append(itemsHolder);
		 container.find("#children").append(itemsHolderWrapper);
	 }
//	 var itemsHolderWrapper = container.find("#items-holder-wrapper");
	//Select only children of type item
//	 var onlyItems = items.not(".element-box").not(".stripe_header");
//	 if (itemsHolder.length == 0){
//		 itemsHolder = $("<div id='items-holder' />");
//		 itemsHolderWrapper = $("<div id='items-holder-wrapper' />");
//		 itemsHolder.append(onlyItems);
//		 itemsHolderWrapper.append(itemsHolder);
//		 container.find("#children").append(itemsHolderWrapper);
//	 }
	 
	 var pagHolder = container.find("#pagination-holder");
	 if (pagHolder.length == 0){
		 matrix_arranger.initPaginationHolder(container);
	 }
	 
	 if (typeof  whatsNext != "undefined"){
		 whatsNext();
	 }
	 
	//set original height
	items.find(".inner-pic").each(function(){
		SpimeEngine.updateImageRealSize($(this));
	});
};

matrix_arranger.arrange = function(items,container,whatsNext){
	SpimeEngine.DebugPrint("rowcol arranger arrange for " + items.length + " items and container: " + container.width() + " X " + container.height());
	
	/******************************************************************
	 *           HANDLING THE ELEMENTS
	 ********************************************************************/
	//var elementsHolder = container.find("#elements-holder");
	var itemsHolder = container.find("#items-holder");
	items = itemsHolder.children();
	var calculatedElementsHeight = 0;
	
	var stripe = container.closest(".master.item-box");
	stripe.css("min-height","initial");
	var stripeType = stripe.attr("data-preset-type-id");
	var isFeatures = false//XPRSHelper.inPresetGroup(stripeType,"FEATURES");


	/******************************************************************
	 *           LOADING ARRANGER SETTINGS
	 ********************************************************************/
	
	var settings = container.closest(".item-wrapper").find(".arranger-settings");
	var ratio = parseFloat(settings.attr('data-arranger_item_ratio')) ;
	var colsFromSettings = parseInt(settings.attr('data-arranger_cols'));
	colsFromSettings = isFeatures ? items.length : colsFromSettings;
	colsFromSettings = Math.min(items.length,colsFromSettings);
	var itemsMargin =  parseInt(settings.attr('data-arranger_item_spacing'));
	var itemMinWidth = parseInt(settings.attr('data-arranger_item_min_width'));
	var itemMaxWidth = parseInt(settings.attr('data-arranger_item_max_width'));
	var itemsPerPage = settings.attr('data-arranger_items_per_page');
	itemsPerPage = isFeatures ? items.length : itemsPerPage;
	itemsPerPage = (itemsPerPage == "all") ? items.length : parseInt(itemsPerPage);
	
	
	/******************************************************************
	 * DEFINE PARTICIPATING DIVS        
	 ********************************************************************/
	//ParentWrapper is the source for our max width
	var parentWrapper = itemsHolder.closest(".gallery-wrapper");
	
	var forcedArrange = (typeof stripe.attr("data-forced-arrange") != "undefined");
	var fromHeightResize = (typeof stripe.attr("data-height-resize") != "undefined");
	var fromWidthResize = forcedArrange || (typeof stripe.attr("data-width-resize") != "undefined") || (typeof stripe.attr("data-arranger_cols-from-settings") != "undefined")|| (typeof stripe.attr("data-arranger_item_spacing-from-settings") != "undefined");
	//fromWidthResize = false
	stripe.removeAttr("data-forced-arrange");
	var paginationWrapper =  container.find("#pagination-wrapper");
	var paginationHeight = paginationWrapper.is(':visible') ? paginationWrapper.outerHeight(true) : 0;
	//var stripeHeight = stripe.height() - calculatedElementsHeight - paginationHeight;//- parseInt(stripe.css("padding-top")) - parseInt(stripe.css("padding-bottom"));
	
	/******************************************************************
	 * START CALCULATIONS WITH ITEM MIN WIDTH AND HEIGHT * RATIO AND COLS AS THE NUMBER OF ITEMS      
	 ********************************************************************/
	var percentagePaddingFix = 0;
	if (parseInt(stripe.css("padding-left")) > 0){
		percentagePaddingFix = 1;
	}
	var wrapperWidth = parentWrapper.width() - percentagePaddingFix;
	//Min width can not be larger than  screen or the max item width
	itemMinWidth = Math.min(itemMinWidth,itemMaxWidth);
	itemMinWidth = Math.min(itemMinWidth,wrapperWidth);
	items.find(".preview-content-holder").css("min-height","");
	
	var cols = Math.floor((wrapperWidth + itemsMargin*2) / (itemMinWidth + itemsMargin*2));
	cols = Math.min(colsFromSettings,cols);
	if (forcedArrange){//if (fromWidthResize){
		var wrapperWidthForTest = wrapperWidth - colsFromSettings*itemsMargin*2 + itemsMargin*2;
		itemMinWidth =   Math.floor(wrapperWidthForTest / colsFromSettings);
		itemMinWidth = Math.min(itemMinWidth,itemMaxWidth);
		itemMinWidth *= 0.7;
		cols = colsFromSettings;
	}
	//cols must be at least 1
	cols =  Math.max(cols,1);
	
	if (cols == 2 && colsFromSettings != 2 && items.length == 3){
		cols = 1;
	}
	
	if (cols == 3 && items.length == 4 && colsFromSettings != 3){
		cols = 2;
	}
	if (cols == 5 && items.length == 6 && colsFromSettings != 5){
		cols = 3;
	}
	
	//The total number of rows we have
	var rows = Math.ceil(items.length / cols);
	//Restoring items defaults (if change during previous arrange)
	//items.show();
	items.css({"clear":"","display":"inline-block"});
	var itemRow = 0;
	
	/******************************************************************
	 * BREAK THE ITEMS ACCORDING TO CALCULATED COLS AND GIVE EACH ONE ROW IDENTIFIER 
	 ********************************************************************/
	
	var maxContentHeight = 0;
	items.removeClass("top-side").removeClass("bottom-side").removeClass("left-side").removeClass("right-side");;
	items.each(function(idx){
		if (idx % cols == 0){
			$(this).css({"clear":"left"});
			$(this).addClass("left-side");
			itemRow++;
		}
		if (idx % cols == cols-1){
			$(this).addClass("right-side");
		}
		if (itemRow == 1){
			$(this).addClass("top-side");
		}
		if (itemRow == rows){
			$(this).addClass("bottom-side");
		}
		$(this).attr("data-row",itemRow);
		maxContentHeight = Math.max(maxContentHeight,$(this).find(".preview-content-holder").height()); 
	});
	
	
	//maxContentHeight = Math.max(itemsHolder.height(),maxContentHeight);
	
	
	//if we have more space we enlarge the items 
	var extraSpace = Math.floor(    (wrapperWidth - (cols*itemMinWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
	var	calculatedItemWidth = Math.floor(itemMinWidth + extraSpace);//Math.round((wrapperWidth)/cols) - ((cols-1)*(itemsMargin*2));
	calculatedItemWidth = Math.min(calculatedItemWidth,itemMaxWidth);
	
	setTimeout(function(){
		if (wrapperWidth - parentWrapper.width() > 3){
			extraSpace = Math.floor(    (parentWrapper.width() - (cols*itemMinWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
			calculatedItemWidth = Math.floor(itemMinWidth + extraSpace);//Math.round((wrapperWidth)/cols) - ((cols-1)*(itemsMargin*2));
			calculatedItemWidth = Math.min(calculatedItemWidth,itemMaxWidth);
			items.width(calculatedItemWidth);
		}
		items.css("display", "inline-flex");
		setTimeout(function(){items.css("display","");},0)
	},10);
	
	if (fromWidthResize || forcedArrange){
		//calculatedItemWidth = itemMinWidth;
		settings.attr('data-arranger_item_min_width',itemMinWidth);
		stripe.attr("data-items-min-width",itemMinWidth);
	}

	/******************************************************************
	 * CHANGE ITEMS WIDTH HEIGHT AND SPACING ACCORDING TO CALCULATIONS
	 ********************************************************************/
	items.width(calculatedItemWidth).css({"margin":itemsMargin});
	items.filter(".top-side").css("margin-top",itemsMargin*2);
	items.filter(".bottom-side").css("margin-bottom",itemsMargin*2);
	items.filter(".left-side").css("margin-left",0);
	items.filter(".right-side").css("margin-right",0);
	

	itemsHolder.css({"text-align":""});
	
	items.slice(itemsPerPage,items.length).hide();
	

	
	
	
	/******************************************************************
	 * HANDLE PAGINATION
	 ********************************************************************/
	// If we need pagination (not all items fit the given height)
	var inMoreMode = (typeof stripe.attr("data-more-clicked") != "undefined");
	if (itemsPerPage < items.length ){
		if (inMoreMode){
			paginationWrapper.hide();
			items.css("display","inline-block");
		}else{
			paginationWrapper.show();
		}
	}else{
		//Hide paginator
		paginationWrapper.hide();
	}
	
	
	extraSpace = Math.floor(    (wrapperWidth - (cols*itemMaxWidth) - (cols*itemsMargin*2) + (itemsMargin*2) )  /cols     );
	if(calculatedItemWidth == itemMaxWidth && extraSpace > 0){
		// itemsHolder.css("text-align","center");
		var currentRowWidth = (itemMaxWidth * cols) + (cols*itemsMargin*2) - itemsMargin*2;
		itemsHolder.width(currentRowWidth);
	}else{
		itemsHolder.css("width","");
	}

	if (typeof  whatsNext != "undefined"){
		var originalItemMinWidth = parseInt(settings.attr('data-arranger_item_min_width'));
		var actualItemMinWidth = itemMinWidth;
		if (actualItemMinWidth != originalItemMinWidth){
			stripe.attr("data-items-min-width",actualItemMinWidth);
		}
		whatsNext();
	 }

};

matrix_arranger.showMore = function(stripe){
	
	var itemsHolder = stripe.find("#items-holder");
	var items = itemsHolder.children();
	var paginationWrapper = stripe.find("#pagination-wrapper");
	paginationWrapper.hide();
	var itemsWrapper = stripe.find("#items-holder-wrapper");
	var topMargin = parseInt(itemsWrapper.css("margin-top"));
	itemsWrapper.css("margin-bottom",topMargin);
	items.css("display","inline-block");
	SpimeEngine.fitVideos(stripe);
	stripe.attr("data-more-clicked","true");
};

matrix_arranger.showLess = function(stripe){
	var itemsHolder = stripe.find("#items-holder");
	var items = itemsHolder.children();
	var paginationWrapper = stripe.find("#pagination-wrapper");
	var itemsWrapper = stripe.find("#items-holder-wrapper");
	//var topMargin = parseInt(itemsWrapper.css("margin-top"));
	itemsWrapper.css("margin-bottom","");
	var itemsToShow = parseInt(stripe.attr("data-items-to-show"));
	if (itemsToShow < items.length){
		paginationWrapper.show();
	}
	items.hide();
	items.slice(0,itemsToShow).css("display","inline-block")
	stripe.removeAttr("data-more-clicked");
};



matrix_arranger.initPaginationHolder = function(container){
	var paginationBtn = $("<div id='pagination-btn' />");
	paginationBtn.text("More");
	var paginationHolder = $("<div id='pagination-holder' />").addClass("magic-circle-holder").attr("data-menu-name","PAGINATION_SETTINGS");
	var paginationHolderWrapper = $("<div id='pagination-wrapper' class='layer5' />");
	paginationHolder.append(paginationBtn);
	paginationHolderWrapper.append(paginationHolder);
	container.find("#children").append(paginationHolderWrapper);
	paginationHolder.unbind("click").bind("click",function(e){
		e.stopPropagation();
		var stripe = container.closest(".master.item-box");
		matrix_arranger.showMore(stripe);
	});
};; var stripes_arranger = {};

stripes_arranger.init = function(container,items,whatsNext){
	SpimeEngine.DebugPrint("stripes arranger init for " + items.length + " items and container: " + container.width() + " X " + container.height());
	items.each(function(){
		var currentItem = $(this);
		if (currentItem.hasClass("element-box")){
			var textElement = currentItem.find(".text-element");
			if (textElement.length > 0){
				textElement.each(function(){
					$(this).attr("data-orig-font-size",parseInt($(this).css("font-size")));
				});
			}
		}
	});
	if (typeof  whatsNext != "undefined"){
		 whatsNext();
	}
};

stripes_arranger.arrange = function(items,container){
	SpimeEngine.DebugPrint("stripes arranger arrange for " + items.length + " items and container: " + container.width() + " X " + container.height());
	items.each(function(idx){
		var currentItem = $(this);
		if (currentItem.hasClass("element-box")){
			
			
			
//			var currentItem = $(this);
//			var textElement = currentItem.find(".preview-title");
//			var contentHolder = currentItem.find(".preview-content-holder");
//			var contentWrapper = currentItem.find(".preview-content-wrapper");
//			var originalFontSize = parseInt(textElement.attr("data-orig-font-size"));
//			if (typeof currentItem.attr("data-flipped") != "undefined"){
//				contentWrapper = currentItem.find(".helper-div"); 
//			}
//			textElement.css("font-size",originalFontSize);
//			if (contentHolder.outerWidth(true) > contentWrapper.width()){
//				var newFontSize =  SpimeEngine.shrinkTextToFit(originalFontSize,contentWrapper,contentHolder,textElement,0,30);
//				textElement.css("font-size",newFontSize);
//			}
			
			
			
			var textElement = currentItem.find(".text-element");
			
			
			textElement.each(function(){
				var originalFontSize = parseInt($(this).attr("data-orig-font-size"));
				$(this).css("font-size",originalFontSize);
				var contentHolder = $(this).parent();
				if ($(this).outerWidth(true) > contentHolder.width()){
					//var newFontSize = stripes_arranger.shrinker(originalFontSize,currentItem,textElement);
					var newFontSize = SpimeEngine.shrinkTextToFit(originalFontSize,currentItem,$(this),$(this),0,30);
					$(this).css("font-size",newFontSize);
				}
			});
			
			
		}
	});

};

stripes_arranger.shrinker = function(fontSize,parent,content){
	if (content.outerWidth(true) > parent.width()){
		var shrinkedFontSize =  fontSize * 0.9 ;
		if (shrinkedFontSize < 15){
			return 15;
		}else{
			content.css("font-size",shrinkedFontSize);
			return stripes_arranger.shrinker(shrinkedFontSize,parent,content);
		}
	}else{
		return parseInt(content.css("font-size"));
	}
};; var flex_arranger = {};
flex_arranger.init = function(container, items, whatsNext){
	var itemsHolder = container.find("#items-holder");
	items = itemsHolder.children();
	//if we have elements in the container remove them
	flex_arranger.removeElements(items);
	//create the arrows
	flex_arranger.createArrows(container, itemsHolder, items);
	items.attr("data-child-type","SLIDE");
	flex_arranger.handlePagination(items, container);
	if (typeof  whatsNext != "undefined"){
		 whatsNext();
	}
	items.removeAttr("data-visible");
	var firstSlide = items.first().attr("data-visible","visible");
	if (typeof container.attr("start-with-slide") != "undefined"){
		firstSlide = items.filter(".slide-" + container.attr("start-with-slide")).attr("data-visible","visible");
	}
	if (firstSlide.length == 0 ){
		firstSlide = items.first();
	}
	var slideshowType = flex_arranger.getSlideshowType(container);
	switch(slideshowType){
		case "SLIDE":
		case "FILM":
		case "SQUARES":
			firstSlide.css("left",0).addClass("play-effect");
			break;
		case "FADE":
			firstSlide.addClass("play-effect");
			firstSlide.css("left",0)
			items.css("left",0)
			break;
	}
	container.attr("data-slide-effect",slideshowType);
};

flex_arranger.arrange = function(items,container){
	var itemsHolder = container.find("#items-holder");
	items = itemsHolder.children();
	var stripe = container.closest(".master.item-box");
	var flexArrows = container.find(".flex-arrows");
	var settings = stripe.find(".arranger-settings");
	if (stripe.width() < 400){
		flexArrows.addClass("disabled");
	}else{
		flexArrows.removeClass("disabled");
	}
	var autoPlay = (settings.attr("data-auto_play") == "AUTOPLAY" || settings.attr("data-auto_play") == "true");
	var autoPlayDuration = parseInt(settings.attr("data-auto_play_duration"));
	var allowAutoPlay = !($("#xprs").hasClass("in-editor"));
	allowAutoPlay = allowAutoPlay || (typeof stripe.attr("data-auto_play-from-settings") != "undefined");
	allowAutoPlay = allowAutoPlay && items.length > 1;
	stripe.removeAttr("data-auto_play-from-settings");
	
	
	var durationSettingsChanged = stripe.attr("data-auto_play_duration-from-settings") || stripe.attr("data-forced-arrange");
	stripe.removeAttr("data-forced-arrange");
	if (durationSettingsChanged){
		stripe.removeAttr("data-auto_play_duration-from-settings");
		if (container.attr("data-interval-id")){
			clearInterval(parseInt(container.attr("data-interval-id")));
			container.removeAttr("data-interval-id");
		}
	}
	if (autoPlay && !container.attr("data-interval-id")){
		
		var rightArrow = flexArrows.filter(".right");
		var intervalId = setInterval(function(){
			if (allowAutoPlay){
				flex_arranger.slide(rightArrow,"right",items,container);
			}
		},autoPlayDuration*1000);
		container.attr("data-interval-id" , intervalId);
	}else{
		if (!autoPlay){
			if (container.attr("data-interval-id")){
				clearInterval(parseInt(container.attr("data-interval-id")));
			}
		}
	}
	
	if (items.length == 1 ){
		container.find(".flex-arrows").hide();
	}else{
		container.find(".flex-arrows").show();
	}
	var rightArrow = container.find(".flex-arrows.right");
	var leftArrow = container.find(".flex-arrows.left");
	var newTop = container.height()/2 - rightArrow.height/2;
	leftArrow.css({"float":"none","left":0,"top":newTop,"position":"absolute"});
	rightArrow.css({"float":"none","right":0,"top":newTop,"position":"absolute"});
	items.each(function(){
		var currentItem = $(this);
		currentItem.css("width",container.width());
	});

	container.find("#items-holder").width(parseInt(container.width()) * items.length);
	
	var visibleItem = items.filter("[data-visible='visible']");
	if (visibleItem.length  == 0 ){
		items.removeAttr("data-visible");
		visibleItem = items.first();
		visibleItem.attr("data-visible","visible");
		visibleItem.addClass("play-effect");
	}
	
	items.removeClass("before-visible after-visible")
	visibleItem.nextAll().addClass("after-visible");
	visibleItem.prevAll().addClass("before-visible");
	
	var slideshowType = flex_arranger.getSlideshowType(container);
	container.attr("data-slide-effect",slideshowType);
	switch(slideshowType){
		case "SLIDE":
		case "FILM":
		case "SQUARES":
			var itemsNewLeft = visibleItem.index() * -1 * visibleItem.width();
			items.each(function(){
				var currentItem = $(this);
				currentItem.css("left",itemsNewLeft);
			});
			break;
		case "FADE":
			
			break;
	}
};

flex_arranger.slide = function(btn,direction,items,container){
	var currentVisible = items.filter('[data-visible="visible"]');
	var nextVisible = currentVisible.prev();
	if (direction=="left"){
		if(nextVisible.length==0){
			nextVisible = items.last();
			flex_arranger.showPage(nextVisible.attr("data-page-num"),container,items);
		}else{
			flex_arranger.showPage(nextVisible.attr("data-page-num"),container,items);
		}
	}else{
		nextVisible = currentVisible.next();
		if(nextVisible.length==0){
			nextVisible = items.first();
			flex_arranger.showPage(nextVisible.attr("data-page-num"),container,items);

		}else{
			flex_arranger.showPage(nextVisible.attr("data-page-num"),container,items);

		}
		
	}


};



flex_arranger.showItem = function(container,items,itemId){
	var nextVisible = items.filter("#" + itemId);
	var itemToShowPageNum = nextVisible.attr("data-page-num");
	flex_arranger.showPage(itemToShowPageNum,container,items);
};

flex_arranger.showPage = function(pageNum,container,items){
	container.find(".page-navigator").removeClass("active");
	container.find(".page-navigator").removeClass("active");
	container.find("#nav" + pageNum).addClass("active");
	
	var pageToShow = items.filter(".slide-" + pageNum);
	items.removeAttr("data-visible");
	pageToShow.attr("data-visible","visible");
	items.removeClass("before-visible after-visible")
	pageToShow.nextAll().addClass("after-visible");
	pageToShow.prevAll().addClass("before-visible");
	var pageToShowIndex = pageToShow.index();
	var itemsNewLeft = pageToShowIndex * -1 * pageToShow.width();


	var slideshowType = flex_arranger.getSlideshowType(container);
	switch(slideshowType){
		case "SLIDE":
		case "FILM":
		case "SQUARES":
			items.each(function(){
				var currentItem = $(this);
				currentItem.css("left",itemsNewLeft);
			});
			break;
		case "FADE":
			items.each(function(idx){
				$(this).css ("transform","translateX(-" + (100*idx) + "%)");
			});
			break;
	}
	items.removeClass("play-effect");
	flex_arranger.emulateTransitionEnd (pageToShow,1050,function(){
		pageToShow.addClass("play-effect");
	});
};

flex_arranger.handlePagination = function(items,container){
	
	items.each(function(idx){
		var currentItem = $(this);
		currentItem.removeClass (function (index, className) {
		    return (className.match (/(^|\s)slide-\S+/g) || []).join(' ');
		});
		currentItem.addClass("slide-" + (idx + 1)).attr("data-page-num",(idx + 1));
	});
	var numOfPages = items.length;
	

	container.find(".page-navigator").remove();
	container.find("#paginator").remove();
	var paginator = $("<div />").attr("id","paginator");
	for(var i=1;i <= numOfPages; i++){
		var pageNavigator = $("<div />").attr("id","nav"+i).addClass("page-navigator").attr("data-page-num",i).click(function(e){
			e.stopPropagation();
			if (container.attr("data-interval-id")){
				clearInterval(parseInt(container.attr("data-interval-id")));
			}
			flex_arranger.showPage($(this).attr("data-page-num"),container,items);
		});
		paginator.append(pageNavigator);
	}
	
	//paginator.css("left",parseInt(container.width())/2);
	//paginator.css("top",parseInt(container.height()) - 40);
	
	
	container.find("#items-holder-wrapper").append(paginator);
	
	var paginationWidth = parseInt(paginator.width());
	paginatorNeMargin = paginationWidth / -2; 
	paginator.css("margin-left",paginatorNeMargin);
	if (items.length == 1){
		paginator.hide();
	}else{
		paginator.show();
	}
	
	container.find("#nav1").addClass("active");
	
};


flex_arranger.emulateTransitionEnd = function(element,duration,callbackFunc) {
	  var called = false;
	  element.one('webkitTransitionEnd', function() { called = true; callbackFunc();});
	  var callback = function() { if (!called) element.trigger('webkitTransitionEnd'); };
	  setTimeout(callback, duration);
	};

flex_arranger.removeElements = function(items){
	var elements = items.not(".element-box").first().siblings(".element-box");
	elements.remove();
};

flex_arranger.getSlideshowType = function(container){
	var stripe = container.closest(".master.item-box");
	var settings = stripe.find(".arranger-settings");
	var slideshowType = settings.attr("data-slide_effect");
	if (typeof slideshowType == "undefined"){
		slideshowType = "SLIDE";
	}
	return slideshowType;
};

flex_arranger.getArrowSrc = function(container){
	var stripe = container.closest(".master.item-box");
	var settings = stripe.find(".arranger-settings");
	var arrowsSrc = settings.attr("data-flex_arrows");
	if (typeof arrowsSrc == "undefined"){
		arrowsSrc = "https://lh3.googleusercontent.com/ZMARmveTg1geksYKXZKdh71KW09XrhDLg8N-XrfXCGsDBEHnuKwhmYpHd55Y2-NwuwLX8qsyx26JNyJWtr1jEcxD=s50";
	}
	return arrowsSrc;
};

flex_arranger.createArrows = function(container, itemsHolder, items){
	var flexArrows = container.find(".flex-arrows");
	var leftArrow = flexArrows.filter(".left");
	var arrowImg = flex_arranger.getArrowSrc(container);
	var rightArrow = flexArrows.filter(".right");
	if (flexArrows.length == 0 || leftArrow.attr("src") != arrowImg){
		flexArrows.remove();
		rightArrow = $("<img />");
		rightArrow.attr("src",arrowImg);
		rightArrow.addClass("flex-arrows").addClass("right").addClass("layer5").css("transform","scale(-1)");
		leftArrow = $("<img />");
		leftArrow.attr("src",arrowImg);
		leftArrow.addClass("flex-arrows").addClass("left").addClass("layer5");
		itemsHolder.parent().prepend(leftArrow).prepend(rightArrow);
	}
	rightArrow.unbind("click").bind("click",function(event){
		event.stopPropagation();
		if (container.attr("data-interval-id")){
			clearInterval(parseInt(container.attr("data-interval-id")));
		}
		flex_arranger.slide(rightArrow,"right",items,container);
	});
	leftArrow.unbind("click").bind("click",function(event){
		event.stopPropagation();
		if (container.attr("data-interval-id")){
			clearInterval(parseInt(container.attr("data-interval-id")));
		}
		flex_arranger.slide(leftArrow,"left",items,container);
	});

	container.unbind("swipeleft").bind("swipeleft",function(){
		if (items.length > 1){
			if (container.attr("data-interval-id")){
				clearInterval(parseInt(container.attr("data-interval-id")));
			}
	    	flex_arranger.slide(rightArrow,"right",items,container);
		}
	});
	
	container.unbind("swiperight").bind("swiperight",function(){
		if (items.length > 1){
			if (container.attr("data-interval-id")){
				clearInterval(parseInt(container.attr("data-interval-id")));
			}
	    	flex_arranger.slide(leftArrow,"left",items,container);
		}
	});
};; var menu_layout = {};
menu_layout.LEFT_MENU_WIDTH = 270;
menu_layout.SCROLLBAR_WIDTH = 0;

menu_layout.init = function(container,items){
	var currentPageId = $(".master.container").attr("id");
	var currentPageSlug = $(".master.container").attr("data-itemslug");
	if (XPRSHelper.isChrome()){
		menu_layout.SCROLLBAR_WIDTH = 0;
		//$(".master.container").addClass("chrome");
	}
	items.each(function(){
		var currentItem = $(this);
		
		//Mark link of the current page
		currentItem.find(".preview-item-links a").each(function(){
			var linkStr = $(this).attr("href");
			if (linkStr){
				//remove query params
				if (linkStr.indexOf("?") != -1){
					linkStr = linkStr.substring(0,linkStr.indexOf("?"));
				}
				//match slug or vbid
				var linkToCurrentPage = linkStr.indexOf(currentPageId, linkStr.length - currentPageId.length) !== -1;
				linkToCurrentPage = linkToCurrentPage || linkStr.indexOf(currentPageSlug, linkStr.length - currentPageSlug.length) !== -1;
				if (linkToCurrentPage){
					$(this).addClass("current-page");
					//do not mark more than one even if found
					return false;
				}
			}
		});



		
		//LEFT MENU
		var holder = container.closest(".master.item-box");
		holder.addClass("animated-color")
		var settings = holder.find(".layout-settings");
		var menuPosition = settings.attr("data-menu_position");
		var isProductPage = window.location.href.indexOf("/product/") != -1;
		if(typeof window["EditorHelper"] == "undefined"){
			var submenuTitles = currentItem.find(".submenu-title");
			submenuTitles.each(function(){
				var submenuTitle = $(this);
				if (submenuTitle.parent().is("a")){
					submenuTitle.unwrap()
				}
				submenuTitle.unbind("click").bind("click",function(e){
					e.stopPropagation();
					var clickedTitle = $(this);
					menu_layout.toggleSubmenu(clickedTitle);
				});
			});
			// submenuTitles.unbind("click").bind("click",function(e){
			// 	e.stopPropagation();
			// 	var clickedTitle = $(this);
			// 	menu_layout.toggleSubmenu(clickedTitle);
			// });
		}

		if (isProductPage && menuPosition == "none"){
			menuPosition= "top";
			settings.attr("data-menu_position","top")
		}
		holder.removeClass("hidden-menu");
		if (menuPosition == "none"){
			holder.css("display","none");
		}else if (menuPosition == "left"){
			$(".master.container").find("#children").first().css("width",$(window).innerWidth() - menu_layout.SCROLLBAR_WIDTH - menu_layout.LEFT_MENU_WIDTH);
			$(".left-menu-placeholder").height($(window).height());
		}else{
			$(".master.container").find("#children").first().css("width","");
		}
		
		var previewTitle = currentItem.find(".preview-title");
		//var previewSubtitle = currentItem.find(".preview-subtitle");
		var rightSideDiv = currentItem.find('.right-div');
		var leftSideDiv = currentItem.find('.left-div');
		var stripe = container.closest(".master.item-box");
		totalLinksWidth = rightSideDiv.outerWidth(true);
		
		//Saving the original links width for unmenufying - only if we are not centered
		if (!rightSideDiv.hasClass("centerified") && settings.attr("data-menu_align") != "center" && stripe.css("display") != "none"){
			stripe.attr("data-original-menu-width",totalLinksWidth);
		}
		
		//no shrink if title is not present
		var originalFontSize = "N/A";
		if (currentItem.find(".element-placeholder[data-elementtype='TITLE']").length == 0){
			originalFontSize = Math.round(parseInt(previewTitle.css("font-size")));
			leftSideDiv.attr("data-orig-font-size",originalFontSize);
		}
		var noTitleAndSub = currentItem.find(".preview-title").length == 0 && currentItem.find(".preview-subtitle").length == 0;
		//If no subtitle and no title found link will be aligned to center
		if ((noTitleAndSub) || (currentItem.find(".element-placeholder[data-elementtype='TITLE']").length > 0 && currentItem.find(".element-placeholder[data-elementtype='SUBTITLE']").length > 0)){
			currentItem.find(".helper-div").hide();
			if (noTitleAndSub && currentItem.find(".preview-icon").length > 0){
				menu_layout.centerifyLinks(leftSideDiv,rightSideDiv);
			}else{
				menu_layout.uncenterifyLinks(leftSideDiv,rightSideDiv);
			}
		}else{
			currentItem.find(".helper-div").show();
			menu_layout.uncenterifyLinks(leftSideDiv,rightSideDiv);
		}
	});
};


menu_layout.closeOpenedSubmenus = function(){
	var openedSubmenus = $(".submenu-title.menu-opened");
	var wasOpen = openedSubmenus.length > 0;
	if (wasOpen){
		var holder = openedSubmenus.closest(".master.item-box");
		holder.css("z-index","");
	}
	openedSubmenus.each(function(){
		var currentSubmenuTitle = $(this);
		if (currentSubmenuTitle.parent().is("a")){
			currentSubmenuTitle.parent().next(".submenu").hide();
		}else{
			currentSubmenuTitle.next(".submenu").hide();
		}
		currentSubmenuTitle.removeClass("menu-opened");
	});
	return wasOpen;
};

menu_layout.toggleSubmenu = function(clickedTitle){
	var holder = clickedTitle.closest(".master.item-box");
	var settings = holder.find(".layout-settings");
	var menuPosition = settings.attr("data-menu_position");
	var currentSubmenu = clickedTitle.next(".submenu");
	if (clickedTitle.parent().is("a")){
		currentSubmenu = clickedTitle.parent().next(".submenu");
	}
	var noPlaceMode = holder.find(".preview-item-links.no-place").length == 1;
	var minifiyType = settings.attr("data-always_minified");
	if (currentSubmenu.is(":visible")){
		holder.css("z-index","")
		if (menuPosition == "left" || minifiyType == "side_screen" || minifiyType == "full_screen" || noPlaceMode){
			currentSubmenu.slideUp(function(){
				clickedTitle.removeClass("menu-opened");
			});
		}else{
			currentSubmenu.fadeOut(function(){
				clickedTitle.removeClass("menu-opened");
			});
		}
		
	}else{
		holder.css("z-index","1234567890")
		menu_layout.calculateSubmenuBG(holder,currentSubmenu);
		holder.find(".menu-opened").removeClass("menu-opened");
		clickedTitle.addClass("menu-opened");
		if (menuPosition == "left" || minifiyType == "side_screen" || minifiyType == "full_screen" || noPlaceMode){
			holder.find(".submenu:visible").slideUp()
			currentSubmenu.slideDown();
		}else{
			holder.find(".submenu:visible").fadeOut()
			currentSubmenu.fadeIn(function(){
				clickedTitle.addClass("menu-opened");
			});
		}
		
	}
};

menu_layout.centerifyLinks = function(leftSideDiv,rightSideDiv){
	leftSideDiv.css({"width":0,"display":"inline"});
	rightSideDiv.css({"width":"100%","text-align":"center"}).addClass("centerified");
};

menu_layout.uncenterifyLinks = function(leftSideDiv,rightSideDiv){
	leftSideDiv.css({"width":"","display":""});
	rightSideDiv.css({"width":"","text-align":""}).removeClass("centerified");;
};

menu_layout.applyLayout = function(container,items,paramsFromRealTime){
	var holder = container.closest(".master.item-box");
	var masterContainer = $(".master.container");
	items.each(function(){
		var currentItem = $(this);
		currentItem.find(".preview-item-links").css("display","");
		var settings = container.closest(".master.item-box").find(".layout-settings");
		
		var alwaysMinify = settings.attr("data-always_minified") != "false";
		var leftMenuPlaceHolder = masterContainer.find(".left-menu-placeholder");
		var menuAlign = settings.attr("data-menu_align");
		if(holder.find(".item-wrapper").innerWidth() < 400 && leftMenuPlaceHolder.length == 0 && holder.css("display") != "none"){
			menuAlign = "left";
			holder.addClass("force-min-height50 minimal-design");
		}else{
			if (!holder.is(".being-scrolled")){
				holder.removeClass("force-min-height50 minimal-design");
			}
		}
		var menuPosition = settings.attr("data-menu_position");
		
		
		if (menuPosition == "none"){
			holder.css("display","none");
			//return;
		}else if (menuPosition == "left"){
			holder.css("display","");
			holder.removeClass("minimal-design");
			masterContainer.find("#children").first().css("width",$(window).innerWidth() - menu_layout.SCROLLBAR_WIDTH - menu_layout.LEFT_MENU_WIDTH);
			$(".left-menu-placeholder").height($(window).height());
		}else{
			holder.css("display","");
			masterContainer.find("#children").first().css("width","");
			//holder.find('.right-div').css("height",holder.find('.preview-icon-holder').height());
			if (holder.find('.preview-icon-holder').length > 0){
				holder.find('.right-div').css("height",holder.find('.preview-icon-holder').height());
			}else{
				holder.find('.right-div').css("height","");
			}
		}
		
		
		var menuRatio = $("body").width()/menu_layout.LEFT_MENU_WIDTH;
		if (menuPosition == "left" && menuRatio > 4){
			menuAlign = "center";
			masterContainer.addClass("left-menu-layout");
			holder.find(".preview-content-holder").css("height",$("body").height());
			if (leftMenuPlaceHolder.length == 0){
				leftMenuPlaceHolder = $("<div />").addClass("left-menu-placeholder");
				var holderHandle = holder.next(".control-handle");
				leftMenuPlaceHolder.append(holder);
				if (holderHandle.length > 0){
					leftMenuPlaceHolder.append(holderHandle);
				}
				$(".master.container > #children").before(leftMenuPlaceHolder);
			} 
		}else{
			masterContainer.removeClass("left-menu-layout");
			holder.find(".preview-content-holder").css("height","");
			masterContainer.find("#children").first().css("width","");
			menuPosition="top";
			if (leftMenuPlaceHolder.length != 0){
				var holderHandle = holder.next(".control-handle");
				$(".master.container > #children").prepend(holder);
				if (holderHandle.length > 0){
					holder.after(holderHandle);
				}
				
				leftMenuPlaceHolder.remove();
			}
		}
		if (menuAlign == "center"){
			holder.addClass("center-aligned-menu");
		}else{
			holder.removeClass("center-aligned-menu");
		}
		var previewTitle = currentItem.find(".preview-title");
		var previewSubtitle = currentItem.find(".preview-subtitle");
		var rightSideDiv = currentItem.find('.right-div');
		var leftSideDiv = currentItem.find('.left-div');
		leftSideDiv.find(".helper-div").show();
		var noTitleAndSub = currentItem.find(".preview-title").length == 0 && currentItem.find(".preview-subtitle").length == 0;
		if (noTitleAndSub || (currentItem.find(".element-placeholder[data-elementtype='TITLE']").length > 0 && currentItem.find(".element-placeholder[data-elementtype='SUBTITLE']").length > 0)){
			currentItem.find(".helper-div").hide();
			if (noTitleAndSub && currentItem.find(".preview-icon").length > 0){
				menu_layout.centerifyLinks(leftSideDiv,rightSideDiv);
			}else{
				menu_layout.uncenterifyLinks(leftSideDiv,rightSideDiv);
			}
		}else{
			currentItem.find(".helper-div").show();
			menu_layout.uncenterifyLinks(leftSideDiv,rightSideDiv);
		}
		
		var stripe = container.closest(".master.item-box");
		
		var textElement = currentItem.find(".preview-title");
		var contentHolder = currentItem.find(".preview-content-holder");
		var contentWrapper = currentItem.find(".preview-content-wrapper");
		
		var originalFontSize = "N/A";
		if (currentItem.find(".element-placeholder[data-elementtype='TITLE']").length == 0){
			originalFontSize =  parseInt(leftSideDiv.attr("data-orig-font-size"));
			if (textElement.attr("data-orig-font-size")){
				if (originalFontSize != textElement.attr("data-orig-font-size")){
					originalFontSize = textElement.attr("data-orig-font-size");
				}
			}
			textElement.css("font-size",originalFontSize + "px");
		}
		
		var totalLinksWidth = 0;
		
		if (typeof stripe.attr("data-original-menu-width") != "undefined"){
			totalLinksWidth = parseInt(stripe.attr("data-original-menu-width"));
		}else{
			totalLinksWidth = currentItem.find(".preview-item-links").outerWidth(true);
			if (stripe.css("display") != "none"){
				stripe.attr("data-original-menu-width",totalLinksWidth)
			}
		}
		
		
		var textSpace = 0;
		if (leftSideDiv.length > 0){
			textSpace = parseInt(leftSideDiv.width());
		}
		
		var relevantLinksWidth = totalLinksWidth
		var shrinkerRelevantContainer = contentWrapper;
		if( stripe.find(".preview-links-wrapper").is(".flipped")){
			relevantLinksWidth = 0;
			shrinkerRelevantContainer = stripe;
		}
		
		if (menuAlign == "center"){
			if (masterContainer.hasClass("left-menu-layout")){
				totalLinksWidth = 0; //(no shrink at all)
				shrinkerRelevantContainer = holder.find(".item-wrapper");
			}else{
				textSpace = 0; //(shrink and center)
				relevantLinksWidth = 0;
			}
		}
		//Shrink if needed
		if (leftSideDiv.outerWidth(true) + relevantLinksWidth > shrinkerRelevantContainer.width()){
			var newFontSize = SpimeEngine.shrinkTextToFit(originalFontSize,shrinkerRelevantContainer,leftSideDiv,textElement,totalLinksWidth,15);
			if (newFontSize != -1){
				textElement.css("font-size",newFontSize);
			}
		}

		var atLeastOneLink = holder.find("#sr-basket-widget , .preview-element.Link.item-link").length > 0
		alwaysMinify = alwaysMinify && menuAlign=="left" && menuPosition=="top";
		
		//console.log( contentHolder.width() + " " +  totalLinksWidth + " " + textSpace + " " +  alwaysMinify +  " " +atLeastOneLink)
		
		if ((contentHolder.width() <= totalLinksWidth + textSpace || alwaysMinify) && menuPosition=="top" && atLeastOneLink){
			//if shrink is not working menufyLinks
			menu_layout.menufyLinks(container,currentItem.find(".preview-item-links"));
			//if menufy is not enough remove text
			if (contentHolder.width() < textSpace + rightSideDiv.width()){
				//console.log("still NO space ");
				leftSideDiv.find(".helper-div").hide(); 
			}
		}else{
			if (!alwaysMinify || !atLeastOneLink){
				menu_layout.unmenufyLinks(container,container.next(".preview-item-links"));
				
			}
		}
		
		if (!holder.hasClass("menu-open")){
			if (settings.attr("data-menu_overlay") == "absolute" && !holder.is(".being-scrolled")){
				holder.addClass("force-transparency");
				if (settings.attr("data-menu_overlay") == "absolute" && holder.css("position")!= "absolute"){
					 holder.css("position","absolute");
				}
			}
			if (settings.attr("data-menu_overlay") == "relative" && !holder.is(".being-scrolled")){
				if (settings.attr("data-menu_overlay") == "relative" && holder.css("position")!= "relative"){
					holder.css("position","relative");
					holder.removeClass("force-transparency");
				}
			}
		}
		menu_layout.updateBurgerColor(stripe.find(".preview-item-links"));
		menu_layout.adjustMenuScrolling(stripe);
	});
	
};

menu_layout.forceRedraw = function(elements){
	elements.each(function(){
		var element = $(this)[0];
		  var disp = element.style.display;
		  element.style.display = 'none';
		  var trick = element.offsetHeight;
		  element.style.display = disp;
	});
	
};

menu_layout.adjustMenuScrolling = function(stripe){
	var linksHolder =  stripe.find(".preview-item-links");
	var linksWrapper = linksHolder.find(".preview-links-wrapper");
	if (stripe.hasClass("full-screen-menu menu-open")){
		if (linksWrapper.outerHeight(true) + linksWrapper.outerHeight(true)/2 > $(window).innerHeight() - stripe.height() -50){
			if (!linksHolder.hasClass("transform-disabled")){
				linksHolder.addClass("transform-disabled")
				linksWrapper.css({"top":stripe.height()});
				//linksWrapper.closest(".preview-item-links").css({"overflow-y":"scroll","padding-right": "20px"})//.attr("id","scrolling-menu");
			}
		}else{
			linksWrapper.css({"top":""});
			//linksWrapper.closest(".preview-item-links").css({"overflow-y":"","padding-right": ""});
			linksHolder.removeClass("transform-disabled")
		}
	}else{
		if (linksHolder.hasClass("transform-disabled")){
			linksHolder.removeClass("transform-disabled")
		}
	}
};

menu_layout.handleScroll = function(holder,scrollPos){
	if (holder.hasClass("is-blocked")){
		return;
	}
	var settings = holder.find(".layout-settings");
	var menuAlign = settings.attr("data-menu_align");
	var menuPosition = settings.attr("data-menu_position");
	if(holder.find(".item-wrapper").innerWidth() < 400 && menuPosition!="left"){
		menuAlign = "left";
		holder.addClass("force-min-height50 minimal-design");
	}else{
		holder.removeClass("minimal-design");
	}
	if (settings.attr("data-menu_scroll") == "true"){
		if (scrollPos == 0){
			$("#menu-placeholder").remove();
			if (menuAlign == "center"){
				holder.addClass("center-aligned-menu");
			}
			holder.css({"position":settings.attr("data-menu_overlay")});
			holder.removeClass("animated-top");
			holder.css("top","");
			//holder.find(".preview-subtitle-holder").show();
			holder.find('.left-div').removeClass("scale-down08");
			if (holder.find(".item-wrapper").innerWidth() >= 400){
				holder.removeClass("force-min-height50");
			}
			holder.removeClass("being-scrolled");
			if (!holder.is(".menufied")){
				//holder.find('.right-div').css("height","");
			}
			if (settings.attr("data-menu_overlay") == "absolute"){
				holder.addClass("force-transparency");
			}
			menu_layout.forceRedraw(holder.find(".item-wrapper"))
		}else if(scrollPos < holder.outerHeight(true)){

			
		}else{
			if (holder.css("position") != "fixed" ){
				//Create a menu place holder to prevent the mobile scroll jump
				var menuHeight = parseInt(holder.css("height"));
				if (holder.parent().find("#menu-placeholder").length == 0 && !holder.is(".force-transparency")){
					var menuPlaceHolder = $("<div />").attr("id","menu-placeholder").css({"height":menuHeight,"width":"100%"});
					holder.after(menuPlaceHolder);
				}
				//holder.attr("data-orig-min-height", holder.css("min-height"));
				holder.removeClass("center-aligned-menu");
				holder.addClass("being-scrolled");
				holder.addClass("force-min-height50");
				holder.css({"position":"fixed","top":menuHeight*-1});
				holder.find('.left-div').addClass("scale-down08");
				holder.find('.right-div').css("height",holder.find('.left-div').height());
				//holder.find(".preview-subtitle-holder").hide();
				holder.addClass("animated-top");
				holder.removeClass("force-transparency");
				setTimeout(function(){
					var offsetFix = (window["EditorHelper"] === undefined) ? 0 : $("#control-panel").css("height");
					holder.css("top",offsetFix);
				},10);
			}else{
				//if(typeof window["EditorHelper"] != "undefined" ){
				//	holder.removeClass("animated-top");
			//	holder.css("top",scrollPos);
				//}
			}
		}
	}
	
};


menu_layout.updateBurgerColor = function(linksHolder){
	var linksColor = linksHolder.find(".item-link").css("color");
	var styleForBurger = $("head style#for-burger");
	if (styleForBurger.length == 0){
		styleForBurger = $("<style>").attr("id","for-burger");
	}
	styleForBurger.text(".hamburger-inner:before,.hamburger-inner,.hamburger-inner:after {background-color:"+linksColor+";}")
	$('head').append(styleForBurger);
};

menu_layout.menufyLinks = function(container,linksHolder){
	var stripe = container.closest(".master.item-box");
	var settings = stripe.find(".layout-settings");
	var minifiyType = settings.attr("data-always_minified");
	var menufiedLinksBehaviour = settings.attr("data-menu_shrink_class");
	var menuBtn = container.find(".links-menu-btn");
	
	menuBtn.addClass("shown");
	if (container.next(".preview-item-links").length == 0){
		var allLinks = linksHolder.children();
		linksHolder.attr("data-shrink-style", menufiedLinksBehaviour)
		var menuBackground = container.find(".item-content").css("background-color");
		var menuMaxWidth = container.css("max-width");
		allLinks.addClass("flipped");
		stripe.addClass("menufied");
		if (!stripe.hasClass("menu-open")){
			//linksHolder.css({"max-width":menuMaxWidth,"background-color":menuBackground});
			linksHolder.hide();
		}
		
		//if (minifiyType != "false"){
			container.after(linksHolder);
			//linksHolder.css({"background-color":stripe.css("background-color")});
		//}
		
		
		
		stripe.attr("data-original-stripe-height" , stripe.height());
		
		menuBtn.unbind('click').bind('click', function(e){
			e.stopPropagation();
			menu_layout.burgerClick($(this),stripe,linksHolder);
		});
		
		
		if(typeof window["EditorHelper"] == "undefined"){
			linksHolder.unbind("click").bind("click",function(e){
				e.stopPropagation();
				menu_layout.burgerClick(menuBtn,stripe,linksHolder);
			});
		}
		
		stripe.find('.right-div').css("height",stripe.find('.preview-icon-holder').height());
	}
};


menu_layout.burgerClick = function(burger,stripe,linksHolder){
	if (!burger.hasClass("being-clicked")){
		burger.addClass("being-clicked")
		var settings = stripe.find(".layout-settings");
		var minifiyType = settings.attr("data-always_minified");
		linksHolder.removeClass("allow-bg-color");
		switch(minifiyType){
		case "true":
			menu_layout.handleMinifiedDefault(burger,stripe,linksHolder,settings);
			break;
		case "full_screen":
			linksHolder.addClass("allow-bg-color");
			menu_layout.handleMinifiedFullScreen(burger,stripe,linksHolder,settings);
			break;
		case "side_screen":
			linksHolder.addClass("allow-bg-color");
			menu_layout.handleMinifiedSideScreen(burger,stripe,linksHolder,settings);
			break;
		default:
			menu_layout.handleMinifiedDefault(burger,stripe,linksHolder,settings);
			break;
		}
		menu_layout.adjustMenuScrolling(stripe);
	}
};

menu_layout.handleMinifiedDefault = function(burger,stripe,linksHolder,settings){
	stripe.addClass("animated");
	burger.toggleClass("is-active");
	if (burger.hasClass("is-active")){
		stripe.removeClass("force-transparency");
		linksHolder.addClass("flipped");
		linksHolder.removeClass("no-place");
		stripe.addClass("menu-open");
		if (linksHolder.width() >=  stripe.width() && !linksHolder.is(".no-place")){
			linksHolder.addClass("no-place")
		}
		stripe.find(".item-content").addClass("flipped");
		burger.removeClass("being-clicked");
		linksHolder.slideDown(function(){
			
		});
	}else{
		linksHolder.slideUp(function(){
			stripe.removeClass("menu-open");
			if (settings.attr("data-menu_overlay") == "absolute" && !stripe.is(".being-scrolled")){
				stripe.addClass("force-transparency");
			}
		});
		burger.removeClass("being-clicked");
		
		linksHolder.removeClass("flipped");
		//linksHolder.css({"background-color":""});
	}
	
};

menu_layout.handleMinifiedFullScreen = function(burger,stripe,linksHolder,settings){
	burger.toggleClass("is-active");
	if (burger.hasClass("is-active")){
		//stripe.css("background-color","transparent")
		var master = $(".master.container");
		linksHolder.css({"margin-left":master.css("margin-left"),"margin-right":master.css("margin-right")});
		if (master.is(".narrow-site")){
			linksHolder.css("width","1000px");
		}
		$("body").addClass("noscroll");
		menu_layout.disableScroll();
		linksHolder.addClass("flipped");
		stripe.find(".item-content").addClass("flipped");
		linksHolder.fadeIn(function(){
			burger.removeClass("being-clicked")
		});
		stripe.addClass("full-screen-menu menu-open");
	}else{
		//stripe.css("background-color","")
		$("body").removeClass("noscroll");
		menu_layout.enableScroll();
		linksHolder.removeClass("flipped");
		linksHolder.fadeOut(function(){
			burger.removeClass("being-clicked")
			stripe.removeClass("full-screen-menu menu-open");
			//linksHolder.css({"background-color":""});
			linksHolder.css({"margin-left":"","margin-right":"","width":""})
		});
	}
};

menu_layout.handleMinifiedSideScreen = function(burger,stripe,linksHolder,settings){
	burger.toggleClass("is-active");
	if (burger.hasClass("is-active")){
		var master = $(".master.container");
		linksHolder.css({"margin-right":master.css("margin-right")})
		linksHolder.addClass("flipped");
		stripe.find(".item-content").addClass("flipped");
		stripe.addClass("side-screen-menu menu-open");
		linksHolder.show();
		setTimeout(function(){
			burger.removeClass("being-clicked")
			var calcRight = ($(window).width() - $("#xprs").width())/2
			// linksHolder.closest("nav").css("right",calcRight);
			linksHolder.css("right",calcRight)
		},10)
		
	}else{
		linksHolder.css({"transition":"none"});
		var animateSpeed = ($("body").is(".tablet-preview") || $("body").is(".cellphone-preview")) ? 0 : 1000;
		linksHolder.animate({
			right:"-360px"
		  }, animateSpeed, function() {
			  	burger.removeClass("being-clicked")
				linksHolder.hide();
				stripe.removeClass("side-screen-menu menu-open");
				linksHolder.css({"margin-right":"","right":"","transition":""});
		  });
		linksHolder.removeClass("flipped");
	}
};

menu_layout.handleMinifiedBoxed = function(burger,stripe,linksHolder,settings){
	burger.toggleClass("is-active");
	if (burger.hasClass("is-active")){
		stripe.removeClass("force-transparency");
		linksHolder.addClass("flipped");
		stripe.find(".item-content").addClass("flipped");
		linksHolder.css({"top":stripe.height()})
		linksHolder.fadeIn();
		stripe.addClass("boxed-menu menu-open");
	}else{
		linksHolder.removeClass("flipped");
		linksHolder.css("right","0px")
		//linksHolder.fadeOut(function(){stripe.removeClass("boxed-menu menu-open");});
		//if (settings.attr("data-menu_overlay") == "absolute" && !stripe.is(".being-scrolled")){
		//	stripe.addClass("force-transparency");
		//}
		
		
	}
	
};


menu_layout.disableScroll = function(){
	var x=window.scrollX;
    var y=window.scrollY;
    window.onscroll=function(){window.scrollTo(x, y);};
};

menu_layout.enableScroll = function(){
	window.onscroll=function(){};
};

menu_layout.unmenufyLinks = function(container,linksHolder){
	var holder = container.closest(".master.item-box");
	if (holder.hasClass("menufied")){//container.next(".preview-item-links").length > 0){
		
		
		linksHolder.removeAttr("data-shrink-style");
		var menuLinksHolder = linksHolder.find(".menu-links-holder");
		//linksHolder.find("span").css({"display":"","margin-right":"","margin-left":""});
		linksHolder.css({"max-width":"","background-color":"","margin":""});
		holder.removeClass("menufied");
		//linksHolder.find(".links-menu-btn").removeClass("shown");
		container.find(".links-menu-btn").removeClass("shown");
		var allLinks = menuLinksHolder.children();
		allLinks.removeClass("flipped");
		container.find(".item-content").removeClass("flipped");
		linksHolder.append(allLinks);
		container.find(".right-div").prepend(linksHolder);
		var stripe = container.closest(".master.item-box");
		stripe.removeClass("animated");
		linksHolder.show();
		linksHolder.removeClass("flipped");
		//holder.find('.right-div').css("height","");
		holder.find('.right-div').css("height",holder.find('.preview-icon-holder').height());
		linksHolder.removeClass("allow-bg-color");
		if (holder.hasClass("menu-open")){
			holder.find(".hamburger").click();
			setTimeout(function(){
				holder.find(".preview-item-links").css("display","");
			},1500);
		}
		holder.find(".preview-item-links").css("display","");
	}

};


menu_layout.calculateSubmenuBG = function(container,submenu){
	var menuBackground = container.find(".item-content").css("background-color");
	if (menuBackground.indexOf("rgba(") != -1 && menuBackground.indexOf(", 0)") != -1){
		menuBackground = container.closest(".master.item-box").css("background-color");
	}
	submenu.css("background-color",menuBackground);
};; var footer_layout = {};

footer_layout.init = function(container,items){
	items.each(function(){
		var currentItem = $(this);
		var links = currentItem.find(".preview-item-links").children();
		links.css("clear","");
		links.each(function(idx){
			if (idx % 2 == 0 && idx!=0){
				$(this).css("clear","left");
			}
		});
	});
	
};

footer_layout.applyLayout = function(container,items){
	items.each(function(){
		var currentItem = $(this);
		var stripe = container.closest(".master.item-box");
		var rightDivWidth = currentItem.find(".preview-social-wrapper").width();
		var leftDivWidth = currentItem.find(".helper-div").width();
		var centerDivWidth = currentItem.find(".preview-item-links").innerWidth();
		var stripeWidth = stripe.width();
		if (rightDivWidth + leftDivWidth + centerDivWidth > stripeWidth){
			footer_layout.flipVertically(currentItem);
		}else{
			footer_layout.unflip(currentItem);
		}
	});
};

footer_layout.flipVertically = function(item){	
	if (typeof item.attr("data-flipped") == "undefined"){
		item.attr("data-flipped","true");
		var rightDiv = item.find(".right-div");
		var leftDiv = item.find(".left-div");
		var centerDiv = item.find(".center-div");
		rightDiv.addClass("flipped");
		leftDiv.addClass("flipped");
		centerDiv.addClass("flipped");
	}
};

footer_layout.unflip = function(item){
	if (typeof item.attr("data-flipped") != "undefined"){
		item.removeAttr("data-flipped","true");
		var rightDiv = item.find(".right-div");
		var leftDiv = item.find(".left-div");
		var centerDiv = item.find(".center-div");
		rightDiv.removeClass("flipped");
		leftDiv.removeClass("flipped");
		centerDiv.removeClass("flipped");
	}
};; var multi_layout = {};

multi_layout.init = function(container,items){
	items = items.not(".stripe-header").not(".stripe-footer");
	items.each(function(){
		var helperDiv = $(this).find(".helper-div");
		var picSide = $(this).find(".pic-side");
		var textSide = $(this).find(".text-side");
		if (helperDiv.is(".top-center")){
			picSide.before(textSide);
		}else{
			picSide.after(textSide);
		}
	});
};

multi_layout.applyLayout = function(container,items,paramsFromRealTime){
	items = items.not(".stripe-header").not(".stripe-footer");
	var helperDiv = items.find(".helper-div");
	var picSide = items.find(".pic-side");
	var textSide = items.find(".text-side");
	
	items.find(".image-cover , .item-preview").css("min-height","inherit");
	
	//Handle Ratio
	if (container.find(".arranger-settings").length > 0){
		var arrangerSettings = container.find(".arranger-settings");
		if (arrangerSettings.attr("data-arranger_type") == "matrix"){
			var isMazonite = arrangerSettings.attr("data-arranger_order_type") == "mazonite";
			var ratioFromArranger = parseFloat(arrangerSettings.attr("data-arranger_item_ratio")).toFixed(1);
			items.each(function(){
				var currentItem = $(this);
				var innerPic = currentItem.find(".inner-pic");
				if (isMazonite){
					var origHeight = innerPic.attr("data-orig-height");
					var origWidth = innerPic.attr("data-orig-width");
					if (origHeight && origWidth){
						ratioFromArranger = parseInt(origHeight) / parseInt(origWidth)
					}else{
						if (innerPic.attr("id") != "no-image"){
							container.closest(".master.item-box").addClass("rearrange");
						}
						ratioFromArranger = 0;
					}
					
				}
				var newPicHeight = currentItem.find(".pic-side").width() * ratioFromArranger;
				if (currentItem.find(".video-frame").length > 0 && isMazonite){
					//found video
					newPicHeight = currentItem.find(".pic-side").width() * (9/16);
				}
				if (helperDiv.is(".top-center") || helperDiv.is(".bottom-center")){
					innerPic.css({"height":newPicHeight});	
					currentItem.find(".helper-div").css({"min-height":""});
				}else{
					currentItem.find(".helper-div").css({"min-height":newPicHeight});	
					innerPic.css({"height":""});	
				}
			});
			
		}else{
			items.find(".item-details").css("height","")
			if (helperDiv.is(".top-center") || helperDiv.is(".bottom-center")){
				items.each(function(){
					var currentItem = $(this)
					var textHeight = currentItem.find(".item-details").outerHeight(true);
					var newHeight = currentItem.height() - textHeight
					currentItem.find(".inner-pic").css("height",newHeight);
				});
			}else{
				picSide.find(".inner-pic").css({"height":""});	
			}
		}
	}else{
		items.find(".item-details").css("height","")
		if (helperDiv.is(".top-center") || helperDiv.is(".bottom-center")){
			items.each(function(){
				var currentItem = $(this)
				var textHeight = currentItem.find(".item-details").outerHeight(true);
				var newHeight = currentItem.height() - textHeight
				currentItem.find(".inner-pic").not(".circlize").css("height",newHeight);
				if (currentItem.find(".inner-pic").is(".circlize")){
					currentItem.find(".pic-side").not(".circlize").css("height",newHeight);
				}
			});
		}else{
			picSide.find(".inner-pic").css({"height":""});	
		}
	}
		
	
	
	
	if (container.width() < 500){
		if (!helperDiv.is(".middle-center") &&  !helperDiv.is(".top-center") && !helperDiv.is(".bottom-center")){
			items.each(function(){
				multi_layout.flipVertically($(this));
			});
		}
	}else{
		if (helperDiv.attr("data-orig-class")){
		items.each(function(){
			multi_layout.unflip($(this));
		});
		picSide.css("top","")
		textSide.find(".vertical-aligner").css("min-height","")	
		}
	}
	
	if (paramsFromRealTime && "force_redraw" in paramsFromRealTime){
		multi_layout.forceRedraw($(".item-wrapper"));
	}

	if (helperDiv.is(".middle-center")){
			items.each(function(){
				var currentItemDetails = $(this).find(".item-details");
				var draggableImages = $(this).find(".draggable-div-holder");
				if (currentItemDetails.css("text-align") == "center" || currentItemDetails.css("text-align") == "right"){
					var divisor = 2;
					if ( currentItemDetails.css("text-align") == "right"){
						divisor = 1;
					}
					var textSideMaxWidth = $(this).find(".text-side").css("max-width");
					if (textSideMaxWidth != "none"){
						textSideMaxWidth = parseInt(textSideMaxWidth);
						if (draggableImages.width() < textSideMaxWidth ){
							var newMarginLeft = (textSideMaxWidth - draggableImages.width())/divisor * -1;
							draggableImages.css("margin-left",newMarginLeft);
						}else{
							draggableImages.css("margin-left",0);
						}
					}
				}
				
				if ( currentItemDetails.css("vertical-align") == "top"){
					draggableImages.css("margin-top",0);
				}
				
				if ( currentItemDetails.css("vertical-align") == "middle" || currentItemDetails.css("vertical-align") == "bottom"){
					if (currentItemDetails.css("vertical-align") == "bottom"){
						if (!draggableImages.is(".bottomized")){
							draggableImages.addClass("bottomized");
							draggableImages.css({"top":"auto","bottom":0});
							draggableImages.css("margin-top",0);
						}
					}else{
						if (draggableImages.is(".bottomized")){
							draggableImages.css({"bottom":"","top":""});
							draggableImages.removeClass("bottomized");
						}
						var itemDetailsHeight = parseInt(currentItemDetails.innerHeight());
						var stripeHeight = parseInt($(this).closest(".master.item-box").height());
						if (itemDetailsHeight <= stripeHeight ){
							var newMarginTop = (stripeHeight - draggableImages.height())/2;
							draggableImages.css("margin-top",newMarginTop);
						}else{
							draggableImages.css("margin-top",0);
						}
					}
				}
				
			});
	}

};


multi_layout.forceRedraw = function(elements){
	if(typeof window["EditorHelper"] == "undefined"){
		//setting body height to prevent jitter 
		$("body").css("height",$("body").height())
		elements.each(function(){
			var element = $(this)[0];
			var disp = element.style.display;
			element.style.display = 'none';
			var trick = element.offsetHeight;
			element.style.display = disp;
		});
		$("body").css("height","")
	}
};




multi_layout.flipVertically = function(itemToFlip){
	var helperDiv = itemToFlip.find(".helper-div");
	var currentClass = helperDiv.attr("class").replace("helper-div", "").replace(" ","");
	if (currentClass=="top-left" || currentClass=="middle-left" || currentClass=="middle-left-25" || currentClass=="bottom-left"){
		helperDiv.removeClass("top-left top-center top-right middle-left middle-left-25 middle-center middle-right middle-right-25 bottom-left bottom-center bottom-right");
		helperDiv.addClass("top-center");
		helperDiv.attr("data-orig-class",currentClass);
		helperDiv.addClass("flipped-image")
	}
	if (currentClass=="top-right" || currentClass=="middle-right" || currentClass=="middle-right-25" || currentClass=="bottom-right"){
		helperDiv.removeClass("top-left top-center top-right middle-left middle-left-25 middle-center middle-right middle-right-25 bottom-left bottom-center bottom-right");
		helperDiv.addClass("bottom-center");
		helperDiv.attr("data-orig-class",currentClass);
		helperDiv.addClass("flipped-image")
	}
	itemToFlip.css("display", "inline-flex");
	setTimeout(function(){itemToFlip.css("display","");},0)
};

multi_layout.unflip = function(itemToUnFlip){
	var helperDiv = itemToUnFlip.find(".helper-div");
	itemToUnFlip.find(".inner-pic").css({"height":""});
	if (helperDiv.attr("data-orig-class")){
		helperDiv.removeClass("top-left top-center top-right middle-left middle-left-25 middle-center middle-right middle-right-25 bottom-left bottom-center bottom-right");
		helperDiv.addClass(helperDiv.attr("data-orig-class"));
		helperDiv.removeAttr("data-orig-class")
		helperDiv.removeClass("flipped-image")
	}
	itemToUnFlip.css("display", "inline-flex");
	setTimeout(function(){itemToUnFlip.css("display","");},0)
};

var item_layout = {
	init:function(){

	},
	applyLayout:function(){

	}
};; var blocks_layout = {};

blocks_layout.init = function(container,items){

};

blocks_layout.applyLayout = function(container,items,paramsFromRealTime){
	var helperDiv = container.find(".item-box:not(.stripe-header) .helper-div");
	var containerHeight = container.height();
	var helperDivHeight = helperDiv.height();
	var center = (containerHeight/2) - (helperDivHeight/2);
	center = Math.max(0,center);
	helperDiv.css("top",center)
};;
/*! jQuery v2.2.5-pre | (c) jQuery Foundation | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=a.document,e=c.slice,f=c.concat,g=c.push,h=c.indexOf,i={},j=i.toString,k=i.hasOwnProperty,l={},m="2.2.5-pre b14ce54334a568eaaa107be4c441660a57c3db24",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return e.call(this)},get:function(a){return null!=a?a<0?this[a+this.length]:this[a]:e.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a){return n.each(this,a)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(e.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(a<0?b:0);return this.pushStack(c>=0&&c<b?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:g,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);h<i;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=a&&a.toString();return!n.isArray(a)&&b-parseFloat(b)+1>=0},isPlainObject:function(a){var b;if("object"!==n.type(a)||a.nodeType||n.isWindow(a))return!1;if(a.constructor&&!k.call(a,"constructor")&&!k.call(a.constructor.prototype||{},"isPrototypeOf"))return!1;for(b in a);return void 0===b||k.call(a,b)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?i[j.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=d.createElement("script"),b.text=a,d.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b){var c,d=0;if(s(a)){for(c=a.length;d<c;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):g.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:h.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;d<c;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;f<g;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,g=0,h=[];if(s(a))for(d=a.length;g<d;g++)e=b(a[g],g,c),null!=e&&h.push(e);else for(g in a)e=b(a[g],g,c),null!=e&&h.push(e);return f.apply([],h)},guid:1,proxy:function(a,b){var c,d,f;if("string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a))return d=e.call(arguments,2),f=function(){return a.apply(b||this,d.concat(e.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f},now:Date.now,support:l}),"function"==typeof Symbol&&(n.fn[Symbol.iterator]=c[Symbol.iterator]),n.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){i["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=!!a&&"length"in a&&a.length,c=n.type(a);return"function"!==c&&!n.isWindow(a)&&("array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a)}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ga(),z=ga(),A=ga(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+L+"*\\]",O=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+N+")*)|.*)\\)|)",P=new RegExp(L+"+","g"),Q=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),R=new RegExp("^"+L+"*,"+L+"*"),S=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),T=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),U=new RegExp(O),V=new RegExp("^"+M+"$"),W={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},X=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,$=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,_=/[+~]/,aa=/'|\\/g,ba=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),ca=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:d<0?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},da=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(ea){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fa(a,b,d,e){var f,h,j,k,l,o,r,s,w=b&&b.ownerDocument,x=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==x&&9!==x&&11!==x)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==x&&(o=$.exec(a)))if(f=o[1]){if(9===x){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(w&&(j=w.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(o[2])return H.apply(d,b.getElementsByTagName(a)),d;if((f=o[3])&&c.getElementsByClassName&&b.getElementsByClassName)return H.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==x)w=b,s=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(aa,"\\$&"):b.setAttribute("id",k=u),r=g(a),h=r.length,l=V.test(k)?"#"+k:"[id='"+k+"']";while(h--)r[h]=l+" "+qa(r[h]);s=r.join(","),w=_.test(a)&&oa(b.parentNode)||b}if(s)try{return H.apply(d,w.querySelectorAll(s)),d}catch(y){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(Q,"$1"),b,d,e)}function ga(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ha(a){return a[u]=!0,a}function ia(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ja(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function ka(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function la(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function na(a){return ha(function(b){return b=+b,ha(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function oa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=fa.support={},f=fa.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return!!b&&"HTML"!==b.nodeName},m=fa.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ia(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ia(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Z.test(n.getElementsByClassName),c.getById=ia(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){if("undefined"!=typeof b.getElementsByClassName&&p)return b.getElementsByClassName(a)},r=[],q=[],(c.qsa=Z.test(n.querySelectorAll))&&(ia(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ia(function(a){var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Z.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ia(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",O)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Z.test(o.compareDocumentPosition),t=b||Z.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return ka(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?ka(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},fa.matches=function(a,b){return fa(a,null,null,b)},fa.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(T,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fa(b,n,null,[a]).length>0},fa.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fa.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fa.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fa.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fa.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fa.selectors={cacheLength:50,createPseudo:ha,match:W,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ba,ca),a[3]=(a[3]||a[4]||a[5]||"").replace(ba,ca),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fa.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fa.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return W.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&U.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ba,ca).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fa.attr(d,a);return null==e?"!="===b:!b||(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(P," ")+" ").indexOf(c)>-1:"|="===b&&(e===c||e.slice(0,c.length+1)===c+"-"))}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fa.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ha(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ha(function(a){var b=[],c=[],d=h(a.replace(Q,"$1"));return d[u]?ha(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ha(function(a){return function(b){return fa(a,b).length>0}}),contains:ha(function(a){return a=a.replace(ba,ca),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ha(function(a){return V.test(a||"")||fa.error("unsupported lang: "+a),a=a.replace(ba,ca).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Y.test(a.nodeName)},input:function(a){return X.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:na(function(){return[0]}),last:na(function(a,b){return[b-1]}),eq:na(function(a,b,c){return[c<0?c+b:c]}),even:na(function(a,b){for(var c=0;c<b;c+=2)a.push(c);return a}),odd:na(function(a,b){for(var c=1;c<b;c+=2)a.push(c);return a}),lt:na(function(a,b,c){for(var d=c<0?c+b:c;--d>=0;)a.push(d);return a}),gt:na(function(a,b,c){for(var d=c<0?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=la(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=ma(b);function pa(){}pa.prototype=d.filters=d.pseudos,d.setFilters=new pa,g=fa.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=R.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=S.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(Q," ")}),h=h.slice(c.length));for(g in d.filter)!(e=W[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fa.error(a):z(a,i).slice(0)};function qa(a){for(var b=0,c=a.length,d="";b<c;b++)d+=a[b].value;return d}function ra(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j,k=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(j=b[u]||(b[u]={}),i=j[b.uniqueID]||(j[b.uniqueID]={}),(h=i[d])&&h[0]===w&&h[1]===f)return k[2]=h[2];if(i[d]=k,k[2]=a(b,c,g))return!0}}}function sa(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ta(a,b,c){for(var d=0,e=b.length;d<e;d++)fa(a,b[d],c);return c}function ua(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;h<i;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function va(a,b,c,d,e,f){return d&&!d[u]&&(d=va(d)),e&&!e[u]&&(e=va(e,f)),ha(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ta(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ua(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ua(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ua(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function wa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ra(function(a){return a===b},h,!0),l=ra(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];i<f;i++)if(c=d.relative[a[i].type])m=[ra(sa(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;e<f;e++)if(d.relative[a[e].type])break;return va(i>1&&sa(m),i>1&&qa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(Q,"$1"),c,i<e&&wa(a.slice(i,e)),e<f&&wa(a=a.slice(e)),e<f&&qa(a))}m.push(c)}return sa(m)}function xa(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=F.call(i));u=ua(u)}H.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&fa.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ha(f):f}return h=fa.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xa(e,d)),f.selector=a}return f},i=fa.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ba,ca),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=W.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ba,ca),_.test(j[0].type)&&oa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qa(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,!b||_.test(a)&&oa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ia(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ia(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ja("type|href|height|width",function(a,b,c){if(!c)return a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ia(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ja("value",function(a,b,c){if(!c&&"input"===a.nodeName.toLowerCase())return a.defaultValue}),ia(function(a){return null==a.getAttribute("disabled")})||ja(K,function(a,b,c){var d;if(!c)return a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fa}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.uniqueSort=n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},v=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},w=n.expr.match.needsContext,x=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,y=/^.[^:#\[\.,]*$/;function z(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(y.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return h.call(b,a)>-1!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;b<c;b++)if(n.contains(e[b],this))return!0}));for(b=0;b<c;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(z(this,a||[],!1))},not:function(a){return this.pushStack(z(this,a||[],!0))},is:function(a){return!!z(this,"string"==typeof a&&w.test(a)?n(a):a||[],!1).length}});var A,B=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=n.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||A,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:B.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),x.test(e[1])&&n.isPlainObject(b))for(e in b)n.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&f.parentNode&&(this.length=1,this[0]=f),this.context=d,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?void 0!==c.ready?c.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};C.prototype=n.fn,A=n(d);var D=/^(?:parents|prev(?:Until|All))/,E={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;a<c;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=w.test(a)||"string"!=typeof a?n(a,b||this.context):0;d<e;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?h.call(n(a),this[0]):h.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function F(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return u(a,"parentNode")},parentsUntil:function(a,b,c){return u(a,"parentNode",c)},next:function(a){return F(a,"nextSibling")},prev:function(a){return F(a,"previousSibling")},nextAll:function(a){return u(a,"nextSibling")},prevAll:function(a){return u(a,"previousSibling")},nextUntil:function(a,b,c){return u(a,"nextSibling",c)},prevUntil:function(a,b,c){return u(a,"previousSibling",c)},siblings:function(a){return v((a.parentNode||{}).firstChild,a)},children:function(a){return v(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(E[a]||n.uniqueSort(e),D.test(a)&&e.reverse()),this.pushStack(e)}});var G=/\S+/g;function H(a){var b={};return n.each(a.match(G)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?H(a):n.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){n.each(b,function(b,c){n.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==n.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return n.each(arguments,function(a,b){var c;while((c=n.inArray(b,f,c))>-1)f.splice(c,1),c<=h&&h--}),this},has:function(a){return a?n.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().progress(c.notify).done(c.resolve).fail(c.reject):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=e.call(arguments),d=c.length,f=1!==d||a&&n.isFunction(a.promise)?d:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?e.call(arguments):d,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(d>1)for(i=new Array(d),j=new Array(d),k=new Array(d);b<d;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().progress(h(b,j,i)).done(h(b,k,c)).fail(g.reject):--f;return f||g.resolveWith(k,c),g.promise()}});var I;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(I.resolveWith(d,[n]),n.fn.triggerHandler&&(n(d).triggerHandler("ready"),n(d).off("ready"))))}});function J(){d.removeEventListener("DOMContentLoaded",J),a.removeEventListener("load",J),n.ready()}n.ready.promise=function(b){return I||(I=n.Deferred(),"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(n.ready):(d.addEventListener("DOMContentLoaded",J),a.addEventListener("load",J))),I.promise(b)},n.ready.promise();var K=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)K(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;h<i;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},L=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function M(){this.expando=n.expando+M.uid++}M.uid=1,M.prototype={register:function(a,b){var c=b||{};return a.nodeType?a[this.expando]=c:Object.defineProperty(a,this.expando,{value:c,writable:!0,configurable:!0}),a[this.expando]},cache:function(a){if(!L(a))return{};var b=a[this.expando];return b||(b={},L(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[b]=c;else for(d in b)e[d]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=a[this.expando];if(void 0!==f){if(void 0===b)this.register(a);else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in f?d=[b,e]:(d=e,d=d in f?[d]:d.match(G)||[])),c=d.length;while(c--)delete f[d[c]]}(void 0===b||n.isEmptyObject(f))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!n.isEmptyObject(b)}};var N=new M,O=new M,P=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Q=/[A-Z]/g;function R(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Q,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){
    try{c="true"===c||"false"!==c&&("null"===c?null:+c+""===c?+c:P.test(c)?n.parseJSON(c):c)}catch(e){}O.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return O.hasData(a)||N.hasData(a)},data:function(a,b,c){return O.access(a,b,c)},removeData:function(a,b){O.remove(a,b)},_data:function(a,b,c){return N.access(a,b,c)},_removeData:function(a,b){N.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=O.get(f),1===f.nodeType&&!N.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),R(f,d,e[d])));N.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){O.set(this,a)}):K(this,function(b){var c,d;if(f&&void 0===b){if(c=O.get(f,a)||O.get(f,a.replace(Q,"-$&").toLowerCase()),void 0!==c)return c;if(d=n.camelCase(a),c=O.get(f,d),void 0!==c)return c;if(c=R(f,d,void 0),void 0!==c)return c}else d=n.camelCase(a),this.each(function(){var c=O.get(this,d);O.set(this,d,b),a.indexOf("-")>-1&&void 0!==c&&O.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){O.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;if(a)return b=(b||"fx")+"queue",d=N.get(a,b),c&&(!d||n.isArray(c)?d=N.access(a,b,n.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return N.get(a,c)||N.access(a,c,{empty:n.Callbacks("once memory").add(function(){N.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=N.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),U=["Top","Right","Bottom","Left"],V=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)};function W(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return n.css(a,b,"")},i=h(),j=c&&c[3]||(n.cssNumber[b]?"":"px"),k=(n.cssNumber[b]||"px"!==j&&+i)&&T.exec(n.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,n.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var X=/^(?:checkbox|radio)$/i,Y=/<([\w:-]+)/,Z=/^$|\/(?:java|ecma)script/i,$={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};$.optgroup=$.option,$.tbody=$.tfoot=$.colgroup=$.caption=$.thead,$.th=$.td;function _(a,b){var c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function aa(a,b){for(var c=0,d=a.length;c<d;c++)N.set(a[c],"globalEval",!b||N.get(b[c],"globalEval"))}var ba=/<|&#?\w+;/;function ca(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],o=0,p=a.length;o<p;o++)if(f=a[o],f||0===f)if("object"===n.type(f))n.merge(m,f.nodeType?[f]:f);else if(ba.test(f)){g=g||l.appendChild(b.createElement("div")),h=(Y.exec(f)||["",""])[1].toLowerCase(),i=$[h]||$._default,g.innerHTML=i[1]+n.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;n.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",o=0;while(f=m[o++])if(d&&n.inArray(f,d)>-1)e&&e.push(f);else if(j=n.contains(f.ownerDocument,f),g=_(l.appendChild(f),"script"),j&&aa(g),c){k=0;while(f=g[k++])Z.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),l.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",l.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var da=/^key/,ea=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,fa=/^([^.]*)(?:\.(.+)|)/;function ga(){return!0}function ha(){return!1}function ia(){try{return d.activeElement}catch(a){}}function ja(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)ja(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=ha;else if(!e)return a;return 1===f&&(g=e,e=function(a){return n().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=n.guid++)),a.each(function(){n.event.add(this,b,e,d,c)})}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return"undefined"!=typeof n&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(G)||[""],j=b.length;while(j--)h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.hasData(a)&&N.get(a);if(r&&(i=r.events)){b=(b||"").match(G)||[""],j=b.length;while(j--)if(h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&N.remove(a,"handle events")}},dispatch:function(a){a=n.event.fix(a);var b,c,d,f,g,h=[],i=e.call(arguments),j=(N.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())a.rnamespace&&!a.rnamespace.test(g.namespace)||(a.handleObj=g,a.data=g.data,d=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==d&&(a.result=d)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&("click"!==a.type||isNaN(a.button)||a.button<1))for(;i!==this;i=i.parentNode||this)if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(d=[],c=0;c<h;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>-1:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,e,f,g=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||d,e=c.documentElement,f=c.body,a.pageX=b.clientX+(e&&e.scrollLeft||f&&f.scrollLeft||0)-(e&&e.clientLeft||f&&f.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||f&&f.scrollTop||0)-(e&&e.clientTop||f&&f.clientTop||0)),a.which||void 0===g||(a.which=1&g?1:2&g?3:4&g?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,e,f=a.type,g=a,h=this.fixHooks[f];h||(this.fixHooks[f]=h=ea.test(f)?this.mouseHooks:da.test(f)?this.keyHooks:{}),e=h.props?this.props.concat(h.props):this.props,a=new n.Event(g),b=e.length;while(b--)c=e[b],a[c]=g[c];return a.target||(a.target=d),3===a.target.nodeType&&(a.target=a.target.parentNode),h.filter?h.filter(a,g):a},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==ia()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===ia()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if("checkbox"===this.type&&this.click&&n.nodeName(this,"input"))return this.click(),!1},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ga:ha):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={constructor:n.Event,isDefaultPrevented:ha,isPropagationStopped:ha,isImmediatePropagationStopped:ha,isSimulated:!1,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ga,a&&!this.isSimulated&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ga,a&&!this.isSimulated&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ga,a&&!this.isSimulated&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||n.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),n.fn.extend({on:function(a,b,c,d){return ja(this,a,b,c,d)},one:function(a,b,c,d){return ja(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=ha),this.each(function(){n.event.remove(this,a,c,b)})}});var ka=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,la=/<script|<style|<link/i,ma=/checked\s*(?:[^=]|=\s*.checked.)/i,na=/^true\/(.*)/,oa=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function pa(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function qa(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function ra(a){var b=na.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function sa(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(N.hasData(a)&&(f=N.access(a),g=N.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;c<d;c++)n.event.add(b,e,j[e][c])}O.hasData(a)&&(h=O.access(a),i=n.extend({},h),O.set(b,i))}}function ta(a,b){var c=b.nodeName.toLowerCase();"input"===c&&X.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function ua(a,b,c,d){b=f.apply([],b);var e,g,h,i,j,k,m=0,o=a.length,p=o-1,q=b[0],r=n.isFunction(q);if(r||o>1&&"string"==typeof q&&!l.checkClone&&ma.test(q))return a.each(function(e){var f=a.eq(e);r&&(b[0]=q.call(this,e,f.html())),ua(f,b,c,d)});if(o&&(e=ca(b,a[0].ownerDocument,!1,a,d),g=e.firstChild,1===e.childNodes.length&&(e=g),g||d)){for(h=n.map(_(e,"script"),qa),i=h.length;m<o;m++)j=e,m!==p&&(j=n.clone(j,!0,!0),i&&n.merge(h,_(j,"script"))),c.call(a[m],j,m);if(i)for(k=h[h.length-1].ownerDocument,n.map(h,ra),m=0;m<i;m++)j=h[m],Z.test(j.type||"")&&!N.access(j,"globalEval")&&n.contains(k,j)&&(j.src?n._evalUrl&&n._evalUrl(j.src):n.globalEval(j.textContent.replace(oa,"")))}return a}function va(a,b,c){for(var d,e=b?n.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||n.cleanData(_(d)),d.parentNode&&(c&&n.contains(d.ownerDocument,d)&&aa(_(d,"script")),d.parentNode.removeChild(d));return a}n.extend({htmlPrefilter:function(a){return a.replace(ka,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(l.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=_(h),f=_(a),d=0,e=f.length;d<e;d++)ta(f[d],g[d]);if(b)if(c)for(f=f||_(a),g=g||_(h),d=0,e=f.length;d<e;d++)sa(f[d],g[d]);else sa(a,h);return g=_(h,"script"),g.length>0&&aa(g,!i&&_(a,"script")),h},cleanData:function(a){for(var b,c,d,e=n.event.special,f=0;void 0!==(c=a[f]);f++)if(L(c)){if(b=c[N.expando]){if(b.events)for(d in b.events)e[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);c[N.expando]=void 0}c[O.expando]&&(c[O.expando]=void 0)}}}),n.fn.extend({domManip:ua,detach:function(a){return va(this,a,!0)},remove:function(a){return va(this,a)},text:function(a){return K(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.appendChild(a)}})},prepend:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(_(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null!=a&&a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return K(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!la.test(a)&&!$[(Y.exec(a)||["",""])[1].toLowerCase()]){a=n.htmlPrefilter(a);try{for(;c<d;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(_(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return ua(this,arguments,function(b){var c=this.parentNode;n.inArray(this,a)<0&&(n.cleanData(_(this)),c&&c.replaceChild(b,this))},a)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),f=e.length-1,h=0;h<=f;h++)c=h===f?this:this.clone(!0),n(e[h])[b](c),g.apply(d,c.get());return this.pushStack(d)}});var wa,xa={HTML:"block",BODY:"block"};function ya(a,b){var c=n(b.createElement(a)).appendTo(b.body),d=n.css(c[0],"display");return c.detach(),d}function za(a){var b=d,c=xa[a];return c||(c=ya(a,b),"none"!==c&&c||(wa=(wa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=wa[0].contentDocument,b.write(),b.close(),c=ya(a,b),wa.detach()),xa[a]=c),c}var Aa=/^margin/,Ba=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ca=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)},Da=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e},Ea=d.documentElement;!function(){var b,c,e,f,g=d.createElement("div"),h=d.createElement("div");function i(){h.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",h.innerHTML="",Ea.appendChild(g);var d=a.getComputedStyle(h);b="1%"!==d.top,f="2px"===d.marginLeft,c="4px"===d.width,h.style.marginRight="50%",e="4px"===d.marginRight,Ea.removeChild(g)}h.style&&(h.style.backgroundClip="content-box",h.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle="content-box"===h.style.backgroundClip,g.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",g.appendChild(h),n.extend(l,{pixelPosition:function(){return i(),b},boxSizingReliable:function(){return null==c&&i(),c},pixelMarginRight:function(){return null==c&&i(),e},reliableMarginLeft:function(){return null==c&&i(),f},reliableMarginRight:function(){var b,c=h.appendChild(d.createElement("div"));return c.style.cssText=h.style.cssText="-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",h.style.width="1px",Ea.appendChild(g),b=!parseFloat(a.getComputedStyle(c).marginRight),Ea.removeChild(g),h.removeChild(c),b}}))}();function Fa(a,b,c){var d,e,f,g,h=a.style;return c=c||Ca(a),g=c?c.getPropertyValue(b)||c[b]:void 0,""!==g&&void 0!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),c&&!l.pixelMarginRight()&&Ba.test(g)&&Aa.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f),void 0!==g?g+"":g}function Ga(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Ha=/^(none|table(?!-c[ea]).+)/,Ia={position:"absolute",visibility:"hidden",display:"block"},Ja={letterSpacing:"0",fontWeight:"400"},Ka=["Webkit","O","Moz","ms"],La=d.createElement("div").style;function Ma(a){if(a in La)return a;var b=a[0].toUpperCase()+a.slice(1),c=Ka.length;while(c--)if(a=Ka[c]+b,a in La)return a}function Na(a,b,c){var d=T.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Oa(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;f<4;f+=2)"margin"===c&&(g+=n.css(a,c+U[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+U[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+U[f]+"Width",!0,e))):(g+=n.css(a,"padding"+U[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+U[f]+"Width",!0,e)));return g}function Pa(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=Ca(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(e<=0||null==e){if(e=Fa(a,b,f),(e<0||null==e)&&(e=a.style[b]),Ba.test(e))return e;d=g&&(l.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Oa(a,b,c||(g?"border":"content"),d,f)+"px"}function Qa(a,b){for(var c,d,e,f=[],g=0,h=a.length;g<h;g++)d=a[g],d.style&&(f[g]=N.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&V(d)&&(f[g]=N.access(d,"olddisplay",za(d.nodeName)))):(e=V(d),"none"===c&&e||N.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;g<h;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Fa(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=T.exec(c))&&e[1]&&(c=W(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(n.cssNumber[h]?"":"px")),l.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Fa(a,b,d)),"normal"===e&&b in Ja&&(e=Ja[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){if(c)return Ha.test(n.css(a,"display"))&&0===a.offsetWidth?Da(a,Ia,function(){return Pa(a,b,d)}):Pa(a,b,d)},set:function(a,c,d){var e,f=d&&Ca(a),g=d&&Oa(a,b,d,"border-box"===n.css(a,"boxSizing",!1,f),f);return g&&(e=T.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=n.css(a,b)),Na(a,c,g)}}}),n.cssHooks.marginLeft=Ga(l.reliableMarginLeft,function(a,b){if(b)return(parseFloat(Fa(a,"marginLeft"))||a.getBoundingClientRect().left-Da(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px"}),n.cssHooks.marginRight=Ga(l.reliableMarginRight,function(a,b){if(b)return Da(a,{display:"inline-block"},Fa,[a,"marginRight"])}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];d<4;d++)e[a+U[d]+b]=f[d]||f[d-2]||f[0];return e}},Aa.test(a)||(n.cssHooks[a+b].set=Na)}),n.fn.extend({css:function(a,b){return K(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=Ca(a),e=b.length;g<e;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Qa(this,!0)},hide:function(){return Qa(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){V(this)?n(this).show():n(this).hide()})}});function Ra(a,b,c,d,e){return new Ra.prototype.init(a,b,c,d,e)}n.Tween=Ra,Ra.prototype={constructor:Ra,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||n.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ra.propHooks[this.prop];return a&&a.get?a.get(this):Ra.propHooks._default.get(this)},run:function(a){var b,c=Ra.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ra.propHooks._default.set(this),this}},Ra.prototype.init.prototype=Ra.prototype,Ra.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[n.cssProps[a.prop]]&&!n.cssHooks[a.prop]?a.elem[a.prop]=a.now:n.style(a.elem,a.prop,a.now+a.unit)}}},Ra.propHooks.scrollTop=Ra.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},n.fx=Ra.prototype.init,n.fx.step={};var Sa,Ta,Ua=/^(?:toggle|show|hide)$/,Va=/queueHooks$/;function Wa(){return a.setTimeout(function(){Sa=void 0}),Sa=n.now()}function Xa(a,b){var c,d=0,e={height:a};for(b=b?1:0;d<4;d+=2-b)c=U[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ya(a,b,c){for(var d,e=(_a.tweeners[b]||[]).concat(_a.tweeners["*"]),f=0,g=e.length;f<g;f++)if(d=e[f].call(c,b,a))return d}function Za(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&V(a),q=N.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?N.get(a,"olddisplay")||za(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Ua.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?za(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=N.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;N.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ya(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function $a(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function _a(a,b,c){var d,e,f=0,g=_a.prefilters.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Sa||Wa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;g<i;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),f<1&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},c),originalProperties:b,originalOptions:c,startTime:Sa||Wa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;c<d;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for($a(k,j.opts.specialEasing);f<g;f++)if(d=_a.prefilters[f].call(j,a,k,j.opts))return n.isFunction(d.stop)&&(n._queueHooks(j.elem,j.opts.queue).stop=n.proxy(d.stop,d)),d;return n.map(k,Ya,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(_a,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return W(c.elem,a,T.exec(b),c),c}]},tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.match(G);for(var c,d=0,e=a.length;d<e;d++)c=a[d],_a.tweeners[c]=_a.tweeners[c]||[],_a.tweeners[c].unshift(b)},prefilters:[Za],prefilter:function(a,b){b?_a.prefilters.unshift(a):_a.prefilters.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(V).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=_a(this,n.extend({},a),f);(e||N.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=N.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Va.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=N.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;b<g;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Xa(b,!0),a,d,e)}}),n.each({slideDown:Xa("show"),slideUp:Xa("hide"),slideToggle:Xa("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Sa=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Sa=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ta||(Ta=a.setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){a.clearInterval(Ta),Ta=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(b,c){return b=n.fx?n.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",l.checkOn=""!==a.value,l.optSelected=c.selected,b.disabled=!0,l.optDisabled=!c.disabled,a=d.createElement("input"),a.value="t",a.type="radio",l.radioValue="t"===a.value}();var ab,bb=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return K(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),e=n.attrHooks[b]||(n.expr.match.bool.test(b)?ab:void 0)),void 0!==c?null===c?void n.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=n.find.attr(a,b),null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!l.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(G);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)}}),ab={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=bb[b]||n.find.attr;bb[b]=function(a,b,d){var e,f;return d||(f=bb[b],bb[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,bb[b]=f),e}});var cb=/^(?:input|select|textarea|button)$/i,db=/^(?:a|area)$/i;n.fn.extend({prop:function(a,b){return K(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&n.isXMLDoc(a)||(b=n.propFix[b]||b,
        e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=n.find.attr(a,"tabindex");return b?parseInt(b,10):cb.test(a.nodeName)||db.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),l.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var eb=/[\t\r\n\f]/g;function fb(a){return a.getAttribute&&a.getAttribute("class")||""}n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,fb(this)))});if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,fb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):n.isFunction(a)?this.each(function(c){n(this).toggleClass(a.call(this,c,fb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=n(this),f=a.match(G)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=fb(this),b&&N.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":N.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+fb(c)+" ").replace(eb," ").indexOf(b)>-1)return!0;return!1}});var gb=/\r/g,hb=/[\x20\t\r\n\f]+/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(gb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a)).replace(hb," ")}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||e<0,g=f?null:[],h=f?e+1:d.length,i=e<0?h:f?e:0;i<h;i++)if(c=d[i],(c.selected||i===e)&&(l.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentNode.disabled||!n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(n.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){if(n.isArray(b))return a.checked=n.inArray(n(a).val(),b)>-1}},l.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var ib=/^(?:focusinfocus|focusoutblur)$/;n.extend(n.event,{trigger:function(b,c,e,f){var g,h,i,j,l,m,o,p=[e||d],q=k.call(b,"type")?b.type:b,r=k.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!ib.test(q+n.event.triggered)&&(q.indexOf(".")>-1&&(r=q.split("."),q=r.shift(),r.sort()),l=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=r.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},f||!o.trigger||o.trigger.apply(e,c)!==!1)){if(!f&&!o.noBubble&&!n.isWindow(e)){for(j=o.delegateType||q,ib.test(j+q)||(h=h.parentNode);h;h=h.parentNode)p.push(h),i=h;i===(e.ownerDocument||d)&&p.push(i.defaultView||i.parentWindow||a)}g=0;while((h=p[g++])&&!b.isPropagationStopped())b.type=g>1?j:o.bindType||q,m=(N.get(h,"events")||{})[b.type]&&N.get(h,"handle"),m&&m.apply(h,c),m=l&&h[l],m&&m.apply&&L(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=q,f||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!L(e)||l&&n.isFunction(e[q])&&!n.isWindow(e)&&(i=e[l],i&&(e[l]=null),n.event.triggered=q,e[q](),n.event.triggered=void 0,i&&(e[l]=i)),b.result}},simulate:function(a,b,c){var d=n.extend(new n.Event,c,{type:a,isSimulated:!0});n.event.trigger(d,null,b)}}),n.fn.extend({trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];if(c)return n.event.trigger(a,b,c,!0)}}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),l.focusin="onfocusin"in a,l.focusin||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a))};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=N.access(d,b);e||d.addEventListener(a,c,!0),N.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=N.access(d,b)-1;e?N.access(d,b,e):(d.removeEventListener(a,c,!0),N.remove(d,b))}}});var jb=a.location,kb=n.now(),lb=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||n.error("Invalid XML: "+b),c};var mb=/#.*$/,nb=/([?&])_=[^&]*/,ob=/^(.*?):[ \t]*([^\r\n]*)$/gm,pb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,qb=/^(?:GET|HEAD)$/,rb=/^\/\//,sb={},tb={},ub="*/".concat("*"),vb=d.createElement("a");vb.href=jb.href;function wb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(G)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function xb(a,b,c,d){var e={},f=a===tb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function yb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function zb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}if(f)return f!==i[0]&&i.unshift(f),c[f]}function Ab(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:jb.href,type:"GET",isLocal:pb.test(jb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":ub,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?yb(yb(a,n.ajaxSettings),b):yb(n.ajaxSettings,a)},ajaxPrefilter:wb(sb),ajaxTransport:wb(tb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m=n.ajaxSetup({},c),o=m.context||m,p=m.context&&(o.nodeType||o.jquery)?n(o):n.event,q=n.Deferred(),r=n.Callbacks("once memory"),s=m.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,getResponseHeader:function(a){var b;if(2===v){if(!h){h={};while(b=ob.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===v?g:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return v||(a=u[c]=u[c]||a,t[a]=b),this},overrideMimeType:function(a){return v||(m.mimeType=a),this},statusCode:function(a){var b;if(a)if(v<2)for(b in a)s[b]=[s[b],a[b]];else x.always(a[x.status]);return this},abort:function(a){var b=a||w;return e&&e.abort(b),z(0,b),this}};if(q.promise(x).complete=r.add,x.success=x.done,x.error=x.fail,m.url=((b||m.url||jb.href)+"").replace(mb,"").replace(rb,jb.protocol+"//"),m.type=c.method||c.type||m.method||m.type,m.dataTypes=n.trim(m.dataType||"*").toLowerCase().match(G)||[""],null==m.crossDomain){j=d.createElement("a");try{j.href=m.url,j.href=j.href,m.crossDomain=vb.protocol+"//"+vb.host!=j.protocol+"//"+j.host}catch(y){m.crossDomain=!0}}if(m.data&&m.processData&&"string"!=typeof m.data&&(m.data=n.param(m.data,m.traditional)),xb(sb,m,c,x),2===v)return x;k=n.event&&m.global,k&&0===n.active++&&n.event.trigger("ajaxStart"),m.type=m.type.toUpperCase(),m.hasContent=!qb.test(m.type),f=m.url,m.hasContent||(m.data&&(f=m.url+=(lb.test(f)?"&":"?")+m.data,delete m.data),m.cache===!1&&(m.url=nb.test(f)?f.replace(nb,"$1_="+kb++):f+(lb.test(f)?"&":"?")+"_="+kb++)),m.ifModified&&(n.lastModified[f]&&x.setRequestHeader("If-Modified-Since",n.lastModified[f]),n.etag[f]&&x.setRequestHeader("If-None-Match",n.etag[f])),(m.data&&m.hasContent&&m.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",m.contentType),x.setRequestHeader("Accept",m.dataTypes[0]&&m.accepts[m.dataTypes[0]]?m.accepts[m.dataTypes[0]]+("*"!==m.dataTypes[0]?", "+ub+"; q=0.01":""):m.accepts["*"]);for(l in m.headers)x.setRequestHeader(l,m.headers[l]);if(m.beforeSend&&(m.beforeSend.call(o,x,m)===!1||2===v))return x.abort();w="abort";for(l in{success:1,error:1,complete:1})x[l](m[l]);if(e=xb(tb,m,c,x)){if(x.readyState=1,k&&p.trigger("ajaxSend",[x,m]),2===v)return x;m.async&&m.timeout>0&&(i=a.setTimeout(function(){x.abort("timeout")},m.timeout));try{v=1,e.send(t,z)}catch(y){if(!(v<2))throw y;z(-1,y)}}else z(-1,"No Transport");function z(b,c,d,h){var j,l,t,u,w,y=c;2!==v&&(v=2,i&&a.clearTimeout(i),e=void 0,g=h||"",x.readyState=b>0?4:0,j=b>=200&&b<300||304===b,d&&(u=zb(m,x,d)),u=Ab(m,u,x,j),j?(m.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(n.lastModified[f]=w),w=x.getResponseHeader("etag"),w&&(n.etag[f]=w)),204===b||"HEAD"===m.type?y="nocontent":304===b?y="notmodified":(y=u.state,l=u.data,t=u.error,j=!t)):(t=y,!b&&y||(y="error",b<0&&(b=0))),x.status=b,x.statusText=(c||y)+"",j?q.resolveWith(o,[l,y,x]):q.rejectWith(o,[x,y,t]),x.statusCode(s),s=void 0,k&&p.trigger(j?"ajaxSuccess":"ajaxError",[x,m,j?l:t]),r.fireWith(o,[x,y]),k&&(p.trigger("ajaxComplete",[x,m]),--n.active||n.event.trigger("ajaxStop")))}return x},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax(n.extend({url:a,type:b,dataType:e,data:c,success:d},n.isPlainObject(a)&&a))}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return n.isFunction(a)?this.each(function(b){n(this).wrapInner(a.call(this,b))}):this.each(function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return!n.expr.filters.visible(a)},n.expr.filters.visible=function(a){return a.offsetWidth>0||a.offsetHeight>0||a.getClientRects().length>0};var Bb=/%20/g,Cb=/\[\]$/,Db=/\r?\n/g,Eb=/^(?:submit|button|image|reset|file)$/i,Fb=/^(?:input|select|textarea|keygen)/i;function Gb(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||Cb.test(a)?d(a,e):Gb(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Gb(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Gb(c,a[c],b,e);return d.join("&").replace(Bb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Fb.test(this.nodeName)&&!Eb.test(a)&&(this.checked||!X.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(Db,"\r\n")}}):{name:b.name,value:c.replace(Db,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Hb={0:200,1223:204},Ib=n.ajaxSettings.xhr();l.cors=!!Ib&&"withCredentials"in Ib,l.ajax=Ib=!!Ib,n.ajaxTransport(function(b){var c,d;if(l.cors||Ib&&!b.crossDomain)return{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Hb[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=n("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Jb=[],Kb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Jb.pop()||n.expando+"_"+kb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Kb.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Kb.test(b.data)&&"data");if(h||"jsonp"===b.dataTypes[0])return e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Kb,"$1"+e):b.jsonp!==!1&&(b.url+=(lb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?n(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Jb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||d;var e=x.exec(a),f=!c&&[];return e?[b.createElement(e[1])]:(e=ca([a],b,f),f&&f.length&&n(f).remove(),n.merge([],e.childNodes))};var Lb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Lb)return Lb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(this,f||[a.responseText,b,a])})}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};function Mb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,n.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(e=d.getBoundingClientRect(),c=Mb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ea})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;n.fn[a]=function(d){return K(this,function(a,d,e){var f=Mb(a);return void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=Ga(l.pixelPosition,function(a,c){if(c)return c=Fa(a,b),Ba.test(c)?n(a).position()[b]+"px":c})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return K(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)},size:function(){return this.length}}),n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Nb=a.jQuery,Ob=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Ob),b&&a.jQuery===n&&(a.jQuery=Nb),n},b||(a.jQuery=a.$=n),n});

/******************************************************************************************************
 *                                             XPRS HELPER - SHARED FUNCTIONS 
 ******************************************************************************************************/

var XPRSHelper = {};
XPRSHelper.currentUser = {};


XPRSHelper.LOCAL_SERVER_PATH = "http://localhost:7000";
XPRSHelper.PRODUCTION_SERVER_PATH = "/";
XPRSHelper.RELATIVE_SERVER_PATH = "";
XPRSHelper.devMode = "PRODUCTION";
XPRSHelper.saveQueue = {"PENDING":{},"ERRED":{},"COMPLETED":{},"FUTURE":{}};
XPRSHelper.presetTypes = {
		"APPS":{"TYPE":"PROMO","NAME":"Widgets","GROUP":"SLIDESHOWS","PAGE":1},
		"FEATURES":{"TYPE":"FEATURES","NAME":"Features","GROUP":"FEATURES","PAGE":1},
		"TEAM":{"TYPE":"TEAM","NAME":"Team","GROUP":"FEATURES","PAGE":1},
		"LOGOS":{"TYPE":"LOGOS","NAME":"Logos","GROUP":"FEATURES","PAGE":1},
		"TESTIMONIALS":{"TYPE":"TESTIMONIALS","NAME":"Testimonials","GROUP":"SLIDESHOWS","PAGE":1},
		"PROJECTS":{"TYPE":"PROJECTS","NAME":"Projects","GROUP":"FEATURES","PAGE":1},
		"GALLERIES":{"TYPE":"GALLERIES","NAME":"Gallery","GROUP":"GALLERIES","PAGE":1},
		"BLOG":{"TYPE":"BLOG","NAME":"Blog","GROUP":"GALLERIES","PAGE":1},
		"STORE":{"TYPE":"STORE","NAME":"Store","GROUP":"GALLERIES","PAGE":1},
		"TEXT_BLOCK":{"TYPE":"TEXT_BLOCK","NAME":"Text Block","GROUP":"ITEMS","PAGE":1},
		"ARTICLE":{"TYPE":"ARTICLE","NAME":"Article","GROUP":"ITEMS","PAGE":1},
		"HEADER":{"TYPE":"HEADER","NAME":"Header","GROUP":"ITEMS","PAGE":1},
		"CALL_TO_ACTION":{"TYPE":"CALL_TO_ACTION","NAME":"Call to action","GROUP":"ITEMS","PAGE":1},
		"ITEMS":{"TYPE":"ITEMS","NAME":"Item","GROUP":"ITEMS","PAGE":1},
		"PROMO":{"TYPE":"PROMO","NAME":"Header","GROUP":"SLIDESHOWS","PAGE":1},
		"FORM":{"TYPE":"FORM","NAME":"Forms","GROUP":"ITEMS","PAGE":1},
		"SLIDESHOWS":{"TYPE":"SLIDESHOWS","NAME":"Slideshow","GROUP":"SLIDESHOWS","PAGE":1},
		"FOOD_MENU":{"TYPE":"FOOD_MENU","NAME":"Food Menu","GROUP":"FEATURES","PAGE":1},
		"MAPS":{"TYPE":"MAPS","NAME":"Maps","GROUP":"SLIDESHOWS","PAGE":1},
		"VIDEOS":{"TYPE":"VIDEOS","NAME":"Videos","GROUP":"SLIDESHOWS","PAGE":1},
		"RESERVATION":{"TYPE":"RESERVATION","NAME":"Reservations","GROUP":"ITEMS","PAGE":1},
		"STORIES":{"TYPE":"STORIES","NAME":"Stories","GROUP":"FEATURES","PAGE":1},
		"PRICING":{"TYPE":"PRICING","NAME":"Pricing","GROUP":"FEATURES","PAGE":1},
		"SERVICES":{"TYPE":"SERVICES","NAME":"Services","GROUP":"FEATURES","PAGE":1},
		"SOCIAL_ICONS":{"TYPE":"SOCIAL_ICONS","NAME":"Social","GROUP":"FEATURES","PAGE":1},
		"BIO_CV":{"TYPE":"BIO_CV","NAME":"Bio / Cv","GROUP":"ITEMS","PAGE":1},
		"TABLES":{"TYPE":"TABLES","NAME":"Tables","GROUP":"FEATURES","PAGE":1},
		"MENUS":{"TYPE":"MENUS","NAME":"Menu","GROUP":"MENUS","COLOR":"#6666FF"},
		"FOOTERS":{"TYPE":"FOOTERS","NAME":"Footer","GROUP":"FOOTERS","PAGE":1},
		"SELF":{"TYPE":"SELF","NAME":"Self","GROUP":"WIDGETS","PAGE":1,"COLOR":"#5D99C2"},
		//ELEMENT
		"TITLE":{"TYPE":"TITLE","NAME":"Title","GROUP":"ELEMENTS","COLOR":"#0f95ee","PAGE":2},
		"PIC":{"TYPE":"PIC","NAME":"Pic","GROUP":"ELEMENTS","COLOR":"#00cc99","PAGE":2},
		"DRAGGABLE_PIC":{"TYPE":"DRAGGABLE_PIC","NAME":"Draggable image","GROUP":"ELEMENTS","COLOR":"#00cc99","PAGE":2},
		"SUBTITLE":{"TYPE":"SUBTITLE","NAME":"Subtitle","GROUP":"ELEMENTS","COLOR":"#336667","PAGE":2},
		"VIDEO":{"TYPE":"VIDEO","NAME":"Video","GROUP":"ELEMENTS","COLOR":"#6766cc","PAGE":2},
		"BODY":{"TYPE":"BODY","NAME":"Body","GROUP":"ELEMENTS","COLOR":"#ff679a","PAGE":2},
		"QUOTE":{"TYPE":"QUOTE","NAME":"Quote","GROUP":"ELEMENTS","COLOR":"#FF9933","PAGE":2},
		"LINK":{"TYPE":"LINK","NAME":"Link","GROUP":"ELEMENTS","COLOR":"#663398","PAGE":2},
		"ICON":{"TYPE":"ICON","NAME":"Icon","GROUP":"ELEMENTS","COLOR":"#996533","PAGE":2},
		"MAP":{"TYPE":"MAP","NAME":"Map","GROUP":"ELEMENTS","COLOR":"#0099cb","PAGE":2},
		"HTML":{"TYPE":"HTML","NAME":"HTML","GROUP":"UNRESOLVED","COLOR":"#999999","PAGE":0},
		"DIVIDER":{"TYPE":"DIVIDER","NAME":"Divider","GROUP":"UNRESOLVED","COLOR":"#BDB76B","PAGE":0},
		"RAW":{"TYPE":"RAW","NAME":"Raw","GROUP":"ELEMENTS","COLOR":"#5a5a5a","PAGE":2},
		//UNRESOLVED
		"UNRESOLVED":{"TYPE":"UNRESOLVED","NAME":"","GROUP":"UNRESOLVED","COLOR":"","PAGE":0},
		"SOCIAL":{"TYPE":"SOCIAL","NAME":"","GROUP":"UNRESOLVED","COLOR":"#333","PAGE":0},
		"IMAGE":{"TYPE":"IMAGE","NAME":"Pic","GROUP":"UNRESOLVED","COLOR":"#00cc99","PAGE":0},
		"LABEL":{"TYPE":"LABEL","NAME":"Label","GROUP":"UNRESOLVED","COLOR":"#663398","PAGE":0},
		"FIELD":{"TYPE":"FIELD","NAME":"Field","GROUP":"UNRESOLVED","COLOR":"#FF9900","PAGE":0},
		"PRICE":{"TYPE":"PRICE","NAME":"PRICE","GROUP":"UNRESOLVED","COLOR":"#339966","PAGE":0}, // ECOMMERCE
		"CART":{"TYPE":"CART","NAME":"Cart","GROUP":"UNRESOLVED","COLOR":"#00CC99","PAGE":0}, // ECOMMERCE
		"QUOTE_AUTHOR":{"TYPE":"QUOTE_AUTHOR","NAME":"Quote Author","GROUP":"UNRESOLVED","COLOR":"#FF9933","PAGE":0},
		"INLINE_PIC":{"TYPE":"INLINE_PIC","NAME":"Image","GROUP":"UNRESOLVED","COLOR":"#00CC99","PAGE":0},
		"INLINE_RAW":{"TYPE":"INLINE_RAW","NAME":"HTML Box","GROUP":"UNRESOLVED","COLOR":"#3411CC","PAGE":0}
};

XPRSHelper.inPresetGroup = function(presetId,presetGroup){
	if (presetId in XPRSHelper.presetTypes){
		return  (XPRSHelper.presetTypes[presetId]["GROUP"] == presetGroup);
	}
	return false;
};

XPRSHelper.getServerPath = function(){
	if ($("body").attr("data-server")){
		return $("body").attr("data-server");
	}else{
		return XPRSHelper.RELATIVE_SERVER_PATH;	
	}
};

XPRSHelper.getStaticServerPath = function(){
	return $("body").attr("data-static-server");
};


XPRSHelper.getXprsCookie = function(cookieName){
	cookieName = cookieName.replace("xprs","imxprs");
	try {
		return $.cookie(cookieName);
	} catch(err) {
		var name = cookieName + "=";
	    var ca = document.cookie.split(';');
	    for(var i = 0; i <ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) == 0) {
	            return c.substring(name.length,c.length);
	        }
	    }
	}
	
};

XPRSHelper.setXprsCookie = function(cookieName,cookieValue){
	var secure = (location.protocol == 'https:') ? ";secure;" : "" ;
	cookieName = cookieName.replace("xprs","imxprs");
	if (window.location.href.indexOf("imcreator.com") == -1){
		document.cookie = cookieName + '=' + cookieValue + '; expires=Fri, 27 Jul 2030 02:47:11 UTC; path=/' + secure;
	}else{
		document.cookie = cookieName + '=' + cookieValue + '; expires=Fri, 27 Jul 2030 02:47:11 UTC; domain=.imcreator.com; path=/';
	}
};

XPRSHelper.removeXprsCookie = function(cookieName){
	cookieName = cookieName.replace("xprs","imxprs");
	if (window.location.href.indexOf("imcreator.com") == -1){
		document.cookie = cookieName + '=invalid; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
	}else{
		document.cookie = cookieName + '=invalid; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.imcreator.com; path=/';
	}
};

XPRSHelper.getUrlParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

XPRSHelper.updateParent = function(msg) {
	XPRSHelper.getParentWindow().postMessage(msg, '*');
};


XPRSHelper.GET = function(getPath, params, callbackFunc,responseType, errorCallback){
	if (getPath == "SKIP"){
		if (typeof callbackFunc != "undefined"){
			callbackFunc({});
		}
		return;
	}
	if (typeof EditorHelper != "undefined"){
		params["root_id"] = EditorHelper.getRootId();
		params["page_id"] = EditorHelper.getPageId();
	}else if (typeof SpimeDualView != "undefined"){
		params["root_id"] = SpimeDualView.getRootId();
	}
	$.get(XPRSHelper.getServerPath() + getPath, params, function(data) {
		if (typeof callbackFunc != "undefined"){
			callbackFunc(data);
		}
	},responseType).fail(function(xhr, textStatus, errorThrown) {
		try{
			if (typeof errorCallback != "undefined"){
				errorCallback();
			}
			XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":getPath,"ajax_params":JSON.stringify(params)});
		    window.console.error(text);
		}catch (ex) {}
	 });
};

XPRSHelper.GETCORS = function(postPath, params, callbackFunc,responseType){
	$.ajax({
		  type: "GET",
		  url: XPRSHelper.getServerPath() + postPath,
		  data: params,
		  xhrFields: {
	           withCredentials: true
	      },
	      crossDomain: true,
		  success: function(data) {
				if (typeof callbackFunc != "undefined"){
					callbackFunc(data);
				}
		  },
		  dataType: responseType
		}).fail(function(xhr, textStatus, errorThrown) {
			try{
				XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":getPath,"ajax_params":JSON.stringify(params)});
			    window.console.error(text);
			}catch (ex) {}
		 });
};


XPRSHelper.POST = function(postPath, params, callbackFunc,responseType,callbackOnly){
	if (callbackOnly){
		if (typeof callbackFunc != "undefined"){
			callbackFunc();
		} 
		return;
	}
	if (typeof EditorHelper != "undefined"){
		params["root_id"] = EditorHelper.getRootId();
		params["page_id"] = EditorHelper.getPageId();	
	}else if (typeof SpimeDualView != "undefined"){
		params["root_id"] = SpimeDualView.getRootId();
	}
	return $.ajax({
		  type: "POST",
		  url: XPRSHelper.getServerPath() + postPath,
		  data: params,
		  success: function(data) {
				if (typeof callbackFunc != "undefined"){
					callbackFunc(data);
				}
		  },
		  dataType: responseType
		}).fail(function(xhr, textStatus, errorThrown) {
			try{
				XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":getPath,"ajax_params":JSON.stringify(params)});
			    window.console.error(text);
			}catch (ex) {}
		 });
};

XPRSHelper.POSTCORS = function(postPath, params, callbackFunc,responseType){
	$.ajax({
		  type: "POST",
		  xhrFields: {
	           withCredentials: true
	      },
	      crossDomain: true,
		  url: XPRSHelper.getServerPath() + postPath,
		  data: params,
		  success: function(data) {
				if (typeof callbackFunc != "undefined"){
					callbackFunc(data);
				}
		  },
		  dataType: responseType
		}).fail(function(xhr, textStatus, errorThrown) {
			try{
				XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":getPath,"ajax_params":JSON.stringify(params)});
			    window.console.error(text);
			}catch (ex) {}
		 });
};


XPRSHelper.SAFEPOST = function(url,params,saveKey,saveName,callbackFunc,callbackOnly){
	if (callbackOnly){
		if (typeof callbackFunc != "undefined"){
			callbackFunc();
		} 
		return;
	}
	if (XPRSHelper.pendingActionExists(saveKey) || XPRSHelper.futureQueueSize(saveKey) > 0){
		if (XPRSHelper.pendingActionExists(saveKey)){
		}else if (XPRSHelper.futureQueueSize(saveKey) > 0){
		}
		XPRSHelper.addToFutureQueue(saveKey,url,saveName,params,callbackFunc);
		return;
	}else{
		XPRSHelper.markAsPending(saveKey);
	}
	if (typeof EditorHelper != "undefined"){
		params["root_id"] = EditorHelper.getRootId();
		params["page_id"] = EditorHelper.getPageId();
	}else if (typeof SpimeDualView != "undefined"){
		params["root_id"] = SpimeDualView.getRootId();
	}
	$.ajax({
		  type: "POST",
		  url: XPRSHelper.getServerPath() + url,
		  data: params,
		  success: function(result) {
			  if (result.response == "SUCCESS"){
				  XPRSHelper.updateSaveQueue(saveKey,"PENDING","COMPLETED",result);
				  XPRSHelper.updateParent({"deliver_to":"parent","action":"saved"});
				  if (typeof callbackFunc != "undefined"){
						callbackFunc(result);
				  }
				  if (typeof XPRSUndo != "undefined"){
					  XPRSUndo.pushHistoryEntry({"key":saveKey,"url":url,"name":saveName,"params":params});
				  }
			  }else{
				  //handle error!!
				  console.log("got error for key " + saveKey + " with result " + JSON.stringify(result));
				  XPRSHelper.updateSaveQueue(saveKey,"PENDING","ERRED",result);
			  }
		  },
		  dataType: "json"
		}).fail(function(xhr, textStatus, errorThrown) {
			try{
				XPRSHelper.reportError("something went wrong... " + textStatus  + " " + errorThrown,{"ajax_url":url,"ajax_params":JSON.stringify(params)});
			    window.console.error(text);
			}catch (ex) {}
		 }).always(function(){
			 if (XPRSHelper.futureQueueSize(saveKey) > 0){
				var nextAction = XPRSHelper.getNextSaveAction(saveKey);
				if (nextAction != null){
					console.log("found a new action, for key "  + saveKey + " calling future action")
					setTimeout(function(){
						XPRSHelper.SAFEPOST(nextAction.url,nextAction.params,nextAction.saveKey,nextAction.saveName,nextAction.callback);	
					},1000)
					
				}
			}
		 });
	
};


XPRSHelper.pendingActionExists = function(saveKey){
	return (saveKey in XPRSHelper.saveQueue["PENDING"]);
};

XPRSHelper.markAsPending = function(saveKey){
	XPRSHelper.saveQueue["PENDING"][saveKey] = true;
};



XPRSHelper.addToFutureQueue = function(saveKey,url,saveName,params,callback){
	var action = {};
	action.url = url;
	action.params = params;
	action.saveKey = saveKey;
	action.saveName = saveName;
	action.callback = callback;
	if (!(saveKey in XPRSHelper.saveQueue["FUTURE"])){
		XPRSHelper.saveQueue["FUTURE"][saveKey] = [];
	}
	XPRSHelper.saveQueue["FUTURE"][saveKey].push(action);
};

XPRSHelper.futureQueueSize = function(saveKey){
	var size = 0;
	if (saveKey in XPRSHelper.saveQueue["FUTURE"]){
		size = XPRSHelper.saveQueue["FUTURE"][saveKey].length
	}
	return size;
};

XPRSHelper.updateSaveQueue = function(saveKey,fromState,toState,result){
	XPRSHelper.saveQueue[toState][saveKey] = true;
	delete XPRSHelper.saveQueue[fromState][saveKey];
};

XPRSHelper.getNextSaveAction = function(saveKey){
	var nextAction = null;
	if (saveKey in XPRSHelper.saveQueue["FUTURE"]){
		var nextAction = XPRSHelper.saveQueue["FUTURE"][saveKey].pop();
		if (XPRSHelper.saveQueue["FUTURE"][saveKey].length == 0){
			delete XPRSHelper.saveQueue["FUTURE"][saveKey];
		}
	}
	return nextAction;
};

XPRSHelper.localServer = function(){
	try{
		return (XPRSHelper.getParentWindow().location.href.indexOf("localhost") != -1);
	}catch(err){};
};

XPRSHelper.clonePrefix = function() {
	return 'xxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};

XPRSHelper.onCssTransitionFinish = function(obj,callbackFunc){
		if (typeof callbackFunc != "undefined"){
			callbackFunc();
		}
};

XPRSHelper.signout = function(labelName){
	XPRSHelper.removeXprsCookie("xprs_user");
	XPRSHelper.removeXprsCookie("xprs_root");
	XPRSHelper.removeXprsCookie("xprs_session");
	XPRSHelper.removeXprsCookie("xprs_email");
	XPRSHelper.updateParent({"deliver_to":"parent","action":"remove_navigation_confirmation"});
	if (typeof labelName != "undefined" && labelName == "bricksite"){
		XPRSHelper.getParentWindow().location.href = "https://admin.bricksite.net/logout.php";
	}else{
		XPRSHelper.getParentWindow().location.href = "/";
	}
};


XPRSHelper.getCurrentUser = function(callbackFunc){
	XPRSHelper.GET("/get_loggedin_user",{},function(userObj){
		XPRSHelper.currentUser = userObj;
		if (typeof callbackFunc != "undefined"){
			callbackFunc();
		}
	},"json");
};



XPRSHelper.trackEvent = function(eventName, category, label, eventValue, skipBi){
	if (typeof YSBApp == "undefined"){
		if (typeof eventValue == "undefined"){
			eventValue = 0;
		}
		if (typeof ga != "undefined"){
			if (typeof ANALYTICS_CODES != "undefined"){
				for (i in ANALYTICS_CODES){
						var analyticsName = ANALYTICS_CODES[i]["name"];
			  		ga('send', {
						  'hitType': 'event',          // Required.
						  'eventCategory': category,   // Required.
						  'eventAction': eventName,      // Required.
						  'eventLabel': label,
							'eventValue':eventValue
					});
					ga('send', 'pageview', {
						  'page': eventName,
						  'title':eventName
					});
				}
			}
			
		}
		try{
			if (typeof IMOS != "undefined"){
				var ourGoals = {"Registration":true,"Premium":true,"Whitelabel Premium":true};
				if (eventName in ourGoals){
					//will be tracked from the goal function
					try{
						if (typeof ga != "undefined"){
							if (eventName != "Registration"){
								ga('ecommerce:addTransaction', {
									'id': eventName,                     // Transaction ID. Required.
									'revenue': eventValue             // Grand Total.
								});
								ga('ecommerce:addItem', {
									'id': label,                     // Transaction ID. Required.
									'name': label,    // Product name. Required.
									'price': eventValue,                 // Unit price.
									'quantity': '1'                   // Quantity.
								});
								ga('ecommerce:send');
							}
						}
					} catch(e){
						console.log(e)
					}
					  
				}else{
					IMOS.trackEvent(eventName);	
				}
			}
			if (typeof Intercom != "undefined"){
				if (eventName.indexOf("-Publish") == -1 && eventName.indexOf("-Pay") == -1 && eventName.indexOf("-Select") == -1){
					Intercom('trackEvent', eventName, {value:label});
				}
				if (eventName == "clicked become a reseller"){
					if (typeof Intercom != "undefined"){
						Intercom('update', {"visited whitelabel form": true});
					}
				}
			}

			if (typeof imosSdk != "undefined"){
				imosSdk.customEvent(eventName);
			}
		} catch (err){
			console.log("failed to track imos");
		}
	}
	if (!skipBi){
		XPRSHelper.POST("/track_user_action", {"event_name":eventName,"url":window.location.href,"extra_data":label});
	}
};


XPRSHelper.getParentWindow = function(){
	if (typeof SpimeDualView != "undefined"){
		return window.self
	}
	try { 
		if (window.parent.location.href){
			return window.parent;
		}
	}catch (err){
		return window.self;
	}
};


XPRSHelper.changeHash = function(newHash){
	XPRSHelper.getParentWindow().location.hash = newHash;
};


XPRSHelper.imagePreloader = function(arrayOfImages,containingFolder,suffix) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = containingFolder + "/" + this + "." + suffix;
    });
};



XPRSHelper.renderTip = function(tipIndex){
	tooltTips = [
		     		{
			     		"category":"Adding Sections",
			     		"title":"Add a new section to your page",
			     		"content":"Click to add  text, pictures, gallery, slideshow, contact form and more.",
			     		"direction":"bottom-left",
			     		"selector":"#add-stripe",
			     		"container_selector":".master.item-box:visible:not(.force-transparency):not(.element-box):not(.header-box) + .control-handle:eq(0) .add-stripe-holder",
			     		"frame":"viewer",
			     		"circle_offset_left":38,
			     		"circle_offset_top":40//,
			     	},
		     		{
			     		"category":"Editing Content",
			     		"title":"Click & edit any element",
			     		"content":"Click any element and insert your own content: text, pictures and more.",
			     		"direction":"bottom-right",
			     		"selector":".text-element",
			     		"container_selector":".master.item-box:not(.header-box)",
			     		"frame":"viewer",
			     		"circle_offset_left":0,
			     		"circle_offset_top":37
			     	},
		     		{
			     		"category":"Adding Pages",
			     		"title":"Add a new page to your site",
			     		"content":"Click to add a new page: about, blog, gallery, contact and more",
			     		"direction":"top-right",
			     		"selector":"#pages-menu-btn, .pages-dropdown",
			     		"container_selector":"#control-panel-left, #control-panel .left-side",
			     		"frame":"dual",
			     		"circle_offset_left":15,
			     		"circle_offset_top":29
		     		},
		     		{
			     		"category":"Responsive",
			     		"title":"Preview on all devices",
			     		"content":"See how your website looks on tablets and mobile phones",
			     		"direction":"top-right",
			     		"selector":"#preview-menu-btn, .preview-dropdown",
			     		"container_selector":"#control-panel-right, #control-panel .right-side",
			     		"frame":"dual",
			     		"circle_offset_left":8,
			     		"circle_offset_top":27
			     	},
		     		{
			     		"category":"Publish",
			     		"title":"Publish your site",
			     		"content":"When you finish editing your site, click Publish to connect to a domain and share your site with the world.",
			     		"direction":"top-right",
			     		"selector":"#publish-btn, .topbar-publish",
			     		"container_selector":"body",
			     		"frame":"dual",
			     		"circle_offset_left":-19,
			     		"circle_offset_top":28
					 },
		     		{
			     		"category":"History",
			     		"title":"Undo certain actions",
			     		"content":"Undo 'delete', 'add' and 'order' actions",
			     		"direction":"bottom-left",
			     		"selector":"#undo-btn",
			     		"container_selector":"body",
			     		"frame":"dual",
			     		"circle_offset_left":40,
			     		"circle_offset_top":28
			     	}
		     	];
	tipObj = tooltTips[tipIndex];
	if (!tipObj){
		return;
	}
	var tooltipWrapper = $("<div class='tooltip-wrapper tooltip-ui tooltip-ui"+ tipIndex +"'  />");
	var tooltipHolder = $("<div class='tooltip-holder' />");
	var availableContainers = $(tipObj.container_selector);
	var tooltipRefrenceContainer = availableContainers.first();
	
	
	

	
	var tooltipRefrenceElement = tooltipRefrenceContainer.find(tipObj.selector).first();
	if (tooltipRefrenceElement.length == 0){
		if (availableContainers.length > 1){
			tooltipRefrenceContainer = availableContainers.eq(1);
			tooltipRefrenceElement = tooltipRefrenceContainer.find(tipObj.selector);
		}
	}
	var lastTip = false;
	var nextTipIndex = tipIndex + 1;
	if (nextTipIndex == tooltTips.length){
		lastTip = true;
	}
	//No such reference element, skip
	if (tooltipRefrenceElement.length == 0){
		XPRSHelper.renderTip(nextTipIndex);
		console.log("didn't find")
		return;
	}
	var tooltipcategory = $("<div class='tooltip-category t-t' />").text(tipObj.category);
	var tooltipTitle = $("<div class='tooltip-title t-t' />").text(tipObj.title);
	var tooltipContent = $("<div class='tooltip-content t-t' />").html(tipObj.content);
	
	nextBtnText = (lastTip) ? "got it" : "next";
	
	var tooltipNextTip = $("<div class='tooltip-next tooltip-btn t-t' />").text(nextBtnText);
	var tooltipHideTip = $("<div class='tooltip-hide tooltip-btn t-t' />").text("hide");
	
	tooltipNextTip.unbind("click").bind("click",function(e){
		e.stopPropagation();
		$(".tooltip-ui" + tipIndex).remove();
		if (tipObj.generate_click){
			tooltipRefrenceElement.trigger("click");
		}
		XPRSHelper.updateParent({"deliver_to":"viewer","action":"remove-tooltips", "tooltip_index":tipIndex});
		if ( !lastTip ){
			XPRSHelper.renderTip(nextTipIndex);
		}else{
			XPRSHelper.updateParent({"deliver_to":"parent","action":"remove-tooltips", "tooltip_index":tipIndex});
		}
	});
	
	var tooltipCircle = $("<div class='tooltip-circle tooltip-ui tooltip-ui"+ tipIndex +"'' />");
	
	tooltipCircle.unbind("click").bind("click",function(event) {
		event.stopPropagation();
		XPRSHelper.updateParent({"deliver_to":"parent","action":"remove-tooltips"});
		tooltipRefrenceElement.click();
	});
	
	if (tipObj.generate_click){
		setTimeout(function(){
			tooltipRefrenceElement.trigger("click");
		},1500)
	}
	
	tooltipHideTip.unbind("click").bind("click",function(e){
		e.stopPropagation();
		XPRSHelper.updateParent({"deliver_to":"viewer","action":"remove-tooltips", "tooltip_index":tipIndex});
		XPRSHelper.updateParent({"deliver_to":"parent","action":"remove-tooltips", "tooltip_index":tipIndex});
	});
	
	
	
	tooltipHolder.append(tooltipcategory).append(tooltipTitle).append(tooltipContent).append(tooltipHideTip).append(tooltipNextTip);
	tooltipWrapper.append(tooltipHolder);
	
	tooltipRefrenceContainer.append(tooltipCircle);
	tooltipRefrenceContainer.append(tooltipWrapper);

	if (tipObj.frame == "dual"){
		tooltipWrapper.css("position", "fixed");
		tooltipCircle.css("position", "fixed");
	}else{
		tooltipWrapper.css("position", "");
		tooltipCircle.css("position", "");
	}
	var scrollOffset = 0;
	scrollOffset = $('.main-page').scrollTop();

	tooltipCircle.offset({ top: tooltipRefrenceElement.offset().top - tipObj.circle_offset_top, left: tooltipRefrenceElement.offset().left - tipObj.circle_offset_left});
	
	

	
	var preferredDirection = tipObj.direction;
	var calculatedLeft = 0;
	var calculatedTop = 0;
	if (preferredDirection.indexOf("bottom") != -1){
		calculatedTop = tooltipCircle.position().top - tooltipWrapper.innerHeight() + 40;
	}else{
		calculatedTop = tooltipCircle.position().top + tooltipCircle.innerHeight() - 40;
	}
	
	if (preferredDirection.indexOf("left") != -1){
		calculatedLeft = tooltipCircle.position().left + tooltipCircle.innerWidth() - 40;
	}else{
		calculatedLeft = tooltipCircle.position().left - tooltipWrapper.innerHeight();
	}
	
	if (calculatedTop < 0 && preferredDirection.indexOf("bottom") != -1 && tipObj.selector != "#add-stripe"){
		preferredDirection = preferredDirection.replace("bottom","top");
		calculatedTop = tooltipCircle.position().top + tooltipCircle.innerHeight() - 40;
	}
	
	if (calculatedLeft < 0 && preferredDirection.indexOf("right") != -1 ){
		preferredDirection = preferredDirection.replace("right","left");
		calculatedLeft = tooltipCircle.position().left + tooltipCircle.innerWidth() - 40;
	}else if(calculatedLeft +  tooltipWrapper.width() > parseInt($("document").width()) && preferredDirection.indexOf("left") != -1){
		preferredDirection = preferredDirection.replace("right","left");
		calculatedLeft = tooltipCircle.position().left - tooltipWrapper.innerHeight();
	}
	
	tooltipWrapper.css("left",calculatedLeft);
	tooltipWrapper.css("top",calculatedTop );
	tooltipWrapper.addClass(preferredDirection);
	
	
	if (tipObj.frame == "viewer"){
		var topmostComponent = Math.min(tooltipCircle.offset().top,tooltipWrapper.offset().top);
		var scrollto = topmostComponent - $('.main-page').offset().top + $('.main-page').scrollTop();
		
	    var offset = tooltipCircle.offset().top;
	    var visibleAreaStart = $(window).scrollTop();
	    var visibleAreaEnd = visibleAreaStart + window.innerHeight;
	    if(offset < visibleAreaStart || offset > visibleAreaEnd){
	         // Not in view so scroll to it
	    	$('body,html').animate({scrollTop:scrollto},2000,'easeOutQuart');
	    }
	}
	
	XPRSTranslator.translateDom(tooltipWrapper);
	
	setTimeout(function(){
		tooltipRefrenceContainer.addClass("tip-highlight");
	},500);

};


XPRSHelper.xprsAlert = function(msg,params){
	if (typeof swal == "undefined"){
		console.error("XPRS Error: " + msg + " " + JSON.stringify(params));
		return;
	}
	
	if (typeof params == "undefined"){
		params = {};
		params["title"] = "_";
	}
	params["confirmButtonColor"]="#0099CC";
	params["customClass"] = "xprs-alert";
	if (params && !params["do_not_translate"]){
		msg = XPRSTranslator.translateText(msg);
	params["title"] = XPRSTranslator.translateText(params["title"]);
	}
	
	params["confirmButtonText"] = XPRSTranslator.translateText(params["confirmButtonText"]);
	params["cancelButtonText"] = XPRSTranslator.translateText(params["cancelButtonText"]);
	params["text"] = msg;
	var existingAlert = ($(".sweet-alert.visible").length == 1);
	swal(params,params["callbackfunc"]);
	if (typeof params.report_error != "undefined"){
		XPRSHelper.reportError(msg,params);
	}
	
	$(".sweet-overlay").unbind("click").bind("click",function(e){
		e.stopPropagation();
		if (params && params["cancelFunc"]){
			params["cancelFunc"]();
		}
		swal.close();
	});
};


XPRSHelper.reportError = function(errorMsg,params){
	try{
		$.ajax({
			  type: "POST",
			  url: XPRSHelper.getServerPath() + "/log",
			  data: {"log_info":errorMsg,"stack_trace":Error().stack,"url":window.location.href,"ajax_url":params["ajax_url"],"ajax_params":params["ajax_params"]}
		});
	}catch (ex) {}
};


XPRSHelper.invokeLogin = function(callbackFunc, form, cancelCallback, options){
	XPRSHelper.getCurrentUser(function(){
		var nextUrl = XPRSHelper.getUrlParameterByName("requested_url");
		var forceDialog = false;
		if (form && form.indexOf("force-") != -1){
			form = form.replace("force-","");
			forceDialog = true;
		}
		if (typeof LABEL_CONFIG != "undefined" && "SETTINGS" in LABEL_CONFIG && LABEL_CONFIG.SETTINGS.USER_PROFILE == "login_only"){
			form = "login";
		}
		if (nextUrl == "/themes" && XPRSHelper.currentUser["type"] == "USER"){
			return;
		}
		if (XPRSHelper.currentUser["type"] == "GUEST" || nextUrl != "" || forceDialog){
			if (typeof YSBApp != "undefined"){
				YSBApp.send({"action": "session-expired", "appid": "ywebsite"});
				return;
			}
			if (typeof ExternalLogin != "undefined"){
				if (typeof SpimeDualView != "undefined"){
					SpimeDualView.handleNavigationConfirmation = false;
				}
				if (form == "login"){
					window.location.href = ExternalLogin.loginUrl;
				}else{
					window.location.href = ExternalLogin.registerUrl;
				}
				return
			}
			if (typeof LoginModule == "undefined"){
			 var login_css = $("<link>");
			 login_css.attr({ 
			      rel:  "stylesheet",
			      type: "text/css",
			      href: XPRSHelper.getServerPath() + "/css/login.css?v=147"
			    });
			 $("head").append(login_css);
			 
			 
			 $.ajax({
				  url: XPRSHelper.getServerPath() + "/js/login.js?v=147",
				  dataType: 'script',
				  success: function(){
					  setTimeout(function(){
						  LoginModule.popLogin(callbackFunc, form, cancelCallback, options);
					  },250); 
				  },
				  cache: true
				  //async: false
				});
		}else{
				LoginModule.popLogin(callbackFunc, form, cancelCallback, options);
			}
		}else{
			if (typeof callbackFunc != "undefined"){
				callbackFunc();
			}
		}
	});
};


XPRSHelper.checkBrowserSupport = function(){
	var currentBrowser = XPRSHelper.getBrowser();
	if (currentBrowser.toLowerCase().indexOf("chrome") == -1){
		//We does not support your browser for the time being please download chrome
	}
};

XPRSHelper.getBrowser = function(){
	var ua= navigator.userAgent, tem, 
	M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if(/trident/i.test(M[1])){
	    tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
	    return 'IE '+(tem[1] || '');
	}
	if(M[1]=== 'Chrome'){
	    tem= ua.match(/\bOPR\/(\d+)/);
	    if(tem!= null) return 'Opera '+tem[1];
	}
	M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
	return M.join(' ');
};



XPRSHelper.slugify = function(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

XPRSHelper.isChrome = function(){
	var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	var isChrome = !!window.chrome && !isOpera;     // Chrome 1+ 
	return isChrome;
}


XPRSHelper.handleDevicePreview = function(params, callbackFunc){
	var deviceSizeTable = {
		"cellphone":{"font-size":"0.7px","width":320,"height":550,"border_top":"55px","border_bottom":"55px","margin":"110px auto","add_class":"shadowed"},
		"tablet":{"font-size":"0.9px","width":768,"height":1024,"border_top":"25px","border_bottom":"55px","margin":"80px auto","add_class":"shadowed"},
		"desktop":{"font-size":"","width":"100%","height":"100%","margin":"initial","add_class":""},"editor":{"width":"100%","height":"100%","margin":"initial","add_class":""}};
	var deviceObj = deviceSizeTable[params.device_type];
	$("html").css({"width":deviceObj.width,"height":deviceObj.height,"margin":deviceObj.margin});
	if (params.device_type == "cellphone" || params.device_type == "tablet"){
		$("html").addClass("showing-preview");
	}else{
		$("html").removeClass("showing-preview");
	}
	EditorHelper.handleDevicePreview({"device_type":params.device_type}, callbackFunc);
};

XPRSHelper.restoreBox = function(rootId,dateStamp){
	var controlPanel =$("#control-panel");
	var autoBackupOnly = controlPanel.find("#backup-menu-dropdown").hasClass("auto-backup");
	XPRSHelper.xprsAlert("Please wait, this operation may take several minutes",{title: "Restoring website", showCancelButton: false,closeOnConfirm:false,confirmButtonText:"Yes, Save a copy",cancelButtonText:"No, Thanks","callbackfunc":function(isConfirm){}});
	$(".sweet-overlay").unbind("click");
	$(".xprs-alert button.confirm").addClass("animated-color").css({"background-image":"url('/images/x_loader.gif')","background-repeat":"no-repeat","background-position":"center","background-size":"50px 50px","color":"rgba(0,0,0,0)"}).unbind("click")
	controlPanel.find("#backup-btn").addClass("loading-state");
	XPRSHelper.GET("/restore_box",{"vbid":rootId,"date_stamp":dateStamp, "backup_type":(autoBackupOnly)?"S3_AUTOBACKUP_BUCKET":"S3_BACKUP_BUCKET"},function(){
		location.reload();
	});
};

XPRSHelper.clickedImos = function(callbackFunc){
	var controlPanel =$("#control-panel");
	XPRSHelper.invokeLogin(function(){
		XPRSHelper.GET("/imos_user",{"root_id":EditorHelper.rootId}, function(res){
			controlPanel.find("#imos-btn").removeClass("loading-state");
			if (res.error){
				if (res.error == "Must be logged in"){

				}else{
					XPRSHelper.xprsAlert(res.error, {title: "Something went wrong", showCancelButton: false,closeOnConfirm:true,confirmButtonText:"OK","callbackfunc":function(isConfirm){

					}});
				}
				return;
			}
			if (typeof callbackFunc != "undefined"){
				callbackFunc(res.propertyId);
			}
			var imosInstalled = res.imos_installed;
			var propertyId = res.propertyId;
			var authToken = res.authToken;
			if (!imosInstalled){
				XPRSHelper.xprsAlert("In order to be able to see traffic using IMOS please publish the website",{title: "Publish site to see traffic", showCancelButton: true,closeOnConfirm:true,confirmButtonText:"Publish",cancelButtonText:"Maybe later","callbackfunc":function(isConfirm){
					if(isConfirm){
						controlPanel.find("#publish-btn").click();
						controlPanel.find("#imos-btn .option-text").text("Open IM Chat")
						if (typeof VueEditor != "undefined"){
							VueEditor._router.push("/website/publish");
						}
					}
				}});
			}else{

			}
		},"json", function(){
			controlPanel.find("#imos-btn").removeClass("loading-state");
			XPRSHelper.xprsAlert("Operation failed", {title: "Something went wrong", showCancelButton: false,closeOnConfirm:true,confirmButtonText:"OK","callbackfunc":function(isConfirm){
				callbackFunc(null);
			}});
		});
	},"register");
}
/*! jQuery v2.2.5-pre | (c) jQuery Foundation | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=a.document,e=c.slice,f=c.concat,g=c.push,h=c.indexOf,i={},j=i.toString,k=i.hasOwnProperty,l={},m="2.2.5-pre b14ce54334a568eaaa107be4c441660a57c3db24",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return e.call(this)},get:function(a){return null!=a?a<0?this[a+this.length]:this[a]:e.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a){return n.each(this,a)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(e.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(a<0?b:0);return this.pushStack(c>=0&&c<b?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:g,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);h<i;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=a&&a.toString();return!n.isArray(a)&&b-parseFloat(b)+1>=0},isPlainObject:function(a){var b;if("object"!==n.type(a)||a.nodeType||n.isWindow(a))return!1;if(a.constructor&&!k.call(a,"constructor")&&!k.call(a.constructor.prototype||{},"isPrototypeOf"))return!1;for(b in a);return void 0===b||k.call(a,b)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?i[j.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=d.createElement("script"),b.text=a,d.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b){var c,d=0;if(s(a)){for(c=a.length;d<c;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):g.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:h.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;d<c;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;f<g;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,g=0,h=[];if(s(a))for(d=a.length;g<d;g++)e=b(a[g],g,c),null!=e&&h.push(e);else for(g in a)e=b(a[g],g,c),null!=e&&h.push(e);return f.apply([],h)},guid:1,proxy:function(a,b){var c,d,f;if("string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a))return d=e.call(arguments,2),f=function(){return a.apply(b||this,d.concat(e.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f},now:Date.now,support:l}),"function"==typeof Symbol&&(n.fn[Symbol.iterator]=c[Symbol.iterator]),n.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){i["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=!!a&&"length"in a&&a.length,c=n.type(a);return"function"!==c&&!n.isWindow(a)&&("array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a)}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ga(),z=ga(),A=ga(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;c<d;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+L+"*\\]",O=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+N+")*)|.*)\\)|)",P=new RegExp(L+"+","g"),Q=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),R=new RegExp("^"+L+"*,"+L+"*"),S=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),T=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),U=new RegExp(O),V=new RegExp("^"+M+"$"),W={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},X=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,$=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,_=/[+~]/,aa=/'|\\/g,ba=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),ca=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:d<0?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},da=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(ea){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fa(a,b,d,e){var f,h,j,k,l,o,r,s,w=b&&b.ownerDocument,x=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==x&&9!==x&&11!==x)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==x&&(o=$.exec(a)))if(f=o[1]){if(9===x){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(w&&(j=w.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(o[2])return H.apply(d,b.getElementsByTagName(a)),d;if((f=o[3])&&c.getElementsByClassName&&b.getElementsByClassName)return H.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==x)w=b,s=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(aa,"\\$&"):b.setAttribute("id",k=u),r=g(a),h=r.length,l=V.test(k)?"#"+k:"[id='"+k+"']";while(h--)r[h]=l+" "+qa(r[h]);s=r.join(","),w=_.test(a)&&oa(b.parentNode)||b}if(s)try{return H.apply(d,w.querySelectorAll(s)),d}catch(y){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(Q,"$1"),b,d,e)}function ga(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ha(a){return a[u]=!0,a}function ia(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ja(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function ka(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function la(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function na(a){return ha(function(b){return b=+b,ha(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function oa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=fa.support={},f=fa.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return!!b&&"HTML"!==b.nodeName},m=fa.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ia(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ia(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Z.test(n.getElementsByClassName),c.getById=ia(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){if("undefined"!=typeof b.getElementsByClassName&&p)return b.getElementsByClassName(a)},r=[],q=[],(c.qsa=Z.test(n.querySelectorAll))&&(ia(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ia(function(a){var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Z.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ia(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",O)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Z.test(o.compareDocumentPosition),t=b||Z.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return ka(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?ka(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},fa.matches=function(a,b){return fa(a,null,null,b)},fa.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(T,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fa(b,n,null,[a]).length>0},fa.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fa.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fa.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fa.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fa.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fa.selectors={cacheLength:50,createPseudo:ha,match:W,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ba,ca),a[3]=(a[3]||a[4]||a[5]||"").replace(ba,ca),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fa.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fa.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return W.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&U.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ba,ca).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fa.attr(d,a);return null==e?"!="===b:!b||(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(P," ")+" ").indexOf(c)>-1:"|="===b&&(e===c||e.slice(0,c.length+1)===c+"-"))}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fa.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ha(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ha(function(a){var b=[],c=[],d=h(a.replace(Q,"$1"));return d[u]?ha(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ha(function(a){return function(b){return fa(a,b).length>0}}),contains:ha(function(a){return a=a.replace(ba,ca),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ha(function(a){return V.test(a||"")||fa.error("unsupported lang: "+a),a=a.replace(ba,ca).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Y.test(a.nodeName)},input:function(a){return X.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:na(function(){return[0]}),last:na(function(a,b){return[b-1]}),eq:na(function(a,b,c){return[c<0?c+b:c]}),even:na(function(a,b){for(var c=0;c<b;c+=2)a.push(c);return a}),odd:na(function(a,b){for(var c=1;c<b;c+=2)a.push(c);return a}),lt:na(function(a,b,c){for(var d=c<0?c+b:c;--d>=0;)a.push(d);return a}),gt:na(function(a,b,c){for(var d=c<0?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=la(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=ma(b);function pa(){}pa.prototype=d.filters=d.pseudos,d.setFilters=new pa,g=fa.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=R.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=S.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(Q," ")}),h=h.slice(c.length));for(g in d.filter)!(e=W[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fa.error(a):z(a,i).slice(0)};function qa(a){for(var b=0,c=a.length,d="";b<c;b++)d+=a[b].value;return d}function ra(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j,k=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(j=b[u]||(b[u]={}),i=j[b.uniqueID]||(j[b.uniqueID]={}),(h=i[d])&&h[0]===w&&h[1]===f)return k[2]=h[2];if(i[d]=k,k[2]=a(b,c,g))return!0}}}function sa(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ta(a,b,c){for(var d=0,e=b.length;d<e;d++)fa(a,b[d],c);return c}function ua(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;h<i;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function va(a,b,c,d,e,f){return d&&!d[u]&&(d=va(d)),e&&!e[u]&&(e=va(e,f)),ha(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ta(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ua(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ua(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ua(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function wa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ra(function(a){return a===b},h,!0),l=ra(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];i<f;i++)if(c=d.relative[a[i].type])m=[ra(sa(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;e<f;e++)if(d.relative[a[e].type])break;return va(i>1&&sa(m),i>1&&qa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(Q,"$1"),c,i<e&&wa(a.slice(i,e)),e<f&&wa(a=a.slice(e)),e<f&&qa(a))}m.push(c)}return sa(m)}function xa(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=F.call(i));u=ua(u)}H.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&fa.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ha(f):f}return h=fa.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xa(e,d)),f.selector=a}return f},i=fa.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ba,ca),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=W.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ba,ca),_.test(j[0].type)&&oa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qa(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,!b||_.test(a)&&oa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ia(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ia(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ja("type|href|height|width",function(a,b,c){if(!c)return a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ia(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ja("value",function(a,b,c){if(!c&&"input"===a.nodeName.toLowerCase())return a.defaultValue}),ia(function(a){return null==a.getAttribute("disabled")})||ja(K,function(a,b,c){var d;if(!c)return a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fa}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.uniqueSort=n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},v=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},w=n.expr.match.needsContext,x=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,y=/^.[^:#\[\.,]*$/;function z(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(y.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return h.call(b,a)>-1!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;b<c;b++)if(n.contains(e[b],this))return!0}));for(b=0;b<c;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(z(this,a||[],!1))},not:function(a){return this.pushStack(z(this,a||[],!0))},is:function(a){return!!z(this,"string"==typeof a&&w.test(a)?n(a):a||[],!1).length}});var A,B=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=n.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||A,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:B.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),x.test(e[1])&&n.isPlainObject(b))for(e in b)n.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&f.parentNode&&(this.length=1,this[0]=f),this.context=d,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?void 0!==c.ready?c.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};C.prototype=n.fn,A=n(d);var D=/^(?:parents|prev(?:Until|All))/,E={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;a<c;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=w.test(a)||"string"!=typeof a?n(a,b||this.context):0;d<e;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?h.call(n(a),this[0]):h.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function F(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return u(a,"parentNode")},parentsUntil:function(a,b,c){return u(a,"parentNode",c)},next:function(a){return F(a,"nextSibling")},prev:function(a){return F(a,"previousSibling")},nextAll:function(a){return u(a,"nextSibling")},prevAll:function(a){return u(a,"previousSibling")},nextUntil:function(a,b,c){return u(a,"nextSibling",c)},prevUntil:function(a,b,c){return u(a,"previousSibling",c)},siblings:function(a){return v((a.parentNode||{}).firstChild,a)},children:function(a){return v(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(E[a]||n.uniqueSort(e),D.test(a)&&e.reverse()),this.pushStack(e)}});var G=/\S+/g;function H(a){var b={};return n.each(a.match(G)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?H(a):n.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){n.each(b,function(b,c){n.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==n.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return n.each(arguments,function(a,b){var c;while((c=n.inArray(b,f,c))>-1)f.splice(c,1),c<=h&&h--}),this},has:function(a){return a?n.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().progress(c.notify).done(c.resolve).fail(c.reject):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=e.call(arguments),d=c.length,f=1!==d||a&&n.isFunction(a.promise)?d:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?e.call(arguments):d,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(d>1)for(i=new Array(d),j=new Array(d),k=new Array(d);b<d;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().progress(h(b,j,i)).done(h(b,k,c)).fail(g.reject):--f;return f||g.resolveWith(k,c),g.promise()}});var I;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(I.resolveWith(d,[n]),n.fn.triggerHandler&&(n(d).triggerHandler("ready"),n(d).off("ready"))))}});function J(){d.removeEventListener("DOMContentLoaded",J),a.removeEventListener("load",J),n.ready()}n.ready.promise=function(b){return I||(I=n.Deferred(),"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(n.ready):(d.addEventListener("DOMContentLoaded",J),a.addEventListener("load",J))),I.promise(b)},n.ready.promise();var K=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)K(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;h<i;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},L=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function M(){this.expando=n.expando+M.uid++}M.uid=1,M.prototype={register:function(a,b){var c=b||{};return a.nodeType?a[this.expando]=c:Object.defineProperty(a,this.expando,{value:c,writable:!0,configurable:!0}),a[this.expando]},cache:function(a){if(!L(a))return{};var b=a[this.expando];return b||(b={},L(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[b]=c;else for(d in b)e[d]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=a[this.expando];if(void 0!==f){if(void 0===b)this.register(a);else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in f?d=[b,e]:(d=e,d=d in f?[d]:d.match(G)||[])),c=d.length;while(c--)delete f[d[c]]}(void 0===b||n.isEmptyObject(f))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!n.isEmptyObject(b)}};var N=new M,O=new M,P=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Q=/[A-Z]/g;function R(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Q,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){
    try{c="true"===c||"false"!==c&&("null"===c?null:+c+""===c?+c:P.test(c)?n.parseJSON(c):c)}catch(e){}O.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return O.hasData(a)||N.hasData(a)},data:function(a,b,c){return O.access(a,b,c)},removeData:function(a,b){O.remove(a,b)},_data:function(a,b,c){return N.access(a,b,c)},_removeData:function(a,b){N.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=O.get(f),1===f.nodeType&&!N.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),R(f,d,e[d])));N.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){O.set(this,a)}):K(this,function(b){var c,d;if(f&&void 0===b){if(c=O.get(f,a)||O.get(f,a.replace(Q,"-$&").toLowerCase()),void 0!==c)return c;if(d=n.camelCase(a),c=O.get(f,d),void 0!==c)return c;if(c=R(f,d,void 0),void 0!==c)return c}else d=n.camelCase(a),this.each(function(){var c=O.get(this,d);O.set(this,d,b),a.indexOf("-")>-1&&void 0!==c&&O.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){O.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;if(a)return b=(b||"fx")+"queue",d=N.get(a,b),c&&(!d||n.isArray(c)?d=N.access(a,b,n.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return N.get(a,c)||N.access(a,c,{empty:n.Callbacks("once memory").add(function(){N.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=N.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),U=["Top","Right","Bottom","Left"],V=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)};function W(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return n.css(a,b,"")},i=h(),j=c&&c[3]||(n.cssNumber[b]?"":"px"),k=(n.cssNumber[b]||"px"!==j&&+i)&&T.exec(n.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,n.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var X=/^(?:checkbox|radio)$/i,Y=/<([\w:-]+)/,Z=/^$|\/(?:java|ecma)script/i,$={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};$.optgroup=$.option,$.tbody=$.tfoot=$.colgroup=$.caption=$.thead,$.th=$.td;function _(a,b){var c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function aa(a,b){for(var c=0,d=a.length;c<d;c++)N.set(a[c],"globalEval",!b||N.get(b[c],"globalEval"))}var ba=/<|&#?\w+;/;function ca(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],o=0,p=a.length;o<p;o++)if(f=a[o],f||0===f)if("object"===n.type(f))n.merge(m,f.nodeType?[f]:f);else if(ba.test(f)){g=g||l.appendChild(b.createElement("div")),h=(Y.exec(f)||["",""])[1].toLowerCase(),i=$[h]||$._default,g.innerHTML=i[1]+n.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;n.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",o=0;while(f=m[o++])if(d&&n.inArray(f,d)>-1)e&&e.push(f);else if(j=n.contains(f.ownerDocument,f),g=_(l.appendChild(f),"script"),j&&aa(g),c){k=0;while(f=g[k++])Z.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),l.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",l.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var da=/^key/,ea=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,fa=/^([^.]*)(?:\.(.+)|)/;function ga(){return!0}function ha(){return!1}function ia(){try{return d.activeElement}catch(a){}}function ja(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)ja(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=ha;else if(!e)return a;return 1===f&&(g=e,e=function(a){return n().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=n.guid++)),a.each(function(){n.event.add(this,b,e,d,c)})}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return"undefined"!=typeof n&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(G)||[""],j=b.length;while(j--)h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.hasData(a)&&N.get(a);if(r&&(i=r.events)){b=(b||"").match(G)||[""],j=b.length;while(j--)if(h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&N.remove(a,"handle events")}},dispatch:function(a){a=n.event.fix(a);var b,c,d,f,g,h=[],i=e.call(arguments),j=(N.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())a.rnamespace&&!a.rnamespace.test(g.namespace)||(a.handleObj=g,a.data=g.data,d=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==d&&(a.result=d)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&("click"!==a.type||isNaN(a.button)||a.button<1))for(;i!==this;i=i.parentNode||this)if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(d=[],c=0;c<h;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>-1:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,e,f,g=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||d,e=c.documentElement,f=c.body,a.pageX=b.clientX+(e&&e.scrollLeft||f&&f.scrollLeft||0)-(e&&e.clientLeft||f&&f.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||f&&f.scrollTop||0)-(e&&e.clientTop||f&&f.clientTop||0)),a.which||void 0===g||(a.which=1&g?1:2&g?3:4&g?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,e,f=a.type,g=a,h=this.fixHooks[f];h||(this.fixHooks[f]=h=ea.test(f)?this.mouseHooks:da.test(f)?this.keyHooks:{}),e=h.props?this.props.concat(h.props):this.props,a=new n.Event(g),b=e.length;while(b--)c=e[b],a[c]=g[c];return a.target||(a.target=d),3===a.target.nodeType&&(a.target=a.target.parentNode),h.filter?h.filter(a,g):a},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==ia()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===ia()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if("checkbox"===this.type&&this.click&&n.nodeName(this,"input"))return this.click(),!1},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ga:ha):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={constructor:n.Event,isDefaultPrevented:ha,isPropagationStopped:ha,isImmediatePropagationStopped:ha,isSimulated:!1,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ga,a&&!this.isSimulated&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ga,a&&!this.isSimulated&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ga,a&&!this.isSimulated&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||n.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),n.fn.extend({on:function(a,b,c,d){return ja(this,a,b,c,d)},one:function(a,b,c,d){return ja(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=ha),this.each(function(){n.event.remove(this,a,c,b)})}});var ka=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,la=/<script|<style|<link/i,ma=/checked\s*(?:[^=]|=\s*.checked.)/i,na=/^true\/(.*)/,oa=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function pa(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function qa(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function ra(a){var b=na.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function sa(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(N.hasData(a)&&(f=N.access(a),g=N.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;c<d;c++)n.event.add(b,e,j[e][c])}O.hasData(a)&&(h=O.access(a),i=n.extend({},h),O.set(b,i))}}function ta(a,b){var c=b.nodeName.toLowerCase();"input"===c&&X.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function ua(a,b,c,d){b=f.apply([],b);var e,g,h,i,j,k,m=0,o=a.length,p=o-1,q=b[0],r=n.isFunction(q);if(r||o>1&&"string"==typeof q&&!l.checkClone&&ma.test(q))return a.each(function(e){var f=a.eq(e);r&&(b[0]=q.call(this,e,f.html())),ua(f,b,c,d)});if(o&&(e=ca(b,a[0].ownerDocument,!1,a,d),g=e.firstChild,1===e.childNodes.length&&(e=g),g||d)){for(h=n.map(_(e,"script"),qa),i=h.length;m<o;m++)j=e,m!==p&&(j=n.clone(j,!0,!0),i&&n.merge(h,_(j,"script"))),c.call(a[m],j,m);if(i)for(k=h[h.length-1].ownerDocument,n.map(h,ra),m=0;m<i;m++)j=h[m],Z.test(j.type||"")&&!N.access(j,"globalEval")&&n.contains(k,j)&&(j.src?n._evalUrl&&n._evalUrl(j.src):n.globalEval(j.textContent.replace(oa,"")))}return a}function va(a,b,c){for(var d,e=b?n.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||n.cleanData(_(d)),d.parentNode&&(c&&n.contains(d.ownerDocument,d)&&aa(_(d,"script")),d.parentNode.removeChild(d));return a}n.extend({htmlPrefilter:function(a){return a.replace(ka,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(l.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=_(h),f=_(a),d=0,e=f.length;d<e;d++)ta(f[d],g[d]);if(b)if(c)for(f=f||_(a),g=g||_(h),d=0,e=f.length;d<e;d++)sa(f[d],g[d]);else sa(a,h);return g=_(h,"script"),g.length>0&&aa(g,!i&&_(a,"script")),h},cleanData:function(a){for(var b,c,d,e=n.event.special,f=0;void 0!==(c=a[f]);f++)if(L(c)){if(b=c[N.expando]){if(b.events)for(d in b.events)e[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);c[N.expando]=void 0}c[O.expando]&&(c[O.expando]=void 0)}}}),n.fn.extend({domManip:ua,detach:function(a){return va(this,a,!0)},remove:function(a){return va(this,a)},text:function(a){return K(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.appendChild(a)}})},prepend:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(_(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null!=a&&a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return K(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!la.test(a)&&!$[(Y.exec(a)||["",""])[1].toLowerCase()]){a=n.htmlPrefilter(a);try{for(;c<d;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(_(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return ua(this,arguments,function(b){var c=this.parentNode;n.inArray(this,a)<0&&(n.cleanData(_(this)),c&&c.replaceChild(b,this))},a)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),f=e.length-1,h=0;h<=f;h++)c=h===f?this:this.clone(!0),n(e[h])[b](c),g.apply(d,c.get());return this.pushStack(d)}});var wa,xa={HTML:"block",BODY:"block"};function ya(a,b){var c=n(b.createElement(a)).appendTo(b.body),d=n.css(c[0],"display");return c.detach(),d}function za(a){var b=d,c=xa[a];return c||(c=ya(a,b),"none"!==c&&c||(wa=(wa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=wa[0].contentDocument,b.write(),b.close(),c=ya(a,b),wa.detach()),xa[a]=c),c}var Aa=/^margin/,Ba=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ca=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)},Da=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e},Ea=d.documentElement;!function(){var b,c,e,f,g=d.createElement("div"),h=d.createElement("div");function i(){h.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",h.innerHTML="",Ea.appendChild(g);var d=a.getComputedStyle(h);b="1%"!==d.top,f="2px"===d.marginLeft,c="4px"===d.width,h.style.marginRight="50%",e="4px"===d.marginRight,Ea.removeChild(g)}h.style&&(h.style.backgroundClip="content-box",h.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle="content-box"===h.style.backgroundClip,g.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",g.appendChild(h),n.extend(l,{pixelPosition:function(){return i(),b},boxSizingReliable:function(){return null==c&&i(),c},pixelMarginRight:function(){return null==c&&i(),e},reliableMarginLeft:function(){return null==c&&i(),f},reliableMarginRight:function(){var b,c=h.appendChild(d.createElement("div"));return c.style.cssText=h.style.cssText="-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",h.style.width="1px",Ea.appendChild(g),b=!parseFloat(a.getComputedStyle(c).marginRight),Ea.removeChild(g),h.removeChild(c),b}}))}();function Fa(a,b,c){var d,e,f,g,h=a.style;return c=c||Ca(a),g=c?c.getPropertyValue(b)||c[b]:void 0,""!==g&&void 0!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),c&&!l.pixelMarginRight()&&Ba.test(g)&&Aa.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f),void 0!==g?g+"":g}function Ga(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Ha=/^(none|table(?!-c[ea]).+)/,Ia={position:"absolute",visibility:"hidden",display:"block"},Ja={letterSpacing:"0",fontWeight:"400"},Ka=["Webkit","O","Moz","ms"],La=d.createElement("div").style;function Ma(a){if(a in La)return a;var b=a[0].toUpperCase()+a.slice(1),c=Ka.length;while(c--)if(a=Ka[c]+b,a in La)return a}function Na(a,b,c){var d=T.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Oa(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;f<4;f+=2)"margin"===c&&(g+=n.css(a,c+U[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+U[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+U[f]+"Width",!0,e))):(g+=n.css(a,"padding"+U[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+U[f]+"Width",!0,e)));return g}function Pa(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=Ca(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(e<=0||null==e){if(e=Fa(a,b,f),(e<0||null==e)&&(e=a.style[b]),Ba.test(e))return e;d=g&&(l.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Oa(a,b,c||(g?"border":"content"),d,f)+"px"}function Qa(a,b){for(var c,d,e,f=[],g=0,h=a.length;g<h;g++)d=a[g],d.style&&(f[g]=N.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&V(d)&&(f[g]=N.access(d,"olddisplay",za(d.nodeName)))):(e=V(d),"none"===c&&e||N.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;g<h;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Fa(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=T.exec(c))&&e[1]&&(c=W(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(n.cssNumber[h]?"":"px")),l.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Fa(a,b,d)),"normal"===e&&b in Ja&&(e=Ja[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){if(c)return Ha.test(n.css(a,"display"))&&0===a.offsetWidth?Da(a,Ia,function(){return Pa(a,b,d)}):Pa(a,b,d)},set:function(a,c,d){var e,f=d&&Ca(a),g=d&&Oa(a,b,d,"border-box"===n.css(a,"boxSizing",!1,f),f);return g&&(e=T.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=n.css(a,b)),Na(a,c,g)}}}),n.cssHooks.marginLeft=Ga(l.reliableMarginLeft,function(a,b){if(b)return(parseFloat(Fa(a,"marginLeft"))||a.getBoundingClientRect().left-Da(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px"}),n.cssHooks.marginRight=Ga(l.reliableMarginRight,function(a,b){if(b)return Da(a,{display:"inline-block"},Fa,[a,"marginRight"])}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];d<4;d++)e[a+U[d]+b]=f[d]||f[d-2]||f[0];return e}},Aa.test(a)||(n.cssHooks[a+b].set=Na)}),n.fn.extend({css:function(a,b){return K(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=Ca(a),e=b.length;g<e;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Qa(this,!0)},hide:function(){return Qa(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){V(this)?n(this).show():n(this).hide()})}});function Ra(a,b,c,d,e){return new Ra.prototype.init(a,b,c,d,e)}n.Tween=Ra,Ra.prototype={constructor:Ra,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||n.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ra.propHooks[this.prop];return a&&a.get?a.get(this):Ra.propHooks._default.get(this)},run:function(a){var b,c=Ra.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ra.propHooks._default.set(this),this}},Ra.prototype.init.prototype=Ra.prototype,Ra.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[n.cssProps[a.prop]]&&!n.cssHooks[a.prop]?a.elem[a.prop]=a.now:n.style(a.elem,a.prop,a.now+a.unit)}}},Ra.propHooks.scrollTop=Ra.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},n.fx=Ra.prototype.init,n.fx.step={};var Sa,Ta,Ua=/^(?:toggle|show|hide)$/,Va=/queueHooks$/;function Wa(){return a.setTimeout(function(){Sa=void 0}),Sa=n.now()}function Xa(a,b){var c,d=0,e={height:a};for(b=b?1:0;d<4;d+=2-b)c=U[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ya(a,b,c){for(var d,e=(_a.tweeners[b]||[]).concat(_a.tweeners["*"]),f=0,g=e.length;f<g;f++)if(d=e[f].call(c,b,a))return d}function Za(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&V(a),q=N.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?N.get(a,"olddisplay")||za(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Ua.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?za(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=N.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;N.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ya(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function $a(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function _a(a,b,c){var d,e,f=0,g=_a.prefilters.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Sa||Wa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;g<i;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),f<1&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},c),originalProperties:b,originalOptions:c,startTime:Sa||Wa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;c<d;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for($a(k,j.opts.specialEasing);f<g;f++)if(d=_a.prefilters[f].call(j,a,k,j.opts))return n.isFunction(d.stop)&&(n._queueHooks(j.elem,j.opts.queue).stop=n.proxy(d.stop,d)),d;return n.map(k,Ya,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(_a,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return W(c.elem,a,T.exec(b),c),c}]},tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.match(G);for(var c,d=0,e=a.length;d<e;d++)c=a[d],_a.tweeners[c]=_a.tweeners[c]||[],_a.tweeners[c].unshift(b)},prefilters:[Za],prefilter:function(a,b){b?_a.prefilters.unshift(a):_a.prefilters.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(V).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=_a(this,n.extend({},a),f);(e||N.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=N.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Va.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=N.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;b<g;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Xa(b,!0),a,d,e)}}),n.each({slideDown:Xa("show"),slideUp:Xa("hide"),slideToggle:Xa("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Sa=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Sa=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ta||(Ta=a.setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){a.clearInterval(Ta),Ta=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(b,c){return b=n.fx?n.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",l.checkOn=""!==a.value,l.optSelected=c.selected,b.disabled=!0,l.optDisabled=!c.disabled,a=d.createElement("input"),a.value="t",a.type="radio",l.radioValue="t"===a.value}();var ab,bb=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return K(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),e=n.attrHooks[b]||(n.expr.match.bool.test(b)?ab:void 0)),void 0!==c?null===c?void n.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=n.find.attr(a,b),null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!l.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(G);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)}}),ab={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=bb[b]||n.find.attr;bb[b]=function(a,b,d){var e,f;return d||(f=bb[b],bb[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,bb[b]=f),e}});var cb=/^(?:input|select|textarea|button)$/i,db=/^(?:a|area)$/i;n.fn.extend({prop:function(a,b){return K(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&n.isXMLDoc(a)||(b=n.propFix[b]||b,
        e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=n.find.attr(a,"tabindex");return b?parseInt(b,10):cb.test(a.nodeName)||db.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),l.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var eb=/[\t\r\n\f]/g;function fb(a){return a.getAttribute&&a.getAttribute("class")||""}n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,fb(this)))});if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,fb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):n.isFunction(a)?this.each(function(c){n(this).toggleClass(a.call(this,c,fb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=n(this),f=a.match(G)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=fb(this),b&&N.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":N.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+fb(c)+" ").replace(eb," ").indexOf(b)>-1)return!0;return!1}});var gb=/\r/g,hb=/[\x20\t\r\n\f]+/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(gb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a)).replace(hb," ")}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||e<0,g=f?null:[],h=f?e+1:d.length,i=e<0?h:f?e:0;i<h;i++)if(c=d[i],(c.selected||i===e)&&(l.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentNode.disabled||!n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(n.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){if(n.isArray(b))return a.checked=n.inArray(n(a).val(),b)>-1}},l.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var ib=/^(?:focusinfocus|focusoutblur)$/;n.extend(n.event,{trigger:function(b,c,e,f){var g,h,i,j,l,m,o,p=[e||d],q=k.call(b,"type")?b.type:b,r=k.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!ib.test(q+n.event.triggered)&&(q.indexOf(".")>-1&&(r=q.split("."),q=r.shift(),r.sort()),l=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=r.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},f||!o.trigger||o.trigger.apply(e,c)!==!1)){if(!f&&!o.noBubble&&!n.isWindow(e)){for(j=o.delegateType||q,ib.test(j+q)||(h=h.parentNode);h;h=h.parentNode)p.push(h),i=h;i===(e.ownerDocument||d)&&p.push(i.defaultView||i.parentWindow||a)}g=0;while((h=p[g++])&&!b.isPropagationStopped())b.type=g>1?j:o.bindType||q,m=(N.get(h,"events")||{})[b.type]&&N.get(h,"handle"),m&&m.apply(h,c),m=l&&h[l],m&&m.apply&&L(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=q,f||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!L(e)||l&&n.isFunction(e[q])&&!n.isWindow(e)&&(i=e[l],i&&(e[l]=null),n.event.triggered=q,e[q](),n.event.triggered=void 0,i&&(e[l]=i)),b.result}},simulate:function(a,b,c){var d=n.extend(new n.Event,c,{type:a,isSimulated:!0});n.event.trigger(d,null,b)}}),n.fn.extend({trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];if(c)return n.event.trigger(a,b,c,!0)}}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),l.focusin="onfocusin"in a,l.focusin||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a))};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=N.access(d,b);e||d.addEventListener(a,c,!0),N.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=N.access(d,b)-1;e?N.access(d,b,e):(d.removeEventListener(a,c,!0),N.remove(d,b))}}});var jb=a.location,kb=n.now(),lb=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||n.error("Invalid XML: "+b),c};var mb=/#.*$/,nb=/([?&])_=[^&]*/,ob=/^(.*?):[ \t]*([^\r\n]*)$/gm,pb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,qb=/^(?:GET|HEAD)$/,rb=/^\/\//,sb={},tb={},ub="*/".concat("*"),vb=d.createElement("a");vb.href=jb.href;function wb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(G)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function xb(a,b,c,d){var e={},f=a===tb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function yb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function zb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}if(f)return f!==i[0]&&i.unshift(f),c[f]}function Ab(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:jb.href,type:"GET",isLocal:pb.test(jb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":ub,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?yb(yb(a,n.ajaxSettings),b):yb(n.ajaxSettings,a)},ajaxPrefilter:wb(sb),ajaxTransport:wb(tb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m=n.ajaxSetup({},c),o=m.context||m,p=m.context&&(o.nodeType||o.jquery)?n(o):n.event,q=n.Deferred(),r=n.Callbacks("once memory"),s=m.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,getResponseHeader:function(a){var b;if(2===v){if(!h){h={};while(b=ob.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===v?g:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return v||(a=u[c]=u[c]||a,t[a]=b),this},overrideMimeType:function(a){return v||(m.mimeType=a),this},statusCode:function(a){var b;if(a)if(v<2)for(b in a)s[b]=[s[b],a[b]];else x.always(a[x.status]);return this},abort:function(a){var b=a||w;return e&&e.abort(b),z(0,b),this}};if(q.promise(x).complete=r.add,x.success=x.done,x.error=x.fail,m.url=((b||m.url||jb.href)+"").replace(mb,"").replace(rb,jb.protocol+"//"),m.type=c.method||c.type||m.method||m.type,m.dataTypes=n.trim(m.dataType||"*").toLowerCase().match(G)||[""],null==m.crossDomain){j=d.createElement("a");try{j.href=m.url,j.href=j.href,m.crossDomain=vb.protocol+"//"+vb.host!=j.protocol+"//"+j.host}catch(y){m.crossDomain=!0}}if(m.data&&m.processData&&"string"!=typeof m.data&&(m.data=n.param(m.data,m.traditional)),xb(sb,m,c,x),2===v)return x;k=n.event&&m.global,k&&0===n.active++&&n.event.trigger("ajaxStart"),m.type=m.type.toUpperCase(),m.hasContent=!qb.test(m.type),f=m.url,m.hasContent||(m.data&&(f=m.url+=(lb.test(f)?"&":"?")+m.data,delete m.data),m.cache===!1&&(m.url=nb.test(f)?f.replace(nb,"$1_="+kb++):f+(lb.test(f)?"&":"?")+"_="+kb++)),m.ifModified&&(n.lastModified[f]&&x.setRequestHeader("If-Modified-Since",n.lastModified[f]),n.etag[f]&&x.setRequestHeader("If-None-Match",n.etag[f])),(m.data&&m.hasContent&&m.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",m.contentType),x.setRequestHeader("Accept",m.dataTypes[0]&&m.accepts[m.dataTypes[0]]?m.accepts[m.dataTypes[0]]+("*"!==m.dataTypes[0]?", "+ub+"; q=0.01":""):m.accepts["*"]);for(l in m.headers)x.setRequestHeader(l,m.headers[l]);if(m.beforeSend&&(m.beforeSend.call(o,x,m)===!1||2===v))return x.abort();w="abort";for(l in{success:1,error:1,complete:1})x[l](m[l]);if(e=xb(tb,m,c,x)){if(x.readyState=1,k&&p.trigger("ajaxSend",[x,m]),2===v)return x;m.async&&m.timeout>0&&(i=a.setTimeout(function(){x.abort("timeout")},m.timeout));try{v=1,e.send(t,z)}catch(y){if(!(v<2))throw y;z(-1,y)}}else z(-1,"No Transport");function z(b,c,d,h){var j,l,t,u,w,y=c;2!==v&&(v=2,i&&a.clearTimeout(i),e=void 0,g=h||"",x.readyState=b>0?4:0,j=b>=200&&b<300||304===b,d&&(u=zb(m,x,d)),u=Ab(m,u,x,j),j?(m.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(n.lastModified[f]=w),w=x.getResponseHeader("etag"),w&&(n.etag[f]=w)),204===b||"HEAD"===m.type?y="nocontent":304===b?y="notmodified":(y=u.state,l=u.data,t=u.error,j=!t)):(t=y,!b&&y||(y="error",b<0&&(b=0))),x.status=b,x.statusText=(c||y)+"",j?q.resolveWith(o,[l,y,x]):q.rejectWith(o,[x,y,t]),x.statusCode(s),s=void 0,k&&p.trigger(j?"ajaxSuccess":"ajaxError",[x,m,j?l:t]),r.fireWith(o,[x,y]),k&&(p.trigger("ajaxComplete",[x,m]),--n.active||n.event.trigger("ajaxStop")))}return x},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax(n.extend({url:a,type:b,dataType:e,data:c,success:d},n.isPlainObject(a)&&a))}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return n.isFunction(a)?this.each(function(b){n(this).wrapInner(a.call(this,b))}):this.each(function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return!n.expr.filters.visible(a)},n.expr.filters.visible=function(a){return a.offsetWidth>0||a.offsetHeight>0||a.getClientRects().length>0};var Bb=/%20/g,Cb=/\[\]$/,Db=/\r?\n/g,Eb=/^(?:submit|button|image|reset|file)$/i,Fb=/^(?:input|select|textarea|keygen)/i;function Gb(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||Cb.test(a)?d(a,e):Gb(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Gb(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Gb(c,a[c],b,e);return d.join("&").replace(Bb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Fb.test(this.nodeName)&&!Eb.test(a)&&(this.checked||!X.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(Db,"\r\n")}}):{name:b.name,value:c.replace(Db,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Hb={0:200,1223:204},Ib=n.ajaxSettings.xhr();l.cors=!!Ib&&"withCredentials"in Ib,l.ajax=Ib=!!Ib,n.ajaxTransport(function(b){var c,d;if(l.cors||Ib&&!b.crossDomain)return{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Hb[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=n("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Jb=[],Kb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Jb.pop()||n.expando+"_"+kb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Kb.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Kb.test(b.data)&&"data");if(h||"jsonp"===b.dataTypes[0])return e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Kb,"$1"+e):b.jsonp!==!1&&(b.url+=(lb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?n(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Jb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||d;var e=x.exec(a),f=!c&&[];return e?[b.createElement(e[1])]:(e=ca([a],b,f),f&&f.length&&n(f).remove(),n.merge([],e.childNodes))};var Lb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Lb)return Lb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(this,f||[a.responseText,b,a])})}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};function Mb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,n.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(e=d.getBoundingClientRect(),c=Mb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ea})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;n.fn[a]=function(d){return K(this,function(a,d,e){var f=Mb(a);return void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=Ga(l.pixelPosition,function(a,c){if(c)return c=Fa(a,b),Ba.test(c)?n(a).position()[b]+"px":c})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return K(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)},size:function(){return this.length}}),n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Nb=a.jQuery,Ob=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Ob),b&&a.jQuery===n&&(a.jQuery=Nb),n},b||(a.jQuery=a.$=n),n});

