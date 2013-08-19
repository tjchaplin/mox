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