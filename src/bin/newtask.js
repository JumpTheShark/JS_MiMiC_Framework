/****************************
 * Create task command. Creates new task module (optionally with test task module) and binds task(s) to the module(s).
 *
 * @author GlaDos
 * @since 25.01.17
 ****************************/

"use strict";

/***
 * Imports.
 *
 * @since 27.01.17
 */
const
	executiveModuleTemplate     = require("../templates/executiveModule"),
	businessModuleTemplate      = require("../templates/businessModule"),
	executiveTestModuleTemplate = require("../templates/executiveTestModule"),
	businessTestModuleTemplate  = require("../templates/businessTestModule"),
	goToRoot                    = require("./util/goToRoot"),
	forceCd                     = require("./util/forceCd"),
	extractTemplate             = require("../tools/extractTemplate");

require("shelljs/global");
require("colors");

const
	helpMsg =
`${"-=- newtask (help) -=-".bold}

${"Usage:".yellow}
	${"mimic newtask <name> <args>".bold}

${"Description:".yellow}
	${"<name>                 :".bold} create new module with test module and bind them to executive task
	${"<name> -n (--notests)  :".bold} create new module without test module and bind it to executive task
	${"<name> -b (--business) :".bold} create new head module with test head module and bind them to business task
	${"--help                 :".bold} display this message`,
	noCUInit =
`No ${"CU_Init.js".red} file in the current directory. Please create it and try again.`;

/**
 * Returns a first free module name in format "<head><number><tail>.js" by the given head and tail.
 * Search is done in the current directory.
 *
 * @param {string} head name head
 * @param {string} tail name tail
 * @return {string} free module name
 * @since 27.01.17
 */
const getFreeName = (head, tail) => {
	let num = 0;

	while (test("-e", `${head}${num}${tail}.js`))
		num += 1;

	return `${head}${num}${tail}.js`;
};

/* eslint-disable no-console */

/**
 * Exporting newtask function definition.
 *
 * @param {Args} args command arguments
 * @return {void} nothing
 * @since 25.01.17
 */
exports = module.exports = (args) => {
	if (args.set2Args.has("--help") || args.linearArgs.length !== 1) {
		console.log(helpMsg);
		return;
	}

	let noTests = false;

	if (args.set1Args.has("-n") || args.set2Args.has("--notests")) {
		args.set1Args.delete("-n");
		args.set2Args.delete("--notests");

		noTests = true;
	}

	let business = false;

	if (args.set1Args.has("-b") || args.set2Args.has("--business")) {
		args.set1Args.delete("-b");
		args.set2Args.delete("--business");

		business = true;
	}

	if (args.set1Args.size > 0 || args.set2Args.size > 0) {
		console.log(helpMsg);
		return;
	}

	//** new task creation start

	const metaData = goToRoot();

	if (metaData === null)
		return;

	/* TODO check on tasks' existence */

	const taskName = args.linearArgs[0];

	forceCd("src");

	const cuInit = cat("CU_Init.js");

	if (error()) {
		console.log(noCUInit);
		return;
	}

	const templateArgs = new Map()
		.set("AUTHOR", metaData.userName)
		.set("DATE",   metaData.date);

	if (business) {
		forceCd("businessTasks");

		extractTemplate(
			businessModuleTemplate,
			templateArgs.set("TASK", taskName)
		).to(getFreeName("bModule", ""));
	} else {
		forceCd("executiveTasks");

		extractTemplate(
			executiveModuleTemplate,
			templateArgs.set("TASK", taskName)
		).to(getFreeName("eModule", ""));
	}

	cd("..");

	if (!noTests) {
		forceCd("tests");

		if (business) {
			forceCd("businessTasks");

			extractTemplate(
				businessTestModuleTemplate,
				templateArgs.set("TASK", taskName)
			).to(getFreeName("bModule", "Spec"));
		} else {
			forceCd("executiveTasks");

			extractTemplate(
				executiveTestModuleTemplate,
				templateArgs.set("TASK", taskName)
			).to(getFreeName("eModule", "Spec"));
		}
	}

	cd("..");

	/* TODO work with CU_Init.js */

	console.log(`Created successfully.`.green.bold);
};