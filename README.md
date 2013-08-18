mox
===

A markdown javascript documentation generator

[![Build Status](https://travis-ci.org/tjchaplin/mox.png)](https://travis-ci.org/tjchaplin/mox)

##Purpose

This project allows extended flexiblity in generating markdown documentation for javascript projects.  The advantage of this project over others is:

* Allows you to easily create a table of contents of methods, declarations, categories, source file names
* Allows you to group your code using the **@category** tag
* Allows you to group your code using the source file name

It was inspired by the [lodash documentation](https://github.com/bestiejs/lodash/blob/master/doc/README.md).

Mox generates source documentation based on [jsdoc](http://usejsdoc.org/) and [dox](https://github.com/visionmedia/dox). For information on how to document your source see the following:
* [Use JsDoc Reference](http://usejsdoc.org/)
* [Dox reference](https://github.com/visionmedia/dox)

Mox templates use [jade](http://jade-lang.com/) as the templating engine.  To create custom templates see [jade documentation](http://jade-lang.com/reference/) for reference

## Install

```
npm install mox
```

## How to use

### Default Template

```javascript
var mox = require("../lib/mox");

var source1 = "./source1.js";
var source2 = "./source2.js";
var markdownDocumentationFile = "./someOutputfile.md";

mox.run([source1,source2], //->source files to generate documentation for
		markdownDocumentationFile); //->output markdown file
=> //markdown documentation file will be created to output directory
```

### Categroy Template

```javascript
var mox = require("../lib/mox");

var source1 = "./source1.js";
var source2 = "./source2.js";
var markdownDocumentationFile = "./someOutputfile.md";

mox.run([source1,source2], //->source files to generate documentation for
		markdownDocumentationFile, //->output markdown file
		'category'); //->specfies to use the category based template.  Table of contents will be based on **@categoy** tag
=> //markdown documentation file will be created to output directory
```

### File Template

```javascript
var mox = require("../lib/mox");

var source1 = "./source1.js";
var source2 = "./source2.js";
var markdownDocumentationFile = "./someOutputfile.md";

mox.run([source1,source2], //->source files to generate documentation for
		markdownDocumentationFile, //->output markdown file
		'file'); //->specfies to use the file based template.  Table of contents will be based on filenames of the sources
=> //markdown documentation file will be created to output directory
```

### Custom Template

A custom template can be created.  All templates must be created using jade.  See [jade documentation](http://jade-lang.com/reference/) for details on how to use jade.  The jade template will have access to the [mox](#mox-generated-comments) object.

Sample Custom template(customTemplate.jade)
```jade
doctype 5
html
	body
		h2 Application Objects, Functions, Declarations
		ul
			each comment in mox
				li
					a(href="##{comment.name.toLowerCase()}")= comment.name
		h2 Application Objects, Functions, Declarations
		each comment in mox
			h3= comment.name
			p!= comment.description.body
```

Here is how to use the custom template in mox

```javascript
var mox = require("../lib/mox");

var source1 = "./source1.js";
var source2 = "./source2.js";
var markdownDocumentationFile = "./someOutputfile.md";

var customTemplate = './customTemplate.jade';

mox.run([source1,source2], //->source files to generate documentation for
		markdownDocumentationFile, //->output markdown file
		customTemplate); //->specfies path to custom template
=> //markdown documentation file will be created to output directory
```

## What gets generated

Mox uses [dox](https://github.com/visionmedia/dox) to generate all documentation comments.  All dox comments will be available to use in a template.

Here is the object that gets created and is available to all templates:

```javascript
{
	mox : moxComments, //-> mox generated comments

	comments : allSourceComments, //-> generated dox comments

	files : files, //-> mox generated comments grouped by source filename
					//-> {tag: "nameOfile",
					//->  comment : **GeneratedMoxCommentObject**}

	categories : categories, //-> mox generated comments grouped by **@categoy** tag
							//-> {tag: "nameOfCategory",
							//->  comment : **GeneratedMoxCommentObject**}
}

```

### Mox generated comments

The mox generated comments are subset of [dox](https://github.com/visionmedia/dox) comments that allow for grouping and additional data

####Given class

```javascript
/**
 * A Class description
 *
 * Example:
 * 
 * ```javascript
 * SomeClass.someClassMethod(x);
 * ```
 *
 * @author Tim Chaplin
 * @category SomeClassCategory
 * @class SomeClass
 * @constructor
 * @param {String} param a parameter
 * @optional
 */
function SomeClass(){}
```

Generates mox object:

```javascript
[ 
	{ 
		params: [ 
			{
				types: ['Function', 'String'],
				name : "paramName",
				description : "description"
			}],
		name: 'SomeClass',
		type: 'function',
		fileName: 'someFileName.js',
		description: 
			{ 
				full: '<p>A Class description</p>\n\n<p>Example:</p>\n\n<div class="highlight"><pre lang="javascript">SomeClass.	someClassMethod(x);\n</pre></div>',
				summary: '<p>A Class description</p>',
				body: '<p>Example:</p>\n\n<div class="highlight"><pre lang="javascript">SomeClass.someClassMethod(x);\n</pre></div>' 
			},
		author: 'Tim Chaplin',
		category: 'SomeClassCategory',
		class: 'SomeClass',
		constructor: true,
		optional: true
	}
]
```

####Given Method

```javascript
function SomeClass(){
	/**
	 * SomeClassFunction
 	 *
 	 * Example:
 	 *
 	 * ```javascript
 	 * SomeClass.someClassMethod(x);
 	 * ```
	 * @category SomeClassCategory
	 * @method someClassMethod
	 * @param {Function|String} methodParam some method param
	 * @return {Function|String} A return value
	 * @chainable
	**/
	self.someClassMethod = function(methodParam) {
		self.lib.Plugins.loadPlugin(self, pluginPath);
		return self;
	};
}
```

Generates mox object:

```javascript
[ 
	{ 
		params: { 
			[{
			    types: ['Function', 'String'],
			    name : "paramName",
			    description : "description"
		    }],
		name: 'someClassMethod',
		type: 'method',
		fileName: 'someFileName.js',
		description: 
		{ 
			full: '<p>SomeClassFunction</p>\n\n<p>Example:</p>\n\n<div class="highlight"><pre lang="javascript">SomeClass.someClassMethod(x);\n</pre></div>',
			summary: '<p>SomeClassFunction</p>',
			body: '<p>Example:</p>\n\n<div class="highlight"><pre lang="javascript">SomeClass.someClassMethod(x);\n</pre></div>' 
		},
		category: 'SomeClassCategory',
		method: 'someClassMethod',
		return: { types: [Object], description: 'A return value' },
		chainable: true 
	}
]
```


####Given Declaration

```javascript
/** Some property Thing */
var aProperty = "alsdkfjaslfdj";
```

Generates mox object:

```javascript
[ 
  { 
	params: [],
	name: 'aProperty',
	type: 'declaration',
	fileName: 'someFileName.js',
	description: 
	{ 
		full: '<p>Some property Thing</p>',
		summary: '<p>Some property Thing</p>',
		body: '' 
	} 
   }
]
```