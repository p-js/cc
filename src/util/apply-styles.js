/*
	captionator.applyStyles(DOMNode, Style Object)

	A fast way to apply multiple CSS styles to a DOMNode.

	First parameter: DOMNode to style. This parameter is mandatory.

	Second parameter: A key/value object where the keys are camel-cased variants of CSS property names to apply,
	and the object values are CSS property values as per the spec. This parameter is mandatory.

	RETURNS:

	Nothing.
*/
captionator.applyStyles = function(StyleNode, styleObject) {
	for (var styleName in styleObject) {
		if ({}.hasOwnProperty.call(styleObject, styleName)) {
			StyleNode.style[styleName] = styleObject[styleName];
		}
	}
};