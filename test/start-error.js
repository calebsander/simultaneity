const TASKS = 100
const s = new Simultaneity
let startCount = 0
const errorConstructors = new Map
for (let i = 1; i <= TASKS; i++) {
	errorConstructors.set(i, class extends Error {})
	s.addTask(() => {
		startCount++
		throw new (errorConstructors.get(i))
	})
}
let callbackCalled = false
assert.throws(
	() => {
		s.callback(() => {
			callbackCalled = true
		})
	},
	errorConstructors.get(1)
)
assert.strictEqual(startCount, 1)
assert(callbackCalled)