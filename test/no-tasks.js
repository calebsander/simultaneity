const s = new Simultaneity
let callbackCalled = false
s.callback(() => callbackCalled = true)
setTimeout(() => {
	assert(callbackCalled)
}, 100)