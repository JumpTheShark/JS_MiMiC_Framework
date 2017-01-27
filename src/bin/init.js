/****************************
 * Initialize command. Creates empty folders and extracts the framework .js files.
 *
 * @author GlaDos
 * @since 24.01.17
 ****************************/

"use strict";

/***
 * Imports.
 *
 * @since 24.01.17
 */
const
	controlUnitTemplate = require("../templates/ControlUnit"),
	mediatorTemplate    = require("../templates/Mediator"),
	controllerTemplate  = require("../templates/controller"),
	getMetaData         = require("./util/getMetaData"),
	extractTemplate     = require("../tools/extractTemplate");

require("shelljs/global");

const
	helpMsg =
`${"-=- init (help) -=-".bold}

${"Usage:".yellow}
	${"mimic init <args>".bold}

${"Description:".yellow}
	${"<no args> :".bold} initialize new project in the current directory, create initial folders and extract the framework .js files
	${"<path>    :".bold} initialize new project in the <path> directory, create initial folders and extract the framework .js files
	${"--help    :".bold} display this message`,
	invalidPathMsg =
"Can not initialize into the given destination folder. Check your path and try again.",
	mimicMarkerAlreadyExistsMsg =
"Can not initialize MiMiC in the folder with already deployed MiMiC files (.mimic marker).";

/* eslint-disable no-console */

/**
 * Exporting init function definition.
 *
 * @param {Args} args command arguments
 * @return {void} nothing
 * @since 24.01.17
 */
exports = module.exports = (args) => {
	if (args.set2Args.has("--help")) {
		console.log(helpMsg);
		return;
	}

	let extractPath = "./";

	if (args.linearArgs.length === 1)
		extractPath = args.linearArgs[0];
	else if (args.linearArgs.length > 0 || args.set1Args.size > 0 || args.set2Args.size > 0) {
		console.log(helpMsg);
		return;
	}

	//** initialization start

	cd(extractPath);

	if (error()) {
		console.log(invalidPathMsg);
		return;
	}

	if (test("-e", ".mimic")) {
		console.log(mimicMarkerAlreadyExistsMsg);
		return;
	}

	const metaData = getMetaData();

	if (metaData === null)
		return;

	"THIS IS A MARKER FOR MIMIC FRAMEWORK. DO NOT DELETE THIS FILE.".to(".mimic");
	mkdir("framework");
	mkdir("src");

	cd("framework");

	controlUnitTemplate.to("ControlUnit.js");
	mediatorTemplate   .to("Mediator.js");

	cd("../src");

	const controllerTemplateArgs = new Map()
		.set("AUTHOR", metaData.userName)
		.set("DATE",   metaData.date);

	extractTemplate(controllerTemplate, controllerTemplateArgs).to("CU_Init.js");
	mkdir("executiveTasks");
	mkdir("businessTasks");
	mkdir("structures");
	mkdir("tests");

	cd("tests");

	mkdir("executiveTasks");
	mkdir("businessTasks");
	mkdir("structures");

	console.log(`Initialized successfully in "${extractPath}".`.green.bold);
};