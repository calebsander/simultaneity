const NUMBERS = 100
const s = new Simultaneity
const numberList = []
for (let i = 1; i <= NUMBERS; i++) {
	const insertIndex = Math.floor(Math.random() * (numberList.length + 1))
	numberList.splice(insertIndex, 0, i)
}
const TIMEOUT_INCREMENT = 10
const numberSet = new Set
numberList.forEach((number, index) => {
	s.addTask(() => {
		setTimeout(() => {
			numberSet.add(number)
			s.taskFinished()
		}, TIMEOUT_INCREMENT * index)
	})
})
assert.strictEqual(numberSet.size, 0)
let callbackCalled = false
s.callback(() => {
	assert.strictEqual(numberSet.size, NUMBERS)
	for (let i = 1; i <= NUMBERS; i++) assert(numberSet.has(i))
	callbackCalled = true
})
setTimeout(() => assert(callbackCalled), NUMBERS * TIMEOUT_INCREMENT * 1.1) //give 10% more time to ensure callback was called