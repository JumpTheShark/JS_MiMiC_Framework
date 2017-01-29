/****************************
 * Control unit (controller).
 * Fully automated class for controlling mediators.
 *
 * @author GlaDos
 * @since 13.12.16
 ****************************/

"use strict";

/***
 * Imports.
 *
 * @since 13.12.16
 */
const Mediator = require("./Mediator");

/**
 * Throws a validation error (bad variable type).
 *
 * @param {string} got what is got
 * @param {string} expected what is expected
 * @return {error} validation error
 * @since 14.12.16
 */
const throwValidateErr = (got, expected) => {
	throw new Error(`control module got ${got} instead of non-null ${expected}`);
};

/**
 * Returns a function that validates the given input variable. Takes expected (check) and display (if not equal) types.
 *
 * @param {string} expectedType expected type to check
 * @param {string} writeType type that will be written if an error occurs
 * @return {void|error} nothing or error
 * @since 14.12.16
 */
const validateInput = (expectedType, writeType) =>
	(input) => {
		const type = typeof input;

		if (type !== expectedType || type === null)
			throwValidateErr(type, writeType);
	};

/**
 * Function that validates the given input variable whether it is a generator.
 *
 * @param {object} input data to check
 * @return {void|error} nothing or error
 * @since 29.01.17
 */
const validateGenerator = (input) => {
	if (input === null)
		throwValidateErr("null", "generator");

	if (input === undefined)
		throwValidateErr("undefined", "generator");

	if (input.constructor.name !== "GeneratorFunction")
		throwValidateErr(typeof input, "generator");
};

/**
 * Mapping of type-check validators { name : validator }.
 *
 * @type object
 * @since 14.12.16
 */
const typeFunc = {
	object     : validateInput("object", "object"),
	string     : validateInput("string", "string"),
	number     : validateInput("number", "number"),
	"function" : validateInput("function", "function"),
	generator  : validateGenerator
};

/**
 * Validate the given input variables by its types.
 *
 * @param {[object, string]} inputAndExpect pairs of input variable and expected type
 * @return {void|error} nothing or error
 * @since 14.12.16
 */
const validateInputs = (...inputAndExpect) => {
	for (const pair of inputAndExpect)
		typeFunc[pair[1]](pair[0]);
};

/**
 * Control unit implementation.
 *
 * @since 14.12.16
 */
class ControlUnit {

	/**
	 * Initializes new control unit.
	 * Adds one mediator at once.
	 *
	 * @since 14.12.16
	 */
	constructor () {
		this.taskModuleMap   = {};
		this.businessTaskSet = new Set();
		this.mediators       = [];

		this.addMediator();
	}

	/**
	 * Binds new task to the given head (business) module.
	 *
	 * @param {string} taskName task string business definition
	 * @param {HeadModule} headModule head module
	 * @return {void} nothing
	 * @since 14.12.16
	 */
	bindHeadModule (taskName, headModule) {
		validateInputs([taskName, "string"], [headModule, "generator"]);

		this.businessTaskSet.add(taskName);
		this.bindModule(taskName, headModule);
	}

	/**
	 * Binds new task to the given executive module.
	 * Binding continues to all mediators, added now or later.
	 *
	 * @param {string} taskName task definition in a string form
	 * @param {function} executiveModule module generator function
	 * @return {void} nothing
	 * @since 14.12.16
	 */
	bindModule (taskName, executiveModule) {
		validateInputs([taskName, "string"], [executiveModule, "generator"]);

		this.taskModuleMap[taskName] = executiveModule;

		for (const mediator of this.mediators)
			mediator.bind(taskName, executiveModule);
	}

	/**
	 * Executes the given task with the given arguments and callback-function.
	 *
	 * @param {string} taskName task in string form
	 * @param {dictionary | null | undefined} _args task arguments
	 * @param {function(object) | null | undefined} _callBack function that gets control with output data when the task is completed
	 * @return {void} nothing
	 * @since 14.12.16
	 */
	make (taskName, _args, _callBack) {
		const
			args     = _args     === undefined || _args     === null ? {}       : _args,
			callBack = _callBack === undefined || _callBack === null ? () => {} : _callBack;

		validateInputs([taskName, "string"], [args, "object"], [callBack, "function"]);

		if (this.mediators.length === 0)
			throw new Error("control module can not make a task, because it has no mediators");

		if (!this.businessTaskSet.has(taskName))
			throw new Error(`control module can not handle the task ${taskName})`);

		/* eslint-disable no-confusing-arrow */

		const mediator = this.mediators.reduce((m1, m2) => m1.getTaskNum() > m2.getTaskNum() ? m2 : m1); /* TODO better selection */

		/* eslint-enable no-confusing-arrow */

		mediator.pushTask(taskName, args, callBack);
	}

	/**
	 * Adds new mediator under CU's control.
	 *
	 * @return {void} nothing
	 * @since 14.12.16
	 */
	addMediator () {
		const mediator = new Mediator(this);

		for (const taskModule in this.taskModuleMap)
			mediator.bind(taskModule, this.taskModuleMap[taskModule]);

		this.mediators.push(mediator);
	}
}

/**
 * Control Unit singleton.
 * One for the project, that is why mimic-js must be a dependency for each project that uses it.
 *
 * @type {ControlUnit}
 * @since 29.01.17
 */
const controller = new ControlUnit();

/***
 * Exports.
 *
 * @since 13.12.16
 */
exports = module.exports = controller;