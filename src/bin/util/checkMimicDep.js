/****************************
 * Utility function.
 * Checks for MiMiC dependency in the node_modules.
 * Logs output and returns false in case of no mimic-js folder in the node_modules, otherwise returns true.
 *
 * @author GlaDos
 * @since 29.01.17
 ****************************/

"use strict";

/***
 * Imports.
 *
 * @since 29.01.17
 */
const extractInfo = require("../../tools/extractInfo");

require("shelljs/global");
require("colors");

const noMimicDepMsg =
`MiMiC dependency must be set in package.json to do this. Basically, run
	${"npm install mimic-js --save".bold}
in the project folder. Then call this command again.`;

/* eslint-disable no-console */

/**
 * Exporting utility function definition.
 *
 * @return {boolean} whether the dependency is presented
 * @since 29.01.17
 */
exports = module.exports = () => {
	cd("./node_modules");

	if (error()) {
		console.log(noMimicDepMsg);
		return false;
	}

	if (!test("-d", "mimic-js")) {
		cd("..");
		console.log(noMimicDepMsg);
		return false;
	}

	cd("..");

	return true;
};