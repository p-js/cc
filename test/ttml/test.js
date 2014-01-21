/* global captionator, $ */
/* exported TestCaptions */
var TestCaptions = function(el, containerEl) {
    $(containerEl).css({
        pointerEvents: "none"
    });
    el._containerObject = containerEl;
    el._trackConfig = {
        src: "../ttml3.xml"
    };
    captionator.mtvnCaptionify(el);
};