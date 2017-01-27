/****************************
 * Information extractor. Takes the package.json text and returns some useful information from there.
 *
 * @author GlaDos
 * @since 25.01.17
 ****************************/

"use strict";

/**
 * Extracted output info.
 *
 * @typedef {object} MetaData
 * @parameter {string} userName the name of the user
 * @parameter {string} date the current date
 */

/**
 * Info extract function.
 *
 * @param {string} packageJson package.json (in string form)
 * @return {MetaData} useful extracted data
 * @since 25.01.17
 */
const extract = (packageJson) => {
	const json = JSON.parse(packageJson);

	return {
		userName : json.author,
		date     : new Date()
			.toISOString()
			.replace(/T/, " ")
			.replace(/\..+/, "")
	};
};

/***
 * Exports.
 *
 * @since 25.01.17
 */
exports = module.exports = extract;