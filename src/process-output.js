captionator.mtvnProcessOutput = function(text) {
	if (!text) {
		return "";
	}
	text = text.replace("<br/>", "<br>").replace("</br>", "").replace("<br />", "<br/>");
	// can we even do this hack?
	text = text.replace("<br>", "</span><br><span>");
	var lines = text.split("<br>");
	if (lines.length > 0) {
		$.each(lines, function(index, line) {
			lines[index] = "<span class=\"mtvn-cue\"><span class=\"mtvn-cue-text\">" + line + "</span></span>";
		});
		text = lines.join("<br>");
	}
	return text.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">").replace(/&amp;/g, "&")
		.replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
};