const openSimultaneities = new Set

/*
	Runs multiple asynchronous tasks with a callback for when they have all finished
	Usage:
	const s = new Simultaneity
	s
		.addTask(s => {
			asynchSomething(data => {
				...
				s.taskFinished()
			})
		})
		.addTask(s => {
			asynchSomething2(data => {
				s.taskFinished()
			})
		})
		...
		.catch(err => {...})
		.callback(() => {...})
*/
module.exports = class Simultaneity {
	constructor() {
		this.tasks = new Set
		this.finishedCount = 0
	}
	//Adds a routine to be executed to start an asynchronous task
	addTask(start) {
		this.tasks.add(start)
		return this
	}
	//Should be called whenever an asynchronous task completes
	taskFinished() {
		this.finishedCount++
		if (this.finishedCount === this.tasks.size) { //all tasks have ended
			openSimultaneities.delete(this)
			this.done()
		}
	}
	//Specify what to do if an error is thrown when starting tasks
	catch(errorCallback) {
		this.errorCallback = errorCallback
		return this
	}
	//Set a callback for when all the tasks finish and start all the tasks
	callback(callback) {
		if (!this.tasks.size) {
			setImmediate(callback)
			return
		}
		this.done = callback
		openSimultaneities.add(this)
		try {
			for (const startTask of this.tasks) startTask(this)
		}
		catch (err) {
			if (this.errorCallback) this.errorCallback(err)
			else throw err
		}
	}
	//Forcibly call the callback for each started Simultaneity that has not yet ended
	static endAll() {
		for (const openSimultaneity of openSimultaneities) openSimultaneity.done()
		openSimultaneities.clear()
	}
}