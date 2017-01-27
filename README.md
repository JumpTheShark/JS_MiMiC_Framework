# JS MiMiC Architecture & Framework

<img src="https://s29.postimg.org/joz32yqmf/dungeon_and_dragons_mimic.jpg" alt="Image of Mimic from the game 'Dungeon & Dragons'" width="330" height="268">

JavaScript ***Module-Mediator-Controller*** architecture (or ***MiMiC***, ***MMC***) is a way to create JS back-end programs in a specific elegant style.

The architecture takes inspirations from "JavaScript Design Patterns" by [Addy Osmani](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#designpatternsjavascript).

***The framework is under development, but alpha-access is available now!***

### Fast start

##### Console

```bash
npm install mimic-js -g

cd path/to/your/new/project
npm init
mimic init

mimic --help
```

##### Node.js

```javascript
const controller = require("mimic-js").ControlUnit;

controller.bindHeadModule("greeting", new function *() {
	yield;
	console.log("Hello, world!!");
});

controller.make("greeting", {}, () => {
	console.log("Callback has been called, end of testing.");
});
```

### How does it work on paper?

As realized by architecture name, the application is divided into three logical parts.

1. ***Module*** - an architectural unit that implements a certain task, formally named *executive task*. ***Executive task*** - a programmatic implementation of some part of business logic associated with a string-formed description. Module is the only unit in the architecture that implements business logic. Moreover, modules are the only objects that change between different applications, so the programmer needs to use only them to create his project - other parts of working application code are business-abstract and could be formalized and/or automatically generated.

2. ***Mediator*** (or ***Core***) - an architectural unit, that handles the execution of executive tasks by respective modules. Mediators have their own executive *business task* queue. ***Business task*** - executive task with a description based on business logic, i.e declares a complete task with a homely conception, notwithstanding the absoluteness of meaning laid between business and technical tasks. One mediator handles only one business task at the same time, but the task itself can be parallelized.

3. ***Control unit*** (***CU***, or ***Controller***) - an architectural unit, that implements cores' manager system. It is also the communicator between business logic and technical implementation. The controller is only one for the project, against the potentially unlimited number of mediators and modules. As it is the input point for program users, controller accepts business tasks to handle. It consists of under-controlled core collection for executing the given tasks, the collection of business tasks it can manage and a set of executive tasks mapped onto their respective modules. All mediators share the same mapping of executive tasks and modules within one Control Unit.

___

Now we describe the operating cycle of a program based on MiMiC architecture.

* Firstly, any user requests a business task to be handled. The task with necessary arguments (*business arguments*) is served in the program's Control Unit. As every business task in some sense is a sort of executive task, business tasks have a corresponding executive modules, called *Head modules*. ***Head module*** - module that only calls internally executive tasks related to its business task. The CU selects appropriate mediator to execute the business task and requests to handle it with the given arguments. Note that for mediators there is no sense between business and executive tasks - all of them cores handle equally.

* Secondly, mediator to be chosen receives the task and put it into the queue. according to the queue, as the time comes, the task begins to be handled.

* The execution of a single task is followed by several notices:
 - Core is searching for mapping of task and its related module to find one for completing the task.
 - Module receives arguments that are given for the task.
 - During code execution, module is able to request some data that is beyond its task scope, by calling another task with arguments. Note that this is the only way to get something from outside the module code, *libraries ***direct*** using is not recommended and may be forbidden in future*.
 - When module requests an outsource data its execution may be frozen until the data be got (***synchronized request***) or may continue instantly and then be frozen when the data result needs to be got (***asynchronized request***). Called executive task starts to be handled in the same process in the first case or in a new process otherwise.
 - When completed, module returns the expected result. It can also return an error during its runtime. Note that errors occured in case of emergency situations (i.e based on bad input by the user) should be returned as a result to the user with all necessary description, despite of exceptions which cause to return a real error from a module author side.

* When the outer task (business task as fact) completes, the final result is returned to the user.

___

### How does it work practically?

As we talk about the JavaScript back-end language, let us show how to write modules with *Node.js* and *ECMAScript 6*.

JavaScript generators mechanism supplied with the extended variant of a yield instrument (i.e not discovered in *ECMAScript 6* specification), which allows to use yield as right value. All such uses followed with a comment tip at the first times.

##### First steps

Modules in JavaScript representation are perfectly implemented by JavaScript's *generators*.

```javascript
const module1 = function *() {
	const args = yield; /* request input arguments */
	return "Hello, world!!";
};
```

The module above demonstrates how to implement a simple task returning "Hello, world!!" message. You can see there `const args = yield;` line - this is how the module receives the ininial arguments. Note that every module **must** request input arguments before all other outsource requests in any case, even if there are no module arguments at all. In the absence of arguments there is an option to write `yield;` instead:


```javascript
const module1 = function *() {
	yield; /* request input arguments, but do not save them into a variable */
	return "Hello, world!! Now with no saved arguments ;)";
};
```

##### Outsource data request 

When there is a need to get something from outside the module task's logic, the request mechanism is used. As it was told, there are two ways of how to request some data based on synchronization choice.

If we want to get the data **synchronously**:

```javascript
const module2 = function *() {
	yield; /* request arguments that are not used */
	
	/* request data from outside the module. The data will be put into <message> variable */
	const message = yield {
		str  : "get hello-world message", /* task name */
		args : {}                         /* task arguments */
	};
	
	return `${message} ${message}`;
};
```

If we want to get the data **asynchronously**:

```javascript
const module2 = function *() {
	yield; /* request arguments that are not used */
	
	/* request data from outside the module */
	yield {
		str     : "get hello-world message", /* task name */
		args    : {},                        /* task arguments */
		asyncId : "hello-world message"      /* id that is used later to get the result */
	};
	
	...
	
	/* put requested data into the variable <message> */
	const message = yield "hello-world message"; /* refers to the id that we send previously */
	
	return `${message} ${message}`;
};
```

These examples calls internally the executive task named `"get hello-world message"` which we define in `str` property, and returns the twice repeated hello-world message.

The technical difference between synchronously and asynchronously request using is **only**
* asyncId property is in the yield scope when request data;
* string instead of block {...} is in the yield scope when get data value.
That means cases ```yield ...;``` and ```<var> = yield ...;``` not determine request synchronization type.

Also, when requiring async data put into the variable, the process will be frozen until the data is calculated. Requesting data by async id that was not requested in the first async scope causes an error.

Note that request is not attached to the module, but to the task. The task name related to the module is binded to it during the Control Unit configuration.

##### Throwing errors

Of course, there are no perfect working modules, and usually a lot of time is spent on their debugging. Moreover, every module can get a corrupt argument that does not allow to operate futher.

Remind the two types of errors.
- Whether some code can not work because of an unexpected error occurs (division by zero, nonexistent variable property), such cases called ***exceptions***. These errors are from a programmer side only;
- Whether some code can not work because of an incorrect input that is allowed to be incorrect (for instance, nonexistent url from user's input), such cases called ***emergency situations***. These errors are from a user side only.

Framework offers the next way of handling errors.

All errors are divided into three types:

1. ***Fatal errors***, or ***First-level errors*** are errors that take place when an uncaught JavaScript error occurs within module. The business task process with all subrequest processes are shut down and callback function is called with the next structure:

```javascript
{
	isError    : true,
	errorLevel : 1,
	errorBody  : ... /* e.g. new Error(...) */
}
```

First-level errors are *exceptions*.

2. ***Errors***, or ***Second-level errors*** are errors that take place when module **returns** the special error structure, meaning that its working can not be continued and the business task must be aborted. The business task process with all subrequest processes are shut down and callback function is called with the next structure:

```javascript
{
	isError    : true,
	errorLevel : 2,
	errorBody  : ... /* e.g. new Error(...) */
}
```

For example, these errors might be when in some input module receives ```null``` instead of a string that must not be ```null``` .
To return such errors, modules must use the following structure in ```return``` statement:

```javascript
{
	isError     : true,
	isEmergency : false,
	errorBody   : ... /* e.g. new Error(...) */
}
```

Second-level errors are *exceptions*.

3. ***Weak errors***, or ***Third-level errors*** are errors that take place when module **returns** the special error structure, meaning that module can not do the expected operations because of unexpected problems (get content by url that does not exist, access denied during file reading, etc.). Such errors will not abort the business task, but a JavaScript error will be thrown into upper-called tasks by using *JavaScript generators' error throw mechanism*, i.e through ```yield```. The error can be caught in try-catch block. If the last one does not happen, callback function is called with the next structure:

```javascript
{
	isError    : true,
	errorLevel : 3,
	errorBody  : ... /* e.g. new Error(...) */
}
```

Note that if any module calls a task that returns a weak error (all the same through ```yield```) and does not handle it by try-catch block, the error **becomes a first-level error** and shut down the business task execution and all dependent processes.
To return such errors, modules must use the following structure in ```return``` statement:

```javascript
{
	isError     : true,
	isEmergency : true,
	errorBody   : ... /* e.g. new Error(...) */
}
```

Third-level errors are *emergency situations*.

##### Head module definition

Remind that user can only call business tasks to handle. Business tasks binded to the head modules which do not differ technically from a common module implementation.

```javascript
const headModule = function *() {
	yield;

	yield {
		str  : "print message",
		args : { msg : "hello" }
	};

	yield {
		str  : "print message",
		args : { msg : "world" }
	};
};
```

Though it is able to implement a head module equally to any common module, here is a list of recommendations for head module implementation:

* Head module consists predominantly of executive task requests among with input argument request and (optional) return value;
* Except for requests, it is allowed to make basic calculations corresponding to the business logic of executive tasks' relation;
* Request argument can be hardcoded, put from input or put from the result of another task;
* Head module result can be either a constant, one of the result values, initial arguments, their basic calculation or a conjunction of previously mentioned values;
* Head module **must** check **all** business arguments on correctness (non-null checks, type checks, etc.) and return a weak error if needed;
* It is also allowed to handle emergency situations to return an error description.

##### Control Unit preparation

Now let us see how the described modules, their execution and business tasks and also mediators are initiated in the CU.

Initialization of the Control Unit:

```javascript

/* Control Unit import */
const Controller = require("mimic").ControlUnit;

...

const controller = new Controller();
```

Binding executive task to the module:

```javascript
controller.bindModule("executive task name", module);
```

Binding business task to the head module:

```javascript
controller.bindHeadModule("business task name", headModule);
```

Executing the business task:

```javascript
controller.make("business task name", {
	arg1 : value1,
	arg2 : value2,
	...
}, callBack); /* callBack: (result) => { ... } */
```

At least here is the mindless but full example that reveals all the notices:

```javascript
const print = function *() {
	const args = yield; /* args.msg must exist */

	console.log(args.msg);
};
```

```javascript
const sum = function *() {
	const args = yield; /* args.num1 and args.num2 must exist */

	yield {
		str  : "print message",
		args : { msg : `Calculating the sum of ${args.num1} and ${args.num2}.` }
	};

	return args.num1 + args.num2;
};
```

```javascript
const mult = function *() {
	const args = yield; /* args.num1 and args.num2 must exist */

	yield {
		str  : "print message",
		args : { msg : `Calculating the multiply of ${args.num1} and ${args.num2}.` }
	};

	return args.num1 * args.num2;
};
```

```javascript
const part = function *() {
	yield;

	yield {
		str  : "print message",
		args : { msg : "The end of calculating." }
	};
};
```

```javascript
const exampleModule = function *() {
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
};
```

```javascript
const Controller = require("./patterns/MMC/ControlUnit");

const controller = new Controller();

controller.bindModule("print message",        print);
controller.bindModule("sum two numbers",      sum);
controller.bindModule("multiply two numbers", mult);
controller.bindModule("display parting",      part);

controller.bindHeadModule("sum two numbers and double the result", exampleModule);

controller.make("sum two numbers and double the result", {
	number1 : 2,
	number2 : 3
}, (res) => {
	console.log(`Result is ${res}.\nFinish program test.`);
});
```

When creating a controller, this is one mediator to be initialized in the CU by default. To add new cores, use the command

```javascript
controller.addMediator();
```

Mediators do not only provide parallelism of business tasks handling, but used for replacement when another one crashes.

##### Using a library

As it was told earlier, using library (and other external function set) functions directly in modules that not created only for library function not recommended and perhaps will be forbidden in future releases.

For now it is recommended to create modules as an adapters for each library function and use a respective executive task instead of library calling. Why is it a better choice? At first, this way enables to track statistic of library callings. At second, it gives you an option to change the library function module during the CU working, i.e not restarting the program or swap all function-using modules to replace any of library functions to another implementation of another library.

So the simplest examples:

```javascript
const print = function *() {
	const args = yield; /* args.msg must exist */

	console.log(args.msg);
};
```

```javascript
const random = function *() {
	yield;
	
	return Math.random();
};
```

These modules should hardly be replaced by new versions or etc., but this way allows to collect statistic about using these tools and unify the program to achieve maximum control.

##### Testing modules

One of the architecture features is ability to test modules during their work even in production release. As new modules can be loaded through the CU dynamically, we will use modules as a testing base.

Here is an example of how to make a test module for an executive task potential module:

```javascript
const sumSpec = function *() {
	yield;
	
	/* tests */
	
	const res1 = yield {
		str  : "sum two numbers",
		args : {
			num1 : 10,
			num2 : 20
		}
	};
	
	if (res1 !== 30)
		return `10 + 20 = 30, not ${res1}`;
	
	
	const res2 = yield {
		str  : "sum two numbers",
		args : {
			num1 : -1000,
			num2 : 1000
		}
	};
	
	if (res2 !== 0)
		return `-1000 + 1000 = 0, not ${res2}`;
	
	/* if all tests have been passed */
	
	return true;
};
```

Although there are no restrictions of how to create testing modules, it is recommended to follow the next rules:

* For executive task shortly named \<name\> the testing module should be named \<name\>Spec;
* Testing module does not consume arguments;
* Testing module does not call for any other tasks, than testing task;
* When a mismatch occurs, string with explanation returns, otherwise returns ```true``` value.

##### Hot swap technique

One of the advantages of MiMiC architecture is to swap binded modules to new ones while the application is still in work. In fact, there is no additional syntax, just rebind your task with another module:

```javascript
controller.bindModule("binded executive task", newModule);
```

or

```javascript
controller.bindHeadModule("binded business task", newHeadModule);
```

It works quite easy: every new request for execution the rebinded task will be done with a new module, but module processes whose tasks were started earlier than rebinding occured, will not be changed anyway.

##### Mining statistic

As the architecture grants an admirable control on the project, framework obtains the comprehensive statistic that is shareable with the user. Here is a list of available statistics:

1. List of completed executive tasks in chronological order (total request number, task name, used modules, initial arguments, task results);
2. List of completed executive tasks in 'most call number' sorted order (the same data);
3. List of completed business tasks in chronological order (total request number, task names, used head modules, initial arguments, task results);
4. List of completed business tasks in 'most call number' sorted order (the same data);
5. List of single executive task usages in chronological order (total request number, used modules, initial arguments and task results);
6. List of single business task usages in chronological order (total request number, used head modules, initial arguments and task results).

In future releases there are as minimum seven great novations in statistic mining:
* Task (module) execution time (total, execution time between each 'yield' call) measurement;
* Task (module) execution memory (total, execution time between each 'yield' call) measurement;
* Task execution date and start time;
* Task (module) error number (an option for every completed task, whether it worked properly) with descriptions;
* Modules' runtime relation trees. Consist of a graph (tree) for every completed task that shows modules' request hierarchy (with all needed information in nodes);
* For every binded module, an option whether it was tested;
* Parameterized statistic requests: user choose what data (initial arguments, results, etc.) is to be shown in returned statistic, including graphs.

This instrument will allow to see tasks' 'bad locations' like congestions in time and memory leaks in order to optimize your application for the best results.
