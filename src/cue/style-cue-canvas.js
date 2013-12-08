/*
	captionator.styleCueCanvas(VideoNode)

	Styles and positions a canvas (not a <canvas> object - just a div) for displaying cues on a video.
	If the HTMLVideoElement in question does not have a canvas, one is created for it.

	First parameter: The HTMLVideoElement for which the cue canvas will be styled/created. This parameter is mandatory.

	RETURNS:

	Nothing.
*/
captionator.styleCueCanvas = function(videoElement) {

	var baseFontSize,
		baseLineHeight,
		containerObject,
		$container,
		containerID;

	if (videoElement._containerObject) {
		containerObject = videoElement._containerObject;
		$container = $(containerObject);
		containerID = containerObject.id;
	}

	// Set up the cue canvas
	var videoMetrics = captionator.getNodeMetrics(videoElement);
	baseFontSize = ((videoMetrics.height * (fontSizeVerticalPercentage / 100)) / 96) * 72;
	baseFontSize = baseFontSize >= minimumFontSize ? baseFontSize : minimumFontSize;
	baseLineHeight = Math.floor(parseFloat(baseFontSize, 10) * lineHeightRatio);
	baseLineHeight = baseLineHeight > minimumLineHeight ? baseLineHeight : minimumLineHeight;
	$container.css({
		"-webkit-transition": "-webkit-transform 0.5s ease",
		position: "absolute",
		overflow: "hidden",
		// fill the screen, since we're in an iframe or a container div.
		width: "100%",
		height: "100%",
		top: 0,
		left: 0,
		color: mtvnStyles.fontColor,
		fontFamily: mtvnStyles.fontFamily,
		fontSize: baseFontSize + "pt",
		boxSizing: "border-box"
	});
	$container.find(".captionator-cue").css({
		lineHeight: baseLineHeight + "pt"
	});
	captionator.updateSpanStyles($container);
};