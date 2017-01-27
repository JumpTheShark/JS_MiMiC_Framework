/****************************
 * Utility function.
 * Returns a meta data, associated with the MiMiC project.
 * Logs output and returns null in case of no package.json file in the current directory.
 *
 * @author GlaDos
 * @since 27.01.17
 ****************************/

"use strict";

/***
 * Imports.
 *
 * @since 27.01.17
 */
const extractInfo = require("../../tools/extractInfo");

require("shelljs/global");
require("colors");

const noPackageJsonMsg =
`${"package.json".red} is needed to be in the folder to do this. Basically, run
	${"npm init".bold}
in the folder you wish to run this command and fill requested information. Then call this command again.`;

/* eslint-disable no-console */

/**
 * Exporting utility function definition.
 *
 * @return {MetaData|null} project metadata or null
 * @since 27.01.17
 */
exports = module.exports = () => {
	if (!test("-e", "package.json")) {
		console.log(noPackageJsonMsg);
		return null;
	}

	return extractInfo(cat("package.json"));
};