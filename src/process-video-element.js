/*
	captionator.processVideoElement(videoElement <HTMLVideoElement>,
							[options - JS Object])

	Processes track items within an HTMLVideoElement. The second and third parameter are both optional.

	First parameter: Mandatory HTMLVideoElement object.

	Second parameter: BCP-47 string for default language. If this parameter is omitted, the User Agent's language
	will be used to choose a track.

	Third parameter: as yet unused - will implement animation settings and some other global options with this
	parameter later.

	RETURNS:

	Reference to the HTMLVideoElement.
*/
captionator.processVideoElement = function(videoElement, options) {
	options = options instanceof Object ? options : {};

	if (!videoElement.captioned) {
		videoElement._captionatorOptions = options;
		videoElement.className += (videoElement.className.length ? " " : "") + "captioned";
		videoElement.captioned = true;

		// Check whether video element has an ID. If not, create one
		if (videoElement.id.length === 0) {
			videoElement.id = captionator.generateID();
		}

		var trackConfig = videoElement._trackConfig;
		var trackObject = captionator.addTextTrack(
			(trackConfig.id || captionator.generateID()),
			trackConfig.kind,
			trackConfig.label,
			trackConfig.srclang,
			trackConfig.src,
			trackConfig.type);
		trackObject.onerror = trackConfig.onError;
		trackConfig.track = trackObject;
		trackObject.videoElement = videoElement;

		trackObject.internalDefault = true;
		trackObject.mode = captionator.TextTrack.SHOWING;

		videoElement.addEventListener("timeupdate", function(eventData) {
			var videoElement = eventData.target;
			// update active cues
			try {
				videoElement._textTracks.forEach(function(track) {
					track.activeCues.refreshCues.apply(track.activeCues);
				});
			} catch (error) {}
			captionator.rebuildCaptions(videoElement);
		}, false);

		if (!videoElement.vtt) {
			window.addEventListener("resize", function() {
				videoElement._captionator_dirtyBit = true; // mark video as dirty, force captionator to rerender captions
				captionator.rebuildCaptions(videoElement);
			}, false);
		}

		// Hires mode
		if (options.enableHighResolution === true) {
			window.setInterval(function captionatorHighResProcessor() {
				try {
					videoElement._textTracks.forEach(function(track) {
						track.activeCues.refreshCues.apply(track.activeCues);
					});
				} catch (error) {}
				captionator.rebuildCaptions(videoElement);
			}, 20);
		}
	}

	return videoElement;
};