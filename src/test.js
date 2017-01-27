/****************************
 * Starting library point.
 *
 * @author GlaDos
 * @since 23.11.16
 ****************************/

"use strict";

/***
 * Imports.
 *
 * @since 23.11.16
 */
const Controller = require("./ControlUnit");

const
	print = function *() {
		const args = yield; /* args.msg must exist */

		console.log(args.msg);
	},
	sum = function *() {
		const args = yield; /* args.num1 and args.num2 must exist */

		yield {
			str  : "print message",
			args : { msg : `Calculating the sum of ${args.num1} and ${args.num2}.` }
		};

		return args.num1 + args.num2;
	},
	mult = function *() {
		const args = yield; /* args.num1 and args.num2 must exist */

		yield {
			str  : "print message",
			args : { msg : `Calculating the multiply of ${args.num1} and ${args.num2}.` }
		};

		return args.num1 * args.num2;
	},
	part = function *() {
		yield;

		yield {
			str  : "print message",
			args : { msg : "The end of calculating." }
		};
	};

const controller = new Controller();

controller.bindModule("print message",        print);
controller.bindModule("sum two numbers",      sum);
controller.bindModule("multiply two numbers", mult);
controller.bindModule("display parting",      part);

controller.bindHeadModule("sum two numbers and double the result", function *() {
	const args = yield;

	const sumRes = yield {
		str  : "sum two numbers",
		args : {
			num1 : args.number1,
			num2 : args.number2
		}
	};

	yield {
		str  : "multiply two numbers",
		args : {
			num1 : sumRes,
			num2 : 2
		},
		asyncId : "mult"
	};

	const multRes = yield "mult";

	yield {
		str  : "display parting",
		args : {}
	};

	return multRes;
});

controller.make("sum two numbers and double the result", {
	number1 : 2,
	number2 : 3
}, (res) => {
	console.log(`Result is ${res}.\nFinish program test.`);
});

/***
 * Exports.
 *
 * @since 23.11.16
 */
exports = module.exports = {};