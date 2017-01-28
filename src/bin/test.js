/****************************
 * Test command. Tests tasks that have related testing tasks.
 *
 * @author GlaDos
 * @since 28.01.17
 ****************************/

"use strict";

require("colors");

const
	helpMsg =
`${"-=- test (help) -=-".bold}

${"Usage:".yellow}
	${"mimic test <args>".bold}

${"Description".yellow}:
	${"<no args>        :".bold} test business tasks which have related testing modules
	${"-r (--recursive) :".bold} test tasks with its module subtasks which have related testing modules recursively, starting from business tasks
	${"-a (--all)       :".bold} test all tasks which have related testing modules recursively
	${"--help           :".bold} display this message`;

/* eslint-disable no-console */

/**
 * Exporting test function definition.
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