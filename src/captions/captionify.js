/*
		captionator.captionify([selector string array | DOMElement array | selector string | singular dom element ],
								[defaultLanguage - string in BCP47],
								[options - JS Object])

		Adds closed captions to video elements. The first, second and third parameter are both optional.

		First parameter: Use an array of either DOMElements or selector strings (compatible with querySelectorAll.)
		All of these elements will be captioned if tracks are available. If this parameter is omitted, all video elements
		present in the DOM will be captioned if tracks are available.

		Second parameter: BCP-47 string for default language. If this parameter is omitted, the User Agent's language
		will be used to choose a track.

		Third parameter: as yet unused - will implement animation settings and some other global options with this
		parameter later.


		RETURNS:

		False on immediate failure due to input being malformed, otherwise true (even if the process fails later.)
		Because of the asynchronous download requirements, this function can't really return anything meaningful.


	*/
captionator.captionify = function(videoElement, defaultLanguage, options) {
	options = options ? options : {};
	// Override defaults if options are present...
	if (options.minimumFontSize && typeof(options.minimumFontSize) === "number") {
		minimumFontSize = options.minimumFontSize;
	}

	if (options.minimumLineHeight && typeof(options.minimumLineHeight) === "number") {
		minimumLineHeight = options.minimumLineHeight;
	}

	if (options.fontSizeVerticalPercentage && typeof(options.fontSizeVerticalPercentage) === "number") {
		fontSizeVerticalPercentage = options.fontSizeVerticalPercentage;
	}

	if (options.lineHeightRatio && typeof(options.lineHeightRatio) !== "number") {
		lineHeightRatio = options.lineHeightRatio;
	}

	captionator.addTextTrack = function(id, kind, label, language, src, type, isDefault) {
		var newTrack;
		id = typeof(id) === "string" ? id : "";
		label = typeof(label) === "string" ? label : "";
		language = typeof(language) === "string" ? language : "";
		isDefault = typeof(isDefault) === "boolean" ? isDefault : false; // Is this track set as the default?
		newTrack = new captionator.TextTrack(id, kind, label, language, src, null);
		if (newTrack) {
			if (!(videoElement._textTracks instanceof Array)) {
				videoElement._textTracks = [];
			}
			videoElement._textTracks.push(newTrack);
			return newTrack;
		} else {
			return false;
		}
	};
	captionator.processVideoElement(videoElement, options);
};