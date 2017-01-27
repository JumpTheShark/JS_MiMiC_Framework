# JS MiMiC Architecture & Framework

<img src="https://s29.postimg.org/joz32yqmf/dungeon_and_dragons_mimic.jpg" width="330" height="268">

JavaScript *Module-Mediator-Controller* architecture (or *MiMiC*, *MMC*) is a way to create JS back-end programs in a specific elegant style.

The architecture is inspired by the Eddie Osmani pattern.

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

As realized by architecture name, the application is separated on three logical parts.

1. ***Module*** - an architectural unit, that implements the concrete task, formally named *executive task*. ***Executive task*** - string formed task that represents a description to the technical process in a behavior-driven style. These and only these units form all the technical logic part of the program. Moreover, according to the architecture, modules are the only objects that changes between different programs, so the programmer needs to use only them to create his project - another code part is crearly defined and automated.

2. ***Mediator*** (or ***Core***) - an architectural unit, that implements an execution of tasks handled by modules. Cores can be compared with processors in a computer that manage tasks and their completion. Mediators have their own executive *business task* queue. ***Business task*** - executive task with a description based on business logic, i.e declares a complete task with a homely conception, notwithstanding the absoluteness of meaning laid between business and technical tasks. One mediator handles only one business task at the same time, but the task itself can be parallelized.

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

The module above demonstrates how to implement a simple task returning "Hello, world!!" message. You can see there `const args = yield;` line - this is how the module receives the ininial arguments. Note that every module **must** request input arguments before all other outsource requests in any case, even if there is no module arguments at all. In the absence of arguments there is an option to write `yield;` instead:


```javascript
const module1 = function *() {
	yield; /* request input arguments, but do not save them into a variable */
	return "Hello, world!! Now with no saved arguments ;)";
};
```

##### Outsource data request 

When there is a need to get something from outside the module task's logic, the request mechanism is used. As it was told, there is two ways of how to request some data based on synchronization choice.

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

***Coming soon***

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

Though it is able to implement a head module equally to any common module, there is a list of recommendations for head module implementation:

* Head module consists predominantly of executive task requests among with input argument request and (optional) return value;
* Except for requests, it is allowed to make basic calculations corresponding to the business logic of executive tasks' relation;
* Request argument can be hardcoded, put from input or put from the result of another task;
* Head module result can be either a constant, one of the result values, initial arguments, their basic calculation or a conjunction of previously mentioned values;
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

Although there is no restrictions of how to create testing modules, it is recommended to follow the next rules:

* For executive task shortly named \<name\> the testing module should be named \<name\>Spec;
* Testing module does not consume arguments;
* Testing module does not call for any other tasks, than testing task;
* When a mismatch occurs, string with explanation returns, otherwise returns ```true``` value.

##### Hot swap technique

***Coming soon***

##### Mining statistic

***Coming soon***
