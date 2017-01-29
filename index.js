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
const controller = require("./src/framework/ControlUnit");

String.prototype.bindModule = function (module) {
	controller.bindModule(this, module);
};

String.prototype.bindHeadModule = function (headModule) {
	controller.bindHeadModule(this, headModule);
};

String.prototype.make = function (args, callBack) {
	controller.make(this, args, callBack);
};

/***
 * Exports.
 *
 * @since 24.01.17
 */
exports = module.exports = controller;