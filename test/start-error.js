const TASKS = 100
const s = new Simultaneity
let startCount = 0
const errorConstructors = new Map
for (let i = 1; i <= TASKS; i++) {
	errorConstructors.set(i, class extends Error {})
	s.addTask(s => {
		startCount++
		throw new (errorConstructors.get(i))
	})
}
let callbackCalled = false
assert.throws(
	() => {
		s.callback(() => callbackCalled = true)
	},
	errorConstructors.get(1)
)
assert.strictEqual(startCount, 1)
setTimeout(() => {
	assert(!callbackCalled)
}, 100)

const catchS = new Simultaneity
for (let i = 1; i <= TASKS; i++) {
	catchS.addTask(s => {
		startCount++
		throw new (errorConstructors.get(i))
		s.taskFinished()
	})
}
let errCaught = null
catchS.catch(err => errCaught = err)
let catchCallbackCalled = false
catchS.callback(() => catchCallbackCalled = true)
setTimeout(() => {
	assert(errCaught !== null)
	assert.strictEqual(errCaught.constructor, errorConstructors.get(1))
	assert(!catchCallbackCalled)
}, 100)