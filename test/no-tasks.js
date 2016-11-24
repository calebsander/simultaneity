const s = new Simultaneity
let callbackCalled = false
s.callback(() => callbackCalled = true)
assert(callbackCalled)