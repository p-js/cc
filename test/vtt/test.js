/* global captionator*/
/* exported TestCaptions */
var TestCaptions = function(el) {
	el._trackConfig = {
		src: "../ttml3.xml"
	};
	el.vtt = true;
	captionator.mtvnCaptionify(el);
};