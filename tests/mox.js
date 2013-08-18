var fs = require('fs');
var path = require('path');
var assert = require('assert');
var mox = require("../lib/mox");

var forEachTestFixture = function(onTestFixture){
	var testFiles = fs.readdirSync(__dirname+'/fixtures');

	for (var i = 0; i < testFiles.length; i++) {
		var testFile = testFiles[i];
		testFile = testFile.substr(0, testFile.lastIndexOf('.')) || testFile;
		
		onTestFixture(testFile);
	}
};

var forEachNonDefaultTemplate = function(onTemplate){

	var templates = fs.readdirSync(path.resolve('./lib/templates'));

	for (var i = 0; i < templates.length; i++) {
		var templateFile = templates[i];
		templateFile = templateFile.substr(0, templateFile.lastIndexOf('.')) || templateFile;
		if(templateFile !== 'default')
			onTemplate(templateFile);
	}
};

describe("Given we are generating documentation markdown", function() {

	describe("When using the default template", function() {

		it("Then should be able to generate the expected markdown for all source files", function() {
			
			forEachTestFixture(function(testFixtureFileName){

				var dest = "./tests/tmp/"+testFixtureFileName+".md";
				var source = "./tests/fixtures/"+testFixtureFileName+".js";
				var expectedFile = "./tests/expected/"+testFixtureFileName+".md";

				mox.run(source,dest);

				var actual = fs.readFileSync(dest, 'ascii');
				var expected = fs.readFileSync(expectedFile, 'ascii');

				assert(expected === actual,"Expected File("+expectedFile+")"+" Doesn't match result file("+dest+") for("+source+")");
			});

		});

	});

	describe("When using the defined templates", function() {

		it("Then should be able to generate the expected markdown for all source files", function() {
			
			forEachTestFixture(function(testFixtureFileName){

				forEachNonDefaultTemplate(function(templateName){
					var dest = "./tests/tmp/templates/"+templateName+"/"+testFixtureFileName+".md";
					var source = "./tests/fixtures/"+testFixtureFileName+".js";
					var expectedFile = "./tests/expected/templates/"+templateName+"/"+testFixtureFileName+".md";

					mox.run(source,dest,templateName);

					var actual = fs.readFileSync(dest, 'ascii');
					var expected = fs.readFileSync(expectedFile, 'ascii');

					assert(expected === actual,"Expected File("+expectedFile+")"+" Doesn't match result file("+dest+") for("+source+")");
				});

			});

		});
	});

});
describe("Given we are running mox", function() {

	describe("When no source defined", function() {

		it("Then should throw an error", function() {
			var exceptionThrown = false;

			try{
				mox.run();
			}catch(exception){
				exceptionThrown = true;
			}

			assert(exceptionThrown);
		});
	});

	describe("When no destination defined", function() {

		it("Then should throw an error", function() {
			var exceptionThrown = false;

			try{
				mox.run('someFile.js');
			}catch(exception){
				exceptionThrown = true;
			}

			assert(exceptionThrown);
		});
	});
});
