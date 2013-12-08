/*
	captionator.checkDirection(text)

	Determines whether the text string passed into the function is an RTL (right to left) or LTR (left to right) string.

	First parameter: Text string to check. This parameter is mandatory.

	RETURNS:

	The text string 'rtl' if the text is a right to left string, 'ltr' if the text is a left to right string, or an empty string
	if the direction could not be determined.
*/
captionator.checkDirection = function(text) {
	// Inspired by http://www.frequency-decoder.com/2008/12/12/automatically-detect-rtl-text
	// Thanks guys!
	var ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' + '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
		rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
		ltrDirCheckRe = new RegExp('^[^' + rtlChars + ']*[' + ltrChars + ']'),
		rtlDirCheckRe = new RegExp('^[^' + ltrChars + ']*[' + rtlChars + ']');

	return !!rtlDirCheckRe.test(text) ? 'rtl' : ( !! ltrDirCheckRe.test(text) ? 'ltr' : '');
};