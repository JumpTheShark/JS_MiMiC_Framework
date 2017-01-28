/****************************
 * Index.js starting application file.
 * To use mimic, just run mimic from console.
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
	ControlUnit = require("./src/framework/ControlUnit"),
	Mediator    = require("./src/framework/Mediator");

/***
 * Exports.
 *
 * @since 24.01.17
 */
exports = module.exports = {
	ControlUnit : ControlUnit,
	Mediator    : Mediator
};