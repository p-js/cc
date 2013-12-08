/*
	captionator.styleCue(DOMNode, cueObject, videoElement)

	Styles and positions cue nodes according to the WebVTT specification.

	First parameter: The DOMNode representing the cue to style. This parameter is mandatory.

	Second parameter: The TextTrackCue itself.

	Third Parameter: The HTMLVideoElement with which the cue is associated. This parameter is mandatory.

	RETURNS:

	Nothing.
*/
captionator.styleCue = function(DOMNode, cueObject, videoElement) {
	// Variables for maintaining render calculations
	var cueX = 0,
		cueY = 0,
		cueWidth = 0,
		cueHeight = 0,
		cueSize, cueAlignment, cuePaddingLR = 0,
		cuePaddingTB = 0;
	var baseFontSize, basePixelFontSize, baseLineHeight, tmpHeightExclusions;
	var videoHeightInLines, videoWidthInLines, pixelLineHeight, verticalPixelLineHeight, charactersPerLine = 0,
		characterCount = 0;
	var characters = 0,
		lineCount = 0,
		finalLineCharacterCount = 0,
		finalLineCharacterHeight = 0,
		currentLine = 0;
	var characterX, characterY, characterPosition = 0;
	var options = videoElement._captionatorOptions || {};
	var videoMetrics;
	var internalTextPosition = 50,
		textBoundingBoxWidth = 0,
		textBoundingBoxPercentage = 0,
		autoSize = true;
	var plainCueText = "",
		plainCueTextContainer;

	// Function to facilitate vertical text alignments in browsers which do not support writing-mode
	// (sadly, all the good ones!)
	var spanify = function(DOMNode) {
		if (DOMNode.spanified) {
			return DOMNode.characterCount;
		}

		var stringHasLength = function(textString) {
			return !!textString.length;
		};
		var spanCode = "<span class='captionator-cue-character'>";
		var nodeIndex, currentNode, currentNodeValue, replacementFragment, characterCount = 0;
		var styleSpan = function(span) {
			characterCount++;
			captionator.applyStyles(span, {
				"display": "block",
				"lineHeight": "auto",
				"height": basePixelFontSize + "px",
				"width": verticalPixelLineHeight + "px",
				"textAlign": "center"
			});
		};

		for (nodeIndex in DOMNode.childNodes) {
			if (DOMNode.childNodes.hasOwnProperty(nodeIndex) && !DOMNode.childNodes[nodeIndex].nospan) {
				currentNode = DOMNode.childNodes[nodeIndex];
				if (currentNode.nodeType === 3) {
					replacementFragment = document.createDocumentFragment();
					currentNodeValue = currentNode.nodeValue;

					replacementFragment.appendChild(document.createElement("span"));

					replacementFragment.childNodes[0].innerHTML =
						spanCode +
						currentNodeValue
						.split(/(.)/)
						.filter(stringHasLength)
						.join("</span>" + spanCode) +
						"</span>";

					[].slice.call(replacementFragment.querySelectorAll("span.captionator-cue-character"), 0).forEach(styleSpan);

					currentNode.parentNode.replaceChild(replacementFragment, currentNode);
				} else if (DOMNode.childNodes[nodeIndex].nodeType === 1) {
					characterCount += spanify(DOMNode.childNodes[nodeIndex]);
				}
			}
		}

		// We have to know when we've already split this thing up into spans,
		// so we don't end up creating more and more sub-spans when we restyle the node
		DOMNode.characterCount = characterCount;
		DOMNode.spanified = true;

		return characterCount;
	};

	// Set up the cue canvas
	videoMetrics = captionator.getNodeMetrics(videoElement);

	// Define storage for the available cue area, diminished as further cues are added
	// Cues occupy the largest possible area they can, either by width or height
	// (depending on whether the `direction` of the cue is vertical or horizontal)
	// Cues which have an explicit position set do not detract from this area.
	// It is the subtitle author's responsibility to ensure they don't overlap if
	// they decide to override default positioning!

	if (!videoElement._captionator_availableCueArea) {
		videoElement._captionator_availableCueArea = {
			"bottom": (videoMetrics.height - videoMetrics.controlHeight),
			"right": videoMetrics.width,
			"top": 0,
			"left": 0,
			"height": (videoMetrics.height - videoMetrics.controlHeight),
			"width": videoMetrics.width
		};
	}

	if (cueObject.direction === "horizontal") {
		// Calculate text bounding box
		// (isn't useful for vertical cues, because we're doing all glyph positioning ourselves.)
		captionator.applyStyles(DOMNode, {
			"width": "auto",
			"position": "static",
			"display": "inline-block",
			"padding": "1em"
		});

		textBoundingBoxWidth = parseInt(DOMNode.offsetWidth, 10);
		textBoundingBoxPercentage = Math.floor((textBoundingBoxWidth / videoElement._captionator_availableCueArea.width) * 100);
		textBoundingBoxPercentage = textBoundingBoxPercentage <= 100 ? textBoundingBoxPercentage : 100;
	}

	// Calculate font metrics
	baseFontSize = ((videoMetrics.height * (fontSizeVerticalPercentage / 100)) / 96) * 72;
	baseFontSize = baseFontSize >= minimumFontSize ? baseFontSize : minimumFontSize;
	basePixelFontSize = Math.floor((baseFontSize / 72) * 96);
	baseLineHeight = Math.floor(baseFontSize * lineHeightRatio);
	baseLineHeight = baseLineHeight > minimumLineHeight ? baseLineHeight : minimumLineHeight;
	pixelLineHeight = Math.ceil((baseLineHeight / 72) * 96);
	verticalPixelLineHeight = pixelLineHeight;

	if (pixelLineHeight * Math.floor(videoMetrics.height / pixelLineHeight) < videoMetrics.height) {
		pixelLineHeight = Math.floor(videoMetrics.height / Math.floor(videoMetrics.height / pixelLineHeight));
		baseLineHeight = Math.ceil((pixelLineHeight / 96) * 72);
	}

	if (pixelLineHeight * Math.floor(videoMetrics.width / pixelLineHeight) < videoMetrics.width) {
		verticalPixelLineHeight = Math.ceil(videoMetrics.width / Math.floor(videoMetrics.width / pixelLineHeight));
	}

	// Calculate render area height & width in lines
	videoHeightInLines = Math.floor(videoElement._captionator_availableCueArea.height / pixelLineHeight);
	videoWidthInLines = Math.floor(videoElement._captionator_availableCueArea.width / verticalPixelLineHeight);

	// Calculate cue size and padding
	if (parseFloat(String(cueObject.size).replace(/[^\d\.]/ig, "")) === 0) {
		// We assume (given a size of 0) that no explicit size was set.
		// Depending on settings, we either use the WebVTT default size of 100% (the Captionator.js default behaviour),
		// or the proportion of the video the text bounding box takes up (widthwise) as a percentage (proposed behaviour, LeanBack's default)
		if (options.sizeCuesByTextBoundingBox === true) {
			cueSize = textBoundingBoxPercentage;
		} else {
			cueSize = 100;
			autoSize = false;
		}
	} else {
		autoSize = false;
		cueSize = parseFloat(String(cueObject.size).replace(/[^\d\.]/ig, ""));
		cueSize = cueSize <= 100 ? cueSize : 100;
	}

	cuePaddingLR = cueObject.direction === "horizontal" ? Math.floor(videoMetrics.width * 0.01) : 0;
	cuePaddingTB = cueObject.direction === "horizontal" ? 0 : Math.floor(videoMetrics.height * 0.01);

	if (cueObject.linePosition === "auto") {
		cueObject.linePosition = cueObject.direction === "horizontal" ? videoHeightInLines : videoWidthInLines;
	} else if (String(cueObject.linePosition).match(/\%/)) {
		cueObject.snapToLines = false;
		cueObject.linePosition = parseFloat(String(cueObject.linePosition).replace(/\%/ig, ""));
	}

	if (cueObject.direction === "horizontal") {
		cueHeight = pixelLineHeight;

		if (cueObject.textPosition !== "auto" && autoSize) {
			internalTextPosition = parseFloat(String(cueObject.textPosition).replace(/[^\d\.]/ig, ""));

			// Don't squish the text
			if (cueSize - internalTextPosition > textBoundingBoxPercentage) {
				cueSize -= internalTextPosition;
			} else {
				cueSize = textBoundingBoxPercentage;
			}
		}

		if (cueObject.snapToLines === true) {
			cueWidth = videoElement._captionator_availableCueArea.width * (cueSize / 100);
		} else {
			cueWidth = videoMetrics.width * (cueSize / 100);
		}

		if (cueObject.textPosition === "auto") {
			cueX = ((videoElement._captionator_availableCueArea.right - cueWidth) / 2) + videoElement._captionator_availableCueArea.left;
		} else {
			internalTextPosition = parseFloat(String(cueObject.textPosition).replace(/[^\d\.]/ig, ""));
			cueX = ((videoElement._captionator_availableCueArea.right - cueWidth) * (internalTextPosition / 100)) + videoElement._captionator_availableCueArea.left;
		}

		if (cueObject.snapToLines === true) {
			cueY = ((videoHeightInLines - 1) * pixelLineHeight) + videoElement._captionator_availableCueArea.top;
		} else {
			tmpHeightExclusions = videoMetrics.controlHeight + pixelLineHeight + (cuePaddingTB * 2);
			cueY = (videoMetrics.height - tmpHeightExclusions) * (cueObject.linePosition / 100);
		}

	} else {
		// Basic positioning
		cueY = videoElement._captionator_availableCueArea.top;
		cueX = videoElement._captionator_availableCueArea.right - verticalPixelLineHeight;
		cueWidth = verticalPixelLineHeight;
		cueHeight = videoElement._captionator_availableCueArea.height * (cueSize / 100);

		// Split into characters, and continue calculating width & positioning with new info
		characterCount = spanify(DOMNode);
		characters = [].slice.call(DOMNode.querySelectorAll("span.captionator-cue-character"), 0);
		charactersPerLine = Math.floor((cueHeight - cuePaddingTB * 2) / basePixelFontSize);
		cueWidth = Math.ceil(characterCount / charactersPerLine) * verticalPixelLineHeight;
		lineCount = Math.ceil(characterCount / charactersPerLine);
		finalLineCharacterCount = characterCount - (charactersPerLine * (lineCount - 1));
		finalLineCharacterHeight = finalLineCharacterCount * basePixelFontSize;

		// Work out CueX taking into account linePosition...
		if (cueObject.snapToLines === true) {
			cueX = cueObject.direction === "vertical-lr" ? videoElement._captionator_availableCueArea.left : videoElement._captionator_availableCueArea.right - cueWidth;
		} else {
			var temporaryWidthExclusions = cueWidth + (cuePaddingLR * 2);
			if (cueObject.direction === "vertical-lr") {
				cueX = (videoMetrics.width - temporaryWidthExclusions) * (cueObject.linePosition / 100);
			} else {
				cueX = (videoMetrics.width - temporaryWidthExclusions) - ((videoMetrics.width - temporaryWidthExclusions) * (cueObject.linePosition / 100));
			}
		}

		// Work out CueY taking into account textPosition...
		if (cueObject.textPosition === "auto") {
			cueY = ((videoElement._captionator_availableCueArea.bottom - cueHeight) / 2) + videoElement._captionator_availableCueArea.top;
		} else {
			cueObject.textPosition = parseFloat(String(cueObject.textPosition).replace(/[^\d\.]/ig, ""));
			cueY = ((videoElement._captionator_availableCueArea.bottom - cueHeight) * (cueObject.textPosition / 100)) +
				videoElement._captionator_availableCueArea.top;
		}

		// Iterate through the characters and position them accordingly...
		currentLine = 0;
		characterPosition = 0;
		characterX = 0;
		characterY = 0;

		characters.forEach(function(characterSpan) {
			if (cueObject.direction === "vertical-lr") {
				characterX = verticalPixelLineHeight * currentLine;
			} else {
				characterX = cueWidth - (verticalPixelLineHeight * (currentLine + 1));
			}

			if (cueObject.alignment === "start" || (cueObject.alignment !== "start" && currentLine < lineCount - 1)) {
				characterY = (characterPosition * basePixelFontSize) + cuePaddingTB;
			} else if (cueObject.alignment === "end") {
				characterY = ((characterPosition * basePixelFontSize) - basePixelFontSize) + ((cueHeight + (cuePaddingTB * 2)) - finalLineCharacterHeight);
			} else if (cueObject.alignment === "middle") {
				characterY = (((cueHeight - (cuePaddingTB * 2)) - finalLineCharacterHeight) / 2) + (characterPosition * basePixelFontSize);
			}

			// Because these are positioned absolutely, screen readers don't read them properly.
			// Each of the characters is set to be ignored, and the entire text is duplicated in a hidden element to ensure
			// it is read correctly.
			characterSpan.setAttribute("aria-hidden", "true");

			captionator.applyStyles(characterSpan, {
				"position": "absolute",
				"top": characterY + "px",
				"left": characterX + "px"
			});

			if (characterPosition >= charactersPerLine - 1) {
				characterPosition = 0;
				currentLine++;
			} else {
				characterPosition++;
			}
		});

		// Get the plain cue text
		if (!DOMNode.accessified) {
			plainCueText = cueObject.text.getPlain(videoElement.currentTime);
			plainCueTextContainer = document.createElement("div");
			plainCueTextContainer.innerHTML = plainCueText;
			plainCueTextContainer.nospan = true;
			DOMNode.appendChild(plainCueTextContainer);
			DOMNode.accessified = true;

			// Now hide it. Don't want it interfering with cue display
			captionator.applyStyles(plainCueTextContainer, {
				"position": "absolute",
				"overflow": "hidden",
				"width": "1px",
				"height": "1px",
				"opacity": "0",
				"textIndent": "-999em"
			});
		}
	}

	if (cueObject.direction === "horizontal") {
		if (captionator.checkDirection(String(cueObject.text)) === "rtl") {
			cueAlignment = {
				"start": "right",
				"middle": "center",
				"end": "left"
			}[cueObject.alignment];
		} else {
			cueAlignment = {
				"start": "left",
				"middle": "center",
				"end": "right"
			}[cueObject.alignment];
		}
	}
	captionator.applyStyles(DOMNode, {
		"position": "absolute",
		"overflow": "hidden",
		"width": cueWidth + "px",
		"height": cueHeight + "px",
		"top": cueY + "px",
		"left": cueX + "px",
		"padding": cuePaddingTB + "px " + cuePaddingLR + "px",
		"textAlign": cueAlignment,
		"direction": captionator.checkDirection(String(cueObject.text)),
		"lineHeight": baseLineHeight + "pt",
		"boxSizing": "border-box"
	});

	if (cueObject.direction === "vertical" || cueObject.direction === "vertical-lr") {
		// Work out how to shrink the available render area
		// If subtracting from the right works out to a larger area, subtract from the right.
		// Otherwise, subtract from the left.	
		if (((cueX - videoElement._captionator_availableCueArea.left) - videoElement._captionator_availableCueArea.left) >=
			(videoElement._captionator_availableCueArea.right - (cueX + cueWidth))) {

			videoElement._captionator_availableCueArea.right = cueX;
		} else {
			videoElement._captionator_availableCueArea.left = cueX + cueWidth;
		}

		videoElement._captionator_availableCueArea.width =
			videoElement._captionator_availableCueArea.right -
			videoElement._captionator_availableCueArea.left;

	} else {
		// Now shift cue up if required to ensure it's all visible
		if (DOMNode.scrollHeight > DOMNode.offsetHeight * 1.2) {
			if (cueObject.snapToLines) {
				var upwardAjustmentInLines = 0;
				while (DOMNode.scrollHeight > DOMNode.offsetHeight * 1.2) {
					cueHeight += pixelLineHeight;
					DOMNode.style.height = cueHeight + "px";
					upwardAjustmentInLines++;
				}

				cueY = cueY - (upwardAjustmentInLines * pixelLineHeight);
				DOMNode.style.top = cueY + "px";
			} else {
				// Not working by lines, so instead of shifting up, simply throw out old cueY calculation
				// and completely recalculate its value
				cueHeight = (DOMNode.scrollHeight + cuePaddingTB);
				tmpHeightExclusions = videoMetrics.controlHeight + cueHeight + (cuePaddingTB * 2);
				cueY = (videoMetrics.height - tmpHeightExclusions) * (cueObject.linePosition / 100);

				DOMNode.style.height = cueHeight + "px";
				DOMNode.style.top = cueY + "px";
			}
		}

		// Work out how to shrink the available render area
		// If subtracting from the bottom works out to a larger area, subtract from the bottom.
		// Otherwise, subtract from the top.
		if (((cueY - videoElement._captionator_availableCueArea.top) - videoElement._captionator_availableCueArea.top) >=
			(videoElement._captionator_availableCueArea.bottom - (cueY + cueHeight)) &&
			videoElement._captionator_availableCueArea.bottom > cueY) {

			videoElement._captionator_availableCueArea.bottom = cueY;
		} else {
			if (videoElement._captionator_availableCueArea.top < cueY + cueHeight) {
				videoElement._captionator_availableCueArea.top = cueY + cueHeight;
			}
		}

		videoElement._captionator_availableCueArea.height =
			videoElement._captionator_availableCueArea.bottom -
			videoElement._captionator_availableCueArea.top;
	}
};