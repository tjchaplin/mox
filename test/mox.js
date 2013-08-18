var fs = require('fs');
var should = require("should");
var mox = require("../lib/mox");

describe("Given we are intercepting", function() {

	describe("When using multiple interceptors", function() {

		it("Then should be able to intercept", function() {
			var source = "./test/fixtures/functionSomeClass.js";
			var dest = "./test/tmp/functionSomeClass.md";
			var template = "./test/testTemplate.jade"
			var expectedFile = "./test/expected/functionSomeClass.md"
			mox.run([source],dest,template);

			var actual = fs.readFileSync(dest, 'ascii');
			var expected = fs.readFileSync(expectedFile, 'ascii');

			expected.should.be.eql(actual);
		});

	});
});