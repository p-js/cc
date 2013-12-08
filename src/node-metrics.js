/*
	captionator.getNodeMetrics(DOMNode)

	Calculates and returns a number of sizing and position metrics from a DOMNode of any variety (though this function is intended
	to be used with HTMLVideoElements.) Returns the height of the default controls on a video based on user agent detection
	(As far as I know, there's no way to dynamically calculate the height of browser UI controls on a video.)

	First parameter: DOMNode from which to calculate sizing metrics. This parameter is mandatory.

	RETURNS:

	An object with the following properties:
		left: The calculated left offset of the node
		top: The calculated top offset of the node
		height: The calculated height of the node
		width: The calculated with of the node
		controlHeight: If the node is a video and has the `controls` attribute present, the height of the UI controls for the video. Otherwise, zero.
*/
captionator.getNodeMetrics = function(DOMNode) {
	var nodeComputedStyle = window.getComputedStyle(DOMNode, null);
	var offsetObject = DOMNode;
	var offsetTop = DOMNode.offsetTop,
		offsetLeft = DOMNode.offsetLeft;
	var width = DOMNode,
		height = 0;
	var controlHeight = 0;

	width = parseInt(nodeComputedStyle.getPropertyValue("width"), 10);
	height = parseInt(nodeComputedStyle.getPropertyValue("height"), 10);

	// Slightly verbose expression in order to pass JSHint
	while ( !! (offsetObject = offsetObject.offsetParent)) {
		offsetTop += offsetObject.offsetTop;
		offsetLeft += offsetObject.offsetLeft;
	}

	if (DOMNode.hasAttribute("controls")) {
		// Get heights of default control strip in various browsers
		// There could be a way to measure this live but I haven't thought/heard of it yet...
		var UA = navigator.userAgent.toLowerCase();
		if (UA.indexOf("chrome") !== -1) {
			controlHeight = 32;
		} else if (UA.indexOf("opera") !== -1) {
			controlHeight = 25;
		} else if (UA.indexOf("firefox") !== -1) {
			controlHeight = 28;
		} else if (UA.indexOf("ie 9") !== -1 || UA.indexOf("ipad") !== -1) {
			controlHeight = 44;
		} else if (UA.indexOf("safari") !== -1) {
			controlHeight = 25;
		}
	} else if (DOMNode._captionatorOptions) {
		var tmpCaptionatorOptions = DOMNode._captionatorOptions;
		if (tmpCaptionatorOptions.controlHeight) {
			controlHeight = parseInt(tmpCaptionatorOptions.controlHeight, 10);
		}
	}

	return {
		left: offsetLeft,
		top: offsetTop,
		width: width,
		height: height,
		controlHeight: controlHeight
	};
};