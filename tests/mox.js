var fs = require('fs');
var path = require('path');
var assert = require('assert');
var mox = require("../lib/mox");
var concat = require("concat-stream");
var domain = require('domain');

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

var streamAssertion = function (source,options,expectedFile,done) {
	mox(options,source).run().pipe(concat(function(generatedMarkdown) {
		generatedMarkdown = generatedMarkdown.toString().replace(/\r\n/g,'\n').replace(/\r/g,'');
		var expected = fs.readFileSync(expectedFile, 'utf8').replace(/\r\n/g,'\n').replace(/\r/g,'');
		assert(expected == generatedMarkdown,"Expected File("+expectedFile+")"+" Doesn't match result file("+options.outputFile+") for("+source+")");					
		done();							
	}));
};

var outputAssertion  = function (source,options,expectedFile,done) {
	var dd = domain.create();
	dd.on('error',function(error){
		console.log(error);
	});
	dd.run(function(){
		mox(options,source).run(function(error,data){
			var actual = fs.readFileSync(options.outputFile, 'ascii').replace(/\r\n/g,'\n').replace(/\r/g,'');
			var expected = fs.readFileSync(expectedFile, 'ascii').replace(/\r\n/g,'\n').replace(/\r/g,'');

			assert(expected == actual,"Expected File("+expectedFile+")"+" Doesn't match result file("+options.outputFile+") for("+source+")");					
			done();					
		});
	});	
};

describe("Given we are generating documentation markdown", function() {
	describe("When streaming markdown",function(){
		describe("When using the default template", function() {
			it("Then should be able to generate the expected markdown for all source files", function(done) {
				forEachTestFixture(function(testFixtureFileName){
					var source = "./tests/fixtures/"+testFixtureFileName+".js";
					var expectedFile = "./tests/expected/"+testFixtureFileName+".md";

					var options = {
						name : "PackageName",
						version : "v0.0.1"
					};
					streamAssertion(source,options,expectedFile,done);
				});
			});
		});
		describe("When using the defined templates", function() {
			forEachTestFixture(function(testFixtureFileName){
				forEachNonDefaultTemplate(function(templateName){
					it("Then should be able to generate the expected markdown for "+templateName+" template", function(done) {
							var source = "./tests/fixtures/"+testFixtureFileName+".js";
							var expectedFile = "./tests/expected/templates/"+templateName+"/"+testFixtureFileName+".md";

							var options = {
								template : templateName
							};

							streamAssertion(source,options,expectedFile,done);
						});
					});
				});
		});
		describe("When using the default template", function() {

			it("Then should be able to generate the expected markdown for a source directory", function(done) {
				
				var source = "./tests/fixtures/";
				var expectedFile = "./tests/expected/allSources.md";

				var options = {
					outputFile : "./tests/tmp/allSources.md"
				};

				streamAssertion(source,options,expectedFile,done);
			});
		});
	});

	describe("when generating output files",function(){
		describe("When using the default template", function() {

			it("Then should be able to generate the expected markdown for all source files", function(done) {
				
				forEachTestFixture(function(testFixtureFileName){

					var source = "./tests/fixtures/"+testFixtureFileName+".js";
					var expectedFile = "./tests/expected/"+testFixtureFileName+".md";

					var options = {
						name : "PackageName",
						version : "v0.0.1",
						outputFile : "./tests/tmp/"+testFixtureFileName+".md"
					};

					outputAssertion(source,options,expectedFile,done);
				});
			});
		});

		describe("When using the defined templates", function() {

			forEachTestFixture(function(testFixtureFileName){

					forEachNonDefaultTemplate(function(templateName){

						it("Then should be able to generate the expected markdown for "+templateName+" template", function(done) {

							var source = "./tests/fixtures/"+testFixtureFileName+".js";
							var expectedFile = "./tests/expected/templates/"+templateName+"/"+testFixtureFileName+".md";

							var options = {
								outputFile : "./tests/tmp/templates/"+templateName+"/"+testFixtureFileName+".md",
								htmlFile : "./tests/tmp/html/templates/"+templateName+"/"+testFixtureFileName+".html",
								template : templateName
							};

							outputAssertion(source,options,expectedFile,done);
						});
					});

				});
		});

		describe("When using the default template", function() {

			it("Then should be able to generate the expected markdown for a source directory", function(done) {
				
				var source = "./tests/fixtures/";
				var expectedFile = "./tests/expected/allSources.md";

				var options = {
					outputFile : "./tests/tmp/allSources.md"
				};

				outputAssertion(source,options,expectedFile,done);
			});

		});

		describe("When using the html output file option", function() {

			it("Then should be able to generate the expected html for all source files", function(done) {
				
				forEachTestFixture(function(testFixtureFileName){

					var source = "./tests/fixtures/"+testFixtureFileName+".js";
					var expectedFile = "./tests/expected/"+testFixtureFileName+".html";

					var options = {
						htmlFile : "./tests/tmp/"+testFixtureFileName+".html"
					};

					mox(options,source).run(function(error,data){
						var actual = fs.readFileSync(options.htmlFile, 'ascii').replace(/\r\n/g,'\n').replace(/\r/g,'');
						var expected = fs.readFileSync(expectedFile, 'ascii').replace(/\r\n/g,'\n').replace(/\r/g,'');

						assert(expected === actual,"Expected File("+expectedFile+")"+" Doesn't match result file("+options.htmlFile+") for("+source+")");					
						done();					
					});
				});
			});
		});

		describe("When using the mox json output file option", function() {

			it("Then should be able to generate the expected json for all source files", function(done) {
				
				forEachTestFixture(function(testFixtureFileName){

					var source = "./tests/fixtures/"+testFixtureFileName+".js";
					var expectedFile = "./tests/expected/"+testFixtureFileName+".json";

					var options = {
						moxFile : "./tests/tmp/"+testFixtureFileName+".json"
					};

					mox(options,source).run().on('end',function(){
						var actual = fs.readFileSync(options.moxFile, 'ascii').replace(/\r\n/g,'\n').replace(/\r/g,'');
						var expected = fs.readFileSync(expectedFile, 'ascii').replace(/\r\n/g,'\n').replace(/\r/g,'');

						assert(expected === actual,"Expected File("+expectedFile+")"+" Doesn't match result file("+options.moxFile+") for("+source+")");					
						done();					
					});


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
				mox().run();
			}catch(exception){
				exceptionThrown = true;
			}

			assert(exceptionThrown);
		});
		describe("When calback defined", function() {
			it("Then should throw an error in callback", function(done) {
				mox(null).run(function(error) {
					assert(true);
					done();
				});
			});
		});
	});

	describe("When no destination defined", function() {

		it("Then should throw an error", function() {
			var exceptionThrown = false;

			try{
				mox('someFile.js').run();
			}catch(exception){
				exceptionThrown = true;
			}

			assert(exceptionThrown);
		});
		describe("When calback defined", function() {
			it("Then should throw an error in callback", function(done) {
				mox('someFile.js').run(function(error) {
					assert(true);
					done();
				});
			});
		});
	});
});
