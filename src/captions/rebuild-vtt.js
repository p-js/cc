(function() {
	function ttmlToVtt(ttml) {
		if (!ttml) {
			return "";
		}
		return ttml.replace(/ style=\"block\"/gi, "").replace(/<br>/gi, "\n").replace(/<\/br>/gi, "");
	}

	var Cue = window.VTTCue || window.TextTrackCue; 

	/* global TextTrackCue */
	/**
	 * Loops through all the TextTracks for a given element and manages their display (including generation of container elements.)
	 * First parameter: HTMLVideoElement object with associated TextTracks
	 */
	captionator.rebuildCaptionsVTT = function(videoElement) {
		var trackList = videoElement._textTracks || [];
		trackList.forEach(function(track) {
			if (track.vttProcessed) {
				return;
			}
			if (track.mode === captionator.TextTrack.SHOWING && track.readyState === captionator.TextTrack.LOADED) {
				track.vttProcessed = true;
				var newTrack = videoElement.addTextTrack("captions");
				newTrack.id = track.src;
				track.cues.forEach(function(cue) {
					if (cue.track.kind !== "metadata" && cue.mode !== captionator.TextTrack.HIDDEN) {
						var processed = ttmlToVtt(cue.text.toString());
						var newCue = new Cue(cue.startTime, cue.endTime, processed);
						newTrack.addCue(newCue);
					}
				});
			}
		});
	};
})();