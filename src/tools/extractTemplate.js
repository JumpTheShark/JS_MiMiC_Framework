/****************************
 * Template extractor. Takes the given template with arguments and returns a template with embedded arguments.
 *
 * @author GlaDos
 * @since 25.01.17
 ****************************/

"use strict";

/***
 * Constants.
 *
 * @since 25.01.17
 */
const MARKER = "$";

/**
 * Template extract function. The given template (in string form) must not end with an argument marker.
 *
 * @param {string} template template in a string form
 * @param {Map} args template arguments
 * @return {string} template with embedded arguments
 * @since 25.01.17
 */
const extract = (template, args) => {
	let res = "";

	for (let i = 0; i < template.length; i += 1) {
		if (template.startsWith(MARKER, i)) {
			i += MARKER.length;

			let argId = "";

			for (; template.charAt(i) !== " " &&
					template.charAt(i) !== "\n" &&
					template.charAt(i) !== "\""; i += 1)
				argId += template.charAt(i);

			res += args.get(argId) + template.charAt(i);
		} else
			res += template.charAt(i);
	}

	return res;
};

/***
 * Exports.
 *
 * @since 25.01.17
 */
exports = module.exports = extract;