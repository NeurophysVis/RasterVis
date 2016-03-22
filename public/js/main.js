(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('rasterVis', ['exports'], factory) :
  (factory((global.rasterVis = global.rasterVis || {})));
}(this, function (exports) { 'use strict';

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = { 'array': [], 'map': null };
  }

  /**
   * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'user': 'fred' };
   * var other = { 'user': 'fred' };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /**
   * Gets the index at which the first occurrence of `key` is found in `array`
   * of key-value pairs.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  /** Used for built-in method references. */
  var arrayProto = Array.prototype;

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /**
   * Removes `key` and its value from the associative array.
   *
   * @private
   * @param {Array} array The array to query.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function assocDelete(array, key) {
    var index = assocIndexOf(array, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = array.length - 1;
    if (index == lastIndex) {
      array.pop();
    } else {
      splice.call(array, index, 1);
    }
    return true;
  }

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
        array = data.array;

    return array ? assocDelete(array, key) : data.map['delete'](key);
  }

  /**
   * Gets the associative array value for `key`.
   *
   * @private
   * @param {Array} array The array to query.
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function assocGet(array, key) {
    var index = assocIndexOf(array, key);
    return index < 0 ? undefined : array[index][1];
  }

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    var data = this.__data__,
        array = data.array;

    return array ? assocGet(array, key) : data.map.get(key);
  }

  /**
   * Checks if an associative array value for `key` exists.
   *
   * @private
   * @param {Array} array The array to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function assocHas(array, key) {
    return assocIndexOf(array, key) > -1;
  }

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    var data = this.__data__,
        array = data.array;

    return array ? assocHas(array, key) : data.map.has(key);
  }

  /**
   * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  var funcTag = '[object Function]';
  var genTag = '[object GeneratorFunction]';
  /** Used for built-in method references. */
  var objectProto$2 = Object.prototype;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto$2.toString;

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 8 which returns 'object' for typed array and weak map constructors,
    // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
    var tag = isObject(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  /**
   * Checks if `value` is a host object in IE < 9.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
   */
  function isHostObject(value) {
    // Many host objects are `Object` objects that can coerce to strings
    // despite having improperly defined `toString` methods.
    var result = false;
    if (value != null && typeof value.toString != 'function') {
      try {
        result = !!(value + '');
      } catch (e) {}
    }
    return result;
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /** Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns). */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari > 5). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = Function.prototype.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto$1.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * Checks if `value` is a native function.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
   * @example
   *
   * _.isNative(Array.prototype.push);
   * // => true
   *
   * _.isNative(_);
   * // => false
   */
  function isNative(value) {
    if (value == null) {
      return false;
    }
    if (isFunction(value)) {
      return reIsNative.test(funcToString.call(value));
    }
    return isObjectLike(value) &&
      (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = object[key];
    return isNative(value) ? value : undefined;
  }

  /* Built-in method references that are verified to be native. */
  var nativeCreate = getNative(Object, 'create');

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Creates an hash object.
   *
   * @private
   * @constructor
   * @returns {Object} Returns the new hash object.
   */
  function Hash() {}

  // Avoid inheriting from `Object.prototype` when possible.
  Hash.prototype = nativeCreate ? nativeCreate(null) : objectProto;

  /**
   * Checks if `value` is a global object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {null|Object} Returns `value` if it's a global object, else `null`.
   */
  function checkGlobal(value) {
    return (value && value.Object === Object) ? value : null;
  }

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Detect free variable `exports`. */
  var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
    ? exports
    : undefined;

  /** Detect free variable `module`. */
  var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
    ? module
    : undefined;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);

  /** Detect free variable `self`. */
  var freeSelf = checkGlobal(objectTypes[typeof self] && self);

  /** Detect free variable `window`. */
  var freeWindow = checkGlobal(objectTypes[typeof window] && window);

  /** Detect `this` as the global object. */
  var thisGlobal = checkGlobal(objectTypes[typeof this] && this);

  /**
   * Used as a reference to the global object.
   *
   * The `this` value is used if it's the global object to avoid Greasemonkey's
   * restricted `window` object, otherwise the `window` object is used.
   */
  var root = freeGlobal ||
    ((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
      freeSelf || thisGlobal || Function('return this')();

  /* Built-in method references that are verified to be native. */
  var Map = getNative(root, 'Map');

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapClear() {
    this.__data__ = {
      'hash': new Hash,
      'map': Map ? new Map : [],
      'string': new Hash
    };
  }

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$3.hasOwnProperty;

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @param {Object} hash The hash to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(hash, key) {
    return nativeCreate ? hash[key] !== undefined : hasOwnProperty$1.call(hash, key);
  }

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(hash, key) {
    return hashHas(hash, key) && delete hash[key];
  }

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return type == 'number' || type == 'boolean' ||
      (type == 'string' && value != '__proto__') || value == null;
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapDelete(key) {
    var data = this.__data__;
    if (isKeyable(key)) {
      return hashDelete(typeof key == 'string' ? data.string : data.hash, key);
    }
    return Map ? data.map['delete'](key) : assocDelete(data.map, key);
  }

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$4.hasOwnProperty;

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @param {Object} hash The hash to query.
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(hash, key) {
    if (nativeCreate) {
      var result = hash[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty$2.call(hash, key) ? hash[key] : undefined;
  }

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapGet(key) {
    var data = this.__data__;
    if (isKeyable(key)) {
      return hashGet(typeof key == 'string' ? data.string : data.hash, key);
    }
    return Map ? data.map.get(key) : assocGet(data.map, key);
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapHas(key) {
    var data = this.__data__;
    if (isKeyable(key)) {
      return hashHas(typeof key == 'string' ? data.string : data.hash, key);
    }
    return Map ? data.map.has(key) : assocHas(data.map, key);
  }

  /**
   * Sets the associative array `key` to `value`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   */
  function assocSet(array, key, value) {
    var index = assocIndexOf(array, key);
    if (index < 0) {
      array.push([key, value]);
    } else {
      array[index][1] = value;
    }
  }

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   */
  function hashSet(hash, key, value) {
    hash[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache object.
   */
  function mapSet(key, value) {
    var data = this.__data__;
    if (isKeyable(key)) {
      hashSet(typeof key == 'string' ? data.string : data.hash, key, value);
    } else if (Map) {
      data.map.set(key, value);
    } else {
      assocSet(data.map, key, value);
    }
    return this;
  }

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [values] The values to cache.
   */
  function MapCache(values) {
    var index = -1,
        length = values ? values.length : 0;

    this.clear();
    while (++index < length) {
      var entry = values[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add functions to the `MapCache`.
  MapCache.prototype.clear = mapClear;
  MapCache.prototype['delete'] = mapDelete;
  MapCache.prototype.get = mapGet;
  MapCache.prototype.has = mapHas;
  MapCache.prototype.set = mapSet;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache object.
   */
  function stackSet(key, value) {
    var data = this.__data__,
        array = data.array;

    if (array) {
      if (array.length < (LARGE_ARRAY_SIZE - 1)) {
        assocSet(array, key, value);
      } else {
        data.array = null;
        data.map = new MapCache(array);
      }
    }
    var map = data.map;
    if (map) {
      map.set(key, value);
    }
    return this;
  }

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [values] The values to cache.
   */
  function Stack(values) {
    var index = -1,
        length = values ? values.length : 0;

    this.clear();
    while (++index < length) {
      var entry = values[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add functions to the `Stack` cache.
  Stack.prototype.clear = stackClear;
  Stack.prototype['delete'] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * This function is like `assignValue` except that it doesn't assign
   * `undefined` values.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignMergeValue(object, key, value) {
    if ((value !== undefined && !eq(object[key], value)) ||
        (typeof key == 'number' && value === undefined && !(key in object))) {
      object[key] = value;
    }
  }

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$3.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
      object[key] = value;
    }
  }

  /**
   * This function is like `copyObject` except that it accepts a function to
   * customize copied values.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property names to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObjectWith(source, props, object, customizer) {
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : source[key];

      assignValue(object, key, newValue);
    }
    return object;
  }

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property names to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object) {
    return copyObjectWith(source, props, object);
  }

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

  /** Built-in value references. */
  var getPrototypeOf = Object.getPrototypeOf;

  /**
   * The base implementation of `_.has` without support for deep paths.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} key The key to check.
   * @returns {boolean} Returns `true` if `key` exists, else `false`.
   */
  function baseHas(object, key) {
    // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
    // that are composed entirely of index properties, return `false` for
    // `hasOwnProperty` checks of them.
    return hasOwnProperty$4.call(object, key) ||
      (typeof object == 'object' && key in object && getPrototypeOf(object) === null);
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = Object.keys;

  /**
   * The base implementation of `_.keys` which doesn't skip the constructor
   * property of prototypes or treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    return nativeKeys(Object(object));
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new function.
   */
  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  /**
   * Gets the "length" property value of `object`.
   *
   * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
   * that affects Safari on at least iOS 8.1-8.3 ARM64.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {*} Returns the "length" value.
   */
  var getLength = baseProperty('length');

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(getLength(value)) && !isFunction(value);
  }

  /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]';

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString$1 = objectProto$7.toString;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$7.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
    return isArrayLikeObject(value) && hasOwnProperty$5.call(value, 'callee') &&
      (!propertyIsEnumerable.call(value, 'callee') || objectToString$1.call(value) == argsTag$1);
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @type {Function}
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /** `Object#toString` result references. */
  var stringTag$1 = '[object String]';

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString$2 = objectProto$8.toString;

  /**
   * Checks if `value` is classified as a `String` primitive or object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isString('abc');
   * // => true
   *
   * _.isString(1);
   * // => false
   */
  function isString(value) {
    return typeof value == 'string' ||
      (!isArray(value) && isObjectLike(value) && objectToString$2.call(value) == stringTag$1);
  }

  /**
   * Creates an array of index keys for `object` values of arrays,
   * `arguments` objects, and strings, otherwise `null` is returned.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array|null} Returns index keys, else `null`.
   */
  function indexKeys(object) {
    var length = object ? object.length : undefined;
    if (isLength(length) &&
        (isArray(object) || isString(object) || isArguments(object))) {
      return baseTimes(length, String);
    }
    return null;
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
    length = length == null ? MAX_SAFE_INTEGER$1 : length;
    return value > -1 && value % 1 == 0 && value < length;
  }

  /** Used for built-in method references. */
  var objectProto$9 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$9;

    return value === proto;
  }

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    var isProto = isPrototype(object);
    if (!(isProto || isArrayLike(object))) {
      return baseKeys(object);
    }
    var indexes = indexKeys(object),
        skipIndexes = !!indexes,
        result = indexes || [],
        length = result.length;

    for (var key in object) {
      if (baseHas(object, key) &&
          !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
          !(isProto && key == 'constructor')) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object);
  }

  /**
   * Creates a base function for methods like `_.forIn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  /**
   * The base implementation of `baseForIn` and `baseForOwn` which iterates
   * over `object` properties returned by `keysFunc` invoking `iteratee` for
   * each property. Iteratee functions may exit iteration early by explicitly
   * returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
  var baseFor = createBaseFor();

  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }

  /**
   * Creates a clone of  `buffer`.
   *
   * @private
   * @param {Buffer} buffer The buffer to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Buffer} Returns the cloned buffer.
   */
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var result = new buffer.constructor(buffer.length);
    buffer.copy(result);
    return result;
  }

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
  function copyArray(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  /** Built-in value references. */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own symbol properties of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols = getOwnPropertySymbols || function() {
    return [];
  };

  /**
   * Copies own symbol properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols(source, object) {
    return copyObject(source, getSymbols(source), object);
  }

  /* Built-in method references that are verified to be native. */
  var Set = getNative(root, 'Set');

  /* Built-in method references that are verified to be native. */
  var WeakMap = getNative(root, 'WeakMap');

  var mapTag$1 = '[object Map]';
  var objectTag$1 = '[object Object]';
  var setTag$1 = '[object Set]';
  var weakMapTag$1 = '[object WeakMap]';
  /** Used for built-in method references. */
  var objectProto$10 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = Function.prototype.toString;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString$3 = objectProto$10.toString;

  /** Used to detect maps, sets, and weakmaps. */
  var mapCtorString = Map ? funcToString$1.call(Map) : '';
  var setCtorString = Set ? funcToString$1.call(Set) : '';
  var weakMapCtorString = WeakMap ? funcToString$1.call(WeakMap) : '';
  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function getTag(value) {
    return objectToString$3.call(value);
  }

  // Fallback for IE 11 providing `toStringTag` values for maps, sets, and weakmaps.
  if ((Map && getTag(new Map) != mapTag$1) ||
      (Set && getTag(new Set) != setTag$1) ||
      (WeakMap && getTag(new WeakMap) != weakMapTag$1)) {
    getTag = function(value) {
      var result = objectToString$3.call(value),
          Ctor = result == objectTag$1 ? value.constructor : null,
          ctorString = typeof Ctor == 'function' ? funcToString$1.call(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case mapCtorString: return mapTag$1;
          case setCtorString: return setTag$1;
          case weakMapCtorString: return weakMapTag$1;
        }
      }
      return result;
    };
  }

  var getTag$1 = getTag;

  /** Used for built-in method references. */
  var objectProto$11 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$11.hasOwnProperty;

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray(array) {
    var length = array.length,
        result = array.constructor(length);

    // Add properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty$6.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  /** Built-in value references. */
  var Uint8Array$1 = root.Uint8Array;

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer));
    return result;
  }

  /**
   * Adds the key-value `pair` to `map`.
   *
   * @private
   * @param {Object} map The map to modify.
   * @param {Array} pair The key-value pair to add.
   * @returns {Object} Returns `map`.
   */
  function addMapEntry(map, pair) {
    // Don't return `Map#set` because it doesn't return the map instance in IE 11.
    map.set(pair[0], pair[1]);
    return map;
  }

  /**
   * A specialized version of `_.reduce` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initAccum] Specify using the first element of `array` as the initial value.
   * @returns {*} Returns the accumulated value.
   */
  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array.length;

    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  /**
   * Converts `map` to an array.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the converted array.
   */
  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);

    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  /**
   * Creates a clone of `map`.
   *
   * @private
   * @param {Object} map The map to clone.
   * @returns {Object} Returns the cloned map.
   */
  function cloneMap(map) {
    return arrayReduce(mapToArray(map), addMapEntry, new map.constructor);
  }

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /**
   * Creates a clone of `regexp`.
   *
   * @private
   * @param {Object} regexp The regexp to clone.
   * @returns {Object} Returns the cloned regexp.
   */
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }

  /**
   * Adds `value` to `set`.
   *
   * @private
   * @param {Object} set The set to modify.
   * @param {*} value The value to add.
   * @returns {Object} Returns `set`.
   */
  function addSetEntry(set, value) {
    set.add(value);
    return set;
  }

  /**
   * Converts `set` to an array.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the converted array.
   */
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }

  /**
   * Creates a clone of `set`.
   *
   * @private
   * @param {Object} set The set to clone.
   * @returns {Object} Returns the cloned set.
   */
  function cloneSet(set) {
    return arrayReduce(setToArray(set), addSetEntry, new set.constructor);
  }

  /** Built-in value references. */
  var Symbol = root.Symbol;

  var symbolProto = Symbol ? Symbol.prototype : undefined;
  var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
  /**
   * Creates a clone of the `symbol` object.
   *
   * @private
   * @param {Object} symbol The symbol object to clone.
   * @returns {Object} Returns the cloned symbol object.
   */
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  var boolTag$1 = '[object Boolean]';
  var dateTag$1 = '[object Date]';
  var mapTag$2 = '[object Map]';
  var numberTag$1 = '[object Number]';
  var regexpTag$1 = '[object RegExp]';
  var setTag$2 = '[object Set]';
  var stringTag$2 = '[object String]';
  var symbolTag$1 = '[object Symbol]';
  var arrayBufferTag$1 = '[object ArrayBuffer]';
  var float32Tag$1 = '[object Float32Array]';
  var float64Tag$1 = '[object Float64Array]';
  var int8Tag$1 = '[object Int8Array]';
  var int16Tag$1 = '[object Int16Array]';
  var int32Tag$1 = '[object Int32Array]';
  var uint8Tag$1 = '[object Uint8Array]';
  var uint8ClampedTag$1 = '[object Uint8ClampedArray]';
  var uint16Tag$1 = '[object Uint16Array]';
  var uint32Tag$1 = '[object Uint32Array]';
  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag$1:
        return cloneArrayBuffer(object);

      case boolTag$1:
      case dateTag$1:
        return new Ctor(+object);

      case float32Tag$1: case float64Tag$1:
      case int8Tag$1: case int16Tag$1: case int32Tag$1:
      case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
        return cloneTypedArray(object, isDeep);

      case mapTag$2:
        return cloneMap(object);

      case numberTag$1:
      case stringTag$2:
        return new Ctor(object);

      case regexpTag$1:
        return cloneRegExp(object);

      case setTag$2:
        return cloneSet(object);

      case symbolTag$1:
        return cloneSymbol(object);
    }
  }

  /** Built-in value references. */
  var objectCreate = Object.create;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  function baseCreate(proto) {
    return isObject(proto) ? objectCreate(proto) : {};
  }

  /** Built-in value references. */
  var getPrototypeOf$1 = Object.getPrototypeOf;

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    return (typeof object.constructor == 'function' && !isPrototype(object))
      ? baseCreate(getPrototypeOf$1(object))
      : {};
  }

  /**
   * Creates a function that returns `value`.
   *
   * @static
   * @memberOf _
   * @category Util
   * @param {*} value The value to return from the new function.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var object = { 'user': 'fred' };
   * var getter = _.constant(object);
   *
   * getter() === object;
   * // => true
   */
  function constant(value) {
    return function() {
      return value;
    };
  }

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes$1 = {
    'function': true,
    'object': true
  };

  /** Detect free variable `exports`. */
  var freeExports$1 = (objectTypes$1[typeof exports] && exports && !exports.nodeType)
    ? exports
    : undefined;

  /** Detect free variable `module`. */
  var freeModule$1 = (objectTypes$1[typeof module] && module && !module.nodeType)
    ? module
    : undefined;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = (freeModule$1 && freeModule$1.exports === freeExports$1)
    ? freeExports$1
    : undefined;

  /** Built-in value references. */
  var Buffer = moduleExports ? root.Buffer : undefined;

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = !Buffer ? constant(false) : function(value) {
    return value instanceof Buffer;
  };

  var argsTag = '[object Arguments]';
  var arrayTag = '[object Array]';
  var boolTag = '[object Boolean]';
  var dateTag = '[object Date]';
  var errorTag = '[object Error]';
  var funcTag$1 = '[object Function]';
  var genTag$1 = '[object GeneratorFunction]';
  var mapTag = '[object Map]';
  var numberTag = '[object Number]';
  var objectTag = '[object Object]';
  var regexpTag = '[object RegExp]';
  var setTag = '[object Set]';
  var stringTag = '[object String]';
  var symbolTag = '[object Symbol]';
  var weakMapTag = '[object WeakMap]';
  var arrayBufferTag = '[object ArrayBuffer]';
  var float32Tag = '[object Float32Array]';
  var float64Tag = '[object Float64Array]';
  var int8Tag = '[object Int8Array]';
  var int16Tag = '[object Int16Array]';
  var int32Tag = '[object Int32Array]';
  var uint8Tag = '[object Uint8Array]';
  var uint8ClampedTag = '[object Uint8ClampedArray]';
  var uint16Tag = '[object Uint16Array]';
  var uint32Tag = '[object Uint32Array]';
  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
  cloneableTags[dateTag] = cloneableTags[float32Tag] =
  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
  cloneableTags[mapTag] = cloneableTags[numberTag] =
  cloneableTags[objectTag] = cloneableTags[regexpTag] =
  cloneableTags[setTag] = cloneableTags[stringTag] =
  cloneableTags[symbolTag] = cloneableTags[uint8Tag] =
  cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] =
  cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag$1] =
  cloneableTags[weakMapTag] = false;

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @param {boolean} [isFull] Specify a clone including symbols.
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
    var result;
    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag$1(value),
          isFunc = tag == funcTag$1 || tag == genTag$1;

      if (isBuffer(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        if (isHostObject(value)) {
          return object ? value : {};
        }
        result = initCloneObject(isFunc ? {} : value);
        if (!isDeep) {
          result = baseAssign(result, value);
          return isFull ? copySymbols(value, result) : result;
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag, isDeep);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    // Recursively populate clone (susceptible to call stack limits).
    (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
      assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
    });
    return (isFull && !isArr) ? copySymbols(value, result) : result;
  }

  /** `Object#toString` result references. */
  var objectTag$2 = '[object Object]';

  /** Used for built-in method references. */
  var objectProto$12 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$2 = Function.prototype.toString;

  /** Used to infer the `Object` constructor. */
  var objectCtorString = funcToString$2.call(Object);

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString$4 = objectProto$12.toString;

  /** Built-in value references. */
  var getPrototypeOf$2 = Object.getPrototypeOf;

  /**
   * Checks if `value` is a plain object, that is, an object created by the
   * `Object` constructor or one with a `[[Prototype]]` of `null`.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * _.isPlainObject(new Foo);
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'x': 0, 'y': 0 });
   * // => true
   *
   * _.isPlainObject(Object.create(null));
   * // => true
   */
  function isPlainObject(value) {
    if (!isObjectLike(value) ||
        objectToString$4.call(value) != objectTag$2 || isHostObject(value)) {
      return false;
    }
    var proto = getPrototypeOf$2(value);
    if (proto === null) {
      return true;
    }
    var Ctor = proto.constructor;
    return (typeof Ctor == 'function' &&
      Ctor instanceof Ctor && funcToString$2.call(Ctor) == objectCtorString);
  }

  var argsTag$2 = '[object Arguments]';
  var arrayTag$1 = '[object Array]';
  var boolTag$2 = '[object Boolean]';
  var dateTag$2 = '[object Date]';
  var errorTag$1 = '[object Error]';
  var funcTag$2 = '[object Function]';
  var mapTag$3 = '[object Map]';
  var numberTag$2 = '[object Number]';
  var objectTag$3 = '[object Object]';
  var regexpTag$2 = '[object RegExp]';
  var setTag$3 = '[object Set]';
  var stringTag$3 = '[object String]';
  var weakMapTag$2 = '[object WeakMap]';
  var arrayBufferTag$2 = '[object ArrayBuffer]';
  var float32Tag$2 = '[object Float32Array]';
  var float64Tag$2 = '[object Float64Array]';
  var int8Tag$2 = '[object Int8Array]';
  var int16Tag$2 = '[object Int16Array]';
  var int32Tag$2 = '[object Int32Array]';
  var uint8Tag$2 = '[object Uint8Array]';
  var uint8ClampedTag$2 = '[object Uint8ClampedArray]';
  var uint16Tag$2 = '[object Uint16Array]';
  var uint32Tag$2 = '[object Uint32Array]';
  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] =
  typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] =
  typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] =
  typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] =
  typedArrayTags[uint32Tag$2] = true;
  typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$1] =
  typedArrayTags[arrayBufferTag$2] = typedArrayTags[boolTag$2] =
  typedArrayTags[dateTag$2] = typedArrayTags[errorTag$1] =
  typedArrayTags[funcTag$2] = typedArrayTags[mapTag$3] =
  typedArrayTags[numberTag$2] = typedArrayTags[objectTag$3] =
  typedArrayTags[regexpTag$2] = typedArrayTags[setTag$3] =
  typedArrayTags[stringTag$3] = typedArrayTags[weakMapTag$2] = false;

  /** Used for built-in method references. */
  var objectProto$13 = Object.prototype;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString$5 = objectProto$13.toString;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  function isTypedArray(value) {
    return isObjectLike(value) &&
      isLength(value.length) && !!typedArrayTags[objectToString$5.call(value)];
  }

  /** Built-in value references. */
  var Reflect = root.Reflect;

  /**
   * Converts `iterator` to an array.
   *
   * @private
   * @param {Object} iterator The iterator to convert.
   * @returns {Array} Returns the converted array.
   */
  function iteratorToArray(iterator) {
    var data,
        result = [];

    while (!(data = iterator.next()).done) {
      result.push(data.value);
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$15 = Object.prototype;

  /** Built-in value references. */
  var enumerate = Reflect ? Reflect.enumerate : undefined;
  var propertyIsEnumerable$1 = objectProto$15.propertyIsEnumerable;
  /**
   * The base implementation of `_.keysIn` which doesn't skip the constructor
   * property of prototypes or treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    object = object == null ? object : Object(object);

    var result = [];
    for (var key in object) {
      result.push(key);
    }
    return result;
  }

  // Fallback for IE < 9 with es6-shim.
  if (enumerate && !propertyIsEnumerable$1.call({ 'valueOf': 1 }, 'valueOf')) {
    baseKeysIn = function(object) {
      return iteratorToArray(enumerate(object));
    };
  }

  var baseKeysIn$1 = baseKeysIn;

  /** Used for built-in method references. */
  var objectProto$14 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$14.hasOwnProperty;

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    var index = -1,
        isProto = isPrototype(object),
        props = baseKeysIn$1(object),
        propsLength = props.length,
        indexes = indexKeys(object),
        skipIndexes = !!indexes,
        result = indexes || [],
        length = result.length;

    while (++index < propsLength) {
      var key = props[index];
      if (!(skipIndexes && (key == 'length' || isIndex(key, length))) &&
          !(key == 'constructor' && (isProto || !hasOwnProperty$7.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Converts `value` to a plain object flattening inherited enumerable
   * properties of `value` to own properties of the plain object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {Object} Returns the converted plain object.
   * @example
   *
   * function Foo() {
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.assign({ 'a': 1 }, new Foo);
   * // => { 'a': 1, 'b': 2 }
   *
   * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
   * // => { 'a': 1, 'b': 2, 'c': 3 }
   */
  function toPlainObject(value) {
    return copyObject(value, keysIn(value));
  }

  /**
   * A specialized version of `baseMerge` for arrays and objects which performs
   * deep merges and tracks traversed objects enabling objects with circular
   * references to be merged.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {string} key The key of the value to merge.
   * @param {number} srcIndex The index of `source`.
   * @param {Function} mergeFunc The function to merge values.
   * @param {Function} [customizer] The function to customize assigned values.
   * @param {Object} [stack] Tracks traversed source values and their merged counterparts.
   */
  function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = object[key],
        srcValue = source[key],
        stacked = stack.get(srcValue);

    if (stacked) {
      assignMergeValue(object, key, stacked);
      return;
    }
    var newValue = customizer
      ? customizer(objValue, srcValue, (key + ''), object, source, stack)
      : undefined;

    var isCommon = newValue === undefined;

    if (isCommon) {
      newValue = srcValue;
      if (isArray(srcValue) || isTypedArray(srcValue)) {
        if (isArray(objValue)) {
          newValue = objValue;
        }
        else if (isArrayLikeObject(objValue)) {
          newValue = copyArray(objValue);
        }
        else {
          isCommon = false;
          newValue = baseClone(srcValue, !customizer);
        }
      }
      else if (isPlainObject(srcValue) || isArguments(srcValue)) {
        if (isArguments(objValue)) {
          newValue = toPlainObject(objValue);
        }
        else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
          isCommon = false;
          newValue = baseClone(srcValue, !customizer);
        }
        else {
          newValue = objValue;
        }
      }
      else {
        isCommon = false;
      }
    }
    stack.set(srcValue, newValue);

    if (isCommon) {
      // Recursively merge objects and arrays (susceptible to call stack limits).
      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    }
    stack['delete'](srcValue);
    assignMergeValue(object, key, newValue);
  }

  /**
   * The base implementation of `_.merge` without support for multiple sources.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {number} srcIndex The index of `source`.
   * @param {Function} [customizer] The function to customize merged values.
   * @param {Object} [stack] Tracks traversed source values and their merged counterparts.
   */
  function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) {
      return;
    }
    var props = (isArray(source) || isTypedArray(source))
      ? undefined
      : keysIn(source);

    arrayEach(props || source, function(srcValue, key) {
      if (props) {
        key = srcValue;
        srcValue = source[key];
      }
      if (isObject(srcValue)) {
        stack || (stack = new Stack);
        baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
      }
      else {
        var newValue = customizer
          ? customizer(object[key], srcValue, (key + ''), object, source, stack)
          : undefined;

        if (newValue === undefined) {
          newValue = srcValue;
        }
        assignMergeValue(object, key, newValue);
      }
    });
  }

  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)) {
      return eq(object[index], value);
    }
    return false;
  }

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {...*} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    var length = args.length;
    switch (length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3);
   * // => 3
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3');
   * // => 3
   */
  function toNumber(value) {
    if (isObject(value)) {
      var other = isFunction(value.valueOf) ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var INFINITY = 1 / 0;
  var MAX_INTEGER = 1.7976931348623157e+308;
  /**
   * Converts `value` to an integer.
   *
   * **Note:** This function is loosely based on [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3');
   * // => 3
   */
  function toInteger(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    var remainder = value % 1;
    return value === value ? (remainder ? value - remainder : value) : 0;
  }

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max;

  /**
   * Creates a function that invokes `func` with the `this` binding of the
   * created function and arguments from `start` and beyond provided as an array.
   *
   * **Note:** This method is based on the [rest parameter](https://mdn.io/rest_parameters).
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var say = _.rest(function(what, names) {
   *   return what + ' ' + _.initial(names).join(', ') +
   *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
   * });
   *
   * say('hello', 'fred', 'barney', 'pebbles');
   * // => 'hello fred, barney, & pebbles'
   */
  function rest(func, start) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      switch (start) {
        case 0: return func.call(this, array);
        case 1: return func.call(this, args[0], array);
        case 2: return func.call(this, args[0], args[1], array);
      }
      var otherArgs = Array(start + 1);
      index = -1;
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = array;
      return apply(func, this, otherArgs);
    };
  }

  /**
   * Creates a function like `_.assign`.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @returns {Function} Returns the new assigner function.
   */
  function createAssigner(assigner) {
    return rest(function(object, sources) {
      var index = -1,
          length = sources.length,
          customizer = length > 1 ? sources[length - 1] : undefined,
          guard = length > 2 ? sources[2] : undefined;

      customizer = typeof customizer == 'function'
        ? (length--, customizer)
        : undefined;

      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }

  /**
   * This method is like `_.assign` except that it recursively merges own and
   * inherited enumerable properties of source objects into the destination
   * object. Source properties that resolve to `undefined` are skipped if a
   * destination value exists. Array and plain object properties are merged
   * recursively.Other objects and value types are overridden by assignment.
   * Source objects are applied from left to right. Subsequent sources
   * overwrite property assignments of previous sources.
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @example
   *
   * var users = {
   *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
   * };
   *
   * var ages = {
   *   'data': [{ 'age': 36 }, { 'age': 40 }]
   * };
   *
   * _.merge(users, ages);
   * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
   */
  var merge = createAssigner(function(object, source, srcIndex) {
    baseMerge(object, source, srcIndex);
  });

  var slice = [].slice;

  var noabort = {};

  function Queue(size) {
    if (!(size >= 1)) throw new Error;
    this._size = size;
    this._call =
    this._error = null;
    this._tasks = [];
    this._data = [];
    this._waiting =
    this._active =
    this._ended =
    this._start = 0; // inside a synchronous task callback?
  }

  Queue.prototype = queue.prototype = {
    constructor: Queue,
    defer: function(callback) {
      if (typeof callback !== "function" || this._call) throw new Error;
      if (this._error != null) return this;
      var t = slice.call(arguments, 1);
      t.push(callback);
      ++this._waiting, this._tasks.push(t);
      poke(this);
      return this;
    },
    abort: function() {
      if (this._error == null) abort(this, new Error("abort"));
      return this;
    },
    await: function(callback) {
      if (typeof callback !== "function" || this._call) throw new Error;
      this._call = function(error, results) { callback.apply(null, [error].concat(results)); };
      maybeNotify(this);
      return this;
    },
    awaitAll: function(callback) {
      if (typeof callback !== "function" || this._call) throw new Error;
      this._call = callback;
      maybeNotify(this);
      return this;
    }
  };

  function poke(q) {
    if (!q._start) try { start(q); } // let the current task complete
    catch (e) { if (q._tasks[q._ended + q._active - 1]) abort(q, e); } // task errored synchronously
  }

  function start(q) {
    while (q._start = q._waiting && q._active < q._size) {
      var i = q._ended + q._active,
          t = q._tasks[i],
          j = t.length - 1,
          c = t[j];
      t[j] = end(q, i);
      --q._waiting, ++q._active;
      t = c.apply(null, t);
      if (!q._tasks[i]) continue; // task finished synchronously
      q._tasks[i] = t || noabort;
    }
  }

  function end(q, i) {
    return function(e, r) {
      if (!q._tasks[i]) return; // ignore multiple callbacks
      --q._active, ++q._ended;
      q._tasks[i] = null;
      if (q._error != null) return; // ignore secondary errors
      if (e != null) {
        abort(q, e);
      } else {
        q._data[i] = r;
        if (q._waiting) poke(q);
        else maybeNotify(q);
      }
    };
  }

  function abort(q, e) {
    var i = q._tasks.length, t;
    q._error = e; // ignore active callbacks
    q._data = undefined; // allow gc
    q._waiting = NaN; // prevent starting

    while (--i >= 0) {
      if (t = q._tasks[i]) {
        q._tasks[i] = null;
        if (t.abort) try { t.abort(); }
        catch (e) { /* ignore */ }
      }
    }

    q._active = NaN; // allow notification
    maybeNotify(q);
  }

  function maybeNotify(q) {
    if (!q._active && q._call) q._call(q._error, q._data);
  }

  function queue(concurrency) {
    return new Queue(arguments.length ? +concurrency : Infinity);
  }

  function loading (isLoading, neuronName) {
    if (!isLoading) {
      d3.selectAll('#chart svg').attr('display', 'none');
      d3.select('#chart')
        .append('text')
          .attr('class', 'loading')
          .html('Loading... ' + neuronName);
    } else {
      d3.select('.loading').remove();
      d3.selectAll('#chart svg').attr('display', '');
    }
  }

  function rasterDataManger() {
    let neuronName = '';
    let sessionName = '';
    let brainArea = '';
    let Subject = '';
    let timeDomain = [];
    let factorList = [];
    let trialEvents = [];
    let neuronList = [];
    let rasterData = {};
    let spikeInfo = {};
    let sessionInfo = {};
    let showSpikes = true;
    let showSmoothingLines = true;
    let lineSmoothness = 20;
    let curFactor = 'trial_id';
    let curEvent = 'start_time';
    let interactionFactor = '';
    let isLoaded = false;
    let dispatch = d3.dispatch('dataReady');
    let dataManager = {};
    let colorScale = d3.scale.ordinal().domain(['Spike']).range(['black']);

    dataManager.loadRasterData = function () {
      isLoaded = false;

      d3.json('DATA/' + 'trialInfo.json', function (error, trialInfo) {
        factorList = trialInfo.experimentalFactor;
        trialEvents = trialInfo.timePeriods;
        neuronList = trialInfo.neurons;

        if (neuronName === '') {
          neuronName = neuronList.length ? neuronList[0].name : neuronList.name;
        };

        loading(isLoaded, neuronName);

        let neuronInfo = neuronList.length ? neuronList.filter(function (d) {return d.name === neuronName;})[0] : neuronList;

        sessionName = neuronInfo.sessionName;
        Subject = neuronInfo.subjectName;

        queue()
          .defer(d3.json, 'DATA/' + sessionName + '_TrialInfo.json')
          .defer(d3.json, 'DATA/Neuron_' + neuronName + '.json')
          .await(function (error, sI, neuron) {
            spikeInfo = neuron.Spikes;
            brainArea = neuron.Brain_Area;
            sessionInfo = sI;
            isLoaded = true;
            loading(isLoaded);

            if (interactionFactor.length > 0) {
              let factorLevels = d3.set(sessionInfo.map(function (s) {
                return s[interactionFactor];
              })).values();

              colorScale = d3.scale.ordinal()
                .domain(factorLevels)
                .range(['#e41a1c', '#377eb8', '#ff7f00', '#4daf4am', '#984ea3']);
            }

            dataManager.sortRasterData();
            dataManager.changeEvent();
            dispatch.dataReady();

          });
      });

    };

    dataManager.changeEvent = function () {
      let minTime = d3.min(sessionInfo, function (s) { return s.start_time - s[curEvent]; });

      let maxTime = d3.max(sessionInfo, function (s) { return s.end_time - s[curEvent]; });

      timeDomain = [minTime, maxTime];
    };

    dataManager.sortRasterData = function () {
      rasterData = merge(sessionInfo, spikeInfo);
      let factorType = factorList.filter(function (d) {return d.value === curFactor;})
                                 .map(function (d) {return d.factorType;})[0].toUpperCase();

      // Nest and Sort Data
      if (factorType !== 'CONTINUOUS') {
        rasterData = d3.nest()
          .key(function (d) { return d[curFactor] + '_' + sessionName;}) // nests data by selected factor
          .sortKeys(function (a, b) {
            // Sort ordinal keys
            if (factorType === 'ORDINAL') return d3.descending(+a[curFactor], +b[curFactor]);
          })
          .sortValues(function (a, b) {
            // If interaction factor is specified, then sort by that as well
            if (interactionFactor.length > 0) {
              return d3.descending(a[interactionFactor], b[interactionFactor]);
            } else {
              // else sort by trial id
              return d3.descending(+a.trial_id, +b.trial_id);
            };
          })
          .entries(rasterData);
      } else {
        rasterData = d3.nest()
          .key(function (d) {return d[''] + '_' + sessionName;}) // nests data by selected factor
            .sortValues(function (a, b) { // sorts values on factor if continuous
              return d3.descending(+a[curFactor], +b[curFactor]);
            })
          .entries(rasterData);
      }
    };

    dataManager.neuronName  = function (value) {
      if (!arguments.length) return neuronName;
      neuronName = value;
      dataManager.loadRasterData();
      return dataManager;
    };

    dataManager.brainArea  = function (value) {
      if (!arguments.length) return brainArea;
      brainArea = value;
      return dataManager;
    };

    dataManager.sessionName  = function (value) {
      if (!arguments.length) return sessionName;
      sessionName = value;
      return dataManager;
    };

    dataManager.interactionFactor  = function (value) {
      if (!arguments.length) return interactionFactor;
      interactionFactor = value;
      return dataManager;
    };

    dataManager.rasterData  = function (value) {
      if (!arguments.length) return rasterData;
      rasterData = value;
      return dataManager;
    };

    dataManager.showSpikes  = function (value) {
      if (!arguments.length) return showSpikes;
      showSpikes = value;
      if (isLoaded) dispatch.dataReady();
      return dataManager;
    };

    dataManager.showSmoothingLines = function (value) {
      if (!arguments.length) return showSmoothingLines;
      showSmoothingLines = value;
      if (isLoaded) dispatch.dataReady();
      return dataManager;
    };

    dataManager.lineSmoothness = function (value) {
      if (!arguments.length) return lineSmoothness;
      lineSmoothness = value;
      if (isLoaded) dispatch.dataReady();
      return dataManager;
    };

    dataManager.curFactor = function (value) {
      if (!arguments.length) return curFactor;
      curFactor = value;
      if (isLoaded) dataManager.sortRasterData(); dispatch.dataReady();
      return dataManager;
    };

    dataManager.curEvent = function (value) {
      if (!arguments.length) return curEvent;
      curEvent = value;
      if (isLoaded) dataManager.changeEvent(); dispatch.dataReady();
      return dataManager;
    };

    dataManager.timeDomain = function (value) {
      if (!arguments.length) return timeDomain;
      timeDomain = value;
      return dataManager;
    };

    dataManager.factorList = function (value) {
      if (!arguments.length) return factorList;
      factorList = value;
      return dataManager;
    };

    dataManager.trialEvents = function (value) {
      if (!arguments.length) return trialEvents;
      trialEvents = value;
      return dataManager;
    };

    dataManager.neuronList = function (value) {
      if (!arguments.length) return neuronList;
      neuronList = value;
      return dataManager;
    };

    dataManager.colorScale = function (value) {
      if (!arguments.length) return colorScale;
      colorScale = value;
      return dataManager;
    };

    d3.rebind(dataManager, dispatch, 'on');

    return dataManager;

  }

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  /**
   * The base implementation of `_.flatten` with support for restricting flattening.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {number} depth The maximum recursion depth.
   * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */
  function baseFlatten(array, depth, isStrict, result) {
    result || (result = []);

    var index = -1,
        length = array.length;

    while (++index < length) {
      var value = array[index];
      if (depth > 0 && isArrayLikeObject(value) &&
          (isStrict || isArray(value) || isArguments(value))) {
        if (depth > 1) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten(value, depth - 1, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }

  /**
   * Flattens `array` a single level deep.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to flatten.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flatten([1, [2, [3, [4]], 5]]);
   * // => [1, 2, [3, [4]], 5]
   */
  function flatten(array) {
    var length = array ? array.length : 0;
    return length ? baseFlatten(array, 1) : [];
  }

  // Draws spikes as circles
  function drawSpikes (selection, sessionInfo, timeScale, yScale, curEvent, interactionFactor, colorScale) {

    let circleRadius = yScale.rangeBand() / 2;

    // Reshape to spike time, trial position.
    // Adjust spike time relative to current trial event
    let data = sessionInfo.map(function (trial, ind) {
      if (!Array.isArray(trial.spikes)) { return []; };

      return trial.spikes.map(function (spike) {
        return [spike - trial[curEvent], ind];
      });
    });

    let factorLevel = sessionInfo.map(function (d) {return d[interactionFactor];});

    // Flatten
    data = flatten(data);

    let circles = selection.selectAll('circle').data(data);
    circles.enter()
      .append('circle')
      .style('opacity', 1E-5);
    circles.exit()
      .transition()
        .duration(1000)
        .style('opacity', 1E-5).remove();

    circles
    .transition()
      .duration(1000)
      .attr('cx', function (d) {
        return timeScale(d[0]);
      })
      .attr('fill', function (d) {
        let factorName = (factorLevel[d[1]] === undefined) ? 'Spike' : factorLevel[d[1]];
        return colorScale(factorName);
      })
      .style('opacity', 1)
      .attr('r', circleRadius)
      .attr('cy', function (d) { return yScale(d[1]) + circleRadius; });
  }

  /* Draws each trial event (e.g. saccade, cue period, reward) from the beginning to
    end (e.g. saccade start, saccade finish) as an area. */

  function drawTrialEvents (selection, sessionInfo, trialEvents, curEvent, timeScale, yScale) {

    let eventArea = selection.selectAll('path.eventArea').data(trialEvents, function (d) {return d.label;});

    /* Reformat data for area chart. Duplicate data twice in order to draw
    straight vertical edges at the beginning and end of trials */
    let dupData = duplicateData(sessionInfo);

    // Plot area corresponding to trial events
    eventArea.enter()
      .append('path')
        .attr('class', 'eventArea')
        .attr('id', function (d) {return d.label;})
        .attr('opacity', 1E-6)
        .attr('fill', function (d) {return d.color;});

    eventArea.exit().remove();

    eventArea
      .transition()
        .duration(1000)
        .ease('linear')
        .attr('opacity', 0.90)
        .attr('d', function (t) {
          return AreaFun(dupData, t, timeScale, yScale, curEvent);
        });
  }

  function AreaFun(values, trialEvents, timeScale, yScale, curEvent) {
    // Setup helper line function
    let area = d3.svg.area()
      .defined(function (d) {
        return d[trialEvents.startID] != null && d[trialEvents.endID] != null && d[curEvent] != null;
      }) // if null, suppress line drawing
      .x0(function (d) {
        return timeScale(d[trialEvents.startID] - d[curEvent]);
      })
      .x1(function (d) {
        return timeScale(d[trialEvents.endID] - d[curEvent]);
      })
      .y(function (d, i) {
        // Draws straight line down for each trial on the corners.
        if (i % 2 == 0) { // Alternate top and bottom
          return yScale(d.sortInd); // Top of the trial
        } else {
          return yScale(d.sortInd) + yScale.rangeBand(); // bottom of the trial
        }
      })
      .interpolate('linear');
    return area(values);
  }

  function duplicateData(data) {
    // Duplicate data so that it appears twice aka 11223344
    let valuesInd = d3.range(data.length);
    let newValues = data.concat(data);
    valuesInd = valuesInd.concat(valuesInd);
    newValues.forEach(function (d, i) {
      d.sortInd = valuesInd[i];
    });

    newValues.sort(function (a, b) {
      return d3.descending(a.sortInd, b.sortInd);
    });

    return newValues;
  }

  function kernelDensityEstimator (kernel, x) {
    return function (sample) {
      return x.map(function (x) {
        return [x, d3.sum(sample, function (v) { return kernel(x - v); })];
      });
    };
  }

  function gaussianKernel (bandwidth) {
    return function (spikeTime) {
      return Math.exp((spikeTime * spikeTime) / (-2 * bandwidth * bandwidth))
        / (bandwidth * Math.sqrt(2 * Math.PI));
    };
  }

  function drawSmoothingLine (selection, data, timeScale, yScale, lineSmoothness, curEvent, interactionFactor, colorScale) {
    // Nest by interaction factor
    let spikes = d3.nest()
      .key(function (d) {return d[interactionFactor];})
      .entries(data.filter(function (d) {
        return d.start_time != null && d.isIncluded === 'Included';
      })); // Don't include trials with no start time or excluded

    // Compute kernel density estimate
    let timeRange = d3.range(d3.min(timeScale.domain()), d3.max(timeScale.domain()));
    let kde = kernelDensityEstimator(gaussianKernel(lineSmoothness), timeRange);

    spikes.forEach(function (factor) {

      let kdeByTrial = factor.values.map(function (trial) {
        if (trial.spikes[0] !== undefined) {
          return kde(
            trial.spikes.map(function (spike) { return spike - trial[curEvent];})
          );
        } else if (trial.start_time !== null) {
          return kde(0);
        }
      });

      let y = kdeByTrial.map(function (trial) {
        if (trial !== undefined) {
          return trial.map(function (e) { return e[1]; });
        };
      });

      factor.values = timeRange.map(function (time, ind) {
        return [
          time,
          1000 * d3.mean(y.map(function (row) {
            if (row != undefined) return row[ind];
          })),
        ];

      });

    });

    // max value of density estimate
    let maxKDE = d3.max(spikes.map(function (d) {
      return d3.max(d.values, function (e) {
        return e[1];
      });
    }));

    let kdeScale = d3.scale.linear()
        .domain([0, maxKDE])
        .range([yScale.range()[0] + yScale.rangeBand(), 0]);

    let kdeG = selection.selectAll('g.kde').data(spikes, function (d) {return d.key;});

    kdeG.enter()
      .append('g')
        .attr('class', 'kde');
    kdeG.exit()
      .remove();

    let line = d3.svg.line()
      .x(function (d) {return timeScale(d[0]);})
      .y(function (d) {return kdeScale(d[1]);});

    let kdeLine = kdeG.selectAll('path.kdeLine').data(function (d) {return [d];});

    kdeLine.enter()
      .append('path')
        .attr('class', 'kdeLine');
    kdeLine
      .transition()
        .duration(1000)
      .attr('d', function (d) {return line(d.values);})
      .attr('stroke', function (d) {
        let factorName = (d.key === 'undefined') ? 'Spike' : d.key;
        return colorScale(factorName);
      });

    kdeLine.exit()
      .remove();

    return maxKDE;

  }

  let toolTip = d3.select('body').selectAll('div#tooltip').data([{}]);
  toolTip.enter()
    .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 1e-6);

  function drawMouseBox (selection, data, timeScale, yScale, curEvent, width) {
    // Append invisible box for mouseover
    let mouseBox = selection.selectAll('rect.trialBox').data(data);

    mouseBox.exit()
      .remove();
    mouseBox.enter()
      .append('rect')
        .attr('class', 'trialBox');
    mouseBox
      .attr('x', function (d) {
        if (d.start_time !== null) {
          return timeScale(d.start_time - d[curEvent]);
        } else {
          return 0;
        }
      })
      .attr('y', function (d, i) { return yScale(i); })
      .attr('width', function (d) {
        if (d.start_time !== null) {
          return (timeScale(d.end_time - d[curEvent])) - (timeScale(d.start_time - d[curEvent]));
        } else {
          return width;
        }
      })
      .attr('height', yScale.rangeBand())
      .attr('opacity', '1e-9')
      .on('mouseover', mouseBoxOver)
      .on('mouseout', mouseBoxOut);
  }

  function mouseBoxOver(d) {
    // Pop up tooltip
    toolTip
      .style('opacity', 1)
      .style('left', (d3.event.pageX + 10) + 'px')
      .style('top', (d3.event.pageY + 10) + 'px')
      .html(function () {
        return '<b>Trial ' + d.trial_id + '</b><br>' +
               '<table>' +
               '<tr><td>' + 'Rule:' + '</td><td><b>' + d.Rule + '</b></td></tr>' +
               '<tr><td>' + 'Rule Repetition:' + '</td><td><b>' + d.Rule_Repetition + '</b></td></tr>' +
               '<tr><td>' + 'Preparation Time:' + '</td><td><b>' + d.Preparation_Time + ' ms' + '</b></td></tr>' +
               '<tr><td>' + 'Congruency:' + '</td><td><b>' + d.Current_Congruency + '</b></td></tr>' +
               '<tr><td>' + 'Response Direction:' + '</td><td><b>' + d.Response_Direction + '</b></td></tr>' +
               '<tr><td>' + 'Reaction Time:' + '</td><td><b>' + d.Reaction_Time + ' ms' + '</b></td></tr>' +
               '<hr>' +
               '<tr><td>' + 'Correct?:' + '</td><td><b>' + d.isCorrect + '</b></td></tr>' +
               '<tr><td>' + 'Fixation Break?:' + '</td><td><b>' + d.Fixation_Break + '</b></td></tr>' +
               '<tr><td>' + 'Error on previous trial?:' + '</td><td><b>' + d.Previous_Error + '</b></td></tr>' +
               '<tr><td>' + 'Included in Analysis?:' + '</td><td><b>' + d.isIncluded + '</b></td></tr>' +
               '</table>';
      });

    d3.select(this)
      .attr('stroke', 'black')
      .attr('fill', 'white')
      .attr('opacity', 1)
      .attr('fill-opacity', 1e-9);
  }

  function mouseBoxOut(d) {
    // Hide tooltip
    toolTip
      .style('opacity', 1e-9);
    d3.select(this)
      .attr('opacity', 1e-9);
  }

  // Replaces underscores with blanks and 'plus' with '+'
  function fixDimNames (dimName) {
    let pat1 = /plus/;
    let pat2 = /_/g;
    let pat3 = /minus/;
    let fixedName = dimName.replace(pat1, '+').replace(pat2, ' ').replace(pat3, '-');
    return fixedName;
  }

  // Append average start time for event label position
  function findAverageStartTime (data, trialEvents, curEvent) {
    trialEvents.forEach(function (period, ind) {
      let avgTime = d3.mean(data, function (trial) {
        if (trial[curEvent] !== null && trial[period.startID] !== null) {
          return trial[period.startID] - trial[curEvent];
        }

      });

      period.labelPosition = avgTime;
    });
  }

  function eventMarkers (selection, data, trialEvents, timeScale, curEvent, innerHeight) {

    const labelWidth = 45;
    const labelHeight = 33;

    findAverageStartTime(data, trialEvents, curEvent);

    // Add labels corresponding to trial events
    let eventLabel = selection.selectAll('.eventLabel').data(trialEvents, function (d) {return d.label;});

    eventLabel.enter()
      .append('foreignObject')
        .attr('class', 'eventLabel')
        .attr('id', function (d) {return d.label;})
        .attr('width', labelWidth)
        .attr('height', 33)
        .style('color', function (d) {return d.color;})
        .html(function (d) {return '<div>▲<br>' + d.label + '</div>'; });

    eventLabel
      .attr('x', function (d) {
        return timeScale(d.labelPosition) - (labelWidth / 2);
      })
      .attr('y', innerHeight + 16);
  }

  function rasterChart () {
    // Defaults
    let margin = { top: 50, right: 50, bottom: 50, left: 50 };
    let outerWidth = 960;
    let outerHeight = 500;
    let timeDomain = [];
    let timeScale = d3.scale.linear();
    let yScale = d3.scale.ordinal();
    let curEvent = '';
    let trialEvents = [];
    let lineSmoothness = 20;
    let interactionFactor = '';
    let curFactor = '';
    let showSpikes = true;
    let showSmoothingLines = true;
    let innerHeight;
    let innerWidth;
    let colorScale = d3.scale.ordinal().domain(['Spike']).range(['black']);

    function chart(selection) {
      selection.each(function (data) {

        // Allow height and width to be determined by data
        if (typeof outerHeight === 'function') {
          innerHeight = outerHeight(data) - margin.top - margin.bottom;
        } else {
          innerHeight = outerHeight - margin.top - margin.bottom;
        };

        if (typeof outerWidth === 'function') {
          innerWidth = outerWidth(data) - margin.left - margin.right;
        } else {
          innerWidth = outerWidth - margin.left - margin.right;
        }

        let svg = d3.select(this).selectAll('svg').data([data], function (d) { return d.key; });

        // Initialize the chart, set up drawing layers
        let enterG = svg.enter()
          .append('svg')
            .append('g');
        enterG
          .append('rect')
            .attr('class', 'backgroundLayer');
        svg.select('rect.backgroundLayer')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('opacity', 0.1)
            .attr('fill', '#aaa');
        enterG
          .append('g')
            .attr('class', 'trialEvents');
        enterG
          .append('g')
            .attr('class', 'spikes');
        enterG
          .append('g')
            .attr('class', 'smoothLine');
        enterG
          .append('g')
            .attr('class', 'trialBox');
        enterG
          .append('g')
            .attr('class', 'timeAxis');
        enterG
          .append('g')
            .attr('class', 'yAxis');
        enterG
          .append('g')
            .attr('class', 'eventMarker');

        // Fix title names
        let s = data.key.split('_');
        if (s[0] === 'undefined') {
          s[0] = '';
        } else {
          s[0] = ': ' + s[0];
        };

        let title = enterG
          .append('text')
          .attr('class', 'title')
          .attr('font-size', 16)
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy', -8);
        svg.select('text.title')
          .text(fixDimNames(curFactor) + s[0]);

        // Update svg size, drawing area, and scales
        svg
          .attr('width', innerWidth + margin.left + margin.right)
          .attr('height', innerHeight + margin.top + margin.bottom);
        svg.select('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        timeScale
          .domain(timeDomain)
          .range([0, innerWidth]);
        yScale
          .domain(d3.range(0, data.values.length))
          .rangeBands([innerHeight, 0]);

        // Draw the chart
        let spikesG = svg.select('g.spikes');
        let trialEventsG = svg.select('g.trialEvents');
        let trialBoxG = svg.select('g.trialBox');
        let smoothLineG = svg.select('g.smoothLine');
        let eventMarkerG = svg.select('g.eventMarker');

        showSpikes ? drawSpikes(spikesG, data.values, timeScale, yScale, curEvent, interactionFactor, colorScale) : spikesG.selectAll('circle').remove();
        drawTrialEvents(trialEventsG, data.values, trialEvents, curEvent, timeScale, yScale);
        drawMouseBox(trialBoxG, data.values, timeScale, yScale, curEvent, innerWidth);
        let maxKDE = showSmoothingLines ? drawSmoothingLine(smoothLineG, data.values, timeScale, yScale, lineSmoothness, curEvent, interactionFactor, colorScale) : d3.selectAll('path.kdeLine').remove();
        eventMarkers(eventMarkerG, data.values, trialEvents, timeScale, curEvent, innerHeight);

        // Draw the time axis
        let timeAxisG = svg.select('g.timeAxis');
        let timeAxis = d3.svg.axis()
          .scale(timeScale)
          .orient('bottom')
          .ticks(7)
          .tickSize(0)
          .tickFormat(d3.format('4d'));
        timeAxisG
          .attr('transform', 'translate(0,' + innerHeight + ')')
          .call(timeAxis);

        // Draw smoothing axis if showing smoothing line
        let yAxisG = svg.select('g.yAxis');
        if (showSmoothingLines) {
          yAxisG.attr('display', '');
          let smoothScale = d3.scale.linear()
            .domain([0, maxKDE]) // assuming in milliseconds
            .range([innerHeight, 0]);
          let yAxis = d3.svg.axis()
            .scale(smoothScale)
            .orient('left')
            .tickValues([0, maxKDE])
            .tickSize(0);
          yAxisG.call(yAxis);
        } else {
          // hide axis
          yAxisG.attr('display', 'none');
        }

      });

    };

    chart.width = function (value) {
      if (!arguments.length) return outerWidth;
      outerWidth = value;
      return chart;
    };

    chart.height = function (value) {
      if (!arguments.length) return outerHeight;
      outerHeight = value;
      return chart;
    };

    chart.margin = function (value) {
      if (!arguments.length) return margin;
      margin = value;
      return chart;
    };

    chart.timeDomain = function (value) {
      if (!arguments.length) return timeDomain;
      timeDomain = value;
      return chart;
    };

    chart.curEvent = function (value) {
      if (!arguments.length) return curEvent;
      curEvent = value;
      return chart;
    };

    chart.curFactor = function (value) {
      if (!arguments.length) return curFactor;
      curFactor = value;
      return chart;
    };

    chart.interactionFactor = function (value) {
      if (!arguments.length) return interactionFactor;
      interactionFactor = value;
      return chart;
    };

    chart.trialEvents = function (value) {
      if (!arguments.length) return trialEvents;
      trialEvents = value;
      return chart;
    };

    chart.lineSmoothness = function (value) {
      if (!arguments.length) return lineSmoothness;
      lineSmoothness = value;
      return chart;
    };

    chart.showSmoothingLines = function (value) {
      if (!arguments.length) return showSmoothingLines;
      showSmoothingLines = value;
      return chart;
    };

    chart.showSpikes = function (value) {
      if (!arguments.length) return showSpikes;
      showSpikes = value;
      return chart;
    };

    chart.colorScale = function (value) {
      if (!arguments.length) return colorScale;
      colorScale = value;
      return chart;
    };

    return chart;

  }

  let rasterView = rasterChart();

  function createDropdown() {
    let key;
    let displayName;
    let options;
    let dispatch = d3.dispatch('click');

    function button(selection) {
      selection.each(function (data) {
        let menu = d3.select(this).selectAll('ul').selectAll('li').data(options,
          function (d) { return d[key]; });

        displayName = (typeof displayName === 'undefined') ? key : displayName;

        menu.enter()
          .append('li')
            .attr('id', function (d) {
              return d[key];
            })
            .attr('role', 'presentation')
            .append('a')
              .attr('role', 'menuitem')
              .attr('tabindex', -1)
              .text(function (d) {
                return d[displayName];
              });

        menu.on('click', dispatch.click);

        menu.exit().remove();

        let curText = options.filter(function (d) {return d[key] === data;})
          .map(function (d) { return d[displayName]; })[0];

        d3.select(this).selectAll('button')
          .text(curText)
          .append('span')
          .attr('class', 'caret');
      });

    }

    button.key = function (value) {
      if (!arguments.length) return key;
      key = value;
      return button;
    };

    button.options = function (value) {
      if (!arguments.length) return options;
      options = value;
      return button;
    };

    button.displayName = function (value) {
      if (!arguments.length) return displayName;
      displayName = value;
      return button;
    };

    d3.rebind(button, dispatch, 'on');

    return button;

  }

  var factorDropdown = createDropdown()
    .key('value')
    .displayName('name');

  factorDropdown.on('click', function () {
    var curFactor = d3.select(this).data()[0];
    rasterData.curFactor(curFactor.value);
  });

  let eventDropdown = createDropdown()
    .key('startID')
    .displayName('name');

  eventDropdown.on('click', function () {
    let curEvent = d3.select(this).data()[0];
    rasterData.curEvent(curEvent.startID);
  });

  function createSlider () {

    let stepSize;
    let domain;
    let maxStepInd;
    let units;
    let curValue;
    let minValue;
    let maxValue;
    let running = false;
    let delay = 200;
    let dispatch = d3.dispatch('sliderChange', 'start', 'stop');

    function slider(selection) {
      selection.each(function (value) {
        let input = d3.select(this).selectAll('input');
        let output = d3.select(this).selectAll('output');
        stepSize = stepSize || d3.round(domain[1] - domain[0], 4);
        maxStepInd = domain.length - 1;
        curValue = value;
        minValue = d3.min(domain);
        maxValue = d3.max(domain);

        input.property('min', minValue);
        input.property('max', maxValue);
        input.property('step', stepSize);
        input.property('value', value);
        input.on('input', function () {
          dispatch.sliderChange(+this.value);
        });

        output.text(value + ' ' + units);
      });
    };

    slider.stepSize = function (value) {
      if (!arguments.length) return stepSize;
      stepSize = value;
      return slider;
    };

    slider.running = function (value) {
      if (!arguments.length) return running;
      running = value;
      return slider;
    };

    slider.delay = function (value) {
      if (!arguments.length) return delay;
      delay = value;
      return slider;
    };

    slider.domain = function (value) {
      if (!arguments.length) return domain;
      domain = value;
      return slider;
    };

    slider.units = function (value) {
      if (!arguments.length) return units;
      units = value;
      return slider;
    };

    slider.maxStepInd = function (value) {
      if (!arguments.length) return maxStepInd;
      maxStepInd = value;
      return slider;
    };

    slider.curValue = function (value) {
      if (!arguments.length) return curValue;
      curValue = value;
      return slider;
    };

    slider.play = function () {
      running = true;
      dispatch.start();

      let t = setInterval(step, delay);

      function step() {
        if (curValue < maxValue && running) {
          curValue += stepSize;
          dispatch.sliderChange(curValue);
        } else {
          dispatch.stop();
          running = false;
          clearInterval(t);
        }
      }
    };

    slider.stop = function () {
      running = false;
      dispatch.stop();
    };

    slider.reset = function () {
      running = false;
      dispatch.sliderChange(minValue);
      dispatch.stop();
    };

    d3.rebind(slider, dispatch, 'on');

    return slider;

  }

  let smoothingSlider = createSlider();

  smoothingSlider
    .domain([5, 1000])
    .stepSize(5)
    .units('ms');

  smoothingSlider.on('sliderChange', function (smoothing) {
    rasterData.lineSmoothness(smoothing);
  });

  /* If showing spikes, set to reasonable height so spikes are visible, else
     pick the normal height of the plot if it's small or a value that can fit
     several plots on the screen.
  */
  function chartHeight (data) {
    const spikeDiameter = 4;
    const noSpikesHeight = 250;
    let heightMargin = rasterView.margin().top + rasterView.margin().bottom;
    let withSpikesHeight = (data.values.length * spikeDiameter) + heightMargin;

    return rasterData.showSpikes() ? withSpikesHeight : d3.min([noSpikesHeight, withSpikesHeight]);
  }

  function createList () {
    let key = '';
    let curSelected = '';
    let dispatch = d3.dispatch('click');

    function list(selection) {
      selection.each(function (data) {
        if (data.length === undefined || data.length === 0) {
          if (data[key] !== undefined) {
            data = [data];
          } else return;
        }

        let options = d3.select(this).select('select').selectAll('option')
          .data(data, function (d) {
            return d[key];
          });

        options.enter()
          .append('option')
          .text(function (d) {return d[key];});

        options.exit().remove();
        options.property('selected', false);
        options.filter(function (d) {return d[key] === curSelected;}).property('selected', true);
        options.on('click', function (d) { return dispatch.click(d[key]); });

      });
    }

    list.key = function (value) {
      if (!arguments.length) return key;
      key = value;
      return list;
    };

    list.curSelected = function (value) {
      if (!arguments.length) return curSelected;
      curSelected = value;
      return list;
    };

    d3.rebind(list, dispatch, 'on');

    return list;
  }

  let neuronList = createList();

  neuronList.key('name');

  neuronList.on('click', function (d) {
    rasterData.neuronName(d);
  });

  function createSearch () {
    let fuseOptions = {};
    let key = '';
    let dispatch = d3.dispatch('click');
    let guessIndex = 0;
    let guesses;
    const MAX_GUESSES = 10;

    function searchBox(selection) {
      selection.each(function (data) {
        let fuseSearch = new Fuse(data, fuseOptions);

        selection.select('input').on('input', function () {
          let curInput = d3.select(this).property('value');
          if (curInput.length < 2) {
            selection.classed('open', false);
            guessIndex = 0;
            return;
          }
          guesses = fuseSearch.search(curInput);

          guesses = guesses.filter(function (g) {return g.score < 0.05;});

          if (guesses.length > MAX_GUESSES) guesses = guesses.slice(0, MAX_GUESSES);

          let guessList = selection.select('ul').selectAll('li').data(guesses.map(function (d) {return d.item[key];}), String);

          guessList.enter()
            .append('li')
              .append('a')
              .attr('role', 'menuitem')
              .attr('tabindex', -1)
              .text(function (d) {return d;});

          guessList.selectAll('a').on('click', function (d) {
            selection.select('input').property('value', '');
            dispatch.click(d);
          });

          guessList.exit().remove();

          selection.classed('open', guesses.length > 0 & curInput.length > 2);

          d3.select(this).on('keydown', function () {
            let li = selection.select('ul').selectAll('li');
            switch (d3.event.keyCode) {
              case 38: // up
                guessIndex = (guessIndex > 0) ? guessIndex - 1 : 0;
                li.classed('active', false);
                li.filter(function (d, ind) {
                  return ind === guessIndex;
                }).classed('active', true);
                break;
              case 40: // down
                li.classed('active', false);
                li.filter(function (d, ind) {
                  return ind === guessIndex;
                }).classed('active', true);
                guessIndex = (guessIndex < guesses.length - 1) ? guessIndex + 1 : guesses.length - 1;
                break;
              case 13: // enter
                selection.classed('open', false);
                selection.select('input').property('value', '');
                dispatch.click(selection.select('ul').selectAll('.active').data()[0]);
                break;
            }

          });
        });
      });
    }

    searchBox.fuseOptions = function (value) {
      if (!arguments.length) return fuseOptions;
      fuseOptions = value;
      return searchBox;
    };

    searchBox.fuseOptions = function (value) {
      if (!arguments.length) return fuseOptions;
      fuseOptions = value;
      return searchBox;
    };

    searchBox.key = function (value) {
      if (!arguments.length) return key;
      key = value;
      return searchBox;
    };

    d3.rebind(searchBox, dispatch, 'on');
    return searchBox;
  }

  let neuronSearch = createSearch();

  const fuseOptions$1 = {
    threshold: 0.4,
    shouldSort: true,
    include: ['score'],
    location: 1,
    keys: ['name', 'brainArea'],
  };

  neuronSearch.on('click', function (d) {
    rasterData.neuronName(d);
  });

  neuronSearch
    .fuseOptions(fuseOptions$1)
    .key('name');

  let showLinesCheckbox = d3.select('#showLines input');

  showLinesCheckbox.on('change', function () {
    rasterData.showSmoothingLines(this.checked);
  });

  let showSpikesCheckbox = d3.select('#showRaster input');

  showSpikesCheckbox.on('change', function () {
    rasterData.showSpikes(this.checked);
  });

  function legendView(scale) {
    const CIRCLE_RADIUS = 7.5;
    let margin = { top: 10, right: 10, bottom: 10, left: 10 };
    let outerWidth = document.getElementById('legend').offsetWidth;
    let outerHeight = (scale.domain().length * CIRCLE_RADIUS * 3)
      + margin.top + margin.bottom + CIRCLE_RADIUS;
    let innerHeight = outerHeight - margin.top - margin.bottom;
    let innerWidth = outerWidth - margin.left - margin.right;
    let legendID = d3.select('#filterNav').select('#legend');
    let legend = d3.legend.color()
      .shape('circle')
      .shapeRadius(CIRCLE_RADIUS)
      .shapePadding(CIRCLE_RADIUS)
      .title('Legend')
      .scale(scale);
    let svg = legendID.selectAll('svg').data([{}]);
    svg.enter()
      .append('svg')
        .append('g');
    svg
      .attr('width', innerWidth + margin.left + margin.right)
      .attr('height', innerHeight + margin.top + margin.bottom);
    svg.select('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.select('g').call(legend);

  }

  let rasterData = rasterDataManger();
  rasterData.on('dataReady', function () {
    d3.select('span#NeuronName')
      .text('Neuron ' + rasterData.brainArea().toUpperCase() + ' ' + rasterData.neuronName());
    let chartWidth = document.getElementById('chart').offsetWidth;
    rasterView
      .width(chartWidth)
      .height(chartHeight)
      .timeDomain(rasterData.timeDomain())
      .trialEvents(rasterData.trialEvents())
      .lineSmoothness(rasterData.lineSmoothness())
      .showSmoothingLines(rasterData.showSmoothingLines())
      .showSpikes(rasterData.showSpikes())
      .curEvent(rasterData.curEvent())
      .curFactor(rasterData.curFactor())
      .interactionFactor(rasterData.interactionFactor())
      .colorScale(rasterData.colorScale());

    legendView(rasterData.colorScale());

    let multiples = d3.select('#chart').selectAll('div.row')
      .data(rasterData.rasterData(), function (d) {return d.key;});

    multiples.enter()
      .append('div')
        .attr('class', 'row')
        .attr('id', function (d) {return d.key;});

    multiples.exit().remove();
    multiples.call(rasterView);

    factorDropdown.options(rasterData.factorList());
    eventDropdown.options(rasterData.trialEvents());

    neuronList.curSelected(rasterData.neuronName());
    d3.select('#FactorSortMenu').datum(rasterData.curFactor()).call(factorDropdown);
    d3.select('#EventMenu').datum(rasterData.curEvent()).call(eventDropdown);
    d3.select('#LineSmoothSliderPanel').datum(rasterData.lineSmoothness()).call(smoothingSlider);
    d3.select('#NeuronMenu').datum(rasterData.neuronList()).call(neuronList);
    d3.select('#NeuronSearch').datum(rasterData.neuronList()).call(neuronSearch);

    showLinesCheckbox.property('checked', rasterData.showSmoothingLines());
    showSpikesCheckbox.property('checked', rasterData.showSpikes());
  });

  function download (svgInfo, filename) {
    window.URL = (window.URL || window.webkitURL);
    var blob = new Blob(svgInfo.source, {type: 'text\/xml'});
    var url = window.URL.createObjectURL(blob);
    var body = document.body;
    var a = document.createElement('a');

    body.appendChild(a);
    a.setAttribute('download', filename + '.svg');
    a.setAttribute('href', url);
    a.style.display = 'none';
    a.click();
    a.parentNode.removeChild(a);

    setTimeout(function() {
      window.URL.revokeObjectURL(url);
    }, 10);
  }

  var prefix = {
    svg: 'http://www.w3.org/2000/svg',
    xhtml: 'http://www.w3.org/1999/xhtml',
    xlink: 'http://www.w3.org/1999/xlink',
    xml: 'http://www.w3.org/XML/1998/namespace',
    xmlns: 'http://www.w3.org/2000/xmlns/',
  };

  function setInlineStyles (svg) {

    // add empty svg element
    var emptySvg = window.document.createElementNS(prefix.svg, 'svg');
    window.document.body.appendChild(emptySvg);
    var emptySvgDeclarationComputed = window.getComputedStyle(emptySvg);

    // hardcode computed css styles inside svg
    var allElements = traverse(svg);
    var i = allElements.length;
    while (i--) {
      explicitlySetStyle(allElements[i]);
    }

    emptySvg.parentNode.removeChild(emptySvg);

    function explicitlySetStyle(element) {
      var cSSStyleDeclarationComputed = window.getComputedStyle(element);
      var i;
      var len;
      var key;
      var value;
      var computedStyleStr = '';

      for (i = 0, len = cSSStyleDeclarationComputed.length; i < len; i++) {
        key = cSSStyleDeclarationComputed[i];
        value = cSSStyleDeclarationComputed.getPropertyValue(key);
        if (value !== emptySvgDeclarationComputed.getPropertyValue(key)) {
          // Don't set computed style of width and height. Makes SVG elmements disappear.
          if ((key !== 'height') && (key !== 'width')) {
            computedStyleStr += key + ':' + value + ';';
          }

        }
      }

      element.setAttribute('style', computedStyleStr);
    }

    function traverse(obj) {
      var tree = [];
      tree.push(obj);
      visit(obj);
      function visit(node) {
        if (node && node.hasChildNodes()) {
          var child = node.firstChild;
          while (child) {
            if (child.nodeType === 1 && child.nodeName != 'SCRIPT') {
              tree.push(child);
              visit(child);
            }

            child = child.nextSibling;
          }
        }
      }

      return tree;
    }
  }

  function preprocess (svg) {
    svg.setAttribute('version', '1.1');

    // removing attributes so they aren't doubled up
    svg.removeAttribute('xmlns');
    svg.removeAttribute('xlink');

    // These are needed for the svg
    if (!svg.hasAttributeNS(prefix.xmlns, 'xmlns')) {
      svg.setAttributeNS(prefix.xmlns, 'xmlns', prefix.svg);
    }

    if (!svg.hasAttributeNS(prefix.xmlns, 'xmlns:xlink')) {
      svg.setAttributeNS(prefix.xmlns, 'xmlns:xlink', prefix.xlink);
    }

    setInlineStyles(svg);

    var xmls = new XMLSerializer();
    var source = xmls.serializeToString(svg);
    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
    var rect = svg.getBoundingClientRect();
    var svgInfo = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      class: svg.getAttribute('class'),
      id: svg.getAttribute('id'),
      childElementCount: svg.childElementCount,
      source: [doctype + source],
    };

    return svgInfo;
  }

  function save(svgElement, config) {
    if (svgElement.nodeName !== 'svg' || svgElement.nodeType !== 1) {
      throw 'Need an svg element input';
    }

    var config = config || {};
    var svgInfo = preprocess(svgElement, config);
    var defaultFileName = getDefaultFileName(svgInfo);
    var filename = config.filename || defaultFileName;
    var svgInfo = preprocess(svgElement);
    download(svgInfo, filename);
  }

  function getDefaultFileName(svgInfo) {
    var defaultFileName = 'untitled';
    if (svgInfo.id) {
      defaultFileName = svgInfo.id;
    } else if (svgInfo.class) {
      defaultFileName = svgInfo.class;
    } else if (window.document.title) {
      defaultFileName = window.document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    }

    return defaultFileName;
  }

  let exportButton = d3.select('button#export');

  exportButton
    .on('click', function () {
      let svg = d3.selectAll('#chart').selectAll('svg')[0];
      let levelNames = rasterData.rasterData().map(function (d) {return d.key;});
      let curFactor = rasterData.curFactor();
      let curEvent = rasterData.curEvent();
      let neuronName = rasterData.neuronName();

      svg.forEach(function (s, i) {
        let saveName = neuronName + '_' +
                       curEvent + '_' +
                       curFactor + '_' +
                       levelNames[i];
        save(s, { filename: saveName });
      });

    });

  let permalinkBox = d3.select('#permalink');
  let permalinkButton = d3.select('button#link');
  permalinkButton
    .on('click', function () {
      permalinkBox
        .style('display', 'block');

      let linkString = window.location.origin + window.location.pathname + '?' +
        'neuronName=' + rasterData.neuronName() +
        '&curFactor=' + rasterData.curFactor() +
        '&curEvent=' + rasterData.curEvent() +
        '&showSmoothingLines=' + rasterData.showSmoothingLines() +
        '&lineSmoothness=' + rasterData.lineSmoothness() +
        '&showSpikes=' + rasterData.showSpikes() +
        '&interactionFactor=' + rasterData.interactionFactor();
      permalinkBox.selectAll('textarea').html(linkString);
      permalinkBox.selectAll('.bookmark').attr('href', linkString);
    });

  permalinkBox.selectAll('.close')
    .on('click', function () {
      permalinkBox.style('display', 'none');
    });

  // Set up help overlay
  let overlay = d3.select('#overlay');
  let helpButton = d3.select('button#help-button');
  overlay.selectAll('.close')
    .on('click', function() {
      overlay.style('display', 'none');
    });

  helpButton
    .on('click', function() {
      overlay
        .style('display', 'block');
    });

  function init(passedParams) {

    let showSpikes = (passedParams.showSpikes === undefined) ?
      true : (passedParams.showSpikes === 'true');
    let showSmoothingLines = (passedParams.showSmoothingLines === undefined) ?
      true : (passedParams.showSmoothingLines === 'true');
    let lineSmoothness = (passedParams.lineSmoothness || 20);
    let curFactor = passedParams.curFactor || 'trial_id';
    let curEvent = passedParams.curEvent || 'start_time';
    let interactionFactor = passedParams.interactionFactor || '';
    let neuronName = passedParams.neuronName || '';

    rasterData
      .showSpikes(showSpikes)
      .showSmoothingLines(showSmoothingLines)
      .lineSmoothness(lineSmoothness)
      .curFactor(curFactor)
      .curEvent(curEvent)
      .interactionFactor(interactionFactor)
      .neuronName(neuronName);

  }

  exports.init = init;

}));