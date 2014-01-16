captionator.ttmlToVtt = function(ttml) {
	return ttml.replace("<br>", "\n").replace("</br>", "");
};
/* global TextTrackCue */
/**
 * Loops through all the TextTracks for a given element and manages their display (including generation of container elements.)
 * First parameter: HTMLVideoElement object with associated TextTracks
 */
captionator.rebuildCaptionsVTT = function(videoElement) {
	var trackList = videoElement._textTracks || [],
		currentTime = videoElement.currentTime,
		compositeActiveCues = [],
		cuesChanged = false,
		activeCueIDs = [],
		cueSortArray = [];
	if (!videoElement._track) {
		videoElement._track = videoElement.addTextTrack("captions");
	}
	var track = videoElement._track;
	track.mode = "showing";
	// Work out what cues are showing...
	trackList.forEach(function(track) {
		if (track.mode === captionator.TextTrack.SHOWING && track.readyState === captionator.TextTrack.LOADED) {
			cueSortArray = [].slice.call(track.activeCues, 0);
			// Do a reverse sort
			// Since the available cue render area is a square which decreases in size
			// (away from each side of the video) with each successive cue added,
			// and we want cues which are older to be displayed above cues which are newer,
			// we sort active cues within each track so that older ones are rendered first.

			cueSortArray = cueSortArray.sort(function(cueA, cueB) {
				if (cueA.startTime > cueB.startTime) {
					return -1;
				} else {
					return 1;
				}
			});

			compositeActiveCues = compositeActiveCues.concat(cueSortArray);
		}
	});

	// Determine whether cues have changed - we generate an ID based on track ID, cue ID, and text length
	activeCueIDs = compositeActiveCues.map(function(cue) {
		return cue.track.id + "." + cue.id + ":" + cue.text.toString(currentTime).length;
	});
	cuesChanged = !captionator.compareArray(activeCueIDs, videoElement._captionator_previousActiveCues);
	// If they've changed, we re-render our cue canvas.
	if (cuesChanged || videoElement._captionator_dirtyBit) {
		// If dirty bit was set, it certainly isn't now.
		videoElement._captionator_dirtyBit = false;

		// Destroy internal tracking variable (which is used for caption rendering)
		videoElement._captionator_availableCueArea = null;

		// Internal tracking variable to determine whether our composite active cue list for the video has changed
		videoElement._captionator_previousActiveCues = activeCueIDs;

		// Now we render the cues
		compositeActiveCues.forEach(function(cue) {
			if (cue.track.kind !== "metadata" && cue.mode !== captionator.TextTrack.HIDDEN) {
				var processed = captionator.ttmlToVtt(cue.text.processedCue);
				track.addCue(new TextTrackCue(cue.startTime, cue.endTime, processed));
			}
		});
	}
};