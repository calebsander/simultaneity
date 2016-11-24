const SIMULTANEITIES = 10
const CLOSE_TIMES = 100
const closeCounts = new Map
for (let i = 0; i < SIMULTANEITIES; i++) {
	closeCounts.set(i, 0)
	const s = new Simultaneity
	s.addTask(() => {}) //intentionally no s.taskFinished()
	s.callback(() => closeCounts.set(i, closeCounts.get(i) + 1))
}
for (let i = 0; i < CLOSE_TIMES; i++) Simultaneity.endAll()
assert.equal(closeCounts.size, SIMULTANEITIES)
for (const [_, closeCount] of closeCounts) assert.equal(closeCount, 1)