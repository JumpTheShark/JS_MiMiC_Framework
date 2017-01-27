/****************************
 * Utility function.
 * Goes to the root, where .mimic file is presented, or logs output and returns null if no root found.
 * If MiMiC root found, returns metadata associated with the project.
 * Logs output and returns null also in case of no package.json file in the root directory.
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
const getMetaData = require("./getMetaData");

require("shelljs/global");
require("colors");

const noRootMsg =
`Root folder with MiMiC project not found (${".mimic".red} file indicates this).
If you did not initialize your MiMiC project, run
	${"mimic init".bold}
in the folder you wish to initialize MiMiC project. Then call this command again.`;

/* eslint-disable no-console */

/**
 * Exporting utility function definition.
 *
 * @return {MetaData|null} metadata or null
 * @since 27.01.17
 */
exports = module.exports = () => {
	let
		prevDir = null,
		curDir  = pwd().toString();

	while (!test("-e", ".mimic")) {
		cd("..");

		prevDir = curDir;
		curDir  = pwd().toString();

		if (prevDir === curDir) {
			console.log(noRootMsg);
			return null;
		}
	}

	return getMetaData();
};