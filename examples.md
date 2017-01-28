# Module examples

It is planned to move initial module arguments into the generator arguments like that

```javascript
function *(arg1, arg2) {
	...
}
```

But for now arguments can be got this way

```javascript
function *() {
	const args = yield;
}
```
In examples there is **the first version**.

___

### Hello-world

```javascript
function *() {
	console.log("Hello, world!");
}
```

### Hello-world using generalized printer

```javascript
function *(msg) { /* generalized printer. Task "print" */
	console.log(msg);
}

function *() {	
	yield {
		str  : "print",
		args : { msg : "Hello, world!" }
	};
}
```

### Wait then hello-world

```javascript
function *(time) { /* Waits the given time. Task "wait" */
	const stop = new Date().getTime() + time;
	
    while(new Date().getTime() < stop);
}

function *(time) {
	yield {
		str  : "wait",
		args : { time : time }
	};
	
	console.log("Hello, world!");
}
```

### Print using hardcoded hello-world


```javascript
function *() { /* Returns "Hello, world!" instance. Task "get hello-world" */
	return "Hello, world!";
}

function *(time) {
	const helloWorld = yield {
		str  : "get hello-world",
		args : {}
	};
	
	console.log(helloWorld);
}
```

### Hello-world vs hi-world

Hello-world will be printed after asynchronously called hi-world, but with delay in the last case.
Hello-world will be printed earlier than hi-world.

```javascript
function *(time) { /* Displays "Hi, world!" after delay. Task "print hi-world with delay" */
	const stop = new Date().getTime() + time;
	
    while(new Date().getTime() < stop);
	
	console.log("Hi, world!");
}

function *(time) {
	yield {
		str     : "print hi-world with delay",
		args    : { time : time },
		asyncId : "" /* asyncId is indicator of asynchrony if no output expected, leave it empty */
	};
	
	console.log("Hello, world!");
}
```

### Get asynchronously and print hello-world


```javascript
function *() { /* Returns "Hello, world!". Task "get hello-world" */
	return "Hello, world!";
}

function *() {
	yield {
		str     : "get hello-world",
		args    : {},
		asyncId : "hello-world message" /* gives the framework asyncId by which we can get the result later */
	};
	
	const helloWorld = yield "hello-world message"; /* yield <string> means to get requested value by asyncId */
	
	console.log(helloWorld);
}
```

### Hello-world vs hi-world (r.2)

Now let us even the odds and print hello-world and hi-world asynchronously with random delays.

```javascript
function *(time, msg) { /* Waits the given time and prints a message. Task "wait and print" */
	const stop = new Date().getTime() + time;
	
    while(new Date().getTime() < stop);
	
	console.log(msg);
}

function *() {
	yield {
		str     : "wait and print",
		args    : {
			time : Math.floor(Math.random() * 100),
			msg  : "Hello, world!"
		},
		asyncId : ""
	};
	
	yield {
		str     : "wait and print",
		args    : {
			time : Math.floor(Math.random() * 100),
			msg  : "Hi, world!"
		},
		asyncId : ""
	};
}
```

___

Now let us give examples without every implemented task (with some abstraction).

### Process two tasks parallel

##### First way

```javascript
function *() {
	yield { /* the first task call async */
		str     : "task 1",
		args    : { /* args */ },
		asyncId : "data 1"
	};
	
	const data2 = yield { /* the second - sync */
		str  : "task 2",
		args : { /* args */ },
	};
	
	const data1 = yield "data 1"; /* after the second has worked sync, get data from the first one */
	
	return {
		data1 : data1,
		data2 : data2
	};
}
```

##### Second way

```javascript
function *() {
	yield { /* the first task call async */
		str     : "task 1",
		args    : { /* args */ },
		asyncId : "data 1"
	};
	
	yield { /* the second - async too */
		str     : "task 2",
		args    : { /* args */ },
		asyncId : "data 2"
	};
	
	const
		data1 = yield "data 1", /* Here code is stopped until async task 1 put the result in internal memory */
		data2 = yield "data 2"; /* If the second task works longer, here code will be stopped, too */
	
	return {
		data1 : data1,
		data2 : data2
	};
}
```

### Creating file with the given text with no waiting the result

##### First way

```javascript
function *(name, text) { /* Runs a command to create a file. Task "create file"  */
	createFileAsync(name ,text); /* pseudo create-file command */
	
	console.log("File creation has started.");
}

function *(name) { /* Checks whether the file has been created. Task "check file" */
	if (error()) /* pseudo check on file creation error */
		return "error";
	
	return test(name); /* pseudo check file command */
}
```

##### Second way

```javascript
function *(name, text) {
	return new Promise((resolve, reject) => {
		createFileSync(name ,text); /* pseudo create-file command */
		
		if (error()) /* pseudo check on file creation error */
			reject();
		else
			resolve();
	});
}
```

___

There is no our own mechanism to run two async requests and get the result of one who is it faster.
More generally, for the current framework state there is no way to stop async thread in the module or to switch between sync data requests.
