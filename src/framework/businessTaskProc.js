/****************************
 * Business task process handler.
 *
 * @author GlaDos
 * @since 29.01.17
 ****************************/

"use strict";

process.on("message", (mediatorInstance) => {
	console.log("DEBUG: " + JSON.stringify(mediatorInstance));
	makeHeadTask(mediatorInstance);
});

/**
 * Processes one (first enabled) head module from the queue.
 *
 * @param {object} _this Mediator instance
 * @return {void} nothing
 * @since 12.12.16
 */
const makeHeadTask = (_this) => {
	_this.isWorking = true;

	const
		id = _this.queue.first,
		el = _this.queue.headTasks[id];

	if (!el)
		throw new Error(`corrupt element in the queue (queue length - ${_this.queue.headTasks.length}, index - ${id})`);

	_this.queue.first += 1;

	makeTask(_this, el.str, el.args, el.callBack);
};

/**
 * Handles the given task by starting and executing the corresponding module process.
 *
 * @param {object} _this Mediator instance
 * @param {string} name task name
 * @param {ArgSet} args task arguments
 * @param {function} callBack callback function
 * @return {void} nothing
 * @since 23.01.17
 */
const makeTask = (_this, name, args, callBack) => {
	console.log("TEST: " + JSON.stringify(_this));

	const executiveModule = _this.taskModuleMap[name];

	if (executiveModule === undefined)
		throw new Error(`mediator can not handle the task "${name}"`);

	const gen = executiveModule();

	gen.next();

	processStep(_this, name, executiveModule, args, _this.bindFreeId(), gen, args, callBack);
};

/**
 * Processes one step in module working (code between module outer requests (yields)).
 *
 * @param {object} _this Mediator instance
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
const processStep = (_this, firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, args, callBack) => {
	const mes = gen.next(args);

	if (mes.done) {
		/*this.executedTasks.push({
		 name   : firstTaskName,
		 module : firstTaskModule,
		 args   : firstTaskArgs,
		 result : mes.value
		 }); TODO */

		if (_this.queue.headTasks.length > _this.queue.first)
			new Promise((resolve) => {
				makeHeadTask();
				resolve();
			}).then(() => {});
		else
			_this.isWorking = false;

		callBack(mes.value);
	} else if (typeof mes.value === "string") { /* <=> call for async result by the given asyncId */
		const data = getAsyncValue(_this, processId + mes.value);

		if (data === undefined)
			setAsyncValue(_this, processId + mes.value, null);
		else
			processStep(firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, data, callBack);
	} else if (mes.value.asyncId) {
		new Promise((resolve) => {
			makeTask(mes.value.str, mes.value.args, (data) => {
				const prevValue = getAsyncValue(_this, processId + mes.value.asyncId);

				setAsyncValue(_this, processId + mes.value.asyncId, data);

				if (prevValue === null)
					processStep(firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, data, callBack);
			});

			resolve();
		}).then(() => {});

		processStep(firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, undefined, callBack);
	} else
		makeTask(mes.value.str, mes.value.args, (data) => {
			processStep(firstTaskName, firstTaskModule, firstTaskArgs, processId, gen, data, callBack);
		});
};

/**
 * Returns kept async value associated with the given key.
 *
 * @param {object} _this Mediator instance
 * @param {string} key asyncId string for getting the value
 * @return {object} value stored by the given key
 * @since 24.01.17
 */
const getAsyncValue = (_this, key) => {
	return _this.asyncMap[key];
};

/**
 * Puts new pair { key : value } into the async data storage.
 *
 * @param {object} _this Mediator instance
 * @param {string} key async key in a string form
 * @param {object} value async value
 * @return {void} nothing
 * @since 24.01.17
 */
const setAsyncValue = (_this, key, value) => {
	_this.asyncMap[key] = value;
};

/***
 * Exports.
 *
 * @since 29.01.17
 */
exports = module.exports = {};