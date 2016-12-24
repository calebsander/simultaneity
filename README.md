# simultaneity
A Node.js library to attach callbacks to sets of asynchronous tasks.

[![npm Version](https://img.shields.io/npm/v/simultaneity.svg)](https://www.npmjs.com/package/simultaneity)
[![Build Status](https://travis-ci.org/calebsander/simultaneity.svg?branch=master)](https://travis-ci.org/calebsander/simultaneity)

## Concept
When writing asynchronous code, I often find myself needing to initiate several asynchronous tasks and then wait until they have all finished before running another callback function. One possible solution is to run task 1, then start task 2 in the callback for task 1, start task 3 in the callback for task 2, and so on. But this is wildly inefficient because it can't leverage the speed improvements of waiting on async tasks in parallel. The ideal solution is to be able to start all the tasks at once and have each of them check in its callback whether it was the last one to finish, and if so, run the callback. To reduce the overhead of writing this each time, I developed this library which keeps track of starting the tasks and running the callback as soon as they have all finished.

## API
- `new Simultaneity()`: creates a new collection of asynchronous tasks
- `s.addTask(startTask)`: adds a new task to the set of asynchronous tasks. `startTask` should be a function that will initiate the task when called. `startTask` will be passed `s` as its only argument. NOTE: the task is not actually started until `s.callback()` is called.
- `s.taskFinished()`: alerts the `Simultaneity` that the task has finished so it can call the callback if necessary. Each instance of `s.addTask()` should always call `s.taskFinished()` once somewhere inside it. If you have an extra call to `s.taskFinished()`, the callback will be invoked before all tasks have actually finished; if you are missing a call to `s.taskFinished()`, the callback will never be called.
- `s.catch(errorCallback)`: sets a callback function that will run if an error is thrown when starting a task and be passed the error that was thrown
- `s.callback(callback)`: sets a callback function to run when all the tasks have finished and then starts each task. `callback` should be a function. If any of the task initiation functions throw an error, the callback function will be called once and `s.callback()` will throw the error.
- `s.endAll()`: ungracefully calls the callback for each started Simultaneity that has not yet ended, i.e. `s.callback()` was called on it but some tasks are still running.

## Examples
### A fixed set of tasks
````javascript
//Combines data from two JSON files

const fs = require('fs')
const Simultaneity = require('simultaneity')

const combinedJSON = {}
const s = new Simultaneity
s
	.addTask(s => {
		fs.readFile('file1.json', (err, data) => {
			if (err) throw err
			Object.assign(combinedJSON, JSON.parse(data)) //{"abc":1,"def":false}
			s.taskFinished()
		})
	})
	.addTask(s => {
		fs.readFile('file2.json', (err, data) => {
			if (err) throw err
			Object.assign(combinedJSON, JSON.parse(data)) //{"uvw":"test","xyz":null}
			s.taskFinished()
		})
	})
	.callback(() => console.log(combinedJSON)) //{ abc: 1, def: false, uvw: 'test', xyz: null }
````

### A variable set of tasks
````javascript
//Calculates the total size of all the files in the current directory

const fs = require('fs')
const path = require('path')
const Simultaneity = require('simultaneity')

fs.readdir('.', (err, files) => {
	if (err) throw err
	const s = new Simultaneity
	let totalSize = 0
	for (const file of files) {
		s.addTask(s => {
			fs.stat(file, (err, stats) => {
				if (err) throw err
				if (!stats.isDirectory()) totalSize += stats.size
				s.taskFinished()
			})
		})
	}
	s.callback(() => console.log(`Total size: ${totalSize} bytes`)) //Total size: 1115 bytes
})
````