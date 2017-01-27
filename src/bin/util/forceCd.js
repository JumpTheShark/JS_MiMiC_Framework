/****************************
 * Utility function.
 * Goes into the given directory. If it does not exist, creates this directory and then goes into it.
 *
 * @author GlaDos
 * @since 27.01.17
 ****************************/

"use strict";

require("shelljs/global");

/**
 * Exporting utility function definition.
 *
 * @param {string} dir the given directory to go
 * @return {void} nothing
 * @since 27.01.17
 */
exports = module.exports = (dir) => {
	if (!test("-d", dir))
		mkdir(dir);

	cd(dir);
};