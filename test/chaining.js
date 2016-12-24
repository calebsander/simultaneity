let a = false, b = false, c = false
const s = new Simultaneity
s
	.addTask(s => {
		setImmediate(() => {
			a = true
			s.taskFinished()
		})
	})
	.addTask(s => {
		setImmediate(() => {
			b = true
			s.taskFinished()
		})
	})
	.addTask(s => {
		setImmediate(() => {
			c = true
			s.taskFinished()
		})
	})
	.catch(err => {
		throw err
	})
	.callback(() => {
		assert(a)
		assert(b)
		assert(c)
	})