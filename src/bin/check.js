/****************************
 * Check command. Checks whether every active module dependency (task) has its related module.
 *
 * @author GlaDos
 * @since 28.01.17
 ****************************/

"use strict";

require("colors");

const
	helpMsg =
`${"-=- check (help) -=-".bold}

${"Usage:".yellow}
	${"mimic check <args>".bold}

${"Description".yellow}:
	${"<no args>   :".bold} check all business tasks' dependent subtasks recursively on having a module that implements request
	${"<task name> :".bold} check the given business task and its dependent subtasks recursively on having a module that implements request
	${"-a (--all)  :".bold} check all tasks' dependent subtasks that were binded to related modules on having a module that implements request
	${"--help      :".bold} display this message`;

/* eslint-disable no-console */

/**
 * Exporting check function definition.
 *
 * @param {Args} args command arguments
 * @return {void} nothing
 * @since 28.01.17
 */
exports = module.exports = (args) => {
	if (args.set2Args.has("--help")) {
		console.log(helpMsg);
		return;
	}

	/* TODO */
};