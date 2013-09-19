/*
		captionator.styleCueCanvas(VideoNode)

		Styles and positions a canvas (not a <canvas> object - just a div) for displaying cues on a video.
		If the HTMLVideoElement in question does not have a canvas, one is created for it.

		First parameter: The HTMLVideoElement for which the cue canvas will be styled/created. This parameter is mandatory.

		RETURNS:

		Nothing.

	*/
captionator.styleCueCanvas = function(videoElement) {
	var baseFontSize, baseLineHeight;
	var containerObject, descriptionContainerObject;
	var containerID, descriptionContainerID;
	var options = videoElement._captionatorOptions instanceof Object ? videoElement._captionatorOptions : {};

	// mtvn remove video element check.
	//if (!(videoElement instanceof HTMLVideoElement)) {
	//throw new Error("Cannot style a cue canvas for a non-video node!");
	//}

	if (videoElement._containerObject) {
		containerObject = videoElement._containerObject;
		containerID = containerObject.id;
	}

	if (videoElement._descriptionContainerObject) {
		descriptionContainerObject = videoElement._descriptionContainerObject;
		descriptionContainerID = descriptionContainerObject.id;
	}

	if (!descriptionContainerObject) {
		// Contain hidden descriptive captions
		descriptionContainerObject = document.createElement("div");
		descriptionContainerObject.className = "captionator-cue-descriptive-container";
		descriptionContainerID = captionator.generateID();
		descriptionContainerObject.id = descriptionContainerID;
		videoElement._descriptionContainerObject = descriptionContainerObject;

		// ARIA LIVE for descriptive text
		descriptionContainerObject.setAttribute("aria-live", "polite");
		descriptionContainerObject.setAttribute("aria-atomic", "true");
		descriptionContainerObject.setAttribute("role", "region");

		// Stick it in the body
		document.body.appendChild(descriptionContainerObject);

		// Hide the descriptive canvas...
		captionator.applyStyles(descriptionContainerObject, {
			"position": "absolute",
			"overflow": "hidden",
			"width": "1px",
			"height": "1px",
			"opacity": "0",
			"textIndent": "-999em"
		});
	} else if (!descriptionContainerObject.parentNode) {
		document.body.appendChild(descriptionContainerObject);
	}

	if (!containerObject) {
		// visually display captions
		containerObject = document.createElement("div");
		containerObject.className = "captionator-cue-canvas";
		containerID = captionator.generateID();
		containerObject.id = containerID;

		// We can choose to append the canvas to an element other than the body.
		// If this option is specified, we no longer use the offsetTop/offsetLeft of the video
		// to define the position, we just inherit it.
		//
		// options.appendCueCanvasTo can be an HTMLElement, or a DOM query.
		// If the query fails, the canvas will be appended to the body as normal.
		// If the query is successful, the canvas will be appended to the first matched element.

		if (options.appendCueCanvasTo) {
			var canvasParentNode = null;

			if (options.appendCueCanvasTo instanceof HTMLElement) {
				canvasParentNode = options.appendCueCanvasTo;
			} else if (typeof(options.appendCueCanvasTo) === "string") {
				try {
					var canvasSearchResult = document.querySelectorAll(options.appendCueCanvasTo);
					if (canvasSearchResult.length > 0) {
						canvasParentNode = canvasSearchResult[0];
					} else {
						throw null; /* Bounce to catch */
					}
				} catch (error) {
					canvasParentNode = document.body;
					options.appendCueCanvasTo = false;
				}
			} else {
				canvasParentNode = document.body;
				options.appendCueCanvasTo = false;
			}

			canvasParentNode.appendChild(containerObject);
		} else {
			document.body.appendChild(containerObject);
		}

		videoElement._containerObject = containerObject;

		// No aria live, as descriptions aren't placed in this container.
		// containerObject.setAttribute("role","region");

	} else if (!containerObject.parentNode) {
		document.body.appendChild(containerObject);
	}

	// Set up the cue canvas
	var videoMetrics = captionator.getNodeMetrics(videoElement);

	// Set up font metrics
	baseFontSize = ((videoMetrics.height * (fontSizeVerticalPercentage / 100)) / 96) * 72;
	baseFontSize = baseFontSize >= minimumFontSize ? baseFontSize : minimumFontSize;
	baseLineHeight = Math.floor(baseFontSize * lineHeightRatio);
	baseLineHeight = baseLineHeight > minimumLineHeight ? baseLineHeight : minimumLineHeight;

	// Style node!
	captionator.applyStyles(containerObject, {
		"position": "absolute",
		"overflow": "hidden",
		"zIndex": 100,
		width: "100%",
		height: "100%",
		"-webkit-transition": "-webkit-transform 0.5s ease",
		//"height": (videoMetrics.height - videoMetrics.controlHeight) + "px",
		//"width": videoMetrics.width + "px",
		"top": (options.appendCueCanvasTo ? 0 : videoMetrics.top) + "px",
		"left": (options.appendCueCanvasTo ? 0 : videoMetrics.left) + "px",
		"color": "white",
		"fontFamily": "Verdana, Helvetica, Arial, sans-serif",
		"fontSize": baseFontSize + "pt",
		"lineHeight": baseLineHeight + "pt",
		"boxSizing": "border-box"
	});
};