#Examples

##mox predefined templates

###Default

Template that groups methods and declarations.  Example here:

[`default mox template`](https://github.com/tjchaplin/mox/tree/master/doc/default)

###Category

Template that groups **@category** tag.  Example here:

[`category mox template`](https://github.com/tjchaplin/mox/tree/master/doc/category)

###File

Template that groups by the file passed into mox.  Example here:

[`file mox template`](https://github.com/tjchaplin/mox/tree/master/doc/file)

##How to use a predefined template

```javascript
var mox = require("../lib/mox");

var source1 = "./source1.js";

//->specfies to use the category based template.  Table of contents will be based on **@categoy** tag
mox.run(source1,{template:"category"})
	.pipe(process.stdout);
```

##Code being documented in example templates:

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
 * @example
 */
function SomeClass(){
	/** 
	 * Some property description
	 * @category SomeClassCategory
	 */
	var aProperty = "alsdkfjaslfdj";

	/** 
	 * Some property with type description
	 * @category SomeClassCategory
	 * @type {String}
	 */
	var aPropertyWithType = "alsdkfjaslfdj";

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


/**
 * A Class description
 *
 * Example:
 * 
 * ```javascript
 * SomeClass2.someClassMethod(x);
 * ```
 * 
 * @category SomeClassCategory2
 * @class SomeClass2
 * @constructor
 * @param {String} param a parameter
 * @optional
 * @example
 */
function SomeClass2(){

	/**
	 * SomeClass2Function
	 *
	 * Example:
	 * 
	 * ```javascript
	 * SomeClass2.someClassMethod(x);
	 * ```
	 * 
	 * @category SomeClassCategory2
	 * @method someClass2Method2
	 * @param {Function} methodParam some method param
	 * @param {Function} methodParam2 some method param
	 * @return {String} A return value
	 * @chainable
	**/
	self.someClassMethod2 = function(methodParam,methodParam2) {
		self.lib.Plugins.loadPlugin(self, pluginPath);
		return self;
	};
}
```