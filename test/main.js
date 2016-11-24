//For this file
const fs = require('fs')
const path = require('path')

//For tests
const assert = require('assert')
const Simultaneity = require(__dirname + '/../index.js')

let asyncErrors = 0
fs.readdir(__dirname, (err, tests) => {
	if (err) throw err
	const testsS = new Simultaneity
	let passed = 0
	let total = 0
	function testFile(testPath) {
		fs.readFile(testPath, (err, data) => {
			if (err) throw err
			total++
			try {
				eval(data.toString())
				passed++
			}
			catch (e) {
				console.error('Error in test file ' + testPath)
				console.error(e)
			}
			testsS.taskFinished()
		})
	}
	for (const test of tests) {
		const testPath = path.join(__dirname, test)
		if (path.normalize(testPath) === __filename) continue
		testsS.addTask(() => testFile(testPath))
	}
	testsS.callback(() => {})
	process.on('exit', () => {
		console.log(
			String(passed) +
			' (synchronous parts of) tests out of ' +
			String(total) +
			' passed (' +
			Math.round(passed / total * 100) +
			'%)'
		)
		process.exitCode = total - passed + asyncErrors
	}).on('uncaughtException', err => {
		console.error('Error occurred in async test:')
		console.error(err)
		Simultaneity.endAll()
		asyncErrors++
	})
})