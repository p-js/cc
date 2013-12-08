captionator.TextTrackCueList = function TextTrackCueList(track) {
		this.track = track instanceof captionator.TextTrack ? track : null;

		this.getCueById = function(cueID) {
			return this.filter(function(currentCue) {
				return currentCue.id === cueID;
			})[0];
		};

		this.loadCues = function(cueData) {
			for (var cueIndex = 0; cueIndex < cueData.length; cueIndex++) {
				cueData[cueIndex].track = this.track;
				Array.prototype.push.call(this, cueData[cueIndex]);
			}
		};

		this.addCue = function(cue) {
			if (cue && cue instanceof captionator.TextTrackCue) {
				if (cue.track === this.track || !cue.track) {
					// TODO: Check whether cue is already in list of cues.
					// TODO: Sort cue list based on TextTrackCue.startTime.
					Array.prototype.push.call(this, cue);
				} else {
					throw new Error("This cue is associated with a different track!");
				}
			} else {
				throw new Error("The argument is null or not an instance of TextTrackCue.");
			}
		};

		this.toString = function() {
			return "[TextTrackCueList]";
		};
	};
	captionator.TextTrackCueList.prototype = [];