/* global mtvnStyles */
captionator.updateSpanStyles = function($container) {
	var styles = $.extend({}, mtvnStyles.containerCSS);
	delete styles.fontSize;
	delete styles.fontFamily;
	styles.padding = "2px 9px 4px 10px";
	$.each($container.find('.mtvn-cue'), function(key, cue) {
		$(cue).css(styles);
	});
	styles = $.extend({}, mtvnStyles.textCSS);
	delete styles.fontSize;
	delete styles.fontFamily;
	$.each($container.find('.mtvn-cue-text'), function(key, cue) {
		$(cue).css(styles);
	});
};