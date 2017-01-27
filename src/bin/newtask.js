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
`No ${"CU_Init.js".red} file in the current directory. Please create it and try again.`,
	corruptCUInit =
`CU_Init.js file is corrupt to automatically bind dependencies.
This may be caused when there is no any bindModule/bindHeadModule method calls and no comment blocks /* executive tasks */ or /* business tasks */.
Please fix it and try again.`;

/**
 * Returns a first free module id by checking in format "<head><number><tail>.js".
 * Search will be in the current directory.
 *
 * @param {string} head name head
 * @param {string} tail name tail
 * @return {number} free module id
 * @since 27.01.17
 */
const getFreeId = (head, tail) => {
	let num = 0;

	while (test("-e", `${head}${num}${tail}.js`))
		num += 1;

	return num;
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

	//** CU_Init preparation

	const bindString = business ? "bindHeadModule" : "bindModule";

	let
		removeNewLine = false,
		bindInd       = cuInit.lastIndexOf(bindString);

	if (bindInd === -1) {
		const commentString = business ? "/* business tasks */" : "/* executive tasks */";

		bindInd = cuInit.indexOf(commentString);

		if (bindInd === -1) {
			console.log(corruptCUInit);
			return;
		}

		bindInd += commentString.length + "\n\n".length;
		removeNewLine = true;
	} else {
		bindInd += bindString.length;

		while (cuInit.charAt(bindInd) !== ";")
			bindInd += 1;

		bindInd += "\n\n".length;
	}

	//** module creation

	const templateArgs = new Map()
		.set("AUTHOR", metaData.userName)
		.set("DATE",   metaData.date);

	let
		freeId         = null,
		moduleName     = null,
		testModuleName = null;

	if (business) {
		forceCd("tests");
		forceCd("businessTasks");

		freeId = getFreeId("bModule", "Spec");

		cd("../..");
		forceCd("businessTasks");

		freeId = Math.max(freeId, getFreeId("bModule", ""));

		moduleName = `bModule${freeId}.js`;

		extractTemplate(
			businessModuleTemplate,
			templateArgs.set("TASK", taskName)
		).to(moduleName);
	} else {
		forceCd("tests");
		forceCd("executiveTasks");

		freeId = getFreeId("eModule", "Spec");

		cd("../..");
		forceCd("executiveTasks");

		freeId = Math.max(freeId, getFreeId("eModule", ""));

		moduleName = `eModule${freeId}.js`;

			extractTemplate(
			executiveModuleTemplate,
			templateArgs.set("TASK", taskName)
		).to(moduleName);
	}

	cd("..");

	if (!noTests) {
		forceCd("tests");

		if (business) {
			forceCd("businessTasks");

			testModuleName = `bModule${freeId}Spec.js`;

			extractTemplate(
				businessTestModuleTemplate,
				templateArgs.set("TASK", taskName)
			).to(testModuleName);
		} else {
			forceCd("executiveTasks");

			testModuleName = `eModule${freeId}Spec.js`;

			extractTemplate(
				executiveTestModuleTemplate,
				templateArgs.set("TASK", taskName)
			).to(testModuleName);
		}

		cd("../..");
	}

	//** working with CU_Init

	const packageString = business ? "businessTasks" : "executiveTasks";

	let pasteString = `controller.${bindString}("${taskName}", require("./${packageString}/${moduleName}"));`;

	if (!noTests)
		pasteString += `\ncontroller.${bindString}("test! ${taskName}", require("./tests/${packageString}/${testModuleName}"));`;

	if (!removeNewLine)
		pasteString += "\n";

	`${cuInit.substring(0, bindInd)}${pasteString}${cuInit.substring(bindInd)}`.to("CU_Init.js");

	//**

	console.log("Created successfully.".green.bold);
};