/* global captionator*/
/* exported TestCaptions */
var TestCaptions = function(el) {
	el._trackConfig = {
		src: "../test.xml"
	};
	el.vtt = true;
	captionator.mtvnCaptionify(el);
};