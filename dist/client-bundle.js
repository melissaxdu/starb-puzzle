(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
'use strict';

var objectAssign = require('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"object-assign":9,"util/":4}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./support/isBuffer":3,"_process":18,"inherits":2}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
/* globals document, ImageData */

const parseFont = require('./lib/parse-font')

exports.parseFont = parseFont

exports.createCanvas = function (width, height) {
  return Object.assign(document.createElement('canvas'), { width: width, height: height })
}

exports.createImageData = function (array, width, height) {
  // Browser implementation of ImageData looks at the number of arguments passed
  switch (arguments.length) {
    case 0: return new ImageData()
    case 1: return new ImageData(array)
    case 2: return new ImageData(array, width)
    default: return new ImageData(array, width, height)
  }
}

exports.loadImage = function (src, options) {
  return new Promise(function (resolve, reject) {
    const image = Object.assign(document.createElement('img'), options)

    function cleanup () {
      image.onload = null
      image.onerror = null
    }

    image.onload = function () { cleanup(); resolve(image) }
    image.onerror = function () { cleanup(); reject(new Error('Failed to load the image "' + src + '"')) }

    image.src = src
  })
}

},{"./lib/parse-font":7}],7:[function(require,module,exports){
'use strict'

/**
 * Font RegExp helpers.
 */

const weights = 'bold|bolder|lighter|[1-9]00'
const styles = 'italic|oblique'
const variants = 'small-caps'
const stretches = 'ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded'
const units = 'px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q'
const string = '\'([^\']+)\'|"([^"]+)"|[\\w\\s-]+'

// [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]?
//    <‘font-size’> [ / <‘line-height’> ]? <‘font-family’> ]
// https://drafts.csswg.org/css-fonts-3/#font-prop
const weightRe = new RegExp(`(${weights}) +`, 'i')
const styleRe = new RegExp(`(${styles}) +`, 'i')
const variantRe = new RegExp(`(${variants}) +`, 'i')
const stretchRe = new RegExp(`(${stretches}) +`, 'i')
const sizeFamilyRe = new RegExp(
  `([\\d\\.]+)(${units}) *((?:${string})( *, *(?:${string}))*)`)

/**
 * Cache font parsing.
 */

const cache = {}

const defaultHeight = 16 // pt, common browser default

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object} Parsed font. `size` is in device units. `unit` is the unit
 *   appearing in the input string.
 * @api private
 */

module.exports = str => {
  // Cached
  if (cache[str]) return cache[str]

  // Try for required properties first.
  const sizeFamily = sizeFamilyRe.exec(str)
  if (!sizeFamily) return // invalid

  // Default values and required properties
  const font = {
    weight: 'normal',
    style: 'normal',
    stretch: 'normal',
    variant: 'normal',
    size: parseFloat(sizeFamily[1]),
    unit: sizeFamily[2],
    family: sizeFamily[3].replace(/["']/g, '').replace(/ *, */g, ',')
  }

  // Optional, unordered properties.
  let weight, style, variant, stretch
  // Stop search at `sizeFamily.index`
  const substr = str.substring(0, sizeFamily.index)
  if ((weight = weightRe.exec(substr))) font.weight = weight[1]
  if ((style = styleRe.exec(substr))) font.style = style[1]
  if ((variant = variantRe.exec(substr))) font.variant = variant[1]
  if ((stretch = stretchRe.exec(substr))) font.stretch = stretch[1]

  // Convert to device units. (`font.unit` is the original unit)
  // TODO: ch, ex
  switch (font.unit) {
    case 'pt':
      font.size /= 0.75
      break
    case 'pc':
      font.size *= 16
      break
    case 'in':
      font.size *= 96
      break
    case 'cm':
      font.size *= 96.0 / 2.54
      break
    case 'mm':
      font.size *= 96.0 / 25.4
      break
    case '%':
      // TODO disabled because existing unit tests assume 100
      // font.size *= defaultHeight / 100 / 0.75
      break
    case 'em':
    case 'rem':
      font.size *= defaultHeight / 0.75
      break
    case 'q':
      font.size *= 96 / 25.4 / 4
      break
  }

  return (cache[str] = font)
}

},{}],8:[function(require,module,exports){
(function (global){(function (){
"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var globalObject = getGlobal();

module.exports = exports = globalObject.fetch;

// Needed for TypeScript and Webpack.
if (globalObject.fetch) {
	exports.default = globalObject.fetch.bind(globalObject);
}

exports.Headers = globalObject.Headers;
exports.Request = globalObject.Request;
exports.Response = globalObject.Response;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],10:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = exports.makeNonterminalConverters = void 0;
const types_1 = require("./types");
const assert_1 = __importDefault(require("assert"));
const parser_1 = require("./parser");
/**
 * Converts string to nonterminal.
 * @param <NT> nonterminal enumeration
 * @param nonterminals required to be the runtime object for the <NT> type parameter
 * @return a pair of converters { nonterminalToString, stringToNonterminal }
 *              one takes a string (any alphabetic case) and returns the nonterminal it names
 *              the other takes a nonterminal and returns its string name, using the Typescript source capitalization.
 *         Both converters throw GrammarError if the conversion can't be done.
 * @throws GrammarError if NT has a name collision (two nonterminal names that differ only in capitalization,
 *       e.g. ROOT and root).
 */
function makeNonterminalConverters(nonterminals) {
    // "canonical name" is a case-independent name (canonicalized to lowercase)
    // "source name" is the name capitalized as in the Typescript source definition of NT
    const nonterminalForCanonicalName = new Map();
    const sourceNameForNonterminal = new Map();
    for (const key of Object.keys(nonterminals)) {
        // in Typescript, the nonterminals object combines both a NT->name mapping and name->NT mapping.
        // https://www.typescriptlang.org/docs/handbook/enums.html#enums-at-runtime
        // So filter just to keys that are valid Parserlib nonterminal names
        if (/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(key)) {
            const sourceName = key;
            const canonicalName = key.toLowerCase();
            const nt = nonterminals[sourceName];
            if (nonterminalForCanonicalName.has(canonicalName)) {
                throw new types_1.GrammarError('name collision in nonterminal enumeration: '
                    + sourceNameForNonterminal.get(nonterminalForCanonicalName.get(canonicalName))
                    + ' and ' + sourceName
                    + ' are the same when compared case-insensitively');
            }
            nonterminalForCanonicalName.set(canonicalName, nt);
            sourceNameForNonterminal.set(nt, sourceName);
        }
    }
    //console.error(sourceNameForNonterminal);
    function stringToNonterminal(name) {
        const canonicalName = name.toLowerCase();
        if (!nonterminalForCanonicalName.has(canonicalName)) {
            throw new types_1.GrammarError('grammar uses nonterminal ' + name + ', which is not found in the nonterminal enumeration passed to compile()');
        }
        return nonterminalForCanonicalName.get(canonicalName);
    }
    function nonterminalToString(nt) {
        if (!sourceNameForNonterminal.has(nt)) {
            throw new types_1.GrammarError('nonterminal ' + nt + ' is not found in the nonterminal enumeration passed to compile()');
        }
        return sourceNameForNonterminal.get(nt);
    }
    return { stringToNonterminal, nonterminalToString };
}
exports.makeNonterminalConverters = makeNonterminalConverters;
var GrammarNT;
(function (GrammarNT) {
    GrammarNT[GrammarNT["GRAMMAR"] = 0] = "GRAMMAR";
    GrammarNT[GrammarNT["PRODUCTION"] = 1] = "PRODUCTION";
    GrammarNT[GrammarNT["SKIPBLOCK"] = 2] = "SKIPBLOCK";
    GrammarNT[GrammarNT["UNION"] = 3] = "UNION";
    GrammarNT[GrammarNT["CONCATENATION"] = 4] = "CONCATENATION";
    GrammarNT[GrammarNT["REPETITION"] = 5] = "REPETITION";
    GrammarNT[GrammarNT["REPEATOPERATOR"] = 6] = "REPEATOPERATOR";
    GrammarNT[GrammarNT["UNIT"] = 7] = "UNIT";
    GrammarNT[GrammarNT["NONTERMINAL"] = 8] = "NONTERMINAL";
    GrammarNT[GrammarNT["TERMINAL"] = 9] = "TERMINAL";
    GrammarNT[GrammarNT["QUOTEDSTRING"] = 10] = "QUOTEDSTRING";
    GrammarNT[GrammarNT["NUMBER"] = 11] = "NUMBER";
    GrammarNT[GrammarNT["RANGE"] = 12] = "RANGE";
    GrammarNT[GrammarNT["UPPERBOUND"] = 13] = "UPPERBOUND";
    GrammarNT[GrammarNT["LOWERBOUND"] = 14] = "LOWERBOUND";
    GrammarNT[GrammarNT["CHARACTERSET"] = 15] = "CHARACTERSET";
    GrammarNT[GrammarNT["ANYCHAR"] = 16] = "ANYCHAR";
    GrammarNT[GrammarNT["CHARACTERCLASS"] = 17] = "CHARACTERCLASS";
    GrammarNT[GrammarNT["WHITESPACE"] = 18] = "WHITESPACE";
    GrammarNT[GrammarNT["ONELINECOMMENT"] = 19] = "ONELINECOMMENT";
    GrammarNT[GrammarNT["BLOCKCOMMENT"] = 20] = "BLOCKCOMMENT";
    GrammarNT[GrammarNT["SKIP"] = 21] = "SKIP";
})(GrammarNT || (GrammarNT = {}));
;
function ntt(nonterminal) {
    return (0, parser_1.nt)(nonterminal, GrammarNT[nonterminal]);
}
const grammarGrammar = new Map();
// grammar ::= ( production | skipBlock )+
grammarGrammar.set(GrammarNT.GRAMMAR, (0, parser_1.cat)(ntt(GrammarNT.SKIP), (0, parser_1.star)((0, parser_1.cat)((0, parser_1.or)(ntt(GrammarNT.PRODUCTION), ntt(GrammarNT.SKIPBLOCK)), ntt(GrammarNT.SKIP)))));
// skipBlock ::= '@skip' nonterminal '{' production* '}'
grammarGrammar.set(GrammarNT.SKIPBLOCK, (0, parser_1.cat)((0, parser_1.str)("@skip"), ntt(GrammarNT.SKIP), (0, parser_1.failfast)(ntt(GrammarNT.NONTERMINAL)), ntt(GrammarNT.SKIP), (0, parser_1.str)('{'), (0, parser_1.failfast)((0, parser_1.cat)(ntt(GrammarNT.SKIP), (0, parser_1.star)((0, parser_1.cat)(ntt(GrammarNT.PRODUCTION), ntt(GrammarNT.SKIP))), (0, parser_1.str)('}')))));
// production ::= nonterminal '::=' union ';'
grammarGrammar.set(GrammarNT.PRODUCTION, (0, parser_1.cat)(ntt(GrammarNT.NONTERMINAL), ntt(GrammarNT.SKIP), (0, parser_1.str)("::="), (0, parser_1.failfast)((0, parser_1.cat)(ntt(GrammarNT.SKIP), ntt(GrammarNT.UNION), ntt(GrammarNT.SKIP), (0, parser_1.str)(';')))));
// union :: = concatenation ('|' concatenation)*
grammarGrammar.set(GrammarNT.UNION, (0, parser_1.cat)(ntt(GrammarNT.CONCATENATION), (0, parser_1.star)((0, parser_1.cat)(ntt(GrammarNT.SKIP), (0, parser_1.str)('|'), ntt(GrammarNT.SKIP), ntt(GrammarNT.CONCATENATION)))));
// concatenation :: = repetition* 
grammarGrammar.set(GrammarNT.CONCATENATION, (0, parser_1.star)((0, parser_1.cat)(ntt(GrammarNT.REPETITION), ntt(GrammarNT.SKIP))));
// repetition ::= unit repeatOperator?
grammarGrammar.set(GrammarNT.REPETITION, (0, parser_1.cat)(ntt(GrammarNT.UNIT), ntt(GrammarNT.SKIP), (0, parser_1.option)(ntt(GrammarNT.REPEATOPERATOR))));
// repeatOperator ::= [*+?] | '{' ( number | range | upperBound | lowerBound ) '}'
grammarGrammar.set(GrammarNT.REPEATOPERATOR, (0, parser_1.or)((0, parser_1.regex)("[*+?]"), (0, parser_1.cat)((0, parser_1.str)("{"), (0, parser_1.or)(ntt(GrammarNT.NUMBER), ntt(GrammarNT.RANGE), ntt(GrammarNT.UPPERBOUND), ntt(GrammarNT.LOWERBOUND)), (0, parser_1.str)("}"))));
// number ::= [0-9]+
grammarGrammar.set(GrammarNT.NUMBER, (0, parser_1.plus)((0, parser_1.regex)("[0-9]")));
// range ::= number ',' number
grammarGrammar.set(GrammarNT.RANGE, (0, parser_1.cat)(ntt(GrammarNT.NUMBER), (0, parser_1.str)(","), ntt(GrammarNT.NUMBER)));
// upperBound ::= ',' number
grammarGrammar.set(GrammarNT.UPPERBOUND, (0, parser_1.cat)((0, parser_1.str)(","), ntt(GrammarNT.NUMBER)));
// lowerBound ::= number ','
grammarGrammar.set(GrammarNT.LOWERBOUND, (0, parser_1.cat)(ntt(GrammarNT.NUMBER), (0, parser_1.str)(",")));
// unit ::= nonterminal | terminal | '(' union ')'
grammarGrammar.set(GrammarNT.UNIT, (0, parser_1.or)(ntt(GrammarNT.NONTERMINAL), ntt(GrammarNT.TERMINAL), (0, parser_1.cat)((0, parser_1.str)('('), ntt(GrammarNT.SKIP), ntt(GrammarNT.UNION), ntt(GrammarNT.SKIP), (0, parser_1.str)(')'))));
// nonterminal ::= [a-zA-Z_][a-zA-Z_0-9]*
grammarGrammar.set(GrammarNT.NONTERMINAL, (0, parser_1.cat)((0, parser_1.regex)("[a-zA-Z_]"), (0, parser_1.star)((0, parser_1.regex)("[a-zA-Z_0-9]"))));
// terminal ::= quotedString | characterSet | anyChar | characterClass
grammarGrammar.set(GrammarNT.TERMINAL, (0, parser_1.or)(ntt(GrammarNT.QUOTEDSTRING), ntt(GrammarNT.CHARACTERSET), ntt(GrammarNT.ANYCHAR), ntt(GrammarNT.CHARACTERCLASS)));
// quotedString ::= "'" ([^'\r\n\\] | '\\' . )* "'" | '"' ([^"\r\n\\] | '\\' . )* '"'
grammarGrammar.set(GrammarNT.QUOTEDSTRING, (0, parser_1.or)((0, parser_1.cat)((0, parser_1.str)("'"), (0, parser_1.failfast)((0, parser_1.star)((0, parser_1.or)((0, parser_1.regex)("[^'\r\n\\\\]"), (0, parser_1.cat)((0, parser_1.str)('\\'), (0, parser_1.regex)("."))))), (0, parser_1.str)("'")), (0, parser_1.cat)((0, parser_1.str)('"'), (0, parser_1.failfast)((0, parser_1.star)((0, parser_1.or)((0, parser_1.regex)('[^"\r\n\\\\]'), (0, parser_1.cat)((0, parser_1.str)('\\'), (0, parser_1.regex)("."))))), (0, parser_1.str)('"'))));
// characterSet ::= '[' ([^\]\r\n\\] | '\\' . )+ ']'
grammarGrammar.set(GrammarNT.CHARACTERSET, (0, parser_1.cat)((0, parser_1.str)('['), (0, parser_1.failfast)((0, parser_1.cat)((0, parser_1.plus)((0, parser_1.or)((0, parser_1.regex)("[^\\]\r\n\\\\]"), (0, parser_1.cat)((0, parser_1.str)('\\'), (0, parser_1.regex)(".")))))), (0, parser_1.str)(']')));
// anyChar ::= '.'
grammarGrammar.set(GrammarNT.ANYCHAR, (0, parser_1.str)('.'));
// characterClass ::= '\\' [dsw]
grammarGrammar.set(GrammarNT.CHARACTERCLASS, (0, parser_1.cat)((0, parser_1.str)('\\'), (0, parser_1.failfast)((0, parser_1.regex)("[dsw]"))));
// whitespace ::= [ \t\r\n]
grammarGrammar.set(GrammarNT.WHITESPACE, (0, parser_1.regex)("[ \t\r\n]"));
grammarGrammar.set(GrammarNT.ONELINECOMMENT, (0, parser_1.cat)((0, parser_1.str)("//"), (0, parser_1.star)((0, parser_1.regex)("[^\r\n]")), (0, parser_1.or)((0, parser_1.str)("\r\n"), (0, parser_1.str)('\n'), (0, parser_1.str)('\r'))));
grammarGrammar.set(GrammarNT.BLOCKCOMMENT, (0, parser_1.cat)((0, parser_1.str)("/*"), (0, parser_1.cat)((0, parser_1.star)((0, parser_1.regex)("[^*]")), (0, parser_1.str)('*')), (0, parser_1.star)((0, parser_1.cat)((0, parser_1.regex)("[^/]"), (0, parser_1.star)((0, parser_1.regex)("[^*]")), (0, parser_1.str)('*'))), (0, parser_1.str)('/')));
grammarGrammar.set(GrammarNT.SKIP, (0, parser_1.star)((0, parser_1.or)(ntt(GrammarNT.WHITESPACE), ntt(GrammarNT.ONELINECOMMENT), ntt(GrammarNT.BLOCKCOMMENT))));
const grammarParser = new parser_1.InternalParser(grammarGrammar, ntt(GrammarNT.GRAMMAR), (nt) => GrammarNT[nt]);
/**
 * Compile a Parser from a grammar represented as a string.
 * @param <NT> a Typescript Enum with one symbol for each nonterminal used in the grammar,
 *        matching the nonterminals when compared case-insensitively (so ROOT and Root and root are the same).
 * @param grammar the grammar to use
 * @param nonterminals the runtime object of the nonterminals enum. For example, if
 *             enum Nonterminals { root, a, b, c };
 *        then Nonterminals must be explicitly passed as this runtime parameter
 *              compile(grammar, Nonterminals, Nonterminals.root);
 *        (in addition to being implicitly used for the type parameter NT)
 * @param rootNonterminal the desired root nonterminal in the grammar
 * @return a parser for the given grammar that will start parsing at rootNonterminal.
 * @throws ParseError if the grammar has a syntax error
 */
function compile(grammar, nonterminals, rootNonterminal) {
    const { stringToNonterminal, nonterminalToString } = makeNonterminalConverters(nonterminals);
    const grammarTree = (() => {
        try {
            return grammarParser.parse(grammar);
        }
        catch (e) {
            throw (e instanceof types_1.InternalParseError) ? new types_1.GrammarError("grammar doesn't compile", e) : e;
        }
    })();
    const definitions = new Map();
    const nonterminalsDefined = new Set(); // on lefthand-side of some production
    const nonterminalsUsed = new Set(); // on righthand-side of some production
    // productions outside @skip blocks
    makeProductions(grammarTree.childrenByName(GrammarNT.PRODUCTION), null);
    // productions inside @skip blocks
    for (const skipBlock of grammarTree.childrenByName(GrammarNT.SKIPBLOCK)) {
        makeSkipBlock(skipBlock);
    }
    for (const nt of nonterminalsUsed) {
        if (!nonterminalsDefined.has(nt)) {
            throw new types_1.GrammarError("grammar is missing a definition for " + nonterminalToString(nt));
        }
    }
    if (!nonterminalsDefined.has(rootNonterminal)) {
        throw new types_1.GrammarError("grammar is missing a definition for the root nonterminal " + nonterminalToString(rootNonterminal));
    }
    return new parser_1.InternalParser(definitions, (0, parser_1.nt)(rootNonterminal, nonterminalToString(rootNonterminal)), nonterminalToString);
    function makeProductions(productions, skip) {
        for (const production of productions) {
            const nonterminalName = production.childrenByName(GrammarNT.NONTERMINAL)[0].text;
            const nonterminal = stringToNonterminal(nonterminalName);
            nonterminalsDefined.add(nonterminal);
            let expression = makeGrammarTerm(production.childrenByName(GrammarNT.UNION)[0], skip);
            if (skip)
                expression = (0, parser_1.cat)(skip, expression, skip);
            if (definitions.has(nonterminal)) {
                // grammar already has a production for this nonterminal; or expression onto it
                definitions.set(nonterminal, (0, parser_1.or)(definitions.get(nonterminal), expression));
            }
            else {
                definitions.set(nonterminal, expression);
            }
        }
    }
    function makeSkipBlock(skipBlock) {
        const nonterminalName = skipBlock.childrenByName(GrammarNT.NONTERMINAL)[0].text;
        const nonterminal = stringToNonterminal(nonterminalName);
        nonterminalsUsed.add(nonterminal);
        const skipTerm = (0, parser_1.skip)((0, parser_1.nt)(nonterminal, nonterminalName));
        makeProductions(skipBlock.childrenByName(GrammarNT.PRODUCTION), skipTerm);
    }
    function makeGrammarTerm(tree, skip) {
        switch (tree.name) {
            case GrammarNT.UNION: {
                const childexprs = tree.childrenByName(GrammarNT.CONCATENATION).map(child => makeGrammarTerm(child, skip));
                return childexprs.length == 1 ? childexprs[0] : (0, parser_1.or)(...childexprs);
            }
            case GrammarNT.CONCATENATION: {
                let childexprs = tree.childrenByName(GrammarNT.REPETITION).map(child => makeGrammarTerm(child, skip));
                if (skip) {
                    // insert skip between each pair of children
                    let childrenWithSkips = [];
                    for (const child of childexprs) {
                        if (childrenWithSkips.length > 0)
                            childrenWithSkips.push(skip);
                        childrenWithSkips.push(child);
                    }
                    childexprs = childrenWithSkips;
                }
                return (childexprs.length == 1) ? childexprs[0] : (0, parser_1.cat)(...childexprs);
            }
            case GrammarNT.REPETITION: {
                const unit = makeGrammarTerm(tree.childrenByName(GrammarNT.UNIT)[0], skip);
                const op = tree.childrenByName(GrammarNT.REPEATOPERATOR)[0];
                if (!op) {
                    return unit;
                }
                else {
                    const unitWithSkip = skip ? (0, parser_1.cat)(unit, skip) : unit;
                    //console.log('op is', op);
                    switch (op.text) {
                        case '*': return (0, parser_1.star)(unitWithSkip);
                        case '+': return (0, parser_1.plus)(unitWithSkip);
                        case '?': return (0, parser_1.option)(unitWithSkip);
                        default: {
                            // op is {n,m} or one of its variants
                            const range = op.children[0];
                            switch (range.name) {
                                case GrammarNT.NUMBER: {
                                    const n = parseInt(range.text);
                                    return (0, parser_1.repeat)(unitWithSkip, new parser_1.Between(n, n));
                                    break;
                                }
                                case GrammarNT.RANGE: {
                                    const n = parseInt(range.children[0].text);
                                    const m = parseInt(range.children[1].text);
                                    return (0, parser_1.repeat)(unitWithSkip, new parser_1.Between(n, m));
                                    break;
                                }
                                case GrammarNT.UPPERBOUND: {
                                    const m = parseInt(range.children[0].text);
                                    return (0, parser_1.repeat)(unitWithSkip, new parser_1.Between(0, m));
                                    break;
                                }
                                case GrammarNT.LOWERBOUND: {
                                    const n = parseInt(range.children[0].text);
                                    return (0, parser_1.repeat)(unitWithSkip, new parser_1.AtLeast(n));
                                    break;
                                }
                                default:
                                    throw new Error('internal error: unknown range: ' + range.name);
                            }
                        }
                    }
                }
            }
            case GrammarNT.UNIT:
                return makeGrammarTerm(tree.childrenByName(GrammarNT.NONTERMINAL)[0]
                    || tree.childrenByName(GrammarNT.TERMINAL)[0]
                    || tree.childrenByName(GrammarNT.UNION)[0], skip);
            case GrammarNT.NONTERMINAL: {
                const nonterminal = stringToNonterminal(tree.text);
                nonterminalsUsed.add(nonterminal);
                return (0, parser_1.nt)(nonterminal, tree.text);
            }
            case GrammarNT.TERMINAL:
                switch (tree.children[0].name) {
                    case GrammarNT.QUOTEDSTRING:
                        return (0, parser_1.str)(stripQuotesAndReplaceEscapeSequences(tree.text));
                    case GrammarNT.CHARACTERSET: // e.g. [abc]
                    case GrammarNT.ANYCHAR: // e.g.  .
                    case GrammarNT.CHARACTERCLASS: // e.g.  \d  \s  \w
                        return (0, parser_1.regex)(tree.text);
                    default:
                        throw new Error('internal error: unknown literal: ' + tree.children[0]);
                }
            default:
                throw new Error('internal error: unknown grammar rule: ' + tree.name);
        }
    }
    /**
     * Strip starting and ending quotes.
     * Replace \t, \r, \n with their character codes.
     * Replaces all other \x with literal x.
     */
    function stripQuotesAndReplaceEscapeSequences(s) {
        (0, assert_1.default)(s[0] == '"' || s[0] == "'");
        s = s.substring(1, s.length - 1);
        s = s.replace(/\\(.)/g, (match, escapedChar) => {
            switch (escapedChar) {
                case 't': return '\t';
                case 'r': return '\r';
                case 'n': return '\n';
                default: return escapedChar;
            }
        });
        return s;
    }
}
exports.compile = compile;

},{"./parser":12,"./types":14,"assert":1}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indent = exports.snippet = exports.escapeForReading = exports.toColumn = exports.toLine = exports.describeLocation = exports.makeErrorMessage = void 0;
/**
 * Make a human-readable error message explaining a parse error and where it was found in the input.
 * @param message brief message stating what error occurred
 * @param nonterminalName name of deepest nonterminal that parser was trying to match when parse failed
 * @param expectedText human-readable description of what string literals the parser was expecting there;
 *            e.g. ";", "[ \r\n\t]", "1|2|3"
 * @param stringBeingParsed original input to parse()
 * @param pos offset in stringBeingParsed where error occurred
 * @param nameOfStringBeingParsed human-readable description of where stringBeingParsed came from;
 *             e.g. "grammar" if stringBeingParsed was the input to Parser.compile(),
 *             or "string being parsed" if stringBeingParsed was the input to Parser.parse()
 * @return a multiline human-readable message that states the error, its location in the input,
 *         what text was expected and what text was actually found.
 */
function makeErrorMessage(message, nonterminalName, expectedText, stringBeingParsed, pos, nameOfStringBeingParsed) {
    let result = message;
    if (result.length > 0)
        result += "\n";
    result +=
        "Error at " + describeLocation(stringBeingParsed, pos) + " of " + nameOfStringBeingParsed + "\n"
            + "  trying to match " + nonterminalName.toUpperCase() + "\n"
            + "  expected " + escapeForReading(expectedText, "")
            + ((stringBeingParsed.length > 0)
                ? "\n   but saw " + snippet(stringBeingParsed, pos)
                : "");
    return result;
}
exports.makeErrorMessage = makeErrorMessage;
/**
 * @param string to describe
 * @param pos offset in string, 0<=pos<string.length()
 * @return a human-readable description of the location of the character at offset pos in string
 * (using offset and/or line/column if appropriate)
 */
function describeLocation(s, pos) {
    let result = "offset " + pos;
    if (s.indexOf('\n') != -1) {
        result += " (line " + toLine(s, pos) + " column " + toColumn(s, pos) + ")";
    }
    return result;
}
exports.describeLocation = describeLocation;
/**
 * Translates a string offset into a line number.
 * @param string in which offset occurs
 * @param pos offset in string, 0<=pos<string.length()
 * @return the 1-based line number of the character at offset pos in string,
 * as if string were being viewed in a text editor
 */
function toLine(s, pos) {
    let lineCount = 1;
    for (let newline = s.indexOf('\n'); newline != -1 && newline < pos; newline = s.indexOf('\n', newline + 1)) {
        ++lineCount;
    }
    return lineCount;
}
exports.toLine = toLine;
/**
 * Translates a string offset into a column number.
 * @param string in which offset occurs
 * @param pos offset in string, 0<=pos<string.length()
 * @return the 1-based column number of the character at offset pos in string,
 * as if string were being viewed in a text editor with tab size 1 (i.e. a tab is treated like a space)
 */
function toColumn(s, pos) {
    const lastNewlineBeforePos = s.lastIndexOf('\n', pos - 1);
    const totalSizeOfPrecedingLines = (lastNewlineBeforePos != -1) ? lastNewlineBeforePos + 1 : 0;
    return pos - totalSizeOfPrecedingLines + 1;
}
exports.toColumn = toColumn;
/**
* Replace common unprintable characters by their escape codes, for human reading.
* Should be idempotent, i.e. if x = escapeForReading(y), then x.equals(escapeForReading(x)).
* @param string to escape
* @param quote quotes to put around string, or "" if no quotes required
* @return string with escape codes replaced, preceded and followed by quote, with a human-readable legend appended to the end
*         explaining what the replacement characters mean.
*/
function escapeForReading(s, quote) {
    let result = s;
    const legend = [];
    for (const { unprintableChar, humanReadableVersion, description } of ESCAPES) {
        if (result.includes(unprintableChar)) {
            result = result.replace(unprintableChar, humanReadableVersion);
            legend.push(humanReadableVersion + " means " + description);
        }
    }
    result = quote + result + quote;
    if (legend.length > 0) {
        result += " (where " + legend.join(", ") + ")";
    }
    return result;
}
exports.escapeForReading = escapeForReading;
const ESCAPES = [
    {
        unprintableChar: "\n",
        humanReadableVersion: "\u2424",
        description: "newline"
    },
    {
        unprintableChar: "\r",
        humanReadableVersion: "\u240D",
        description: "carriage return"
    },
    {
        unprintableChar: "\t",
        humanReadableVersion: "\u21E5",
        description: "tab"
    },
];
/**
 * @param string to shorten
 * @param pos offset in string, 0<=pos<string.length()
 * @return a short snippet of the part of string starting at offset pos,
 * in human-readable form
 */
function snippet(s, pos) {
    const maxCharsToShow = 10;
    const end = Math.min(pos + maxCharsToShow, s.length);
    let result = s.substring(pos, end) + (end < s.length ? "..." : "");
    if (result.length == 0)
        result = "end of string";
    return escapeForReading(result, "");
}
exports.snippet = snippet;
/**
 * Indent a multi-line string by preceding each line with prefix.
 * @param string string to indent
 * @param prefix prefix to use for indenting
 * @return string with prefix inserted at the start of each line
 */
function indent(s, prefix) {
    let result = "";
    let charsCopied = 0;
    do {
        const newline = s.indexOf('\n', charsCopied);
        const endOfLine = newline != -1 ? newline + 1 : s.length;
        result += prefix + s.substring(charsCopied, endOfLine);
        charsCopied = endOfLine;
    } while (charsCopied < s.length);
    return result;
}
exports.indent = indent;

},{}],12:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserState = exports.FailedParse = exports.SuccessfulParse = exports.InternalParser = exports.failfast = exports.skip = exports.option = exports.plus = exports.star = exports.repeat = exports.ZERO_OR_ONE = exports.ONE_OR_MORE = exports.ZERO_OR_MORE = exports.Between = exports.AtLeast = exports.or = exports.cat = exports.str = exports.regex = exports.nt = void 0;
const assert_1 = __importDefault(require("assert"));
const types_1 = require("./types");
const parsetree_1 = require("./parsetree");
function nt(nonterminal, nonterminalName) {
    return {
        parse(s, pos, definitions, state) {
            const gt = definitions.get(nonterminal);
            if (gt === undefined)
                throw new types_1.GrammarError("nonterminal has no definition: " + nonterminalName);
            // console.error("entering", nonterminalName);
            state.enter(pos, nonterminal);
            let pr = gt.parse(s, pos, definitions, state);
            state.leave(nonterminal);
            // console.error("leaving", nonterminalName, "with result", pr);
            if (!pr.failed && !state.isEmpty()) {
                const tree = pr.tree;
                const newTree = state.makeParseTree(tree.start, tree.text, [tree]);
                pr = pr.replaceTree(newTree);
            }
            return pr;
        },
        toString() {
            return nonterminalName;
        }
    };
}
exports.nt = nt;
function regex(regexSource) {
    let regex = new RegExp('^' + regexSource + '$', 's');
    return {
        parse(s, pos, definitions, state) {
            if (pos >= s.length) {
                return state.makeFailedParse(pos, regexSource);
            }
            const l = s.substring(pos, pos + 1);
            if (regex.test(l)) {
                return state.makeSuccessfulParse(pos, pos + 1, l);
            }
            return state.makeFailedParse(pos, regexSource);
        },
        toString() {
            return regexSource;
        }
    };
}
exports.regex = regex;
function str(str) {
    return {
        parse(s, pos, definitions, state) {
            const newpos = pos + str.length;
            if (newpos > s.length) {
                return state.makeFailedParse(pos, str);
            }
            const l = s.substring(pos, newpos);
            if (l === str) {
                return state.makeSuccessfulParse(pos, newpos, l);
            }
            return state.makeFailedParse(pos, str);
        },
        toString() {
            return "'" + str.replace(/'\r\n\t\\/, "\\$&") + "'";
        }
    };
}
exports.str = str;
function cat(...terms) {
    return {
        parse(s, pos, definitions, state) {
            let prout = state.makeSuccessfulParse(pos, pos);
            for (const gt of terms) {
                const pr = gt.parse(s, pos, definitions, state);
                if (pr.failed)
                    return pr;
                pos = pr.pos;
                prout = prout.mergeResult(pr);
            }
            return prout;
        },
        toString() {
            return "(" + terms.map(term => term.toString()).join(" ") + ")";
        }
    };
}
exports.cat = cat;
/**
 * @param choices must be nonempty
 */
function or(...choices) {
    (0, assert_1.default)(choices.length > 0);
    return {
        parse(s, pos, definitions, state) {
            const successes = [];
            const failures = [];
            choices.forEach((choice) => {
                const result = choice.parse(s, pos, definitions, state);
                if (result.failed) {
                    failures.push(result);
                }
                else {
                    successes.push(result);
                }
            });
            if (successes.length > 0) {
                const longestSuccesses = longestResults(successes);
                (0, assert_1.default)(longestSuccesses.length > 0);
                return longestSuccesses[0];
            }
            const longestFailures = longestResults(failures);
            (0, assert_1.default)(longestFailures.length > 0);
            return state.makeFailedParse(longestFailures[0].pos, longestFailures.map((result) => result.expectedText).join("|"));
        },
        toString() {
            return "(" + choices.map(choice => choice.toString()).join("|") + ")";
        }
    };
}
exports.or = or;
class AtLeast {
    constructor(min) {
        this.min = min;
    }
    tooLow(n) { return n < this.min; }
    tooHigh(n) { return false; }
    toString() {
        switch (this.min) {
            case 0: return "*";
            case 1: return "+";
            default: return "{" + this.min + ",}";
        }
    }
}
exports.AtLeast = AtLeast;
class Between {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    tooLow(n) { return n < this.min; }
    tooHigh(n) { return n > this.max; }
    toString() {
        if (this.min == 0) {
            return (this.max == 1) ? "?" : "{," + this.max + "}";
        }
        else {
            return "{" + this.min + "," + this.max + "}";
        }
    }
}
exports.Between = Between;
exports.ZERO_OR_MORE = new AtLeast(0);
exports.ONE_OR_MORE = new AtLeast(1);
exports.ZERO_OR_ONE = new Between(0, 1);
function repeat(gt, howmany) {
    return {
        parse(s, pos, definitions, state) {
            let prout = state.makeSuccessfulParse(pos, pos);
            for (let timesMatched = 0; howmany.tooLow(timesMatched) || !howmany.tooHigh(timesMatched + 1); ++timesMatched) {
                const pr = gt.parse(s, pos, definitions, state);
                if (pr.failed) {
                    // no match
                    if (howmany.tooLow(timesMatched)) {
                        return pr;
                    }
                    return prout.addLastFailure(pr);
                }
                else {
                    if (pr.pos == pos) {
                        // matched the empty string, and we already have enough.
                        // we may get into an infinite loop if howmany.tooHigh() never returns false,
                        // so return successful match at this point
                        return prout;
                    }
                    // otherwise advance the position and merge pr into prout
                    pos = pr.pos;
                    prout = prout.mergeResult(pr);
                }
            }
            return prout;
        },
        toString() {
            return gt.toString() + howmany.toString();
        }
    };
}
exports.repeat = repeat;
function star(gt) {
    return repeat(gt, exports.ZERO_OR_MORE);
}
exports.star = star;
function plus(gt) {
    return repeat(gt, exports.ONE_OR_MORE);
}
exports.plus = plus;
function option(gt) {
    return repeat(gt, exports.ZERO_OR_ONE);
}
exports.option = option;
function skip(nonterminal) {
    const repetition = star(nonterminal);
    return {
        parse(s, pos, definitions, state) {
            state.enterSkip();
            let pr = repetition.parse(s, pos, definitions, state);
            state.leaveSkip();
            if (pr.failed) {
                // succeed anyway
                pr = state.makeSuccessfulParse(pos, pos);
            }
            return pr;
        },
        toString() {
            return "(?<skip>" + repetition + ")";
        }
    };
}
exports.skip = skip;
function failfast(gt) {
    return {
        parse(s, pos, definitions, state) {
            let pr = gt.parse(s, pos, definitions, state);
            if (pr.failed)
                throw new types_1.InternalParseError("", pr.nonterminalName, pr.expectedText, "", pr.pos);
            return pr;
        },
        toString() {
            return 'failfast(' + gt + ')';
        }
    };
}
exports.failfast = failfast;
class InternalParser {
    constructor(definitions, start, nonterminalToString) {
        this.definitions = definitions;
        this.start = start;
        this.nonterminalToString = nonterminalToString;
        this.checkRep();
    }
    checkRep() {
    }
    parse(textToParse) {
        let pr = (() => {
            try {
                return this.start.parse(textToParse, 0, this.definitions, new ParserState(this.nonterminalToString));
            }
            catch (e) {
                if (e instanceof types_1.InternalParseError) {
                    // rethrow the exception, augmented by the original text, so that the error message is better
                    throw new types_1.InternalParseError("string does not match grammar", e.nonterminalName, e.expectedText, textToParse, e.pos);
                }
                else {
                    throw e;
                }
            }
        })();
        if (pr.failed) {
            throw new types_1.InternalParseError("string does not match grammar", pr.nonterminalName, pr.expectedText, textToParse, pr.pos);
        }
        if (pr.pos < textToParse.length) {
            const message = "only part of the string matches the grammar; the rest did not parse";
            throw (pr.lastFailure
                ? new types_1.InternalParseError(message, pr.lastFailure.nonterminalName, pr.lastFailure.expectedText, textToParse, pr.lastFailure.pos)
                : new types_1.InternalParseError(message, this.start.toString(), "end of string", textToParse, pr.pos));
        }
        return pr.tree;
    }
    ;
    toString() {
        return Array.from(this.definitions, ([nonterminal, rule]) => this.nonterminalToString(nonterminal) + '::=' + rule + ';').join("\n");
    }
}
exports.InternalParser = InternalParser;
class SuccessfulParse {
    constructor(pos, tree, lastFailure) {
        this.pos = pos;
        this.tree = tree;
        this.lastFailure = lastFailure;
        this.failed = false;
    }
    replaceTree(tree) {
        return new SuccessfulParse(this.pos, tree, this.lastFailure);
    }
    mergeResult(that) {
        (0, assert_1.default)(!that.failed);
        //console.log('merging', this, 'with', that);
        return new SuccessfulParse(that.pos, this.tree.concat(that.tree), laterResult(this.lastFailure, that.lastFailure));
    }
    /**
     * Keep track of a failing parse result that prevented this tree from matching more of the input string.
     * This deeper failure is usually more informative to the user, so we'll display it in the error message.
     * @param newLastFailure a failing ParseResult<NT> that stopped this tree's parse (but didn't prevent this from succeeding)
     * @return a new ParseResult<NT> identical to this one but with lastFailure added to it
     */
    addLastFailure(newLastFailure) {
        (0, assert_1.default)(newLastFailure.failed);
        return new SuccessfulParse(this.pos, this.tree, laterResult(this.lastFailure, newLastFailure));
    }
}
exports.SuccessfulParse = SuccessfulParse;
class FailedParse {
    constructor(pos, nonterminalName, expectedText) {
        this.pos = pos;
        this.nonterminalName = nonterminalName;
        this.expectedText = expectedText;
        this.failed = true;
    }
}
exports.FailedParse = FailedParse;
/**
 * @param result1
 * @param result2
 * @return whichever of result1 or result2 has the mximum position, or undefined if both are undefined
 */
function laterResult(result1, result2) {
    if (result1 && result2)
        return result1.pos >= result2.pos ? result1 : result2;
    else
        return result1 || result2;
}
/**
 * @param results
 * @return the results in the list with maximum pos.  Empty if list is empty.
 */
function longestResults(results) {
    return results.reduce((longestResultsSoFar, result) => {
        if (longestResultsSoFar.length == 0 || result.pos > longestResultsSoFar[0].pos) {
            // result wins
            return [result];
        }
        else if (result.pos == longestResultsSoFar[0].pos) {
            // result is tied
            longestResultsSoFar.push(result);
            return longestResultsSoFar;
        }
        else {
            // result loses
            return longestResultsSoFar;
        }
    }, []);
}
class ParserState {
    constructor(nonterminalToString) {
        this.nonterminalToString = nonterminalToString;
        this.stack = [];
        this.first = new Map();
        this.skipDepth = 0;
    }
    enter(pos, nonterminal) {
        if (!this.first.has(nonterminal)) {
            this.first.set(nonterminal, []);
        }
        const s = this.first.get(nonterminal);
        if (s.length > 0 && s[s.length - 1] == pos) {
            throw new types_1.GrammarError("detected left recursion in rule for " + this.nonterminalToString(nonterminal));
        }
        s.push(pos);
        this.stack.push(nonterminal);
    }
    leave(nonterminal) {
        (0, assert_1.default)(this.first.has(nonterminal) && this.first.get(nonterminal).length > 0);
        this.first.get(nonterminal).pop();
        const last = this.stack.pop();
        (0, assert_1.default)(last === nonterminal);
    }
    enterSkip() {
        //console.error('entering skip');
        ++this.skipDepth;
    }
    leaveSkip() {
        //console.error('leaving skip');
        --this.skipDepth;
        (0, assert_1.default)(this.skipDepth >= 0);
    }
    isEmpty() {
        return this.stack.length == 0;
    }
    get currentNonterminal() {
        return this.stack[this.stack.length - 1];
    }
    get currentNonterminalName() {
        return this.currentNonterminal !== undefined ? this.nonterminalToString(this.currentNonterminal) : undefined;
    }
    // requires: !isEmpty()
    makeParseTree(pos, text = '', children = []) {
        (0, assert_1.default)(!this.isEmpty());
        return new parsetree_1.InternalParseTree(this.currentNonterminal, this.currentNonterminalName, pos, text, children, this.skipDepth > 0);
    }
    // requires !isEmpty()
    makeSuccessfulParse(fromPos, toPos, text = '', children = []) {
        (0, assert_1.default)(!this.isEmpty());
        return new SuccessfulParse(toPos, this.makeParseTree(fromPos, text, children));
    }
    // requires !isEmpty()
    makeFailedParse(atPos, expectedText) {
        (0, assert_1.default)(!this.isEmpty());
        return new FailedParse(atPos, this.currentNonterminalName, expectedText);
    }
}
exports.ParserState = ParserState;

},{"./parsetree":13,"./types":14,"assert":1}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalParseTree = void 0;
const display_1 = require("./display");
class InternalParseTree {
    constructor(name, nonterminalName, start, text, allChildren, isSkipped) {
        this.name = name;
        this.nonterminalName = nonterminalName;
        this.start = start;
        this.text = text;
        this.allChildren = allChildren;
        this.isSkipped = isSkipped;
        this.checkRep();
        Object.freeze(this.allChildren);
        // can't freeze(this) because of beneficent mutation delayed computation-with-caching for children() and childrenByName()
    }
    checkRep() {
        // FIXME
    }
    get end() {
        return this.start + this.text.length;
    }
    childrenByName(name) {
        if (!this._childrenByName) {
            this._childrenByName = new Map();
            for (const child of this.allChildren) {
                if (!this._childrenByName.has(child.name)) {
                    this._childrenByName.set(child.name, []);
                }
                this._childrenByName.get(child.name).push(child);
            }
            for (const childList of this._childrenByName.values()) {
                Object.freeze(childList);
            }
        }
        this.checkRep();
        return this._childrenByName.get(name) || [];
    }
    get children() {
        if (!this._children) {
            this._children = this.allChildren.filter(child => !child.isSkipped);
            Object.freeze(this._children);
        }
        this.checkRep();
        return this._children;
    }
    concat(that) {
        return new InternalParseTree(this.name, this.nonterminalName, this.start, this.text + that.text, this.allChildren.concat(that.allChildren), this.isSkipped && that.isSkipped);
    }
    toString() {
        let s = (this.isSkipped ? "@skip " : "") + this.nonterminalName;
        if (this.children.length == 0) {
            s += ":" + (0, display_1.escapeForReading)(this.text, "\"");
        }
        else {
            let t = "";
            let offsetReachedSoFar = this.start;
            for (const pt of this.allChildren) {
                if (offsetReachedSoFar < pt.start) {
                    // previous child and current child have a gap between them that must have been matched as a terminal
                    // in the rule for this node.  Insert it as a quoted string.
                    const terminal = this.text.substring(offsetReachedSoFar - this.start, pt.start - this.start);
                    t += "\n" + (0, display_1.escapeForReading)(terminal, "\"");
                }
                t += "\n" + pt;
                offsetReachedSoFar = pt.end;
            }
            if (offsetReachedSoFar < this.end) {
                // final child and end of this node have a gap -- treat it the same as above.
                const terminal = this.text.substring(offsetReachedSoFar - this.start);
                t += "\n" + (0, display_1.escapeForReading)(terminal, "\"");
            }
            const smallEnoughForOneLine = 50;
            if (t.length <= smallEnoughForOneLine) {
                s += " { " + t.substring(1) // remove initial newline
                    .replace("\n", ", ")
                    + " }";
            }
            else {
                s += " {" + (0, display_1.indent)(t, "  ") + "\n}";
            }
        }
        return s;
    }
}
exports.InternalParseTree = InternalParseTree;

},{"./display":11}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrammarError = exports.InternalParseError = exports.ParseError = void 0;
const display_1 = require("./display");
/**
 * Exception thrown when a sequence of characters doesn't match a grammar
 */
class ParseError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.ParseError = ParseError;
class InternalParseError extends ParseError {
    constructor(message, nonterminalName, expectedText, textBeingParsed, pos) {
        super((0, display_1.makeErrorMessage)(message, nonterminalName, expectedText, textBeingParsed, pos, "string being parsed"));
        this.nonterminalName = nonterminalName;
        this.expectedText = expectedText;
        this.textBeingParsed = textBeingParsed;
        this.pos = pos;
    }
}
exports.InternalParseError = InternalParseError;
class GrammarError extends ParseError {
    constructor(message, e) {
        super(e ? (0, display_1.makeErrorMessage)(message, e.nonterminalName, e.expectedText, e.textBeingParsed, e.pos, "grammar")
            : message);
    }
}
exports.GrammarError = GrammarError;

},{"./display":11}],15:[function(require,module,exports){
(function (__dirname){(function (){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualizeAsHtml = exports.visualizeAsUrl = void 0;
const compiler_1 = require("./compiler");
const parserlib_1 = require("../parserlib");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function emptyIterator() {
    return {
        next() { return { done: true }; }
    };
}
function getIterator(list) {
    return list[Symbol.iterator]();
}
const MAX_URL_LENGTH_FOR_DESKTOP_BROWSE = 2020;
/**
 * Visualizes a parse tree using a URL that can be pasted into your web browser.
 * @param parseTree tree to visualize
 * @param <NT> the enumeration of symbols in the parse tree's grammar
 * @return url that shows a visualization of the parse tree
 */
function visualizeAsUrl(parseTree, nonterminals) {
    const base = "http://web.mit.edu/6.031/www/parserlib/" + parserlib_1.VERSION + "/visualizer.html";
    const code = expressionForDisplay(parseTree, nonterminals);
    const url = base + '?code=' + fixedEncodeURIComponent(code);
    if (url.length > MAX_URL_LENGTH_FOR_DESKTOP_BROWSE) {
        // display alternate instructions to the console
        console.error('Visualization URL is too long for web browser and/or web server.\n'
            + 'Instead, go to ' + base + '\n'
            + 'and copy and paste this code into the textbox:\n'
            + code);
    }
    return url;
}
exports.visualizeAsUrl = visualizeAsUrl;
const visualizerHtmlFile = path_1.default.resolve(__dirname, '../../src/visualizer.html');
/**
 * Visualizes a parse tree as a string of HTML that can be displayed in a web browser.
 * @param parseTree tree to visualize
 * @param <NT> the enumeration of symbols in the parse tree's grammar
 * @return string of HTML that shows a visualization of the parse tree
 */
function visualizeAsHtml(parseTree, nonterminals) {
    const html = fs_1.default.readFileSync(visualizerHtmlFile, 'utf8');
    const code = expressionForDisplay(parseTree, nonterminals);
    const result = html.replace(/\/\/CODEHERE/, "return '" + fixedEncodeURIComponent(code) + "';");
    return result;
}
exports.visualizeAsHtml = visualizeAsHtml;
function expressionForDisplay(parseTree, nonterminals) {
    const { nonterminalToString } = (0, compiler_1.makeNonterminalConverters)(nonterminals);
    return forDisplay(parseTree, [], parseTree);
    function forDisplay(node, siblings, parent) {
        const name = nonterminalToString(node.name).toLowerCase();
        let s = "nd(";
        if (node.children.length == 0) {
            s += "\"" + name + "\",nd(\"'" + cleanString(node.text) + "'\"),";
        }
        else {
            s += "\"" + name + "\",";
            const children = node.allChildren.slice(); // make a copy for shifting
            const firstChild = children.shift();
            let childrenExpression = forDisplay(firstChild, children, node);
            if (node.start < firstChild.start) {
                // node and its first child have a gap between them that must have been matched as a terminal
                // in the rule for node.  Insert it as a quoted string.
                childrenExpression = precedeByTerminal(node.text.substring(0, firstChild.start - node.start), childrenExpression);
            }
            s += childrenExpression + ",";
        }
        if (siblings.length > 0) {
            const sibling = siblings.shift();
            let siblingExpression = forDisplay(sibling, siblings, parent);
            if (node.end < sibling.start) {
                // node and its sibling have a gap between them that must have been matched as a terminal
                // in the rule for parent.  Insert it as a quoted string.
                siblingExpression = precedeByTerminal(parent.text.substring(node.end - parent.start, sibling.start - parent.start), siblingExpression);
            }
            s += siblingExpression;
        }
        else {
            let siblingExpression = "uu";
            if (node.end < parent.end) {
                // There's a gap between the end of node and the end of its parent, which must be a terminal matched by parent.
                // Insert it as a quoted string.
                siblingExpression = precedeByTerminal(parent.text.substring(node.end - parent.start), siblingExpression);
            }
            s += siblingExpression;
        }
        if (node.isSkipped) {
            s += ",true";
        }
        s += ")";
        return s;
    }
    function precedeByTerminal(terminal, expression) {
        return "nd(\"'" + cleanString(terminal) + "'\", uu, " + expression + ")";
    }
    function cleanString(s) {
        let rvalue = s.replace(/\\/g, "\\\\");
        rvalue = rvalue.replace(/"/g, "\\\"");
        rvalue = rvalue.replace(/\n/g, "\\n");
        rvalue = rvalue.replace(/\r/g, "\\r");
        return rvalue;
    }
}
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function fixedEncodeURIComponent(s) {
    return encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16));
}

}).call(this)}).call(this,"/node_modules/parserlib/internal")

},{"../parserlib":16,"./compiler":10,"fs":5,"path":17}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualizeAsHtml = exports.visualizeAsUrl = exports.compile = exports.ParseError = exports.VERSION = void 0;
exports.VERSION = "3.2.3";
var types_1 = require("./internal/types");
Object.defineProperty(exports, "ParseError", { enumerable: true, get: function () { return types_1.ParseError; } });
;
var compiler_1 = require("./internal/compiler");
Object.defineProperty(exports, "compile", { enumerable: true, get: function () { return compiler_1.compile; } });
var visualizer_1 = require("./internal/visualizer");
Object.defineProperty(exports, "visualizeAsUrl", { enumerable: true, get: function () { return visualizer_1.visualizeAsUrl; } });
Object.defineProperty(exports, "visualizeAsHtml", { enumerable: true, get: function () { return visualizer_1.visualizeAsHtml; } });

},{"./internal/compiler":10,"./internal/types":14,"./internal/visualizer":15}],17:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))

},{"_process":18}],18:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],19:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawBlock = exports.removeStar = exports.drawStar = exports.drawPuzzle = exports.drawGrid = exports.drawBox = void 0;
const assert_1 = __importDefault(require("assert"));
const Puzzle_1 = require("./Puzzle");
const canvas_1 = require("canvas");
const BOX_SIZE = 16;
// categorical colors from
// https://github.com/d3/d3-scale-chromatic/tree/v2.0.0#schemeCategory10
const COLORS = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
];
// semitransparent versions of those colors
const BACKGROUNDS = COLORS.map((color) => color + '60');
/**
 * Draw a black square filled with a random color.
 *
 * @param canvas canvas to draw on
 * @param x x position of center of box
 * @param y y position of center of box
 */
function drawBox(canvas, x, y) {
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context !== null, 'unable to get canvas drawing context');
    // save original context settings before we translate and change colors
    context.save();
    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    context.translate(x, y);
    // draw the outer outline box centered on the origin (which is now (x,y))
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.strokeRect(-BOX_SIZE / 2, -BOX_SIZE / 2, BOX_SIZE, BOX_SIZE);
    // fill with a random semitransparent color
    context.fillStyle = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)] ?? assert_1.default.fail();
    context.fillRect(-BOX_SIZE / 2, -BOX_SIZE / 2, BOX_SIZE, BOX_SIZE);
    // reset the origin and styles back to defaults
    context.restore();
}
exports.drawBox = drawBox;
/**
 * Draw a 10x10 grid on the canvas.
 *
 * @param canvas canvas to draw on
 */
function drawGrid(canvas, puzzle) {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    context.save();
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    context.strokeStyle = 'black';
    // draw box outline
    context.lineWidth = 3;
    for (const dest of [{ x: 0, y: height }, { x: width, y: 0 }]) {
        for (const start of [{ x: 0, y: 0 }, { x: width, y: height }]) {
            context.beginPath();
            context.moveTo(start.x, start.y);
            context.lineTo(dest.x, dest.y);
            context.stroke();
        }
    }
    // draw grid lines
    context.lineWidth = 0.5;
    for (let i = 1; i < numCols; i++) {
        context.beginPath();
        context.moveTo(xIncrement * i, 0);
        context.lineTo(xIncrement * i, height);
        context.stroke();
    }
    for (let i = 1; i < numRows; i++) {
        context.beginPath();
        context.moveTo(0, yIncrement * i);
        context.lineTo(width, yIncrement * i);
        context.stroke();
    }
    // reset the origin and styles back to defaults
    context.restore();
}
exports.drawGrid = drawGrid;
/**
 * Draw the puzzle lines.
 *
 * @param canvas canvas to draw on
 * @param lines an array of start and end points of lines
 */
function drawPuzzle(canvas, puzzle) {
    const blockLines = new Array();
    const regions = puzzle.getRegions();
    const coordColors = new Map();
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    context.save();
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        (0, assert_1.default)(region);
        const rowStarts = new Map();
        const rowEnds = new Map();
        const colStarts = new Map();
        const colEnds = new Map();
        for (const coord of region) {
            const col = coord.row - 1;
            const row = coord.column - 1;
            context.translate(xIncrement * (row), yIncrement * (col));
            context.fillStyle = BACKGROUNDS[i] ?? assert_1.default.fail("couldn't get background color");
            context.fillRect(0, 0, xIncrement, yIncrement);
            context.translate(-xIncrement * (row), -yIncrement * (col));
            coordColors.set(row * numRows + col, BACKGROUNDS[i] ?? assert_1.default.fail("couldn't get background color"));
            if (colStarts.has(row)) {
                colStarts.set(row, Math.min(colStarts.get(row), col));
            }
            else {
                colStarts.set(row, col);
            }
            if (colEnds.has(row)) {
                colEnds.set(row, Math.max(colEnds.get(row), col + 1));
            }
            else {
                colEnds.set(row, col + 1);
            }
            if (rowStarts.has(col)) {
                rowStarts.set(col, Math.min(rowStarts.get(col), row));
            }
            else {
                rowStarts.set(col, row);
            }
            if (rowEnds.has(col)) {
                rowEnds.set(col, Math.max(rowEnds.get(col), row + 1));
            }
            else {
                rowEnds.set(col, row + 1);
            }
        }
        context.strokeStyle = 'black';
        context.lineWidth = 3;
        // draw blocklines 
        for (const [row, rowStart] of rowStarts) {
            context.beginPath();
            context.moveTo(rowStart * xIncrement, row * yIncrement);
            context.lineTo(rowStart * xIncrement, (row + 1) * yIncrement);
            context.stroke();
        }
        for (const [col, colStart] of colStarts) {
            context.beginPath();
            context.moveTo(col * xIncrement, colStart * yIncrement);
            context.lineTo((col + 1) * xIncrement, colStart * yIncrement);
            context.stroke();
        }
        for (const [row, rowEnd] of rowEnds) {
            context.beginPath();
            context.moveTo(rowEnd * xIncrement, row * yIncrement);
            context.lineTo(rowEnd * xIncrement, (row + 1) * yIncrement);
            context.stroke();
        }
        for (const [col, colEnd] of colEnds) {
            context.beginPath();
            context.moveTo(col * xIncrement, colEnd * yIncrement);
            context.lineTo((col + 1) * xIncrement, colEnd * yIncrement);
            context.stroke();
        }
    }
    return coordColors;
}
exports.drawPuzzle = drawPuzzle;
/**
 * Draw stars.
 *
 * @param canvas canvas to draw on
 * @param star (row, column) of stars
 */
function drawStar(canvas, puzzle, starCoord) {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    const font = '30pt bold';
    // make a tiny 1x1 image at first so that we can get a Graphics object, 
    // which we need to compute the width and height of the text
    const measuringContext = (0, canvas_1.createCanvas)(1, 1).getContext('2d');
    measuringContext.font = font;
    const fontMetrics = measuringContext.measureText('⭐️');
    // now make a canvas sized to fit the text
    // save original context settings before we translate and change colors
    context.save();
    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    const starWidth = fontMetrics.width;
    const starHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent;
    const row = starCoord.column - 1;
    const col = starCoord.row - 1;
    const xOffset = (xIncrement - starWidth) / 2;
    const yOffset = (yIncrement - starHeight) / 2;
    context.translate(row * xIncrement + xOffset, col * yIncrement + yOffset);
    context.font = font;
    context.fillStyle = 'white';
    context.fillText('⭐️', 0, fontMetrics.actualBoundingBoxAscent);
    context.strokeStyle = 'black';
    context.strokeText('⭐️', 0, fontMetrics.actualBoundingBoxAscent);
    context.translate(-(row * xIncrement + xOffset), -(col * yIncrement + yOffset));
}
exports.drawStar = drawStar;
function removeStar(canvas, puzzle, starCoord, coordColors) {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    context.strokeStyle = 'black';
    context.lineWidth = 3;
    const blockOffset = 1.0;
    const row = starCoord.row - 1;
    const col = starCoord.column - 1;
    context.translate(yIncrement * (col), xIncrement * (row));
    context.fillStyle = 'white';
    context.fillRect(blockOffset, blockOffset, xIncrement - 2 * blockOffset, yIncrement - 2 * blockOffset);
    context.translate(-yIncrement * (col), -xIncrement * (row));
    context.translate(yIncrement * (col), xIncrement * (row));
    context.fillStyle = coordColors.get(col * numRows + row) ?? assert_1.default.fail('all blocks must be assigned color');
    context.fillRect(blockOffset, blockOffset, xIncrement - 2 * blockOffset, yIncrement - 2 * blockOffset);
    context.translate(-yIncrement * (col), -xIncrement * (row));
}
exports.removeStar = removeStar;
function drawBlock(canvas, puzzle, blockCoord) {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    const blockOffset = 0.1;
    const font = '30pt bold';
    // make a tiny 1x1 image at first so that we can get a Graphics object, 
    // which we need to compute the width and height of the text
    const measuringContext = (0, canvas_1.createCanvas)(1, 1).getContext('2d');
    measuringContext.font = font;
    const fontMetrics = measuringContext.measureText('🚫');
    // now make a canvas sized to fit the text
    // save original context settings before we translate and change colors
    context.save();
    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    const blockWidth = fontMetrics.width;
    const blockHeight = fontMetrics.actualBoundingBoxAscent + fontMetrics.actualBoundingBoxDescent;
    const row = blockCoord.column - 1;
    const col = blockCoord.row - 1;
    const xOffset = (xIncrement - blockWidth) / 2;
    const yOffset = (yIncrement - blockHeight) / 2;
    context.translate(row * xIncrement + xOffset, col * yIncrement + yOffset);
    context.font = font;
    context.fillStyle = 'white';
    context.fillText('🚫', 0, fontMetrics.actualBoundingBoxAscent);
    context.strokeStyle = 'black';
    context.strokeText('🚫', 0, fontMetrics.actualBoundingBoxAscent);
    context.translate(-(row * xIncrement + xOffset), -(col * yIncrement + yOffset));
}
exports.drawBlock = drawBlock;
/**
 * Set up the main page.
 */
async function main() {
    const canvas = document.getElementById('canvas') ?? assert_1.default.fail('missing drawing canvas');
    const puzzle = await (0, Puzzle_1.parseFile)('../puzzles/kd-1-1-1.starb');
    drawGrid(canvas, puzzle);
    drawPuzzle(canvas, puzzle);
}
main();

},{"./Puzzle":20,"assert":1,"canvas":6}],20:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = exports.parseString = exports.Puzzle = exports.CellStates = void 0;
const assert_1 = __importDefault(require("assert"));
const PuzzleParser_1 = require("./PuzzleParser");
const fs_1 = __importDefault(require("fs"));
var CellStates;
(function (CellStates) {
    CellStates[CellStates["Empty"] = 0] = "Empty";
    CellStates[CellStates["Star"] = 1] = "Star";
    CellStates[CellStates["Blocked"] = 2] = "Blocked";
})(CellStates = exports.CellStates || (exports.CellStates = {}));
/**
 * ADT for a Star Battle puzzle board
 */
class Puzzle {
    /**
     * @param regions the map containing the coordinates of all the cells in the 10 regions of the puzzle
     * @throws error if any of the rep invariants are violated
     */
    constructor(regions) {
        this.rows = 10;
        this.columns = 10;
        this.squares = new Array(this.rows * this.columns);
        this.regions = new Map();
        for (let i = 0; i < this.rows * this.columns; ++i) {
            this.squares[i] = CellStates.Empty;
        }
        for (const key of regions.keys()) {
            this.regions.set(key, (regions.get(key) ?? assert_1.default.fail()).map(list => [list[0], list[1]]));
        }
        this.checkRep();
    }
    // Asserts the rep invariant
    checkRep() {
        const dimension = 10;
        (0, assert_1.default)(this.rows === dimension, "number of rows must be 10");
        (0, assert_1.default)(this.columns === dimension, "number of columns must be 10");
        (0, assert_1.default)(this.regions.size === dimension, "number of regions must be 10");
        let totalCells = 0;
        for (const region of this.regions.values()) {
            for (const cell of region) {
                totalCells += 1;
                const row = cell[0] ?? assert_1.default.fail("cell is missing row value");
                const column = cell[1] ?? assert_1.default.fail("cell is missing row value");
                (0, assert_1.default)(row >= 1 && row <= dimension, "coordinates must be 1-indexed and be between 1 and 10");
                (0, assert_1.default)(column >= 1 && row <= dimension, "coordinates must be 1-indexed and be between 1 and 10");
            }
        }
        (0, assert_1.default)(totalCells === dimension * dimension, "must have total of 100 cells over all regions");
    }
    /**
     * Getter function for this.regions
     *
     * @returns Array<Array<{row: number, column: number}>> array of all the regions
     */
    getRegions() {
        const regions = [];
        for (const [key, region] of this.regions) {
            const regionCoords = [];
            for (const coord of region) {
                regionCoords.push({ row: coord[0], column: coord[1] });
            }
            regions.push(regionCoords);
        }
        return regions;
    }
    /**
     * Mutates puzzle by removing all stars
     *
     */
    emptyPuzzle() {
        for (let i = 0; i < this.rows * this.columns; ++i) {
            this.squares[i] = CellStates.Empty;
        }
    }
    /**
     * Checks if each region of the puzzle has exactly the needed number of stars, and no stars are
     * vertically, horizontally, or diagonally adjacent.
     *
     * @returns true if the puzzle is solved; false otherwise
     */
    isSolved() {
        // Check that each row has the number of stars needed
        for (let i = 0; i < this.rows; ++i) {
            let totalStars = 0;
            for (let j = 0; j < this.columns; ++j) {
                totalStars += this.squares[this.columns * i + j] === CellStates.Star ? 1 : 0;
            }
            if (totalStars !== 2)
                return false;
        }
        // Check that each column has the number of stars needed
        for (let j = 0; j < this.columns; ++j) {
            let totalStars = 0;
            for (let i = 0; i < this.rows; ++i) {
                totalStars += this.squares[this.columns * i + j] === CellStates.Star ? 1 : 0;
            }
            if (totalStars !== 2)
                return false;
        }
        // Check that each region has the number of stars needed
        for (const region of this.regions.values()) {
            let totalStars = 0;
            for (const [row, column] of region) {
                totalStars += this.squares[this.columns * (row - 1) + (column - 1)] === CellStates.Star ? 1 : 0;
            }
            if (totalStars !== 2)
                return false;
        }
        // Check that no two stars are adjacent
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.columns; ++j) {
                if (this.squares[this.columns * i + j] === CellStates.Star && this.starAdjacent([i + 1, j + 1]))
                    return false;
            }
        }
        return true;
    }
    /**
     * Checks if any of the adjacent grid squares contains a star
     *
     * @param position the position of the cell of which you want to check adjacent
     * @returns true if there is an adjacent star; false otherwise
     */
    starAdjacent(position) {
        const [row, column] = position;
        const deltas = [-1, 0, 1];
        for (const deltaRow of deltas) {
            for (const deltaColumn of deltas) {
                const cellRow = row + deltaRow;
                const cellColumn = column + deltaColumn;
                if ((deltaRow === 0 && deltaColumn === 0) ||
                    (cellRow < 1 || cellRow > this.rows) ||
                    (cellColumn < 1 || cellColumn > this.columns))
                    continue;
                else {
                    if (this.squares[this.columns * (cellRow - 1) + (cellColumn - 1)] === CellStates.Star) {
                        console.log(cellRow, cellColumn);
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
     * Cycle a grid square between empty, starred, and blocked, in that order.
     *
     * @param position the position on the grid to be cycle
     * @returns the updated state of the grid square
     * @throws Error if x and y are not valid coordinates of the puzzle board.
     */
    cycleSquare(position) {
        const [row, column] = position;
        if (row < 1 || row > this.rows || column < 1 || column > this.columns)
            throw new Error("Cannot place a star at an invalid grid position");
        const status = this.squares[this.columns * (row - 1) + (column - 1)];
        switch (status) {
            case CellStates.Empty:
                this.squares[this.columns * (row - 1) + (column - 1)] = CellStates.Blocked;
                break;
            case CellStates.Star:
                this.squares[this.columns * (row - 1) + (column - 1)] = CellStates.Empty;
                break;
            case CellStates.Blocked:
                this.squares[this.columns * (row - 1) + (column - 1)] = CellStates.Star;
                break;
            default:
                assert_1.default.fail();
        }
        this.checkRep();
        return this.squares[this.columns * (row - 1) + (column - 1)] ?? assert_1.default.fail("Grid square not found");
    }
    /**
     * Get coordinates of all stars on puzzle
     *
     * @returns Array<{row: number, column: number}> array of the coordinates of all the stars
     */
    getStars() {
        const stars = [];
        for (let i = 0; i < this.rows * this.columns; ++i) {
            if (this.squares[i] === CellStates.Star) {
                const col = i % this.columns;
                const row = Math.floor(i / this.rows);
                stars.push({ row: row, column: col });
            }
        }
        return stars;
    }
    /**
     * @inheritdoc
     */
    toString() {
        let stringRep = "";
        stringRep += `${this.rows}x${this.columns}\n`;
        for (const region of this.regions.values()) {
            const stars = new Array;
            const nonStars = new Array;
            for (const cell of region) {
                const row = cell[0] ?? assert_1.default.fail("cell is missing x value");
                const column = cell[1] ?? assert_1.default.fail("cell is missing y value");
                const cellState = this.squares[this.columns * (row - 1) + (column - 1)];
                if (cellState === CellStates.Star) {
                    stars.push([row, column]);
                }
                else {
                    nonStars.push([row, column]);
                }
            }
            let line = "";
            for (const star of stars) {
                const row = star[0] ?? assert_1.default.fail("cell is missing x value");
                const column = star[1] ?? assert_1.default.fail("cell is missing y value");
                line += `${row},${column} `;
            }
            line += '| ';
            for (const nonStar of nonStars) {
                const row = nonStar[0] ?? assert_1.default.fail("cell is missing x value");
                const column = nonStar[1] ?? assert_1.default.fail("cell is missing y value");
                line += `${row},${column} `;
            }
            line += '\n';
            stringRep += line;
        }
        return stringRep;
    }
}
exports.Puzzle = Puzzle;
/**
 * Parse a puzzle.
 *
 * @param input string representation of a puzzle to parse.
 * @returns puzzle ADT for the input
 * @throws Error if the string representation is invalid
 */
function parseString(input) {
    return (0, PuzzleParser_1.parsePuzzle)(input);
}
exports.parseString = parseString;
/**
 * Parse a puzzle.
 *
 * @param filename path to the file containing the string representation of a puzzle to parse, excluding comments
 * @returns puzzle ADT for the input
 * @throws Error if the filename or string representation is invalid
 */
async function parseFile(filename) {
    const fileContents = (await fs_1.default.promises.readFile(filename)).toString();
    let stringRep = "";
    const lines = fileContents.split('\n');
    for (const line of lines) {
        if (!line.startsWith("#") && line.length > 0) {
            stringRep += line + '\n';
        }
    }
    return (0, PuzzleParser_1.parsePuzzle)(stringRep);
}
exports.parseFile = parseFile;

},{"./PuzzleParser":21,"assert":1,"fs":5}],21:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePuzzle = void 0;
const assert_1 = __importDefault(require("assert"));
const Puzzle_1 = require("./Puzzle");
const parserlib_1 = require("parserlib");
/**
 * Parser for puzzles.
 *
 */
const grammar = `
@skip whitespace {
    puzzle ::= dimensions [\\n] region*;
    dimensions ::= number 'x' number+;
    region ::= star* '|' coord+ [\\n];
}
star ::= number ',' number;
coord ::= number ',' number;
number ::= [0-9]+;
whitespace ::= [ \\t\\r]+;
`;
// the nonterminals of the grammar
var PuzzleGrammar;
(function (PuzzleGrammar) {
    PuzzleGrammar[PuzzleGrammar["Puzzle"] = 0] = "Puzzle";
    PuzzleGrammar[PuzzleGrammar["Dimensions"] = 1] = "Dimensions";
    PuzzleGrammar[PuzzleGrammar["Region"] = 2] = "Region";
    PuzzleGrammar[PuzzleGrammar["Star"] = 3] = "Star";
    PuzzleGrammar[PuzzleGrammar["Coord"] = 4] = "Coord";
    PuzzleGrammar[PuzzleGrammar["Number"] = 5] = "Number";
    PuzzleGrammar[PuzzleGrammar["Whitespace"] = 6] = "Whitespace";
})(PuzzleGrammar || (PuzzleGrammar = {}));
// compile the grammar into a parser
const parser = (0, parserlib_1.compile)(grammar, PuzzleGrammar, PuzzleGrammar.Puzzle);
/**
 * Parse a string into a puzzle.
 *
 * @param input string to parse
 * @returns Puzzle parsed from the string
 * @throws ParseError if the string doesn't match the Puzzle grammar
 */
function parsePuzzle(input) {
    // parse the example into a parse tree
    const parseTree = parser.parse(input);
    // make a puzzle from the parse tree
    const puzzle = getPuzzle(parseTree);
    return puzzle;
}
exports.parsePuzzle = parsePuzzle;
/**
 * Convert a parse tree into a record containing puzzle dimensions.
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns a record containing puzzle dimensions
 */
function getDimensions(parseTree) {
    // dimensions ::= [0-9]+ 'x' [0-9]+;
    const dimensions = parseTree.childrenByName(PuzzleGrammar.Number);
    const numRows = getNumber(dimensions[0] ?? assert_1.default.fail("missing number of rows"));
    const numCols = getNumber(dimensions[1] ?? assert_1.default.fail("missing number of columns"));
    return { numRows: numRows, numCols: numCols };
}
/**
 * Convert a parse tree into a number.
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns the number represented by the parseTree
 */
function getNumber(parseTree) {
    // number ::= [0-9]+;
    return parseInt(parseTree.text) ?? assert_1.default.fail("invalid dimensions");
}
/**
 * Convert a parse tree into a record containing coordinates and stars of the given region.
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns a record containing coordinates and stars of the given region
 */
function getRegion(parseTree) {
    // region ::= star* '|' coord+ '\n';
    const stars = parseTree.childrenByName(PuzzleGrammar.Star).map(star => getCoordinate(star));
    const coords = parseTree.childrenByName(PuzzleGrammar.Coord).map(coord => getCoordinate(coord)).concat([...stars]);
    return { coords: coords, stars: stars };
}
/**
 * Convert a parse tree into a coordinate
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns an array containing coordinate numbers
 */
function getCoordinate(parseTree) {
    // coord ::= number ',' number;
    const coords = parseTree.childrenByName(PuzzleGrammar.Number);
    const x = getNumber(coords[0] ?? assert_1.default.fail("missing coordinate"));
    const y = getNumber(coords[1] ?? assert_1.default.fail("missing coordinate"));
    return [x, y];
}
/**
 * Convert a parse tree into a puzzle.
 *
 * @param parseTree constructed according to the grammar for puzzles
 * @returns new puzzle corresponding to the parseTree
 */
function getPuzzle(parseTree) {
    // puzzle ::= dimensions '\n' region*;
    const dimension = 10;
    const dimensions = getDimensions(parseTree.children[0] ?? assert_1.default.fail('missing child'));
    (0, assert_1.default)(dimensions.numRows === dimension, "our ADT can only handle 10x10 puzzles");
    (0, assert_1.default)(dimensions.numCols === dimension, "our ADT can only handle 10x10 puzzles");
    const regions = parseTree.childrenByName(PuzzleGrammar.Region).map(region => getRegion(region));
    const map = new Map();
    const allStars = new Array;
    for (const [regionID, region] of regions.entries()) {
        map.set(regionID, region.coords);
        allStars.push(...region.stars);
    }
    const puzzle = new Puzzle_1.Puzzle(map);
    for (const star of allStars) {
        puzzle.cycleSquare(star);
    }
    return puzzle;
}

},{"./Puzzle":20,"assert":1,"parserlib":16}],22:[function(require,module,exports){
"use strict";
/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
// This code is loaded into starb-client.html, see the `npm compile` and
//   `npm watchify-client` scripts.
// Remember that you will *not* be able to use Node APIs like `fs` in the web browser.
const assert_1 = __importDefault(require("assert"));
const Puzzle_1 = require("./Puzzle");
const Drawing_1 = require("./Drawing");
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Puzzle to request and play.
 * Project instructions: this constant is a [for now] requirement in the project spec.
 */
const PUZZLE = "kd-1-1-1";
// see ExamplePage.ts for an example of an interactive web page
/**
 * ADT representing the client state
 */
class Client {
    /**
     * @param canvas the canvas to draw the puzzle on
     * @param puzzleString the string representation of the blank puzzle
     */
    constructor(canvas, puzzleString) {
        this.canvas = canvas;
        this.coordColors = new Map();
        this.puzzle = (0, Puzzle_1.parseString)(puzzleString);
    }
    // Asserts the rep invariant
    checkRep() {
        return;
    }
    /***
     * Set the board display to a blank puzzle.
     */
    displayBlankPuzzle() {
        (0, Drawing_1.drawGrid)(this.canvas, this.puzzle);
        this.coordColors = (0, Drawing_1.drawPuzzle)(this.canvas, this.puzzle);
    }
    /**
     * Clicks a cell on the board and updates the state of the board.
     *
     * @param cell the coordinate of the star to be placed on the board
     * @param cell.row the row of the coordinate (must be between 1 to 10 inclusive)
     * @param cell.column the column of the coordinate (must be between 1 to 10 inclusive)
     */
    click(cell) {
        const updatedCellState = this.puzzle.cycleSquare([cell.row, cell.column]);
        switch (updatedCellState) {
            case Puzzle_1.CellStates.Empty:
                (0, Drawing_1.removeStar)(this.canvas, this.puzzle, cell, this.coordColors);
                break;
            case Puzzle_1.CellStates.Star:
                (0, Drawing_1.removeStar)(this.canvas, this.puzzle, cell, this.coordColors);
                (0, Drawing_1.drawStar)(this.canvas, this.puzzle, cell);
                break;
            case Puzzle_1.CellStates.Blocked:
                (0, Drawing_1.drawBlock)(this.canvas, this.puzzle, cell);
                break;
            default:
                assert_1.default.fail();
        }
    }
    /**
     * Computes the cell's row and column corresponding to the position of a user's mouse click.
     *
     * @param x the x value of the position of the click
     * @param y the y value of the position of the click
     * @returns an object containing the row and column on the board corresponding to the click (between 1 and 10 inclusive)
     * @throws error if x or y values are out of the range of the board
     */
    getCell(x, y) {
        return { row: this.getRow(y), column: this.getColumn(x) };
    }
    /**
     * computes the cell's row corresponding to the y-value of the user's mouse click
     *
     * @param y the y-value of the user's mouse click
     * @returns the corresponding cell's row number (between 1 to 10 inclusive)
     * @throws error if the y value is outside of the range of the board
     */
    getRow(y) {
        const dimension = 10;
        const box = this.canvas.getBoundingClientRect();
        const top = box.top;
        const bottom = box.bottom;
        const yIncrement = (bottom - top) / dimension;
        for (let row = 0; row < dimension; row++) {
            if (this.inRange(y, top + row * yIncrement, top + (row + 1) * yIncrement)) {
                return row + 1;
            }
        }
        throw Error("y value is not in valid range of the board");
    }
    /**
     * computes the cell's column corresponding to the x-value of the user's mouse click
     *
     * @param x the x-value of the user's mouse click
     * @returns the corresponding cell's column number (between 1 to 10 inclusive)
     * @throws error if the x value is outside of the range of the board
     */
    getColumn(x) {
        const dimension = 10;
        const box = this.canvas.getBoundingClientRect();
        const left = box.left;
        const right = box.right;
        const xIncrement = (right - left) / dimension;
        for (let column = 0; column < dimension; column++) {
            if (this.inRange(x, left + column * xIncrement, left + (column + 1) * xIncrement)) {
                return column + 1;
            }
        }
        throw Error("x value is not in valid range of the board");
    }
    /**
     * Checks if the target value is in the range
     *
     * @param target the target value to check
     * @param start the starting value of the range inclusive
     * @param end the ending value of the range exclusive
     * @returns true if the target value is in the range, false otherwise
     */
    inRange(target, start, end) {
        return target >= start && target < end;
    }
    /**
     * Checks if the puzzle has been solved.
     *
     * @returns true if the puzzle has been solved, false otherwise
     */
    checkSolved() {
        return this.puzzle.isSolved();
    }
}
exports.Client = Client;
/**
 * Set up the website page.
 */
async function main() {
    // get the elements of the webpage
    const button = document.getElementById('button') ?? assert_1.default.fail('missing button');
    const canvas = document.getElementById('canvas') ?? assert_1.default.fail('missing drawing canvas');
    // connect to server to retrieve the puzzle's string representation
    const promise = (0, node_fetch_1.default)(`http://localhost:8789/getPuzzle/kd-1-1-1`);
    const response = await promise;
    const puzzleString = await response.text();
    // create a new client ADT instance and display the blank puzzle
    const client = new Client(canvas, puzzleString);
    client.displayBlankPuzzle();
    // add button functionality to check if solved
    button.addEventListener('click', (event) => {
        if (client.checkSolved()) {
            window.alert("YAY! You've solved the puzzle :3");
        }
        else {
            window.alert("You have not solved the puzzle yet :(");
        }
    });
    // add clicking functionality to draw stars, remove stars, and add blocks
    canvas.addEventListener('click', (event) => {
        client.click(client.getCell(event.x, event.y));
    });
}
main();

},{"./Drawing":19,"./Puzzle":20,"assert":1,"node-fetch":8}]},{},[22])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L2Fzc2VydC5qcyIsIm5vZGVfbW9kdWxlcy9hc3NlcnQvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbGliL19lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMvbGliL3BhcnNlLWZvbnQuanMiLCJub2RlX21vZHVsZXMvbm9kZS1mZXRjaC9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGFyc2VybGliL2ludGVybmFsL2NvbXBpbGVyLmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlcmxpYi9pbnRlcm5hbC9kaXNwbGF5LmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlcmxpYi9pbnRlcm5hbC9wYXJzZXIuanMiLCJub2RlX21vZHVsZXMvcGFyc2VybGliL2ludGVybmFsL3BhcnNldHJlZS5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZXJsaWIvaW50ZXJuYWwvdHlwZXMuanMiLCJub2RlX21vZHVsZXMvcGFyc2VybGliL2ludGVybmFsL3Zpc3VhbGl6ZXIuanMiLCJub2RlX21vZHVsZXMvcGFyc2VybGliL3BhcnNlcmxpYi5qcyIsIm5vZGVfbW9kdWxlcy9wYXRoLWJyb3dzZXJpZnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL0RyYXdpbmcudHMiLCJzcmMvUHV6emxlLnRzIiwic3JjL1B1enpsZVBhcnNlci50cyIsInNyYy9TdGFyYkNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxa0JBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDamhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3hMQSxvREFBNEI7QUFDNUIscUNBQTZDO0FBQzdDLG1DQUF3RDtBQUV4RCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFFcEIsMEJBQTBC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TyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNwQjtRQUNELEtBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxTQUFTLEVBQUU7WUFDcEMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFDLFVBQVUsRUFBRSxRQUFRLEdBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FBQyxVQUFVLEVBQUUsUUFBUSxHQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hELE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNwQjtRQUNELEtBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUU7WUFDaEMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLFVBQVUsRUFBRSxHQUFHLEdBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNwQjtRQUNELEtBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUU7WUFDaEMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFDLFVBQVUsRUFBRSxNQUFNLEdBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsR0FB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QztJQUNuRCxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcblxudmFyIG9iamVjdEFzc2lnbiA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKTtcblxuLy8gY29tcGFyZSBhbmQgaXNCdWZmZXIgdGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9ibG9iLzY4MGU5ZTVlNDg4ZjIyYWFjMjc1OTlhNTdkYzg0NGE2MzE1OTI4ZGQvaW5kZXguanNcbi8vIG9yaWdpbmFsIG5vdGljZTpcblxuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuZnVuY3Rpb24gY29tcGFyZShhLCBiKSB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICB2YXIgeCA9IGEubGVuZ3RoO1xuICB2YXIgeSA9IGIubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldO1xuICAgICAgeSA9IGJbaV07XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgaWYgKHkgPCB4KSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cbiAgcmV0dXJuIDA7XG59XG5mdW5jdGlvbiBpc0J1ZmZlcihiKSB7XG4gIGlmIChnbG9iYWwuQnVmZmVyICYmIHR5cGVvZiBnbG9iYWwuQnVmZmVyLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGdsb2JhbC5CdWZmZXIuaXNCdWZmZXIoYik7XG4gIH1cbiAgcmV0dXJuICEhKGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlcik7XG59XG5cbi8vIGJhc2VkIG9uIG5vZGUgYXNzZXJ0LCBvcmlnaW5hbCBub3RpY2U6XG4vLyBOQjogVGhlIFVSTCB0byB0aGUgQ29tbW9uSlMgc3BlYyBpcyBrZXB0IGp1c3QgZm9yIHRyYWRpdGlvbi5cbi8vICAgICBub2RlLWFzc2VydCBoYXMgZXZvbHZlZCBhIGxvdCBzaW5jZSB0aGVuLCBib3RoIGluIEFQSSBhbmQgYmVoYXZpb3IuXG5cbi8vIGh0dHA6Ly93aWtpLmNvbW1vbmpzLm9yZy93aWtpL1VuaXRfVGVzdGluZy8xLjBcbi8vXG4vLyBUSElTIElTIE5PVCBURVNURUQgTk9SIExJS0VMWSBUTyBXT1JLIE9VVFNJREUgVjghXG4vL1xuLy8gT3JpZ2luYWxseSBmcm9tIG5hcndoYWwuanMgKGh0dHA6Ly9uYXJ3aGFsanMub3JnKVxuLy8gQ29weXJpZ2h0IChjKSAyMDA5IFRob21hcyBSb2JpbnNvbiA8Mjgwbm9ydGguY29tPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICdTb2Z0d2FyZScpLCB0b1xuLy8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGVcbi8vIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vclxuLy8gc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU5cbi8vIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbi8vIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwvJyk7XG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgZnVuY3Rpb25zSGF2ZU5hbWVzID0gKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZvbygpIHt9Lm5hbWUgPT09ICdmb28nO1xufSgpKTtcbmZ1bmN0aW9uIHBUb1N0cmluZyAob2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKTtcbn1cbmZ1bmN0aW9uIGlzVmlldyhhcnJidWYpIHtcbiAgaWYgKGlzQnVmZmVyKGFycmJ1ZikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHR5cGVvZiBnbG9iYWwuQXJyYXlCdWZmZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlci5pc1ZpZXcgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQXJyYXlCdWZmZXIuaXNWaWV3KGFycmJ1Zik7XG4gIH1cbiAgaWYgKCFhcnJidWYpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGFycmJ1ZiBpbnN0YW5jZW9mIERhdGFWaWV3KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGFycmJ1Zi5idWZmZXIgJiYgYXJyYnVmLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuLy8gMS4gVGhlIGFzc2VydCBtb2R1bGUgcHJvdmlkZXMgZnVuY3Rpb25zIHRoYXQgdGhyb3dcbi8vIEFzc2VydGlvbkVycm9yJ3Mgd2hlbiBwYXJ0aWN1bGFyIGNvbmRpdGlvbnMgYXJlIG5vdCBtZXQuIFRoZVxuLy8gYXNzZXJ0IG1vZHVsZSBtdXN0IGNvbmZvcm0gdG8gdGhlIGZvbGxvd2luZyBpbnRlcmZhY2UuXG5cbnZhciBhc3NlcnQgPSBtb2R1bGUuZXhwb3J0cyA9IG9rO1xuXG4vLyAyLiBUaGUgQXNzZXJ0aW9uRXJyb3IgaXMgZGVmaW5lZCBpbiBhc3NlcnQuXG4vLyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHsgbWVzc2FnZTogbWVzc2FnZSxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWw6IGFjdHVhbCxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBlY3RlZDogZXhwZWN0ZWQgfSlcblxudmFyIHJlZ2V4ID0gL1xccypmdW5jdGlvblxccysoW15cXChcXHNdKilcXHMqLztcbi8vIGJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9samhhcmIvZnVuY3Rpb24ucHJvdG90eXBlLm5hbWUvYmxvYi9hZGVlZWVjOGJmY2M2MDY4YjE4N2Q3ZDlmYjNkNWJiMWQzYTMwODk5L2ltcGxlbWVudGF0aW9uLmpzXG5mdW5jdGlvbiBnZXROYW1lKGZ1bmMpIHtcbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGZ1bmN0aW9uc0hhdmVOYW1lcykge1xuICAgIHJldHVybiBmdW5jLm5hbWU7XG4gIH1cbiAgdmFyIHN0ciA9IGZ1bmMudG9TdHJpbmcoKTtcbiAgdmFyIG1hdGNoID0gc3RyLm1hdGNoKHJlZ2V4KTtcbiAgcmV0dXJuIG1hdGNoICYmIG1hdGNoWzFdO1xufVxuYXNzZXJ0LkFzc2VydGlvbkVycm9yID0gZnVuY3Rpb24gQXNzZXJ0aW9uRXJyb3Iob3B0aW9ucykge1xuICB0aGlzLm5hbWUgPSAnQXNzZXJ0aW9uRXJyb3InO1xuICB0aGlzLmFjdHVhbCA9IG9wdGlvbnMuYWN0dWFsO1xuICB0aGlzLmV4cGVjdGVkID0gb3B0aW9ucy5leHBlY3RlZDtcbiAgdGhpcy5vcGVyYXRvciA9IG9wdGlvbnMub3BlcmF0b3I7XG4gIGlmIChvcHRpb25zLm1lc3NhZ2UpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2U7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5tZXNzYWdlID0gZ2V0TWVzc2FnZSh0aGlzKTtcbiAgICB0aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSB0cnVlO1xuICB9XG4gIHZhciBzdGFja1N0YXJ0RnVuY3Rpb24gPSBvcHRpb25zLnN0YWNrU3RhcnRGdW5jdGlvbiB8fCBmYWlsO1xuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBzdGFja1N0YXJ0RnVuY3Rpb24pO1xuICB9IGVsc2Uge1xuICAgIC8vIG5vbiB2OCBicm93c2VycyBzbyB3ZSBjYW4gaGF2ZSBhIHN0YWNrdHJhY2VcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCk7XG4gICAgaWYgKGVyci5zdGFjaykge1xuICAgICAgdmFyIG91dCA9IGVyci5zdGFjaztcblxuICAgICAgLy8gdHJ5IHRvIHN0cmlwIHVzZWxlc3MgZnJhbWVzXG4gICAgICB2YXIgZm5fbmFtZSA9IGdldE5hbWUoc3RhY2tTdGFydEZ1bmN0aW9uKTtcbiAgICAgIHZhciBpZHggPSBvdXQuaW5kZXhPZignXFxuJyArIGZuX25hbWUpO1xuICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgIC8vIG9uY2Ugd2UgaGF2ZSBsb2NhdGVkIHRoZSBmdW5jdGlvbiBmcmFtZVxuICAgICAgICAvLyB3ZSBuZWVkIHRvIHN0cmlwIG91dCBldmVyeXRoaW5nIGJlZm9yZSBpdCAoYW5kIGl0cyBsaW5lKVxuICAgICAgICB2YXIgbmV4dF9saW5lID0gb3V0LmluZGV4T2YoJ1xcbicsIGlkeCArIDEpO1xuICAgICAgICBvdXQgPSBvdXQuc3Vic3RyaW5nKG5leHRfbGluZSArIDEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YWNrID0gb3V0O1xuICAgIH1cbiAgfVxufTtcblxuLy8gYXNzZXJ0LkFzc2VydGlvbkVycm9yIGluc3RhbmNlb2YgRXJyb3JcbnV0aWwuaW5oZXJpdHMoYXNzZXJ0LkFzc2VydGlvbkVycm9yLCBFcnJvcik7XG5cbmZ1bmN0aW9uIHRydW5jYXRlKHMsIG4pIHtcbiAgaWYgKHR5cGVvZiBzID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzLmxlbmd0aCA8IG4gPyBzIDogcy5zbGljZSgwLCBuKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcztcbiAgfVxufVxuZnVuY3Rpb24gaW5zcGVjdChzb21ldGhpbmcpIHtcbiAgaWYgKGZ1bmN0aW9uc0hhdmVOYW1lcyB8fCAhdXRpbC5pc0Z1bmN0aW9uKHNvbWV0aGluZykpIHtcbiAgICByZXR1cm4gdXRpbC5pbnNwZWN0KHNvbWV0aGluZyk7XG4gIH1cbiAgdmFyIHJhd25hbWUgPSBnZXROYW1lKHNvbWV0aGluZyk7XG4gIHZhciBuYW1lID0gcmF3bmFtZSA/ICc6ICcgKyByYXduYW1lIDogJyc7XG4gIHJldHVybiAnW0Z1bmN0aW9uJyArICBuYW1lICsgJ10nO1xufVxuZnVuY3Rpb24gZ2V0TWVzc2FnZShzZWxmKSB7XG4gIHJldHVybiB0cnVuY2F0ZShpbnNwZWN0KHNlbGYuYWN0dWFsKSwgMTI4KSArICcgJyArXG4gICAgICAgICBzZWxmLm9wZXJhdG9yICsgJyAnICtcbiAgICAgICAgIHRydW5jYXRlKGluc3BlY3Qoc2VsZi5leHBlY3RlZCksIDEyOCk7XG59XG5cbi8vIEF0IHByZXNlbnQgb25seSB0aGUgdGhyZWUga2V5cyBtZW50aW9uZWQgYWJvdmUgYXJlIHVzZWQgYW5kXG4vLyB1bmRlcnN0b29kIGJ5IHRoZSBzcGVjLiBJbXBsZW1lbnRhdGlvbnMgb3Igc3ViIG1vZHVsZXMgY2FuIHBhc3Ncbi8vIG90aGVyIGtleXMgdG8gdGhlIEFzc2VydGlvbkVycm9yJ3MgY29uc3RydWN0b3IgLSB0aGV5IHdpbGwgYmVcbi8vIGlnbm9yZWQuXG5cbi8vIDMuIEFsbCBvZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBtdXN0IHRocm93IGFuIEFzc2VydGlvbkVycm9yXG4vLyB3aGVuIGEgY29ycmVzcG9uZGluZyBjb25kaXRpb24gaXMgbm90IG1ldCwgd2l0aCBhIG1lc3NhZ2UgdGhhdFxuLy8gbWF5IGJlIHVuZGVmaW5lZCBpZiBub3QgcHJvdmlkZWQuICBBbGwgYXNzZXJ0aW9uIG1ldGhvZHMgcHJvdmlkZVxuLy8gYm90aCB0aGUgYWN0dWFsIGFuZCBleHBlY3RlZCB2YWx1ZXMgdG8gdGhlIGFzc2VydGlvbiBlcnJvciBmb3Jcbi8vIGRpc3BsYXkgcHVycG9zZXMuXG5cbmZ1bmN0aW9uIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgb3BlcmF0b3IsIHN0YWNrU3RhcnRGdW5jdGlvbikge1xuICB0aHJvdyBuZXcgYXNzZXJ0LkFzc2VydGlvbkVycm9yKHtcbiAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgIGFjdHVhbDogYWN0dWFsLFxuICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICBvcGVyYXRvcjogb3BlcmF0b3IsXG4gICAgc3RhY2tTdGFydEZ1bmN0aW9uOiBzdGFja1N0YXJ0RnVuY3Rpb25cbiAgfSk7XG59XG5cbi8vIEVYVEVOU0lPTiEgYWxsb3dzIGZvciB3ZWxsIGJlaGF2ZWQgZXJyb3JzIGRlZmluZWQgZWxzZXdoZXJlLlxuYXNzZXJ0LmZhaWwgPSBmYWlsO1xuXG4vLyA0LiBQdXJlIGFzc2VydGlvbiB0ZXN0cyB3aGV0aGVyIGEgdmFsdWUgaXMgdHJ1dGh5LCBhcyBkZXRlcm1pbmVkXG4vLyBieSAhIWd1YXJkLlxuLy8gYXNzZXJ0Lm9rKGd1YXJkLCBtZXNzYWdlX29wdCk7XG4vLyBUaGlzIHN0YXRlbWVudCBpcyBlcXVpdmFsZW50IHRvIGFzc2VydC5lcXVhbCh0cnVlLCAhIWd1YXJkLFxuLy8gbWVzc2FnZV9vcHQpOy4gVG8gdGVzdCBzdHJpY3RseSBmb3IgdGhlIHZhbHVlIHRydWUsIHVzZVxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKHRydWUsIGd1YXJkLCBtZXNzYWdlX29wdCk7LlxuXG5mdW5jdGlvbiBvayh2YWx1ZSwgbWVzc2FnZSkge1xuICBpZiAoIXZhbHVlKSBmYWlsKHZhbHVlLCB0cnVlLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQub2spO1xufVxuYXNzZXJ0Lm9rID0gb2s7XG5cbi8vIDUuIFRoZSBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc2hhbGxvdywgY29lcmNpdmUgZXF1YWxpdHkgd2l0aFxuLy8gPT0uXG4vLyBhc3NlcnQuZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZXF1YWwgPSBmdW5jdGlvbiBlcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT0gZXhwZWN0ZWQpIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09JywgYXNzZXJ0LmVxdWFsKTtcbn07XG5cbi8vIDYuIFRoZSBub24tZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIGZvciB3aGV0aGVyIHR3byBvYmplY3RzIGFyZSBub3QgZXF1YWxcbi8vIHdpdGggIT0gYXNzZXJ0Lm5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0Lm5vdEVxdWFsID0gZnVuY3Rpb24gbm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT0nLCBhc3NlcnQubm90RXF1YWwpO1xuICB9XG59O1xuXG4vLyA3LiBUaGUgZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGEgZGVlcCBlcXVhbGl0eSByZWxhdGlvbi5cbi8vIGFzc2VydC5kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuZGVlcEVxdWFsID0gZnVuY3Rpb24gZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKCFfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIGZhbHNlKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ2RlZXBFcXVhbCcsIGFzc2VydC5kZWVwRXF1YWwpO1xuICB9XG59O1xuXG5hc3NlcnQuZGVlcFN0cmljdEVxdWFsID0gZnVuY3Rpb24gZGVlcFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKCFfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIHRydWUpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnZGVlcFN0cmljdEVxdWFsJywgYXNzZXJ0LmRlZXBTdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgc3RyaWN0LCBtZW1vcykge1xuICAvLyA3LjEuIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpc0J1ZmZlcihhY3R1YWwpICYmIGlzQnVmZmVyKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBjb21wYXJlKGFjdHVhbCwgZXhwZWN0ZWQpID09PSAwO1xuXG4gIC8vIDcuMi4gSWYgdGhlIGV4cGVjdGVkIHZhbHVlIGlzIGEgRGF0ZSBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgRGF0ZSBvYmplY3QgdGhhdCByZWZlcnMgdG8gdGhlIHNhbWUgdGltZS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzRGF0ZShhY3R1YWwpICYmIHV0aWwuaXNEYXRlKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIFJlZ0V4cCBvYmplY3QsIHRoZSBhY3R1YWwgdmFsdWUgaXNcbiAgLy8gZXF1aXZhbGVudCBpZiBpdCBpcyBhbHNvIGEgUmVnRXhwIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNvdXJjZSBhbmRcbiAgLy8gcHJvcGVydGllcyAoYGdsb2JhbGAsIGBtdWx0aWxpbmVgLCBgbGFzdEluZGV4YCwgYGlnbm9yZUNhc2VgKS5cbiAgfSBlbHNlIGlmICh1dGlsLmlzUmVnRXhwKGFjdHVhbCkgJiYgdXRpbC5pc1JlZ0V4cChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLnNvdXJjZSA9PT0gZXhwZWN0ZWQuc291cmNlICYmXG4gICAgICAgICAgIGFjdHVhbC5nbG9iYWwgPT09IGV4cGVjdGVkLmdsb2JhbCAmJlxuICAgICAgICAgICBhY3R1YWwubXVsdGlsaW5lID09PSBleHBlY3RlZC5tdWx0aWxpbmUgJiZcbiAgICAgICAgICAgYWN0dWFsLmxhc3RJbmRleCA9PT0gZXhwZWN0ZWQubGFzdEluZGV4ICYmXG4gICAgICAgICAgIGFjdHVhbC5pZ25vcmVDYXNlID09PSBleHBlY3RlZC5pZ25vcmVDYXNlO1xuXG4gIC8vIDcuNC4gT3RoZXIgcGFpcnMgdGhhdCBkbyBub3QgYm90aCBwYXNzIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSA9PS5cbiAgfSBlbHNlIGlmICgoYWN0dWFsID09PSBudWxsIHx8IHR5cGVvZiBhY3R1YWwgIT09ICdvYmplY3QnKSAmJlxuICAgICAgICAgICAgIChleHBlY3RlZCA9PT0gbnVsbCB8fCB0eXBlb2YgZXhwZWN0ZWQgIT09ICdvYmplY3QnKSkge1xuICAgIHJldHVybiBzdHJpY3QgPyBhY3R1YWwgPT09IGV4cGVjdGVkIDogYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIElmIGJvdGggdmFsdWVzIGFyZSBpbnN0YW5jZXMgb2YgdHlwZWQgYXJyYXlzLCB3cmFwIHRoZWlyIHVuZGVybHlpbmdcbiAgLy8gQXJyYXlCdWZmZXJzIGluIGEgQnVmZmVyIGVhY2ggdG8gaW5jcmVhc2UgcGVyZm9ybWFuY2VcbiAgLy8gVGhpcyBvcHRpbWl6YXRpb24gcmVxdWlyZXMgdGhlIGFycmF5cyB0byBoYXZlIHRoZSBzYW1lIHR5cGUgYXMgY2hlY2tlZCBieVxuICAvLyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nIChha2EgcFRvU3RyaW5nKS4gTmV2ZXIgcGVyZm9ybSBiaW5hcnlcbiAgLy8gY29tcGFyaXNvbnMgZm9yIEZsb2F0KkFycmF5cywgdGhvdWdoLCBzaW5jZSBlLmcuICswID09PSAtMCBidXQgdGhlaXJcbiAgLy8gYml0IHBhdHRlcm5zIGFyZSBub3QgaWRlbnRpY2FsLlxuICB9IGVsc2UgaWYgKGlzVmlldyhhY3R1YWwpICYmIGlzVmlldyhleHBlY3RlZCkgJiZcbiAgICAgICAgICAgICBwVG9TdHJpbmcoYWN0dWFsKSA9PT0gcFRvU3RyaW5nKGV4cGVjdGVkKSAmJlxuICAgICAgICAgICAgICEoYWN0dWFsIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5IHx8XG4gICAgICAgICAgICAgICBhY3R1YWwgaW5zdGFuY2VvZiBGbG9hdDY0QXJyYXkpKSB7XG4gICAgcmV0dXJuIGNvbXBhcmUobmV3IFVpbnQ4QXJyYXkoYWN0dWFsLmJ1ZmZlciksXG4gICAgICAgICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoZXhwZWN0ZWQuYnVmZmVyKSkgPT09IDA7XG5cbiAgLy8gNy41IEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIGlmIChpc0J1ZmZlcihhY3R1YWwpICE9PSBpc0J1ZmZlcihleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgbWVtb3MgPSBtZW1vcyB8fCB7YWN0dWFsOiBbXSwgZXhwZWN0ZWQ6IFtdfTtcblxuICAgIHZhciBhY3R1YWxJbmRleCA9IG1lbW9zLmFjdHVhbC5pbmRleE9mKGFjdHVhbCk7XG4gICAgaWYgKGFjdHVhbEluZGV4ICE9PSAtMSkge1xuICAgICAgaWYgKGFjdHVhbEluZGV4ID09PSBtZW1vcy5leHBlY3RlZC5pbmRleE9mKGV4cGVjdGVkKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtZW1vcy5hY3R1YWwucHVzaChhY3R1YWwpO1xuICAgIG1lbW9zLmV4cGVjdGVkLnB1c2goZXhwZWN0ZWQpO1xuXG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQsIHN0cmljdCwgbWVtb3MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIsIHN0cmljdCwgYWN0dWFsVmlzaXRlZE9iamVjdHMpIHtcbiAgaWYgKGEgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IG51bGwgfHwgYiA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy8gaWYgb25lIGlzIGEgcHJpbWl0aXZlLCB0aGUgb3RoZXIgbXVzdCBiZSBzYW1lXG4gIGlmICh1dGlsLmlzUHJpbWl0aXZlKGEpIHx8IHV0aWwuaXNQcmltaXRpdmUoYikpXG4gICAgcmV0dXJuIGEgPT09IGI7XG4gIGlmIChzdHJpY3QgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKGEpICE9PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICB2YXIgYUlzQXJncyA9IGlzQXJndW1lbnRzKGEpO1xuICB2YXIgYklzQXJncyA9IGlzQXJndW1lbnRzKGIpO1xuICBpZiAoKGFJc0FyZ3MgJiYgIWJJc0FyZ3MpIHx8ICghYUlzQXJncyAmJiBiSXNBcmdzKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIGlmIChhSXNBcmdzKSB7XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gX2RlZXBFcXVhbChhLCBiLCBzdHJpY3QpO1xuICB9XG4gIHZhciBrYSA9IG9iamVjdEtleXMoYSk7XG4gIHZhciBrYiA9IG9iamVjdEtleXMoYik7XG4gIHZhciBrZXksIGk7XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT09IGtiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vdGhlIHNhbWUgc2V0IG9mIGtleXMgKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksXG4gIGthLnNvcnQoKTtcbiAga2Iuc29ydCgpO1xuICAvL35+fmNoZWFwIGtleSB0ZXN0XG4gIGZvciAoaSA9IGthLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKGthW2ldICE9PSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghX2RlZXBFcXVhbChhW2tleV0sIGJba2V5XSwgc3RyaWN0LCBhY3R1YWxWaXNpdGVkT2JqZWN0cykpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIDguIFRoZSBub24tZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGZvciBhbnkgZGVlcCBpbmVxdWFsaXR5LlxuLy8gYXNzZXJ0Lm5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3REZWVwRXF1YWwgPSBmdW5jdGlvbiBub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBmYWxzZSkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdub3REZWVwRXF1YWwnLCBhc3NlcnQubm90RGVlcEVxdWFsKTtcbiAgfVxufTtcblxuYXNzZXJ0Lm5vdERlZXBTdHJpY3RFcXVhbCA9IG5vdERlZXBTdHJpY3RFcXVhbDtcbmZ1bmN0aW9uIG5vdERlZXBTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIHRydWUpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnbm90RGVlcFN0cmljdEVxdWFsJywgbm90RGVlcFN0cmljdEVxdWFsKTtcbiAgfVxufVxuXG5cbi8vIDkuIFRoZSBzdHJpY3QgZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIHN0cmljdCBlcXVhbGl0eSwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQuc3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBzdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgIT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT09JywgYXNzZXJ0LnN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuLy8gMTAuIFRoZSBzdHJpY3Qgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igc3RyaWN0IGluZXF1YWxpdHksIGFzXG4vLyBkZXRlcm1pbmVkIGJ5ICE9PS4gIGFzc2VydC5ub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3RTdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIG5vdFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPT0nLCBhc3NlcnQubm90U3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIGlmICghYWN0dWFsIHx8ICFleHBlY3RlZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXhwZWN0ZWQpID09ICdbb2JqZWN0IFJlZ0V4cF0nKSB7XG4gICAgcmV0dXJuIGV4cGVjdGVkLnRlc3QoYWN0dWFsKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKGFjdHVhbCBpbnN0YW5jZW9mIGV4cGVjdGVkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJZ25vcmUuICBUaGUgaW5zdGFuY2VvZiBjaGVjayBkb2Vzbid0IHdvcmsgZm9yIGFycm93IGZ1bmN0aW9ucy5cbiAgfVxuXG4gIGlmIChFcnJvci5pc1Byb3RvdHlwZU9mKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBleHBlY3RlZC5jYWxsKHt9LCBhY3R1YWwpID09PSB0cnVlO1xufVxuXG5mdW5jdGlvbiBfdHJ5QmxvY2soYmxvY2spIHtcbiAgdmFyIGVycm9yO1xuICB0cnkge1xuICAgIGJsb2NrKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvciA9IGU7XG4gIH1cbiAgcmV0dXJuIGVycm9yO1xufVxuXG5mdW5jdGlvbiBfdGhyb3dzKHNob3VsZFRocm93LCBibG9jaywgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgdmFyIGFjdHVhbDtcblxuICBpZiAodHlwZW9mIGJsb2NrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJibG9ja1wiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBleHBlY3RlZCA9PT0gJ3N0cmluZycpIHtcbiAgICBtZXNzYWdlID0gZXhwZWN0ZWQ7XG4gICAgZXhwZWN0ZWQgPSBudWxsO1xuICB9XG5cbiAgYWN0dWFsID0gX3RyeUJsb2NrKGJsb2NrKTtcblxuICBtZXNzYWdlID0gKGV4cGVjdGVkICYmIGV4cGVjdGVkLm5hbWUgPyAnICgnICsgZXhwZWN0ZWQubmFtZSArICcpLicgOiAnLicpICtcbiAgICAgICAgICAgIChtZXNzYWdlID8gJyAnICsgbWVzc2FnZSA6ICcuJyk7XG5cbiAgaWYgKHNob3VsZFRocm93ICYmICFhY3R1YWwpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsICdNaXNzaW5nIGV4cGVjdGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIHZhciB1c2VyUHJvdmlkZWRNZXNzYWdlID0gdHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnO1xuICB2YXIgaXNVbndhbnRlZEV4Y2VwdGlvbiA9ICFzaG91bGRUaHJvdyAmJiB1dGlsLmlzRXJyb3IoYWN0dWFsKTtcbiAgdmFyIGlzVW5leHBlY3RlZEV4Y2VwdGlvbiA9ICFzaG91bGRUaHJvdyAmJiBhY3R1YWwgJiYgIWV4cGVjdGVkO1xuXG4gIGlmICgoaXNVbndhbnRlZEV4Y2VwdGlvbiAmJlxuICAgICAgdXNlclByb3ZpZGVkTWVzc2FnZSAmJlxuICAgICAgZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8XG4gICAgICBpc1VuZXhwZWN0ZWRFeGNlcHRpb24pIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsICdHb3QgdW53YW50ZWQgZXhjZXB0aW9uJyArIG1lc3NhZ2UpO1xuICB9XG5cbiAgaWYgKChzaG91bGRUaHJvdyAmJiBhY3R1YWwgJiYgZXhwZWN0ZWQgJiZcbiAgICAgICFleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGV4cGVjdGVkKSkgfHwgKCFzaG91bGRUaHJvdyAmJiBhY3R1YWwpKSB7XG4gICAgdGhyb3cgYWN0dWFsO1xuICB9XG59XG5cbi8vIDExLiBFeHBlY3RlZCB0byB0aHJvdyBhbiBlcnJvcjpcbi8vIGFzc2VydC50aHJvd3MoYmxvY2ssIEVycm9yX29wdCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQudGhyb3dzID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL2Vycm9yLCAvKm9wdGlvbmFsKi9tZXNzYWdlKSB7XG4gIF90aHJvd3ModHJ1ZSwgYmxvY2ssIGVycm9yLCBtZXNzYWdlKTtcbn07XG5cbi8vIEVYVEVOU0lPTiEgVGhpcyBpcyBhbm5veWluZyB0byB3cml0ZSBvdXRzaWRlIHRoaXMgbW9kdWxlLlxuYXNzZXJ0LmRvZXNOb3RUaHJvdyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzKGZhbHNlLCBibG9jaywgZXJyb3IsIG1lc3NhZ2UpO1xufTtcblxuYXNzZXJ0LmlmRXJyb3IgPSBmdW5jdGlvbihlcnIpIHsgaWYgKGVycikgdGhyb3cgZXJyOyB9O1xuXG4vLyBFeHBvc2UgYSBzdHJpY3Qgb25seSB2YXJpYW50IG9mIGFzc2VydFxuZnVuY3Rpb24gc3RyaWN0KHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIGZhaWwodmFsdWUsIHRydWUsIG1lc3NhZ2UsICc9PScsIHN0cmljdCk7XG59XG5hc3NlcnQuc3RyaWN0ID0gb2JqZWN0QXNzaWduKHN0cmljdCwgYXNzZXJ0LCB7XG4gIGVxdWFsOiBhc3NlcnQuc3RyaWN0RXF1YWwsXG4gIGRlZXBFcXVhbDogYXNzZXJ0LmRlZXBTdHJpY3RFcXVhbCxcbiAgbm90RXF1YWw6IGFzc2VydC5ub3RTdHJpY3RFcXVhbCxcbiAgbm90RGVlcEVxdWFsOiBhc3NlcnQubm90RGVlcFN0cmljdEVxdWFsXG59KTtcbmFzc2VydC5zdHJpY3Quc3RyaWN0ID0gYXNzZXJ0LnN0cmljdDtcblxudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzT3duLmNhbGwob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4ga2V5cztcbn07XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG4iLCIiLCIvKiBnbG9iYWxzIGRvY3VtZW50LCBJbWFnZURhdGEgKi9cblxuY29uc3QgcGFyc2VGb250ID0gcmVxdWlyZSgnLi9saWIvcGFyc2UtZm9udCcpXG5cbmV4cG9ydHMucGFyc2VGb250ID0gcGFyc2VGb250XG5cbmV4cG9ydHMuY3JlYXRlQ2FudmFzID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksIHsgd2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodCB9KVxufVxuXG5leHBvcnRzLmNyZWF0ZUltYWdlRGF0YSA9IGZ1bmN0aW9uIChhcnJheSwgd2lkdGgsIGhlaWdodCkge1xuICAvLyBCcm93c2VyIGltcGxlbWVudGF0aW9uIG9mIEltYWdlRGF0YSBsb29rcyBhdCB0aGUgbnVtYmVyIG9mIGFyZ3VtZW50cyBwYXNzZWRcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gbmV3IEltYWdlRGF0YSgpXG4gICAgY2FzZSAxOiByZXR1cm4gbmV3IEltYWdlRGF0YShhcnJheSlcbiAgICBjYXNlIDI6IHJldHVybiBuZXcgSW1hZ2VEYXRhKGFycmF5LCB3aWR0aClcbiAgICBkZWZhdWx0OiByZXR1cm4gbmV3IEltYWdlRGF0YShhcnJheSwgd2lkdGgsIGhlaWdodClcbiAgfVxufVxuXG5leHBvcnRzLmxvYWRJbWFnZSA9IGZ1bmN0aW9uIChzcmMsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBjb25zdCBpbWFnZSA9IE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyksIG9wdGlvbnMpXG5cbiAgICBmdW5jdGlvbiBjbGVhbnVwICgpIHtcbiAgICAgIGltYWdlLm9ubG9hZCA9IG51bGxcbiAgICAgIGltYWdlLm9uZXJyb3IgPSBudWxsXG4gICAgfVxuXG4gICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkgeyBjbGVhbnVwKCk7IHJlc29sdmUoaW1hZ2UpIH1cbiAgICBpbWFnZS5vbmVycm9yID0gZnVuY3Rpb24gKCkgeyBjbGVhbnVwKCk7IHJlamVjdChuZXcgRXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHRoZSBpbWFnZSBcIicgKyBzcmMgKyAnXCInKSkgfVxuXG4gICAgaW1hZ2Uuc3JjID0gc3JjXG4gIH0pXG59XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBGb250IFJlZ0V4cCBoZWxwZXJzLlxuICovXG5cbmNvbnN0IHdlaWdodHMgPSAnYm9sZHxib2xkZXJ8bGlnaHRlcnxbMS05XTAwJ1xuY29uc3Qgc3R5bGVzID0gJ2l0YWxpY3xvYmxpcXVlJ1xuY29uc3QgdmFyaWFudHMgPSAnc21hbGwtY2FwcydcbmNvbnN0IHN0cmV0Y2hlcyA9ICd1bHRyYS1jb25kZW5zZWR8ZXh0cmEtY29uZGVuc2VkfGNvbmRlbnNlZHxzZW1pLWNvbmRlbnNlZHxzZW1pLWV4cGFuZGVkfGV4cGFuZGVkfGV4dHJhLWV4cGFuZGVkfHVsdHJhLWV4cGFuZGVkJ1xuY29uc3QgdW5pdHMgPSAncHh8cHR8cGN8aW58Y218bW18JXxlbXxleHxjaHxyZW18cSdcbmNvbnN0IHN0cmluZyA9ICdcXCcoW15cXCddKylcXCd8XCIoW15cIl0rKVwifFtcXFxcd1xcXFxzLV0rJ1xuXG4vLyBbIFsgPOKAmGZvbnQtc3R5bGXigJk+IHx8IDxmb250LXZhcmlhbnQtY3NzMjE+IHx8IDzigJhmb250LXdlaWdodOKAmT4gfHwgPOKAmGZvbnQtc3RyZXRjaOKAmT4gXT9cbi8vICAgIDzigJhmb250LXNpemXigJk+IFsgLyA84oCYbGluZS1oZWlnaHTigJk+IF0/IDzigJhmb250LWZhbWlseeKAmT4gXVxuLy8gaHR0cHM6Ly9kcmFmdHMuY3Nzd2cub3JnL2Nzcy1mb250cy0zLyNmb250LXByb3BcbmNvbnN0IHdlaWdodFJlID0gbmV3IFJlZ0V4cChgKCR7d2VpZ2h0c30pICtgLCAnaScpXG5jb25zdCBzdHlsZVJlID0gbmV3IFJlZ0V4cChgKCR7c3R5bGVzfSkgK2AsICdpJylcbmNvbnN0IHZhcmlhbnRSZSA9IG5ldyBSZWdFeHAoYCgke3ZhcmlhbnRzfSkgK2AsICdpJylcbmNvbnN0IHN0cmV0Y2hSZSA9IG5ldyBSZWdFeHAoYCgke3N0cmV0Y2hlc30pICtgLCAnaScpXG5jb25zdCBzaXplRmFtaWx5UmUgPSBuZXcgUmVnRXhwKFxuICBgKFtcXFxcZFxcXFwuXSspKCR7dW5pdHN9KSAqKCg/OiR7c3RyaW5nfSkoICosICooPzoke3N0cmluZ30pKSopYClcblxuLyoqXG4gKiBDYWNoZSBmb250IHBhcnNpbmcuXG4gKi9cblxuY29uc3QgY2FjaGUgPSB7fVxuXG5jb25zdCBkZWZhdWx0SGVpZ2h0ID0gMTYgLy8gcHQsIGNvbW1vbiBicm93c2VyIGRlZmF1bHRcblxuLyoqXG4gKiBQYXJzZSBmb250IGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH0gUGFyc2VkIGZvbnQuIGBzaXplYCBpcyBpbiBkZXZpY2UgdW5pdHMuIGB1bml0YCBpcyB0aGUgdW5pdFxuICogICBhcHBlYXJpbmcgaW4gdGhlIGlucHV0IHN0cmluZy5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gc3RyID0+IHtcbiAgLy8gQ2FjaGVkXG4gIGlmIChjYWNoZVtzdHJdKSByZXR1cm4gY2FjaGVbc3RyXVxuXG4gIC8vIFRyeSBmb3IgcmVxdWlyZWQgcHJvcGVydGllcyBmaXJzdC5cbiAgY29uc3Qgc2l6ZUZhbWlseSA9IHNpemVGYW1pbHlSZS5leGVjKHN0cilcbiAgaWYgKCFzaXplRmFtaWx5KSByZXR1cm4gLy8gaW52YWxpZFxuXG4gIC8vIERlZmF1bHQgdmFsdWVzIGFuZCByZXF1aXJlZCBwcm9wZXJ0aWVzXG4gIGNvbnN0IGZvbnQgPSB7XG4gICAgd2VpZ2h0OiAnbm9ybWFsJyxcbiAgICBzdHlsZTogJ25vcm1hbCcsXG4gICAgc3RyZXRjaDogJ25vcm1hbCcsXG4gICAgdmFyaWFudDogJ25vcm1hbCcsXG4gICAgc2l6ZTogcGFyc2VGbG9hdChzaXplRmFtaWx5WzFdKSxcbiAgICB1bml0OiBzaXplRmFtaWx5WzJdLFxuICAgIGZhbWlseTogc2l6ZUZhbWlseVszXS5yZXBsYWNlKC9bXCInXS9nLCAnJykucmVwbGFjZSgvICosICovZywgJywnKVxuICB9XG5cbiAgLy8gT3B0aW9uYWwsIHVub3JkZXJlZCBwcm9wZXJ0aWVzLlxuICBsZXQgd2VpZ2h0LCBzdHlsZSwgdmFyaWFudCwgc3RyZXRjaFxuICAvLyBTdG9wIHNlYXJjaCBhdCBgc2l6ZUZhbWlseS5pbmRleGBcbiAgY29uc3Qgc3Vic3RyID0gc3RyLnN1YnN0cmluZygwLCBzaXplRmFtaWx5LmluZGV4KVxuICBpZiAoKHdlaWdodCA9IHdlaWdodFJlLmV4ZWMoc3Vic3RyKSkpIGZvbnQud2VpZ2h0ID0gd2VpZ2h0WzFdXG4gIGlmICgoc3R5bGUgPSBzdHlsZVJlLmV4ZWMoc3Vic3RyKSkpIGZvbnQuc3R5bGUgPSBzdHlsZVsxXVxuICBpZiAoKHZhcmlhbnQgPSB2YXJpYW50UmUuZXhlYyhzdWJzdHIpKSkgZm9udC52YXJpYW50ID0gdmFyaWFudFsxXVxuICBpZiAoKHN0cmV0Y2ggPSBzdHJldGNoUmUuZXhlYyhzdWJzdHIpKSkgZm9udC5zdHJldGNoID0gc3RyZXRjaFsxXVxuXG4gIC8vIENvbnZlcnQgdG8gZGV2aWNlIHVuaXRzLiAoYGZvbnQudW5pdGAgaXMgdGhlIG9yaWdpbmFsIHVuaXQpXG4gIC8vIFRPRE86IGNoLCBleFxuICBzd2l0Y2ggKGZvbnQudW5pdCkge1xuICAgIGNhc2UgJ3B0JzpcbiAgICAgIGZvbnQuc2l6ZSAvPSAwLjc1XG4gICAgICBicmVha1xuICAgIGNhc2UgJ3BjJzpcbiAgICAgIGZvbnQuc2l6ZSAqPSAxNlxuICAgICAgYnJlYWtcbiAgICBjYXNlICdpbic6XG4gICAgICBmb250LnNpemUgKj0gOTZcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnY20nOlxuICAgICAgZm9udC5zaXplICo9IDk2LjAgLyAyLjU0XG4gICAgICBicmVha1xuICAgIGNhc2UgJ21tJzpcbiAgICAgIGZvbnQuc2l6ZSAqPSA5Ni4wIC8gMjUuNFxuICAgICAgYnJlYWtcbiAgICBjYXNlICclJzpcbiAgICAgIC8vIFRPRE8gZGlzYWJsZWQgYmVjYXVzZSBleGlzdGluZyB1bml0IHRlc3RzIGFzc3VtZSAxMDBcbiAgICAgIC8vIGZvbnQuc2l6ZSAqPSBkZWZhdWx0SGVpZ2h0IC8gMTAwIC8gMC43NVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdlbSc6XG4gICAgY2FzZSAncmVtJzpcbiAgICAgIGZvbnQuc2l6ZSAqPSBkZWZhdWx0SGVpZ2h0IC8gMC43NVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdxJzpcbiAgICAgIGZvbnQuc2l6ZSAqPSA5NiAvIDI1LjQgLyA0XG4gICAgICBicmVha1xuICB9XG5cbiAgcmV0dXJuIChjYWNoZVtzdHJdID0gZm9udClcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vLyByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLWdsb2JhbFxudmFyIGdldEdsb2JhbCA9IGZ1bmN0aW9uICgpIHtcblx0Ly8gdGhlIG9ubHkgcmVsaWFibGUgbWVhbnMgdG8gZ2V0IHRoZSBnbG9iYWwgb2JqZWN0IGlzXG5cdC8vIGBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpYFxuXHQvLyBIb3dldmVyLCB0aGlzIGNhdXNlcyBDU1AgdmlvbGF0aW9ucyBpbiBDaHJvbWUgYXBwcy5cblx0aWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykgeyByZXR1cm4gc2VsZjsgfVxuXHRpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuIHdpbmRvdzsgfVxuXHRpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuIGdsb2JhbDsgfVxuXHR0aHJvdyBuZXcgRXJyb3IoJ3VuYWJsZSB0byBsb2NhdGUgZ2xvYmFsIG9iamVjdCcpO1xufVxuXG52YXIgZ2xvYmFsT2JqZWN0ID0gZ2V0R2xvYmFsKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGdsb2JhbE9iamVjdC5mZXRjaDtcblxuLy8gTmVlZGVkIGZvciBUeXBlU2NyaXB0IGFuZCBXZWJwYWNrLlxuaWYgKGdsb2JhbE9iamVjdC5mZXRjaCkge1xuXHRleHBvcnRzLmRlZmF1bHQgPSBnbG9iYWxPYmplY3QuZmV0Y2guYmluZChnbG9iYWxPYmplY3QpO1xufVxuXG5leHBvcnRzLkhlYWRlcnMgPSBnbG9iYWxPYmplY3QuSGVhZGVycztcbmV4cG9ydHMuUmVxdWVzdCA9IGdsb2JhbE9iamVjdC5SZXF1ZXN0O1xuZXhwb3J0cy5SZXNwb25zZSA9IGdsb2JhbE9iamVjdC5SZXNwb25zZTtcbiIsIi8qXG5vYmplY3QtYXNzaWduXG4oYykgU2luZHJlIFNvcmh1c1xuQGxpY2Vuc2UgTUlUXG4qL1xuXG4ndXNlIHN0cmljdCc7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xudmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZFVzZU5hdGl2ZSgpIHtcblx0dHJ5IHtcblx0XHRpZiAoIU9iamVjdC5hc3NpZ24pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBEZXRlY3QgYnVnZ3kgcHJvcGVydHkgZW51bWVyYXRpb24gb3JkZXIgaW4gb2xkZXIgVjggdmVyc2lvbnMuXG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTE4XG5cdFx0dmFyIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ldy13cmFwcGVyc1xuXHRcdHRlc3QxWzVdID0gJ2RlJztcblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDEpWzBdID09PSAnNScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QyID0ge307XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0XHR0ZXN0MlsnXycgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXSA9IGk7XG5cdFx0fVxuXHRcdHZhciBvcmRlcjIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MikubWFwKGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRyZXR1cm4gdGVzdDJbbl07XG5cdFx0fSk7XG5cdFx0aWYgKG9yZGVyMi5qb2luKCcnKSAhPT0gJzAxMjM0NTY3ODknKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MyA9IHt9O1xuXHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlcikge1xuXHRcdFx0dGVzdDNbbGV0dGVyXSA9IGxldHRlcjtcblx0XHR9KTtcblx0XHRpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT1cblx0XHRcdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNob3VsZFVzZU5hdGl2ZSgpID8gT2JqZWN0LmFzc2lnbiA6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIHRvID0gdG9PYmplY3QodGFyZ2V0KTtcblx0dmFyIHN5bWJvbHM7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gT2JqZWN0KGFyZ3VtZW50c1tzXSk7XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuXHRcdFx0XHR0b1trZXldID0gZnJvbVtrZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcblx0XHRcdHN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY29tcGlsZSA9IGV4cG9ydHMubWFrZU5vbnRlcm1pbmFsQ29udmVydGVycyA9IHZvaWQgMDtcbmNvbnN0IHR5cGVzXzEgPSByZXF1aXJlKFwiLi90eXBlc1wiKTtcbmNvbnN0IGFzc2VydF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJhc3NlcnRcIikpO1xuY29uc3QgcGFyc2VyXzEgPSByZXF1aXJlKFwiLi9wYXJzZXJcIik7XG4vKipcbiAqIENvbnZlcnRzIHN0cmluZyB0byBub250ZXJtaW5hbC5cbiAqIEBwYXJhbSA8TlQ+IG5vbnRlcm1pbmFsIGVudW1lcmF0aW9uXG4gKiBAcGFyYW0gbm9udGVybWluYWxzIHJlcXVpcmVkIHRvIGJlIHRoZSBydW50aW1lIG9iamVjdCBmb3IgdGhlIDxOVD4gdHlwZSBwYXJhbWV0ZXJcbiAqIEByZXR1cm4gYSBwYWlyIG9mIGNvbnZlcnRlcnMgeyBub250ZXJtaW5hbFRvU3RyaW5nLCBzdHJpbmdUb05vbnRlcm1pbmFsIH1cbiAqICAgICAgICAgICAgICBvbmUgdGFrZXMgYSBzdHJpbmcgKGFueSBhbHBoYWJldGljIGNhc2UpIGFuZCByZXR1cm5zIHRoZSBub250ZXJtaW5hbCBpdCBuYW1lc1xuICogICAgICAgICAgICAgIHRoZSBvdGhlciB0YWtlcyBhIG5vbnRlcm1pbmFsIGFuZCByZXR1cm5zIGl0cyBzdHJpbmcgbmFtZSwgdXNpbmcgdGhlIFR5cGVzY3JpcHQgc291cmNlIGNhcGl0YWxpemF0aW9uLlxuICogICAgICAgICBCb3RoIGNvbnZlcnRlcnMgdGhyb3cgR3JhbW1hckVycm9yIGlmIHRoZSBjb252ZXJzaW9uIGNhbid0IGJlIGRvbmUuXG4gKiBAdGhyb3dzIEdyYW1tYXJFcnJvciBpZiBOVCBoYXMgYSBuYW1lIGNvbGxpc2lvbiAodHdvIG5vbnRlcm1pbmFsIG5hbWVzIHRoYXQgZGlmZmVyIG9ubHkgaW4gY2FwaXRhbGl6YXRpb24sXG4gKiAgICAgICBlLmcuIFJPT1QgYW5kIHJvb3QpLlxuICovXG5mdW5jdGlvbiBtYWtlTm9udGVybWluYWxDb252ZXJ0ZXJzKG5vbnRlcm1pbmFscykge1xuICAgIC8vIFwiY2Fub25pY2FsIG5hbWVcIiBpcyBhIGNhc2UtaW5kZXBlbmRlbnQgbmFtZSAoY2Fub25pY2FsaXplZCB0byBsb3dlcmNhc2UpXG4gICAgLy8gXCJzb3VyY2UgbmFtZVwiIGlzIHRoZSBuYW1lIGNhcGl0YWxpemVkIGFzIGluIHRoZSBUeXBlc2NyaXB0IHNvdXJjZSBkZWZpbml0aW9uIG9mIE5UXG4gICAgY29uc3Qgbm9udGVybWluYWxGb3JDYW5vbmljYWxOYW1lID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHNvdXJjZU5hbWVGb3JOb250ZXJtaW5hbCA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhub250ZXJtaW5hbHMpKSB7XG4gICAgICAgIC8vIGluIFR5cGVzY3JpcHQsIHRoZSBub250ZXJtaW5hbHMgb2JqZWN0IGNvbWJpbmVzIGJvdGggYSBOVC0+bmFtZSBtYXBwaW5nIGFuZCBuYW1lLT5OVCBtYXBwaW5nLlxuICAgICAgICAvLyBodHRwczovL3d3dy50eXBlc2NyaXB0bGFuZy5vcmcvZG9jcy9oYW5kYm9vay9lbnVtcy5odG1sI2VudW1zLWF0LXJ1bnRpbWVcbiAgICAgICAgLy8gU28gZmlsdGVyIGp1c3QgdG8ga2V5cyB0aGF0IGFyZSB2YWxpZCBQYXJzZXJsaWIgbm9udGVybWluYWwgbmFtZXNcbiAgICAgICAgaWYgKC9eW2EtekEtWl9dW2EtekEtWl8wLTldKiQvLnRlc3Qoa2V5KSkge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlTmFtZSA9IGtleTtcbiAgICAgICAgICAgIGNvbnN0IGNhbm9uaWNhbE5hbWUgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGNvbnN0IG50ID0gbm9udGVybWluYWxzW3NvdXJjZU5hbWVdO1xuICAgICAgICAgICAgaWYgKG5vbnRlcm1pbmFsRm9yQ2Fub25pY2FsTmFtZS5oYXMoY2Fub25pY2FsTmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5HcmFtbWFyRXJyb3IoJ25hbWUgY29sbGlzaW9uIGluIG5vbnRlcm1pbmFsIGVudW1lcmF0aW9uOiAnXG4gICAgICAgICAgICAgICAgICAgICsgc291cmNlTmFtZUZvck5vbnRlcm1pbmFsLmdldChub250ZXJtaW5hbEZvckNhbm9uaWNhbE5hbWUuZ2V0KGNhbm9uaWNhbE5hbWUpKVxuICAgICAgICAgICAgICAgICAgICArICcgYW5kICcgKyBzb3VyY2VOYW1lXG4gICAgICAgICAgICAgICAgICAgICsgJyBhcmUgdGhlIHNhbWUgd2hlbiBjb21wYXJlZCBjYXNlLWluc2Vuc2l0aXZlbHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vbnRlcm1pbmFsRm9yQ2Fub25pY2FsTmFtZS5zZXQoY2Fub25pY2FsTmFtZSwgbnQpO1xuICAgICAgICAgICAgc291cmNlTmFtZUZvck5vbnRlcm1pbmFsLnNldChudCwgc291cmNlTmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmVycm9yKHNvdXJjZU5hbWVGb3JOb250ZXJtaW5hbCk7XG4gICAgZnVuY3Rpb24gc3RyaW5nVG9Ob250ZXJtaW5hbChuYW1lKSB7XG4gICAgICAgIGNvbnN0IGNhbm9uaWNhbE5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICghbm9udGVybWluYWxGb3JDYW5vbmljYWxOYW1lLmhhcyhjYW5vbmljYWxOYW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuR3JhbW1hckVycm9yKCdncmFtbWFyIHVzZXMgbm9udGVybWluYWwgJyArIG5hbWUgKyAnLCB3aGljaCBpcyBub3QgZm91bmQgaW4gdGhlIG5vbnRlcm1pbmFsIGVudW1lcmF0aW9uIHBhc3NlZCB0byBjb21waWxlKCknKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9udGVybWluYWxGb3JDYW5vbmljYWxOYW1lLmdldChjYW5vbmljYWxOYW1lKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbm9udGVybWluYWxUb1N0cmluZyhudCkge1xuICAgICAgICBpZiAoIXNvdXJjZU5hbWVGb3JOb250ZXJtaW5hbC5oYXMobnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5HcmFtbWFyRXJyb3IoJ25vbnRlcm1pbmFsICcgKyBudCArICcgaXMgbm90IGZvdW5kIGluIHRoZSBub250ZXJtaW5hbCBlbnVtZXJhdGlvbiBwYXNzZWQgdG8gY29tcGlsZSgpJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvdXJjZU5hbWVGb3JOb250ZXJtaW5hbC5nZXQobnQpO1xuICAgIH1cbiAgICByZXR1cm4geyBzdHJpbmdUb05vbnRlcm1pbmFsLCBub250ZXJtaW5hbFRvU3RyaW5nIH07XG59XG5leHBvcnRzLm1ha2VOb250ZXJtaW5hbENvbnZlcnRlcnMgPSBtYWtlTm9udGVybWluYWxDb252ZXJ0ZXJzO1xudmFyIEdyYW1tYXJOVDtcbihmdW5jdGlvbiAoR3JhbW1hck5UKSB7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIkdSQU1NQVJcIl0gPSAwXSA9IFwiR1JBTU1BUlwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJQUk9EVUNUSU9OXCJdID0gMV0gPSBcIlBST0RVQ1RJT05cIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiU0tJUEJMT0NLXCJdID0gMl0gPSBcIlNLSVBCTE9DS1wiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJVTklPTlwiXSA9IDNdID0gXCJVTklPTlwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJDT05DQVRFTkFUSU9OXCJdID0gNF0gPSBcIkNPTkNBVEVOQVRJT05cIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiUkVQRVRJVElPTlwiXSA9IDVdID0gXCJSRVBFVElUSU9OXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlJFUEVBVE9QRVJBVE9SXCJdID0gNl0gPSBcIlJFUEVBVE9QRVJBVE9SXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlVOSVRcIl0gPSA3XSA9IFwiVU5JVFwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJOT05URVJNSU5BTFwiXSA9IDhdID0gXCJOT05URVJNSU5BTFwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJURVJNSU5BTFwiXSA9IDldID0gXCJURVJNSU5BTFwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJRVU9URURTVFJJTkdcIl0gPSAxMF0gPSBcIlFVT1RFRFNUUklOR1wiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJOVU1CRVJcIl0gPSAxMV0gPSBcIk5VTUJFUlwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJSQU5HRVwiXSA9IDEyXSA9IFwiUkFOR0VcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiVVBQRVJCT1VORFwiXSA9IDEzXSA9IFwiVVBQRVJCT1VORFwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJMT1dFUkJPVU5EXCJdID0gMTRdID0gXCJMT1dFUkJPVU5EXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIkNIQVJBQ1RFUlNFVFwiXSA9IDE1XSA9IFwiQ0hBUkFDVEVSU0VUXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIkFOWUNIQVJcIl0gPSAxNl0gPSBcIkFOWUNIQVJcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiQ0hBUkFDVEVSQ0xBU1NcIl0gPSAxN10gPSBcIkNIQVJBQ1RFUkNMQVNTXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIldISVRFU1BBQ0VcIl0gPSAxOF0gPSBcIldISVRFU1BBQ0VcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiT05FTElORUNPTU1FTlRcIl0gPSAxOV0gPSBcIk9ORUxJTkVDT01NRU5UXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIkJMT0NLQ09NTUVOVFwiXSA9IDIwXSA9IFwiQkxPQ0tDT01NRU5UXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlNLSVBcIl0gPSAyMV0gPSBcIlNLSVBcIjtcbn0pKEdyYW1tYXJOVCB8fCAoR3JhbW1hck5UID0ge30pKTtcbjtcbmZ1bmN0aW9uIG50dChub250ZXJtaW5hbCkge1xuICAgIHJldHVybiAoMCwgcGFyc2VyXzEubnQpKG5vbnRlcm1pbmFsLCBHcmFtbWFyTlRbbm9udGVybWluYWxdKTtcbn1cbmNvbnN0IGdyYW1tYXJHcmFtbWFyID0gbmV3IE1hcCgpO1xuLy8gZ3JhbW1hciA6Oj0gKCBwcm9kdWN0aW9uIHwgc2tpcEJsb2NrICkrXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULkdSQU1NQVIsICgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuU0tJUCksICgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEub3IpKG50dChHcmFtbWFyTlQuUFJPRFVDVElPTiksIG50dChHcmFtbWFyTlQuU0tJUEJMT0NLKSksIG50dChHcmFtbWFyTlQuU0tJUCkpKSkpO1xuLy8gc2tpcEJsb2NrIDo6PSAnQHNraXAnIG5vbnRlcm1pbmFsICd7JyBwcm9kdWN0aW9uKiAnfSdcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuU0tJUEJMT0NLLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKShcIkBza2lwXCIpLCBudHQoR3JhbW1hck5ULlNLSVApLCAoMCwgcGFyc2VyXzEuZmFpbGZhc3QpKG50dChHcmFtbWFyTlQuTk9OVEVSTUlOQUwpKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSwgKDAsIHBhcnNlcl8xLnN0cikoJ3snKSwgKDAsIHBhcnNlcl8xLmZhaWxmYXN0KSgoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULlNLSVApLCAoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5QUk9EVUNUSU9OKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSkpLCAoMCwgcGFyc2VyXzEuc3RyKSgnfScpKSkpKTtcbi8vIHByb2R1Y3Rpb24gOjo9IG5vbnRlcm1pbmFsICc6Oj0nIHVuaW9uICc7J1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5QUk9EVUNUSU9OLCAoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULk5PTlRFUk1JTkFMKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSwgKDAsIHBhcnNlcl8xLnN0cikoXCI6Oj1cIiksICgwLCBwYXJzZXJfMS5mYWlsZmFzdCkoKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5TS0lQKSwgbnR0KEdyYW1tYXJOVC5VTklPTiksIG50dChHcmFtbWFyTlQuU0tJUCksICgwLCBwYXJzZXJfMS5zdHIpKCc7JykpKSkpO1xuLy8gdW5pb24gOjogPSBjb25jYXRlbmF0aW9uICgnfCcgY29uY2F0ZW5hdGlvbikqXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlVOSU9OLCAoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULkNPTkNBVEVOQVRJT04pLCAoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5TS0lQKSwgKDAsIHBhcnNlcl8xLnN0cikoJ3wnKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSwgbnR0KEdyYW1tYXJOVC5DT05DQVRFTkFUSU9OKSkpKSk7XG4vLyBjb25jYXRlbmF0aW9uIDo6ID0gcmVwZXRpdGlvbiogXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULkNPTkNBVEVOQVRJT04sICgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULlJFUEVUSVRJT04pLCBudHQoR3JhbW1hck5ULlNLSVApKSkpO1xuLy8gcmVwZXRpdGlvbiA6Oj0gdW5pdCByZXBlYXRPcGVyYXRvcj9cbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuUkVQRVRJVElPTiwgKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5VTklUKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSwgKDAsIHBhcnNlcl8xLm9wdGlvbikobnR0KEdyYW1tYXJOVC5SRVBFQVRPUEVSQVRPUikpKSk7XG4vLyByZXBlYXRPcGVyYXRvciA6Oj0gWyorP10gfCAneycgKCBudW1iZXIgfCByYW5nZSB8IHVwcGVyQm91bmQgfCBsb3dlckJvdW5kICkgJ30nXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlJFUEVBVE9QRVJBVE9SLCAoMCwgcGFyc2VyXzEub3IpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbKis/XVwiKSwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoXCJ7XCIpLCAoMCwgcGFyc2VyXzEub3IpKG50dChHcmFtbWFyTlQuTlVNQkVSKSwgbnR0KEdyYW1tYXJOVC5SQU5HRSksIG50dChHcmFtbWFyTlQuVVBQRVJCT1VORCksIG50dChHcmFtbWFyTlQuTE9XRVJCT1VORCkpLCAoMCwgcGFyc2VyXzEuc3RyKShcIn1cIikpKSk7XG4vLyBudW1iZXIgOjo9IFswLTldK1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5OVU1CRVIsICgwLCBwYXJzZXJfMS5wbHVzKSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiWzAtOV1cIikpKTtcbi8vIHJhbmdlIDo6PSBudW1iZXIgJywnIG51bWJlclxuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5SQU5HRSwgKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5OVU1CRVIpLCAoMCwgcGFyc2VyXzEuc3RyKShcIixcIiksIG50dChHcmFtbWFyTlQuTlVNQkVSKSkpO1xuLy8gdXBwZXJCb3VuZCA6Oj0gJywnIG51bWJlclxuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5VUFBFUkJPVU5ELCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKShcIixcIiksIG50dChHcmFtbWFyTlQuTlVNQkVSKSkpO1xuLy8gbG93ZXJCb3VuZCA6Oj0gbnVtYmVyICcsJ1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5MT1dFUkJPVU5ELCAoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULk5VTUJFUiksICgwLCBwYXJzZXJfMS5zdHIpKFwiLFwiKSkpO1xuLy8gdW5pdCA6Oj0gbm9udGVybWluYWwgfCB0ZXJtaW5hbCB8ICcoJyB1bmlvbiAnKSdcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuVU5JVCwgKDAsIHBhcnNlcl8xLm9yKShudHQoR3JhbW1hck5ULk5PTlRFUk1JTkFMKSwgbnR0KEdyYW1tYXJOVC5URVJNSU5BTCksICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKCcoJyksIG50dChHcmFtbWFyTlQuU0tJUCksIG50dChHcmFtbWFyTlQuVU5JT04pLCBudHQoR3JhbW1hck5ULlNLSVApLCAoMCwgcGFyc2VyXzEuc3RyKSgnKScpKSkpO1xuLy8gbm9udGVybWluYWwgOjo9IFthLXpBLVpfXVthLXpBLVpfMC05XSpcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuTk9OVEVSTUlOQUwsICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbYS16QS1aX11cIiksICgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiW2EtekEtWl8wLTldXCIpKSkpO1xuLy8gdGVybWluYWwgOjo9IHF1b3RlZFN0cmluZyB8IGNoYXJhY3RlclNldCB8IGFueUNoYXIgfCBjaGFyYWN0ZXJDbGFzc1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5URVJNSU5BTCwgKDAsIHBhcnNlcl8xLm9yKShudHQoR3JhbW1hck5ULlFVT1RFRFNUUklORyksIG50dChHcmFtbWFyTlQuQ0hBUkFDVEVSU0VUKSwgbnR0KEdyYW1tYXJOVC5BTllDSEFSKSwgbnR0KEdyYW1tYXJOVC5DSEFSQUNURVJDTEFTUykpKTtcbi8vIHF1b3RlZFN0cmluZyA6Oj0gXCInXCIgKFteJ1xcclxcblxcXFxdIHwgJ1xcXFwnIC4gKSogXCInXCIgfCAnXCInIChbXlwiXFxyXFxuXFxcXF0gfCAnXFxcXCcgLiApKiAnXCInXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlFVT1RFRFNUUklORywgKDAsIHBhcnNlcl8xLm9yKSgoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKShcIidcIiksICgwLCBwYXJzZXJfMS5mYWlsZmFzdCkoKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5vcikoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlteJ1xcclxcblxcXFxcXFxcXVwiKSwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoJ1xcXFwnKSwgKDAsIHBhcnNlcl8xLnJlZ2V4KShcIi5cIikpKSkpLCAoMCwgcGFyc2VyXzEuc3RyKShcIidcIikpLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKSgnXCInKSwgKDAsIHBhcnNlcl8xLmZhaWxmYXN0KSgoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLm9yKSgoMCwgcGFyc2VyXzEucmVnZXgpKCdbXlwiXFxyXFxuXFxcXFxcXFxdJyksICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKCdcXFxcJyksICgwLCBwYXJzZXJfMS5yZWdleCkoXCIuXCIpKSkpKSwgKDAsIHBhcnNlcl8xLnN0cikoJ1wiJykpKSk7XG4vLyBjaGFyYWN0ZXJTZXQgOjo9ICdbJyAoW15cXF1cXHJcXG5cXFxcXSB8ICdcXFxcJyAuICkrICddJ1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5DSEFSQUNURVJTRVQsICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKCdbJyksICgwLCBwYXJzZXJfMS5mYWlsZmFzdCkoKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnBsdXMpKCgwLCBwYXJzZXJfMS5vcikoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlteXFxcXF1cXHJcXG5cXFxcXFxcXF1cIiksICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKCdcXFxcJyksICgwLCBwYXJzZXJfMS5yZWdleCkoXCIuXCIpKSkpKSksICgwLCBwYXJzZXJfMS5zdHIpKCddJykpKTtcbi8vIGFueUNoYXIgOjo9ICcuJ1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5BTllDSEFSLCAoMCwgcGFyc2VyXzEuc3RyKSgnLicpKTtcbi8vIGNoYXJhY3RlckNsYXNzIDo6PSAnXFxcXCcgW2Rzd11cbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuQ0hBUkFDVEVSQ0xBU1MsICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKCdcXFxcJyksICgwLCBwYXJzZXJfMS5mYWlsZmFzdCkoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIltkc3ddXCIpKSkpO1xuLy8gd2hpdGVzcGFjZSA6Oj0gWyBcXHRcXHJcXG5dXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULldISVRFU1BBQ0UsICgwLCBwYXJzZXJfMS5yZWdleCkoXCJbIFxcdFxcclxcbl1cIikpO1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5PTkVMSU5FQ09NTUVOVCwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoXCIvL1wiKSwgKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbXlxcclxcbl1cIikpLCAoMCwgcGFyc2VyXzEub3IpKCgwLCBwYXJzZXJfMS5zdHIpKFwiXFxyXFxuXCIpLCAoMCwgcGFyc2VyXzEuc3RyKSgnXFxuJyksICgwLCBwYXJzZXJfMS5zdHIpKCdcXHInKSkpKTtcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuQkxPQ0tDT01NRU5ULCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKShcIi8qXCIpLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlteKl1cIikpLCAoMCwgcGFyc2VyXzEuc3RyKSgnKicpKSwgKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbXi9dXCIpLCAoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlteKl1cIikpLCAoMCwgcGFyc2VyXzEuc3RyKSgnKicpKSksICgwLCBwYXJzZXJfMS5zdHIpKCcvJykpKTtcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuU0tJUCwgKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5vcikobnR0KEdyYW1tYXJOVC5XSElURVNQQUNFKSwgbnR0KEdyYW1tYXJOVC5PTkVMSU5FQ09NTUVOVCksIG50dChHcmFtbWFyTlQuQkxPQ0tDT01NRU5UKSkpKTtcbmNvbnN0IGdyYW1tYXJQYXJzZXIgPSBuZXcgcGFyc2VyXzEuSW50ZXJuYWxQYXJzZXIoZ3JhbW1hckdyYW1tYXIsIG50dChHcmFtbWFyTlQuR1JBTU1BUiksIChudCkgPT4gR3JhbW1hck5UW250XSk7XG4vKipcbiAqIENvbXBpbGUgYSBQYXJzZXIgZnJvbSBhIGdyYW1tYXIgcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmcuXG4gKiBAcGFyYW0gPE5UPiBhIFR5cGVzY3JpcHQgRW51bSB3aXRoIG9uZSBzeW1ib2wgZm9yIGVhY2ggbm9udGVybWluYWwgdXNlZCBpbiB0aGUgZ3JhbW1hcixcbiAqICAgICAgICBtYXRjaGluZyB0aGUgbm9udGVybWluYWxzIHdoZW4gY29tcGFyZWQgY2FzZS1pbnNlbnNpdGl2ZWx5IChzbyBST09UIGFuZCBSb290IGFuZCByb290IGFyZSB0aGUgc2FtZSkuXG4gKiBAcGFyYW0gZ3JhbW1hciB0aGUgZ3JhbW1hciB0byB1c2VcbiAqIEBwYXJhbSBub250ZXJtaW5hbHMgdGhlIHJ1bnRpbWUgb2JqZWN0IG9mIHRoZSBub250ZXJtaW5hbHMgZW51bS4gRm9yIGV4YW1wbGUsIGlmXG4gKiAgICAgICAgICAgICBlbnVtIE5vbnRlcm1pbmFscyB7IHJvb3QsIGEsIGIsIGMgfTtcbiAqICAgICAgICB0aGVuIE5vbnRlcm1pbmFscyBtdXN0IGJlIGV4cGxpY2l0bHkgcGFzc2VkIGFzIHRoaXMgcnVudGltZSBwYXJhbWV0ZXJcbiAqICAgICAgICAgICAgICBjb21waWxlKGdyYW1tYXIsIE5vbnRlcm1pbmFscywgTm9udGVybWluYWxzLnJvb3QpO1xuICogICAgICAgIChpbiBhZGRpdGlvbiB0byBiZWluZyBpbXBsaWNpdGx5IHVzZWQgZm9yIHRoZSB0eXBlIHBhcmFtZXRlciBOVClcbiAqIEBwYXJhbSByb290Tm9udGVybWluYWwgdGhlIGRlc2lyZWQgcm9vdCBub250ZXJtaW5hbCBpbiB0aGUgZ3JhbW1hclxuICogQHJldHVybiBhIHBhcnNlciBmb3IgdGhlIGdpdmVuIGdyYW1tYXIgdGhhdCB3aWxsIHN0YXJ0IHBhcnNpbmcgYXQgcm9vdE5vbnRlcm1pbmFsLlxuICogQHRocm93cyBQYXJzZUVycm9yIGlmIHRoZSBncmFtbWFyIGhhcyBhIHN5bnRheCBlcnJvclxuICovXG5mdW5jdGlvbiBjb21waWxlKGdyYW1tYXIsIG5vbnRlcm1pbmFscywgcm9vdE5vbnRlcm1pbmFsKSB7XG4gICAgY29uc3QgeyBzdHJpbmdUb05vbnRlcm1pbmFsLCBub250ZXJtaW5hbFRvU3RyaW5nIH0gPSBtYWtlTm9udGVybWluYWxDb252ZXJ0ZXJzKG5vbnRlcm1pbmFscyk7XG4gICAgY29uc3QgZ3JhbW1hclRyZWUgPSAoKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGdyYW1tYXJQYXJzZXIucGFyc2UoZ3JhbW1hcik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IChlIGluc3RhbmNlb2YgdHlwZXNfMS5JbnRlcm5hbFBhcnNlRXJyb3IpID8gbmV3IHR5cGVzXzEuR3JhbW1hckVycm9yKFwiZ3JhbW1hciBkb2Vzbid0IGNvbXBpbGVcIiwgZSkgOiBlO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICBjb25zdCBkZWZpbml0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBub250ZXJtaW5hbHNEZWZpbmVkID0gbmV3IFNldCgpOyAvLyBvbiBsZWZ0aGFuZC1zaWRlIG9mIHNvbWUgcHJvZHVjdGlvblxuICAgIGNvbnN0IG5vbnRlcm1pbmFsc1VzZWQgPSBuZXcgU2V0KCk7IC8vIG9uIHJpZ2h0aGFuZC1zaWRlIG9mIHNvbWUgcHJvZHVjdGlvblxuICAgIC8vIHByb2R1Y3Rpb25zIG91dHNpZGUgQHNraXAgYmxvY2tzXG4gICAgbWFrZVByb2R1Y3Rpb25zKGdyYW1tYXJUcmVlLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5QUk9EVUNUSU9OKSwgbnVsbCk7XG4gICAgLy8gcHJvZHVjdGlvbnMgaW5zaWRlIEBza2lwIGJsb2Nrc1xuICAgIGZvciAoY29uc3Qgc2tpcEJsb2NrIG9mIGdyYW1tYXJUcmVlLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5TS0lQQkxPQ0spKSB7XG4gICAgICAgIG1ha2VTa2lwQmxvY2soc2tpcEJsb2NrKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBudCBvZiBub250ZXJtaW5hbHNVc2VkKSB7XG4gICAgICAgIGlmICghbm9udGVybWluYWxzRGVmaW5lZC5oYXMobnQpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5HcmFtbWFyRXJyb3IoXCJncmFtbWFyIGlzIG1pc3NpbmcgYSBkZWZpbml0aW9uIGZvciBcIiArIG5vbnRlcm1pbmFsVG9TdHJpbmcobnQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW5vbnRlcm1pbmFsc0RlZmluZWQuaGFzKHJvb3ROb250ZXJtaW5hbCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuR3JhbW1hckVycm9yKFwiZ3JhbW1hciBpcyBtaXNzaW5nIGEgZGVmaW5pdGlvbiBmb3IgdGhlIHJvb3Qgbm9udGVybWluYWwgXCIgKyBub250ZXJtaW5hbFRvU3RyaW5nKHJvb3ROb250ZXJtaW5hbCkpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IHBhcnNlcl8xLkludGVybmFsUGFyc2VyKGRlZmluaXRpb25zLCAoMCwgcGFyc2VyXzEubnQpKHJvb3ROb250ZXJtaW5hbCwgbm9udGVybWluYWxUb1N0cmluZyhyb290Tm9udGVybWluYWwpKSwgbm9udGVybWluYWxUb1N0cmluZyk7XG4gICAgZnVuY3Rpb24gbWFrZVByb2R1Y3Rpb25zKHByb2R1Y3Rpb25zLCBza2lwKSB7XG4gICAgICAgIGZvciAoY29uc3QgcHJvZHVjdGlvbiBvZiBwcm9kdWN0aW9ucykge1xuICAgICAgICAgICAgY29uc3Qgbm9udGVybWluYWxOYW1lID0gcHJvZHVjdGlvbi5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuTk9OVEVSTUlOQUwpWzBdLnRleHQ7XG4gICAgICAgICAgICBjb25zdCBub250ZXJtaW5hbCA9IHN0cmluZ1RvTm9udGVybWluYWwobm9udGVybWluYWxOYW1lKTtcbiAgICAgICAgICAgIG5vbnRlcm1pbmFsc0RlZmluZWQuYWRkKG5vbnRlcm1pbmFsKTtcbiAgICAgICAgICAgIGxldCBleHByZXNzaW9uID0gbWFrZUdyYW1tYXJUZXJtKHByb2R1Y3Rpb24uY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULlVOSU9OKVswXSwgc2tpcCk7XG4gICAgICAgICAgICBpZiAoc2tpcClcbiAgICAgICAgICAgICAgICBleHByZXNzaW9uID0gKDAsIHBhcnNlcl8xLmNhdCkoc2tpcCwgZXhwcmVzc2lvbiwgc2tpcCk7XG4gICAgICAgICAgICBpZiAoZGVmaW5pdGlvbnMuaGFzKG5vbnRlcm1pbmFsKSkge1xuICAgICAgICAgICAgICAgIC8vIGdyYW1tYXIgYWxyZWFkeSBoYXMgYSBwcm9kdWN0aW9uIGZvciB0aGlzIG5vbnRlcm1pbmFsOyBvciBleHByZXNzaW9uIG9udG8gaXRcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9ucy5zZXQobm9udGVybWluYWwsICgwLCBwYXJzZXJfMS5vcikoZGVmaW5pdGlvbnMuZ2V0KG5vbnRlcm1pbmFsKSwgZXhwcmVzc2lvbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbnMuc2V0KG5vbnRlcm1pbmFsLCBleHByZXNzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBtYWtlU2tpcEJsb2NrKHNraXBCbG9jaykge1xuICAgICAgICBjb25zdCBub250ZXJtaW5hbE5hbWUgPSBza2lwQmxvY2suY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULk5PTlRFUk1JTkFMKVswXS50ZXh0O1xuICAgICAgICBjb25zdCBub250ZXJtaW5hbCA9IHN0cmluZ1RvTm9udGVybWluYWwobm9udGVybWluYWxOYW1lKTtcbiAgICAgICAgbm9udGVybWluYWxzVXNlZC5hZGQobm9udGVybWluYWwpO1xuICAgICAgICBjb25zdCBza2lwVGVybSA9ICgwLCBwYXJzZXJfMS5za2lwKSgoMCwgcGFyc2VyXzEubnQpKG5vbnRlcm1pbmFsLCBub250ZXJtaW5hbE5hbWUpKTtcbiAgICAgICAgbWFrZVByb2R1Y3Rpb25zKHNraXBCbG9jay5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuUFJPRFVDVElPTiksIHNraXBUZXJtKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbWFrZUdyYW1tYXJUZXJtKHRyZWUsIHNraXApIHtcbiAgICAgICAgc3dpdGNoICh0cmVlLm5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULlVOSU9OOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRleHBycyA9IHRyZWUuY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULkNPTkNBVEVOQVRJT04pLm1hcChjaGlsZCA9PiBtYWtlR3JhbW1hclRlcm0oY2hpbGQsIHNraXApKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRleHBycy5sZW5ndGggPT0gMSA/IGNoaWxkZXhwcnNbMF0gOiAoMCwgcGFyc2VyXzEub3IpKC4uLmNoaWxkZXhwcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuQ09OQ0FURU5BVElPTjoge1xuICAgICAgICAgICAgICAgIGxldCBjaGlsZGV4cHJzID0gdHJlZS5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuUkVQRVRJVElPTikubWFwKGNoaWxkID0+IG1ha2VHcmFtbWFyVGVybShjaGlsZCwgc2tpcCkpO1xuICAgICAgICAgICAgICAgIGlmIChza2lwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGluc2VydCBza2lwIGJldHdlZW4gZWFjaCBwYWlyIG9mIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZHJlbldpdGhTa2lwcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkZXhwcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbldpdGhTa2lwcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuV2l0aFNraXBzLnB1c2goc2tpcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbldpdGhTa2lwcy5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjaGlsZGV4cHJzID0gY2hpbGRyZW5XaXRoU2tpcHM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAoY2hpbGRleHBycy5sZW5ndGggPT0gMSkgPyBjaGlsZGV4cHJzWzBdIDogKDAsIHBhcnNlcl8xLmNhdCkoLi4uY2hpbGRleHBycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5SRVBFVElUSU9OOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdW5pdCA9IG1ha2VHcmFtbWFyVGVybSh0cmVlLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5VTklUKVswXSwgc2tpcCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3AgPSB0cmVlLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5SRVBFQVRPUEVSQVRPUilbMF07XG4gICAgICAgICAgICAgICAgaWYgKCFvcCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5pdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVuaXRXaXRoU2tpcCA9IHNraXAgPyAoMCwgcGFyc2VyXzEuY2F0KSh1bml0LCBza2lwKSA6IHVuaXQ7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ29wIGlzJywgb3ApO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKG9wLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJyonOiByZXR1cm4gKDAsIHBhcnNlcl8xLnN0YXIpKHVuaXRXaXRoU2tpcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcrJzogcmV0dXJuICgwLCBwYXJzZXJfMS5wbHVzKSh1bml0V2l0aFNraXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnPyc6IHJldHVybiAoMCwgcGFyc2VyXzEub3B0aW9uKSh1bml0V2l0aFNraXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9wIGlzIHtuLG19IG9yIG9uZSBvZiBpdHMgdmFyaWFudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByYW5nZSA9IG9wLmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocmFuZ2UubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5OVU1CRVI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG4gPSBwYXJzZUludChyYW5nZS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VyXzEucmVwZWF0KSh1bml0V2l0aFNraXAsIG5ldyBwYXJzZXJfMS5CZXR3ZWVuKG4sIG4pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULlJBTkdFOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gcGFyc2VJbnQocmFuZ2UuY2hpbGRyZW5bMF0udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtID0gcGFyc2VJbnQocmFuZ2UuY2hpbGRyZW5bMV0udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIHBhcnNlcl8xLnJlcGVhdCkodW5pdFdpdGhTa2lwLCBuZXcgcGFyc2VyXzEuQmV0d2VlbihuLCBtKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5VUFBFUkJPVU5EOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtID0gcGFyc2VJbnQocmFuZ2UuY2hpbGRyZW5bMF0udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIHBhcnNlcl8xLnJlcGVhdCkodW5pdFdpdGhTa2lwLCBuZXcgcGFyc2VyXzEuQmV0d2VlbigwLCBtKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5MT1dFUkJPVU5EOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gcGFyc2VJbnQocmFuZ2UuY2hpbGRyZW5bMF0udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIHBhcnNlcl8xLnJlcGVhdCkodW5pdFdpdGhTa2lwLCBuZXcgcGFyc2VyXzEuQXRMZWFzdChuKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnRlcm5hbCBlcnJvcjogdW5rbm93biByYW5nZTogJyArIHJhbmdlLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULlVOSVQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ha2VHcmFtbWFyVGVybSh0cmVlLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5OT05URVJNSU5BTClbMF1cbiAgICAgICAgICAgICAgICAgICAgfHwgdHJlZS5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuVEVSTUlOQUwpWzBdXG4gICAgICAgICAgICAgICAgICAgIHx8IHRyZWUuY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULlVOSU9OKVswXSwgc2tpcCk7XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5OT05URVJNSU5BTDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vbnRlcm1pbmFsID0gc3RyaW5nVG9Ob250ZXJtaW5hbCh0cmVlLnRleHQpO1xuICAgICAgICAgICAgICAgIG5vbnRlcm1pbmFsc1VzZWQuYWRkKG5vbnRlcm1pbmFsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKDAsIHBhcnNlcl8xLm50KShub250ZXJtaW5hbCwgdHJlZS50ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULlRFUk1JTkFMOlxuICAgICAgICAgICAgICAgIHN3aXRjaCAodHJlZS5jaGlsZHJlblswXS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULlFVT1RFRFNUUklORzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoMCwgcGFyc2VyXzEuc3RyKShzdHJpcFF1b3Rlc0FuZFJlcGxhY2VFc2NhcGVTZXF1ZW5jZXModHJlZS50ZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULkNIQVJBQ1RFUlNFVDogLy8gZS5nLiBbYWJjXVxuICAgICAgICAgICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5BTllDSEFSOiAvLyBlLmcuICAuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULkNIQVJBQ1RFUkNMQVNTOiAvLyBlLmcuICBcXGQgIFxccyAgXFx3XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIHBhcnNlcl8xLnJlZ2V4KSh0cmVlLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnRlcm5hbCBlcnJvcjogdW5rbm93biBsaXRlcmFsOiAnICsgdHJlZS5jaGlsZHJlblswXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludGVybmFsIGVycm9yOiB1bmtub3duIGdyYW1tYXIgcnVsZTogJyArIHRyZWUubmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RyaXAgc3RhcnRpbmcgYW5kIGVuZGluZyBxdW90ZXMuXG4gICAgICogUmVwbGFjZSBcXHQsIFxcciwgXFxuIHdpdGggdGhlaXIgY2hhcmFjdGVyIGNvZGVzLlxuICAgICAqIFJlcGxhY2VzIGFsbCBvdGhlciBcXHggd2l0aCBsaXRlcmFsIHguXG4gICAgICovXG4gICAgZnVuY3Rpb24gc3RyaXBRdW90ZXNBbmRSZXBsYWNlRXNjYXBlU2VxdWVuY2VzKHMpIHtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKHNbMF0gPT0gJ1wiJyB8fCBzWzBdID09IFwiJ1wiKTtcbiAgICAgICAgcyA9IHMuc3Vic3RyaW5nKDEsIHMubGVuZ3RoIC0gMSk7XG4gICAgICAgIHMgPSBzLnJlcGxhY2UoL1xcXFwoLikvZywgKG1hdGNoLCBlc2NhcGVkQ2hhcikgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChlc2NhcGVkQ2hhcikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3QnOiByZXR1cm4gJ1xcdCc7XG4gICAgICAgICAgICAgICAgY2FzZSAncic6IHJldHVybiAnXFxyJztcbiAgICAgICAgICAgICAgICBjYXNlICduJzogcmV0dXJuICdcXG4nO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBlc2NhcGVkQ2hhcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cbn1cbmV4cG9ydHMuY29tcGlsZSA9IGNvbXBpbGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21waWxlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuaW5kZW50ID0gZXhwb3J0cy5zbmlwcGV0ID0gZXhwb3J0cy5lc2NhcGVGb3JSZWFkaW5nID0gZXhwb3J0cy50b0NvbHVtbiA9IGV4cG9ydHMudG9MaW5lID0gZXhwb3J0cy5kZXNjcmliZUxvY2F0aW9uID0gZXhwb3J0cy5tYWtlRXJyb3JNZXNzYWdlID0gdm9pZCAwO1xuLyoqXG4gKiBNYWtlIGEgaHVtYW4tcmVhZGFibGUgZXJyb3IgbWVzc2FnZSBleHBsYWluaW5nIGEgcGFyc2UgZXJyb3IgYW5kIHdoZXJlIGl0IHdhcyBmb3VuZCBpbiB0aGUgaW5wdXQuXG4gKiBAcGFyYW0gbWVzc2FnZSBicmllZiBtZXNzYWdlIHN0YXRpbmcgd2hhdCBlcnJvciBvY2N1cnJlZFxuICogQHBhcmFtIG5vbnRlcm1pbmFsTmFtZSBuYW1lIG9mIGRlZXBlc3Qgbm9udGVybWluYWwgdGhhdCBwYXJzZXIgd2FzIHRyeWluZyB0byBtYXRjaCB3aGVuIHBhcnNlIGZhaWxlZFxuICogQHBhcmFtIGV4cGVjdGVkVGV4dCBodW1hbi1yZWFkYWJsZSBkZXNjcmlwdGlvbiBvZiB3aGF0IHN0cmluZyBsaXRlcmFscyB0aGUgcGFyc2VyIHdhcyBleHBlY3RpbmcgdGhlcmU7XG4gKiAgICAgICAgICAgIGUuZy4gXCI7XCIsIFwiWyBcXHJcXG5cXHRdXCIsIFwiMXwyfDNcIlxuICogQHBhcmFtIHN0cmluZ0JlaW5nUGFyc2VkIG9yaWdpbmFsIGlucHV0IHRvIHBhcnNlKClcbiAqIEBwYXJhbSBwb3Mgb2Zmc2V0IGluIHN0cmluZ0JlaW5nUGFyc2VkIHdoZXJlIGVycm9yIG9jY3VycmVkXG4gKiBAcGFyYW0gbmFtZU9mU3RyaW5nQmVpbmdQYXJzZWQgaHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb24gb2Ygd2hlcmUgc3RyaW5nQmVpbmdQYXJzZWQgY2FtZSBmcm9tO1xuICogICAgICAgICAgICAgZS5nLiBcImdyYW1tYXJcIiBpZiBzdHJpbmdCZWluZ1BhcnNlZCB3YXMgdGhlIGlucHV0IHRvIFBhcnNlci5jb21waWxlKCksXG4gKiAgICAgICAgICAgICBvciBcInN0cmluZyBiZWluZyBwYXJzZWRcIiBpZiBzdHJpbmdCZWluZ1BhcnNlZCB3YXMgdGhlIGlucHV0IHRvIFBhcnNlci5wYXJzZSgpXG4gKiBAcmV0dXJuIGEgbXVsdGlsaW5lIGh1bWFuLXJlYWRhYmxlIG1lc3NhZ2UgdGhhdCBzdGF0ZXMgdGhlIGVycm9yLCBpdHMgbG9jYXRpb24gaW4gdGhlIGlucHV0LFxuICogICAgICAgICB3aGF0IHRleHQgd2FzIGV4cGVjdGVkIGFuZCB3aGF0IHRleHQgd2FzIGFjdHVhbGx5IGZvdW5kLlxuICovXG5mdW5jdGlvbiBtYWtlRXJyb3JNZXNzYWdlKG1lc3NhZ2UsIG5vbnRlcm1pbmFsTmFtZSwgZXhwZWN0ZWRUZXh0LCBzdHJpbmdCZWluZ1BhcnNlZCwgcG9zLCBuYW1lT2ZTdHJpbmdCZWluZ1BhcnNlZCkge1xuICAgIGxldCByZXN1bHQgPSBtZXNzYWdlO1xuICAgIGlmIChyZXN1bHQubGVuZ3RoID4gMClcbiAgICAgICAgcmVzdWx0ICs9IFwiXFxuXCI7XG4gICAgcmVzdWx0ICs9XG4gICAgICAgIFwiRXJyb3IgYXQgXCIgKyBkZXNjcmliZUxvY2F0aW9uKHN0cmluZ0JlaW5nUGFyc2VkLCBwb3MpICsgXCIgb2YgXCIgKyBuYW1lT2ZTdHJpbmdCZWluZ1BhcnNlZCArIFwiXFxuXCJcbiAgICAgICAgICAgICsgXCIgIHRyeWluZyB0byBtYXRjaCBcIiArIG5vbnRlcm1pbmFsTmFtZS50b1VwcGVyQ2FzZSgpICsgXCJcXG5cIlxuICAgICAgICAgICAgKyBcIiAgZXhwZWN0ZWQgXCIgKyBlc2NhcGVGb3JSZWFkaW5nKGV4cGVjdGVkVGV4dCwgXCJcIilcbiAgICAgICAgICAgICsgKChzdHJpbmdCZWluZ1BhcnNlZC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgID8gXCJcXG4gICBidXQgc2F3IFwiICsgc25pcHBldChzdHJpbmdCZWluZ1BhcnNlZCwgcG9zKVxuICAgICAgICAgICAgICAgIDogXCJcIik7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmV4cG9ydHMubWFrZUVycm9yTWVzc2FnZSA9IG1ha2VFcnJvck1lc3NhZ2U7XG4vKipcbiAqIEBwYXJhbSBzdHJpbmcgdG8gZGVzY3JpYmVcbiAqIEBwYXJhbSBwb3Mgb2Zmc2V0IGluIHN0cmluZywgMDw9cG9zPHN0cmluZy5sZW5ndGgoKVxuICogQHJldHVybiBhIGh1bWFuLXJlYWRhYmxlIGRlc2NyaXB0aW9uIG9mIHRoZSBsb2NhdGlvbiBvZiB0aGUgY2hhcmFjdGVyIGF0IG9mZnNldCBwb3MgaW4gc3RyaW5nXG4gKiAodXNpbmcgb2Zmc2V0IGFuZC9vciBsaW5lL2NvbHVtbiBpZiBhcHByb3ByaWF0ZSlcbiAqL1xuZnVuY3Rpb24gZGVzY3JpYmVMb2NhdGlvbihzLCBwb3MpIHtcbiAgICBsZXQgcmVzdWx0ID0gXCJvZmZzZXQgXCIgKyBwb3M7XG4gICAgaWYgKHMuaW5kZXhPZignXFxuJykgIT0gLTEpIHtcbiAgICAgICAgcmVzdWx0ICs9IFwiIChsaW5lIFwiICsgdG9MaW5lKHMsIHBvcykgKyBcIiBjb2x1bW4gXCIgKyB0b0NvbHVtbihzLCBwb3MpICsgXCIpXCI7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnRzLmRlc2NyaWJlTG9jYXRpb24gPSBkZXNjcmliZUxvY2F0aW9uO1xuLyoqXG4gKiBUcmFuc2xhdGVzIGEgc3RyaW5nIG9mZnNldCBpbnRvIGEgbGluZSBudW1iZXIuXG4gKiBAcGFyYW0gc3RyaW5nIGluIHdoaWNoIG9mZnNldCBvY2N1cnNcbiAqIEBwYXJhbSBwb3Mgb2Zmc2V0IGluIHN0cmluZywgMDw9cG9zPHN0cmluZy5sZW5ndGgoKVxuICogQHJldHVybiB0aGUgMS1iYXNlZCBsaW5lIG51bWJlciBvZiB0aGUgY2hhcmFjdGVyIGF0IG9mZnNldCBwb3MgaW4gc3RyaW5nLFxuICogYXMgaWYgc3RyaW5nIHdlcmUgYmVpbmcgdmlld2VkIGluIGEgdGV4dCBlZGl0b3JcbiAqL1xuZnVuY3Rpb24gdG9MaW5lKHMsIHBvcykge1xuICAgIGxldCBsaW5lQ291bnQgPSAxO1xuICAgIGZvciAobGV0IG5ld2xpbmUgPSBzLmluZGV4T2YoJ1xcbicpOyBuZXdsaW5lICE9IC0xICYmIG5ld2xpbmUgPCBwb3M7IG5ld2xpbmUgPSBzLmluZGV4T2YoJ1xcbicsIG5ld2xpbmUgKyAxKSkge1xuICAgICAgICArK2xpbmVDb3VudDtcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVDb3VudDtcbn1cbmV4cG9ydHMudG9MaW5lID0gdG9MaW5lO1xuLyoqXG4gKiBUcmFuc2xhdGVzIGEgc3RyaW5nIG9mZnNldCBpbnRvIGEgY29sdW1uIG51bWJlci5cbiAqIEBwYXJhbSBzdHJpbmcgaW4gd2hpY2ggb2Zmc2V0IG9jY3Vyc1xuICogQHBhcmFtIHBvcyBvZmZzZXQgaW4gc3RyaW5nLCAwPD1wb3M8c3RyaW5nLmxlbmd0aCgpXG4gKiBAcmV0dXJuIHRoZSAxLWJhc2VkIGNvbHVtbiBudW1iZXIgb2YgdGhlIGNoYXJhY3RlciBhdCBvZmZzZXQgcG9zIGluIHN0cmluZyxcbiAqIGFzIGlmIHN0cmluZyB3ZXJlIGJlaW5nIHZpZXdlZCBpbiBhIHRleHQgZWRpdG9yIHdpdGggdGFiIHNpemUgMSAoaS5lLiBhIHRhYiBpcyB0cmVhdGVkIGxpa2UgYSBzcGFjZSlcbiAqL1xuZnVuY3Rpb24gdG9Db2x1bW4ocywgcG9zKSB7XG4gICAgY29uc3QgbGFzdE5ld2xpbmVCZWZvcmVQb3MgPSBzLmxhc3RJbmRleE9mKCdcXG4nLCBwb3MgLSAxKTtcbiAgICBjb25zdCB0b3RhbFNpemVPZlByZWNlZGluZ0xpbmVzID0gKGxhc3ROZXdsaW5lQmVmb3JlUG9zICE9IC0xKSA/IGxhc3ROZXdsaW5lQmVmb3JlUG9zICsgMSA6IDA7XG4gICAgcmV0dXJuIHBvcyAtIHRvdGFsU2l6ZU9mUHJlY2VkaW5nTGluZXMgKyAxO1xufVxuZXhwb3J0cy50b0NvbHVtbiA9IHRvQ29sdW1uO1xuLyoqXG4qIFJlcGxhY2UgY29tbW9uIHVucHJpbnRhYmxlIGNoYXJhY3RlcnMgYnkgdGhlaXIgZXNjYXBlIGNvZGVzLCBmb3IgaHVtYW4gcmVhZGluZy5cbiogU2hvdWxkIGJlIGlkZW1wb3RlbnQsIGkuZS4gaWYgeCA9IGVzY2FwZUZvclJlYWRpbmcoeSksIHRoZW4geC5lcXVhbHMoZXNjYXBlRm9yUmVhZGluZyh4KSkuXG4qIEBwYXJhbSBzdHJpbmcgdG8gZXNjYXBlXG4qIEBwYXJhbSBxdW90ZSBxdW90ZXMgdG8gcHV0IGFyb3VuZCBzdHJpbmcsIG9yIFwiXCIgaWYgbm8gcXVvdGVzIHJlcXVpcmVkXG4qIEByZXR1cm4gc3RyaW5nIHdpdGggZXNjYXBlIGNvZGVzIHJlcGxhY2VkLCBwcmVjZWRlZCBhbmQgZm9sbG93ZWQgYnkgcXVvdGUsIHdpdGggYSBodW1hbi1yZWFkYWJsZSBsZWdlbmQgYXBwZW5kZWQgdG8gdGhlIGVuZFxuKiAgICAgICAgIGV4cGxhaW5pbmcgd2hhdCB0aGUgcmVwbGFjZW1lbnQgY2hhcmFjdGVycyBtZWFuLlxuKi9cbmZ1bmN0aW9uIGVzY2FwZUZvclJlYWRpbmcocywgcXVvdGUpIHtcbiAgICBsZXQgcmVzdWx0ID0gcztcbiAgICBjb25zdCBsZWdlbmQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHsgdW5wcmludGFibGVDaGFyLCBodW1hblJlYWRhYmxlVmVyc2lvbiwgZGVzY3JpcHRpb24gfSBvZiBFU0NBUEVTKSB7XG4gICAgICAgIGlmIChyZXN1bHQuaW5jbHVkZXModW5wcmludGFibGVDaGFyKSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UodW5wcmludGFibGVDaGFyLCBodW1hblJlYWRhYmxlVmVyc2lvbik7XG4gICAgICAgICAgICBsZWdlbmQucHVzaChodW1hblJlYWRhYmxlVmVyc2lvbiArIFwiIG1lYW5zIFwiICsgZGVzY3JpcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlc3VsdCA9IHF1b3RlICsgcmVzdWx0ICsgcXVvdGU7XG4gICAgaWYgKGxlZ2VuZC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlc3VsdCArPSBcIiAod2hlcmUgXCIgKyBsZWdlbmQuam9pbihcIiwgXCIpICsgXCIpXCI7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnRzLmVzY2FwZUZvclJlYWRpbmcgPSBlc2NhcGVGb3JSZWFkaW5nO1xuY29uc3QgRVNDQVBFUyA9IFtcbiAgICB7XG4gICAgICAgIHVucHJpbnRhYmxlQ2hhcjogXCJcXG5cIixcbiAgICAgICAgaHVtYW5SZWFkYWJsZVZlcnNpb246IFwiXFx1MjQyNFwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJuZXdsaW5lXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgdW5wcmludGFibGVDaGFyOiBcIlxcclwiLFxuICAgICAgICBodW1hblJlYWRhYmxlVmVyc2lvbjogXCJcXHUyNDBEXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcImNhcnJpYWdlIHJldHVyblwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHVucHJpbnRhYmxlQ2hhcjogXCJcXHRcIixcbiAgICAgICAgaHVtYW5SZWFkYWJsZVZlcnNpb246IFwiXFx1MjFFNVwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJ0YWJcIlxuICAgIH0sXG5dO1xuLyoqXG4gKiBAcGFyYW0gc3RyaW5nIHRvIHNob3J0ZW5cbiAqIEBwYXJhbSBwb3Mgb2Zmc2V0IGluIHN0cmluZywgMDw9cG9zPHN0cmluZy5sZW5ndGgoKVxuICogQHJldHVybiBhIHNob3J0IHNuaXBwZXQgb2YgdGhlIHBhcnQgb2Ygc3RyaW5nIHN0YXJ0aW5nIGF0IG9mZnNldCBwb3MsXG4gKiBpbiBodW1hbi1yZWFkYWJsZSBmb3JtXG4gKi9cbmZ1bmN0aW9uIHNuaXBwZXQocywgcG9zKSB7XG4gICAgY29uc3QgbWF4Q2hhcnNUb1Nob3cgPSAxMDtcbiAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihwb3MgKyBtYXhDaGFyc1RvU2hvdywgcy5sZW5ndGgpO1xuICAgIGxldCByZXN1bHQgPSBzLnN1YnN0cmluZyhwb3MsIGVuZCkgKyAoZW5kIDwgcy5sZW5ndGggPyBcIi4uLlwiIDogXCJcIik7XG4gICAgaWYgKHJlc3VsdC5sZW5ndGggPT0gMClcbiAgICAgICAgcmVzdWx0ID0gXCJlbmQgb2Ygc3RyaW5nXCI7XG4gICAgcmV0dXJuIGVzY2FwZUZvclJlYWRpbmcocmVzdWx0LCBcIlwiKTtcbn1cbmV4cG9ydHMuc25pcHBldCA9IHNuaXBwZXQ7XG4vKipcbiAqIEluZGVudCBhIG11bHRpLWxpbmUgc3RyaW5nIGJ5IHByZWNlZGluZyBlYWNoIGxpbmUgd2l0aCBwcmVmaXguXG4gKiBAcGFyYW0gc3RyaW5nIHN0cmluZyB0byBpbmRlbnRcbiAqIEBwYXJhbSBwcmVmaXggcHJlZml4IHRvIHVzZSBmb3IgaW5kZW50aW5nXG4gKiBAcmV0dXJuIHN0cmluZyB3aXRoIHByZWZpeCBpbnNlcnRlZCBhdCB0aGUgc3RhcnQgb2YgZWFjaCBsaW5lXG4gKi9cbmZ1bmN0aW9uIGluZGVudChzLCBwcmVmaXgpIHtcbiAgICBsZXQgcmVzdWx0ID0gXCJcIjtcbiAgICBsZXQgY2hhcnNDb3BpZWQgPSAwO1xuICAgIGRvIHtcbiAgICAgICAgY29uc3QgbmV3bGluZSA9IHMuaW5kZXhPZignXFxuJywgY2hhcnNDb3BpZWQpO1xuICAgICAgICBjb25zdCBlbmRPZkxpbmUgPSBuZXdsaW5lICE9IC0xID8gbmV3bGluZSArIDEgOiBzLmxlbmd0aDtcbiAgICAgICAgcmVzdWx0ICs9IHByZWZpeCArIHMuc3Vic3RyaW5nKGNoYXJzQ29waWVkLCBlbmRPZkxpbmUpO1xuICAgICAgICBjaGFyc0NvcGllZCA9IGVuZE9mTGluZTtcbiAgICB9IHdoaWxlIChjaGFyc0NvcGllZCA8IHMubGVuZ3RoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0cy5pbmRlbnQgPSBpbmRlbnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXNwbGF5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5QYXJzZXJTdGF0ZSA9IGV4cG9ydHMuRmFpbGVkUGFyc2UgPSBleHBvcnRzLlN1Y2Nlc3NmdWxQYXJzZSA9IGV4cG9ydHMuSW50ZXJuYWxQYXJzZXIgPSBleHBvcnRzLmZhaWxmYXN0ID0gZXhwb3J0cy5za2lwID0gZXhwb3J0cy5vcHRpb24gPSBleHBvcnRzLnBsdXMgPSBleHBvcnRzLnN0YXIgPSBleHBvcnRzLnJlcGVhdCA9IGV4cG9ydHMuWkVST19PUl9PTkUgPSBleHBvcnRzLk9ORV9PUl9NT1JFID0gZXhwb3J0cy5aRVJPX09SX01PUkUgPSBleHBvcnRzLkJldHdlZW4gPSBleHBvcnRzLkF0TGVhc3QgPSBleHBvcnRzLm9yID0gZXhwb3J0cy5jYXQgPSBleHBvcnRzLnN0ciA9IGV4cG9ydHMucmVnZXggPSBleHBvcnRzLm50ID0gdm9pZCAwO1xuY29uc3QgYXNzZXJ0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImFzc2VydFwiKSk7XG5jb25zdCB0eXBlc18xID0gcmVxdWlyZShcIi4vdHlwZXNcIik7XG5jb25zdCBwYXJzZXRyZWVfMSA9IHJlcXVpcmUoXCIuL3BhcnNldHJlZVwiKTtcbmZ1bmN0aW9uIG50KG5vbnRlcm1pbmFsLCBub250ZXJtaW5hbE5hbWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgZ3QgPSBkZWZpbml0aW9ucy5nZXQobm9udGVybWluYWwpO1xuICAgICAgICAgICAgaWYgKGd0ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuR3JhbW1hckVycm9yKFwibm9udGVybWluYWwgaGFzIG5vIGRlZmluaXRpb246IFwiICsgbm9udGVybWluYWxOYW1lKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoXCJlbnRlcmluZ1wiLCBub250ZXJtaW5hbE5hbWUpO1xuICAgICAgICAgICAgc3RhdGUuZW50ZXIocG9zLCBub250ZXJtaW5hbCk7XG4gICAgICAgICAgICBsZXQgcHIgPSBndC5wYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSk7XG4gICAgICAgICAgICBzdGF0ZS5sZWF2ZShub250ZXJtaW5hbCk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKFwibGVhdmluZ1wiLCBub250ZXJtaW5hbE5hbWUsIFwid2l0aCByZXN1bHRcIiwgcHIpO1xuICAgICAgICAgICAgaWYgKCFwci5mYWlsZWQgJiYgIXN0YXRlLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyZWUgPSBwci50cmVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RyZWUgPSBzdGF0ZS5tYWtlUGFyc2VUcmVlKHRyZWUuc3RhcnQsIHRyZWUudGV4dCwgW3RyZWVdKTtcbiAgICAgICAgICAgICAgICBwciA9IHByLnJlcGxhY2VUcmVlKG5ld1RyZWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBub250ZXJtaW5hbE5hbWU7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5udCA9IG50O1xuZnVuY3Rpb24gcmVnZXgocmVnZXhTb3VyY2UpIHtcbiAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKCdeJyArIHJlZ2V4U291cmNlICsgJyQnLCAncycpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKSB7XG4gICAgICAgICAgICBpZiAocG9zID49IHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlLm1ha2VGYWlsZWRQYXJzZShwb3MsIHJlZ2V4U291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGwgPSBzLnN1YnN0cmluZyhwb3MsIHBvcyArIDEpO1xuICAgICAgICAgICAgaWYgKHJlZ2V4LnRlc3QobCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUubWFrZVN1Y2Nlc3NmdWxQYXJzZShwb3MsIHBvcyArIDEsIGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlLm1ha2VGYWlsZWRQYXJzZShwb3MsIHJlZ2V4U291cmNlKTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVnZXhTb3VyY2U7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5yZWdleCA9IHJlZ2V4O1xuZnVuY3Rpb24gc3RyKHN0cikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdwb3MgPSBwb3MgKyBzdHIubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKG5ld3BvcyA+IHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlLm1ha2VGYWlsZWRQYXJzZShwb3MsIHN0cik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsID0gcy5zdWJzdHJpbmcocG9zLCBuZXdwb3MpO1xuICAgICAgICAgICAgaWYgKGwgPT09IHN0cikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZS5tYWtlU3VjY2Vzc2Z1bFBhcnNlKHBvcywgbmV3cG9zLCBsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5tYWtlRmFpbGVkUGFyc2UocG9zLCBzdHIpO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBcIidcIiArIHN0ci5yZXBsYWNlKC8nXFxyXFxuXFx0XFxcXC8sIFwiXFxcXCQmXCIpICsgXCInXCI7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5zdHIgPSBzdHI7XG5mdW5jdGlvbiBjYXQoLi4udGVybXMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSkge1xuICAgICAgICAgICAgbGV0IHByb3V0ID0gc3RhdGUubWFrZVN1Y2Nlc3NmdWxQYXJzZShwb3MsIHBvcyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGd0IG9mIHRlcm1zKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHIgPSBndC5wYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHByLmZhaWxlZClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByO1xuICAgICAgICAgICAgICAgIHBvcyA9IHByLnBvcztcbiAgICAgICAgICAgICAgICBwcm91dCA9IHByb3V0Lm1lcmdlUmVzdWx0KHByKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm91dDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gXCIoXCIgKyB0ZXJtcy5tYXAodGVybSA9PiB0ZXJtLnRvU3RyaW5nKCkpLmpvaW4oXCIgXCIpICsgXCIpXCI7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5jYXQgPSBjYXQ7XG4vKipcbiAqIEBwYXJhbSBjaG9pY2VzIG11c3QgYmUgbm9uZW1wdHlcbiAqL1xuZnVuY3Rpb24gb3IoLi4uY2hvaWNlcykge1xuICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShjaG9pY2VzLmxlbmd0aCA+IDApO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKSB7XG4gICAgICAgICAgICBjb25zdCBzdWNjZXNzZXMgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGZhaWx1cmVzID0gW107XG4gICAgICAgICAgICBjaG9pY2VzLmZvckVhY2goKGNob2ljZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNob2ljZS5wYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5mYWlsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2VzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvbmdlc3RTdWNjZXNzZXMgPSBsb25nZXN0UmVzdWx0cyhzdWNjZXNzZXMpO1xuICAgICAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShsb25nZXN0U3VjY2Vzc2VzLmxlbmd0aCA+IDApO1xuICAgICAgICAgICAgICAgIHJldHVybiBsb25nZXN0U3VjY2Vzc2VzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9uZ2VzdEZhaWx1cmVzID0gbG9uZ2VzdFJlc3VsdHMoZmFpbHVyZXMpO1xuICAgICAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGxvbmdlc3RGYWlsdXJlcy5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5tYWtlRmFpbGVkUGFyc2UobG9uZ2VzdEZhaWx1cmVzWzBdLnBvcywgbG9uZ2VzdEZhaWx1cmVzLm1hcCgocmVzdWx0KSA9PiByZXN1bHQuZXhwZWN0ZWRUZXh0KS5qb2luKFwifFwiKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiKFwiICsgY2hvaWNlcy5tYXAoY2hvaWNlID0+IGNob2ljZS50b1N0cmluZygpKS5qb2luKFwifFwiKSArIFwiKVwiO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMub3IgPSBvcjtcbmNsYXNzIEF0TGVhc3Qge1xuICAgIGNvbnN0cnVjdG9yKG1pbikge1xuICAgICAgICB0aGlzLm1pbiA9IG1pbjtcbiAgICB9XG4gICAgdG9vTG93KG4pIHsgcmV0dXJuIG4gPCB0aGlzLm1pbjsgfVxuICAgIHRvb0hpZ2gobikgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLm1pbikge1xuICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gXCIqXCI7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBcIitcIjtcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBcIntcIiArIHRoaXMubWluICsgXCIsfVwiO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5BdExlYXN0ID0gQXRMZWFzdDtcbmNsYXNzIEJldHdlZW4ge1xuICAgIGNvbnN0cnVjdG9yKG1pbiwgbWF4KSB7XG4gICAgICAgIHRoaXMubWluID0gbWluO1xuICAgICAgICB0aGlzLm1heCA9IG1heDtcbiAgICB9XG4gICAgdG9vTG93KG4pIHsgcmV0dXJuIG4gPCB0aGlzLm1pbjsgfVxuICAgIHRvb0hpZ2gobikgeyByZXR1cm4gbiA+IHRoaXMubWF4OyB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGlmICh0aGlzLm1pbiA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gKHRoaXMubWF4ID09IDEpID8gXCI/XCIgOiBcInssXCIgKyB0aGlzLm1heCArIFwifVwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFwie1wiICsgdGhpcy5taW4gKyBcIixcIiArIHRoaXMubWF4ICsgXCJ9XCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLkJldHdlZW4gPSBCZXR3ZWVuO1xuZXhwb3J0cy5aRVJPX09SX01PUkUgPSBuZXcgQXRMZWFzdCgwKTtcbmV4cG9ydHMuT05FX09SX01PUkUgPSBuZXcgQXRMZWFzdCgxKTtcbmV4cG9ydHMuWkVST19PUl9PTkUgPSBuZXcgQmV0d2VlbigwLCAxKTtcbmZ1bmN0aW9uIHJlcGVhdChndCwgaG93bWFueSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKSB7XG4gICAgICAgICAgICBsZXQgcHJvdXQgPSBzdGF0ZS5tYWtlU3VjY2Vzc2Z1bFBhcnNlKHBvcywgcG9zKTtcbiAgICAgICAgICAgIGZvciAobGV0IHRpbWVzTWF0Y2hlZCA9IDA7IGhvd21hbnkudG9vTG93KHRpbWVzTWF0Y2hlZCkgfHwgIWhvd21hbnkudG9vSGlnaCh0aW1lc01hdGNoZWQgKyAxKTsgKyt0aW1lc01hdGNoZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwciA9IGd0LnBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKTtcbiAgICAgICAgICAgICAgICBpZiAocHIuZmFpbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgIGlmIChob3dtYW55LnRvb0xvdyh0aW1lc01hdGNoZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3V0LmFkZExhc3RGYWlsdXJlKHByKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwci5wb3MgPT0gcG9zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaGVkIHRoZSBlbXB0eSBzdHJpbmcsIGFuZCB3ZSBhbHJlYWR5IGhhdmUgZW5vdWdoLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgbWF5IGdldCBpbnRvIGFuIGluZmluaXRlIGxvb3AgaWYgaG93bWFueS50b29IaWdoKCkgbmV2ZXIgcmV0dXJucyBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvIHJldHVybiBzdWNjZXNzZnVsIG1hdGNoIGF0IHRoaXMgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm91dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgYWR2YW5jZSB0aGUgcG9zaXRpb24gYW5kIG1lcmdlIHByIGludG8gcHJvdXRcbiAgICAgICAgICAgICAgICAgICAgcG9zID0gcHIucG9zO1xuICAgICAgICAgICAgICAgICAgICBwcm91dCA9IHByb3V0Lm1lcmdlUmVzdWx0KHByKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvdXQ7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIGd0LnRvU3RyaW5nKCkgKyBob3dtYW55LnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5yZXBlYXQgPSByZXBlYXQ7XG5mdW5jdGlvbiBzdGFyKGd0KSB7XG4gICAgcmV0dXJuIHJlcGVhdChndCwgZXhwb3J0cy5aRVJPX09SX01PUkUpO1xufVxuZXhwb3J0cy5zdGFyID0gc3RhcjtcbmZ1bmN0aW9uIHBsdXMoZ3QpIHtcbiAgICByZXR1cm4gcmVwZWF0KGd0LCBleHBvcnRzLk9ORV9PUl9NT1JFKTtcbn1cbmV4cG9ydHMucGx1cyA9IHBsdXM7XG5mdW5jdGlvbiBvcHRpb24oZ3QpIHtcbiAgICByZXR1cm4gcmVwZWF0KGd0LCBleHBvcnRzLlpFUk9fT1JfT05FKTtcbn1cbmV4cG9ydHMub3B0aW9uID0gb3B0aW9uO1xuZnVuY3Rpb24gc2tpcChub250ZXJtaW5hbCkge1xuICAgIGNvbnN0IHJlcGV0aXRpb24gPSBzdGFyKG5vbnRlcm1pbmFsKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSkge1xuICAgICAgICAgICAgc3RhdGUuZW50ZXJTa2lwKCk7XG4gICAgICAgICAgICBsZXQgcHIgPSByZXBldGl0aW9uLnBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKTtcbiAgICAgICAgICAgIHN0YXRlLmxlYXZlU2tpcCgpO1xuICAgICAgICAgICAgaWYgKHByLmZhaWxlZCkge1xuICAgICAgICAgICAgICAgIC8vIHN1Y2NlZWQgYW55d2F5XG4gICAgICAgICAgICAgICAgcHIgPSBzdGF0ZS5tYWtlU3VjY2Vzc2Z1bFBhcnNlKHBvcywgcG9zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcjtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gXCIoPzxza2lwPlwiICsgcmVwZXRpdGlvbiArIFwiKVwiO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMuc2tpcCA9IHNraXA7XG5mdW5jdGlvbiBmYWlsZmFzdChndCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBhcnNlKHMsIHBvcywgZGVmaW5pdGlvbnMsIHN0YXRlKSB7XG4gICAgICAgICAgICBsZXQgcHIgPSBndC5wYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSk7XG4gICAgICAgICAgICBpZiAocHIuZmFpbGVkKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyB0eXBlc18xLkludGVybmFsUGFyc2VFcnJvcihcIlwiLCBwci5ub250ZXJtaW5hbE5hbWUsIHByLmV4cGVjdGVkVGV4dCwgXCJcIiwgcHIucG9zKTtcbiAgICAgICAgICAgIHJldHVybiBwcjtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ZhaWxmYXN0KCcgKyBndCArICcpJztcbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLmZhaWxmYXN0ID0gZmFpbGZhc3Q7XG5jbGFzcyBJbnRlcm5hbFBhcnNlciB7XG4gICAgY29uc3RydWN0b3IoZGVmaW5pdGlvbnMsIHN0YXJ0LCBub250ZXJtaW5hbFRvU3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZGVmaW5pdGlvbnMgPSBkZWZpbml0aW9ucztcbiAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgICAgICB0aGlzLm5vbnRlcm1pbmFsVG9TdHJpbmcgPSBub250ZXJtaW5hbFRvU3RyaW5nO1xuICAgICAgICB0aGlzLmNoZWNrUmVwKCk7XG4gICAgfVxuICAgIGNoZWNrUmVwKCkge1xuICAgIH1cbiAgICBwYXJzZSh0ZXh0VG9QYXJzZSkge1xuICAgICAgICBsZXQgcHIgPSAoKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydC5wYXJzZSh0ZXh0VG9QYXJzZSwgMCwgdGhpcy5kZWZpbml0aW9ucywgbmV3IFBhcnNlclN0YXRlKHRoaXMubm9udGVybWluYWxUb1N0cmluZykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIHR5cGVzXzEuSW50ZXJuYWxQYXJzZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJldGhyb3cgdGhlIGV4Y2VwdGlvbiwgYXVnbWVudGVkIGJ5IHRoZSBvcmlnaW5hbCB0ZXh0LCBzbyB0aGF0IHRoZSBlcnJvciBtZXNzYWdlIGlzIGJldHRlclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5JbnRlcm5hbFBhcnNlRXJyb3IoXCJzdHJpbmcgZG9lcyBub3QgbWF0Y2ggZ3JhbW1hclwiLCBlLm5vbnRlcm1pbmFsTmFtZSwgZS5leHBlY3RlZFRleHQsIHRleHRUb1BhcnNlLCBlLnBvcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkoKTtcbiAgICAgICAgaWYgKHByLmZhaWxlZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuSW50ZXJuYWxQYXJzZUVycm9yKFwic3RyaW5nIGRvZXMgbm90IG1hdGNoIGdyYW1tYXJcIiwgcHIubm9udGVybWluYWxOYW1lLCBwci5leHBlY3RlZFRleHQsIHRleHRUb1BhcnNlLCBwci5wb3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwci5wb3MgPCB0ZXh0VG9QYXJzZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBcIm9ubHkgcGFydCBvZiB0aGUgc3RyaW5nIG1hdGNoZXMgdGhlIGdyYW1tYXI7IHRoZSByZXN0IGRpZCBub3QgcGFyc2VcIjtcbiAgICAgICAgICAgIHRocm93IChwci5sYXN0RmFpbHVyZVxuICAgICAgICAgICAgICAgID8gbmV3IHR5cGVzXzEuSW50ZXJuYWxQYXJzZUVycm9yKG1lc3NhZ2UsIHByLmxhc3RGYWlsdXJlLm5vbnRlcm1pbmFsTmFtZSwgcHIubGFzdEZhaWx1cmUuZXhwZWN0ZWRUZXh0LCB0ZXh0VG9QYXJzZSwgcHIubGFzdEZhaWx1cmUucG9zKVxuICAgICAgICAgICAgICAgIDogbmV3IHR5cGVzXzEuSW50ZXJuYWxQYXJzZUVycm9yKG1lc3NhZ2UsIHRoaXMuc3RhcnQudG9TdHJpbmcoKSwgXCJlbmQgb2Ygc3RyaW5nXCIsIHRleHRUb1BhcnNlLCBwci5wb3MpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHIudHJlZTtcbiAgICB9XG4gICAgO1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmRlZmluaXRpb25zLCAoW25vbnRlcm1pbmFsLCBydWxlXSkgPT4gdGhpcy5ub250ZXJtaW5hbFRvU3RyaW5nKG5vbnRlcm1pbmFsKSArICc6Oj0nICsgcnVsZSArICc7Jykuam9pbihcIlxcblwiKTtcbiAgICB9XG59XG5leHBvcnRzLkludGVybmFsUGFyc2VyID0gSW50ZXJuYWxQYXJzZXI7XG5jbGFzcyBTdWNjZXNzZnVsUGFyc2Uge1xuICAgIGNvbnN0cnVjdG9yKHBvcywgdHJlZSwgbGFzdEZhaWx1cmUpIHtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMudHJlZSA9IHRyZWU7XG4gICAgICAgIHRoaXMubGFzdEZhaWx1cmUgPSBsYXN0RmFpbHVyZTtcbiAgICAgICAgdGhpcy5mYWlsZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcmVwbGFjZVRyZWUodHJlZSkge1xuICAgICAgICByZXR1cm4gbmV3IFN1Y2Nlc3NmdWxQYXJzZSh0aGlzLnBvcywgdHJlZSwgdGhpcy5sYXN0RmFpbHVyZSk7XG4gICAgfVxuICAgIG1lcmdlUmVzdWx0KHRoYXQpIHtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKCF0aGF0LmZhaWxlZCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ21lcmdpbmcnLCB0aGlzLCAnd2l0aCcsIHRoYXQpO1xuICAgICAgICByZXR1cm4gbmV3IFN1Y2Nlc3NmdWxQYXJzZSh0aGF0LnBvcywgdGhpcy50cmVlLmNvbmNhdCh0aGF0LnRyZWUpLCBsYXRlclJlc3VsdCh0aGlzLmxhc3RGYWlsdXJlLCB0aGF0Lmxhc3RGYWlsdXJlKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEtlZXAgdHJhY2sgb2YgYSBmYWlsaW5nIHBhcnNlIHJlc3VsdCB0aGF0IHByZXZlbnRlZCB0aGlzIHRyZWUgZnJvbSBtYXRjaGluZyBtb3JlIG9mIHRoZSBpbnB1dCBzdHJpbmcuXG4gICAgICogVGhpcyBkZWVwZXIgZmFpbHVyZSBpcyB1c3VhbGx5IG1vcmUgaW5mb3JtYXRpdmUgdG8gdGhlIHVzZXIsIHNvIHdlJ2xsIGRpc3BsYXkgaXQgaW4gdGhlIGVycm9yIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIG5ld0xhc3RGYWlsdXJlIGEgZmFpbGluZyBQYXJzZVJlc3VsdDxOVD4gdGhhdCBzdG9wcGVkIHRoaXMgdHJlZSdzIHBhcnNlIChidXQgZGlkbid0IHByZXZlbnQgdGhpcyBmcm9tIHN1Y2NlZWRpbmcpXG4gICAgICogQHJldHVybiBhIG5ldyBQYXJzZVJlc3VsdDxOVD4gaWRlbnRpY2FsIHRvIHRoaXMgb25lIGJ1dCB3aXRoIGxhc3RGYWlsdXJlIGFkZGVkIHRvIGl0XG4gICAgICovXG4gICAgYWRkTGFzdEZhaWx1cmUobmV3TGFzdEZhaWx1cmUpIHtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKG5ld0xhc3RGYWlsdXJlLmZhaWxlZCk7XG4gICAgICAgIHJldHVybiBuZXcgU3VjY2Vzc2Z1bFBhcnNlKHRoaXMucG9zLCB0aGlzLnRyZWUsIGxhdGVyUmVzdWx0KHRoaXMubGFzdEZhaWx1cmUsIG5ld0xhc3RGYWlsdXJlKSk7XG4gICAgfVxufVxuZXhwb3J0cy5TdWNjZXNzZnVsUGFyc2UgPSBTdWNjZXNzZnVsUGFyc2U7XG5jbGFzcyBGYWlsZWRQYXJzZSB7XG4gICAgY29uc3RydWN0b3IocG9zLCBub250ZXJtaW5hbE5hbWUsIGV4cGVjdGVkVGV4dCkge1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICAgICAgdGhpcy5ub250ZXJtaW5hbE5hbWUgPSBub250ZXJtaW5hbE5hbWU7XG4gICAgICAgIHRoaXMuZXhwZWN0ZWRUZXh0ID0gZXhwZWN0ZWRUZXh0O1xuICAgICAgICB0aGlzLmZhaWxlZCA9IHRydWU7XG4gICAgfVxufVxuZXhwb3J0cy5GYWlsZWRQYXJzZSA9IEZhaWxlZFBhcnNlO1xuLyoqXG4gKiBAcGFyYW0gcmVzdWx0MVxuICogQHBhcmFtIHJlc3VsdDJcbiAqIEByZXR1cm4gd2hpY2hldmVyIG9mIHJlc3VsdDEgb3IgcmVzdWx0MiBoYXMgdGhlIG14aW11bSBwb3NpdGlvbiwgb3IgdW5kZWZpbmVkIGlmIGJvdGggYXJlIHVuZGVmaW5lZFxuICovXG5mdW5jdGlvbiBsYXRlclJlc3VsdChyZXN1bHQxLCByZXN1bHQyKSB7XG4gICAgaWYgKHJlc3VsdDEgJiYgcmVzdWx0MilcbiAgICAgICAgcmV0dXJuIHJlc3VsdDEucG9zID49IHJlc3VsdDIucG9zID8gcmVzdWx0MSA6IHJlc3VsdDI7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gcmVzdWx0MSB8fCByZXN1bHQyO1xufVxuLyoqXG4gKiBAcGFyYW0gcmVzdWx0c1xuICogQHJldHVybiB0aGUgcmVzdWx0cyBpbiB0aGUgbGlzdCB3aXRoIG1heGltdW0gcG9zLiAgRW1wdHkgaWYgbGlzdCBpcyBlbXB0eS5cbiAqL1xuZnVuY3Rpb24gbG9uZ2VzdFJlc3VsdHMocmVzdWx0cykge1xuICAgIHJldHVybiByZXN1bHRzLnJlZHVjZSgobG9uZ2VzdFJlc3VsdHNTb0ZhciwgcmVzdWx0KSA9PiB7XG4gICAgICAgIGlmIChsb25nZXN0UmVzdWx0c1NvRmFyLmxlbmd0aCA9PSAwIHx8IHJlc3VsdC5wb3MgPiBsb25nZXN0UmVzdWx0c1NvRmFyWzBdLnBvcykge1xuICAgICAgICAgICAgLy8gcmVzdWx0IHdpbnNcbiAgICAgICAgICAgIHJldHVybiBbcmVzdWx0XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChyZXN1bHQucG9zID09IGxvbmdlc3RSZXN1bHRzU29GYXJbMF0ucG9zKSB7XG4gICAgICAgICAgICAvLyByZXN1bHQgaXMgdGllZFxuICAgICAgICAgICAgbG9uZ2VzdFJlc3VsdHNTb0Zhci5wdXNoKHJlc3VsdCk7XG4gICAgICAgICAgICByZXR1cm4gbG9uZ2VzdFJlc3VsdHNTb0ZhcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHJlc3VsdCBsb3Nlc1xuICAgICAgICAgICAgcmV0dXJuIGxvbmdlc3RSZXN1bHRzU29GYXI7XG4gICAgICAgIH1cbiAgICB9LCBbXSk7XG59XG5jbGFzcyBQYXJzZXJTdGF0ZSB7XG4gICAgY29uc3RydWN0b3Iobm9udGVybWluYWxUb1N0cmluZykge1xuICAgICAgICB0aGlzLm5vbnRlcm1pbmFsVG9TdHJpbmcgPSBub250ZXJtaW5hbFRvU3RyaW5nO1xuICAgICAgICB0aGlzLnN0YWNrID0gW107XG4gICAgICAgIHRoaXMuZmlyc3QgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuc2tpcERlcHRoID0gMDtcbiAgICB9XG4gICAgZW50ZXIocG9zLCBub250ZXJtaW5hbCkge1xuICAgICAgICBpZiAoIXRoaXMuZmlyc3QuaGFzKG5vbnRlcm1pbmFsKSkge1xuICAgICAgICAgICAgdGhpcy5maXJzdC5zZXQobm9udGVybWluYWwsIFtdKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzID0gdGhpcy5maXJzdC5nZXQobm9udGVybWluYWwpO1xuICAgICAgICBpZiAocy5sZW5ndGggPiAwICYmIHNbcy5sZW5ndGggLSAxXSA9PSBwb3MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyB0eXBlc18xLkdyYW1tYXJFcnJvcihcImRldGVjdGVkIGxlZnQgcmVjdXJzaW9uIGluIHJ1bGUgZm9yIFwiICsgdGhpcy5ub250ZXJtaW5hbFRvU3RyaW5nKG5vbnRlcm1pbmFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgcy5wdXNoKHBvcyk7XG4gICAgICAgIHRoaXMuc3RhY2sucHVzaChub250ZXJtaW5hbCk7XG4gICAgfVxuICAgIGxlYXZlKG5vbnRlcm1pbmFsKSB7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLmZpcnN0Lmhhcyhub250ZXJtaW5hbCkgJiYgdGhpcy5maXJzdC5nZXQobm9udGVybWluYWwpLmxlbmd0aCA+IDApO1xuICAgICAgICB0aGlzLmZpcnN0LmdldChub250ZXJtaW5hbCkucG9wKCk7XG4gICAgICAgIGNvbnN0IGxhc3QgPSB0aGlzLnN0YWNrLnBvcCgpO1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkobGFzdCA9PT0gbm9udGVybWluYWwpO1xuICAgIH1cbiAgICBlbnRlclNraXAoKSB7XG4gICAgICAgIC8vY29uc29sZS5lcnJvcignZW50ZXJpbmcgc2tpcCcpO1xuICAgICAgICArK3RoaXMuc2tpcERlcHRoO1xuICAgIH1cbiAgICBsZWF2ZVNraXAoKSB7XG4gICAgICAgIC8vY29uc29sZS5lcnJvcignbGVhdmluZyBza2lwJyk7XG4gICAgICAgIC0tdGhpcy5za2lwRGVwdGg7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSh0aGlzLnNraXBEZXB0aCA+PSAwKTtcbiAgICB9XG4gICAgaXNFbXB0eSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2subGVuZ3RoID09IDA7XG4gICAgfVxuICAgIGdldCBjdXJyZW50Tm9udGVybWluYWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIGdldCBjdXJyZW50Tm9udGVybWluYWxOYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50Tm9udGVybWluYWwgIT09IHVuZGVmaW5lZCA/IHRoaXMubm9udGVybWluYWxUb1N0cmluZyh0aGlzLmN1cnJlbnROb250ZXJtaW5hbCkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8vIHJlcXVpcmVzOiAhaXNFbXB0eSgpXG4gICAgbWFrZVBhcnNlVHJlZShwb3MsIHRleHQgPSAnJywgY2hpbGRyZW4gPSBbXSkge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoIXRoaXMuaXNFbXB0eSgpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBwYXJzZXRyZWVfMS5JbnRlcm5hbFBhcnNlVHJlZSh0aGlzLmN1cnJlbnROb250ZXJtaW5hbCwgdGhpcy5jdXJyZW50Tm9udGVybWluYWxOYW1lLCBwb3MsIHRleHQsIGNoaWxkcmVuLCB0aGlzLnNraXBEZXB0aCA+IDApO1xuICAgIH1cbiAgICAvLyByZXF1aXJlcyAhaXNFbXB0eSgpXG4gICAgbWFrZVN1Y2Nlc3NmdWxQYXJzZShmcm9tUG9zLCB0b1BvcywgdGV4dCA9ICcnLCBjaGlsZHJlbiA9IFtdKSB7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSghdGhpcy5pc0VtcHR5KCkpO1xuICAgICAgICByZXR1cm4gbmV3IFN1Y2Nlc3NmdWxQYXJzZSh0b1BvcywgdGhpcy5tYWtlUGFyc2VUcmVlKGZyb21Qb3MsIHRleHQsIGNoaWxkcmVuKSk7XG4gICAgfVxuICAgIC8vIHJlcXVpcmVzICFpc0VtcHR5KClcbiAgICBtYWtlRmFpbGVkUGFyc2UoYXRQb3MsIGV4cGVjdGVkVGV4dCkge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoIXRoaXMuaXNFbXB0eSgpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBGYWlsZWRQYXJzZShhdFBvcywgdGhpcy5jdXJyZW50Tm9udGVybWluYWxOYW1lLCBleHBlY3RlZFRleHQpO1xuICAgIH1cbn1cbmV4cG9ydHMuUGFyc2VyU3RhdGUgPSBQYXJzZXJTdGF0ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnNlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuSW50ZXJuYWxQYXJzZVRyZWUgPSB2b2lkIDA7XG5jb25zdCBkaXNwbGF5XzEgPSByZXF1aXJlKFwiLi9kaXNwbGF5XCIpO1xuY2xhc3MgSW50ZXJuYWxQYXJzZVRyZWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIG5vbnRlcm1pbmFsTmFtZSwgc3RhcnQsIHRleHQsIGFsbENoaWxkcmVuLCBpc1NraXBwZWQpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5ub250ZXJtaW5hbE5hbWUgPSBub250ZXJtaW5hbE5hbWU7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICAgICAgdGhpcy5hbGxDaGlsZHJlbiA9IGFsbENoaWxkcmVuO1xuICAgICAgICB0aGlzLmlzU2tpcHBlZCA9IGlzU2tpcHBlZDtcbiAgICAgICAgdGhpcy5jaGVja1JlcCgpO1xuICAgICAgICBPYmplY3QuZnJlZXplKHRoaXMuYWxsQ2hpbGRyZW4pO1xuICAgICAgICAvLyBjYW4ndCBmcmVlemUodGhpcykgYmVjYXVzZSBvZiBiZW5lZmljZW50IG11dGF0aW9uIGRlbGF5ZWQgY29tcHV0YXRpb24td2l0aC1jYWNoaW5nIGZvciBjaGlsZHJlbigpIGFuZCBjaGlsZHJlbkJ5TmFtZSgpXG4gICAgfVxuICAgIGNoZWNrUmVwKCkge1xuICAgICAgICAvLyBGSVhNRVxuICAgIH1cbiAgICBnZXQgZW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydCArIHRoaXMudGV4dC5sZW5ndGg7XG4gICAgfVxuICAgIGNoaWxkcmVuQnlOYW1lKG5hbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jaGlsZHJlbkJ5TmFtZSkge1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5CeU5hbWUgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHRoaXMuYWxsQ2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2NoaWxkcmVuQnlOYW1lLmhhcyhjaGlsZC5uYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGlsZHJlbkJ5TmFtZS5zZXQoY2hpbGQubmFtZSwgW10pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9jaGlsZHJlbkJ5TmFtZS5nZXQoY2hpbGQubmFtZSkucHVzaChjaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkTGlzdCBvZiB0aGlzLl9jaGlsZHJlbkJ5TmFtZS52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5mcmVlemUoY2hpbGRMaXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoZWNrUmVwKCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbkJ5TmFtZS5nZXQobmFtZSkgfHwgW107XG4gICAgfVxuICAgIGdldCBjaGlsZHJlbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9jaGlsZHJlbikge1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW4gPSB0aGlzLmFsbENoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQuaXNTa2lwcGVkKTtcbiAgICAgICAgICAgIE9iamVjdC5mcmVlemUodGhpcy5fY2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tSZXAoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuO1xuICAgIH1cbiAgICBjb25jYXQodGhhdCkge1xuICAgICAgICByZXR1cm4gbmV3IEludGVybmFsUGFyc2VUcmVlKHRoaXMubmFtZSwgdGhpcy5ub250ZXJtaW5hbE5hbWUsIHRoaXMuc3RhcnQsIHRoaXMudGV4dCArIHRoYXQudGV4dCwgdGhpcy5hbGxDaGlsZHJlbi5jb25jYXQodGhhdC5hbGxDaGlsZHJlbiksIHRoaXMuaXNTa2lwcGVkICYmIHRoYXQuaXNTa2lwcGVkKTtcbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIGxldCBzID0gKHRoaXMuaXNTa2lwcGVkID8gXCJAc2tpcCBcIiA6IFwiXCIpICsgdGhpcy5ub250ZXJtaW5hbE5hbWU7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBzICs9IFwiOlwiICsgKDAsIGRpc3BsYXlfMS5lc2NhcGVGb3JSZWFkaW5nKSh0aGlzLnRleHQsIFwiXFxcIlwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCB0ID0gXCJcIjtcbiAgICAgICAgICAgIGxldCBvZmZzZXRSZWFjaGVkU29GYXIgPSB0aGlzLnN0YXJ0O1xuICAgICAgICAgICAgZm9yIChjb25zdCBwdCBvZiB0aGlzLmFsbENoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldFJlYWNoZWRTb0ZhciA8IHB0LnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHByZXZpb3VzIGNoaWxkIGFuZCBjdXJyZW50IGNoaWxkIGhhdmUgYSBnYXAgYmV0d2VlbiB0aGVtIHRoYXQgbXVzdCBoYXZlIGJlZW4gbWF0Y2hlZCBhcyBhIHRlcm1pbmFsXG4gICAgICAgICAgICAgICAgICAgIC8vIGluIHRoZSBydWxlIGZvciB0aGlzIG5vZGUuICBJbnNlcnQgaXQgYXMgYSBxdW90ZWQgc3RyaW5nLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXJtaW5hbCA9IHRoaXMudGV4dC5zdWJzdHJpbmcob2Zmc2V0UmVhY2hlZFNvRmFyIC0gdGhpcy5zdGFydCwgcHQuc3RhcnQgLSB0aGlzLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgdCArPSBcIlxcblwiICsgKDAsIGRpc3BsYXlfMS5lc2NhcGVGb3JSZWFkaW5nKSh0ZXJtaW5hbCwgXCJcXFwiXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0ICs9IFwiXFxuXCIgKyBwdDtcbiAgICAgICAgICAgICAgICBvZmZzZXRSZWFjaGVkU29GYXIgPSBwdC5lbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2Zmc2V0UmVhY2hlZFNvRmFyIDwgdGhpcy5lbmQpIHtcbiAgICAgICAgICAgICAgICAvLyBmaW5hbCBjaGlsZCBhbmQgZW5kIG9mIHRoaXMgbm9kZSBoYXZlIGEgZ2FwIC0tIHRyZWF0IGl0IHRoZSBzYW1lIGFzIGFib3ZlLlxuICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1pbmFsID0gdGhpcy50ZXh0LnN1YnN0cmluZyhvZmZzZXRSZWFjaGVkU29GYXIgLSB0aGlzLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICB0ICs9IFwiXFxuXCIgKyAoMCwgZGlzcGxheV8xLmVzY2FwZUZvclJlYWRpbmcpKHRlcm1pbmFsLCBcIlxcXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzbWFsbEVub3VnaEZvck9uZUxpbmUgPSA1MDtcbiAgICAgICAgICAgIGlmICh0Lmxlbmd0aCA8PSBzbWFsbEVub3VnaEZvck9uZUxpbmUpIHtcbiAgICAgICAgICAgICAgICBzICs9IFwiIHsgXCIgKyB0LnN1YnN0cmluZygxKSAvLyByZW1vdmUgaW5pdGlhbCBuZXdsaW5lXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKFwiXFxuXCIsIFwiLCBcIilcbiAgICAgICAgICAgICAgICAgICAgKyBcIiB9XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzICs9IFwiIHtcIiArICgwLCBkaXNwbGF5XzEuaW5kZW50KSh0LCBcIiAgXCIpICsgXCJcXG59XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfVxufVxuZXhwb3J0cy5JbnRlcm5hbFBhcnNlVHJlZSA9IEludGVybmFsUGFyc2VUcmVlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFyc2V0cmVlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5HcmFtbWFyRXJyb3IgPSBleHBvcnRzLkludGVybmFsUGFyc2VFcnJvciA9IGV4cG9ydHMuUGFyc2VFcnJvciA9IHZvaWQgMDtcbmNvbnN0IGRpc3BsYXlfMSA9IHJlcXVpcmUoXCIuL2Rpc3BsYXlcIik7XG4vKipcbiAqIEV4Y2VwdGlvbiB0aHJvd24gd2hlbiBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgZG9lc24ndCBtYXRjaCBhIGdyYW1tYXJcbiAqL1xuY2xhc3MgUGFyc2VFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIH1cbn1cbmV4cG9ydHMuUGFyc2VFcnJvciA9IFBhcnNlRXJyb3I7XG5jbGFzcyBJbnRlcm5hbFBhcnNlRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlLCBub250ZXJtaW5hbE5hbWUsIGV4cGVjdGVkVGV4dCwgdGV4dEJlaW5nUGFyc2VkLCBwb3MpIHtcbiAgICAgICAgc3VwZXIoKDAsIGRpc3BsYXlfMS5tYWtlRXJyb3JNZXNzYWdlKShtZXNzYWdlLCBub250ZXJtaW5hbE5hbWUsIGV4cGVjdGVkVGV4dCwgdGV4dEJlaW5nUGFyc2VkLCBwb3MsIFwic3RyaW5nIGJlaW5nIHBhcnNlZFwiKSk7XG4gICAgICAgIHRoaXMubm9udGVybWluYWxOYW1lID0gbm9udGVybWluYWxOYW1lO1xuICAgICAgICB0aGlzLmV4cGVjdGVkVGV4dCA9IGV4cGVjdGVkVGV4dDtcbiAgICAgICAgdGhpcy50ZXh0QmVpbmdQYXJzZWQgPSB0ZXh0QmVpbmdQYXJzZWQ7XG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgIH1cbn1cbmV4cG9ydHMuSW50ZXJuYWxQYXJzZUVycm9yID0gSW50ZXJuYWxQYXJzZUVycm9yO1xuY2xhc3MgR3JhbW1hckVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgZSkge1xuICAgICAgICBzdXBlcihlID8gKDAsIGRpc3BsYXlfMS5tYWtlRXJyb3JNZXNzYWdlKShtZXNzYWdlLCBlLm5vbnRlcm1pbmFsTmFtZSwgZS5leHBlY3RlZFRleHQsIGUudGV4dEJlaW5nUGFyc2VkLCBlLnBvcywgXCJncmFtbWFyXCIpXG4gICAgICAgICAgICA6IG1lc3NhZ2UpO1xuICAgIH1cbn1cbmV4cG9ydHMuR3JhbW1hckVycm9yID0gR3JhbW1hckVycm9yO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHlwZXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnZpc3VhbGl6ZUFzSHRtbCA9IGV4cG9ydHMudmlzdWFsaXplQXNVcmwgPSB2b2lkIDA7XG5jb25zdCBjb21waWxlcl8xID0gcmVxdWlyZShcIi4vY29tcGlsZXJcIik7XG5jb25zdCBwYXJzZXJsaWJfMSA9IHJlcXVpcmUoXCIuLi9wYXJzZXJsaWJcIik7XG5jb25zdCBmc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJmc1wiKSk7XG5jb25zdCBwYXRoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcInBhdGhcIikpO1xuZnVuY3Rpb24gZW1wdHlJdGVyYXRvcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBuZXh0KCkgeyByZXR1cm4geyBkb25lOiB0cnVlIH07IH1cbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0SXRlcmF0b3IobGlzdCkge1xuICAgIHJldHVybiBsaXN0W1N5bWJvbC5pdGVyYXRvcl0oKTtcbn1cbmNvbnN0IE1BWF9VUkxfTEVOR1RIX0ZPUl9ERVNLVE9QX0JST1dTRSA9IDIwMjA7XG4vKipcbiAqIFZpc3VhbGl6ZXMgYSBwYXJzZSB0cmVlIHVzaW5nIGEgVVJMIHRoYXQgY2FuIGJlIHBhc3RlZCBpbnRvIHlvdXIgd2ViIGJyb3dzZXIuXG4gKiBAcGFyYW0gcGFyc2VUcmVlIHRyZWUgdG8gdmlzdWFsaXplXG4gKiBAcGFyYW0gPE5UPiB0aGUgZW51bWVyYXRpb24gb2Ygc3ltYm9scyBpbiB0aGUgcGFyc2UgdHJlZSdzIGdyYW1tYXJcbiAqIEByZXR1cm4gdXJsIHRoYXQgc2hvd3MgYSB2aXN1YWxpemF0aW9uIG9mIHRoZSBwYXJzZSB0cmVlXG4gKi9cbmZ1bmN0aW9uIHZpc3VhbGl6ZUFzVXJsKHBhcnNlVHJlZSwgbm9udGVybWluYWxzKSB7XG4gICAgY29uc3QgYmFzZSA9IFwiaHR0cDovL3dlYi5taXQuZWR1LzYuMDMxL3d3dy9wYXJzZXJsaWIvXCIgKyBwYXJzZXJsaWJfMS5WRVJTSU9OICsgXCIvdmlzdWFsaXplci5odG1sXCI7XG4gICAgY29uc3QgY29kZSA9IGV4cHJlc3Npb25Gb3JEaXNwbGF5KHBhcnNlVHJlZSwgbm9udGVybWluYWxzKTtcbiAgICBjb25zdCB1cmwgPSBiYXNlICsgJz9jb2RlPScgKyBmaXhlZEVuY29kZVVSSUNvbXBvbmVudChjb2RlKTtcbiAgICBpZiAodXJsLmxlbmd0aCA+IE1BWF9VUkxfTEVOR1RIX0ZPUl9ERVNLVE9QX0JST1dTRSkge1xuICAgICAgICAvLyBkaXNwbGF5IGFsdGVybmF0ZSBpbnN0cnVjdGlvbnMgdG8gdGhlIGNvbnNvbGVcbiAgICAgICAgY29uc29sZS5lcnJvcignVmlzdWFsaXphdGlvbiBVUkwgaXMgdG9vIGxvbmcgZm9yIHdlYiBicm93c2VyIGFuZC9vciB3ZWIgc2VydmVyLlxcbidcbiAgICAgICAgICAgICsgJ0luc3RlYWQsIGdvIHRvICcgKyBiYXNlICsgJ1xcbidcbiAgICAgICAgICAgICsgJ2FuZCBjb3B5IGFuZCBwYXN0ZSB0aGlzIGNvZGUgaW50byB0aGUgdGV4dGJveDpcXG4nXG4gICAgICAgICAgICArIGNvZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdXJsO1xufVxuZXhwb3J0cy52aXN1YWxpemVBc1VybCA9IHZpc3VhbGl6ZUFzVXJsO1xuY29uc3QgdmlzdWFsaXplckh0bWxGaWxlID0gcGF0aF8xLmRlZmF1bHQucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9zcmMvdmlzdWFsaXplci5odG1sJyk7XG4vKipcbiAqIFZpc3VhbGl6ZXMgYSBwYXJzZSB0cmVlIGFzIGEgc3RyaW5nIG9mIEhUTUwgdGhhdCBjYW4gYmUgZGlzcGxheWVkIGluIGEgd2ViIGJyb3dzZXIuXG4gKiBAcGFyYW0gcGFyc2VUcmVlIHRyZWUgdG8gdmlzdWFsaXplXG4gKiBAcGFyYW0gPE5UPiB0aGUgZW51bWVyYXRpb24gb2Ygc3ltYm9scyBpbiB0aGUgcGFyc2UgdHJlZSdzIGdyYW1tYXJcbiAqIEByZXR1cm4gc3RyaW5nIG9mIEhUTUwgdGhhdCBzaG93cyBhIHZpc3VhbGl6YXRpb24gb2YgdGhlIHBhcnNlIHRyZWVcbiAqL1xuZnVuY3Rpb24gdmlzdWFsaXplQXNIdG1sKHBhcnNlVHJlZSwgbm9udGVybWluYWxzKSB7XG4gICAgY29uc3QgaHRtbCA9IGZzXzEuZGVmYXVsdC5yZWFkRmlsZVN5bmModmlzdWFsaXplckh0bWxGaWxlLCAndXRmOCcpO1xuICAgIGNvbnN0IGNvZGUgPSBleHByZXNzaW9uRm9yRGlzcGxheShwYXJzZVRyZWUsIG5vbnRlcm1pbmFscyk7XG4gICAgY29uc3QgcmVzdWx0ID0gaHRtbC5yZXBsYWNlKC9cXC9cXC9DT0RFSEVSRS8sIFwicmV0dXJuICdcIiArIGZpeGVkRW5jb2RlVVJJQ29tcG9uZW50KGNvZGUpICsgXCInO1wiKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0cy52aXN1YWxpemVBc0h0bWwgPSB2aXN1YWxpemVBc0h0bWw7XG5mdW5jdGlvbiBleHByZXNzaW9uRm9yRGlzcGxheShwYXJzZVRyZWUsIG5vbnRlcm1pbmFscykge1xuICAgIGNvbnN0IHsgbm9udGVybWluYWxUb1N0cmluZyB9ID0gKDAsIGNvbXBpbGVyXzEubWFrZU5vbnRlcm1pbmFsQ29udmVydGVycykobm9udGVybWluYWxzKTtcbiAgICByZXR1cm4gZm9yRGlzcGxheShwYXJzZVRyZWUsIFtdLCBwYXJzZVRyZWUpO1xuICAgIGZ1bmN0aW9uIGZvckRpc3BsYXkobm9kZSwgc2libGluZ3MsIHBhcmVudCkge1xuICAgICAgICBjb25zdCBuYW1lID0gbm9udGVybWluYWxUb1N0cmluZyhub2RlLm5hbWUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGxldCBzID0gXCJuZChcIjtcbiAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHMgKz0gXCJcXFwiXCIgKyBuYW1lICsgXCJcXFwiLG5kKFxcXCInXCIgKyBjbGVhblN0cmluZyhub2RlLnRleHQpICsgXCInXFxcIiksXCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzICs9IFwiXFxcIlwiICsgbmFtZSArIFwiXFxcIixcIjtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5hbGxDaGlsZHJlbi5zbGljZSgpOyAvLyBtYWtlIGEgY29weSBmb3Igc2hpZnRpbmdcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0Q2hpbGQgPSBjaGlsZHJlbi5zaGlmdCgpO1xuICAgICAgICAgICAgbGV0IGNoaWxkcmVuRXhwcmVzc2lvbiA9IGZvckRpc3BsYXkoZmlyc3RDaGlsZCwgY2hpbGRyZW4sIG5vZGUpO1xuICAgICAgICAgICAgaWYgKG5vZGUuc3RhcnQgPCBmaXJzdENoaWxkLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgLy8gbm9kZSBhbmQgaXRzIGZpcnN0IGNoaWxkIGhhdmUgYSBnYXAgYmV0d2VlbiB0aGVtIHRoYXQgbXVzdCBoYXZlIGJlZW4gbWF0Y2hlZCBhcyBhIHRlcm1pbmFsXG4gICAgICAgICAgICAgICAgLy8gaW4gdGhlIHJ1bGUgZm9yIG5vZGUuICBJbnNlcnQgaXQgYXMgYSBxdW90ZWQgc3RyaW5nLlxuICAgICAgICAgICAgICAgIGNoaWxkcmVuRXhwcmVzc2lvbiA9IHByZWNlZGVCeVRlcm1pbmFsKG5vZGUudGV4dC5zdWJzdHJpbmcoMCwgZmlyc3RDaGlsZC5zdGFydCAtIG5vZGUuc3RhcnQpLCBjaGlsZHJlbkV4cHJlc3Npb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcyArPSBjaGlsZHJlbkV4cHJlc3Npb24gKyBcIixcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2libGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3Qgc2libGluZyA9IHNpYmxpbmdzLnNoaWZ0KCk7XG4gICAgICAgICAgICBsZXQgc2libGluZ0V4cHJlc3Npb24gPSBmb3JEaXNwbGF5KHNpYmxpbmcsIHNpYmxpbmdzLCBwYXJlbnQpO1xuICAgICAgICAgICAgaWYgKG5vZGUuZW5kIDwgc2libGluZy5zdGFydCkge1xuICAgICAgICAgICAgICAgIC8vIG5vZGUgYW5kIGl0cyBzaWJsaW5nIGhhdmUgYSBnYXAgYmV0d2VlbiB0aGVtIHRoYXQgbXVzdCBoYXZlIGJlZW4gbWF0Y2hlZCBhcyBhIHRlcm1pbmFsXG4gICAgICAgICAgICAgICAgLy8gaW4gdGhlIHJ1bGUgZm9yIHBhcmVudC4gIEluc2VydCBpdCBhcyBhIHF1b3RlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgc2libGluZ0V4cHJlc3Npb24gPSBwcmVjZWRlQnlUZXJtaW5hbChwYXJlbnQudGV4dC5zdWJzdHJpbmcobm9kZS5lbmQgLSBwYXJlbnQuc3RhcnQsIHNpYmxpbmcuc3RhcnQgLSBwYXJlbnQuc3RhcnQpLCBzaWJsaW5nRXhwcmVzc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzICs9IHNpYmxpbmdFeHByZXNzaW9uO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHNpYmxpbmdFeHByZXNzaW9uID0gXCJ1dVwiO1xuICAgICAgICAgICAgaWYgKG5vZGUuZW5kIDwgcGFyZW50LmVuZCkge1xuICAgICAgICAgICAgICAgIC8vIFRoZXJlJ3MgYSBnYXAgYmV0d2VlbiB0aGUgZW5kIG9mIG5vZGUgYW5kIHRoZSBlbmQgb2YgaXRzIHBhcmVudCwgd2hpY2ggbXVzdCBiZSBhIHRlcm1pbmFsIG1hdGNoZWQgYnkgcGFyZW50LlxuICAgICAgICAgICAgICAgIC8vIEluc2VydCBpdCBhcyBhIHF1b3RlZCBzdHJpbmcuXG4gICAgICAgICAgICAgICAgc2libGluZ0V4cHJlc3Npb24gPSBwcmVjZWRlQnlUZXJtaW5hbChwYXJlbnQudGV4dC5zdWJzdHJpbmcobm9kZS5lbmQgLSBwYXJlbnQuc3RhcnQpLCBzaWJsaW5nRXhwcmVzc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzICs9IHNpYmxpbmdFeHByZXNzaW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLmlzU2tpcHBlZCkge1xuICAgICAgICAgICAgcyArPSBcIix0cnVlXCI7XG4gICAgICAgIH1cbiAgICAgICAgcyArPSBcIilcIjtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByZWNlZGVCeVRlcm1pbmFsKHRlcm1pbmFsLCBleHByZXNzaW9uKSB7XG4gICAgICAgIHJldHVybiBcIm5kKFxcXCInXCIgKyBjbGVhblN0cmluZyh0ZXJtaW5hbCkgKyBcIidcXFwiLCB1dSwgXCIgKyBleHByZXNzaW9uICsgXCIpXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNsZWFuU3RyaW5nKHMpIHtcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IHMucmVwbGFjZSgvXFxcXC9nLCBcIlxcXFxcXFxcXCIpO1xuICAgICAgICBydmFsdWUgPSBydmFsdWUucmVwbGFjZSgvXCIvZywgXCJcXFxcXFxcIlwiKTtcbiAgICAgICAgcnZhbHVlID0gcnZhbHVlLnJlcGxhY2UoL1xcbi9nLCBcIlxcXFxuXCIpO1xuICAgICAgICBydmFsdWUgPSBydmFsdWUucmVwbGFjZSgvXFxyL2csIFwiXFxcXHJcIik7XG4gICAgICAgIHJldHVybiBydmFsdWU7XG4gICAgfVxufVxuLy8gZnJvbSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9lbmNvZGVVUklDb21wb25lbnRcbmZ1bmN0aW9uIGZpeGVkRW5jb2RlVVJJQ29tcG9uZW50KHMpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHMpLnJlcGxhY2UoL1shJygpKl0vZywgYyA9PiAnJScgKyBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXZpc3VhbGl6ZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnZpc3VhbGl6ZUFzSHRtbCA9IGV4cG9ydHMudmlzdWFsaXplQXNVcmwgPSBleHBvcnRzLmNvbXBpbGUgPSBleHBvcnRzLlBhcnNlRXJyb3IgPSBleHBvcnRzLlZFUlNJT04gPSB2b2lkIDA7XG5leHBvcnRzLlZFUlNJT04gPSBcIjMuMi4zXCI7XG52YXIgdHlwZXNfMSA9IHJlcXVpcmUoXCIuL2ludGVybmFsL3R5cGVzXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiUGFyc2VFcnJvclwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdHlwZXNfMS5QYXJzZUVycm9yOyB9IH0pO1xuO1xudmFyIGNvbXBpbGVyXzEgPSByZXF1aXJlKFwiLi9pbnRlcm5hbC9jb21waWxlclwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImNvbXBpbGVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbXBpbGVyXzEuY29tcGlsZTsgfSB9KTtcbnZhciB2aXN1YWxpemVyXzEgPSByZXF1aXJlKFwiLi9pbnRlcm5hbC92aXN1YWxpemVyXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwidmlzdWFsaXplQXNVcmxcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZpc3VhbGl6ZXJfMS52aXN1YWxpemVBc1VybDsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInZpc3VhbGl6ZUFzSHRtbFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdmlzdWFsaXplcl8xLnZpc3VhbGl6ZUFzSHRtbDsgfSB9KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnNlcmxpYi5qcy5tYXAiLCIvLyAncGF0aCcgbW9kdWxlIGV4dHJhY3RlZCBmcm9tIE5vZGUuanMgdjguMTEuMSAob25seSB0aGUgcG9zaXggcGFydClcbi8vIHRyYW5zcGxpdGVkIHdpdGggQmFiZWxcblxuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gYXNzZXJ0UGF0aChwYXRoKSB7XG4gIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdQYXRoIG11c3QgYmUgYSBzdHJpbmcuIFJlY2VpdmVkICcgKyBKU09OLnN0cmluZ2lmeShwYXRoKSk7XG4gIH1cbn1cblxuLy8gUmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIHdpdGggZGlyZWN0b3J5IG5hbWVzXG5mdW5jdGlvbiBub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoLCBhbGxvd0Fib3ZlUm9vdCkge1xuICB2YXIgcmVzID0gJyc7XG4gIHZhciBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gIHZhciBsYXN0U2xhc2ggPSAtMTtcbiAgdmFyIGRvdHMgPSAwO1xuICB2YXIgY29kZTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPD0gcGF0aC5sZW5ndGg7ICsraSkge1xuICAgIGlmIChpIDwgcGF0aC5sZW5ndGgpXG4gICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgIGVsc2UgaWYgKGNvZGUgPT09IDQ3IC8qLyovKVxuICAgICAgYnJlYWs7XG4gICAgZWxzZVxuICAgICAgY29kZSA9IDQ3IC8qLyovO1xuICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgaWYgKGxhc3RTbGFzaCA9PT0gaSAtIDEgfHwgZG90cyA9PT0gMSkge1xuICAgICAgICAvLyBOT09QXG4gICAgICB9IGVsc2UgaWYgKGxhc3RTbGFzaCAhPT0gaSAtIDEgJiYgZG90cyA9PT0gMikge1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA8IDIgfHwgbGFzdFNlZ21lbnRMZW5ndGggIT09IDIgfHwgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDEpICE9PSA0NiAvKi4qLyB8fCByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMikgIT09IDQ2IC8qLiovKSB7XG4gICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICB2YXIgbGFzdFNsYXNoSW5kZXggPSByZXMubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgICAgICAgIGlmIChsYXN0U2xhc2hJbmRleCAhPT0gcmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlcyA9ICcnO1xuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgbGFzdFNsYXNoSW5kZXgpO1xuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gcmVzLmxlbmd0aCAtIDEgLSByZXMubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChyZXMubGVuZ3RoID09PSAyIHx8IHJlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJlcyA9ICcnO1xuICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgICAgICAgIGRvdHMgPSAwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHJlcyArPSAnLy4uJztcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXMgPSAnLi4nO1xuICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKVxuICAgICAgICAgIHJlcyArPSAnLycgKyBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzID0gcGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcbiAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSBpIC0gbGFzdFNsYXNoIC0gMTtcbiAgICAgIH1cbiAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICBkb3RzID0gMDtcbiAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDQ2IC8qLiovICYmIGRvdHMgIT09IC0xKSB7XG4gICAgICArK2RvdHM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvdHMgPSAtMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gX2Zvcm1hdChzZXAsIHBhdGhPYmplY3QpIHtcbiAgdmFyIGRpciA9IHBhdGhPYmplY3QuZGlyIHx8IHBhdGhPYmplY3Qucm9vdDtcbiAgdmFyIGJhc2UgPSBwYXRoT2JqZWN0LmJhc2UgfHwgKHBhdGhPYmplY3QubmFtZSB8fCAnJykgKyAocGF0aE9iamVjdC5leHQgfHwgJycpO1xuICBpZiAoIWRpcikge1xuICAgIHJldHVybiBiYXNlO1xuICB9XG4gIGlmIChkaXIgPT09IHBhdGhPYmplY3Qucm9vdCkge1xuICAgIHJldHVybiBkaXIgKyBiYXNlO1xuICB9XG4gIHJldHVybiBkaXIgKyBzZXAgKyBiYXNlO1xufVxuXG52YXIgcG9zaXggPSB7XG4gIC8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSgpIHtcbiAgICB2YXIgcmVzb2x2ZWRQYXRoID0gJyc7XG4gICAgdmFyIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcbiAgICB2YXIgY3dkO1xuXG4gICAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICAgIHZhciBwYXRoO1xuICAgICAgaWYgKGkgPj0gMClcbiAgICAgICAgcGF0aCA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoY3dkID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgY3dkID0gcHJvY2Vzcy5jd2QoKTtcbiAgICAgICAgcGF0aCA9IGN3ZDtcbiAgICAgIH1cblxuICAgICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgICAgLy8gU2tpcCBlbXB0eSBlbnRyaWVzXG4gICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcbiAgICB9XG5cbiAgICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gICAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVTdHJpbmdQb3NpeChyZXNvbHZlZFBhdGgsICFyZXNvbHZlZEFic29sdXRlKTtcblxuICAgIGlmIChyZXNvbHZlZEFic29sdXRlKSB7XG4gICAgICBpZiAocmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDApXG4gICAgICAgIHJldHVybiAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiAnLyc7XG4gICAgfSBlbHNlIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHJlc29sdmVkUGF0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcuJztcbiAgICB9XG4gIH0sXG5cbiAgbm9ybWFsaXplOiBmdW5jdGlvbiBub3JtYWxpemUocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiAnLic7XG5cbiAgICB2YXIgaXNBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XG4gICAgdmFyIHRyYWlsaW5nU2VwYXJhdG9yID0gcGF0aC5jaGFyQ29kZUF0KHBhdGgubGVuZ3RoIC0gMSkgPT09IDQ3IC8qLyovO1xuXG4gICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gICAgcGF0aCA9IG5vcm1hbGl6ZVN0cmluZ1Bvc2l4KHBhdGgsICFpc0Fic29sdXRlKTtcblxuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCAmJiAhaXNBYnNvbHV0ZSkgcGF0aCA9ICcuJztcbiAgICBpZiAocGF0aC5sZW5ndGggPiAwICYmIHRyYWlsaW5nU2VwYXJhdG9yKSBwYXRoICs9ICcvJztcblxuICAgIGlmIChpc0Fic29sdXRlKSByZXR1cm4gJy8nICsgcGF0aDtcbiAgICByZXR1cm4gcGF0aDtcbiAgfSxcblxuICBpc0Fic29sdXRlOiBmdW5jdGlvbiBpc0Fic29sdXRlKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuICAgIHJldHVybiBwYXRoLmxlbmd0aCA+IDAgJiYgcGF0aC5jaGFyQ29kZUF0KDApID09PSA0NyAvKi8qLztcbiAgfSxcblxuICBqb2luOiBmdW5jdGlvbiBqb2luKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgcmV0dXJuICcuJztcbiAgICB2YXIgam9pbmVkO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuICAgICAgYXNzZXJ0UGF0aChhcmcpO1xuICAgICAgaWYgKGFyZy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICBqb2luZWQgPSBhcmc7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBqb2luZWQgKz0gJy8nICsgYXJnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gJy4nO1xuICAgIHJldHVybiBwb3NpeC5ub3JtYWxpemUoam9pbmVkKTtcbiAgfSxcblxuICByZWxhdGl2ZTogZnVuY3Rpb24gcmVsYXRpdmUoZnJvbSwgdG8pIHtcbiAgICBhc3NlcnRQYXRoKGZyb20pO1xuICAgIGFzc2VydFBhdGgodG8pO1xuXG4gICAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gJyc7XG5cbiAgICBmcm9tID0gcG9zaXgucmVzb2x2ZShmcm9tKTtcbiAgICB0byA9IHBvc2l4LnJlc29sdmUodG8pO1xuXG4gICAgaWYgKGZyb20gPT09IHRvKSByZXR1cm4gJyc7XG5cbiAgICAvLyBUcmltIGFueSBsZWFkaW5nIGJhY2tzbGFzaGVzXG4gICAgdmFyIGZyb21TdGFydCA9IDE7XG4gICAgZm9yICg7IGZyb21TdGFydCA8IGZyb20ubGVuZ3RoOyArK2Zyb21TdGFydCkge1xuICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQpICE9PSA0NyAvKi8qLylcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciBmcm9tRW5kID0gZnJvbS5sZW5ndGg7XG4gICAgdmFyIGZyb21MZW4gPSBmcm9tRW5kIC0gZnJvbVN0YXJ0O1xuXG4gICAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xuICAgIHZhciB0b1N0YXJ0ID0gMTtcbiAgICBmb3IgKDsgdG9TdGFydCA8IHRvLmxlbmd0aDsgKyt0b1N0YXJ0KSB7XG4gICAgICBpZiAodG8uY2hhckNvZGVBdCh0b1N0YXJ0KSAhPT0gNDcgLyovKi8pXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB2YXIgdG9FbmQgPSB0by5sZW5ndGg7XG4gICAgdmFyIHRvTGVuID0gdG9FbmQgLSB0b1N0YXJ0O1xuXG4gICAgLy8gQ29tcGFyZSBwYXRocyB0byBmaW5kIHRoZSBsb25nZXN0IGNvbW1vbiBwYXRoIGZyb20gcm9vdFxuICAgIHZhciBsZW5ndGggPSBmcm9tTGVuIDwgdG9MZW4gPyBmcm9tTGVuIDogdG9MZW47XG4gICAgdmFyIGxhc3RDb21tb25TZXAgPSAtMTtcbiAgICB2YXIgaSA9IDA7XG4gICAgZm9yICg7IGkgPD0gbGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpID09PSBsZW5ndGgpIHtcbiAgICAgICAgaWYgKHRvTGVuID4gbGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCArIGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGB0b2AuXG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXInOyB0bz0nL2Zvby9iYXIvYmF6J1xuICAgICAgICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQgKyBpICsgMSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgZnJvbWAgaXMgdGhlIHJvb3RcbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvJzsgdG89Jy9mb28nXG4gICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChmcm9tTGVuID4gbGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYGZyb21gLlxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28vYmFyL2Jheic7IHRvPScvZm9vL2JhcidcbiAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgcm9vdC5cbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vJzsgdG89Jy8nXG4gICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB2YXIgZnJvbUNvZGUgPSBmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSk7XG4gICAgICB2YXIgdG9Db2RlID0gdG8uY2hhckNvZGVBdCh0b1N0YXJ0ICsgaSk7XG4gICAgICBpZiAoZnJvbUNvZGUgIT09IHRvQ29kZSlcbiAgICAgICAgYnJlYWs7XG4gICAgICBlbHNlIGlmIChmcm9tQ29kZSA9PT0gNDcgLyovKi8pXG4gICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xuICAgIH1cblxuICAgIHZhciBvdXQgPSAnJztcbiAgICAvLyBHZW5lcmF0ZSB0aGUgcmVsYXRpdmUgcGF0aCBiYXNlZCBvbiB0aGUgcGF0aCBkaWZmZXJlbmNlIGJldHdlZW4gYHRvYFxuICAgIC8vIGFuZCBgZnJvbWBcbiAgICBmb3IgKGkgPSBmcm9tU3RhcnQgKyBsYXN0Q29tbW9uU2VwICsgMTsgaSA8PSBmcm9tRW5kOyArK2kpIHtcbiAgICAgIGlmIChpID09PSBmcm9tRW5kIHx8IGZyb20uY2hhckNvZGVBdChpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgaWYgKG91dC5sZW5ndGggPT09IDApXG4gICAgICAgICAgb3V0ICs9ICcuLic7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvdXQgKz0gJy8uLic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGFzdGx5LCBhcHBlbmQgdGhlIHJlc3Qgb2YgdGhlIGRlc3RpbmF0aW9uIChgdG9gKSBwYXRoIHRoYXQgY29tZXMgYWZ0ZXJcbiAgICAvLyB0aGUgY29tbW9uIHBhdGggcGFydHNcbiAgICBpZiAob3V0Lmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gb3V0ICsgdG8uc2xpY2UodG9TdGFydCArIGxhc3RDb21tb25TZXApO1xuICAgIGVsc2Uge1xuICAgICAgdG9TdGFydCArPSBsYXN0Q29tbW9uU2VwO1xuICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCkgPT09IDQ3IC8qLyovKVxuICAgICAgICArK3RvU3RhcnQ7XG4gICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCk7XG4gICAgfVxuICB9LFxuXG4gIF9tYWtlTG9uZzogZnVuY3Rpb24gX21ha2VMb25nKHBhdGgpIHtcbiAgICByZXR1cm4gcGF0aDtcbiAgfSxcblxuICBkaXJuYW1lOiBmdW5jdGlvbiBkaXJuYW1lKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcbiAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcbiAgICB2YXIgaGFzUm9vdCA9IGNvZGUgPT09IDQ3IC8qLyovO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICBmb3IgKHZhciBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDE7IC0taSkge1xuICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvclxuICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW5kID09PSAtMSkgcmV0dXJuIGhhc1Jvb3QgPyAnLycgOiAnLic7XG4gICAgaWYgKGhhc1Jvb3QgJiYgZW5kID09PSAxKSByZXR1cm4gJy8vJztcbiAgICByZXR1cm4gcGF0aC5zbGljZSgwLCBlbmQpO1xuICB9LFxuXG4gIGJhc2VuYW1lOiBmdW5jdGlvbiBiYXNlbmFtZShwYXRoLCBleHQpIHtcbiAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGV4dCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZXh0XCIgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZycpO1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICB2YXIgaTtcblxuICAgIGlmIChleHQgIT09IHVuZGVmaW5lZCAmJiBleHQubGVuZ3RoID4gMCAmJiBleHQubGVuZ3RoIDw9IHBhdGgubGVuZ3RoKSB7XG4gICAgICBpZiAoZXh0Lmxlbmd0aCA9PT0gcGF0aC5sZW5ndGggJiYgZXh0ID09PSBwYXRoKSByZXR1cm4gJyc7XG4gICAgICB2YXIgZXh0SWR4ID0gZXh0Lmxlbmd0aCAtIDE7XG4gICAgICB2YXIgZmlyc3ROb25TbGFzaEVuZCA9IC0xO1xuICAgICAgZm9yIChpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGNvZGUgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChmaXJzdE5vblNsYXNoRW5kID09PSAtMSkge1xuICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIHJlbWVtYmVyIHRoaXMgaW5kZXggaW4gY2FzZVxuICAgICAgICAgICAgLy8gd2UgbmVlZCBpdCBpZiB0aGUgZXh0ZW5zaW9uIGVuZHMgdXAgbm90IG1hdGNoaW5nXG4gICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgICAgIGZpcnN0Tm9uU2xhc2hFbmQgPSBpICsgMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGV4dElkeCA+PSAwKSB7XG4gICAgICAgICAgICAvLyBUcnkgdG8gbWF0Y2ggdGhlIGV4cGxpY2l0IGV4dGVuc2lvblxuICAgICAgICAgICAgaWYgKGNvZGUgPT09IGV4dC5jaGFyQ29kZUF0KGV4dElkeCkpIHtcbiAgICAgICAgICAgICAgaWYgKC0tZXh0SWR4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgdGhlIGV4dGVuc2lvbiwgc28gbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyIHBhdGhcbiAgICAgICAgICAgICAgICAvLyBjb21wb25lbnRcbiAgICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBFeHRlbnNpb24gZG9lcyBub3QgbWF0Y2gsIHNvIG91ciByZXN1bHQgaXMgdGhlIGVudGlyZSBwYXRoXG4gICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgICAgICAgICBleHRJZHggPSAtMTtcbiAgICAgICAgICAgICAgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXJ0ID09PSBlbmQpIGVuZCA9IGZpcnN0Tm9uU2xhc2hFbmQ7ZWxzZSBpZiAoZW5kID09PSAtMSkgZW5kID0gcGF0aC5sZW5ndGg7XG4gICAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBpZiAocGF0aC5jaGFyQ29kZUF0KGkpID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxuICAgICAgICAgIC8vIHBhdGggY29tcG9uZW50XG4gICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICAgICAgZW5kID0gaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVuZCA9PT0gLTEpIHJldHVybiAnJztcbiAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIH1cbiAgfSxcblxuICBleHRuYW1lOiBmdW5jdGlvbiBleHRuYW1lKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuICAgIHZhciBzdGFydERvdCA9IC0xO1xuICAgIHZhciBzdGFydFBhcnQgPSAwO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXG4gICAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcbiAgICB2YXIgcHJlRG90U3RhdGUgPSAwO1xuICAgIGZvciAodmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB2YXIgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgIHN0YXJ0UGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAgIC8vIGV4dGVuc2lvblxuICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgZW5kID0gaSArIDE7XG4gICAgICB9XG4gICAgICBpZiAoY29kZSA9PT0gNDYgLyouKi8pIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIGlzIG91ciBmaXJzdCBkb3QsIG1hcmsgaXQgYXMgdGhlIHN0YXJ0IG9mIG91ciBleHRlbnNpb25cbiAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKVxuICAgICAgICAgICAgc3RhcnREb3QgPSBpO1xuICAgICAgICAgIGVsc2UgaWYgKHByZURvdFN0YXRlICE9PSAxKVxuICAgICAgICAgICAgcHJlRG90U3RhdGUgPSAxO1xuICAgICAgfSBlbHNlIGlmIChzdGFydERvdCAhPT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBhbmQgbm9uLXBhdGggc2VwYXJhdG9yIGJlZm9yZSBvdXIgZG90LCBzbyB3ZSBzaG91bGRcbiAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cbiAgICAgICAgcHJlRG90U3RhdGUgPSAtMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhcnREb3QgPT09IC0xIHx8IGVuZCA9PT0gLTEgfHxcbiAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBjaGFyYWN0ZXIgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBkb3RcbiAgICAgICAgcHJlRG90U3RhdGUgPT09IDAgfHxcbiAgICAgICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xuICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydERvdCwgZW5kKTtcbiAgfSxcblxuICBmb3JtYXQ6IGZ1bmN0aW9uIGZvcm1hdChwYXRoT2JqZWN0KSB7XG4gICAgaWYgKHBhdGhPYmplY3QgPT09IG51bGwgfHwgdHlwZW9mIHBhdGhPYmplY3QgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJwYXRoT2JqZWN0XCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIHBhdGhPYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4gX2Zvcm1hdCgnLycsIHBhdGhPYmplY3QpO1xuICB9LFxuXG4gIHBhcnNlOiBmdW5jdGlvbiBwYXJzZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcblxuICAgIHZhciByZXQgPSB7IHJvb3Q6ICcnLCBkaXI6ICcnLCBiYXNlOiAnJywgZXh0OiAnJywgbmFtZTogJycgfTtcbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiByZXQ7XG4gICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XG4gICAgdmFyIGlzQWJzb2x1dGUgPSBjb2RlID09PSA0NyAvKi8qLztcbiAgICB2YXIgc3RhcnQ7XG4gICAgaWYgKGlzQWJzb2x1dGUpIHtcbiAgICAgIHJldC5yb290ID0gJy8nO1xuICAgICAgc3RhcnQgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHZhciBzdGFydERvdCA9IC0xO1xuICAgIHZhciBzdGFydFBhcnQgPSAwO1xuICAgIHZhciBlbmQgPSAtMTtcbiAgICB2YXIgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcbiAgICB2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTtcblxuICAgIC8vIFRyYWNrIHRoZSBzdGF0ZSBvZiBjaGFyYWN0ZXJzIChpZiBhbnkpIHdlIHNlZSBiZWZvcmUgb3VyIGZpcnN0IGRvdCBhbmRcbiAgICAvLyBhZnRlciBhbnkgcGF0aCBzZXBhcmF0b3Igd2UgZmluZFxuICAgIHZhciBwcmVEb3RTdGF0ZSA9IDA7XG5cbiAgICAvLyBHZXQgbm9uLWRpciBpbmZvXG4gICAgZm9yICg7IGkgPj0gc3RhcnQ7IC0taSkge1xuICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XG4gICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgIHN0YXJ0UGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAgIC8vIGV4dGVuc2lvblxuICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgZW5kID0gaSArIDE7XG4gICAgICB9XG4gICAgICBpZiAoY29kZSA9PT0gNDYgLyouKi8pIHtcbiAgICAgICAgICAvLyBJZiB0aGlzIGlzIG91ciBmaXJzdCBkb3QsIG1hcmsgaXQgYXMgdGhlIHN0YXJ0IG9mIG91ciBleHRlbnNpb25cbiAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSBzdGFydERvdCA9IGk7ZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpIHByZURvdFN0YXRlID0gMTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGFydERvdCAhPT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBhbmQgbm9uLXBhdGggc2VwYXJhdG9yIGJlZm9yZSBvdXIgZG90LCBzbyB3ZSBzaG91bGRcbiAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cbiAgICAgICAgcHJlRG90U3RhdGUgPSAtMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhcnREb3QgPT09IC0xIHx8IGVuZCA9PT0gLTEgfHxcbiAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxuICAgIHByZURvdFN0YXRlID09PSAwIHx8XG4gICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xuICAgIHByZURvdFN0YXRlID09PSAxICYmIHN0YXJ0RG90ID09PSBlbmQgLSAxICYmIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSB7XG4gICAgICBpZiAoZW5kICE9PSAtMSkge1xuICAgICAgICBpZiAoc3RhcnRQYXJ0ID09PSAwICYmIGlzQWJzb2x1dGUpIHJldC5iYXNlID0gcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKDEsIGVuZCk7ZWxzZSByZXQuYmFzZSA9IHJldC5uYW1lID0gcGF0aC5zbGljZShzdGFydFBhcnQsIGVuZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSkge1xuICAgICAgICByZXQubmFtZSA9IHBhdGguc2xpY2UoMSwgc3RhcnREb3QpO1xuICAgICAgICByZXQuYmFzZSA9IHBhdGguc2xpY2UoMSwgZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldC5uYW1lID0gcGF0aC5zbGljZShzdGFydFBhcnQsIHN0YXJ0RG90KTtcbiAgICAgICAgcmV0LmJhc2UgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgZW5kKTtcbiAgICAgIH1cbiAgICAgIHJldC5leHQgPSBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xuICAgIH1cblxuICAgIGlmIChzdGFydFBhcnQgPiAwKSByZXQuZGlyID0gcGF0aC5zbGljZSgwLCBzdGFydFBhcnQgLSAxKTtlbHNlIGlmIChpc0Fic29sdXRlKSByZXQuZGlyID0gJy8nO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSxcblxuICBzZXA6ICcvJyxcbiAgZGVsaW1pdGVyOiAnOicsXG4gIHdpbjMyOiBudWxsLFxuICBwb3NpeDogbnVsbFxufTtcblxucG9zaXgucG9zaXggPSBwb3NpeDtcblxubW9kdWxlLmV4cG9ydHMgPSBwb3NpeDtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJpbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBQdXp6bGUsIHBhcnNlRmlsZSB9IGZyb20gJy4vUHV6emxlJztcbmltcG9ydCB7IEltYWdlLCBjcmVhdGVDYW52YXMsIGxvYWRJbWFnZSB9IGZyb20gJ2NhbnZhcyc7XG5leHBvcnQgdHlwZSB7IENhbnZhcywgSW1hZ2UgfSBmcm9tICdjYW52YXMnO1xuY29uc3QgQk9YX1NJWkUgPSAxNjtcblxuLy8gY2F0ZWdvcmljYWwgY29sb3JzIGZyb21cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kMy9kMy1zY2FsZS1jaHJvbWF0aWMvdHJlZS92Mi4wLjAjc2NoZW1lQ2F0ZWdvcnkxMFxuY29uc3QgQ09MT1JTOiBBcnJheTxzdHJpbmc+ID0gW1xuICAgICcjMWY3N2I0JyxcbiAgICAnI2ZmN2YwZScsXG4gICAgJyMyY2EwMmMnLFxuICAgICcjZDYyNzI4JyxcbiAgICAnIzk0NjdiZCcsXG4gICAgJyM4YzU2NGInLFxuICAgICcjZTM3N2MyJyxcbiAgICAnIzdmN2Y3ZicsXG4gICAgJyNiY2JkMjInLFxuICAgICcjMTdiZWNmJyxcbl07XG5cbi8vIHNlbWl0cmFuc3BhcmVudCB2ZXJzaW9ucyBvZiB0aG9zZSBjb2xvcnNcbmNvbnN0IEJBQ0tHUk9VTkRTID0gQ09MT1JTLm1hcCggKGNvbG9yKSA9PiBjb2xvciArICc2MCcgKTtcblxuLyoqXG4gKiBEcmF3IGEgYmxhY2sgc3F1YXJlIGZpbGxlZCB3aXRoIGEgcmFuZG9tIGNvbG9yLlxuICogXG4gKiBAcGFyYW0gY2FudmFzIGNhbnZhcyB0byBkcmF3IG9uXG4gKiBAcGFyYW0geCB4IHBvc2l0aW9uIG9mIGNlbnRlciBvZiBib3hcbiAqIEBwYXJhbSB5IHkgcG9zaXRpb24gb2YgY2VudGVyIG9mIGJveFxuICovXG5leHBvcnQgZnVuY3Rpb24gZHJhd0JveChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBhc3NlcnQoY29udGV4dCAhPT0gbnVsbCwgJ3VuYWJsZSB0byBnZXQgY2FudmFzIGRyYXdpbmcgY29udGV4dCcpO1xuXG4gICAgLy8gc2F2ZSBvcmlnaW5hbCBjb250ZXh0IHNldHRpbmdzIGJlZm9yZSB3ZSB0cmFuc2xhdGUgYW5kIGNoYW5nZSBjb2xvcnNcbiAgICBjb250ZXh0LnNhdmUoKTtcblxuICAgIC8vIHRyYW5zbGF0ZSB0aGUgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgdGhlIGRyYXdpbmcgY29udGV4dDpcbiAgICAvLyAgIHRoZSBvcmlnaW4gb2YgYGNvbnRleHRgIHdpbGwgbm93IGJlICh4LHkpXG4gICAgY29udGV4dC50cmFuc2xhdGUoeCwgeSk7XG5cbiAgICAvLyBkcmF3IHRoZSBvdXRlciBvdXRsaW5lIGJveCBjZW50ZXJlZCBvbiB0aGUgb3JpZ2luICh3aGljaCBpcyBub3cgKHgseSkpXG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAyO1xuICAgIGNvbnRleHQuc3Ryb2tlUmVjdCgtQk9YX1NJWkUvMiwgLUJPWF9TSVpFLzIsIEJPWF9TSVpFLCBCT1hfU0laRSk7XG5cbiAgICAvLyBmaWxsIHdpdGggYSByYW5kb20gc2VtaXRyYW5zcGFyZW50IGNvbG9yXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBCQUNLR1JPVU5EU1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBCQUNLR1JPVU5EUy5sZW5ndGgpXSA/PyBhc3NlcnQuZmFpbCgpO1xuICAgIGNvbnRleHQuZmlsbFJlY3QoLUJPWF9TSVpFLzIsIC1CT1hfU0laRS8yLCBCT1hfU0laRSwgQk9YX1NJWkUpO1xuXG4gICAgLy8gcmVzZXQgdGhlIG9yaWdpbiBhbmQgc3R5bGVzIGJhY2sgdG8gZGVmYXVsdHNcbiAgICBjb250ZXh0LnJlc3RvcmUoKTtcbn1cblxuXG4vKipcbiAqIERyYXcgYSAxMHgxMCBncmlkIG9uIHRoZSBjYW52YXMuXG4gKiBcbiAqIEBwYXJhbSBjYW52YXMgY2FudmFzIHRvIGRyYXcgb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRyYXdHcmlkKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHB1enpsZTogUHV6emxlKTogdm9pZCB7XG4gICAgXG4gICAgY29uc3Qgd2lkdGggPSBjYW52YXMud2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICBhc3NlcnQoY29udGV4dCwgJ3VuYWJsZSB0byBnZXQgY2FudmFzIGRyYXdpbmcgY29udGV4dCcpO1xuXG4gICAgY29udGV4dC5zYXZlKCk7XG5cbiAgICBjb25zdCBudW1Sb3dzID0gcHV6emxlLnJvd3M7XG4gICAgY29uc3QgbnVtQ29scyA9IHB1enpsZS5jb2x1bW5zO1xuICAgIGNvbnN0IHhJbmNyZW1lbnQgPSBoZWlnaHQvbnVtUm93cztcbiAgICBjb25zdCB5SW5jcmVtZW50ID0gd2lkdGgvbnVtQ29scztcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgICBcbiAgICAvLyBkcmF3IGJveCBvdXRsaW5lXG4gICAgY29udGV4dC5saW5lV2lkdGggPSAzO1xuICAgIGZvciAoY29uc3QgZGVzdCBvZiBbe3g6IDAsIHk6IGhlaWdodH0sIHt4OiB3aWR0aCwgeTogMH1dKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc3RhcnQgb2YgW3t4OiAwLCB5OiAwfSwge3g6IHdpZHRoLCB5OiBoZWlnaHR9XSkge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhzdGFydC54LCBzdGFydC55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oZGVzdC54LCBkZXN0LnkpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGRyYXcgZ3JpZCBsaW5lc1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMC41O1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbnVtQ29sczsgaSsrKSB7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHhJbmNyZW1lbnQqaSwgMCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHhJbmNyZW1lbnQqaSwgaGVpZ2h0KTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBudW1Sb3dzOyBpKyspIHtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oMCwgeUluY3JlbWVudCppKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8od2lkdGgsIHlJbmNyZW1lbnQqaSk7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgfVxuXG4gICAgLy8gcmVzZXQgdGhlIG9yaWdpbiBhbmQgc3R5bGVzIGJhY2sgdG8gZGVmYXVsdHNcbiAgICBjb250ZXh0LnJlc3RvcmUoKTtcbn1cblxuLyoqXG4gKiBEcmF3IHRoZSBwdXp6bGUgbGluZXMuXG4gKiBcbiAqIEBwYXJhbSBjYW52YXMgY2FudmFzIHRvIGRyYXcgb25cbiAqIEBwYXJhbSBsaW5lcyBhbiBhcnJheSBvZiBzdGFydCBhbmQgZW5kIHBvaW50cyBvZiBsaW5lc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZHJhd1B1enpsZShjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBwdXp6bGU6IFB1enpsZSk6IE1hcDxudW1iZXIsIHN0cmluZz4ge1xuICAgIGNvbnN0IGJsb2NrTGluZXM6IEFycmF5PHtzdGFydDoge3g6IG51bWJlciwgeTogbnVtYmVyfSwgZW5kOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9fT4gPSBuZXcgQXJyYXkoKTtcbiAgICBjb25zdCByZWdpb25zID0gcHV6emxlLmdldFJlZ2lvbnMoKTtcbiAgICBjb25zdCBjb29yZENvbG9yczogTWFwPG51bWJlciwgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAgIGNvbnN0IHdpZHRoID0gY2FudmFzLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGFzc2VydChjb250ZXh0LCAndW5hYmxlIHRvIGdldCBjYW52YXMgZHJhd2luZyBjb250ZXh0Jyk7XG5cbiAgICBjb250ZXh0LnNhdmUoKTtcblxuICAgIGNvbnN0IG51bVJvd3MgPSBwdXp6bGUucm93cztcbiAgICBjb25zdCBudW1Db2xzID0gcHV6emxlLmNvbHVtbnM7XG4gICAgY29uc3QgeEluY3JlbWVudCA9IGhlaWdodC9udW1Sb3dzO1xuICAgIGNvbnN0IHlJbmNyZW1lbnQgPSB3aWR0aC9udW1Db2xzO1xuICAgIFxuXG4gICAgZm9yKGxldCBpPTA7IGk8cmVnaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVnaW9uID0gcmVnaW9uc1tpXTtcbiAgICAgICAgYXNzZXJ0KHJlZ2lvbik7XG4gICAgICAgIGNvbnN0IHJvd1N0YXJ0czogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3Qgcm93RW5kczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3QgY29sU3RhcnRzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuICAgICAgICBjb25zdCBjb2xFbmRzOiBNYXA8bnVtYmVyLCBudW1iZXI+ID0gbmV3IE1hcCgpO1xuXG4gICAgICAgIGZvcihjb25zdCBjb29yZCBvZiByZWdpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGNvb3JkLnJvdy0xO1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gY29vcmQuY29sdW1uLTE7XG5cbiAgICAgICAgICAgIGNvbnRleHQudHJhbnNsYXRlKHhJbmNyZW1lbnQqKHJvdyksIHlJbmNyZW1lbnQqKGNvbCkpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBCQUNLR1JPVU5EU1tpXSA/PyBhc3NlcnQuZmFpbChcImNvdWxkbid0IGdldCBiYWNrZ3JvdW5kIGNvbG9yXCIpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCB4SW5jcmVtZW50LCB5SW5jcmVtZW50KTtcbiAgICAgICAgICAgIGNvbnRleHQudHJhbnNsYXRlKC14SW5jcmVtZW50Kihyb3cpLCAteUluY3JlbWVudCooY29sKSk7XG5cbiAgICAgICAgICAgIGNvb3JkQ29sb3JzLnNldChyb3cqbnVtUm93cytjb2wsIEJBQ0tHUk9VTkRTW2ldID8/IGFzc2VydC5mYWlsKFwiY291bGRuJ3QgZ2V0IGJhY2tncm91bmQgY29sb3JcIikpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihjb2xTdGFydHMuaGFzKHJvdykpIHtcbiAgICAgICAgICAgICAgICBjb2xTdGFydHMuc2V0KHJvdywgTWF0aC5taW4oY29sU3RhcnRzLmdldChyb3cpISwgY29sKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbFN0YXJ0cy5zZXQocm93LCBjb2wpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoY29sRW5kcy5oYXMocm93KSkge1xuICAgICAgICAgICAgICAgIGNvbEVuZHMuc2V0KHJvdywgTWF0aC5tYXgoY29sRW5kcy5nZXQocm93KSEsIGNvbCsxKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbEVuZHMuc2V0KHJvdywgY29sKzEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocm93U3RhcnRzLmhhcyhjb2wpKSB7XG4gICAgICAgICAgICAgICAgcm93U3RhcnRzLnNldChjb2wsIE1hdGgubWluKHJvd1N0YXJ0cy5nZXQoY29sKSEsIHJvdykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3dTdGFydHMuc2V0KGNvbCwgcm93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHJvd0VuZHMuaGFzKGNvbCkpIHtcbiAgICAgICAgICAgICAgICByb3dFbmRzLnNldChjb2wsIE1hdGgubWF4KHJvd0VuZHMuZ2V0KGNvbCkhLCByb3crMSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3dFbmRzLnNldChjb2wsIHJvdysxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDM7XG5cbiAgICAgICAgLy8gZHJhdyBibG9ja2xpbmVzIFxuICAgICAgICBmb3IoY29uc3QgW3Jvdywgcm93U3RhcnRdIG9mIHJvd1N0YXJ0cykge1xuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHJvd1N0YXJ0KnhJbmNyZW1lbnQsIHJvdyp5SW5jcmVtZW50KTtcbiAgICAgICAgICAgIGNvbnRleHQubGluZVRvKHJvd1N0YXJ0KnhJbmNyZW1lbnQsIChyb3crMSkqeUluY3JlbWVudCk7XG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICB9XG4gICAgICAgIGZvcihjb25zdCBbY29sLCBjb2xTdGFydF0gb2YgY29sU3RhcnRzKSB7XG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY29udGV4dC5tb3ZlVG8oY29sKnhJbmNyZW1lbnQsIGNvbFN0YXJ0KnlJbmNyZW1lbnQpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lVG8oKGNvbCsxKSp4SW5jcmVtZW50LCBjb2xTdGFydCp5SW5jcmVtZW50KTtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGNvbnN0IFtyb3csIHJvd0VuZF0gb2Ygcm93RW5kcykge1xuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHJvd0VuZCp4SW5jcmVtZW50LCByb3cqeUluY3JlbWVudCk7XG4gICAgICAgICAgICBjb250ZXh0LmxpbmVUbyhyb3dFbmQqeEluY3JlbWVudCwgKHJvdysxKSp5SW5jcmVtZW50KTtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yKGNvbnN0IFtjb2wsIGNvbEVuZF0gb2YgY29sRW5kcykge1xuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKGNvbCp4SW5jcmVtZW50LCBjb2xFbmQqeUluY3JlbWVudCk7XG4gICAgICAgICAgICBjb250ZXh0LmxpbmVUbygoY29sKzEpKnhJbmNyZW1lbnQsIGNvbEVuZCp5SW5jcmVtZW50KTtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29vcmRDb2xvcnM7XG59XG5cbi8qKlxuICogRHJhdyBzdGFycy5cbiAqIFxuICogQHBhcmFtIGNhbnZhcyBjYW52YXMgdG8gZHJhdyBvblxuICogQHBhcmFtIHN0YXIgKHJvdywgY29sdW1uKSBvZiBzdGFyc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZHJhd1N0YXIoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgcHV6emxlOiBQdXp6bGUsIHN0YXJDb29yZDoge3JvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlcn0pOiB2b2lkIHtcbiAgICBjb25zdCB3aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBhc3NlcnQoY29udGV4dCwgJ3VuYWJsZSB0byBnZXQgY2FudmFzIGRyYXdpbmcgY29udGV4dCcpO1xuICAgIGNvbnN0IG51bVJvd3MgPSBwdXp6bGUucm93cztcbiAgICBjb25zdCBudW1Db2xzID0gcHV6emxlLmNvbHVtbnM7XG4gICAgY29uc3QgeEluY3JlbWVudCA9IGhlaWdodC9udW1Sb3dzO1xuICAgIGNvbnN0IHlJbmNyZW1lbnQgPSB3aWR0aC9udW1Db2xzO1xuXG4gICAgY29uc3QgZm9udCA9ICczMHB0IGJvbGQnO1xuXG4gICAgLy8gbWFrZSBhIHRpbnkgMXgxIGltYWdlIGF0IGZpcnN0IHNvIHRoYXQgd2UgY2FuIGdldCBhIEdyYXBoaWNzIG9iamVjdCwgXG4gICAgLy8gd2hpY2ggd2UgbmVlZCB0byBjb21wdXRlIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSB0ZXh0XG4gICAgY29uc3QgbWVhc3VyaW5nQ29udGV4dCA9IGNyZWF0ZUNhbnZhcygxLCAxKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgIG1lYXN1cmluZ0NvbnRleHQuZm9udCA9IGZvbnQ7XG4gICAgY29uc3QgZm9udE1ldHJpY3MgPSBtZWFzdXJpbmdDb250ZXh0Lm1lYXN1cmVUZXh0KCfirZDvuI8nKTtcblxuICAgIC8vIG5vdyBtYWtlIGEgY2FudmFzIHNpemVkIHRvIGZpdCB0aGUgdGV4dFxuICAgIC8vIHNhdmUgb3JpZ2luYWwgY29udGV4dCBzZXR0aW5ncyBiZWZvcmUgd2UgdHJhbnNsYXRlIGFuZCBjaGFuZ2UgY29sb3JzXG4gICAgY29udGV4dC5zYXZlKCk7XG5cbiAgICAvLyB0cmFuc2xhdGUgdGhlIGNvb3JkaW5hdGUgc3lzdGVtIG9mIHRoZSBkcmF3aW5nIGNvbnRleHQ6XG4gICAgLy8gICB0aGUgb3JpZ2luIG9mIGBjb250ZXh0YCB3aWxsIG5vdyBiZSAoeCx5KVxuICAgIGNvbnN0IHN0YXJXaWR0aCA9IGZvbnRNZXRyaWNzLndpZHRoO1xuICAgIGNvbnN0IHN0YXJIZWlnaHQgPSBmb250TWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveEFzY2VudCArIGZvbnRNZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94RGVzY2VudDtcbiAgICBjb25zdCByb3cgPSBzdGFyQ29vcmQuY29sdW1uLTE7XG4gICAgY29uc3QgY29sID0gc3RhckNvb3JkLnJvdy0xO1xuICAgIGNvbnN0IHhPZmZzZXQgPSAoeEluY3JlbWVudC1zdGFyV2lkdGgpLzI7XG4gICAgY29uc3QgeU9mZnNldCA9ICh5SW5jcmVtZW50LXN0YXJIZWlnaHQpLzI7XG4gICAgY29udGV4dC50cmFuc2xhdGUocm93KnhJbmNyZW1lbnQreE9mZnNldCwgY29sKnlJbmNyZW1lbnQreU9mZnNldCk7XG5cbiAgICBjb250ZXh0LmZvbnQgPSBmb250O1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICBjb250ZXh0LmZpbGxUZXh0KCfirZDvuI8nLCAwLCBmb250TWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveEFzY2VudCk7XG5cbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgICBjb250ZXh0LnN0cm9rZVRleHQoJ+KtkO+4jycsIDAsIGZvbnRNZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50KTtcblxuICAgIGNvbnRleHQudHJhbnNsYXRlKC0ocm93KnhJbmNyZW1lbnQreE9mZnNldCksIC0oY29sKnlJbmNyZW1lbnQreU9mZnNldCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU3RhcihjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBwdXp6bGU6IFB1enpsZSwgc3RhckNvb3JkOiB7cm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyfSwgY29vcmRDb2xvcnM6IE1hcDxudW1iZXIsIHN0cmluZz4pOiB2b2lkIHtcbiAgICBjb25zdCB3aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBhc3NlcnQoY29udGV4dCwgJ3VuYWJsZSB0byBnZXQgY2FudmFzIGRyYXdpbmcgY29udGV4dCcpO1xuICAgIGNvbnN0IG51bVJvd3MgPSBwdXp6bGUucm93cztcbiAgICBjb25zdCBudW1Db2xzID0gcHV6emxlLmNvbHVtbnM7XG4gICAgY29uc3QgeEluY3JlbWVudCA9IGhlaWdodC9udW1Sb3dzO1xuICAgIGNvbnN0IHlJbmNyZW1lbnQgPSB3aWR0aC9udW1Db2xzO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMztcbiAgICBjb25zdCBibG9ja09mZnNldCA9IDEuMDtcblxuICAgIGNvbnN0IHJvdyA9IHN0YXJDb29yZC5yb3ctMTtcbiAgICBjb25zdCBjb2wgPSBzdGFyQ29vcmQuY29sdW1uLTE7XG5cbiAgICBjb250ZXh0LnRyYW5zbGF0ZSh5SW5jcmVtZW50Kihjb2wpLCB4SW5jcmVtZW50Kihyb3cpKTtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgY29udGV4dC5maWxsUmVjdChibG9ja09mZnNldCwgYmxvY2tPZmZzZXQsIHhJbmNyZW1lbnQtMipibG9ja09mZnNldCwgeUluY3JlbWVudC0yKmJsb2NrT2Zmc2V0KTtcbiAgICBjb250ZXh0LnRyYW5zbGF0ZSgteUluY3JlbWVudCooY29sKSwgLXhJbmNyZW1lbnQqKHJvdykpO1xuXG4gICAgY29udGV4dC50cmFuc2xhdGUoeUluY3JlbWVudCooY29sKSwgeEluY3JlbWVudCoocm93KSk7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBjb29yZENvbG9ycy5nZXQoY29sKm51bVJvd3Mrcm93KSA/PyBhc3NlcnQuZmFpbCgnYWxsIGJsb2NrcyBtdXN0IGJlIGFzc2lnbmVkIGNvbG9yJyk7ICAgIFxuICAgIGNvbnRleHQuZmlsbFJlY3QoYmxvY2tPZmZzZXQsIGJsb2NrT2Zmc2V0LCB4SW5jcmVtZW50LTIqYmxvY2tPZmZzZXQsIHlJbmNyZW1lbnQtMipibG9ja09mZnNldCk7XG4gICAgY29udGV4dC50cmFuc2xhdGUoLXlJbmNyZW1lbnQqKGNvbCksIC14SW5jcmVtZW50Kihyb3cpKTtcbiAgICBcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJhd0Jsb2NrKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHB1enpsZTogUHV6emxlLCBibG9ja0Nvb3JkOiB7cm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyfSk6IHZvaWQge1xuICAgIGNvbnN0IHdpZHRoID0gY2FudmFzLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGFzc2VydChjb250ZXh0LCAndW5hYmxlIHRvIGdldCBjYW52YXMgZHJhd2luZyBjb250ZXh0Jyk7XG4gICAgY29uc3QgbnVtUm93cyA9IHB1enpsZS5yb3dzO1xuICAgIGNvbnN0IG51bUNvbHMgPSBwdXp6bGUuY29sdW1ucztcbiAgICBjb25zdCB4SW5jcmVtZW50ID0gaGVpZ2h0L251bVJvd3M7XG4gICAgY29uc3QgeUluY3JlbWVudCA9IHdpZHRoL251bUNvbHM7XG4gICAgY29uc3QgYmxvY2tPZmZzZXQgPSAwLjE7XG5cbiAgICBjb25zdCBmb250ID0gJzMwcHQgYm9sZCc7XG5cbiAgICAvLyBtYWtlIGEgdGlueSAxeDEgaW1hZ2UgYXQgZmlyc3Qgc28gdGhhdCB3ZSBjYW4gZ2V0IGEgR3JhcGhpY3Mgb2JqZWN0LCBcbiAgICAvLyB3aGljaCB3ZSBuZWVkIHRvIGNvbXB1dGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHRleHRcbiAgICBjb25zdCBtZWFzdXJpbmdDb250ZXh0ID0gY3JlYXRlQ2FudmFzKDEsIDEpLmdldENvbnRleHQoJzJkJyk7XG4gICAgbWVhc3VyaW5nQ29udGV4dC5mb250ID0gZm9udDtcbiAgICBjb25zdCBmb250TWV0cmljcyA9IG1lYXN1cmluZ0NvbnRleHQubWVhc3VyZVRleHQoJ/CfmqsnKTtcblxuICAgIC8vIG5vdyBtYWtlIGEgY2FudmFzIHNpemVkIHRvIGZpdCB0aGUgdGV4dFxuICAgIC8vIHNhdmUgb3JpZ2luYWwgY29udGV4dCBzZXR0aW5ncyBiZWZvcmUgd2UgdHJhbnNsYXRlIGFuZCBjaGFuZ2UgY29sb3JzXG4gICAgY29udGV4dC5zYXZlKCk7XG5cbiAgICAvLyB0cmFuc2xhdGUgdGhlIGNvb3JkaW5hdGUgc3lzdGVtIG9mIHRoZSBkcmF3aW5nIGNvbnRleHQ6XG4gICAgLy8gICB0aGUgb3JpZ2luIG9mIGBjb250ZXh0YCB3aWxsIG5vdyBiZSAoeCx5KVxuICAgIGNvbnN0IGJsb2NrV2lkdGggPSBmb250TWV0cmljcy53aWR0aDtcbiAgICBjb25zdCBibG9ja0hlaWdodCA9IGZvbnRNZXRyaWNzLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50ICsgZm9udE1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hEZXNjZW50O1xuICAgIGNvbnN0IHJvdyA9IGJsb2NrQ29vcmQuY29sdW1uLTE7XG4gICAgY29uc3QgY29sID0gYmxvY2tDb29yZC5yb3ctMTtcbiAgICBjb25zdCB4T2Zmc2V0ID0gKHhJbmNyZW1lbnQtYmxvY2tXaWR0aCkvMjtcbiAgICBjb25zdCB5T2Zmc2V0ID0gKHlJbmNyZW1lbnQtYmxvY2tIZWlnaHQpLzI7XG4gICAgY29udGV4dC50cmFuc2xhdGUocm93KnhJbmNyZW1lbnQreE9mZnNldCwgY29sKnlJbmNyZW1lbnQreU9mZnNldCk7XG5cbiAgICBjb250ZXh0LmZvbnQgPSBmb250O1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICBjb250ZXh0LmZpbGxUZXh0KCfwn5qrJywgMCwgZm9udE1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hBc2NlbnQpO1xuXG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgY29udGV4dC5zdHJva2VUZXh0KCfwn5qrJywgMCwgZm9udE1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hBc2NlbnQpO1xuXG4gICAgY29udGV4dC50cmFuc2xhdGUoLShyb3cqeEluY3JlbWVudCt4T2Zmc2V0KSwgLShjb2wqeUluY3JlbWVudCt5T2Zmc2V0KSk7XG59XG5cbi8qKlxuICogU2V0IHVwIHRoZSBtYWluIHBhZ2UuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudCA/PyBhc3NlcnQuZmFpbCgnbWlzc2luZyBkcmF3aW5nIGNhbnZhcycpO1xuICAgIGNvbnN0IHB1enpsZTogUHV6emxlID0gYXdhaXQgcGFyc2VGaWxlKCcuLi9wdXp6bGVzL2tkLTEtMS0xLnN0YXJiJyk7XG4gICAgZHJhd0dyaWQoY2FudmFzLCBwdXp6bGUpO1xuICAgIGRyYXdQdXp6bGUoY2FudmFzLCBwdXp6bGUpO1xuXG59XG5cbm1haW4oKTtcbiIsImltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IHBhcnNlUHV6emxlIH0gZnJvbSAnLi9QdXp6bGVQYXJzZXInO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuZXhwb3J0IGVudW0gQ2VsbFN0YXRlcyB7XG4gICAgRW1wdHksIFN0YXIsIEJsb2NrZWRcbn1cblxuLyoqXG4gKiBBRFQgZm9yIGEgU3RhciBCYXR0bGUgcHV6emxlIGJvYXJkXG4gKi9cbmV4cG9ydCBjbGFzcyBQdXp6bGUgeyAgICBcbiAgICAvLyBBYnN0cmFjdGlvbiBmdW5jdGlvbjpcbiAgICAvLyAgIEFGKHJvd3MsIGNvbHVtbnMsIHJlZ2lvbnMsIHNxdWFyZXMpOiBhIFN0YXIgQmF0dGxlIGJvYXJkIHdpdGggZGltZW5zaW9ucyBgcm93c2AgYnkgYGNvbHVtbnNgLCB3aXRoIGByZWdpb25zYCByZXByZXNlbnRpbmcgYWxsIHRoZSBjZWxscyBpbiBlYWNoIHJlZ2lvbiBvZiB0aGUgYm9hcmQgYW5kIGBzcXVhcmVzYCByZXByZXNlbnRpbmcgdGhlIGNlbGwgc3RhdGUgb2YgZXZlcnkgY2VsbCBvbiB0aGUgYm9hcmQgKGVtcHR5LCBzdGFyLCBvciBibG9ja2VkKS5cbiAgICAvLyBSZXByZXNlbnRhdGlvbiBpbnZhcmlhbnQ6XG4gICAgLy8gICAtIGByb3dzYCBhbmQgYGNvbHVtbnNgIGFuZCBzaXplIG9mIGByZWdpb25zYCA9PT0gMTBcbiAgICAvLyAgIC0gdG90YWwgbnVtYmVyIG9mIGNlbGxzIGFjcm9zcyBgcmVnaW9uc2AgPT09IDEwMFxuICAgIC8vICAgLSBlYWNoIGNvb3JkaW5hdGUgb2YgYSBjZWxsIGluIGByZWdpb25zYCBpcyAxLWluZGV4ZWQgYmV0d2VlbiAxIGFuZCAxMCBpbmNsdXNpdmVcbiAgICAvLyBTYWZldHkgZnJvbSByZXAgZXhwb3N1cmU6XG4gICAgLy8gICAtIGByb3dzYCBhbmQgYGNvbHVtbnNgIGFyZSByZWFkb25seSBhbmQgaW1tdXRhYmxlXG4gICAgLy8gICAtIGBzcXVhcmVzYCBhbmQgYHJlZ2lvbnNgIGFyZSBwcml2YXRlIGFuZCByZWFkb25seVxuICAgIC8vICAgLSBgc3F1YXJlc2AgYW5kIGByZWdpb25zYCB3aWxsIG5ldmVyIGJlIGRpcmVjdGx5IHJldHVybmVkIGZyb20gaW5zdGFuY2UgbWV0aG9kc1xuICAgIC8vICAgLSBjb25zdHJ1Y3RvciBtYWtlcyBhIGRlZmVuc2l2ZSBjb3B5IG9mIGByZWdpb25zYFxuICAgIFxuICAgIHB1YmxpYyByZWFkb25seSByb3dzOiBudW1iZXI7XG4gICAgcHVibGljIHJlYWRvbmx5IGNvbHVtbnM6IG51bWJlcjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgc3F1YXJlczogQXJyYXk8Q2VsbFN0YXRlcz47XG4gICAgcHJpdmF0ZSByZWFkb25seSByZWdpb25zOiBNYXA8bnVtYmVyLCBBcnJheTxbbnVtYmVyLCBudW1iZXJdPj47XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gcmVnaW9ucyB0aGUgbWFwIGNvbnRhaW5pbmcgdGhlIGNvb3JkaW5hdGVzIG9mIGFsbCB0aGUgY2VsbHMgaW4gdGhlIDEwIHJlZ2lvbnMgb2YgdGhlIHB1enpsZVxuICAgICAqIEB0aHJvd3MgZXJyb3IgaWYgYW55IG9mIHRoZSByZXAgaW52YXJpYW50cyBhcmUgdmlvbGF0ZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgICAgIHJlZ2lvbnM6IE1hcDxudW1iZXIsIEFycmF5PFtudW1iZXIsIG51bWJlcl0+PixcbiAgICApIHtcbiAgICAgICAgdGhpcy5yb3dzID0gMTA7XG4gICAgICAgIHRoaXMuY29sdW1ucyA9IDEwO1xuXG4gICAgICAgIHRoaXMuc3F1YXJlcyA9IG5ldyBBcnJheTxDZWxsU3RhdGVzPih0aGlzLnJvd3MqdGhpcy5jb2x1bW5zKTtcbiAgICAgICAgdGhpcy5yZWdpb25zID0gbmV3IE1hcDxudW1iZXIsIEFycmF5PFtudW1iZXIsIG51bWJlcl0+PigpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yb3dzKnRoaXMuY29sdW1uczsgKytpKSB7XG4gICAgICAgICAgICB0aGlzLnNxdWFyZXNbaV0gPSBDZWxsU3RhdGVzLkVtcHR5O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgcmVnaW9ucy5rZXlzKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVnaW9ucy5zZXQoa2V5LCAocmVnaW9ucy5nZXQoa2V5KSA/PyBhc3NlcnQuZmFpbCgpKS5tYXAobGlzdCA9PiBbbGlzdFswXSwgbGlzdFsxXV0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2hlY2tSZXAoKTtcbiAgICB9XG5cbiAgICAvLyBBc3NlcnRzIHRoZSByZXAgaW52YXJpYW50XG4gICAgcHJpdmF0ZSBjaGVja1JlcCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZGltZW5zaW9uID0gMTA7XG4gICAgICAgIGFzc2VydCh0aGlzLnJvd3MgPT09IGRpbWVuc2lvbiwgXCJudW1iZXIgb2Ygcm93cyBtdXN0IGJlIDEwXCIpO1xuICAgICAgICBhc3NlcnQodGhpcy5jb2x1bW5zID09PSBkaW1lbnNpb24sIFwibnVtYmVyIG9mIGNvbHVtbnMgbXVzdCBiZSAxMFwiKTtcbiAgICAgICAgYXNzZXJ0KHRoaXMucmVnaW9ucy5zaXplID09PSBkaW1lbnNpb24sIFwibnVtYmVyIG9mIHJlZ2lvbnMgbXVzdCBiZSAxMFwiKTtcbiAgICAgICAgbGV0IHRvdGFsQ2VsbHMgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHJlZ2lvbiBvZiB0aGlzLnJlZ2lvbnMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiByZWdpb24pIHtcbiAgICAgICAgICAgICAgICB0b3RhbENlbGxzICs9IDE7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gY2VsbFswXSA/PyBhc3NlcnQuZmFpbChcImNlbGwgaXMgbWlzc2luZyByb3cgdmFsdWVcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uID0gY2VsbFsxXSA/PyBhc3NlcnQuZmFpbChcImNlbGwgaXMgbWlzc2luZyByb3cgdmFsdWVcIik7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KHJvdyA+PSAxICYmIHJvdyA8PSBkaW1lbnNpb24sIFwiY29vcmRpbmF0ZXMgbXVzdCBiZSAxLWluZGV4ZWQgYW5kIGJlIGJldHdlZW4gMSBhbmQgMTBcIik7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGNvbHVtbiA+PSAxICYmIHJvdyA8PSBkaW1lbnNpb24sIFwiY29vcmRpbmF0ZXMgbXVzdCBiZSAxLWluZGV4ZWQgYW5kIGJlIGJldHdlZW4gMSBhbmQgMTBcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXJ0KHRvdGFsQ2VsbHMgPT09IGRpbWVuc2lvbipkaW1lbnNpb24sIFwibXVzdCBoYXZlIHRvdGFsIG9mIDEwMCBjZWxscyBvdmVyIGFsbCByZWdpb25zXCIpO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAgKiBHZXR0ZXIgZnVuY3Rpb24gZm9yIHRoaXMucmVnaW9uc1xuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEFycmF5PEFycmF5PHtyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXJ9Pj4gYXJyYXkgb2YgYWxsIHRoZSByZWdpb25zXG4gICAgICovXG4gICAgcHVibGljIGdldFJlZ2lvbnMoKTogQXJyYXk8QXJyYXk8e3JvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlcn0+PiB7XG4gICAgICAgIGNvbnN0IHJlZ2lvbnMgPSBbXTtcbiAgICAgICAgZm9yKGNvbnN0IFtrZXksIHJlZ2lvbl0gb2YgdGhpcy5yZWdpb25zKSB7XG4gICAgICAgICAgICBjb25zdCByZWdpb25Db29yZHMgPSBbXTtcbiAgICAgICAgICAgIGZvcihjb25zdCBjb29yZCBvZiByZWdpb24pIHtcbiAgICAgICAgICAgICAgICByZWdpb25Db29yZHMucHVzaCh7cm93OiBjb29yZFswXSwgY29sdW1uOiBjb29yZFsxXX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVnaW9ucy5wdXNoKHJlZ2lvbkNvb3Jkcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlZ2lvbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTXV0YXRlcyBwdXp6bGUgYnkgcmVtb3ZpbmcgYWxsIHN0YXJzXG4gICAgICogXG4gICAgICovXG5cbiAgICBwdWJsaWMgZW1wdHlQdXp6bGUoKTogdm9pZCB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yb3dzKnRoaXMuY29sdW1uczsgKytpKSB7XG4gICAgICAgICAgICB0aGlzLnNxdWFyZXNbaV0gPSBDZWxsU3RhdGVzLkVtcHR5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGVhY2ggcmVnaW9uIG9mIHRoZSBwdXp6bGUgaGFzIGV4YWN0bHkgdGhlIG5lZWRlZCBudW1iZXIgb2Ygc3RhcnMsIGFuZCBubyBzdGFycyBhcmUgXG4gICAgICogdmVydGljYWxseSwgaG9yaXpvbnRhbGx5LCBvciBkaWFnb25hbGx5IGFkamFjZW50LlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgdGhlIHB1enpsZSBpcyBzb2x2ZWQ7IGZhbHNlIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHB1YmxpYyBpc1NvbHZlZCgpOiBib29sZWFuIHtcbiAgICAgICAgLy8gQ2hlY2sgdGhhdCBlYWNoIHJvdyBoYXMgdGhlIG51bWJlciBvZiBzdGFycyBuZWVkZWRcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJvd3M7ICsraSkge1xuICAgICAgICAgICAgbGV0IHRvdGFsU3RhcnMgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmNvbHVtbnM7ICsraikge1xuICAgICAgICAgICAgICAgIHRvdGFsU3RhcnMgKz0gdGhpcy5zcXVhcmVzW3RoaXMuY29sdW1ucyppICsgal0gPT09IENlbGxTdGF0ZXMuU3RhciA/IDEgOiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodG90YWxTdGFycyAhPT0gMikgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDaGVjayB0aGF0IGVhY2ggY29sdW1uIGhhcyB0aGUgbnVtYmVyIG9mIHN0YXJzIG5lZWRlZFxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuY29sdW1uczsgKytqKSB7XG4gICAgICAgICAgICBsZXQgdG90YWxTdGFycyA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucm93czsgKytpKSB7XG4gICAgICAgICAgICAgICAgdG90YWxTdGFycyArPSB0aGlzLnNxdWFyZXNbdGhpcy5jb2x1bW5zKmkgKyBqXSA9PT0gQ2VsbFN0YXRlcy5TdGFyID8gMSA6IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0b3RhbFN0YXJzICE9PSAyKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayB0aGF0IGVhY2ggcmVnaW9uIGhhcyB0aGUgbnVtYmVyIG9mIHN0YXJzIG5lZWRlZFxuICAgICAgICBmb3IgKGNvbnN0IHJlZ2lvbiBvZiB0aGlzLnJlZ2lvbnMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGxldCB0b3RhbFN0YXJzID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW3JvdywgY29sdW1uXSBvZiByZWdpb24pIHtcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXJzICs9IHRoaXMuc3F1YXJlc1t0aGlzLmNvbHVtbnMqKHJvdy0xKSArIChjb2x1bW4tMSldID09PSBDZWxsU3RhdGVzLlN0YXIgPyAxIDogMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRvdGFsU3RhcnMgIT09IDIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIHRoYXQgbm8gdHdvIHN0YXJzIGFyZSBhZGphY2VudFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucm93czsgKytpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuY29sdW1uczsgKytqKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3F1YXJlc1t0aGlzLmNvbHVtbnMqaSArIGpdID09PSBDZWxsU3RhdGVzLlN0YXIgJiZ0aGlzLnN0YXJBZGphY2VudChbaSsxLCBqKzFdKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGFueSBvZiB0aGUgYWRqYWNlbnQgZ3JpZCBzcXVhcmVzIGNvbnRhaW5zIGEgc3RhclxuICAgICAqIFxuICAgICAqIEBwYXJhbSBwb3NpdGlvbiB0aGUgcG9zaXRpb24gb2YgdGhlIGNlbGwgb2Ygd2hpY2ggeW91IHdhbnQgdG8gY2hlY2sgYWRqYWNlbnRcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZXJlIGlzIGFuIGFkamFjZW50IHN0YXI7IGZhbHNlIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHByaXZhdGUgc3RhckFkamFjZW50KHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXJdKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IFtyb3csIGNvbHVtbl0gPSBwb3NpdGlvbjtcbiAgICAgICAgY29uc3QgZGVsdGFzID0gWy0xLCAwLCAxXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGRlbHRhUm93IG9mIGRlbHRhcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCBkZWx0YUNvbHVtbiBvZiBkZWx0YXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZWxsUm93ID0gcm93ICsgZGVsdGFSb3c7XG4gICAgICAgICAgICAgICAgY29uc3QgY2VsbENvbHVtbiA9IGNvbHVtbiArIGRlbHRhQ29sdW1uO1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgKGRlbHRhUm93ID09PSAwICYmIGRlbHRhQ29sdW1uID09PSAwKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgKGNlbGxSb3cgPCAxIHx8IGNlbGxSb3cgPiB0aGlzLnJvd3MpIHx8IFxuICAgICAgICAgICAgICAgICAgICAoY2VsbENvbHVtbiA8IDEgfHwgY2VsbENvbHVtbiA+IHRoaXMuY29sdW1ucylcbiAgICAgICAgICAgICAgICApIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zcXVhcmVzW3RoaXMuY29sdW1ucyooY2VsbFJvdy0xKSArIChjZWxsQ29sdW1uLTEpXSA9PT0gQ2VsbFN0YXRlcy5TdGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjZWxsUm93LCBjZWxsQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3ljbGUgYSBncmlkIHNxdWFyZSBiZXR3ZWVuIGVtcHR5LCBzdGFycmVkLCBhbmQgYmxvY2tlZCwgaW4gdGhhdCBvcmRlci5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcG9zaXRpb24gdGhlIHBvc2l0aW9uIG9uIHRoZSBncmlkIHRvIGJlIGN5Y2xlXG4gICAgICogQHJldHVybnMgdGhlIHVwZGF0ZWQgc3RhdGUgb2YgdGhlIGdyaWQgc3F1YXJlXG4gICAgICogQHRocm93cyBFcnJvciBpZiB4IGFuZCB5IGFyZSBub3QgdmFsaWQgY29vcmRpbmF0ZXMgb2YgdGhlIHB1enpsZSBib2FyZC5cbiAgICAgKi8gIFxuICAgIHB1YmxpYyBjeWNsZVNxdWFyZShwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IENlbGxTdGF0ZXMge1xuICAgICAgICBjb25zdCBbcm93LCBjb2x1bW5dID0gcG9zaXRpb247XG4gICAgICAgIGlmIChyb3cgPCAxIHx8IHJvdyA+IHRoaXMucm93cyB8fCBjb2x1bW4gPCAxIHx8IGNvbHVtbiA+IHRoaXMuY29sdW1ucykgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHBsYWNlIGEgc3RhciBhdCBhbiBpbnZhbGlkIGdyaWQgcG9zaXRpb25cIik7XG5cblxuICAgICAgICBjb25zdCBzdGF0dXMgPSB0aGlzLnNxdWFyZXNbdGhpcy5jb2x1bW5zKihyb3ctMSkgKyAoY29sdW1uLTEpXTtcbiAgICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgQ2VsbFN0YXRlcy5FbXB0eTpcbiAgICAgICAgICAgICAgICB0aGlzLnNxdWFyZXNbdGhpcy5jb2x1bW5zKihyb3ctMSkgKyAoY29sdW1uLTEpXSA9IENlbGxTdGF0ZXMuQmxvY2tlZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ2VsbFN0YXRlcy5TdGFyOlxuICAgICAgICAgICAgICAgIHRoaXMuc3F1YXJlc1t0aGlzLmNvbHVtbnMqKHJvdy0xKSArIChjb2x1bW4tMSldID0gQ2VsbFN0YXRlcy5FbXB0eTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ2VsbFN0YXRlcy5CbG9ja2VkOlxuICAgICAgICAgICAgICAgIHRoaXMuc3F1YXJlc1t0aGlzLmNvbHVtbnMqKHJvdy0xKSArIChjb2x1bW4tMSldID0gQ2VsbFN0YXRlcy5TdGFyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogXG4gICAgICAgICAgICAgICAgYXNzZXJ0LmZhaWwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2hlY2tSZXAoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3F1YXJlc1t0aGlzLmNvbHVtbnMqKHJvdy0xKSArIChjb2x1bW4tMSldID8/IGFzc2VydC5mYWlsKFwiR3JpZCBzcXVhcmUgbm90IGZvdW5kXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBjb29yZGluYXRlcyBvZiBhbGwgc3RhcnMgb24gcHV6emxlXG4gICAgICogXG4gICAgICogQHJldHVybnMgQXJyYXk8e3JvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlcn0+IGFycmF5IG9mIHRoZSBjb29yZGluYXRlcyBvZiBhbGwgdGhlIHN0YXJzXG4gICAgICovXG5cbiAgICBwdWJsaWMgZ2V0U3RhcnMoKTogQXJyYXk8e3JvdzogbnVtYmVyLCBjb2x1bW46IG51bWJlcn0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnM6IEFycmF5PHtyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXJ9PiA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucm93cyp0aGlzLmNvbHVtbnM7ICsraSkge1xuICAgICAgICAgICAgaWYodGhpcy5zcXVhcmVzW2ldID09PSBDZWxsU3RhdGVzLlN0YXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2w6IG51bWJlciA9IGkldGhpcy5jb2x1bW5zO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdzogbnVtYmVyID0gTWF0aC5mbG9vcihpL3RoaXMucm93cyk7XG4gICAgICAgICAgICAgICAgc3RhcnMucHVzaCh7cm93OiByb3csIGNvbHVtbjogY29sfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXJzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBpbmhlcml0ZG9jXG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICAgIGxldCBzdHJpbmdSZXAgPSBcIlwiO1xuICAgICAgICBzdHJpbmdSZXAgKz0gYCR7dGhpcy5yb3dzfXgke3RoaXMuY29sdW1uc31cXG5gO1xuICAgICAgICBmb3IgKGNvbnN0IHJlZ2lvbiBvZiB0aGlzLnJlZ2lvbnMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJzID0gbmV3IEFycmF5PFtudW1iZXIsIG51bWJlcl0+O1xuICAgICAgICAgICAgY29uc3Qgbm9uU3RhcnMgPSBuZXcgQXJyYXk8W251bWJlciwgbnVtYmVyXT47XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2YgcmVnaW9uKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gY2VsbFswXSA/PyBhc3NlcnQuZmFpbChcImNlbGwgaXMgbWlzc2luZyB4IHZhbHVlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbiA9IGNlbGxbMV0gPz8gYXNzZXJ0LmZhaWwoXCJjZWxsIGlzIG1pc3NpbmcgeSB2YWx1ZVwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjZWxsU3RhdGUgPSB0aGlzLnNxdWFyZXNbdGhpcy5jb2x1bW5zKihyb3ctMSkgKyAoY29sdW1uLTEpXTtcbiAgICAgICAgICAgICAgICBpZiAoY2VsbFN0YXRlID09PSBDZWxsU3RhdGVzLlN0YXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnMucHVzaChbcm93LCBjb2x1bW5dKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vblN0YXJzLnB1c2goW3JvdywgY29sdW1uXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGxpbmUgPSBcIlwiO1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdGFyIG9mIHN0YXJzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gc3RhclswXSA/PyBhc3NlcnQuZmFpbChcImNlbGwgaXMgbWlzc2luZyB4IHZhbHVlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbiA9IHN0YXJbMV0gPz8gYXNzZXJ0LmZhaWwoXCJjZWxsIGlzIG1pc3NpbmcgeSB2YWx1ZVwiKTtcbiAgICAgICAgICAgICAgICBsaW5lICs9IGAke3Jvd30sJHtjb2x1bW59IGA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lICs9ICd8ICc7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5vblN0YXIgb2Ygbm9uU3RhcnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3cgPSBub25TdGFyWzBdID8/IGFzc2VydC5mYWlsKFwiY2VsbCBpcyBtaXNzaW5nIHggdmFsdWVcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sdW1uID0gbm9uU3RhclsxXSA/PyBhc3NlcnQuZmFpbChcImNlbGwgaXMgbWlzc2luZyB5IHZhbHVlXCIpO1xuICAgICAgICAgICAgICAgIGxpbmUgKz0gYCR7cm93fSwke2NvbHVtbn0gYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmUgKz0gJ1xcbic7XG4gICAgICAgICAgICBzdHJpbmdSZXAgKz0gbGluZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RyaW5nUmVwO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSBhIHB1enpsZS5cbiAqIFxuICogQHBhcmFtIGlucHV0IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHB1enpsZSB0byBwYXJzZS5cbiAqIEByZXR1cm5zIHB1enpsZSBBRFQgZm9yIHRoZSBpbnB1dFxuICogQHRocm93cyBFcnJvciBpZiB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3RyaW5nKGlucHV0OiBzdHJpbmcpOiBQdXp6bGUge1xuICAgIHJldHVybiBwYXJzZVB1enpsZShpbnB1dCk7IFxufVxuXG4vKipcbiAqIFBhcnNlIGEgcHV6emxlLlxuICogXG4gKiBAcGFyYW0gZmlsZW5hbWUgcGF0aCB0byB0aGUgZmlsZSBjb250YWluaW5nIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBwdXp6bGUgdG8gcGFyc2UsIGV4Y2x1ZGluZyBjb21tZW50c1xuICogQHJldHVybnMgcHV6emxlIEFEVCBmb3IgdGhlIGlucHV0XG4gKiBAdGhyb3dzIEVycm9yIGlmIHRoZSBmaWxlbmFtZSBvciBzdHJpbmcgcmVwcmVzZW50YXRpb24gaXMgaW52YWxpZFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGFyc2VGaWxlKGZpbGVuYW1lOiBzdHJpbmcpOiBQcm9taXNlPFB1enpsZT4ge1xuICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IChhd2FpdCBmcy5wcm9taXNlcy5yZWFkRmlsZShmaWxlbmFtZSkpLnRvU3RyaW5nKCk7XG4gICAgbGV0IHN0cmluZ1JlcCA9IFwiXCI7XG4gICAgY29uc3QgbGluZXMgPSBmaWxlQ29udGVudHMuc3BsaXQoJ1xcbicpO1xuICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgICBpZiAoIWxpbmUuc3RhcnRzV2l0aChcIiNcIikgJiYgbGluZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzdHJpbmdSZXAgKz0gbGluZSArICdcXG4nO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXJzZVB1enpsZShzdHJpbmdSZXApOyBcbn1cbiIsImltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IFB1enpsZSB9IGZyb20gJy4vUHV6emxlJztcbmltcG9ydCB7IFBhcnNlciwgUGFyc2VUcmVlLCBjb21waWxlIH0gZnJvbSAncGFyc2VybGliJztcblxuLyoqXG4gKiBQYXJzZXIgZm9yIHB1enpsZXMuXG4gKiBcbiAqL1xuY29uc3QgZ3JhbW1hciA9IGBcbkBza2lwIHdoaXRlc3BhY2Uge1xuICAgIHB1enpsZSA6Oj0gZGltZW5zaW9ucyBbXFxcXG5dIHJlZ2lvbio7XG4gICAgZGltZW5zaW9ucyA6Oj0gbnVtYmVyICd4JyBudW1iZXIrO1xuICAgIHJlZ2lvbiA6Oj0gc3RhciogJ3wnIGNvb3JkKyBbXFxcXG5dO1xufVxuc3RhciA6Oj0gbnVtYmVyICcsJyBudW1iZXI7XG5jb29yZCA6Oj0gbnVtYmVyICcsJyBudW1iZXI7XG5udW1iZXIgOjo9IFswLTldKztcbndoaXRlc3BhY2UgOjo9IFsgXFxcXHRcXFxccl0rO1xuYDtcblxuLy8gdGhlIG5vbnRlcm1pbmFscyBvZiB0aGUgZ3JhbW1hclxuZW51bSBQdXp6bGVHcmFtbWFyIHtcbiAgICBQdXp6bGUsIERpbWVuc2lvbnMsIFJlZ2lvbiwgU3RhciwgQ29vcmQsIE51bWJlciwgV2hpdGVzcGFjZVxufVxuXG4vLyBjb21waWxlIHRoZSBncmFtbWFyIGludG8gYSBwYXJzZXJcbmNvbnN0IHBhcnNlcjogUGFyc2VyPFB1enpsZUdyYW1tYXI+ID0gY29tcGlsZShncmFtbWFyLCBQdXp6bGVHcmFtbWFyLCBQdXp6bGVHcmFtbWFyLlB1enpsZSk7XG5cbi8qKlxuICogUGFyc2UgYSBzdHJpbmcgaW50byBhIHB1enpsZS5cbiAqIFxuICogQHBhcmFtIGlucHV0IHN0cmluZyB0byBwYXJzZVxuICogQHJldHVybnMgUHV6emxlIHBhcnNlZCBmcm9tIHRoZSBzdHJpbmdcbiAqIEB0aHJvd3MgUGFyc2VFcnJvciBpZiB0aGUgc3RyaW5nIGRvZXNuJ3QgbWF0Y2ggdGhlIFB1enpsZSBncmFtbWFyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVB1enpsZShpbnB1dDogc3RyaW5nKTogUHV6emxlIHtcbiAgICAvLyBwYXJzZSB0aGUgZXhhbXBsZSBpbnRvIGEgcGFyc2UgdHJlZVxuICAgIGNvbnN0IHBhcnNlVHJlZTogUGFyc2VUcmVlPFB1enpsZUdyYW1tYXI+ID0gcGFyc2VyLnBhcnNlKGlucHV0KTtcbiAgICAvLyBtYWtlIGEgcHV6emxlIGZyb20gdGhlIHBhcnNlIHRyZWVcbiAgICBjb25zdCBwdXp6bGU6IFB1enpsZSA9IGdldFB1enpsZShwYXJzZVRyZWUpOyAgICBcbiAgICByZXR1cm4gcHV6emxlO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBwYXJzZSB0cmVlIGludG8gYSByZWNvcmQgY29udGFpbmluZyBwdXp6bGUgZGltZW5zaW9ucy5cbiAqIFxuICogQHBhcmFtIHBhcnNlVHJlZSBjb25zdHJ1Y3RlZCBhY2NvcmRpbmcgdG8gdGhlIGdyYW1tYXIgZm9yIHB1enpsZXNcbiAqIEByZXR1cm5zIGEgcmVjb3JkIGNvbnRhaW5pbmcgcHV6emxlIGRpbWVuc2lvbnNcbiAqL1xuZnVuY3Rpb24gZ2V0RGltZW5zaW9ucyhwYXJzZVRyZWU6IFBhcnNlVHJlZTxQdXp6bGVHcmFtbWFyPik6IHtudW1Sb3dzOm51bWJlciwgbnVtQ29sczpudW1iZXJ9IHtcbiAgICAvLyBkaW1lbnNpb25zIDo6PSBbMC05XSsgJ3gnIFswLTldKztcbiAgICBjb25zdCBkaW1lbnNpb25zOiBBcnJheTxQYXJzZVRyZWU8UHV6emxlR3JhbW1hcj4+ID0gcGFyc2VUcmVlLmNoaWxkcmVuQnlOYW1lKFB1enpsZUdyYW1tYXIuTnVtYmVyKTtcbiAgICBjb25zdCBudW1Sb3dzID0gZ2V0TnVtYmVyKGRpbWVuc2lvbnNbMF0gPz8gYXNzZXJ0LmZhaWwoXCJtaXNzaW5nIG51bWJlciBvZiByb3dzXCIpKTtcbiAgICBjb25zdCBudW1Db2xzID0gZ2V0TnVtYmVyKGRpbWVuc2lvbnNbMV0gPz8gYXNzZXJ0LmZhaWwoXCJtaXNzaW5nIG51bWJlciBvZiBjb2x1bW5zXCIpKTtcbiAgICByZXR1cm4ge251bVJvd3M6bnVtUm93cywgbnVtQ29sczpudW1Db2xzfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcGFyc2UgdHJlZSBpbnRvIGEgbnVtYmVyLlxuICogXG4gKiBAcGFyYW0gcGFyc2VUcmVlIGNvbnN0cnVjdGVkIGFjY29yZGluZyB0byB0aGUgZ3JhbW1hciBmb3IgcHV6emxlc1xuICogQHJldHVybnMgdGhlIG51bWJlciByZXByZXNlbnRlZCBieSB0aGUgcGFyc2VUcmVlXG4gKi9cbmZ1bmN0aW9uIGdldE51bWJlcihwYXJzZVRyZWU6IFBhcnNlVHJlZTxQdXp6bGVHcmFtbWFyPik6IG51bWJlciB7XG4gICAgLy8gbnVtYmVyIDo6PSBbMC05XSs7XG4gICAgcmV0dXJuIHBhcnNlSW50KHBhcnNlVHJlZS50ZXh0KSA/PyBhc3NlcnQuZmFpbChcImludmFsaWQgZGltZW5zaW9uc1wiKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcGFyc2UgdHJlZSBpbnRvIGEgcmVjb3JkIGNvbnRhaW5pbmcgY29vcmRpbmF0ZXMgYW5kIHN0YXJzIG9mIHRoZSBnaXZlbiByZWdpb24uXG4gKiBcbiAqIEBwYXJhbSBwYXJzZVRyZWUgY29uc3RydWN0ZWQgYWNjb3JkaW5nIHRvIHRoZSBncmFtbWFyIGZvciBwdXp6bGVzXG4gKiBAcmV0dXJucyBhIHJlY29yZCBjb250YWluaW5nIGNvb3JkaW5hdGVzIGFuZCBzdGFycyBvZiB0aGUgZ2l2ZW4gcmVnaW9uXG4gKi9cbmZ1bmN0aW9uIGdldFJlZ2lvbihwYXJzZVRyZWU6IFBhcnNlVHJlZTxQdXp6bGVHcmFtbWFyPik6IHtcbiAgICBjb29yZHM6IEFycmF5PFtudW1iZXIsIG51bWJlcl0+LCBzdGFyczogQXJyYXk8W251bWJlciwgbnVtYmVyXT5cbn0ge1xuICAgIC8vIHJlZ2lvbiA6Oj0gc3RhciogJ3wnIGNvb3JkKyAnXFxuJztcbiAgICBjb25zdCBzdGFycyA9IHBhcnNlVHJlZS5jaGlsZHJlbkJ5TmFtZShQdXp6bGVHcmFtbWFyLlN0YXIpLm1hcChzdGFyID0+IGdldENvb3JkaW5hdGUoc3RhcikpO1xuICAgIGNvbnN0IGNvb3JkcyA9IHBhcnNlVHJlZS5jaGlsZHJlbkJ5TmFtZShQdXp6bGVHcmFtbWFyLkNvb3JkKS5tYXAoY29vcmQgPT4gZ2V0Q29vcmRpbmF0ZShjb29yZCkpLmNvbmNhdChbLi4uc3RhcnNdKTtcbiAgICByZXR1cm4ge2Nvb3JkczogY29vcmRzLCBzdGFyczogc3RhcnN9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBwYXJzZSB0cmVlIGludG8gYSBjb29yZGluYXRlXG4gKiBcbiAqIEBwYXJhbSBwYXJzZVRyZWUgY29uc3RydWN0ZWQgYWNjb3JkaW5nIHRvIHRoZSBncmFtbWFyIGZvciBwdXp6bGVzXG4gKiBAcmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGNvb3JkaW5hdGUgbnVtYmVyc1xuICovXG5mdW5jdGlvbiBnZXRDb29yZGluYXRlKHBhcnNlVHJlZTogUGFyc2VUcmVlPFB1enpsZUdyYW1tYXI+KTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgLy8gY29vcmQgOjo9IG51bWJlciAnLCcgbnVtYmVyO1xuICAgIGNvbnN0IGNvb3JkczogQXJyYXk8UGFyc2VUcmVlPFB1enpsZUdyYW1tYXI+PiA9IHBhcnNlVHJlZS5jaGlsZHJlbkJ5TmFtZShQdXp6bGVHcmFtbWFyLk51bWJlcik7XG4gICAgY29uc3QgeCA9IGdldE51bWJlcihjb29yZHNbMF0gPz8gYXNzZXJ0LmZhaWwoXCJtaXNzaW5nIGNvb3JkaW5hdGVcIikpO1xuICAgIGNvbnN0IHkgPSBnZXROdW1iZXIoY29vcmRzWzFdID8/IGFzc2VydC5mYWlsKFwibWlzc2luZyBjb29yZGluYXRlXCIpKTtcbiAgICByZXR1cm4gW3gsIHldO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBwYXJzZSB0cmVlIGludG8gYSBwdXp6bGUuXG4gKiBcbiAqIEBwYXJhbSBwYXJzZVRyZWUgY29uc3RydWN0ZWQgYWNjb3JkaW5nIHRvIHRoZSBncmFtbWFyIGZvciBwdXp6bGVzXG4gKiBAcmV0dXJucyBuZXcgcHV6emxlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHBhcnNlVHJlZVxuICovXG5mdW5jdGlvbiBnZXRQdXp6bGUocGFyc2VUcmVlOiBQYXJzZVRyZWU8UHV6emxlR3JhbW1hcj4pOiBQdXp6bGUge1xuICAgIC8vIHB1enpsZSA6Oj0gZGltZW5zaW9ucyAnXFxuJyByZWdpb24qO1xuICAgIGNvbnN0IGRpbWVuc2lvbiA9IDEwO1xuICAgIGNvbnN0IGRpbWVuc2lvbnMgPSBnZXREaW1lbnNpb25zKHBhcnNlVHJlZS5jaGlsZHJlblswXSA/PyBhc3NlcnQuZmFpbCgnbWlzc2luZyBjaGlsZCcpKTtcbiAgICBhc3NlcnQoZGltZW5zaW9ucy5udW1Sb3dzID09PSBkaW1lbnNpb24sIFwib3VyIEFEVCBjYW4gb25seSBoYW5kbGUgMTB4MTAgcHV6emxlc1wiKTtcbiAgICBhc3NlcnQoZGltZW5zaW9ucy5udW1Db2xzID09PSBkaW1lbnNpb24sIFwib3VyIEFEVCBjYW4gb25seSBoYW5kbGUgMTB4MTAgcHV6emxlc1wiKTtcblxuICAgIGNvbnN0IHJlZ2lvbnMgPSBwYXJzZVRyZWUuY2hpbGRyZW5CeU5hbWUoUHV6emxlR3JhbW1hci5SZWdpb24pLm1hcChyZWdpb24gPT4gZ2V0UmVnaW9uKHJlZ2lvbikpO1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8bnVtYmVyLCBBcnJheTxbbnVtYmVyLCBudW1iZXJdPj4oKTtcbiAgICBjb25zdCBhbGxTdGFycyA9IG5ldyBBcnJheTxbbnVtYmVyLCBudW1iZXJdPjtcbiAgICBmb3IgKGNvbnN0IFtyZWdpb25JRCwgcmVnaW9uXSBvZiByZWdpb25zLmVudHJpZXMoKSkge1xuICAgICAgICBtYXAuc2V0KHJlZ2lvbklELCByZWdpb24uY29vcmRzKTtcbiAgICAgICAgYWxsU3RhcnMucHVzaCguLi5yZWdpb24uc3RhcnMpO1xuICAgIH1cbiAgICBjb25zdCBwdXp6bGUgPSBuZXcgUHV6emxlKG1hcCk7XG4gICAgZm9yIChjb25zdCBzdGFyIG9mIGFsbFN0YXJzKSB7XG4gICAgICAgIHB1enpsZS5jeWNsZVNxdWFyZShzdGFyKTtcbiAgICB9XG4gICAgcmV0dXJuIHB1enpsZTtcbn1cblxuXG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMjEtMjMgTUlUIDYuMTAyLzYuMDMxIGNvdXJzZSBzdGFmZiwgYWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFJlZGlzdHJpYnV0aW9uIG9mIG9yaWdpbmFsIG9yIGRlcml2ZWQgd29yayByZXF1aXJlcyBwZXJtaXNzaW9uIG9mIGNvdXJzZSBzdGFmZi5cbiAqL1xuXG4vLyBUaGlzIGNvZGUgaXMgbG9hZGVkIGludG8gc3RhcmItY2xpZW50Lmh0bWwsIHNlZSB0aGUgYG5wbSBjb21waWxlYCBhbmRcbi8vICAgYG5wbSB3YXRjaGlmeS1jbGllbnRgIHNjcmlwdHMuXG4vLyBSZW1lbWJlciB0aGF0IHlvdSB3aWxsICpub3QqIGJlIGFibGUgdG8gdXNlIE5vZGUgQVBJcyBsaWtlIGBmc2AgaW4gdGhlIHdlYiBicm93c2VyLlxuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBDZWxsU3RhdGVzLCBQdXp6bGUsIHBhcnNlRmlsZSwgcGFyc2VTdHJpbmcgfSBmcm9tIFwiLi9QdXp6bGVcIjtcbmltcG9ydCB7IGRyYXdCb3gsIGRyYXdHcmlkLCBkcmF3UHV6emxlLCBkcmF3U3RhciwgcmVtb3ZlU3RhciwgZHJhd0Jsb2NrfSBmcm9tIFwiLi9EcmF3aW5nXCI7XG5pbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5cbi8qKlxuICogUHV6emxlIHRvIHJlcXVlc3QgYW5kIHBsYXkuXG4gKiBQcm9qZWN0IGluc3RydWN0aW9uczogdGhpcyBjb25zdGFudCBpcyBhIFtmb3Igbm93XSByZXF1aXJlbWVudCBpbiB0aGUgcHJvamVjdCBzcGVjLlxuICovXG5jb25zdCBQVVpaTEU6IHN0cmluZyA9IFwia2QtMS0xLTFcIjtcblxuLy8gc2VlIEV4YW1wbGVQYWdlLnRzIGZvciBhbiBleGFtcGxlIG9mIGFuIGludGVyYWN0aXZlIHdlYiBwYWdlXG5cbi8qKlxuICogQURUIHJlcHJlc2VudGluZyB0aGUgY2xpZW50IHN0YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGllbnQge1xuICAgIC8vIEFic3RyYWN0aW9uIGZ1bmN0aW9uOlxuICAgIC8vICAgQUYocHV6emxlLCBjYW52YXMpOiBhIGdhbWUgYm9hcmQgdGhhdCBpcyBkaXNwbGF5ZWQgaW4gYGNhbnZhc2AsIGFuZCByZXByZXNlbnRzIHRoZSBzdGF0ZSBvZiBgcHV6emxlYCBib2FyZC5cbiAgICAvLyBSZXByZXNlbnRhdGlvbiBpbnZhcmlhbnQ6XG4gICAgLy8gICB0cnVlXG4gICAgLy8gU2FmZXR5IGZyb20gcmVwIGV4cG9zdXJlOlxuICAgIC8vICAgcmVwIGZpZWxkcyBhcmUgcHJpdmF0ZSBhbmQgcmVhZG9ubHkuIFxuICAgIC8vICAgYHB1enpsZWAgaXMgY3JlYXRlZCBiYXNlZCBvbiBgcHV6emxlU3RyaW5nYCBwYXNzZWQgaW4gYnkgdGhlIGNsaWVudCwgd2hpY2ggaXMgaW1tdXRhYmxlXG4gICAgLy8gICBubyBvdGhlciBwdWJsaWMgbWV0aG9kcyByZXR1cm4gYWxpYXNlcyB0byB0aGUgcmVwLlxuXG4gICAgcHJpdmF0ZSByZWFkb25seSBwdXp6bGU6IFB1enpsZTtcbiAgICBwcml2YXRlIGNvb3JkQ29sb3JzOiBNYXA8bnVtYmVyLCBzdHJpbmc+ID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIGNhbnZhcyB0aGUgY2FudmFzIHRvIGRyYXcgdGhlIHB1enpsZSBvblxuICAgICAqIEBwYXJhbSBwdXp6bGVTdHJpbmcgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYmxhbmsgcHV6emxlXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIFxuICAgICAgICBwdXp6bGVTdHJpbmc6IHN0cmluZ1xuICAgICkge1xuICAgICAgICB0aGlzLnB1enpsZSA9IHBhcnNlU3RyaW5nKHB1enpsZVN0cmluZyk7XG4gICAgfVxuXG4gICAgLy8gQXNzZXJ0cyB0aGUgcmVwIGludmFyaWFudFxuICAgIHB1YmxpYyBjaGVja1JlcCgpOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICAvKioqXG4gICAgICogU2V0IHRoZSBib2FyZCBkaXNwbGF5IHRvIGEgYmxhbmsgcHV6emxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBkaXNwbGF5QmxhbmtQdXp6bGUoKTogdm9pZCB7XG4gICAgICAgIGRyYXdHcmlkKHRoaXMuY2FudmFzLCB0aGlzLnB1enpsZSk7XG4gICAgICAgIHRoaXMuY29vcmRDb2xvcnMgPSBkcmF3UHV6emxlKHRoaXMuY2FudmFzLCB0aGlzLnB1enpsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xpY2tzIGEgY2VsbCBvbiB0aGUgYm9hcmQgYW5kIHVwZGF0ZXMgdGhlIHN0YXRlIG9mIHRoZSBib2FyZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY2VsbCB0aGUgY29vcmRpbmF0ZSBvZiB0aGUgc3RhciB0byBiZSBwbGFjZWQgb24gdGhlIGJvYXJkXG4gICAgICogQHBhcmFtIGNlbGwucm93IHRoZSByb3cgb2YgdGhlIGNvb3JkaW5hdGUgKG11c3QgYmUgYmV0d2VlbiAxIHRvIDEwIGluY2x1c2l2ZSlcbiAgICAgKiBAcGFyYW0gY2VsbC5jb2x1bW4gdGhlIGNvbHVtbiBvZiB0aGUgY29vcmRpbmF0ZSAobXVzdCBiZSBiZXR3ZWVuIDEgdG8gMTAgaW5jbHVzaXZlKVxuICAgICAqL1xuICAgIHB1YmxpYyBjbGljayhjZWxsOiB7cm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyfSk6IHZvaWQge1xuICAgICAgICBjb25zdCB1cGRhdGVkQ2VsbFN0YXRlID0gdGhpcy5wdXp6bGUuY3ljbGVTcXVhcmUoW2NlbGwucm93LCBjZWxsLmNvbHVtbl0pO1xuICAgICAgICBzd2l0Y2godXBkYXRlZENlbGxTdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBDZWxsU3RhdGVzLkVtcHR5OlxuICAgICAgICAgICAgICAgIHJlbW92ZVN0YXIodGhpcy5jYW52YXMsIHRoaXMucHV6emxlLCBjZWxsLCB0aGlzLmNvb3JkQ29sb3JzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ2VsbFN0YXRlcy5TdGFyOlxuICAgICAgICAgICAgICAgIHJlbW92ZVN0YXIodGhpcy5jYW52YXMsIHRoaXMucHV6emxlLCBjZWxsLCB0aGlzLmNvb3JkQ29sb3JzKTtcbiAgICAgICAgICAgICAgICBkcmF3U3Rhcih0aGlzLmNhbnZhcywgdGhpcy5wdXp6bGUsIGNlbGwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBDZWxsU3RhdGVzLkJsb2NrZWQ6XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZHJhd0Jsb2NrKHRoaXMuY2FudmFzLCB0aGlzLnB1enpsZSwgY2VsbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGFzc2VydC5mYWlsKCk7XG4gICAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXB1dGVzIHRoZSBjZWxsJ3Mgcm93IGFuZCBjb2x1bW4gY29ycmVzcG9uZGluZyB0byB0aGUgcG9zaXRpb24gb2YgYSB1c2VyJ3MgbW91c2UgY2xpY2suXG4gICAgICogXG4gICAgICogQHBhcmFtIHggdGhlIHggdmFsdWUgb2YgdGhlIHBvc2l0aW9uIG9mIHRoZSBjbGlja1xuICAgICAqIEBwYXJhbSB5IHRoZSB5IHZhbHVlIG9mIHRoZSBwb3NpdGlvbiBvZiB0aGUgY2xpY2tcbiAgICAgKiBAcmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgcm93IGFuZCBjb2x1bW4gb24gdGhlIGJvYXJkIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGNsaWNrIChiZXR3ZWVuIDEgYW5kIDEwIGluY2x1c2l2ZSlcbiAgICAgKiBAdGhyb3dzIGVycm9yIGlmIHggb3IgeSB2YWx1ZXMgYXJlIG91dCBvZiB0aGUgcmFuZ2Ugb2YgdGhlIGJvYXJkXG4gICAgICovXG4gICAgcHVibGljIGdldENlbGwoeDogbnVtYmVyLCB5OiBudW1iZXIpOiB7cm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyfSB7XG4gICAgICAgIHJldHVybiB7cm93OiB0aGlzLmdldFJvdyh5KSwgY29sdW1uOiB0aGlzLmdldENvbHVtbih4KX07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY29tcHV0ZXMgdGhlIGNlbGwncyByb3cgY29ycmVzcG9uZGluZyB0byB0aGUgeS12YWx1ZSBvZiB0aGUgdXNlcidzIG1vdXNlIGNsaWNrXG4gICAgICogXG4gICAgICogQHBhcmFtIHkgdGhlIHktdmFsdWUgb2YgdGhlIHVzZXIncyBtb3VzZSBjbGlja1xuICAgICAqIEByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIGNlbGwncyByb3cgbnVtYmVyIChiZXR3ZWVuIDEgdG8gMTAgaW5jbHVzaXZlKVxuICAgICAqIEB0aHJvd3MgZXJyb3IgaWYgdGhlIHkgdmFsdWUgaXMgb3V0c2lkZSBvZiB0aGUgcmFuZ2Ugb2YgdGhlIGJvYXJkXG4gICAgICovICAgICBcbiAgICBwcml2YXRlIGdldFJvdyh5OiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBkaW1lbnNpb24gPSAxMDtcbiAgICAgICAgY29uc3QgYm94ID0gdGhpcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHRvcCA9IGJveC50b3A7XG4gICAgICAgIGNvbnN0IGJvdHRvbSA9IGJveC5ib3R0b207XG4gICAgICAgIGNvbnN0IHlJbmNyZW1lbnQgPSAoYm90dG9tLXRvcCkvZGltZW5zaW9uO1xuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBkaW1lbnNpb247IHJvdysrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pblJhbmdlKHksIHRvcCtyb3cqeUluY3JlbWVudCwgdG9wKyhyb3crMSkqeUluY3JlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcm93KzE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgRXJyb3IoXCJ5IHZhbHVlIGlzIG5vdCBpbiB2YWxpZCByYW5nZSBvZiB0aGUgYm9hcmRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY29tcHV0ZXMgdGhlIGNlbGwncyBjb2x1bW4gY29ycmVzcG9uZGluZyB0byB0aGUgeC12YWx1ZSBvZiB0aGUgdXNlcidzIG1vdXNlIGNsaWNrXG4gICAgICogXG4gICAgICogQHBhcmFtIHggdGhlIHgtdmFsdWUgb2YgdGhlIHVzZXIncyBtb3VzZSBjbGlja1xuICAgICAqIEByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIGNlbGwncyBjb2x1bW4gbnVtYmVyIChiZXR3ZWVuIDEgdG8gMTAgaW5jbHVzaXZlKVxuICAgICAqIEB0aHJvd3MgZXJyb3IgaWYgdGhlIHggdmFsdWUgaXMgb3V0c2lkZSBvZiB0aGUgcmFuZ2Ugb2YgdGhlIGJvYXJkXG4gICAgICovIFxuICAgIHByaXZhdGUgZ2V0Q29sdW1uKHg6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGRpbWVuc2lvbiA9IDEwO1xuICAgICAgICBjb25zdCBib3ggPSB0aGlzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgbGVmdCA9IGJveC5sZWZ0O1xuICAgICAgICBjb25zdCByaWdodCA9IGJveC5yaWdodDtcbiAgICAgICAgY29uc3QgeEluY3JlbWVudCA9IChyaWdodC1sZWZ0KS9kaW1lbnNpb247XG4gICAgICAgIGZvciAobGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8IGRpbWVuc2lvbjsgY29sdW1uKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmluUmFuZ2UoeCwgbGVmdCtjb2x1bW4qeEluY3JlbWVudCwgbGVmdCsoY29sdW1uKzEpKnhJbmNyZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbisxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRocm93IEVycm9yKFwieCB2YWx1ZSBpcyBub3QgaW4gdmFsaWQgcmFuZ2Ugb2YgdGhlIGJvYXJkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGUgdGFyZ2V0IHZhbHVlIGlzIGluIHRoZSByYW5nZVxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0YXJnZXQgdGhlIHRhcmdldCB2YWx1ZSB0byBjaGVja1xuICAgICAqIEBwYXJhbSBzdGFydCB0aGUgc3RhcnRpbmcgdmFsdWUgb2YgdGhlIHJhbmdlIGluY2x1c2l2ZVxuICAgICAqIEBwYXJhbSBlbmQgdGhlIGVuZGluZyB2YWx1ZSBvZiB0aGUgcmFuZ2UgZXhjbHVzaXZlXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdGFyZ2V0IHZhbHVlIGlzIGluIHRoZSByYW5nZSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBpblJhbmdlKHRhcmdldDogbnVtYmVyLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGFyZ2V0ID49IHN0YXJ0ICYmIHRhcmdldCA8IGVuZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIHB1enpsZSBoYXMgYmVlbiBzb2x2ZWQuXG4gICAgICogXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgcHV6emxlIGhhcyBiZWVuIHNvbHZlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICovXG4gICAgcHVibGljIGNoZWNrU29sdmVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXp6bGUuaXNTb2x2ZWQoKTtcbiAgICB9XG59XG5cbi8qKlxuICogU2V0IHVwIHRoZSB3ZWJzaXRlIHBhZ2UuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gZ2V0IHRoZSBlbGVtZW50cyBvZiB0aGUgd2VicGFnZVxuICAgIGNvbnN0IGJ1dHRvbjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnV0dG9uJykgPz8gYXNzZXJ0LmZhaWwoJ21pc3NpbmcgYnV0dG9uJyk7XG4gICAgY29uc3QgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudCA/PyBhc3NlcnQuZmFpbCgnbWlzc2luZyBkcmF3aW5nIGNhbnZhcycpO1xuXG4gICAgLy8gY29ubmVjdCB0byBzZXJ2ZXIgdG8gcmV0cmlldmUgdGhlIHB1enpsZSdzIHN0cmluZyByZXByZXNlbnRhdGlvblxuICAgIGNvbnN0IHByb21pc2UgPSBmZXRjaChgaHR0cDovL2xvY2FsaG9zdDo4Nzg5L2dldFB1enpsZS9rZC0xLTEtMWApO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcHJvbWlzZTtcbiAgICBjb25zdCBwdXp6bGVTdHJpbmcgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG5cbiAgICAvLyBjcmVhdGUgYSBuZXcgY2xpZW50IEFEVCBpbnN0YW5jZSBhbmQgZGlzcGxheSB0aGUgYmxhbmsgcHV6emxlXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudChjYW52YXMsIHB1enpsZVN0cmluZyk7XG4gICAgY2xpZW50LmRpc3BsYXlCbGFua1B1enpsZSgpO1xuICAgIFxuICAgIC8vIGFkZCBidXR0b24gZnVuY3Rpb25hbGl0eSB0byBjaGVjayBpZiBzb2x2ZWRcbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGNsaWVudC5jaGVja1NvbHZlZCgpKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJZQVkhIFlvdSd2ZSBzb2x2ZWQgdGhlIHB1enpsZSA6M1wiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIllvdSBoYXZlIG5vdCBzb2x2ZWQgdGhlIHB1enpsZSB5ZXQgOihcIik7XG5cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gYWRkIGNsaWNraW5nIGZ1bmN0aW9uYWxpdHkgdG8gZHJhdyBzdGFycywgcmVtb3ZlIHN0YXJzLCBhbmQgYWRkIGJsb2Nrc1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudDogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBjbGllbnQuY2xpY2soY2xpZW50LmdldENlbGwoZXZlbnQueCwgZXZlbnQueSkpO1xuICAgIH0pO1xuXG59XG5cbm1haW4oKTsiXX0=
