/* global $*/
(function() {
	var LABEL = "Closed Captioning";
	function ttmlToVtt(ttml) {
		if (!ttml) {
			return "";
		}
		ttml = ttml.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">").replace(/&amp;/g, "&")
			.replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
		var $ttml = $("<span>" + ttml + "</span>");
		$ttml.find("BR").replaceWith("\n");
		$ttml.find("span").each(function(index, el) {
			var $el = $(el);
			if ($el.css("fontStyle") === "italic") {
				$el.replaceWith("<i>" + $el.html() + "</i>");
			}
			if ($.trim($el.text()) === "" && $el.children().length === 0) {
				$el.replaceWith("");
			}
			$el.removeAttr("style");
		});
		return $ttml.html();
	}

	var Cue = window.VTTCue || window.TextTrackCue;

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
			if (track.readyState === captionator.TextTrack.LOADED) {
				track.vttProcessed = true;
				var newTrack;
				$.each(videoElement.textTracks, function(index, currentTrack) {
					if(currentTrack.label === LABEL){
						newTrack = currentTrack;
					}
				});
				if(!newTrack){
					newTrack = videoElement.addTextTrack("captions", LABEL);
					newTrack.mode = "disabled";
				}
				try {
					track.cues.forEach(function(cue) {
						var processed = ttmlToVtt(cue.text.toString());
						var newCue = new Cue(cue.startTime, cue.endTime, processed);
						switch (cue.alignment) {
							case "left":
								newCue.position = 5;
								newCue.align = "start";
								break;
							case "right":
								newCue.position = 95;
								newCue.align = "end";
								break;
							default:
								break;
						}

						newTrack.addCue(newCue);
					});
				} catch (e) {
					console.error("error parsing ttml into vtt.", e);
				}
			}
		});
	};
})();