
	/**
	 * @constructor
	 */
	captionator.ActiveTextTrackCueList = function ActiveTextTrackCueList(textTrackCueList, textTrack) {
		// Among active cues:

		// The text track cues of a media element's text tracks are ordered relative to each
		// other in the text track cue order, which is determined as follows: first group the
		// cues by their text track, with the groups being sorted in the same order as their
		// text tracks appear in the media element's list of text tracks; then, within each
		// group, cues must be sorted by their start time, earliest first; then, any cues with
		// the same start time must be sorted by their end time, earliest first; and finally,
		// any cues with identical end times must be sorted in the order they were created (so
		// e.g. for cues from a WebVTT file, that would be the order in which the cues were
		// listed in the file).

		this.refreshCues = function() {
			if (textTrackCueList.length) {
				var cueList = this;
				var cueListChanged = false;
				var oldCueList = [].slice.call(this, 0);
				this.length = 0;

				textTrackCueList.forEach(function(cue) {
					if (cue.active) {
						cueList.push(cue);

						if (cueList[cueList.length - 1] !== oldCueList[cueList.length - 1]) {
							cueListChanged = true;
						}
					}
				});

				if (cueListChanged) {
					try {
						textTrack.oncuechange();
					} catch (error) {}
				}
			}
		};

		this.toString = function() {
			return "[ActiveTextTrackCueList]";
		};

		this.refreshCues();
	};
	captionator.ActiveTextTrackCueList.prototype = new captionator.TextTrackCueList(null);