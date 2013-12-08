var mtvnProcessTTS = function(cueSplit) {
	for (var i = 0, len = cueSplit.length; i < len; i++) {

		var inputHTML = cueSplit[i];

		if (inputHTML.indexOf("<") !== 0) {
			continue;
		}
		var tag = inputHTML.slice(0, inputHTML.indexOf(" ")),
			style = "";

		if (inputHTML.indexOf('tts:fontstyle="italic"') !== -1) {
			style += "font-style:italic;";
		}

		if (inputHTML.indexOf('tts:fontweight="bold"') !== -1) {
			style += "font-weight:bold;";
		}

		if (inputHTML.indexOf('tts:color') !== -1) {
			var match = inputHTML.match(/color=\"(.*)\"/);
			if (match.length > 1) {
				style += "color:" + match[1] + ";";
			}
		}

		if (style) {
			inputHTML = tag + " style=\"" + style + "\">";
		}

		cueSplit[i] = inputHTML;
	}

	return cueSplit;
};