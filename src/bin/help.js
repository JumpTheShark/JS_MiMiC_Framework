/****************************
 * Help command. Displays help message.
 *
 * @author GlaDos
 * @since 25.01.17
 ****************************/

"use strict";

require("colors");

const
	helpMsg =
`${"-=- help (help) -=-".bold}

${"Usage:".yellow}
	${"mimic help <args>".bold}

${"Description".yellow}:
	${"<no args> :".bold} display help message
	${"--help    :".bold} display this message`,
	mainHelpMsg =
`${"-=-=- MiMiC help -=-=-".bold}

${"mimic <command> <arguments...>".bold}

${"Available commands:".yellow}

- init
- newtask
- help

To see a command description, use
${"mimic <command> --help".bold}`;

/* eslint-disable no-console */

/**
 * Exporting help function definition.
 *
 * @param {Args} args command arguments
 * @return {void} nothing
 * @since 25.01.17
 */
exports = module.exports = (args) => {
	if (args.set2Args.has("--help"))
		console.log(helpMsg);
	else
		console.log(mainHelpMsg);
};