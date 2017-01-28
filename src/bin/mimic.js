#! /usr/bin/env node

/****************************
 * Main command for executing other commands.
 *
 * @author GlaDos
 * @since 24.01.17
 ****************************/

"use strict";

/**
 * Command arguments.
 *
 * @typedef {Object} Args
 * @property {string[]} linearArgs main arguments
 * @property {Set} set1Args arguments starting with '-'
 * @property {Set} set2Args arguments starting with '--'
 */

/***
 * Imports.
 *
 * @since 24.01.17
 */
const
	init    = require("./init"),
	newtask = require("./newtask"),
	help    = require("./help");

require("colors");

const
	args = process.argv,
	argData = {
		linearArgs : [],
		set1Args   : new Set(),
		set2Args   : new Set()
	};

if (!args) {
	help(argData);
	return;
}

let ind = 0;

while (args[ind].indexOf("mimic") === -1 && ind < args.length)
	ind += 1;

if (ind + 1 >= args.length) {
	help(argData);
	return;
}

ind += 1;

const cmd = args[ind];

ind += 1;

for (; ind < args.length; ind += 1)
	if (args[ind].startsWith("--"))
		argData.set2Args.add(args[ind]);
	else if (args[ind].startsWith("-"))
		argData.set1Args.add(args[ind]);
	else argData.linearArgs.push(args[ind]);

switch (cmd) {
case "init":
	init(argData);
	break;
case "newtask":
	newtask(argData);
	break;
case "help":
default:
	help(argData);
}

/***
 * Exports.
 *
 * @since 24.01.17
 */
exports = module.exports = {};