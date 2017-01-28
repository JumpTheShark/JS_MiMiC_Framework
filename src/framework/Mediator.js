/****************************
 * Mediator (core).
 * Fully automated class for controlling modules and executing business tasks.
 *
 * @author GlaDos
 * @since 10.12.16
 ****************************/

"use strict";

//** structure definitions

/**
 * Dictionary of arguments { key : value }.
 *
 * @typedef {Object} ArgSet
 */

/**
 * Control unit's adapter.
 * Used for interaction with control module.
 *
 * @typedef {Object} Controller
 */

/**
 * Chained task with a boolean property determining task execution state.
 *
 * @typedef {Object} QueueTask
 * @property {string} str task definition
 * @property {ArgSet} args task arguments
 * @property {function(Object)} callBack function to be called after task execution
 */

/**
 * Head module. Represents a module that implements a business task.
 *
 * @typedef {function} HeadModule
 */

/**
 * Mediator task queue.
 *
 * @typedef {Object} MediatorQueue
 * @property {QueueTask[]} headTasks array of all headTasks, whenever they were executed or not
 * @property {number} first index of the first module that not being called for execution
 */

//**

/**
 * Mediator class implementation.
 *
 * @property {Controller} controller control unit's adapter
 * @property {Dictionary} taskModuleMap dictionary representing { task definition : executing module class }
 * @property {MediatorQueue} queue mediator's task queue
 * @since 12.12.16
 */
class Mediator {

	/**
	 * Initializes new mediator by the given parent control unit.
	 *
	 * @param {Controller} controller control unit's adapter
	 * @since 12.12.16
	 */
	constructor (controller) {
		this.controller    = controller;
		this.taskModuleMap = {};
		this.queue         = {
			headTasks : [],
			first     : 0
		};
		this.asyncMap      = {};
		this.processFreeId = 0;
		this.isWorking     = false;
		this.stat          = undefined; /* TODO statistic keeping with access */
	}

	/**
	 * Pushes a head module linearly into the task queue.
	 *
	 * @param {string} taskName the head module corresponding task name
	 * @param {ArgSet} args business arguments
	 * @param {function(Object)} callBack function to be called after the task is being executed
	 * @return {void} nothing
	 * @since 12.12.16
	 */
	pushTask (taskName, args, callBack) {
		this.queue.headTasks.push({
			str        : taskName,
			args       : args,
			callBack   : callBack
		});

		if (!this.isWorking)
			new Promise((resolve) => {
				this.makeHeadTask();
				resolve();
			}).then(() => {});
	}

	/**
	 * Binds an executive module generator function (value) to the executive task (key).
	 *
	 * @param {string} taskName task definition in a string form
	 * @param {function} executiveModule module generator function
	 * @return {void} nothing
	 * @since 12.12.16
	 */
	bind (taskName, executiveModule) {
		this.taskModuleMap[taskName] = executiveModule;
	}

	getTaskNum () {
		return this.queue.headTasks.length - this.queue.first;
	}

	//**

	/**
	 * Binds and returns new free id for a module process.
	 *
	 * @return {number} free identification number for the module process
	 * @since 24.01.17
	 */
	bindFreeId () {
		this.processFreeId += 1;
		return this.processFreeId - 1;
	}

	/**
	 * Returns kept async value associated with the given key.
	 *
	 * @param {string} key asyncId string for getting the value
	 * @return {object} value stored by the given key
	 * @since 24.01.17
	 */
	getAsyncValue (key) {
		return this.asyncMap[key];
	}

	/**
	 * Puts new pair { key : value } into the async data storage.
	 *
	 * @param {string} key async key in a string form
	 * @param {object} value async value
	 * @return {void} nothing
	 * @since 24.01.17
	 */
	setAsyncValue (key, value) {
		this.asyncMap[key] = value;
	}

	/**
	 * Processes one step in module working (code between module outer requests (yields)).
	 *
	 * @param {string} firstTaskName the name of the first executive task (head module's business task)
	 * @param {HeadModule} firstTaskModule the first executive module (head module)
	 * @param {ArgSet} firstTaskArgs first task's arguments (head module's business arguments)
	 * @param {number} processId id of the process induced by a module
	 * @param {function} gen module generator function
	 * @param {ArgSet} args arguments to send to the module
	 * @param {function(Object)} callBack function to call after the result returns
	 * @return {void} nothing
	 * @since 12.12.16
	 */
	processStep (firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, args, callBack) {
		const mes = gen.next(args);

		if (mes.done) {
			/*this.executedTasks.push({
				name   : firstTaskName,
				module : firstTaskModule,
				args   : firstTaskArgs,
				result : mes.value
			}); TODO */

			if (this.queue.headTasks.length > this.queue.first)
				new Promise((resolve) => {
					this.makeHeadTask();
					resolve();
				}).then(() => {});
			else
				this.isWorking = false;

			callBack(mes.value);
		} else if (typeof mes.value === "string") { /* <=> call for async result by the given asyncId */
			const data = this.getAsyncValue(processId + mes.value);

			if (data === undefined)
				this.setAsyncValue(processId + mes.value, null);
			else
				this.processStep(firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, data, callBack);
		} else if (mes.value.asyncId) {
			new Promise((resolve) => {
				this.makeTask(mes.value.str, mes.value.args, (data) => {
					const prevValue = this.getAsyncValue(processId + mes.value.asyncId);

					this.setAsyncValue(processId + mes.value.asyncId, data);

					if (prevValue === null)
						this.processStep(firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, data, callBack);
				});

				resolve();
			}).then(() => {});

			this.processStep(firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, undefined, callBack);
		} else
			this.makeTask(mes.value.str, mes.value.args, (data) => {
				this.processStep(firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, data, callBack);
			});
	}

	/**
	 * Processes one (first enabled) head module from the queue.
	 *
	 * @return {void} nothing
	 * @since 12.12.16
	 */
	makeHeadTask () {
		this.isWorking = true;

		const
			id = this.queue.first,
			el = this.queue.headTasks[id];

		if (!el)
			throw new Error(`corrupt element in the queue (queue length - ${this.queue.headTasks.length}, index - ${id})`);

		this.queue.first += 1;

		this.makeTask(el.str, el.args, el.callBack);
	}

	/**
	 * Handles the given task by starting and executing the corresponding module process.
	 *
	 * @param {string} name task name
	 * @param {ArgSet} args task arguments
	 * @param {function} callBack callback function
	 * @return {void} nothing
	 * @since 23.01.17
	 */
	makeTask (name, args, callBack) {
		const executiveModule = this.taskModuleMap[name];

		if (executiveModule === undefined)
			throw new Error(`mediator can not handle the task "${name}"`);

		const gen = executiveModule();

		gen.next();

		this.processStep(name, executiveModule, args, this.bindFreeId(), gen, args, callBack);
	}
}

/***
 * Exports.
 *
 * @since 10.12.16
 */
exports = module.exports = Mediator;