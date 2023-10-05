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

},{"object-assign":8,"util/":4}],2:[function(require,module,exports){
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

},{"./support/isBuffer":3,"_process":17,"inherits":2}],5:[function(require,module,exports){

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

},{}],9:[function(require,module,exports){
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

},{"./parser":11,"./types":13,"assert":1}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./parsetree":12,"./types":13,"assert":1}],12:[function(require,module,exports){
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

},{"./display":10}],13:[function(require,module,exports){
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

},{"./display":10}],14:[function(require,module,exports){
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

},{"../parserlib":15,"./compiler":9,"fs":5,"path":16}],15:[function(require,module,exports){
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

},{"./internal/compiler":9,"./internal/types":13,"./internal/visualizer":14}],16:[function(require,module,exports){
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

},{"_process":17}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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
    const blocks = puzzle.getRegions();
    for (const block of blocks) {
        const rowStarts = new Map();
        const rowEnds = new Map();
        const colStarts = new Map();
        const colEnds = new Map();
        for (const coord of block) {
            const row = coord.row;
            const col = coord.column;
            if (rowStarts.has(row)) {
                const currCol = rowStarts.get(row);
                (0, assert_1.default)(currCol);
                rowStarts.set(row, Math.min(currCol, col));
            }
            if (rowEnds.has(row)) {
                const currCol = rowEnds.get(row);
                (0, assert_1.default)(currCol);
                rowEnds.set(row, Math.max(currCol, col));
            }
            if (colStarts.has(col)) {
                const currRow = rowStarts.get(col);
                (0, assert_1.default)(currRow);
                rowStarts.set(col, Math.min(currRow, row));
            }
            if (colEnds.has(col)) {
                const currRow = rowEnds.get(row);
                (0, assert_1.default)(currRow);
                rowEnds.set(col, Math.max(currRow, row));
            }
        }
        for (const [row, rowStart] of rowStarts) {
            const rowEnd = rowEnds.get(row);
            (0, assert_1.default)(rowEnd !== undefined, 'row must have end');
            blockLines.push({ start: { x: row, y: rowStart }, end: { x: row, y: rowEnd } });
        }
        for (const [col, colStart] of colStarts) {
            const colEnd = colEnds.get(col);
            (0, assert_1.default)(colEnd !== undefined, 'row must have end');
            blockLines.push({ start: { x: colStart, y: col }, end: { x: colEnd, y: col } });
        }
    }
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
    for (let i = 0; i < blockLines.length; i++) {
        const line = blockLines[i];
        (0, assert_1.default)(line);
        context.beginPath();
        context.moveTo(line.start.x * xIncrement, line.start.y * yIncrement);
        context.fillStyle = BACKGROUNDS[i] ?? assert_1.default.fail();
        context.fillRect(0, 0, xIncrement, xIncrement);
        context.lineTo(line.end.x * xIncrement, line.end.y * yIncrement);
        context.stroke();
    }
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
    const starOffset = 0.5;
    const font = '96pt bold';
    // make a tiny 1x1 image at first so that we can get a Graphics object, 
    // which we need to compute the width and height of the text
    const measuringContext = (0, canvas_1.createCanvas)(1, 1).getContext('2d');
    measuringContext.font = font;
    const fontMetrics = measuringContext.measureText('⭐️');
    // console.log('metrics', fontMetrics);
    // now make a canvas sized to fit the text
    // save original context settings before we translate and change colors
    context.save();
    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    context.translate((starCoord.column - starOffset) * xIncrement, (starCoord.row - starOffset) * yIncrement);
    context.font = font;
    context.fillStyle = 'white';
    context.fillText('⭐️', 0, fontMetrics.actualBoundingBoxAscent);
    context.strokeStyle = 'black';
    context.strokeText('⭐️', 0, fontMetrics.actualBoundingBoxAscent);
    // retore to (0, 0)
    context.restore();
}
exports.drawStar = drawStar;
function removeStar(canvas, puzzle, starCoord) {
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
    const starOffset = 0.5;
    const pixelFromCell = context.getImageData((starCoord.column - starOffset) * xIncrement, (starCoord.row - starOffset) * yIncrement, 1, 1).data;
}
exports.removeStar = removeStar;
function drawBlock(canvas, puzzle, starCoord) {
    const width = canvas.width;
    const height = canvas.height;
    const context = canvas.getContext('2d');
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
    const numRows = puzzle.rows;
    const numCols = puzzle.columns;
    const xIncrement = height / numRows;
    const yIncrement = width / numCols;
    const blockOffset = 0.5;
    const font = '96pt bold';
    // make a tiny 1x1 image at first so that we can get a Graphics object, 
    // which we need to compute the width and height of the text
    const measuringContext = (0, canvas_1.createCanvas)(1, 1).getContext('2d');
    measuringContext.font = font;
    const fontMetrics = measuringContext.measureText('🚫');
    // console.log('metrics', fontMetrics);
    // now make a canvas sized to fit the text
    // save original context settings before we translate and change colors
    context.save();
    // translate the coordinate system of the drawing context:
    //   the origin of `context` will now be (x,y)
    context.translate((starCoord.column - blockOffset) * xIncrement, (starCoord.row - blockOffset) * yIncrement);
    context.font = font;
    context.fillStyle = 'white';
    context.fillText('🚫', 0, fontMetrics.actualBoundingBoxAscent);
    context.strokeStyle = 'black';
    context.strokeText('🚫', 0, fontMetrics.actualBoundingBoxAscent);
    // retore to (0, 0)
    context.restore();
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

},{"./Puzzle":20,"assert":1,"canvas":6}],19:[function(require,module,exports){
"use strict";
/* Copyright (c) 2021-23 MIT 6.102/6.031 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This code is loaded into example-page.html, see the `npm watchify-example` script.
// Remember that you will *not* be able to use Node APIs like `fs` in the web browser.
const assert_1 = __importDefault(require("assert"));
const Puzzle_1 = require("./Puzzle");
const Drawing_1 = require("./Drawing");
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
    (0, assert_1.default)(context, 'unable to get canvas drawing context');
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
/**
 * Print a message by appending it to an HTML element.
 *
 * @param outputArea HTML element that should display the message
 * @param message message to display
 */
function printOutput(outputArea, message) {
    // append the message to the output area
    outputArea.innerText += message + '\n';
    // scroll the output area so that what we just printed is visible
    outputArea.scrollTop = outputArea.scrollHeight;
}
/**
 * Set up the example page.
 */
async function main() {
    // output area for printing
    const outputArea = document.getElementById('outputArea') ?? assert_1.default.fail('missing output area');
    // canvas for drawing
    const canvas = document.getElementById('canvas') ?? assert_1.default.fail('missing drawing canvas');
    // when the user clicks on the drawing canvas...
    canvas.addEventListener('click', (event) => {
        drawBox(canvas, event.offsetX, event.offsetY);
    });
    // add initial instructions to the output area
    printOutput(outputArea, `Click in the canvas above to draw a box centered at that point`);
    const puzzle = await (0, Puzzle_1.parseFile)('puzzles/kd-1-1-1.starb');
    (0, Drawing_1.drawGrid)(canvas, puzzle);
    (0, Drawing_1.drawPuzzle)(canvas, puzzle);
}
main();

},{"./Drawing":18,"./Puzzle":20,"assert":1}],20:[function(require,module,exports){
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
                this.squares[this.columns * (row - 1) + (column - 1)] = CellStates.Star;
                break;
            case CellStates.Star:
                this.squares[this.columns * (row - 1) + (column - 1)] = CellStates.Blocked;
                break;
            case CellStates.Blocked:
                this.squares[this.columns * (row - 1) + (column - 1)] = CellStates.Empty;
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

},{"./Puzzle":20,"assert":1,"parserlib":15}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L2Fzc2VydC5qcyIsIm5vZGVfbW9kdWxlcy9hc3NlcnQvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYXNzZXJ0L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2Fzc2VydC9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbGliL19lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9jYW52YXMvbGliL3BhcnNlLWZvbnQuanMiLCJub2RlX21vZHVsZXMvb2JqZWN0LWFzc2lnbi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZXJsaWIvaW50ZXJuYWwvY29tcGlsZXIuanMiLCJub2RlX21vZHVsZXMvcGFyc2VybGliL2ludGVybmFsL2Rpc3BsYXkuanMiLCJub2RlX21vZHVsZXMvcGFyc2VybGliL2ludGVybmFsL3BhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZXJsaWIvaW50ZXJuYWwvcGFyc2V0cmVlLmpzIiwibm9kZV9tb2R1bGVzL3BhcnNlcmxpYi9pbnRlcm5hbC90eXBlcy5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZXJsaWIvaW50ZXJuYWwvdmlzdWFsaXplci5qcyIsIm5vZGVfbW9kdWxlcy9wYXJzZXJsaWIvcGFyc2VybGliLmpzIiwibm9kZV9tb2R1bGVzL3BhdGgtYnJvd3NlcmlmeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJzcmMvRHJhd2luZy50cyIsInNyYy9FeGFtcGxlUGFnZS50cyIsInNyYy9QdXp6bGUudHMiLCJzcmMvUHV6emxlUGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFrQkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25UQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QVMsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO0lBRWxGLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO0lBQ3ZELE1BQU0sUUFBUSxHQUFHLElBQUksS0FBdUIsQ0FBQztJQUM3QyxLQUFLLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQ2hELEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xDO0lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsS0FBSyxNQUFNLElBQUksSUFBSSxRQUFRLEVBQUU7UUFDekIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM1QjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBvYmplY3RBc3NpZ24gPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG5cbi8vIGNvbXBhcmUgYW5kIGlzQnVmZmVyIHRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvYmxvYi82ODBlOWU1ZTQ4OGYyMmFhYzI3NTk5YTU3ZGM4NDRhNjMxNTkyOGRkL2luZGV4LmpzXG4vLyBvcmlnaW5hbCBub3RpY2U6XG5cbi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xuICBpZiAoYSA9PT0gYikge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdmFyIHggPSBhLmxlbmd0aDtcbiAgdmFyIHkgPSBiLmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXTtcbiAgICAgIHkgPSBiW2ldO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGlmICh5IDwgeCkge1xuICAgIHJldHVybiAxO1xuICB9XG4gIHJldHVybiAwO1xufVxuZnVuY3Rpb24gaXNCdWZmZXIoYikge1xuICBpZiAoZ2xvYmFsLkJ1ZmZlciAmJiB0eXBlb2YgZ2xvYmFsLkJ1ZmZlci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBnbG9iYWwuQnVmZmVyLmlzQnVmZmVyKGIpO1xuICB9XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpO1xufVxuXG4vLyBiYXNlZCBvbiBub2RlIGFzc2VydCwgb3JpZ2luYWwgbm90aWNlOlxuLy8gTkI6IFRoZSBVUkwgdG8gdGhlIENvbW1vbkpTIHNwZWMgaXMga2VwdCBqdXN0IGZvciB0cmFkaXRpb24uXG4vLyAgICAgbm9kZS1hc3NlcnQgaGFzIGV2b2x2ZWQgYSBsb3Qgc2luY2UgdGhlbiwgYm90aCBpbiBBUEkgYW5kIGJlaGF2aW9yLlxuXG4vLyBodHRwOi8vd2lraS5jb21tb25qcy5vcmcvd2lraS9Vbml0X1Rlc3RpbmcvMS4wXG4vL1xuLy8gVEhJUyBJUyBOT1QgVEVTVEVEIE5PUiBMSUtFTFkgVE8gV09SSyBPVVRTSURFIFY4IVxuLy9cbi8vIE9yaWdpbmFsbHkgZnJvbSBuYXJ3aGFsLmpzIChodHRwOi8vbmFyd2hhbGpzLm9yZylcbi8vIENvcHlyaWdodCAoYykgMjAwOSBUaG9tYXMgUm9iaW5zb24gPDI4MG5vcnRoLmNvbT5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG9cbi8vIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlXG4vLyByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Jcbi8vIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgJ0FTIElTJywgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOXG4vLyBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXG4vLyBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsLycpO1xudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGZ1bmN0aW9uc0hhdmVOYW1lcyA9IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBmb28oKSB7fS5uYW1lID09PSAnZm9vJztcbn0oKSk7XG5mdW5jdGlvbiBwVG9TdHJpbmcgKG9iaikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaik7XG59XG5mdW5jdGlvbiBpc1ZpZXcoYXJyYnVmKSB7XG4gIGlmIChpc0J1ZmZlcihhcnJidWYpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0eXBlb2YgZ2xvYmFsLkFycmF5QnVmZmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIuaXNWaWV3ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIEFycmF5QnVmZmVyLmlzVmlldyhhcnJidWYpO1xuICB9XG4gIGlmICghYXJyYnVmKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChhcnJidWYgaW5zdGFuY2VvZiBEYXRhVmlldykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChhcnJidWYuYnVmZmVyICYmIGFycmJ1Zi5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbi8vIDEuIFRoZSBhc3NlcnQgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9ucyB0aGF0IHRocm93XG4vLyBBc3NlcnRpb25FcnJvcidzIHdoZW4gcGFydGljdWxhciBjb25kaXRpb25zIGFyZSBub3QgbWV0LiBUaGVcbi8vIGFzc2VydCBtb2R1bGUgbXVzdCBjb25mb3JtIHRvIHRoZSBmb2xsb3dpbmcgaW50ZXJmYWNlLlxuXG52YXIgYXNzZXJ0ID0gbW9kdWxlLmV4cG9ydHMgPSBvaztcblxuLy8gMi4gVGhlIEFzc2VydGlvbkVycm9yIGlzIGRlZmluZWQgaW4gYXNzZXJ0LlxuLy8gbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7IG1lc3NhZ2U6IG1lc3NhZ2UsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkIH0pXG5cbnZhciByZWdleCA9IC9cXHMqZnVuY3Rpb25cXHMrKFteXFwoXFxzXSopXFxzKi87XG4vLyBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vbGpoYXJiL2Z1bmN0aW9uLnByb3RvdHlwZS5uYW1lL2Jsb2IvYWRlZWVlYzhiZmNjNjA2OGIxODdkN2Q5ZmIzZDViYjFkM2EzMDg5OS9pbXBsZW1lbnRhdGlvbi5qc1xuZnVuY3Rpb24gZ2V0TmFtZShmdW5jKSB7XG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChmdW5jdGlvbnNIYXZlTmFtZXMpIHtcbiAgICByZXR1cm4gZnVuYy5uYW1lO1xuICB9XG4gIHZhciBzdHIgPSBmdW5jLnRvU3RyaW5nKCk7XG4gIHZhciBtYXRjaCA9IHN0ci5tYXRjaChyZWdleCk7XG4gIHJldHVybiBtYXRjaCAmJiBtYXRjaFsxXTtcbn1cbmFzc2VydC5Bc3NlcnRpb25FcnJvciA9IGZ1bmN0aW9uIEFzc2VydGlvbkVycm9yKG9wdGlvbnMpIHtcbiAgdGhpcy5uYW1lID0gJ0Fzc2VydGlvbkVycm9yJztcbiAgdGhpcy5hY3R1YWwgPSBvcHRpb25zLmFjdHVhbDtcbiAgdGhpcy5leHBlY3RlZCA9IG9wdGlvbnMuZXhwZWN0ZWQ7XG4gIHRoaXMub3BlcmF0b3IgPSBvcHRpb25zLm9wZXJhdG9yO1xuICBpZiAob3B0aW9ucy5tZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubWVzc2FnZSA9IGdldE1lc3NhZ2UodGhpcyk7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gdHJ1ZTtcbiAgfVxuICB2YXIgc3RhY2tTdGFydEZ1bmN0aW9uID0gb3B0aW9ucy5zdGFja1N0YXJ0RnVuY3Rpb24gfHwgZmFpbDtcbiAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgc3RhY2tTdGFydEZ1bmN0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBub24gdjggYnJvd3NlcnMgc28gd2UgY2FuIGhhdmUgYSBzdGFja3RyYWNlXG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcigpO1xuICAgIGlmIChlcnIuc3RhY2spIHtcbiAgICAgIHZhciBvdXQgPSBlcnIuc3RhY2s7XG5cbiAgICAgIC8vIHRyeSB0byBzdHJpcCB1c2VsZXNzIGZyYW1lc1xuICAgICAgdmFyIGZuX25hbWUgPSBnZXROYW1lKHN0YWNrU3RhcnRGdW5jdGlvbik7XG4gICAgICB2YXIgaWR4ID0gb3V0LmluZGV4T2YoJ1xcbicgKyBmbl9uYW1lKTtcbiAgICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgICAvLyBvbmNlIHdlIGhhdmUgbG9jYXRlZCB0aGUgZnVuY3Rpb24gZnJhbWVcbiAgICAgICAgLy8gd2UgbmVlZCB0byBzdHJpcCBvdXQgZXZlcnl0aGluZyBiZWZvcmUgaXQgKGFuZCBpdHMgbGluZSlcbiAgICAgICAgdmFyIG5leHRfbGluZSA9IG91dC5pbmRleE9mKCdcXG4nLCBpZHggKyAxKTtcbiAgICAgICAgb3V0ID0gb3V0LnN1YnN0cmluZyhuZXh0X2xpbmUgKyAxKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGFjayA9IG91dDtcbiAgICB9XG4gIH1cbn07XG5cbi8vIGFzc2VydC5Bc3NlcnRpb25FcnJvciBpbnN0YW5jZW9mIEVycm9yXG51dGlsLmluaGVyaXRzKGFzc2VydC5Bc3NlcnRpb25FcnJvciwgRXJyb3IpO1xuXG5mdW5jdGlvbiB0cnVuY2F0ZShzLCBuKSB7XG4gIGlmICh0eXBlb2YgcyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPCBuID8gcyA6IHMuc2xpY2UoMCwgbik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHM7XG4gIH1cbn1cbmZ1bmN0aW9uIGluc3BlY3Qoc29tZXRoaW5nKSB7XG4gIGlmIChmdW5jdGlvbnNIYXZlTmFtZXMgfHwgIXV0aWwuaXNGdW5jdGlvbihzb21ldGhpbmcpKSB7XG4gICAgcmV0dXJuIHV0aWwuaW5zcGVjdChzb21ldGhpbmcpO1xuICB9XG4gIHZhciByYXduYW1lID0gZ2V0TmFtZShzb21ldGhpbmcpO1xuICB2YXIgbmFtZSA9IHJhd25hbWUgPyAnOiAnICsgcmF3bmFtZSA6ICcnO1xuICByZXR1cm4gJ1tGdW5jdGlvbicgKyAgbmFtZSArICddJztcbn1cbmZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZikge1xuICByZXR1cm4gdHJ1bmNhdGUoaW5zcGVjdChzZWxmLmFjdHVhbCksIDEyOCkgKyAnICcgK1xuICAgICAgICAgc2VsZi5vcGVyYXRvciArICcgJyArXG4gICAgICAgICB0cnVuY2F0ZShpbnNwZWN0KHNlbGYuZXhwZWN0ZWQpLCAxMjgpO1xufVxuXG4vLyBBdCBwcmVzZW50IG9ubHkgdGhlIHRocmVlIGtleXMgbWVudGlvbmVkIGFib3ZlIGFyZSB1c2VkIGFuZFxuLy8gdW5kZXJzdG9vZCBieSB0aGUgc3BlYy4gSW1wbGVtZW50YXRpb25zIG9yIHN1YiBtb2R1bGVzIGNhbiBwYXNzXG4vLyBvdGhlciBrZXlzIHRvIHRoZSBBc3NlcnRpb25FcnJvcidzIGNvbnN0cnVjdG9yIC0gdGhleSB3aWxsIGJlXG4vLyBpZ25vcmVkLlxuXG4vLyAzLiBBbGwgb2YgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgbXVzdCB0aHJvdyBhbiBBc3NlcnRpb25FcnJvclxuLy8gd2hlbiBhIGNvcnJlc3BvbmRpbmcgY29uZGl0aW9uIGlzIG5vdCBtZXQsIHdpdGggYSBtZXNzYWdlIHRoYXRcbi8vIG1heSBiZSB1bmRlZmluZWQgaWYgbm90IHByb3ZpZGVkLiAgQWxsIGFzc2VydGlvbiBtZXRob2RzIHByb3ZpZGVcbi8vIGJvdGggdGhlIGFjdHVhbCBhbmQgZXhwZWN0ZWQgdmFsdWVzIHRvIHRoZSBhc3NlcnRpb24gZXJyb3IgZm9yXG4vLyBkaXNwbGF5IHB1cnBvc2VzLlxuXG5mdW5jdGlvbiBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsIG9wZXJhdG9yLCBzdGFja1N0YXJ0RnVuY3Rpb24pIHtcbiAgdGhyb3cgbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7XG4gICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICBleHBlY3RlZDogZXhwZWN0ZWQsXG4gICAgb3BlcmF0b3I6IG9wZXJhdG9yLFxuICAgIHN0YWNrU3RhcnRGdW5jdGlvbjogc3RhY2tTdGFydEZ1bmN0aW9uXG4gIH0pO1xufVxuXG4vLyBFWFRFTlNJT04hIGFsbG93cyBmb3Igd2VsbCBiZWhhdmVkIGVycm9ycyBkZWZpbmVkIGVsc2V3aGVyZS5cbmFzc2VydC5mYWlsID0gZmFpbDtcblxuLy8gNC4gUHVyZSBhc3NlcnRpb24gdGVzdHMgd2hldGhlciBhIHZhbHVlIGlzIHRydXRoeSwgYXMgZGV0ZXJtaW5lZFxuLy8gYnkgISFndWFyZC5cbi8vIGFzc2VydC5vayhndWFyZCwgbWVzc2FnZV9vcHQpO1xuLy8gVGhpcyBzdGF0ZW1lbnQgaXMgZXF1aXZhbGVudCB0byBhc3NlcnQuZXF1YWwodHJ1ZSwgISFndWFyZCxcbi8vIG1lc3NhZ2Vfb3B0KTsuIFRvIHRlc3Qgc3RyaWN0bHkgZm9yIHRoZSB2YWx1ZSB0cnVlLCB1c2Vcbi8vIGFzc2VydC5zdHJpY3RFcXVhbCh0cnVlLCBndWFyZCwgbWVzc2FnZV9vcHQpOy5cblxuZnVuY3Rpb24gb2sodmFsdWUsIG1lc3NhZ2UpIHtcbiAgaWYgKCF2YWx1ZSkgZmFpbCh2YWx1ZSwgdHJ1ZSwgbWVzc2FnZSwgJz09JywgYXNzZXJ0Lm9rKTtcbn1cbmFzc2VydC5vayA9IG9rO1xuXG4vLyA1LiBUaGUgZXF1YWxpdHkgYXNzZXJ0aW9uIHRlc3RzIHNoYWxsb3csIGNvZXJjaXZlIGVxdWFsaXR5IHdpdGhcbi8vID09LlxuLy8gYXNzZXJ0LmVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmVxdWFsID0gZnVuY3Rpb24gZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9IGV4cGVjdGVkKSBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5lcXVhbCk7XG59O1xuXG4vLyA2LiBUaGUgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igd2hldGhlciB0d28gb2JqZWN0cyBhcmUgbm90IGVxdWFsXG4vLyB3aXRoICE9IGFzc2VydC5ub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3RFcXVhbCA9IGZ1bmN0aW9uIG5vdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJyE9JywgYXNzZXJ0Lm5vdEVxdWFsKTtcbiAgfVxufTtcblxuLy8gNy4gVGhlIGVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBhIGRlZXAgZXF1YWxpdHkgcmVsYXRpb24uXG4vLyBhc3NlcnQuZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LmRlZXBFcXVhbCA9IGZ1bmN0aW9uIGRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmICghX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBmYWxzZSkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwRXF1YWwnLCBhc3NlcnQuZGVlcEVxdWFsKTtcbiAgfVxufTtcblxuYXNzZXJ0LmRlZXBTdHJpY3RFcXVhbCA9IGZ1bmN0aW9uIGRlZXBTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmICghX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCB0cnVlKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ2RlZXBTdHJpY3RFcXVhbCcsIGFzc2VydC5kZWVwU3RyaWN0RXF1YWwpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIHN0cmljdCwgbWVtb3MpIHtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoaXNCdWZmZXIoYWN0dWFsKSAmJiBpc0J1ZmZlcihleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gY29tcGFyZShhY3R1YWwsIGV4cGVjdGVkKSA9PT0gMDtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoKGFjdHVhbCA9PT0gbnVsbCB8fCB0eXBlb2YgYWN0dWFsICE9PSAnb2JqZWN0JykgJiZcbiAgICAgICAgICAgICAoZXhwZWN0ZWQgPT09IG51bGwgfHwgdHlwZW9mIGV4cGVjdGVkICE9PSAnb2JqZWN0JykpIHtcbiAgICByZXR1cm4gc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyBJZiBib3RoIHZhbHVlcyBhcmUgaW5zdGFuY2VzIG9mIHR5cGVkIGFycmF5cywgd3JhcCB0aGVpciB1bmRlcmx5aW5nXG4gIC8vIEFycmF5QnVmZmVycyBpbiBhIEJ1ZmZlciBlYWNoIHRvIGluY3JlYXNlIHBlcmZvcm1hbmNlXG4gIC8vIFRoaXMgb3B0aW1pemF0aW9uIHJlcXVpcmVzIHRoZSBhcnJheXMgdG8gaGF2ZSB0aGUgc2FtZSB0eXBlIGFzIGNoZWNrZWQgYnlcbiAgLy8gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyAoYWthIHBUb1N0cmluZykuIE5ldmVyIHBlcmZvcm0gYmluYXJ5XG4gIC8vIGNvbXBhcmlzb25zIGZvciBGbG9hdCpBcnJheXMsIHRob3VnaCwgc2luY2UgZS5nLiArMCA9PT0gLTAgYnV0IHRoZWlyXG4gIC8vIGJpdCBwYXR0ZXJucyBhcmUgbm90IGlkZW50aWNhbC5cbiAgfSBlbHNlIGlmIChpc1ZpZXcoYWN0dWFsKSAmJiBpc1ZpZXcoZXhwZWN0ZWQpICYmXG4gICAgICAgICAgICAgcFRvU3RyaW5nKGFjdHVhbCkgPT09IHBUb1N0cmluZyhleHBlY3RlZCkgJiZcbiAgICAgICAgICAgICAhKGFjdHVhbCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSB8fFxuICAgICAgICAgICAgICAgYWN0dWFsIGluc3RhbmNlb2YgRmxvYXQ2NEFycmF5KSkge1xuICAgIHJldHVybiBjb21wYXJlKG5ldyBVaW50OEFycmF5KGFjdHVhbC5idWZmZXIpLFxuICAgICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KGV4cGVjdGVkLmJ1ZmZlcikpID09PSAwO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSBpZiAoaXNCdWZmZXIoYWN0dWFsKSAhPT0gaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIG1lbW9zID0gbWVtb3MgfHwge2FjdHVhbDogW10sIGV4cGVjdGVkOiBbXX07XG5cbiAgICB2YXIgYWN0dWFsSW5kZXggPSBtZW1vcy5hY3R1YWwuaW5kZXhPZihhY3R1YWwpO1xuICAgIGlmIChhY3R1YWxJbmRleCAhPT0gLTEpIHtcbiAgICAgIGlmIChhY3R1YWxJbmRleCA9PT0gbWVtb3MuZXhwZWN0ZWQuaW5kZXhPZihleHBlY3RlZCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb3MuYWN0dWFsLnB1c2goYWN0dWFsKTtcbiAgICBtZW1vcy5leHBlY3RlZC5wdXNoKGV4cGVjdGVkKTtcblxuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBzdHJpY3QsIG1lbW9zKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0FyZ3VtZW50cyhvYmplY3QpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmplY3QpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xufVxuXG5mdW5jdGlvbiBvYmpFcXVpdihhLCBiLCBzdHJpY3QsIGFjdHVhbFZpc2l0ZWRPYmplY3RzKSB7XG4gIGlmIChhID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCB8fCBiID09PSBudWxsIHx8IGIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGlmIG9uZSBpcyBhIHByaW1pdGl2ZSwgdGhlIG90aGVyIG11c3QgYmUgc2FtZVxuICBpZiAodXRpbC5pc1ByaW1pdGl2ZShhKSB8fCB1dGlsLmlzUHJpbWl0aXZlKGIpKVxuICAgIHJldHVybiBhID09PSBiO1xuICBpZiAoc3RyaWN0ICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihhKSAhPT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGIpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgdmFyIGFJc0FyZ3MgPSBpc0FyZ3VtZW50cyhhKTtcbiAgdmFyIGJJc0FyZ3MgPSBpc0FyZ3VtZW50cyhiKTtcbiAgaWYgKChhSXNBcmdzICYmICFiSXNBcmdzKSB8fCAoIWFJc0FyZ3MgJiYgYklzQXJncykpXG4gICAgcmV0dXJuIGZhbHNlO1xuICBpZiAoYUlzQXJncykge1xuICAgIGEgPSBwU2xpY2UuY2FsbChhKTtcbiAgICBiID0gcFNsaWNlLmNhbGwoYik7XG4gICAgcmV0dXJuIF9kZWVwRXF1YWwoYSwgYiwgc3RyaWN0KTtcbiAgfVxuICB2YXIga2EgPSBvYmplY3RLZXlzKGEpO1xuICB2YXIga2IgPSBvYmplY3RLZXlzKGIpO1xuICB2YXIga2V5LCBpO1xuICAvLyBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGtleXMgaW5jb3Jwb3JhdGVzXG4gIC8vIGhhc093blByb3BlcnR5KVxuICBpZiAoa2EubGVuZ3RoICE9PSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIHN0cmljdCwgYWN0dWFsVmlzaXRlZE9iamVjdHMpKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyA4LiBUaGUgbm9uLWVxdWl2YWxlbmNlIGFzc2VydGlvbiB0ZXN0cyBmb3IgYW55IGRlZXAgaW5lcXVhbGl0eS5cbi8vIGFzc2VydC5ub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gbm90RGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKF9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgZmFsc2UpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnbm90RGVlcEVxdWFsJywgYXNzZXJ0Lm5vdERlZXBFcXVhbCk7XG4gIH1cbn07XG5cbmFzc2VydC5ub3REZWVwU3RyaWN0RXF1YWwgPSBub3REZWVwU3RyaWN0RXF1YWw7XG5mdW5jdGlvbiBub3REZWVwU3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCB0cnVlKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBTdHJpY3RFcXVhbCcsIG5vdERlZXBTdHJpY3RFcXVhbCk7XG4gIH1cbn1cblxuXG4vLyA5LiBUaGUgc3RyaWN0IGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzdHJpY3QgZXF1YWxpdHksIGFzIGRldGVybWluZWQgYnkgPT09LlxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnN0cmljdEVxdWFsID0gZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09PScsIGFzc2VydC5zdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDEwLiBUaGUgc3RyaWN0IG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHN0cmljdCBpbmVxdWFsaXR5LCBhc1xuLy8gZGV0ZXJtaW5lZCBieSAhPT0uICBhc3NlcnQubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT09JywgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkge1xuICBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHJldHVybiBleHBlY3RlZC50ZXN0KGFjdHVhbCk7XG4gIH1cblxuICB0cnkge1xuICAgIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBleHBlY3RlZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWdub3JlLiAgVGhlIGluc3RhbmNlb2YgY2hlY2sgZG9lc24ndCB3b3JrIGZvciBhcnJvdyBmdW5jdGlvbnMuXG4gIH1cblxuICBpZiAoRXJyb3IuaXNQcm90b3R5cGVPZihleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gZXhwZWN0ZWQuY2FsbCh7fSwgYWN0dWFsKSA9PT0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gX3RyeUJsb2NrKGJsb2NrKSB7XG4gIHZhciBlcnJvcjtcbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IgPSBlO1xuICB9XG4gIHJldHVybiBlcnJvcjtcbn1cblxuZnVuY3Rpb24gX3Rocm93cyhzaG91bGRUaHJvdywgYmxvY2ssIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIHZhciBhY3R1YWw7XG5cbiAgaWYgKHR5cGVvZiBibG9jayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYmxvY2tcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXhwZWN0ZWQgPT09ICdzdHJpbmcnKSB7XG4gICAgbWVzc2FnZSA9IGV4cGVjdGVkO1xuICAgIGV4cGVjdGVkID0gbnVsbDtcbiAgfVxuXG4gIGFjdHVhbCA9IF90cnlCbG9jayhibG9jayk7XG5cbiAgbWVzc2FnZSA9IChleHBlY3RlZCAmJiBleHBlY3RlZC5uYW1lID8gJyAoJyArIGV4cGVjdGVkLm5hbWUgKyAnKS4nIDogJy4nKSArXG4gICAgICAgICAgICAobWVzc2FnZSA/ICcgJyArIG1lc3NhZ2UgOiAnLicpO1xuXG4gIGlmIChzaG91bGRUaHJvdyAmJiAhYWN0dWFsKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICB2YXIgdXNlclByb3ZpZGVkTWVzc2FnZSA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJztcbiAgdmFyIGlzVW53YW50ZWRFeGNlcHRpb24gPSAhc2hvdWxkVGhyb3cgJiYgdXRpbC5pc0Vycm9yKGFjdHVhbCk7XG4gIHZhciBpc1VuZXhwZWN0ZWRFeGNlcHRpb24gPSAhc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmICFleHBlY3RlZDtcblxuICBpZiAoKGlzVW53YW50ZWRFeGNlcHRpb24gJiZcbiAgICAgIHVzZXJQcm92aWRlZE1lc3NhZ2UgJiZcbiAgICAgIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB8fFxuICAgICAgaXNVbmV4cGVjdGVkRXhjZXB0aW9uKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnR290IHVud2FudGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICgoc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmIGV4cGVjdGVkICYmXG4gICAgICAhZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8ICghc2hvdWxkVGhyb3cgJiYgYWN0dWFsKSkge1xuICAgIHRocm93IGFjdHVhbDtcbiAgfVxufVxuXG4vLyAxMS4gRXhwZWN0ZWQgdG8gdGhyb3cgYW4gZXJyb3I6XG4vLyBhc3NlcnQudGhyb3dzKGJsb2NrLCBFcnJvcl9vcHQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnRocm93cyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzKHRydWUsIGJsb2NrLCBlcnJvciwgbWVzc2FnZSk7XG59O1xuXG4vLyBFWFRFTlNJT04hIFRoaXMgaXMgYW5ub3lpbmcgdG8gd3JpdGUgb3V0c2lkZSB0aGlzIG1vZHVsZS5cbmFzc2VydC5kb2VzTm90VGhyb3cgPSBmdW5jdGlvbihibG9jaywgLypvcHRpb25hbCovZXJyb3IsIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cyhmYWxzZSwgYmxvY2ssIGVycm9yLCBtZXNzYWdlKTtcbn07XG5cbmFzc2VydC5pZkVycm9yID0gZnVuY3Rpb24oZXJyKSB7IGlmIChlcnIpIHRocm93IGVycjsgfTtcblxuLy8gRXhwb3NlIGEgc3RyaWN0IG9ubHkgdmFyaWFudCBvZiBhc3NlcnRcbmZ1bmN0aW9uIHN0cmljdCh2YWx1ZSwgbWVzc2FnZSkge1xuICBpZiAoIXZhbHVlKSBmYWlsKHZhbHVlLCB0cnVlLCBtZXNzYWdlLCAnPT0nLCBzdHJpY3QpO1xufVxuYXNzZXJ0LnN0cmljdCA9IG9iamVjdEFzc2lnbihzdHJpY3QsIGFzc2VydCwge1xuICBlcXVhbDogYXNzZXJ0LnN0cmljdEVxdWFsLFxuICBkZWVwRXF1YWw6IGFzc2VydC5kZWVwU3RyaWN0RXF1YWwsXG4gIG5vdEVxdWFsOiBhc3NlcnQubm90U3RyaWN0RXF1YWwsXG4gIG5vdERlZXBFcXVhbDogYXNzZXJ0Lm5vdERlZXBTdHJpY3RFcXVhbFxufSk7XG5hc3NlcnQuc3RyaWN0LnN0cmljdCA9IGFzc2VydC5zdHJpY3Q7XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59O1xuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiIiwiLyogZ2xvYmFscyBkb2N1bWVudCwgSW1hZ2VEYXRhICovXG5cbmNvbnN0IHBhcnNlRm9udCA9IHJlcXVpcmUoJy4vbGliL3BhcnNlLWZvbnQnKVxuXG5leHBvcnRzLnBhcnNlRm9udCA9IHBhcnNlRm9udFxuXG5leHBvcnRzLmNyZWF0ZUNhbnZhcyA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLCB7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfSlcbn1cblxuZXhwb3J0cy5jcmVhdGVJbWFnZURhdGEgPSBmdW5jdGlvbiAoYXJyYXksIHdpZHRoLCBoZWlnaHQpIHtcbiAgLy8gQnJvd3NlciBpbXBsZW1lbnRhdGlvbiBvZiBJbWFnZURhdGEgbG9va3MgYXQgdGhlIG51bWJlciBvZiBhcmd1bWVudHMgcGFzc2VkXG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIG5ldyBJbWFnZURhdGEoKVxuICAgIGNhc2UgMTogcmV0dXJuIG5ldyBJbWFnZURhdGEoYXJyYXkpXG4gICAgY2FzZSAyOiByZXR1cm4gbmV3IEltYWdlRGF0YShhcnJheSwgd2lkdGgpXG4gICAgZGVmYXVsdDogcmV0dXJuIG5ldyBJbWFnZURhdGEoYXJyYXksIHdpZHRoLCBoZWlnaHQpXG4gIH1cbn1cblxuZXhwb3J0cy5sb2FkSW1hZ2UgPSBmdW5jdGlvbiAoc3JjLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgY29uc3QgaW1hZ2UgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpLCBvcHRpb25zKVxuXG4gICAgZnVuY3Rpb24gY2xlYW51cCAoKSB7XG4gICAgICBpbWFnZS5vbmxvYWQgPSBudWxsXG4gICAgICBpbWFnZS5vbmVycm9yID0gbnVsbFxuICAgIH1cblxuICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgY2xlYW51cCgpOyByZXNvbHZlKGltYWdlKSB9XG4gICAgaW1hZ2Uub25lcnJvciA9IGZ1bmN0aW9uICgpIHsgY2xlYW51cCgpOyByZWplY3QobmV3IEVycm9yKCdGYWlsZWQgdG8gbG9hZCB0aGUgaW1hZ2UgXCInICsgc3JjICsgJ1wiJykpIH1cblxuICAgIGltYWdlLnNyYyA9IHNyY1xuICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogRm9udCBSZWdFeHAgaGVscGVycy5cbiAqL1xuXG5jb25zdCB3ZWlnaHRzID0gJ2JvbGR8Ym9sZGVyfGxpZ2h0ZXJ8WzEtOV0wMCdcbmNvbnN0IHN0eWxlcyA9ICdpdGFsaWN8b2JsaXF1ZSdcbmNvbnN0IHZhcmlhbnRzID0gJ3NtYWxsLWNhcHMnXG5jb25zdCBzdHJldGNoZXMgPSAndWx0cmEtY29uZGVuc2VkfGV4dHJhLWNvbmRlbnNlZHxjb25kZW5zZWR8c2VtaS1jb25kZW5zZWR8c2VtaS1leHBhbmRlZHxleHBhbmRlZHxleHRyYS1leHBhbmRlZHx1bHRyYS1leHBhbmRlZCdcbmNvbnN0IHVuaXRzID0gJ3B4fHB0fHBjfGlufGNtfG1tfCV8ZW18ZXh8Y2h8cmVtfHEnXG5jb25zdCBzdHJpbmcgPSAnXFwnKFteXFwnXSspXFwnfFwiKFteXCJdKylcInxbXFxcXHdcXFxccy1dKydcblxuLy8gWyBbIDzigJhmb250LXN0eWxl4oCZPiB8fCA8Zm9udC12YXJpYW50LWNzczIxPiB8fCA84oCYZm9udC13ZWlnaHTigJk+IHx8IDzigJhmb250LXN0cmV0Y2jigJk+IF0/XG4vLyAgICA84oCYZm9udC1zaXpl4oCZPiBbIC8gPOKAmGxpbmUtaGVpZ2h04oCZPiBdPyA84oCYZm9udC1mYW1pbHnigJk+IF1cbi8vIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3MtZm9udHMtMy8jZm9udC1wcm9wXG5jb25zdCB3ZWlnaHRSZSA9IG5ldyBSZWdFeHAoYCgke3dlaWdodHN9KSArYCwgJ2knKVxuY29uc3Qgc3R5bGVSZSA9IG5ldyBSZWdFeHAoYCgke3N0eWxlc30pICtgLCAnaScpXG5jb25zdCB2YXJpYW50UmUgPSBuZXcgUmVnRXhwKGAoJHt2YXJpYW50c30pICtgLCAnaScpXG5jb25zdCBzdHJldGNoUmUgPSBuZXcgUmVnRXhwKGAoJHtzdHJldGNoZXN9KSArYCwgJ2knKVxuY29uc3Qgc2l6ZUZhbWlseVJlID0gbmV3IFJlZ0V4cChcbiAgYChbXFxcXGRcXFxcLl0rKSgke3VuaXRzfSkgKigoPzoke3N0cmluZ30pKCAqLCAqKD86JHtzdHJpbmd9KSkqKWApXG5cbi8qKlxuICogQ2FjaGUgZm9udCBwYXJzaW5nLlxuICovXG5cbmNvbnN0IGNhY2hlID0ge31cblxuY29uc3QgZGVmYXVsdEhlaWdodCA9IDE2IC8vIHB0LCBjb21tb24gYnJvd3NlciBkZWZhdWx0XG5cbi8qKlxuICogUGFyc2UgZm9udCBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9IFBhcnNlZCBmb250LiBgc2l6ZWAgaXMgaW4gZGV2aWNlIHVuaXRzLiBgdW5pdGAgaXMgdGhlIHVuaXRcbiAqICAgYXBwZWFyaW5nIGluIHRoZSBpbnB1dCBzdHJpbmcuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0ciA9PiB7XG4gIC8vIENhY2hlZFxuICBpZiAoY2FjaGVbc3RyXSkgcmV0dXJuIGNhY2hlW3N0cl1cblxuICAvLyBUcnkgZm9yIHJlcXVpcmVkIHByb3BlcnRpZXMgZmlyc3QuXG4gIGNvbnN0IHNpemVGYW1pbHkgPSBzaXplRmFtaWx5UmUuZXhlYyhzdHIpXG4gIGlmICghc2l6ZUZhbWlseSkgcmV0dXJuIC8vIGludmFsaWRcblxuICAvLyBEZWZhdWx0IHZhbHVlcyBhbmQgcmVxdWlyZWQgcHJvcGVydGllc1xuICBjb25zdCBmb250ID0ge1xuICAgIHdlaWdodDogJ25vcm1hbCcsXG4gICAgc3R5bGU6ICdub3JtYWwnLFxuICAgIHN0cmV0Y2g6ICdub3JtYWwnLFxuICAgIHZhcmlhbnQ6ICdub3JtYWwnLFxuICAgIHNpemU6IHBhcnNlRmxvYXQoc2l6ZUZhbWlseVsxXSksXG4gICAgdW5pdDogc2l6ZUZhbWlseVsyXSxcbiAgICBmYW1pbHk6IHNpemVGYW1pbHlbM10ucmVwbGFjZSgvW1wiJ10vZywgJycpLnJlcGxhY2UoLyAqLCAqL2csICcsJylcbiAgfVxuXG4gIC8vIE9wdGlvbmFsLCB1bm9yZGVyZWQgcHJvcGVydGllcy5cbiAgbGV0IHdlaWdodCwgc3R5bGUsIHZhcmlhbnQsIHN0cmV0Y2hcbiAgLy8gU3RvcCBzZWFyY2ggYXQgYHNpemVGYW1pbHkuaW5kZXhgXG4gIGNvbnN0IHN1YnN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgc2l6ZUZhbWlseS5pbmRleClcbiAgaWYgKCh3ZWlnaHQgPSB3ZWlnaHRSZS5leGVjKHN1YnN0cikpKSBmb250LndlaWdodCA9IHdlaWdodFsxXVxuICBpZiAoKHN0eWxlID0gc3R5bGVSZS5leGVjKHN1YnN0cikpKSBmb250LnN0eWxlID0gc3R5bGVbMV1cbiAgaWYgKCh2YXJpYW50ID0gdmFyaWFudFJlLmV4ZWMoc3Vic3RyKSkpIGZvbnQudmFyaWFudCA9IHZhcmlhbnRbMV1cbiAgaWYgKChzdHJldGNoID0gc3RyZXRjaFJlLmV4ZWMoc3Vic3RyKSkpIGZvbnQuc3RyZXRjaCA9IHN0cmV0Y2hbMV1cblxuICAvLyBDb252ZXJ0IHRvIGRldmljZSB1bml0cy4gKGBmb250LnVuaXRgIGlzIHRoZSBvcmlnaW5hbCB1bml0KVxuICAvLyBUT0RPOiBjaCwgZXhcbiAgc3dpdGNoIChmb250LnVuaXQpIHtcbiAgICBjYXNlICdwdCc6XG4gICAgICBmb250LnNpemUgLz0gMC43NVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdwYyc6XG4gICAgICBmb250LnNpemUgKj0gMTZcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnaW4nOlxuICAgICAgZm9udC5zaXplICo9IDk2XG4gICAgICBicmVha1xuICAgIGNhc2UgJ2NtJzpcbiAgICAgIGZvbnQuc2l6ZSAqPSA5Ni4wIC8gMi41NFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdtbSc6XG4gICAgICBmb250LnNpemUgKj0gOTYuMCAvIDI1LjRcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnJSc6XG4gICAgICAvLyBUT0RPIGRpc2FibGVkIGJlY2F1c2UgZXhpc3RpbmcgdW5pdCB0ZXN0cyBhc3N1bWUgMTAwXG4gICAgICAvLyBmb250LnNpemUgKj0gZGVmYXVsdEhlaWdodCAvIDEwMCAvIDAuNzVcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnZW0nOlxuICAgIGNhc2UgJ3JlbSc6XG4gICAgICBmb250LnNpemUgKj0gZGVmYXVsdEhlaWdodCAvIDAuNzVcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncSc6XG4gICAgICBmb250LnNpemUgKj0gOTYgLyAyNS40IC8gNFxuICAgICAgYnJlYWtcbiAgfVxuXG4gIHJldHVybiAoY2FjaGVbc3RyXSA9IGZvbnQpXG59XG4iLCIvKlxub2JqZWN0LWFzc2lnblxuKGMpIFNpbmRyZSBTb3JodXNcbkBsaWNlbnNlIE1JVFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwcm9wSXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuZnVuY3Rpb24gdG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRVc2VOYXRpdmUoKSB7XG5cdHRyeSB7XG5cdFx0aWYgKCFPYmplY3QuYXNzaWduKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gRGV0ZWN0IGJ1Z2d5IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyIGluIG9sZGVyIFY4IHZlcnNpb25zLlxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuXHRcdHZhciB0ZXN0MSA9IG5ldyBTdHJpbmcoJ2FiYycpOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXctd3JhcHBlcnNcblx0XHR0ZXN0MVs1XSA9ICdkZSc7XG5cdFx0aWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QxKVswXSA9PT0gJzUnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MiA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuXHRcdFx0dGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpO1xuXHRcdH1cblx0XHR2YXIgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbiAobikge1xuXHRcdFx0cmV0dXJuIHRlc3QyW25dO1xuXHRcdH0pO1xuXHRcdGlmIChvcmRlcjIuam9pbignJykgIT09ICcwMTIzNDU2Nzg5Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDMgPSB7fTtcblx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcblx0XHRcdHRlc3QzW2xldHRlcl0gPSBsZXR0ZXI7XG5cdFx0fSk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKE9iamVjdC5hc3NpZ24oe30sIHRlc3QzKSkuam9pbignJykgIT09XG5cdFx0XHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gV2UgZG9uJ3QgZXhwZWN0IGFueSBvZiB0aGUgYWJvdmUgdG8gdGhyb3csIGJ1dCBiZXR0ZXIgdG8gYmUgc2FmZS5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG91bGRVc2VOYXRpdmUoKSA/IE9iamVjdC5hc3NpZ24gOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG5cdFx0XHRzeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChwcm9wSXNFbnVtZXJhYmxlLmNhbGwoZnJvbSwgc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0XHR0b1tzeW1ib2xzW2ldXSA9IGZyb21bc3ltYm9sc1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNvbXBpbGUgPSBleHBvcnRzLm1ha2VOb250ZXJtaW5hbENvbnZlcnRlcnMgPSB2b2lkIDA7XG5jb25zdCB0eXBlc18xID0gcmVxdWlyZShcIi4vdHlwZXNcIik7XG5jb25zdCBhc3NlcnRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiYXNzZXJ0XCIpKTtcbmNvbnN0IHBhcnNlcl8xID0gcmVxdWlyZShcIi4vcGFyc2VyXCIpO1xuLyoqXG4gKiBDb252ZXJ0cyBzdHJpbmcgdG8gbm9udGVybWluYWwuXG4gKiBAcGFyYW0gPE5UPiBub250ZXJtaW5hbCBlbnVtZXJhdGlvblxuICogQHBhcmFtIG5vbnRlcm1pbmFscyByZXF1aXJlZCB0byBiZSB0aGUgcnVudGltZSBvYmplY3QgZm9yIHRoZSA8TlQ+IHR5cGUgcGFyYW1ldGVyXG4gKiBAcmV0dXJuIGEgcGFpciBvZiBjb252ZXJ0ZXJzIHsgbm9udGVybWluYWxUb1N0cmluZywgc3RyaW5nVG9Ob250ZXJtaW5hbCB9XG4gKiAgICAgICAgICAgICAgb25lIHRha2VzIGEgc3RyaW5nIChhbnkgYWxwaGFiZXRpYyBjYXNlKSBhbmQgcmV0dXJucyB0aGUgbm9udGVybWluYWwgaXQgbmFtZXNcbiAqICAgICAgICAgICAgICB0aGUgb3RoZXIgdGFrZXMgYSBub250ZXJtaW5hbCBhbmQgcmV0dXJucyBpdHMgc3RyaW5nIG5hbWUsIHVzaW5nIHRoZSBUeXBlc2NyaXB0IHNvdXJjZSBjYXBpdGFsaXphdGlvbi5cbiAqICAgICAgICAgQm90aCBjb252ZXJ0ZXJzIHRocm93IEdyYW1tYXJFcnJvciBpZiB0aGUgY29udmVyc2lvbiBjYW4ndCBiZSBkb25lLlxuICogQHRocm93cyBHcmFtbWFyRXJyb3IgaWYgTlQgaGFzIGEgbmFtZSBjb2xsaXNpb24gKHR3byBub250ZXJtaW5hbCBuYW1lcyB0aGF0IGRpZmZlciBvbmx5IGluIGNhcGl0YWxpemF0aW9uLFxuICogICAgICAgZS5nLiBST09UIGFuZCByb290KS5cbiAqL1xuZnVuY3Rpb24gbWFrZU5vbnRlcm1pbmFsQ29udmVydGVycyhub250ZXJtaW5hbHMpIHtcbiAgICAvLyBcImNhbm9uaWNhbCBuYW1lXCIgaXMgYSBjYXNlLWluZGVwZW5kZW50IG5hbWUgKGNhbm9uaWNhbGl6ZWQgdG8gbG93ZXJjYXNlKVxuICAgIC8vIFwic291cmNlIG5hbWVcIiBpcyB0aGUgbmFtZSBjYXBpdGFsaXplZCBhcyBpbiB0aGUgVHlwZXNjcmlwdCBzb3VyY2UgZGVmaW5pdGlvbiBvZiBOVFxuICAgIGNvbnN0IG5vbnRlcm1pbmFsRm9yQ2Fub25pY2FsTmFtZSA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBzb3VyY2VOYW1lRm9yTm9udGVybWluYWwgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobm9udGVybWluYWxzKSkge1xuICAgICAgICAvLyBpbiBUeXBlc2NyaXB0LCB0aGUgbm9udGVybWluYWxzIG9iamVjdCBjb21iaW5lcyBib3RoIGEgTlQtPm5hbWUgbWFwcGluZyBhbmQgbmFtZS0+TlQgbWFwcGluZy5cbiAgICAgICAgLy8gaHR0cHM6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svZW51bXMuaHRtbCNlbnVtcy1hdC1ydW50aW1lXG4gICAgICAgIC8vIFNvIGZpbHRlciBqdXN0IHRvIGtleXMgdGhhdCBhcmUgdmFsaWQgUGFyc2VybGliIG5vbnRlcm1pbmFsIG5hbWVzXG4gICAgICAgIGlmICgvXlthLXpBLVpfXVthLXpBLVpfMC05XSokLy50ZXN0KGtleSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZU5hbWUgPSBrZXk7XG4gICAgICAgICAgICBjb25zdCBjYW5vbmljYWxOYW1lID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBjb25zdCBudCA9IG5vbnRlcm1pbmFsc1tzb3VyY2VOYW1lXTtcbiAgICAgICAgICAgIGlmIChub250ZXJtaW5hbEZvckNhbm9uaWNhbE5hbWUuaGFzKGNhbm9uaWNhbE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuR3JhbW1hckVycm9yKCduYW1lIGNvbGxpc2lvbiBpbiBub250ZXJtaW5hbCBlbnVtZXJhdGlvbjogJ1xuICAgICAgICAgICAgICAgICAgICArIHNvdXJjZU5hbWVGb3JOb250ZXJtaW5hbC5nZXQobm9udGVybWluYWxGb3JDYW5vbmljYWxOYW1lLmdldChjYW5vbmljYWxOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgKyAnIGFuZCAnICsgc291cmNlTmFtZVxuICAgICAgICAgICAgICAgICAgICArICcgYXJlIHRoZSBzYW1lIHdoZW4gY29tcGFyZWQgY2FzZS1pbnNlbnNpdGl2ZWx5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub250ZXJtaW5hbEZvckNhbm9uaWNhbE5hbWUuc2V0KGNhbm9uaWNhbE5hbWUsIG50KTtcbiAgICAgICAgICAgIHNvdXJjZU5hbWVGb3JOb250ZXJtaW5hbC5zZXQobnQsIHNvdXJjZU5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5lcnJvcihzb3VyY2VOYW1lRm9yTm9udGVybWluYWwpO1xuICAgIGZ1bmN0aW9uIHN0cmluZ1RvTm9udGVybWluYWwobmFtZSkge1xuICAgICAgICBjb25zdCBjYW5vbmljYWxOYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoIW5vbnRlcm1pbmFsRm9yQ2Fub25pY2FsTmFtZS5oYXMoY2Fub25pY2FsTmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyB0eXBlc18xLkdyYW1tYXJFcnJvcignZ3JhbW1hciB1c2VzIG5vbnRlcm1pbmFsICcgKyBuYW1lICsgJywgd2hpY2ggaXMgbm90IGZvdW5kIGluIHRoZSBub250ZXJtaW5hbCBlbnVtZXJhdGlvbiBwYXNzZWQgdG8gY29tcGlsZSgpJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vbnRlcm1pbmFsRm9yQ2Fub25pY2FsTmFtZS5nZXQoY2Fub25pY2FsTmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5vbnRlcm1pbmFsVG9TdHJpbmcobnQpIHtcbiAgICAgICAgaWYgKCFzb3VyY2VOYW1lRm9yTm9udGVybWluYWwuaGFzKG50KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuR3JhbW1hckVycm9yKCdub250ZXJtaW5hbCAnICsgbnQgKyAnIGlzIG5vdCBmb3VuZCBpbiB0aGUgbm9udGVybWluYWwgZW51bWVyYXRpb24gcGFzc2VkIHRvIGNvbXBpbGUoKScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VyY2VOYW1lRm9yTm9udGVybWluYWwuZ2V0KG50KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgc3RyaW5nVG9Ob250ZXJtaW5hbCwgbm9udGVybWluYWxUb1N0cmluZyB9O1xufVxuZXhwb3J0cy5tYWtlTm9udGVybWluYWxDb252ZXJ0ZXJzID0gbWFrZU5vbnRlcm1pbmFsQ29udmVydGVycztcbnZhciBHcmFtbWFyTlQ7XG4oZnVuY3Rpb24gKEdyYW1tYXJOVCkge1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJHUkFNTUFSXCJdID0gMF0gPSBcIkdSQU1NQVJcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiUFJPRFVDVElPTlwiXSA9IDFdID0gXCJQUk9EVUNUSU9OXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlNLSVBCTE9DS1wiXSA9IDJdID0gXCJTS0lQQkxPQ0tcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiVU5JT05cIl0gPSAzXSA9IFwiVU5JT05cIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiQ09OQ0FURU5BVElPTlwiXSA9IDRdID0gXCJDT05DQVRFTkFUSU9OXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlJFUEVUSVRJT05cIl0gPSA1XSA9IFwiUkVQRVRJVElPTlwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJSRVBFQVRPUEVSQVRPUlwiXSA9IDZdID0gXCJSRVBFQVRPUEVSQVRPUlwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJVTklUXCJdID0gN10gPSBcIlVOSVRcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiTk9OVEVSTUlOQUxcIl0gPSA4XSA9IFwiTk9OVEVSTUlOQUxcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiVEVSTUlOQUxcIl0gPSA5XSA9IFwiVEVSTUlOQUxcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiUVVPVEVEU1RSSU5HXCJdID0gMTBdID0gXCJRVU9URURTVFJJTkdcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiTlVNQkVSXCJdID0gMTFdID0gXCJOVU1CRVJcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiUkFOR0VcIl0gPSAxMl0gPSBcIlJBTkdFXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIlVQUEVSQk9VTkRcIl0gPSAxM10gPSBcIlVQUEVSQk9VTkRcIjtcbiAgICBHcmFtbWFyTlRbR3JhbW1hck5UW1wiTE9XRVJCT1VORFwiXSA9IDE0XSA9IFwiTE9XRVJCT1VORFwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJDSEFSQUNURVJTRVRcIl0gPSAxNV0gPSBcIkNIQVJBQ1RFUlNFVFwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJBTllDSEFSXCJdID0gMTZdID0gXCJBTllDSEFSXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIkNIQVJBQ1RFUkNMQVNTXCJdID0gMTddID0gXCJDSEFSQUNURVJDTEFTU1wiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJXSElURVNQQUNFXCJdID0gMThdID0gXCJXSElURVNQQUNFXCI7XG4gICAgR3JhbW1hck5UW0dyYW1tYXJOVFtcIk9ORUxJTkVDT01NRU5UXCJdID0gMTldID0gXCJPTkVMSU5FQ09NTUVOVFwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJCTE9DS0NPTU1FTlRcIl0gPSAyMF0gPSBcIkJMT0NLQ09NTUVOVFwiO1xuICAgIEdyYW1tYXJOVFtHcmFtbWFyTlRbXCJTS0lQXCJdID0gMjFdID0gXCJTS0lQXCI7XG59KShHcmFtbWFyTlQgfHwgKEdyYW1tYXJOVCA9IHt9KSk7XG47XG5mdW5jdGlvbiBudHQobm9udGVybWluYWwpIHtcbiAgICByZXR1cm4gKDAsIHBhcnNlcl8xLm50KShub250ZXJtaW5hbCwgR3JhbW1hck5UW25vbnRlcm1pbmFsXSk7XG59XG5jb25zdCBncmFtbWFyR3JhbW1hciA9IG5ldyBNYXAoKTtcbi8vIGdyYW1tYXIgOjo9ICggcHJvZHVjdGlvbiB8IHNraXBCbG9jayApK1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5HUkFNTUFSLCAoMCwgcGFyc2VyXzEuY2F0KShudHQoR3JhbW1hck5ULlNLSVApLCAoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLm9yKShudHQoR3JhbW1hck5ULlBST0RVQ1RJT04pLCBudHQoR3JhbW1hck5ULlNLSVBCTE9DSykpLCBudHQoR3JhbW1hck5ULlNLSVApKSkpKTtcbi8vIHNraXBCbG9jayA6Oj0gJ0Bza2lwJyBub250ZXJtaW5hbCAneycgcHJvZHVjdGlvbiogJ30nXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlNLSVBCTE9DSywgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoXCJAc2tpcFwiKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSwgKDAsIHBhcnNlcl8xLmZhaWxmYXN0KShudHQoR3JhbW1hck5ULk5PTlRFUk1JTkFMKSksIG50dChHcmFtbWFyTlQuU0tJUCksICgwLCBwYXJzZXJfMS5zdHIpKCd7JyksICgwLCBwYXJzZXJfMS5mYWlsZmFzdCkoKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5TS0lQKSwgKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuUFJPRFVDVElPTiksIG50dChHcmFtbWFyTlQuU0tJUCkpKSwgKDAsIHBhcnNlcl8xLnN0cikoJ30nKSkpKSk7XG4vLyBwcm9kdWN0aW9uIDo6PSBub250ZXJtaW5hbCAnOjo9JyB1bmlvbiAnOydcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuUFJPRFVDVElPTiwgKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5OT05URVJNSU5BTCksIG50dChHcmFtbWFyTlQuU0tJUCksICgwLCBwYXJzZXJfMS5zdHIpKFwiOjo9XCIpLCAoMCwgcGFyc2VyXzEuZmFpbGZhc3QpKCgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuU0tJUCksIG50dChHcmFtbWFyTlQuVU5JT04pLCBudHQoR3JhbW1hck5ULlNLSVApLCAoMCwgcGFyc2VyXzEuc3RyKSgnOycpKSkpKTtcbi8vIHVuaW9uIDo6ID0gY29uY2F0ZW5hdGlvbiAoJ3wnIGNvbmNhdGVuYXRpb24pKlxuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5VTklPTiwgKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5DT05DQVRFTkFUSU9OKSwgKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuU0tJUCksICgwLCBwYXJzZXJfMS5zdHIpKCd8JyksIG50dChHcmFtbWFyTlQuU0tJUCksIG50dChHcmFtbWFyTlQuQ09OQ0FURU5BVElPTikpKSkpO1xuLy8gY29uY2F0ZW5hdGlvbiA6OiA9IHJlcGV0aXRpb24qIFxuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5DT05DQVRFTkFUSU9OLCAoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5SRVBFVElUSU9OKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSkpKTtcbi8vIHJlcGV0aXRpb24gOjo9IHVuaXQgcmVwZWF0T3BlcmF0b3I/XG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlJFUEVUSVRJT04sICgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuVU5JVCksIG50dChHcmFtbWFyTlQuU0tJUCksICgwLCBwYXJzZXJfMS5vcHRpb24pKG50dChHcmFtbWFyTlQuUkVQRUFUT1BFUkFUT1IpKSkpO1xuLy8gcmVwZWF0T3BlcmF0b3IgOjo9IFsqKz9dIHwgJ3snICggbnVtYmVyIHwgcmFuZ2UgfCB1cHBlckJvdW5kIHwgbG93ZXJCb3VuZCApICd9J1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5SRVBFQVRPUEVSQVRPUiwgKDAsIHBhcnNlcl8xLm9yKSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiWyorP11cIiksICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKFwie1wiKSwgKDAsIHBhcnNlcl8xLm9yKShudHQoR3JhbW1hck5ULk5VTUJFUiksIG50dChHcmFtbWFyTlQuUkFOR0UpLCBudHQoR3JhbW1hck5ULlVQUEVSQk9VTkQpLCBudHQoR3JhbW1hck5ULkxPV0VSQk9VTkQpKSwgKDAsIHBhcnNlcl8xLnN0cikoXCJ9XCIpKSkpO1xuLy8gbnVtYmVyIDo6PSBbMC05XStcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuTlVNQkVSLCAoMCwgcGFyc2VyXzEucGx1cykoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlswLTldXCIpKSk7XG4vLyByYW5nZSA6Oj0gbnVtYmVyICcsJyBudW1iZXJcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuUkFOR0UsICgwLCBwYXJzZXJfMS5jYXQpKG50dChHcmFtbWFyTlQuTlVNQkVSKSwgKDAsIHBhcnNlcl8xLnN0cikoXCIsXCIpLCBudHQoR3JhbW1hck5ULk5VTUJFUikpKTtcbi8vIHVwcGVyQm91bmQgOjo9ICcsJyBudW1iZXJcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuVVBQRVJCT1VORCwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoXCIsXCIpLCBudHQoR3JhbW1hck5ULk5VTUJFUikpKTtcbi8vIGxvd2VyQm91bmQgOjo9IG51bWJlciAnLCdcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuTE9XRVJCT1VORCwgKDAsIHBhcnNlcl8xLmNhdCkobnR0KEdyYW1tYXJOVC5OVU1CRVIpLCAoMCwgcGFyc2VyXzEuc3RyKShcIixcIikpKTtcbi8vIHVuaXQgOjo9IG5vbnRlcm1pbmFsIHwgdGVybWluYWwgfCAnKCcgdW5pb24gJyknXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlVOSVQsICgwLCBwYXJzZXJfMS5vcikobnR0KEdyYW1tYXJOVC5OT05URVJNSU5BTCksIG50dChHcmFtbWFyTlQuVEVSTUlOQUwpLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKSgnKCcpLCBudHQoR3JhbW1hck5ULlNLSVApLCBudHQoR3JhbW1hck5ULlVOSU9OKSwgbnR0KEdyYW1tYXJOVC5TS0lQKSwgKDAsIHBhcnNlcl8xLnN0cikoJyknKSkpKTtcbi8vIG5vbnRlcm1pbmFsIDo6PSBbYS16QS1aX11bYS16QS1aXzAtOV0qXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULk5PTlRFUk1JTkFMLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiW2EtekEtWl9dXCIpLCAoMCwgcGFyc2VyXzEuc3RhcikoKDAsIHBhcnNlcl8xLnJlZ2V4KShcIlthLXpBLVpfMC05XVwiKSkpKTtcbi8vIHRlcm1pbmFsIDo6PSBxdW90ZWRTdHJpbmcgfCBjaGFyYWN0ZXJTZXQgfCBhbnlDaGFyIHwgY2hhcmFjdGVyQ2xhc3NcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuVEVSTUlOQUwsICgwLCBwYXJzZXJfMS5vcikobnR0KEdyYW1tYXJOVC5RVU9URURTVFJJTkcpLCBudHQoR3JhbW1hck5ULkNIQVJBQ1RFUlNFVCksIG50dChHcmFtbWFyTlQuQU5ZQ0hBUiksIG50dChHcmFtbWFyTlQuQ0hBUkFDVEVSQ0xBU1MpKSk7XG4vLyBxdW90ZWRTdHJpbmcgOjo9IFwiJ1wiIChbXidcXHJcXG5cXFxcXSB8ICdcXFxcJyAuICkqIFwiJ1wiIHwgJ1wiJyAoW15cIlxcclxcblxcXFxdIHwgJ1xcXFwnIC4gKSogJ1wiJ1xuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5RVU9URURTVFJJTkcsICgwLCBwYXJzZXJfMS5vcikoKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoXCInXCIpLCAoMCwgcGFyc2VyXzEuZmFpbGZhc3QpKCgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEub3IpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbXidcXHJcXG5cXFxcXFxcXF1cIiksICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKCdcXFxcJyksICgwLCBwYXJzZXJfMS5yZWdleCkoXCIuXCIpKSkpKSwgKDAsIHBhcnNlcl8xLnN0cikoXCInXCIpKSwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoJ1wiJyksICgwLCBwYXJzZXJfMS5mYWlsZmFzdCkoKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5vcikoKDAsIHBhcnNlcl8xLnJlZ2V4KSgnW15cIlxcclxcblxcXFxcXFxcXScpLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKSgnXFxcXCcpLCAoMCwgcGFyc2VyXzEucmVnZXgpKFwiLlwiKSkpKSksICgwLCBwYXJzZXJfMS5zdHIpKCdcIicpKSkpO1xuLy8gY2hhcmFjdGVyU2V0IDo6PSAnWycgKFteXFxdXFxyXFxuXFxcXF0gfCAnXFxcXCcgLiApKyAnXSdcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuQ0hBUkFDVEVSU0VULCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKSgnWycpLCAoMCwgcGFyc2VyXzEuZmFpbGZhc3QpKCgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5wbHVzKSgoMCwgcGFyc2VyXzEub3IpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbXlxcXFxdXFxyXFxuXFxcXFxcXFxdXCIpLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKSgnXFxcXCcpLCAoMCwgcGFyc2VyXzEucmVnZXgpKFwiLlwiKSkpKSkpLCAoMCwgcGFyc2VyXzEuc3RyKSgnXScpKSk7XG4vLyBhbnlDaGFyIDo6PSAnLidcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuQU5ZQ0hBUiwgKDAsIHBhcnNlcl8xLnN0cikoJy4nKSk7XG4vLyBjaGFyYWN0ZXJDbGFzcyA6Oj0gJ1xcXFwnIFtkc3ddXG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULkNIQVJBQ1RFUkNMQVNTLCAoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEuc3RyKSgnXFxcXCcpLCAoMCwgcGFyc2VyXzEuZmFpbGZhc3QpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbZHN3XVwiKSkpKTtcbi8vIHdoaXRlc3BhY2UgOjo9IFsgXFx0XFxyXFxuXVxuZ3JhbW1hckdyYW1tYXIuc2V0KEdyYW1tYXJOVC5XSElURVNQQUNFLCAoMCwgcGFyc2VyXzEucmVnZXgpKFwiWyBcXHRcXHJcXG5dXCIpKTtcbmdyYW1tYXJHcmFtbWFyLnNldChHcmFtbWFyTlQuT05FTElORUNPTU1FTlQsICgwLCBwYXJzZXJfMS5jYXQpKCgwLCBwYXJzZXJfMS5zdHIpKFwiLy9cIiksICgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiW15cXHJcXG5dXCIpKSwgKDAsIHBhcnNlcl8xLm9yKSgoMCwgcGFyc2VyXzEuc3RyKShcIlxcclxcblwiKSwgKDAsIHBhcnNlcl8xLnN0cikoJ1xcbicpLCAoMCwgcGFyc2VyXzEuc3RyKSgnXFxyJykpKSk7XG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULkJMT0NLQ09NTUVOVCwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0cikoXCIvKlwiKSwgKDAsIHBhcnNlcl8xLmNhdCkoKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbXipdXCIpKSwgKDAsIHBhcnNlcl8xLnN0cikoJyonKSksICgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEuY2F0KSgoMCwgcGFyc2VyXzEucmVnZXgpKFwiW14vXVwiKSwgKDAsIHBhcnNlcl8xLnN0YXIpKCgwLCBwYXJzZXJfMS5yZWdleCkoXCJbXipdXCIpKSwgKDAsIHBhcnNlcl8xLnN0cikoJyonKSkpLCAoMCwgcGFyc2VyXzEuc3RyKSgnLycpKSk7XG5ncmFtbWFyR3JhbW1hci5zZXQoR3JhbW1hck5ULlNLSVAsICgwLCBwYXJzZXJfMS5zdGFyKSgoMCwgcGFyc2VyXzEub3IpKG50dChHcmFtbWFyTlQuV0hJVEVTUEFDRSksIG50dChHcmFtbWFyTlQuT05FTElORUNPTU1FTlQpLCBudHQoR3JhbW1hck5ULkJMT0NLQ09NTUVOVCkpKSk7XG5jb25zdCBncmFtbWFyUGFyc2VyID0gbmV3IHBhcnNlcl8xLkludGVybmFsUGFyc2VyKGdyYW1tYXJHcmFtbWFyLCBudHQoR3JhbW1hck5ULkdSQU1NQVIpLCAobnQpID0+IEdyYW1tYXJOVFtudF0pO1xuLyoqXG4gKiBDb21waWxlIGEgUGFyc2VyIGZyb20gYSBncmFtbWFyIHJlcHJlc2VudGVkIGFzIGEgc3RyaW5nLlxuICogQHBhcmFtIDxOVD4gYSBUeXBlc2NyaXB0IEVudW0gd2l0aCBvbmUgc3ltYm9sIGZvciBlYWNoIG5vbnRlcm1pbmFsIHVzZWQgaW4gdGhlIGdyYW1tYXIsXG4gKiAgICAgICAgbWF0Y2hpbmcgdGhlIG5vbnRlcm1pbmFscyB3aGVuIGNvbXBhcmVkIGNhc2UtaW5zZW5zaXRpdmVseSAoc28gUk9PVCBhbmQgUm9vdCBhbmQgcm9vdCBhcmUgdGhlIHNhbWUpLlxuICogQHBhcmFtIGdyYW1tYXIgdGhlIGdyYW1tYXIgdG8gdXNlXG4gKiBAcGFyYW0gbm9udGVybWluYWxzIHRoZSBydW50aW1lIG9iamVjdCBvZiB0aGUgbm9udGVybWluYWxzIGVudW0uIEZvciBleGFtcGxlLCBpZlxuICogICAgICAgICAgICAgZW51bSBOb250ZXJtaW5hbHMgeyByb290LCBhLCBiLCBjIH07XG4gKiAgICAgICAgdGhlbiBOb250ZXJtaW5hbHMgbXVzdCBiZSBleHBsaWNpdGx5IHBhc3NlZCBhcyB0aGlzIHJ1bnRpbWUgcGFyYW1ldGVyXG4gKiAgICAgICAgICAgICAgY29tcGlsZShncmFtbWFyLCBOb250ZXJtaW5hbHMsIE5vbnRlcm1pbmFscy5yb290KTtcbiAqICAgICAgICAoaW4gYWRkaXRpb24gdG8gYmVpbmcgaW1wbGljaXRseSB1c2VkIGZvciB0aGUgdHlwZSBwYXJhbWV0ZXIgTlQpXG4gKiBAcGFyYW0gcm9vdE5vbnRlcm1pbmFsIHRoZSBkZXNpcmVkIHJvb3Qgbm9udGVybWluYWwgaW4gdGhlIGdyYW1tYXJcbiAqIEByZXR1cm4gYSBwYXJzZXIgZm9yIHRoZSBnaXZlbiBncmFtbWFyIHRoYXQgd2lsbCBzdGFydCBwYXJzaW5nIGF0IHJvb3ROb250ZXJtaW5hbC5cbiAqIEB0aHJvd3MgUGFyc2VFcnJvciBpZiB0aGUgZ3JhbW1hciBoYXMgYSBzeW50YXggZXJyb3JcbiAqL1xuZnVuY3Rpb24gY29tcGlsZShncmFtbWFyLCBub250ZXJtaW5hbHMsIHJvb3ROb250ZXJtaW5hbCkge1xuICAgIGNvbnN0IHsgc3RyaW5nVG9Ob250ZXJtaW5hbCwgbm9udGVybWluYWxUb1N0cmluZyB9ID0gbWFrZU5vbnRlcm1pbmFsQ29udmVydGVycyhub250ZXJtaW5hbHMpO1xuICAgIGNvbnN0IGdyYW1tYXJUcmVlID0gKCgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBncmFtbWFyUGFyc2VyLnBhcnNlKGdyYW1tYXIpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyAoZSBpbnN0YW5jZW9mIHR5cGVzXzEuSW50ZXJuYWxQYXJzZUVycm9yKSA/IG5ldyB0eXBlc18xLkdyYW1tYXJFcnJvcihcImdyYW1tYXIgZG9lc24ndCBjb21waWxlXCIsIGUpIDogZTtcbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgY29uc3QgZGVmaW5pdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgY29uc3Qgbm9udGVybWluYWxzRGVmaW5lZCA9IG5ldyBTZXQoKTsgLy8gb24gbGVmdGhhbmQtc2lkZSBvZiBzb21lIHByb2R1Y3Rpb25cbiAgICBjb25zdCBub250ZXJtaW5hbHNVc2VkID0gbmV3IFNldCgpOyAvLyBvbiByaWdodGhhbmQtc2lkZSBvZiBzb21lIHByb2R1Y3Rpb25cbiAgICAvLyBwcm9kdWN0aW9ucyBvdXRzaWRlIEBza2lwIGJsb2Nrc1xuICAgIG1ha2VQcm9kdWN0aW9ucyhncmFtbWFyVHJlZS5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuUFJPRFVDVElPTiksIG51bGwpO1xuICAgIC8vIHByb2R1Y3Rpb25zIGluc2lkZSBAc2tpcCBibG9ja3NcbiAgICBmb3IgKGNvbnN0IHNraXBCbG9jayBvZiBncmFtbWFyVHJlZS5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuU0tJUEJMT0NLKSkge1xuICAgICAgICBtYWtlU2tpcEJsb2NrKHNraXBCbG9jayk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgbnQgb2Ygbm9udGVybWluYWxzVXNlZCkge1xuICAgICAgICBpZiAoIW5vbnRlcm1pbmFsc0RlZmluZWQuaGFzKG50KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuR3JhbW1hckVycm9yKFwiZ3JhbW1hciBpcyBtaXNzaW5nIGEgZGVmaW5pdGlvbiBmb3IgXCIgKyBub250ZXJtaW5hbFRvU3RyaW5nKG50KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFub250ZXJtaW5hbHNEZWZpbmVkLmhhcyhyb290Tm9udGVybWluYWwpKSB7XG4gICAgICAgIHRocm93IG5ldyB0eXBlc18xLkdyYW1tYXJFcnJvcihcImdyYW1tYXIgaXMgbWlzc2luZyBhIGRlZmluaXRpb24gZm9yIHRoZSByb290IG5vbnRlcm1pbmFsIFwiICsgbm9udGVybWluYWxUb1N0cmluZyhyb290Tm9udGVybWluYWwpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBwYXJzZXJfMS5JbnRlcm5hbFBhcnNlcihkZWZpbml0aW9ucywgKDAsIHBhcnNlcl8xLm50KShyb290Tm9udGVybWluYWwsIG5vbnRlcm1pbmFsVG9TdHJpbmcocm9vdE5vbnRlcm1pbmFsKSksIG5vbnRlcm1pbmFsVG9TdHJpbmcpO1xuICAgIGZ1bmN0aW9uIG1ha2VQcm9kdWN0aW9ucyhwcm9kdWN0aW9ucywgc2tpcCkge1xuICAgICAgICBmb3IgKGNvbnN0IHByb2R1Y3Rpb24gb2YgcHJvZHVjdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vbnRlcm1pbmFsTmFtZSA9IHByb2R1Y3Rpb24uY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULk5PTlRFUk1JTkFMKVswXS50ZXh0O1xuICAgICAgICAgICAgY29uc3Qgbm9udGVybWluYWwgPSBzdHJpbmdUb05vbnRlcm1pbmFsKG5vbnRlcm1pbmFsTmFtZSk7XG4gICAgICAgICAgICBub250ZXJtaW5hbHNEZWZpbmVkLmFkZChub250ZXJtaW5hbCk7XG4gICAgICAgICAgICBsZXQgZXhwcmVzc2lvbiA9IG1ha2VHcmFtbWFyVGVybShwcm9kdWN0aW9uLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5VTklPTilbMF0sIHNraXApO1xuICAgICAgICAgICAgaWYgKHNraXApXG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9ICgwLCBwYXJzZXJfMS5jYXQpKHNraXAsIGV4cHJlc3Npb24sIHNraXApO1xuICAgICAgICAgICAgaWYgKGRlZmluaXRpb25zLmhhcyhub250ZXJtaW5hbCkpIHtcbiAgICAgICAgICAgICAgICAvLyBncmFtbWFyIGFscmVhZHkgaGFzIGEgcHJvZHVjdGlvbiBmb3IgdGhpcyBub250ZXJtaW5hbDsgb3IgZXhwcmVzc2lvbiBvbnRvIGl0XG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbnMuc2V0KG5vbnRlcm1pbmFsLCAoMCwgcGFyc2VyXzEub3IpKGRlZmluaXRpb25zLmdldChub250ZXJtaW5hbCksIGV4cHJlc3Npb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmluaXRpb25zLnNldChub250ZXJtaW5hbCwgZXhwcmVzc2lvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gbWFrZVNraXBCbG9jayhza2lwQmxvY2spIHtcbiAgICAgICAgY29uc3Qgbm9udGVybWluYWxOYW1lID0gc2tpcEJsb2NrLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5OT05URVJNSU5BTClbMF0udGV4dDtcbiAgICAgICAgY29uc3Qgbm9udGVybWluYWwgPSBzdHJpbmdUb05vbnRlcm1pbmFsKG5vbnRlcm1pbmFsTmFtZSk7XG4gICAgICAgIG5vbnRlcm1pbmFsc1VzZWQuYWRkKG5vbnRlcm1pbmFsKTtcbiAgICAgICAgY29uc3Qgc2tpcFRlcm0gPSAoMCwgcGFyc2VyXzEuc2tpcCkoKDAsIHBhcnNlcl8xLm50KShub250ZXJtaW5hbCwgbm9udGVybWluYWxOYW1lKSk7XG4gICAgICAgIG1ha2VQcm9kdWN0aW9ucyhza2lwQmxvY2suY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULlBST0RVQ1RJT04pLCBza2lwVGVybSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1ha2VHcmFtbWFyVGVybSh0cmVlLCBza2lwKSB7XG4gICAgICAgIHN3aXRjaCAodHJlZS5uYW1lKSB7XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5VTklPTjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkZXhwcnMgPSB0cmVlLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5DT05DQVRFTkFUSU9OKS5tYXAoY2hpbGQgPT4gbWFrZUdyYW1tYXJUZXJtKGNoaWxkLCBza2lwKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkZXhwcnMubGVuZ3RoID09IDEgPyBjaGlsZGV4cHJzWzBdIDogKDAsIHBhcnNlcl8xLm9yKSguLi5jaGlsZGV4cHJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgR3JhbW1hck5ULkNPTkNBVEVOQVRJT046IHtcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGRleHBycyA9IHRyZWUuY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULlJFUEVUSVRJT04pLm1hcChjaGlsZCA9PiBtYWtlR3JhbW1hclRlcm0oY2hpbGQsIHNraXApKTtcbiAgICAgICAgICAgICAgICBpZiAoc2tpcCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbnNlcnQgc2tpcCBiZXR3ZWVuIGVhY2ggcGFpciBvZiBjaGlsZHJlblxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGRyZW5XaXRoU2tpcHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZGV4cHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGRyZW5XaXRoU2tpcHMubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbldpdGhTa2lwcy5wdXNoKHNraXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW5XaXRoU2tpcHMucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2hpbGRleHBycyA9IGNoaWxkcmVuV2l0aFNraXBzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gKGNoaWxkZXhwcnMubGVuZ3RoID09IDEpID8gY2hpbGRleHByc1swXSA6ICgwLCBwYXJzZXJfMS5jYXQpKC4uLmNoaWxkZXhwcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuUkVQRVRJVElPTjoge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuaXQgPSBtYWtlR3JhbW1hclRlcm0odHJlZS5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuVU5JVClbMF0sIHNraXApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wID0gdHJlZS5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuUkVQRUFUT1BFUkFUT1IpWzBdO1xuICAgICAgICAgICAgICAgIGlmICghb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuaXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1bml0V2l0aFNraXAgPSBza2lwID8gKDAsIHBhcnNlcl8xLmNhdCkodW5pdCwgc2tpcCkgOiB1bml0O1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdvcCBpcycsIG9wKTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChvcC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICcqJzogcmV0dXJuICgwLCBwYXJzZXJfMS5zdGFyKSh1bml0V2l0aFNraXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnKyc6IHJldHVybiAoMCwgcGFyc2VyXzEucGx1cykodW5pdFdpdGhTa2lwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJz8nOiByZXR1cm4gKDAsIHBhcnNlcl8xLm9wdGlvbikodW5pdFdpdGhTa2lwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcCBpcyB7bixtfSBvciBvbmUgb2YgaXRzIHZhcmlhbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBvcC5jaGlsZHJlblswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHJhbmdlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuTlVNQkVSOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuID0gcGFyc2VJbnQocmFuZ2UudGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIHBhcnNlcl8xLnJlcGVhdCkodW5pdFdpdGhTa2lwLCBuZXcgcGFyc2VyXzEuQmV0d2VlbihuLCBuKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5SQU5HRToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IHBhcnNlSW50KHJhbmdlLmNoaWxkcmVuWzBdLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbSA9IHBhcnNlSW50KHJhbmdlLmNoaWxkcmVuWzFdLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBwYXJzZXJfMS5yZXBlYXQpKHVuaXRXaXRoU2tpcCwgbmV3IHBhcnNlcl8xLkJldHdlZW4obiwgbSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuVVBQRVJCT1VORDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbSA9IHBhcnNlSW50KHJhbmdlLmNoaWxkcmVuWzBdLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBwYXJzZXJfMS5yZXBlYXQpKHVuaXRXaXRoU2tpcCwgbmV3IHBhcnNlcl8xLkJldHdlZW4oMCwgbSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuTE9XRVJCT1VORDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IHBhcnNlSW50KHJhbmdlLmNoaWxkcmVuWzBdLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBwYXJzZXJfMS5yZXBlYXQpKHVuaXRXaXRoU2tpcCwgbmV3IHBhcnNlcl8xLkF0TGVhc3QobikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW50ZXJuYWwgZXJyb3I6IHVua25vd24gcmFuZ2U6ICcgKyByYW5nZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5VTklUOlxuICAgICAgICAgICAgICAgIHJldHVybiBtYWtlR3JhbW1hclRlcm0odHJlZS5jaGlsZHJlbkJ5TmFtZShHcmFtbWFyTlQuTk9OVEVSTUlOQUwpWzBdXG4gICAgICAgICAgICAgICAgICAgIHx8IHRyZWUuY2hpbGRyZW5CeU5hbWUoR3JhbW1hck5ULlRFUk1JTkFMKVswXVxuICAgICAgICAgICAgICAgICAgICB8fCB0cmVlLmNoaWxkcmVuQnlOYW1lKEdyYW1tYXJOVC5VTklPTilbMF0sIHNraXApO1xuICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuTk9OVEVSTUlOQUw6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBub250ZXJtaW5hbCA9IHN0cmluZ1RvTm9udGVybWluYWwodHJlZS50ZXh0KTtcbiAgICAgICAgICAgICAgICBub250ZXJtaW5hbHNVc2VkLmFkZChub250ZXJtaW5hbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgwLCBwYXJzZXJfMS5udCkobm9udGVybWluYWwsIHRyZWUudGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5URVJNSU5BTDpcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRyZWUuY2hpbGRyZW5bMF0ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5RVU9URURTVFJJTkc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDAsIHBhcnNlcl8xLnN0cikoc3RyaXBRdW90ZXNBbmRSZXBsYWNlRXNjYXBlU2VxdWVuY2VzKHRyZWUudGV4dCkpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5DSEFSQUNURVJTRVQ6IC8vIGUuZy4gW2FiY11cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBHcmFtbWFyTlQuQU5ZQ0hBUjogLy8gZS5nLiAgLlxuICAgICAgICAgICAgICAgICAgICBjYXNlIEdyYW1tYXJOVC5DSEFSQUNURVJDTEFTUzogLy8gZS5nLiAgXFxkICBcXHMgIFxcd1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgwLCBwYXJzZXJfMS5yZWdleCkodHJlZS50ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW50ZXJuYWwgZXJyb3I6IHVua25vd24gbGl0ZXJhbDogJyArIHRyZWUuY2hpbGRyZW5bMF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnRlcm5hbCBlcnJvcjogdW5rbm93biBncmFtbWFyIHJ1bGU6ICcgKyB0cmVlLm5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0cmlwIHN0YXJ0aW5nIGFuZCBlbmRpbmcgcXVvdGVzLlxuICAgICAqIFJlcGxhY2UgXFx0LCBcXHIsIFxcbiB3aXRoIHRoZWlyIGNoYXJhY3RlciBjb2Rlcy5cbiAgICAgKiBSZXBsYWNlcyBhbGwgb3RoZXIgXFx4IHdpdGggbGl0ZXJhbCB4LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0cmlwUXVvdGVzQW5kUmVwbGFjZUVzY2FwZVNlcXVlbmNlcyhzKSB7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShzWzBdID09ICdcIicgfHwgc1swXSA9PSBcIidcIik7XG4gICAgICAgIHMgPSBzLnN1YnN0cmluZygxLCBzLmxlbmd0aCAtIDEpO1xuICAgICAgICBzID0gcy5yZXBsYWNlKC9cXFxcKC4pL2csIChtYXRjaCwgZXNjYXBlZENoYXIpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZXNjYXBlZENoYXIpIHtcbiAgICAgICAgICAgICAgICBjYXNlICd0JzogcmV0dXJuICdcXHQnO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3InOiByZXR1cm4gJ1xccic7XG4gICAgICAgICAgICAgICAgY2FzZSAnbic6IHJldHVybiAnXFxuJztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gZXNjYXBlZENoYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcztcbiAgICB9XG59XG5leHBvcnRzLmNvbXBpbGUgPSBjb21waWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcGlsZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmluZGVudCA9IGV4cG9ydHMuc25pcHBldCA9IGV4cG9ydHMuZXNjYXBlRm9yUmVhZGluZyA9IGV4cG9ydHMudG9Db2x1bW4gPSBleHBvcnRzLnRvTGluZSA9IGV4cG9ydHMuZGVzY3JpYmVMb2NhdGlvbiA9IGV4cG9ydHMubWFrZUVycm9yTWVzc2FnZSA9IHZvaWQgMDtcbi8qKlxuICogTWFrZSBhIGh1bWFuLXJlYWRhYmxlIGVycm9yIG1lc3NhZ2UgZXhwbGFpbmluZyBhIHBhcnNlIGVycm9yIGFuZCB3aGVyZSBpdCB3YXMgZm91bmQgaW4gdGhlIGlucHV0LlxuICogQHBhcmFtIG1lc3NhZ2UgYnJpZWYgbWVzc2FnZSBzdGF0aW5nIHdoYXQgZXJyb3Igb2NjdXJyZWRcbiAqIEBwYXJhbSBub250ZXJtaW5hbE5hbWUgbmFtZSBvZiBkZWVwZXN0IG5vbnRlcm1pbmFsIHRoYXQgcGFyc2VyIHdhcyB0cnlpbmcgdG8gbWF0Y2ggd2hlbiBwYXJzZSBmYWlsZWRcbiAqIEBwYXJhbSBleHBlY3RlZFRleHQgaHVtYW4tcmVhZGFibGUgZGVzY3JpcHRpb24gb2Ygd2hhdCBzdHJpbmcgbGl0ZXJhbHMgdGhlIHBhcnNlciB3YXMgZXhwZWN0aW5nIHRoZXJlO1xuICogICAgICAgICAgICBlLmcuIFwiO1wiLCBcIlsgXFxyXFxuXFx0XVwiLCBcIjF8MnwzXCJcbiAqIEBwYXJhbSBzdHJpbmdCZWluZ1BhcnNlZCBvcmlnaW5hbCBpbnB1dCB0byBwYXJzZSgpXG4gKiBAcGFyYW0gcG9zIG9mZnNldCBpbiBzdHJpbmdCZWluZ1BhcnNlZCB3aGVyZSBlcnJvciBvY2N1cnJlZFxuICogQHBhcmFtIG5hbWVPZlN0cmluZ0JlaW5nUGFyc2VkIGh1bWFuLXJlYWRhYmxlIGRlc2NyaXB0aW9uIG9mIHdoZXJlIHN0cmluZ0JlaW5nUGFyc2VkIGNhbWUgZnJvbTtcbiAqICAgICAgICAgICAgIGUuZy4gXCJncmFtbWFyXCIgaWYgc3RyaW5nQmVpbmdQYXJzZWQgd2FzIHRoZSBpbnB1dCB0byBQYXJzZXIuY29tcGlsZSgpLFxuICogICAgICAgICAgICAgb3IgXCJzdHJpbmcgYmVpbmcgcGFyc2VkXCIgaWYgc3RyaW5nQmVpbmdQYXJzZWQgd2FzIHRoZSBpbnB1dCB0byBQYXJzZXIucGFyc2UoKVxuICogQHJldHVybiBhIG11bHRpbGluZSBodW1hbi1yZWFkYWJsZSBtZXNzYWdlIHRoYXQgc3RhdGVzIHRoZSBlcnJvciwgaXRzIGxvY2F0aW9uIGluIHRoZSBpbnB1dCxcbiAqICAgICAgICAgd2hhdCB0ZXh0IHdhcyBleHBlY3RlZCBhbmQgd2hhdCB0ZXh0IHdhcyBhY3R1YWxseSBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gbWFrZUVycm9yTWVzc2FnZShtZXNzYWdlLCBub250ZXJtaW5hbE5hbWUsIGV4cGVjdGVkVGV4dCwgc3RyaW5nQmVpbmdQYXJzZWQsIHBvcywgbmFtZU9mU3RyaW5nQmVpbmdQYXJzZWQpIHtcbiAgICBsZXQgcmVzdWx0ID0gbWVzc2FnZTtcbiAgICBpZiAocmVzdWx0Lmxlbmd0aCA+IDApXG4gICAgICAgIHJlc3VsdCArPSBcIlxcblwiO1xuICAgIHJlc3VsdCArPVxuICAgICAgICBcIkVycm9yIGF0IFwiICsgZGVzY3JpYmVMb2NhdGlvbihzdHJpbmdCZWluZ1BhcnNlZCwgcG9zKSArIFwiIG9mIFwiICsgbmFtZU9mU3RyaW5nQmVpbmdQYXJzZWQgKyBcIlxcblwiXG4gICAgICAgICAgICArIFwiICB0cnlpbmcgdG8gbWF0Y2ggXCIgKyBub250ZXJtaW5hbE5hbWUudG9VcHBlckNhc2UoKSArIFwiXFxuXCJcbiAgICAgICAgICAgICsgXCIgIGV4cGVjdGVkIFwiICsgZXNjYXBlRm9yUmVhZGluZyhleHBlY3RlZFRleHQsIFwiXCIpXG4gICAgICAgICAgICArICgoc3RyaW5nQmVpbmdQYXJzZWQubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICA/IFwiXFxuICAgYnV0IHNhdyBcIiArIHNuaXBwZXQoc3RyaW5nQmVpbmdQYXJzZWQsIHBvcylcbiAgICAgICAgICAgICAgICA6IFwiXCIpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnRzLm1ha2VFcnJvck1lc3NhZ2UgPSBtYWtlRXJyb3JNZXNzYWdlO1xuLyoqXG4gKiBAcGFyYW0gc3RyaW5nIHRvIGRlc2NyaWJlXG4gKiBAcGFyYW0gcG9zIG9mZnNldCBpbiBzdHJpbmcsIDA8PXBvczxzdHJpbmcubGVuZ3RoKClcbiAqIEByZXR1cm4gYSBodW1hbi1yZWFkYWJsZSBkZXNjcmlwdGlvbiBvZiB0aGUgbG9jYXRpb24gb2YgdGhlIGNoYXJhY3RlciBhdCBvZmZzZXQgcG9zIGluIHN0cmluZ1xuICogKHVzaW5nIG9mZnNldCBhbmQvb3IgbGluZS9jb2x1bW4gaWYgYXBwcm9wcmlhdGUpXG4gKi9cbmZ1bmN0aW9uIGRlc2NyaWJlTG9jYXRpb24ocywgcG9zKSB7XG4gICAgbGV0IHJlc3VsdCA9IFwib2Zmc2V0IFwiICsgcG9zO1xuICAgIGlmIChzLmluZGV4T2YoJ1xcbicpICE9IC0xKSB7XG4gICAgICAgIHJlc3VsdCArPSBcIiAobGluZSBcIiArIHRvTGluZShzLCBwb3MpICsgXCIgY29sdW1uIFwiICsgdG9Db2x1bW4ocywgcG9zKSArIFwiKVwiO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0cy5kZXNjcmliZUxvY2F0aW9uID0gZGVzY3JpYmVMb2NhdGlvbjtcbi8qKlxuICogVHJhbnNsYXRlcyBhIHN0cmluZyBvZmZzZXQgaW50byBhIGxpbmUgbnVtYmVyLlxuICogQHBhcmFtIHN0cmluZyBpbiB3aGljaCBvZmZzZXQgb2NjdXJzXG4gKiBAcGFyYW0gcG9zIG9mZnNldCBpbiBzdHJpbmcsIDA8PXBvczxzdHJpbmcubGVuZ3RoKClcbiAqIEByZXR1cm4gdGhlIDEtYmFzZWQgbGluZSBudW1iZXIgb2YgdGhlIGNoYXJhY3RlciBhdCBvZmZzZXQgcG9zIGluIHN0cmluZyxcbiAqIGFzIGlmIHN0cmluZyB3ZXJlIGJlaW5nIHZpZXdlZCBpbiBhIHRleHQgZWRpdG9yXG4gKi9cbmZ1bmN0aW9uIHRvTGluZShzLCBwb3MpIHtcbiAgICBsZXQgbGluZUNvdW50ID0gMTtcbiAgICBmb3IgKGxldCBuZXdsaW5lID0gcy5pbmRleE9mKCdcXG4nKTsgbmV3bGluZSAhPSAtMSAmJiBuZXdsaW5lIDwgcG9zOyBuZXdsaW5lID0gcy5pbmRleE9mKCdcXG4nLCBuZXdsaW5lICsgMSkpIHtcbiAgICAgICAgKytsaW5lQ291bnQ7XG4gICAgfVxuICAgIHJldHVybiBsaW5lQ291bnQ7XG59XG5leHBvcnRzLnRvTGluZSA9IHRvTGluZTtcbi8qKlxuICogVHJhbnNsYXRlcyBhIHN0cmluZyBvZmZzZXQgaW50byBhIGNvbHVtbiBudW1iZXIuXG4gKiBAcGFyYW0gc3RyaW5nIGluIHdoaWNoIG9mZnNldCBvY2N1cnNcbiAqIEBwYXJhbSBwb3Mgb2Zmc2V0IGluIHN0cmluZywgMDw9cG9zPHN0cmluZy5sZW5ndGgoKVxuICogQHJldHVybiB0aGUgMS1iYXNlZCBjb2x1bW4gbnVtYmVyIG9mIHRoZSBjaGFyYWN0ZXIgYXQgb2Zmc2V0IHBvcyBpbiBzdHJpbmcsXG4gKiBhcyBpZiBzdHJpbmcgd2VyZSBiZWluZyB2aWV3ZWQgaW4gYSB0ZXh0IGVkaXRvciB3aXRoIHRhYiBzaXplIDEgKGkuZS4gYSB0YWIgaXMgdHJlYXRlZCBsaWtlIGEgc3BhY2UpXG4gKi9cbmZ1bmN0aW9uIHRvQ29sdW1uKHMsIHBvcykge1xuICAgIGNvbnN0IGxhc3ROZXdsaW5lQmVmb3JlUG9zID0gcy5sYXN0SW5kZXhPZignXFxuJywgcG9zIC0gMSk7XG4gICAgY29uc3QgdG90YWxTaXplT2ZQcmVjZWRpbmdMaW5lcyA9IChsYXN0TmV3bGluZUJlZm9yZVBvcyAhPSAtMSkgPyBsYXN0TmV3bGluZUJlZm9yZVBvcyArIDEgOiAwO1xuICAgIHJldHVybiBwb3MgLSB0b3RhbFNpemVPZlByZWNlZGluZ0xpbmVzICsgMTtcbn1cbmV4cG9ydHMudG9Db2x1bW4gPSB0b0NvbHVtbjtcbi8qKlxuKiBSZXBsYWNlIGNvbW1vbiB1bnByaW50YWJsZSBjaGFyYWN0ZXJzIGJ5IHRoZWlyIGVzY2FwZSBjb2RlcywgZm9yIGh1bWFuIHJlYWRpbmcuXG4qIFNob3VsZCBiZSBpZGVtcG90ZW50LCBpLmUuIGlmIHggPSBlc2NhcGVGb3JSZWFkaW5nKHkpLCB0aGVuIHguZXF1YWxzKGVzY2FwZUZvclJlYWRpbmcoeCkpLlxuKiBAcGFyYW0gc3RyaW5nIHRvIGVzY2FwZVxuKiBAcGFyYW0gcXVvdGUgcXVvdGVzIHRvIHB1dCBhcm91bmQgc3RyaW5nLCBvciBcIlwiIGlmIG5vIHF1b3RlcyByZXF1aXJlZFxuKiBAcmV0dXJuIHN0cmluZyB3aXRoIGVzY2FwZSBjb2RlcyByZXBsYWNlZCwgcHJlY2VkZWQgYW5kIGZvbGxvd2VkIGJ5IHF1b3RlLCB3aXRoIGEgaHVtYW4tcmVhZGFibGUgbGVnZW5kIGFwcGVuZGVkIHRvIHRoZSBlbmRcbiogICAgICAgICBleHBsYWluaW5nIHdoYXQgdGhlIHJlcGxhY2VtZW50IGNoYXJhY3RlcnMgbWVhbi5cbiovXG5mdW5jdGlvbiBlc2NhcGVGb3JSZWFkaW5nKHMsIHF1b3RlKSB7XG4gICAgbGV0IHJlc3VsdCA9IHM7XG4gICAgY29uc3QgbGVnZW5kID0gW107XG4gICAgZm9yIChjb25zdCB7IHVucHJpbnRhYmxlQ2hhciwgaHVtYW5SZWFkYWJsZVZlcnNpb24sIGRlc2NyaXB0aW9uIH0gb2YgRVNDQVBFUykge1xuICAgICAgICBpZiAocmVzdWx0LmluY2x1ZGVzKHVucHJpbnRhYmxlQ2hhcikpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKHVucHJpbnRhYmxlQ2hhciwgaHVtYW5SZWFkYWJsZVZlcnNpb24pO1xuICAgICAgICAgICAgbGVnZW5kLnB1c2goaHVtYW5SZWFkYWJsZVZlcnNpb24gKyBcIiBtZWFucyBcIiArIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQgPSBxdW90ZSArIHJlc3VsdCArIHF1b3RlO1xuICAgIGlmIChsZWdlbmQubGVuZ3RoID4gMCkge1xuICAgICAgICByZXN1bHQgKz0gXCIgKHdoZXJlIFwiICsgbGVnZW5kLmpvaW4oXCIsIFwiKSArIFwiKVwiO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0cy5lc2NhcGVGb3JSZWFkaW5nID0gZXNjYXBlRm9yUmVhZGluZztcbmNvbnN0IEVTQ0FQRVMgPSBbXG4gICAge1xuICAgICAgICB1bnByaW50YWJsZUNoYXI6IFwiXFxuXCIsXG4gICAgICAgIGh1bWFuUmVhZGFibGVWZXJzaW9uOiBcIlxcdTI0MjRcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwibmV3bGluZVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIHVucHJpbnRhYmxlQ2hhcjogXCJcXHJcIixcbiAgICAgICAgaHVtYW5SZWFkYWJsZVZlcnNpb246IFwiXFx1MjQwRFwiLFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJjYXJyaWFnZSByZXR1cm5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICB1bnByaW50YWJsZUNoYXI6IFwiXFx0XCIsXG4gICAgICAgIGh1bWFuUmVhZGFibGVWZXJzaW9uOiBcIlxcdTIxRTVcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwidGFiXCJcbiAgICB9LFxuXTtcbi8qKlxuICogQHBhcmFtIHN0cmluZyB0byBzaG9ydGVuXG4gKiBAcGFyYW0gcG9zIG9mZnNldCBpbiBzdHJpbmcsIDA8PXBvczxzdHJpbmcubGVuZ3RoKClcbiAqIEByZXR1cm4gYSBzaG9ydCBzbmlwcGV0IG9mIHRoZSBwYXJ0IG9mIHN0cmluZyBzdGFydGluZyBhdCBvZmZzZXQgcG9zLFxuICogaW4gaHVtYW4tcmVhZGFibGUgZm9ybVxuICovXG5mdW5jdGlvbiBzbmlwcGV0KHMsIHBvcykge1xuICAgIGNvbnN0IG1heENoYXJzVG9TaG93ID0gMTA7XG4gICAgY29uc3QgZW5kID0gTWF0aC5taW4ocG9zICsgbWF4Q2hhcnNUb1Nob3csIHMubGVuZ3RoKTtcbiAgICBsZXQgcmVzdWx0ID0gcy5zdWJzdHJpbmcocG9zLCBlbmQpICsgKGVuZCA8IHMubGVuZ3RoID8gXCIuLi5cIiA6IFwiXCIpO1xuICAgIGlmIChyZXN1bHQubGVuZ3RoID09IDApXG4gICAgICAgIHJlc3VsdCA9IFwiZW5kIG9mIHN0cmluZ1wiO1xuICAgIHJldHVybiBlc2NhcGVGb3JSZWFkaW5nKHJlc3VsdCwgXCJcIik7XG59XG5leHBvcnRzLnNuaXBwZXQgPSBzbmlwcGV0O1xuLyoqXG4gKiBJbmRlbnQgYSBtdWx0aS1saW5lIHN0cmluZyBieSBwcmVjZWRpbmcgZWFjaCBsaW5lIHdpdGggcHJlZml4LlxuICogQHBhcmFtIHN0cmluZyBzdHJpbmcgdG8gaW5kZW50XG4gKiBAcGFyYW0gcHJlZml4IHByZWZpeCB0byB1c2UgZm9yIGluZGVudGluZ1xuICogQHJldHVybiBzdHJpbmcgd2l0aCBwcmVmaXggaW5zZXJ0ZWQgYXQgdGhlIHN0YXJ0IG9mIGVhY2ggbGluZVxuICovXG5mdW5jdGlvbiBpbmRlbnQocywgcHJlZml4KSB7XG4gICAgbGV0IHJlc3VsdCA9IFwiXCI7XG4gICAgbGV0IGNoYXJzQ29waWVkID0gMDtcbiAgICBkbyB7XG4gICAgICAgIGNvbnN0IG5ld2xpbmUgPSBzLmluZGV4T2YoJ1xcbicsIGNoYXJzQ29waWVkKTtcbiAgICAgICAgY29uc3QgZW5kT2ZMaW5lID0gbmV3bGluZSAhPSAtMSA/IG5ld2xpbmUgKyAxIDogcy5sZW5ndGg7XG4gICAgICAgIHJlc3VsdCArPSBwcmVmaXggKyBzLnN1YnN0cmluZyhjaGFyc0NvcGllZCwgZW5kT2ZMaW5lKTtcbiAgICAgICAgY2hhcnNDb3BpZWQgPSBlbmRPZkxpbmU7XG4gICAgfSB3aGlsZSAoY2hhcnNDb3BpZWQgPCBzLmxlbmd0aCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmV4cG9ydHMuaW5kZW50ID0gaW5kZW50O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlzcGxheS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUGFyc2VyU3RhdGUgPSBleHBvcnRzLkZhaWxlZFBhcnNlID0gZXhwb3J0cy5TdWNjZXNzZnVsUGFyc2UgPSBleHBvcnRzLkludGVybmFsUGFyc2VyID0gZXhwb3J0cy5mYWlsZmFzdCA9IGV4cG9ydHMuc2tpcCA9IGV4cG9ydHMub3B0aW9uID0gZXhwb3J0cy5wbHVzID0gZXhwb3J0cy5zdGFyID0gZXhwb3J0cy5yZXBlYXQgPSBleHBvcnRzLlpFUk9fT1JfT05FID0gZXhwb3J0cy5PTkVfT1JfTU9SRSA9IGV4cG9ydHMuWkVST19PUl9NT1JFID0gZXhwb3J0cy5CZXR3ZWVuID0gZXhwb3J0cy5BdExlYXN0ID0gZXhwb3J0cy5vciA9IGV4cG9ydHMuY2F0ID0gZXhwb3J0cy5zdHIgPSBleHBvcnRzLnJlZ2V4ID0gZXhwb3J0cy5udCA9IHZvaWQgMDtcbmNvbnN0IGFzc2VydF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJhc3NlcnRcIikpO1xuY29uc3QgdHlwZXNfMSA9IHJlcXVpcmUoXCIuL3R5cGVzXCIpO1xuY29uc3QgcGFyc2V0cmVlXzEgPSByZXF1aXJlKFwiLi9wYXJzZXRyZWVcIik7XG5mdW5jdGlvbiBudChub250ZXJtaW5hbCwgbm9udGVybWluYWxOYW1lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGd0ID0gZGVmaW5pdGlvbnMuZ2V0KG5vbnRlcm1pbmFsKTtcbiAgICAgICAgICAgIGlmIChndCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyB0eXBlc18xLkdyYW1tYXJFcnJvcihcIm5vbnRlcm1pbmFsIGhhcyBubyBkZWZpbml0aW9uOiBcIiArIG5vbnRlcm1pbmFsTmFtZSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKFwiZW50ZXJpbmdcIiwgbm9udGVybWluYWxOYW1lKTtcbiAgICAgICAgICAgIHN0YXRlLmVudGVyKHBvcywgbm9udGVybWluYWwpO1xuICAgICAgICAgICAgbGV0IHByID0gZ3QucGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpO1xuICAgICAgICAgICAgc3RhdGUubGVhdmUobm9udGVybWluYWwpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcihcImxlYXZpbmdcIiwgbm9udGVybWluYWxOYW1lLCBcIndpdGggcmVzdWx0XCIsIHByKTtcbiAgICAgICAgICAgIGlmICghcHIuZmFpbGVkICYmICFzdGF0ZS5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmVlID0gcHIudHJlZTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdUcmVlID0gc3RhdGUubWFrZVBhcnNlVHJlZSh0cmVlLnN0YXJ0LCB0cmVlLnRleHQsIFt0cmVlXSk7XG4gICAgICAgICAgICAgICAgcHIgPSBwci5yZXBsYWNlVHJlZShuZXdUcmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcjtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9udGVybWluYWxOYW1lO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMubnQgPSBudDtcbmZ1bmN0aW9uIHJlZ2V4KHJlZ2V4U291cmNlKSB7XG4gICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnXicgKyByZWdleFNvdXJjZSArICckJywgJ3MnKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSkge1xuICAgICAgICAgICAgaWYgKHBvcyA+PSBzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZS5tYWtlRmFpbGVkUGFyc2UocG9zLCByZWdleFNvdXJjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsID0gcy5zdWJzdHJpbmcocG9zLCBwb3MgKyAxKTtcbiAgICAgICAgICAgIGlmIChyZWdleC50ZXN0KGwpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlLm1ha2VTdWNjZXNzZnVsUGFyc2UocG9zLCBwb3MgKyAxLCBsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5tYWtlRmFpbGVkUGFyc2UocG9zLCByZWdleFNvdXJjZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlZ2V4U291cmNlO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMucmVnZXggPSByZWdleDtcbmZ1bmN0aW9uIHN0cihzdHIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgbmV3cG9zID0gcG9zICsgc3RyLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChuZXdwb3MgPiBzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZS5tYWtlRmFpbGVkUGFyc2UocG9zLCBzdHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbCA9IHMuc3Vic3RyaW5nKHBvcywgbmV3cG9zKTtcbiAgICAgICAgICAgIGlmIChsID09PSBzdHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUubWFrZVN1Y2Nlc3NmdWxQYXJzZShwb3MsIG5ld3BvcywgbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUubWFrZUZhaWxlZFBhcnNlKHBvcywgc3RyKTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gXCInXCIgKyBzdHIucmVwbGFjZSgvJ1xcclxcblxcdFxcXFwvLCBcIlxcXFwkJlwiKSArIFwiJ1wiO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMuc3RyID0gc3RyO1xuZnVuY3Rpb24gY2F0KC4uLnRlcm1zKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpIHtcbiAgICAgICAgICAgIGxldCBwcm91dCA9IHN0YXRlLm1ha2VTdWNjZXNzZnVsUGFyc2UocG9zLCBwb3MpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBndCBvZiB0ZXJtcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByID0gZ3QucGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpO1xuICAgICAgICAgICAgICAgIGlmIChwci5mYWlsZWQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcjtcbiAgICAgICAgICAgICAgICBwb3MgPSBwci5wb3M7XG4gICAgICAgICAgICAgICAgcHJvdXQgPSBwcm91dC5tZXJnZVJlc3VsdChwcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvdXQ7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiKFwiICsgdGVybXMubWFwKHRlcm0gPT4gdGVybS50b1N0cmluZygpKS5qb2luKFwiIFwiKSArIFwiKVwiO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMuY2F0ID0gY2F0O1xuLyoqXG4gKiBAcGFyYW0gY2hvaWNlcyBtdXN0IGJlIG5vbmVtcHR5XG4gKi9cbmZ1bmN0aW9uIG9yKC4uLmNob2ljZXMpIHtcbiAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoY2hvaWNlcy5sZW5ndGggPiAwKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSkge1xuICAgICAgICAgICAgY29uc3Qgc3VjY2Vzc2VzID0gW107XG4gICAgICAgICAgICBjb25zdCBmYWlsdXJlcyA9IFtdO1xuICAgICAgICAgICAgY2hvaWNlcy5mb3JFYWNoKChjaG9pY2UpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjaG9pY2UucGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZmFpbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmVzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3Nlcy5wdXNoKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoc3VjY2Vzc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb25nZXN0U3VjY2Vzc2VzID0gbG9uZ2VzdFJlc3VsdHMoc3VjY2Vzc2VzKTtcbiAgICAgICAgICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkobG9uZ2VzdFN1Y2Nlc3Nlcy5sZW5ndGggPiAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9uZ2VzdFN1Y2Nlc3Nlc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvbmdlc3RGYWlsdXJlcyA9IGxvbmdlc3RSZXN1bHRzKGZhaWx1cmVzKTtcbiAgICAgICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShsb25nZXN0RmFpbHVyZXMubGVuZ3RoID4gMCk7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUubWFrZUZhaWxlZFBhcnNlKGxvbmdlc3RGYWlsdXJlc1swXS5wb3MsIGxvbmdlc3RGYWlsdXJlcy5tYXAoKHJlc3VsdCkgPT4gcmVzdWx0LmV4cGVjdGVkVGV4dCkuam9pbihcInxcIikpO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBcIihcIiArIGNob2ljZXMubWFwKGNob2ljZSA9PiBjaG9pY2UudG9TdHJpbmcoKSkuam9pbihcInxcIikgKyBcIilcIjtcbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLm9yID0gb3I7XG5jbGFzcyBBdExlYXN0IHtcbiAgICBjb25zdHJ1Y3RvcihtaW4pIHtcbiAgICAgICAgdGhpcy5taW4gPSBtaW47XG4gICAgfVxuICAgIHRvb0xvdyhuKSB7IHJldHVybiBuIDwgdGhpcy5taW47IH1cbiAgICB0b29IaWdoKG4pIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5taW4pIHtcbiAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIFwiKlwiO1xuICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gXCIrXCI7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gXCJ7XCIgKyB0aGlzLm1pbiArIFwiLH1cIjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuQXRMZWFzdCA9IEF0TGVhc3Q7XG5jbGFzcyBCZXR3ZWVuIHtcbiAgICBjb25zdHJ1Y3RvcihtaW4sIG1heCkge1xuICAgICAgICB0aGlzLm1pbiA9IG1pbjtcbiAgICAgICAgdGhpcy5tYXggPSBtYXg7XG4gICAgfVxuICAgIHRvb0xvdyhuKSB7IHJldHVybiBuIDwgdGhpcy5taW47IH1cbiAgICB0b29IaWdoKG4pIHsgcmV0dXJuIG4gPiB0aGlzLm1heDsgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBpZiAodGhpcy5taW4gPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuICh0aGlzLm1heCA9PSAxKSA/IFwiP1wiIDogXCJ7LFwiICsgdGhpcy5tYXggKyBcIn1cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIntcIiArIHRoaXMubWluICsgXCIsXCIgKyB0aGlzLm1heCArIFwifVwiO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5CZXR3ZWVuID0gQmV0d2VlbjtcbmV4cG9ydHMuWkVST19PUl9NT1JFID0gbmV3IEF0TGVhc3QoMCk7XG5leHBvcnRzLk9ORV9PUl9NT1JFID0gbmV3IEF0TGVhc3QoMSk7XG5leHBvcnRzLlpFUk9fT1JfT05FID0gbmV3IEJldHdlZW4oMCwgMSk7XG5mdW5jdGlvbiByZXBlYXQoZ3QsIGhvd21hbnkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSkge1xuICAgICAgICAgICAgbGV0IHByb3V0ID0gc3RhdGUubWFrZVN1Y2Nlc3NmdWxQYXJzZShwb3MsIHBvcyk7XG4gICAgICAgICAgICBmb3IgKGxldCB0aW1lc01hdGNoZWQgPSAwOyBob3dtYW55LnRvb0xvdyh0aW1lc01hdGNoZWQpIHx8ICFob3dtYW55LnRvb0hpZ2godGltZXNNYXRjaGVkICsgMSk7ICsrdGltZXNNYXRjaGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHIgPSBndC5wYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHByLmZhaWxlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBubyBtYXRjaFxuICAgICAgICAgICAgICAgICAgICBpZiAoaG93bWFueS50b29Mb3codGltZXNNYXRjaGVkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm91dC5hZGRMYXN0RmFpbHVyZShwcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHIucG9zID09IHBvcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWF0Y2hlZCB0aGUgZW1wdHkgc3RyaW5nLCBhbmQgd2UgYWxyZWFkeSBoYXZlIGVub3VnaC5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIG1heSBnZXQgaW50byBhbiBpbmZpbml0ZSBsb29wIGlmIGhvd21hbnkudG9vSGlnaCgpIG5ldmVyIHJldHVybnMgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyByZXR1cm4gc3VjY2Vzc2Z1bCBtYXRjaCBhdCB0aGlzIHBvaW50XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvdXQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGFkdmFuY2UgdGhlIHBvc2l0aW9uIGFuZCBtZXJnZSBwciBpbnRvIHByb3V0XG4gICAgICAgICAgICAgICAgICAgIHBvcyA9IHByLnBvcztcbiAgICAgICAgICAgICAgICAgICAgcHJvdXQgPSBwcm91dC5tZXJnZVJlc3VsdChwcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb3V0O1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBndC50b1N0cmluZygpICsgaG93bWFueS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMucmVwZWF0ID0gcmVwZWF0O1xuZnVuY3Rpb24gc3RhcihndCkge1xuICAgIHJldHVybiByZXBlYXQoZ3QsIGV4cG9ydHMuWkVST19PUl9NT1JFKTtcbn1cbmV4cG9ydHMuc3RhciA9IHN0YXI7XG5mdW5jdGlvbiBwbHVzKGd0KSB7XG4gICAgcmV0dXJuIHJlcGVhdChndCwgZXhwb3J0cy5PTkVfT1JfTU9SRSk7XG59XG5leHBvcnRzLnBsdXMgPSBwbHVzO1xuZnVuY3Rpb24gb3B0aW9uKGd0KSB7XG4gICAgcmV0dXJuIHJlcGVhdChndCwgZXhwb3J0cy5aRVJPX09SX09ORSk7XG59XG5leHBvcnRzLm9wdGlvbiA9IG9wdGlvbjtcbmZ1bmN0aW9uIHNraXAobm9udGVybWluYWwpIHtcbiAgICBjb25zdCByZXBldGl0aW9uID0gc3Rhcihub250ZXJtaW5hbCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpIHtcbiAgICAgICAgICAgIHN0YXRlLmVudGVyU2tpcCgpO1xuICAgICAgICAgICAgbGV0IHByID0gcmVwZXRpdGlvbi5wYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSk7XG4gICAgICAgICAgICBzdGF0ZS5sZWF2ZVNraXAoKTtcbiAgICAgICAgICAgIGlmIChwci5mYWlsZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBzdWNjZWVkIGFueXdheVxuICAgICAgICAgICAgICAgIHByID0gc3RhdGUubWFrZVN1Y2Nlc3NmdWxQYXJzZShwb3MsIHBvcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHI7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiKD88c2tpcD5cIiArIHJlcGV0aXRpb24gKyBcIilcIjtcbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLnNraXAgPSBza2lwO1xuZnVuY3Rpb24gZmFpbGZhc3QoZ3QpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwYXJzZShzLCBwb3MsIGRlZmluaXRpb25zLCBzdGF0ZSkge1xuICAgICAgICAgICAgbGV0IHByID0gZ3QucGFyc2UocywgcG9zLCBkZWZpbml0aW9ucywgc3RhdGUpO1xuICAgICAgICAgICAgaWYgKHByLmZhaWxlZClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5JbnRlcm5hbFBhcnNlRXJyb3IoXCJcIiwgcHIubm9udGVybWluYWxOYW1lLCBwci5leHBlY3RlZFRleHQsIFwiXCIsIHByLnBvcyk7XG4gICAgICAgICAgICByZXR1cm4gcHI7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuICdmYWlsZmFzdCgnICsgZ3QgKyAnKSc7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5mYWlsZmFzdCA9IGZhaWxmYXN0O1xuY2xhc3MgSW50ZXJuYWxQYXJzZXIge1xuICAgIGNvbnN0cnVjdG9yKGRlZmluaXRpb25zLCBzdGFydCwgbm9udGVybWluYWxUb1N0cmluZykge1xuICAgICAgICB0aGlzLmRlZmluaXRpb25zID0gZGVmaW5pdGlvbnM7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy5ub250ZXJtaW5hbFRvU3RyaW5nID0gbm9udGVybWluYWxUb1N0cmluZztcbiAgICAgICAgdGhpcy5jaGVja1JlcCgpO1xuICAgIH1cbiAgICBjaGVja1JlcCgpIHtcbiAgICB9XG4gICAgcGFyc2UodGV4dFRvUGFyc2UpIHtcbiAgICAgICAgbGV0IHByID0gKCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQucGFyc2UodGV4dFRvUGFyc2UsIDAsIHRoaXMuZGVmaW5pdGlvbnMsIG5ldyBQYXJzZXJTdGF0ZSh0aGlzLm5vbnRlcm1pbmFsVG9TdHJpbmcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiB0eXBlc18xLkludGVybmFsUGFyc2VFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXRocm93IHRoZSBleGNlcHRpb24sIGF1Z21lbnRlZCBieSB0aGUgb3JpZ2luYWwgdGV4dCwgc28gdGhhdCB0aGUgZXJyb3IgbWVzc2FnZSBpcyBiZXR0ZXJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IHR5cGVzXzEuSW50ZXJuYWxQYXJzZUVycm9yKFwic3RyaW5nIGRvZXMgbm90IG1hdGNoIGdyYW1tYXJcIiwgZS5ub250ZXJtaW5hbE5hbWUsIGUuZXhwZWN0ZWRUZXh0LCB0ZXh0VG9QYXJzZSwgZS5wb3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKCk7XG4gICAgICAgIGlmIChwci5mYWlsZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyB0eXBlc18xLkludGVybmFsUGFyc2VFcnJvcihcInN0cmluZyBkb2VzIG5vdCBtYXRjaCBncmFtbWFyXCIsIHByLm5vbnRlcm1pbmFsTmFtZSwgcHIuZXhwZWN0ZWRUZXh0LCB0ZXh0VG9QYXJzZSwgcHIucG9zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHIucG9zIDwgdGV4dFRvUGFyc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gXCJvbmx5IHBhcnQgb2YgdGhlIHN0cmluZyBtYXRjaGVzIHRoZSBncmFtbWFyOyB0aGUgcmVzdCBkaWQgbm90IHBhcnNlXCI7XG4gICAgICAgICAgICB0aHJvdyAocHIubGFzdEZhaWx1cmVcbiAgICAgICAgICAgICAgICA/IG5ldyB0eXBlc18xLkludGVybmFsUGFyc2VFcnJvcihtZXNzYWdlLCBwci5sYXN0RmFpbHVyZS5ub250ZXJtaW5hbE5hbWUsIHByLmxhc3RGYWlsdXJlLmV4cGVjdGVkVGV4dCwgdGV4dFRvUGFyc2UsIHByLmxhc3RGYWlsdXJlLnBvcylcbiAgICAgICAgICAgICAgICA6IG5ldyB0eXBlc18xLkludGVybmFsUGFyc2VFcnJvcihtZXNzYWdlLCB0aGlzLnN0YXJ0LnRvU3RyaW5nKCksIFwiZW5kIG9mIHN0cmluZ1wiLCB0ZXh0VG9QYXJzZSwgcHIucG9zKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByLnRyZWU7XG4gICAgfVxuICAgIDtcbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5kZWZpbml0aW9ucywgKFtub250ZXJtaW5hbCwgcnVsZV0pID0+IHRoaXMubm9udGVybWluYWxUb1N0cmluZyhub250ZXJtaW5hbCkgKyAnOjo9JyArIHJ1bGUgKyAnOycpLmpvaW4oXCJcXG5cIik7XG4gICAgfVxufVxuZXhwb3J0cy5JbnRlcm5hbFBhcnNlciA9IEludGVybmFsUGFyc2VyO1xuY2xhc3MgU3VjY2Vzc2Z1bFBhcnNlIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3MsIHRyZWUsIGxhc3RGYWlsdXJlKSB7XG4gICAgICAgIHRoaXMucG9zID0gcG9zO1xuICAgICAgICB0aGlzLnRyZWUgPSB0cmVlO1xuICAgICAgICB0aGlzLmxhc3RGYWlsdXJlID0gbGFzdEZhaWx1cmU7XG4gICAgICAgIHRoaXMuZmFpbGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHJlcGxhY2VUcmVlKHRyZWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWNjZXNzZnVsUGFyc2UodGhpcy5wb3MsIHRyZWUsIHRoaXMubGFzdEZhaWx1cmUpO1xuICAgIH1cbiAgICBtZXJnZVJlc3VsdCh0aGF0KSB7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KSghdGhhdC5mYWlsZWQpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdtZXJnaW5nJywgdGhpcywgJ3dpdGgnLCB0aGF0KTtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWNjZXNzZnVsUGFyc2UodGhhdC5wb3MsIHRoaXMudHJlZS5jb25jYXQodGhhdC50cmVlKSwgbGF0ZXJSZXN1bHQodGhpcy5sYXN0RmFpbHVyZSwgdGhhdC5sYXN0RmFpbHVyZSkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBLZWVwIHRyYWNrIG9mIGEgZmFpbGluZyBwYXJzZSByZXN1bHQgdGhhdCBwcmV2ZW50ZWQgdGhpcyB0cmVlIGZyb20gbWF0Y2hpbmcgbW9yZSBvZiB0aGUgaW5wdXQgc3RyaW5nLlxuICAgICAqIFRoaXMgZGVlcGVyIGZhaWx1cmUgaXMgdXN1YWxseSBtb3JlIGluZm9ybWF0aXZlIHRvIHRoZSB1c2VyLCBzbyB3ZSdsbCBkaXNwbGF5IGl0IGluIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBuZXdMYXN0RmFpbHVyZSBhIGZhaWxpbmcgUGFyc2VSZXN1bHQ8TlQ+IHRoYXQgc3RvcHBlZCB0aGlzIHRyZWUncyBwYXJzZSAoYnV0IGRpZG4ndCBwcmV2ZW50IHRoaXMgZnJvbSBzdWNjZWVkaW5nKVxuICAgICAqIEByZXR1cm4gYSBuZXcgUGFyc2VSZXN1bHQ8TlQ+IGlkZW50aWNhbCB0byB0aGlzIG9uZSBidXQgd2l0aCBsYXN0RmFpbHVyZSBhZGRlZCB0byBpdFxuICAgICAqL1xuICAgIGFkZExhc3RGYWlsdXJlKG5ld0xhc3RGYWlsdXJlKSB7XG4gICAgICAgICgwLCBhc3NlcnRfMS5kZWZhdWx0KShuZXdMYXN0RmFpbHVyZS5mYWlsZWQpO1xuICAgICAgICByZXR1cm4gbmV3IFN1Y2Nlc3NmdWxQYXJzZSh0aGlzLnBvcywgdGhpcy50cmVlLCBsYXRlclJlc3VsdCh0aGlzLmxhc3RGYWlsdXJlLCBuZXdMYXN0RmFpbHVyZSkpO1xuICAgIH1cbn1cbmV4cG9ydHMuU3VjY2Vzc2Z1bFBhcnNlID0gU3VjY2Vzc2Z1bFBhcnNlO1xuY2xhc3MgRmFpbGVkUGFyc2Uge1xuICAgIGNvbnN0cnVjdG9yKHBvcywgbm9udGVybWluYWxOYW1lLCBleHBlY3RlZFRleHQpIHtcbiAgICAgICAgdGhpcy5wb3MgPSBwb3M7XG4gICAgICAgIHRoaXMubm9udGVybWluYWxOYW1lID0gbm9udGVybWluYWxOYW1lO1xuICAgICAgICB0aGlzLmV4cGVjdGVkVGV4dCA9IGV4cGVjdGVkVGV4dDtcbiAgICAgICAgdGhpcy5mYWlsZWQgPSB0cnVlO1xuICAgIH1cbn1cbmV4cG9ydHMuRmFpbGVkUGFyc2UgPSBGYWlsZWRQYXJzZTtcbi8qKlxuICogQHBhcmFtIHJlc3VsdDFcbiAqIEBwYXJhbSByZXN1bHQyXG4gKiBAcmV0dXJuIHdoaWNoZXZlciBvZiByZXN1bHQxIG9yIHJlc3VsdDIgaGFzIHRoZSBteGltdW0gcG9zaXRpb24sIG9yIHVuZGVmaW5lZCBpZiBib3RoIGFyZSB1bmRlZmluZWRcbiAqL1xuZnVuY3Rpb24gbGF0ZXJSZXN1bHQocmVzdWx0MSwgcmVzdWx0Mikge1xuICAgIGlmIChyZXN1bHQxICYmIHJlc3VsdDIpXG4gICAgICAgIHJldHVybiByZXN1bHQxLnBvcyA+PSByZXN1bHQyLnBvcyA/IHJlc3VsdDEgOiByZXN1bHQyO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHJlc3VsdDEgfHwgcmVzdWx0Mjtcbn1cbi8qKlxuICogQHBhcmFtIHJlc3VsdHNcbiAqIEByZXR1cm4gdGhlIHJlc3VsdHMgaW4gdGhlIGxpc3Qgd2l0aCBtYXhpbXVtIHBvcy4gIEVtcHR5IGlmIGxpc3QgaXMgZW1wdHkuXG4gKi9cbmZ1bmN0aW9uIGxvbmdlc3RSZXN1bHRzKHJlc3VsdHMpIHtcbiAgICByZXR1cm4gcmVzdWx0cy5yZWR1Y2UoKGxvbmdlc3RSZXN1bHRzU29GYXIsIHJlc3VsdCkgPT4ge1xuICAgICAgICBpZiAobG9uZ2VzdFJlc3VsdHNTb0Zhci5sZW5ndGggPT0gMCB8fCByZXN1bHQucG9zID4gbG9uZ2VzdFJlc3VsdHNTb0ZhclswXS5wb3MpIHtcbiAgICAgICAgICAgIC8vIHJlc3VsdCB3aW5zXG4gICAgICAgICAgICByZXR1cm4gW3Jlc3VsdF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocmVzdWx0LnBvcyA9PSBsb25nZXN0UmVzdWx0c1NvRmFyWzBdLnBvcykge1xuICAgICAgICAgICAgLy8gcmVzdWx0IGlzIHRpZWRcbiAgICAgICAgICAgIGxvbmdlc3RSZXN1bHRzU29GYXIucHVzaChyZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuIGxvbmdlc3RSZXN1bHRzU29GYXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyByZXN1bHQgbG9zZXNcbiAgICAgICAgICAgIHJldHVybiBsb25nZXN0UmVzdWx0c1NvRmFyO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xufVxuY2xhc3MgUGFyc2VyU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKG5vbnRlcm1pbmFsVG9TdHJpbmcpIHtcbiAgICAgICAgdGhpcy5ub250ZXJtaW5hbFRvU3RyaW5nID0gbm9udGVybWluYWxUb1N0cmluZztcbiAgICAgICAgdGhpcy5zdGFjayA9IFtdO1xuICAgICAgICB0aGlzLmZpcnN0ID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnNraXBEZXB0aCA9IDA7XG4gICAgfVxuICAgIGVudGVyKHBvcywgbm9udGVybWluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmZpcnN0Lmhhcyhub250ZXJtaW5hbCkpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyc3Quc2V0KG5vbnRlcm1pbmFsLCBbXSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcyA9IHRoaXMuZmlyc3QuZ2V0KG5vbnRlcm1pbmFsKTtcbiAgICAgICAgaWYgKHMubGVuZ3RoID4gMCAmJiBzW3MubGVuZ3RoIC0gMV0gPT0gcG9zKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgdHlwZXNfMS5HcmFtbWFyRXJyb3IoXCJkZXRlY3RlZCBsZWZ0IHJlY3Vyc2lvbiBpbiBydWxlIGZvciBcIiArIHRoaXMubm9udGVybWluYWxUb1N0cmluZyhub250ZXJtaW5hbCkpO1xuICAgICAgICB9XG4gICAgICAgIHMucHVzaChwb3MpO1xuICAgICAgICB0aGlzLnN0YWNrLnB1c2gobm9udGVybWluYWwpO1xuICAgIH1cbiAgICBsZWF2ZShub250ZXJtaW5hbCkge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodGhpcy5maXJzdC5oYXMobm9udGVybWluYWwpICYmIHRoaXMuZmlyc3QuZ2V0KG5vbnRlcm1pbmFsKS5sZW5ndGggPiAwKTtcbiAgICAgICAgdGhpcy5maXJzdC5nZXQobm9udGVybWluYWwpLnBvcCgpO1xuICAgICAgICBjb25zdCBsYXN0ID0gdGhpcy5zdGFjay5wb3AoKTtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKGxhc3QgPT09IG5vbnRlcm1pbmFsKTtcbiAgICB9XG4gICAgZW50ZXJTa2lwKCkge1xuICAgICAgICAvL2NvbnNvbGUuZXJyb3IoJ2VudGVyaW5nIHNraXAnKTtcbiAgICAgICAgKyt0aGlzLnNraXBEZXB0aDtcbiAgICB9XG4gICAgbGVhdmVTa2lwKCkge1xuICAgICAgICAvL2NvbnNvbGUuZXJyb3IoJ2xlYXZpbmcgc2tpcCcpO1xuICAgICAgICAtLXRoaXMuc2tpcERlcHRoO1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkodGhpcy5za2lwRGVwdGggPj0gMCk7XG4gICAgfVxuICAgIGlzRW1wdHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YWNrLmxlbmd0aCA9PSAwO1xuICAgIH1cbiAgICBnZXQgY3VycmVudE5vbnRlcm1pbmFsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIDFdO1xuICAgIH1cbiAgICBnZXQgY3VycmVudE5vbnRlcm1pbmFsTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudE5vbnRlcm1pbmFsICE9PSB1bmRlZmluZWQgPyB0aGlzLm5vbnRlcm1pbmFsVG9TdHJpbmcodGhpcy5jdXJyZW50Tm9udGVybWluYWwpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvLyByZXF1aXJlczogIWlzRW1wdHkoKVxuICAgIG1ha2VQYXJzZVRyZWUocG9zLCB0ZXh0ID0gJycsIGNoaWxkcmVuID0gW10pIHtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKCF0aGlzLmlzRW1wdHkoKSk7XG4gICAgICAgIHJldHVybiBuZXcgcGFyc2V0cmVlXzEuSW50ZXJuYWxQYXJzZVRyZWUodGhpcy5jdXJyZW50Tm9udGVybWluYWwsIHRoaXMuY3VycmVudE5vbnRlcm1pbmFsTmFtZSwgcG9zLCB0ZXh0LCBjaGlsZHJlbiwgdGhpcy5za2lwRGVwdGggPiAwKTtcbiAgICB9XG4gICAgLy8gcmVxdWlyZXMgIWlzRW1wdHkoKVxuICAgIG1ha2VTdWNjZXNzZnVsUGFyc2UoZnJvbVBvcywgdG9Qb3MsIHRleHQgPSAnJywgY2hpbGRyZW4gPSBbXSkge1xuICAgICAgICAoMCwgYXNzZXJ0XzEuZGVmYXVsdCkoIXRoaXMuaXNFbXB0eSgpKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWNjZXNzZnVsUGFyc2UodG9Qb3MsIHRoaXMubWFrZVBhcnNlVHJlZShmcm9tUG9zLCB0ZXh0LCBjaGlsZHJlbikpO1xuICAgIH1cbiAgICAvLyByZXF1aXJlcyAhaXNFbXB0eSgpXG4gICAgbWFrZUZhaWxlZFBhcnNlKGF0UG9zLCBleHBlY3RlZFRleHQpIHtcbiAgICAgICAgKDAsIGFzc2VydF8xLmRlZmF1bHQpKCF0aGlzLmlzRW1wdHkoKSk7XG4gICAgICAgIHJldHVybiBuZXcgRmFpbGVkUGFyc2UoYXRQb3MsIHRoaXMuY3VycmVudE5vbnRlcm1pbmFsTmFtZSwgZXhwZWN0ZWRUZXh0KTtcbiAgICB9XG59XG5leHBvcnRzLlBhcnNlclN0YXRlID0gUGFyc2VyU3RhdGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJzZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkludGVybmFsUGFyc2VUcmVlID0gdm9pZCAwO1xuY29uc3QgZGlzcGxheV8xID0gcmVxdWlyZShcIi4vZGlzcGxheVwiKTtcbmNsYXNzIEludGVybmFsUGFyc2VUcmVlIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBub250ZXJtaW5hbE5hbWUsIHN0YXJ0LCB0ZXh0LCBhbGxDaGlsZHJlbiwgaXNTa2lwcGVkKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMubm9udGVybWluYWxOYW1lID0gbm9udGVybWluYWxOYW1lO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgICAgIHRoaXMuYWxsQ2hpbGRyZW4gPSBhbGxDaGlsZHJlbjtcbiAgICAgICAgdGhpcy5pc1NraXBwZWQgPSBpc1NraXBwZWQ7XG4gICAgICAgIHRoaXMuY2hlY2tSZXAoKTtcbiAgICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzLmFsbENoaWxkcmVuKTtcbiAgICAgICAgLy8gY2FuJ3QgZnJlZXplKHRoaXMpIGJlY2F1c2Ugb2YgYmVuZWZpY2VudCBtdXRhdGlvbiBkZWxheWVkIGNvbXB1dGF0aW9uLXdpdGgtY2FjaGluZyBmb3IgY2hpbGRyZW4oKSBhbmQgY2hpbGRyZW5CeU5hbWUoKVxuICAgIH1cbiAgICBjaGVja1JlcCgpIHtcbiAgICAgICAgLy8gRklYTUVcbiAgICB9XG4gICAgZ2V0IGVuZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQgKyB0aGlzLnRleHQubGVuZ3RoO1xuICAgIH1cbiAgICBjaGlsZHJlbkJ5TmFtZShuYW1lKSB7XG4gICAgICAgIGlmICghdGhpcy5fY2hpbGRyZW5CeU5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuQnlOYW1lID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiB0aGlzLmFsbENoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9jaGlsZHJlbkJ5TmFtZS5oYXMoY2hpbGQubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5CeU5hbWUuc2V0KGNoaWxkLm5hbWUsIFtdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fY2hpbGRyZW5CeU5hbWUuZ2V0KGNoaWxkLm5hbWUpLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZExpc3Qgb2YgdGhpcy5fY2hpbGRyZW5CeU5hbWUudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZnJlZXplKGNoaWxkTGlzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja1JlcCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRyZW5CeU5hbWUuZ2V0KG5hbWUpIHx8IFtdO1xuICAgIH1cbiAgICBnZXQgY2hpbGRyZW4oKSB7XG4gICAgICAgIGlmICghdGhpcy5fY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkcmVuID0gdGhpcy5hbGxDaGlsZHJlbi5maWx0ZXIoY2hpbGQgPT4gIWNoaWxkLmlzU2tpcHBlZCk7XG4gICAgICAgICAgICBPYmplY3QuZnJlZXplKHRoaXMuX2NoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoZWNrUmVwKCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbjtcbiAgICB9XG4gICAgY29uY2F0KHRoYXQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnRlcm5hbFBhcnNlVHJlZSh0aGlzLm5hbWUsIHRoaXMubm9udGVybWluYWxOYW1lLCB0aGlzLnN0YXJ0LCB0aGlzLnRleHQgKyB0aGF0LnRleHQsIHRoaXMuYWxsQ2hpbGRyZW4uY29uY2F0KHRoYXQuYWxsQ2hpbGRyZW4pLCB0aGlzLmlzU2tpcHBlZCAmJiB0aGF0LmlzU2tpcHBlZCk7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICBsZXQgcyA9ICh0aGlzLmlzU2tpcHBlZCA/IFwiQHNraXAgXCIgOiBcIlwiKSArIHRoaXMubm9udGVybWluYWxOYW1lO1xuICAgICAgICBpZiAodGhpcy5jaGlsZHJlbi5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcyArPSBcIjpcIiArICgwLCBkaXNwbGF5XzEuZXNjYXBlRm9yUmVhZGluZykodGhpcy50ZXh0LCBcIlxcXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgdCA9IFwiXCI7XG4gICAgICAgICAgICBsZXQgb2Zmc2V0UmVhY2hlZFNvRmFyID0gdGhpcy5zdGFydDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcHQgb2YgdGhpcy5hbGxDaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXRSZWFjaGVkU29GYXIgPCBwdC5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBwcmV2aW91cyBjaGlsZCBhbmQgY3VycmVudCBjaGlsZCBoYXZlIGEgZ2FwIGJldHdlZW4gdGhlbSB0aGF0IG11c3QgaGF2ZSBiZWVuIG1hdGNoZWQgYXMgYSB0ZXJtaW5hbFxuICAgICAgICAgICAgICAgICAgICAvLyBpbiB0aGUgcnVsZSBmb3IgdGhpcyBub2RlLiAgSW5zZXJ0IGl0IGFzIGEgcXVvdGVkIHN0cmluZy5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVybWluYWwgPSB0aGlzLnRleHQuc3Vic3RyaW5nKG9mZnNldFJlYWNoZWRTb0ZhciAtIHRoaXMuc3RhcnQsIHB0LnN0YXJ0IC0gdGhpcy5zdGFydCk7XG4gICAgICAgICAgICAgICAgICAgIHQgKz0gXCJcXG5cIiArICgwLCBkaXNwbGF5XzEuZXNjYXBlRm9yUmVhZGluZykodGVybWluYWwsIFwiXFxcIlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdCArPSBcIlxcblwiICsgcHQ7XG4gICAgICAgICAgICAgICAgb2Zmc2V0UmVhY2hlZFNvRmFyID0gcHQuZW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9mZnNldFJlYWNoZWRTb0ZhciA8IHRoaXMuZW5kKSB7XG4gICAgICAgICAgICAgICAgLy8gZmluYWwgY2hpbGQgYW5kIGVuZCBvZiB0aGlzIG5vZGUgaGF2ZSBhIGdhcCAtLSB0cmVhdCBpdCB0aGUgc2FtZSBhcyBhYm92ZS5cbiAgICAgICAgICAgICAgICBjb25zdCB0ZXJtaW5hbCA9IHRoaXMudGV4dC5zdWJzdHJpbmcob2Zmc2V0UmVhY2hlZFNvRmFyIC0gdGhpcy5zdGFydCk7XG4gICAgICAgICAgICAgICAgdCArPSBcIlxcblwiICsgKDAsIGRpc3BsYXlfMS5lc2NhcGVGb3JSZWFkaW5nKSh0ZXJtaW5hbCwgXCJcXFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc21hbGxFbm91Z2hGb3JPbmVMaW5lID0gNTA7XG4gICAgICAgICAgICBpZiAodC5sZW5ndGggPD0gc21hbGxFbm91Z2hGb3JPbmVMaW5lKSB7XG4gICAgICAgICAgICAgICAgcyArPSBcIiB7IFwiICsgdC5zdWJzdHJpbmcoMSkgLy8gcmVtb3ZlIGluaXRpYWwgbmV3bGluZVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShcIlxcblwiLCBcIiwgXCIpXG4gICAgICAgICAgICAgICAgICAgICsgXCIgfVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcyArPSBcIiB7XCIgKyAoMCwgZGlzcGxheV8xLmluZGVudCkodCwgXCIgIFwiKSArIFwiXFxufVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cbn1cbmV4cG9ydHMuSW50ZXJuYWxQYXJzZVRyZWUgPSBJbnRlcm5hbFBhcnNlVHJlZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXBhcnNldHJlZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuR3JhbW1hckVycm9yID0gZXhwb3J0cy5JbnRlcm5hbFBhcnNlRXJyb3IgPSBleHBvcnRzLlBhcnNlRXJyb3IgPSB2b2lkIDA7XG5jb25zdCBkaXNwbGF5XzEgPSByZXF1aXJlKFwiLi9kaXNwbGF5XCIpO1xuLyoqXG4gKiBFeGNlcHRpb24gdGhyb3duIHdoZW4gYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGRvZXNuJ3QgbWF0Y2ggYSBncmFtbWFyXG4gKi9cbmNsYXNzIFBhcnNlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgICAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB9XG59XG5leHBvcnRzLlBhcnNlRXJyb3IgPSBQYXJzZUVycm9yO1xuY2xhc3MgSW50ZXJuYWxQYXJzZUVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSwgbm9udGVybWluYWxOYW1lLCBleHBlY3RlZFRleHQsIHRleHRCZWluZ1BhcnNlZCwgcG9zKSB7XG4gICAgICAgIHN1cGVyKCgwLCBkaXNwbGF5XzEubWFrZUVycm9yTWVzc2FnZSkobWVzc2FnZSwgbm9udGVybWluYWxOYW1lLCBleHBlY3RlZFRleHQsIHRleHRCZWluZ1BhcnNlZCwgcG9zLCBcInN0cmluZyBiZWluZyBwYXJzZWRcIikpO1xuICAgICAgICB0aGlzLm5vbnRlcm1pbmFsTmFtZSA9IG5vbnRlcm1pbmFsTmFtZTtcbiAgICAgICAgdGhpcy5leHBlY3RlZFRleHQgPSBleHBlY3RlZFRleHQ7XG4gICAgICAgIHRoaXMudGV4dEJlaW5nUGFyc2VkID0gdGV4dEJlaW5nUGFyc2VkO1xuICAgICAgICB0aGlzLnBvcyA9IHBvcztcbiAgICB9XG59XG5leHBvcnRzLkludGVybmFsUGFyc2VFcnJvciA9IEludGVybmFsUGFyc2VFcnJvcjtcbmNsYXNzIEdyYW1tYXJFcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UsIGUpIHtcbiAgICAgICAgc3VwZXIoZSA/ICgwLCBkaXNwbGF5XzEubWFrZUVycm9yTWVzc2FnZSkobWVzc2FnZSwgZS5ub250ZXJtaW5hbE5hbWUsIGUuZXhwZWN0ZWRUZXh0LCBlLnRleHRCZWluZ1BhcnNlZCwgZS5wb3MsIFwiZ3JhbW1hclwiKVxuICAgICAgICAgICAgOiBtZXNzYWdlKTtcbiAgICB9XG59XG5leHBvcnRzLkdyYW1tYXJFcnJvciA9IEdyYW1tYXJFcnJvcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXR5cGVzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy52aXN1YWxpemVBc0h0bWwgPSBleHBvcnRzLnZpc3VhbGl6ZUFzVXJsID0gdm9pZCAwO1xuY29uc3QgY29tcGlsZXJfMSA9IHJlcXVpcmUoXCIuL2NvbXBpbGVyXCIpO1xuY29uc3QgcGFyc2VybGliXzEgPSByZXF1aXJlKFwiLi4vcGFyc2VybGliXCIpO1xuY29uc3QgZnNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiZnNcIikpO1xuY29uc3QgcGF0aF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJwYXRoXCIpKTtcbmZ1bmN0aW9uIGVtcHR5SXRlcmF0b3IoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dCgpIHsgcmV0dXJuIHsgZG9uZTogdHJ1ZSB9OyB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldEl0ZXJhdG9yKGxpc3QpIHtcbiAgICByZXR1cm4gbGlzdFtTeW1ib2wuaXRlcmF0b3JdKCk7XG59XG5jb25zdCBNQVhfVVJMX0xFTkdUSF9GT1JfREVTS1RPUF9CUk9XU0UgPSAyMDIwO1xuLyoqXG4gKiBWaXN1YWxpemVzIGEgcGFyc2UgdHJlZSB1c2luZyBhIFVSTCB0aGF0IGNhbiBiZSBwYXN0ZWQgaW50byB5b3VyIHdlYiBicm93c2VyLlxuICogQHBhcmFtIHBhcnNlVHJlZSB0cmVlIHRvIHZpc3VhbGl6ZVxuICogQHBhcmFtIDxOVD4gdGhlIGVudW1lcmF0aW9uIG9mIHN5bWJvbHMgaW4gdGhlIHBhcnNlIHRyZWUncyBncmFtbWFyXG4gKiBAcmV0dXJuIHVybCB0aGF0IHNob3dzIGEgdmlzdWFsaXphdGlvbiBvZiB0aGUgcGFyc2UgdHJlZVxuICovXG5mdW5jdGlvbiB2aXN1YWxpemVBc1VybChwYXJzZVRyZWUsIG5vbnRlcm1pbmFscykge1xuICAgIGNvbnN0IGJhc2UgPSBcImh0dHA6Ly93ZWIubWl0LmVkdS82LjAzMS93d3cvcGFyc2VybGliL1wiICsgcGFyc2VybGliXzEuVkVSU0lPTiArIFwiL3Zpc3VhbGl6ZXIuaHRtbFwiO1xuICAgIGNvbnN0IGNvZGUgPSBleHByZXNzaW9uRm9yRGlzcGxheShwYXJzZVRyZWUsIG5vbnRlcm1pbmFscyk7XG4gICAgY29uc3QgdXJsID0gYmFzZSArICc/Y29kZT0nICsgZml4ZWRFbmNvZGVVUklDb21wb25lbnQoY29kZSk7XG4gICAgaWYgKHVybC5sZW5ndGggPiBNQVhfVVJMX0xFTkdUSF9GT1JfREVTS1RPUF9CUk9XU0UpIHtcbiAgICAgICAgLy8gZGlzcGxheSBhbHRlcm5hdGUgaW5zdHJ1Y3Rpb25zIHRvIHRoZSBjb25zb2xlXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Zpc3VhbGl6YXRpb24gVVJMIGlzIHRvbyBsb25nIGZvciB3ZWIgYnJvd3NlciBhbmQvb3Igd2ViIHNlcnZlci5cXG4nXG4gICAgICAgICAgICArICdJbnN0ZWFkLCBnbyB0byAnICsgYmFzZSArICdcXG4nXG4gICAgICAgICAgICArICdhbmQgY29weSBhbmQgcGFzdGUgdGhpcyBjb2RlIGludG8gdGhlIHRleHRib3g6XFxuJ1xuICAgICAgICAgICAgKyBjb2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbn1cbmV4cG9ydHMudmlzdWFsaXplQXNVcmwgPSB2aXN1YWxpemVBc1VybDtcbmNvbnN0IHZpc3VhbGl6ZXJIdG1sRmlsZSA9IHBhdGhfMS5kZWZhdWx0LnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vc3JjL3Zpc3VhbGl6ZXIuaHRtbCcpO1xuLyoqXG4gKiBWaXN1YWxpemVzIGEgcGFyc2UgdHJlZSBhcyBhIHN0cmluZyBvZiBIVE1MIHRoYXQgY2FuIGJlIGRpc3BsYXllZCBpbiBhIHdlYiBicm93c2VyLlxuICogQHBhcmFtIHBhcnNlVHJlZSB0cmVlIHRvIHZpc3VhbGl6ZVxuICogQHBhcmFtIDxOVD4gdGhlIGVudW1lcmF0aW9uIG9mIHN5bWJvbHMgaW4gdGhlIHBhcnNlIHRyZWUncyBncmFtbWFyXG4gKiBAcmV0dXJuIHN0cmluZyBvZiBIVE1MIHRoYXQgc2hvd3MgYSB2aXN1YWxpemF0aW9uIG9mIHRoZSBwYXJzZSB0cmVlXG4gKi9cbmZ1bmN0aW9uIHZpc3VhbGl6ZUFzSHRtbChwYXJzZVRyZWUsIG5vbnRlcm1pbmFscykge1xuICAgIGNvbnN0IGh0bWwgPSBmc18xLmRlZmF1bHQucmVhZEZpbGVTeW5jKHZpc3VhbGl6ZXJIdG1sRmlsZSwgJ3V0ZjgnKTtcbiAgICBjb25zdCBjb2RlID0gZXhwcmVzc2lvbkZvckRpc3BsYXkocGFyc2VUcmVlLCBub250ZXJtaW5hbHMpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGh0bWwucmVwbGFjZSgvXFwvXFwvQ09ERUhFUkUvLCBcInJldHVybiAnXCIgKyBmaXhlZEVuY29kZVVSSUNvbXBvbmVudChjb2RlKSArIFwiJztcIik7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmV4cG9ydHMudmlzdWFsaXplQXNIdG1sID0gdmlzdWFsaXplQXNIdG1sO1xuZnVuY3Rpb24gZXhwcmVzc2lvbkZvckRpc3BsYXkocGFyc2VUcmVlLCBub250ZXJtaW5hbHMpIHtcbiAgICBjb25zdCB7IG5vbnRlcm1pbmFsVG9TdHJpbmcgfSA9ICgwLCBjb21waWxlcl8xLm1ha2VOb250ZXJtaW5hbENvbnZlcnRlcnMpKG5vbnRlcm1pbmFscyk7XG4gICAgcmV0dXJuIGZvckRpc3BsYXkocGFyc2VUcmVlLCBbXSwgcGFyc2VUcmVlKTtcbiAgICBmdW5jdGlvbiBmb3JEaXNwbGF5KG5vZGUsIHNpYmxpbmdzLCBwYXJlbnQpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IG5vbnRlcm1pbmFsVG9TdHJpbmcobm9kZS5uYW1lKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBsZXQgcyA9IFwibmQoXCI7XG4gICAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBzICs9IFwiXFxcIlwiICsgbmFtZSArIFwiXFxcIixuZChcXFwiJ1wiICsgY2xlYW5TdHJpbmcobm9kZS50ZXh0KSArIFwiJ1xcXCIpLFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcyArPSBcIlxcXCJcIiArIG5hbWUgKyBcIlxcXCIsXCI7XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuYWxsQ2hpbGRyZW4uc2xpY2UoKTsgLy8gbWFrZSBhIGNvcHkgZm9yIHNoaWZ0aW5nXG4gICAgICAgICAgICBjb25zdCBmaXJzdENoaWxkID0gY2hpbGRyZW4uc2hpZnQoKTtcbiAgICAgICAgICAgIGxldCBjaGlsZHJlbkV4cHJlc3Npb24gPSBmb3JEaXNwbGF5KGZpcnN0Q2hpbGQsIGNoaWxkcmVuLCBub2RlKTtcbiAgICAgICAgICAgIGlmIChub2RlLnN0YXJ0IDwgZmlyc3RDaGlsZC5zdGFydCkge1xuICAgICAgICAgICAgICAgIC8vIG5vZGUgYW5kIGl0cyBmaXJzdCBjaGlsZCBoYXZlIGEgZ2FwIGJldHdlZW4gdGhlbSB0aGF0IG11c3QgaGF2ZSBiZWVuIG1hdGNoZWQgYXMgYSB0ZXJtaW5hbFxuICAgICAgICAgICAgICAgIC8vIGluIHRoZSBydWxlIGZvciBub2RlLiAgSW5zZXJ0IGl0IGFzIGEgcXVvdGVkIHN0cmluZy5cbiAgICAgICAgICAgICAgICBjaGlsZHJlbkV4cHJlc3Npb24gPSBwcmVjZWRlQnlUZXJtaW5hbChub2RlLnRleHQuc3Vic3RyaW5nKDAsIGZpcnN0Q2hpbGQuc3RhcnQgLSBub2RlLnN0YXJ0KSwgY2hpbGRyZW5FeHByZXNzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHMgKz0gY2hpbGRyZW5FeHByZXNzaW9uICsgXCIsXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpYmxpbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHNpYmxpbmcgPSBzaWJsaW5ncy5zaGlmdCgpO1xuICAgICAgICAgICAgbGV0IHNpYmxpbmdFeHByZXNzaW9uID0gZm9yRGlzcGxheShzaWJsaW5nLCBzaWJsaW5ncywgcGFyZW50KTtcbiAgICAgICAgICAgIGlmIChub2RlLmVuZCA8IHNpYmxpbmcuc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAvLyBub2RlIGFuZCBpdHMgc2libGluZyBoYXZlIGEgZ2FwIGJldHdlZW4gdGhlbSB0aGF0IG11c3QgaGF2ZSBiZWVuIG1hdGNoZWQgYXMgYSB0ZXJtaW5hbFxuICAgICAgICAgICAgICAgIC8vIGluIHRoZSBydWxlIGZvciBwYXJlbnQuICBJbnNlcnQgaXQgYXMgYSBxdW90ZWQgc3RyaW5nLlxuICAgICAgICAgICAgICAgIHNpYmxpbmdFeHByZXNzaW9uID0gcHJlY2VkZUJ5VGVybWluYWwocGFyZW50LnRleHQuc3Vic3RyaW5nKG5vZGUuZW5kIC0gcGFyZW50LnN0YXJ0LCBzaWJsaW5nLnN0YXJ0IC0gcGFyZW50LnN0YXJ0KSwgc2libGluZ0V4cHJlc3Npb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcyArPSBzaWJsaW5nRXhwcmVzc2lvbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCBzaWJsaW5nRXhwcmVzc2lvbiA9IFwidXVcIjtcbiAgICAgICAgICAgIGlmIChub2RlLmVuZCA8IHBhcmVudC5lbmQpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGVyZSdzIGEgZ2FwIGJldHdlZW4gdGhlIGVuZCBvZiBub2RlIGFuZCB0aGUgZW5kIG9mIGl0cyBwYXJlbnQsIHdoaWNoIG11c3QgYmUgYSB0ZXJtaW5hbCBtYXRjaGVkIGJ5IHBhcmVudC5cbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgaXQgYXMgYSBxdW90ZWQgc3RyaW5nLlxuICAgICAgICAgICAgICAgIHNpYmxpbmdFeHByZXNzaW9uID0gcHJlY2VkZUJ5VGVybWluYWwocGFyZW50LnRleHQuc3Vic3RyaW5nKG5vZGUuZW5kIC0gcGFyZW50LnN0YXJ0KSwgc2libGluZ0V4cHJlc3Npb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcyArPSBzaWJsaW5nRXhwcmVzc2lvbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5pc1NraXBwZWQpIHtcbiAgICAgICAgICAgIHMgKz0gXCIsdHJ1ZVwiO1xuICAgICAgICB9XG4gICAgICAgIHMgKz0gXCIpXCI7XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwcmVjZWRlQnlUZXJtaW5hbCh0ZXJtaW5hbCwgZXhwcmVzc2lvbikge1xuICAgICAgICByZXR1cm4gXCJuZChcXFwiJ1wiICsgY2xlYW5TdHJpbmcodGVybWluYWwpICsgXCInXFxcIiwgdXUsIFwiICsgZXhwcmVzc2lvbiArIFwiKVwiO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjbGVhblN0cmluZyhzKSB7XG4gICAgICAgIGxldCBydmFsdWUgPSBzLnJlcGxhY2UoL1xcXFwvZywgXCJcXFxcXFxcXFwiKTtcbiAgICAgICAgcnZhbHVlID0gcnZhbHVlLnJlcGxhY2UoL1wiL2csIFwiXFxcXFxcXCJcIik7XG4gICAgICAgIHJ2YWx1ZSA9IHJ2YWx1ZS5yZXBsYWNlKC9cXG4vZywgXCJcXFxcblwiKTtcbiAgICAgICAgcnZhbHVlID0gcnZhbHVlLnJlcGxhY2UoL1xcci9nLCBcIlxcXFxyXCIpO1xuICAgICAgICByZXR1cm4gcnZhbHVlO1xuICAgIH1cbn1cbi8vIGZyb20gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XG5mdW5jdGlvbiBmaXhlZEVuY29kZVVSSUNvbXBvbmVudChzKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzKS5yZXBsYWNlKC9bIScoKSpdL2csIGMgPT4gJyUnICsgYy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD12aXN1YWxpemVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy52aXN1YWxpemVBc0h0bWwgPSBleHBvcnRzLnZpc3VhbGl6ZUFzVXJsID0gZXhwb3J0cy5jb21waWxlID0gZXhwb3J0cy5QYXJzZUVycm9yID0gZXhwb3J0cy5WRVJTSU9OID0gdm9pZCAwO1xuZXhwb3J0cy5WRVJTSU9OID0gXCIzLjIuM1wiO1xudmFyIHR5cGVzXzEgPSByZXF1aXJlKFwiLi9pbnRlcm5hbC90eXBlc1wiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIlBhcnNlRXJyb3JcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHR5cGVzXzEuUGFyc2VFcnJvcjsgfSB9KTtcbjtcbnZhciBjb21waWxlcl8xID0gcmVxdWlyZShcIi4vaW50ZXJuYWwvY29tcGlsZXJcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJjb21waWxlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBjb21waWxlcl8xLmNvbXBpbGU7IH0gfSk7XG52YXIgdmlzdWFsaXplcl8xID0gcmVxdWlyZShcIi4vaW50ZXJuYWwvdmlzdWFsaXplclwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcInZpc3VhbGl6ZUFzVXJsXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB2aXN1YWxpemVyXzEudmlzdWFsaXplQXNVcmw7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJ2aXN1YWxpemVBc0h0bWxcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHZpc3VhbGl6ZXJfMS52aXN1YWxpemVBc0h0bWw7IH0gfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wYXJzZXJsaWIuanMubWFwIiwiLy8gJ3BhdGgnIG1vZHVsZSBleHRyYWN0ZWQgZnJvbSBOb2RlLmpzIHY4LjExLjEgKG9ubHkgdGhlIHBvc2l4IHBhcnQpXG4vLyB0cmFuc3BsaXRlZCB3aXRoIEJhYmVsXG5cbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGFzc2VydFBhdGgocGF0aCkge1xuICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUGF0aCBtdXN0IGJlIGEgc3RyaW5nLiBSZWNlaXZlZCAnICsgSlNPTi5zdHJpbmdpZnkocGF0aCkpO1xuICB9XG59XG5cbi8vIFJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCB3aXRoIGRpcmVjdG9yeSBuYW1lc1xuZnVuY3Rpb24gbm9ybWFsaXplU3RyaW5nUG9zaXgocGF0aCwgYWxsb3dBYm92ZVJvb3QpIHtcbiAgdmFyIHJlcyA9ICcnO1xuICB2YXIgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICB2YXIgbGFzdFNsYXNoID0gLTE7XG4gIHZhciBkb3RzID0gMDtcbiAgdmFyIGNvZGU7XG4gIGZvciAodmFyIGkgPSAwOyBpIDw9IHBhdGgubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoaSA8IHBhdGgubGVuZ3RoKVxuICAgICAgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcbiAgICBlbHNlIGlmIChjb2RlID09PSA0NyAvKi8qLylcbiAgICAgIGJyZWFrO1xuICAgIGVsc2VcbiAgICAgIGNvZGUgPSA0NyAvKi8qLztcbiAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgIGlmIChsYXN0U2xhc2ggPT09IGkgLSAxIHx8IGRvdHMgPT09IDEpIHtcbiAgICAgICAgLy8gTk9PUFxuICAgICAgfSBlbHNlIGlmIChsYXN0U2xhc2ggIT09IGkgLSAxICYmIGRvdHMgPT09IDIpIHtcbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPCAyIHx8IGxhc3RTZWdtZW50TGVuZ3RoICE9PSAyIHx8IHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGggLSAxKSAhPT0gNDYgLyouKi8gfHwgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDIpICE9PSA0NiAvKi4qLykge1xuICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgdmFyIGxhc3RTbGFzaEluZGV4ID0gcmVzLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICBpZiAobGFzdFNsYXNoSW5kZXggIT09IHJlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgIGlmIChsYXN0U2xhc2hJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXMgPSAnJztcbiAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzID0gcmVzLnNsaWNlKDAsIGxhc3RTbGFzaEluZGV4KTtcbiAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IHJlcy5sZW5ndGggLSAxIC0gcmVzLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgICAgICAgICAgZG90cyA9IDA7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAocmVzLmxlbmd0aCA9PT0gMiB8fCByZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXMgPSAnJztcbiAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICByZXMgKz0gJy8uLic7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzID0gJy4uJztcbiAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyZXMubGVuZ3RoID4gMClcbiAgICAgICAgICByZXMgKz0gJy8nICsgcGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlcyA9IHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XG4gICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gaSAtIGxhc3RTbGFzaCAtIDE7XG4gICAgICB9XG4gICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgZG90cyA9IDA7XG4gICAgfSBlbHNlIGlmIChjb2RlID09PSA0NiAvKi4qLyAmJiBkb3RzICE9PSAtMSkge1xuICAgICAgKytkb3RzO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb3RzID0gLTE7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIF9mb3JtYXQoc2VwLCBwYXRoT2JqZWN0KSB7XG4gIHZhciBkaXIgPSBwYXRoT2JqZWN0LmRpciB8fCBwYXRoT2JqZWN0LnJvb3Q7XG4gIHZhciBiYXNlID0gcGF0aE9iamVjdC5iYXNlIHx8IChwYXRoT2JqZWN0Lm5hbWUgfHwgJycpICsgKHBhdGhPYmplY3QuZXh0IHx8ICcnKTtcbiAgaWYgKCFkaXIpIHtcbiAgICByZXR1cm4gYmFzZTtcbiAgfVxuICBpZiAoZGlyID09PSBwYXRoT2JqZWN0LnJvb3QpIHtcbiAgICByZXR1cm4gZGlyICsgYmFzZTtcbiAgfVxuICByZXR1cm4gZGlyICsgc2VwICsgYmFzZTtcbn1cblxudmFyIHBvc2l4ID0ge1xuICAvLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4gIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUoKSB7XG4gICAgdmFyIHJlc29sdmVkUGF0aCA9ICcnO1xuICAgIHZhciByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG4gICAgdmFyIGN3ZDtcblxuICAgIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgICB2YXIgcGF0aDtcbiAgICAgIGlmIChpID49IDApXG4gICAgICAgIHBhdGggPSBhcmd1bWVudHNbaV07XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKGN3ZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgIGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgICAgIHBhdGggPSBjd2Q7XG4gICAgICB9XG5cbiAgICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICAgIC8vIFNraXAgZW1wdHkgZW50cmllc1xuICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XG4gICAgfVxuXG4gICAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gICAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplU3RyaW5nUG9zaXgocmVzb2x2ZWRQYXRoLCAhcmVzb2x2ZWRBYnNvbHV0ZSk7XG5cbiAgICBpZiAocmVzb2x2ZWRBYnNvbHV0ZSkge1xuICAgICAgaWYgKHJlc29sdmVkUGF0aC5sZW5ndGggPiAwKVxuICAgICAgICByZXR1cm4gJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gJy8nO1xuICAgIH0gZWxzZSBpZiAocmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiByZXNvbHZlZFBhdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnLic7XG4gICAgfVxuICB9LFxuXG4gIG5vcm1hbGl6ZTogZnVuY3Rpb24gbm9ybWFsaXplKHBhdGgpIHtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJy4nO1xuXG4gICAgdmFyIGlzQWJzb2x1dGUgPSBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qLyovO1xuICAgIHZhciB0cmFpbGluZ1NlcGFyYXRvciA9IHBhdGguY2hhckNvZGVBdChwYXRoLmxlbmd0aCAtIDEpID09PSA0NyAvKi8qLztcblxuICAgIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICAgIHBhdGggPSBub3JtYWxpemVTdHJpbmdQb3NpeChwYXRoLCAhaXNBYnNvbHV0ZSk7XG5cbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDAgJiYgIWlzQWJzb2x1dGUpIHBhdGggPSAnLic7XG4gICAgaWYgKHBhdGgubGVuZ3RoID4gMCAmJiB0cmFpbGluZ1NlcGFyYXRvcikgcGF0aCArPSAnLyc7XG5cbiAgICBpZiAoaXNBYnNvbHV0ZSkgcmV0dXJuICcvJyArIHBhdGg7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH0sXG5cbiAgaXNBYnNvbHV0ZTogZnVuY3Rpb24gaXNBYnNvbHV0ZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgICByZXR1cm4gcGF0aC5sZW5ndGggPiAwICYmIHBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyovKi87XG4gIH0sXG5cbiAgam9pbjogZnVuY3Rpb24gam9pbigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHJldHVybiAnLic7XG4gICAgdmFyIGpvaW5lZDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGFzc2VydFBhdGgoYXJnKTtcbiAgICAgIGlmIChhcmcubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgam9pbmVkID0gYXJnO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgam9pbmVkICs9ICcvJyArIGFyZztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGpvaW5lZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuICcuJztcbiAgICByZXR1cm4gcG9zaXgubm9ybWFsaXplKGpvaW5lZCk7XG4gIH0sXG5cbiAgcmVsYXRpdmU6IGZ1bmN0aW9uIHJlbGF0aXZlKGZyb20sIHRvKSB7XG4gICAgYXNzZXJ0UGF0aChmcm9tKTtcbiAgICBhc3NlcnRQYXRoKHRvKTtcblxuICAgIGlmIChmcm9tID09PSB0bykgcmV0dXJuICcnO1xuXG4gICAgZnJvbSA9IHBvc2l4LnJlc29sdmUoZnJvbSk7XG4gICAgdG8gPSBwb3NpeC5yZXNvbHZlKHRvKTtcblxuICAgIGlmIChmcm9tID09PSB0bykgcmV0dXJuICcnO1xuXG4gICAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xuICAgIHZhciBmcm9tU3RhcnQgPSAxO1xuICAgIGZvciAoOyBmcm9tU3RhcnQgPCBmcm9tLmxlbmd0aDsgKytmcm9tU3RhcnQpIHtcbiAgICAgIGlmIChmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0KSAhPT0gNDcgLyovKi8pXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB2YXIgZnJvbUVuZCA9IGZyb20ubGVuZ3RoO1xuICAgIHZhciBmcm9tTGVuID0gZnJvbUVuZCAtIGZyb21TdGFydDtcblxuICAgIC8vIFRyaW0gYW55IGxlYWRpbmcgYmFja3NsYXNoZXNcbiAgICB2YXIgdG9TdGFydCA9IDE7XG4gICAgZm9yICg7IHRvU3RhcnQgPCB0by5sZW5ndGg7ICsrdG9TdGFydCkge1xuICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCkgIT09IDQ3IC8qLyovKVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdmFyIHRvRW5kID0gdG8ubGVuZ3RoO1xuICAgIHZhciB0b0xlbiA9IHRvRW5kIC0gdG9TdGFydDtcblxuICAgIC8vIENvbXBhcmUgcGF0aHMgdG8gZmluZCB0aGUgbG9uZ2VzdCBjb21tb24gcGF0aCBmcm9tIHJvb3RcbiAgICB2YXIgbGVuZ3RoID0gZnJvbUxlbiA8IHRvTGVuID8gZnJvbUxlbiA6IHRvTGVuO1xuICAgIHZhciBsYXN0Q29tbW9uU2VwID0gLTE7XG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAoOyBpIDw9IGxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoaSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgIGlmICh0b0xlbiA+IGxlbmd0aCkge1xuICAgICAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgdG9gLlxuICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28vYmFyJzsgdG89Jy9mb28vYmFyL2JheidcbiAgICAgICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSArIDEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSByb290XG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nLyc7IHRvPScvZm9vJ1xuICAgICAgICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQgKyBpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZnJvbUxlbiA+IGxlbmd0aCkge1xuICAgICAgICAgIGlmIChmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGBmcm9tYC5cbiAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhci9iYXonOyB0bz0nL2Zvby9iYXInXG4gICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gaTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIHJvb3QuXG4gICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvbyc7IHRvPScvJ1xuICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdmFyIGZyb21Db2RlID0gZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCArIGkpO1xuICAgICAgdmFyIHRvQ29kZSA9IHRvLmNoYXJDb2RlQXQodG9TdGFydCArIGkpO1xuICAgICAgaWYgKGZyb21Db2RlICE9PSB0b0NvZGUpXG4gICAgICAgIGJyZWFrO1xuICAgICAgZWxzZSBpZiAoZnJvbUNvZGUgPT09IDQ3IC8qLyovKVxuICAgICAgICBsYXN0Q29tbW9uU2VwID0gaTtcbiAgICB9XG5cbiAgICB2YXIgb3V0ID0gJyc7XG4gICAgLy8gR2VuZXJhdGUgdGhlIHJlbGF0aXZlIHBhdGggYmFzZWQgb24gdGhlIHBhdGggZGlmZmVyZW5jZSBiZXR3ZWVuIGB0b2BcbiAgICAvLyBhbmQgYGZyb21gXG4gICAgZm9yIChpID0gZnJvbVN0YXJ0ICsgbGFzdENvbW1vblNlcCArIDE7IGkgPD0gZnJvbUVuZDsgKytpKSB7XG4gICAgICBpZiAoaSA9PT0gZnJvbUVuZCB8fCBmcm9tLmNoYXJDb2RlQXQoaSkgPT09IDQ3IC8qLyovKSB7XG4gICAgICAgIGlmIChvdXQubGVuZ3RoID09PSAwKVxuICAgICAgICAgIG91dCArPSAnLi4nO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgb3V0ICs9ICcvLi4nO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExhc3RseSwgYXBwZW5kIHRoZSByZXN0IG9mIHRoZSBkZXN0aW5hdGlvbiAoYHRvYCkgcGF0aCB0aGF0IGNvbWVzIGFmdGVyXG4gICAgLy8gdGhlIGNvbW1vbiBwYXRoIHBhcnRzXG4gICAgaWYgKG91dC5sZW5ndGggPiAwKVxuICAgICAgcmV0dXJuIG91dCArIHRvLnNsaWNlKHRvU3RhcnQgKyBsYXN0Q29tbW9uU2VwKTtcbiAgICBlbHNlIHtcbiAgICAgIHRvU3RhcnQgKz0gbGFzdENvbW1vblNlcDtcbiAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQpID09PSA0NyAvKi8qLylcbiAgICAgICAgKyt0b1N0YXJ0O1xuICAgICAgcmV0dXJuIHRvLnNsaWNlKHRvU3RhcnQpO1xuICAgIH1cbiAgfSxcblxuICBfbWFrZUxvbmc6IGZ1bmN0aW9uIF9tYWtlTG9uZyhwYXRoKSB7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH0sXG5cbiAgZGlybmFtZTogZnVuY3Rpb24gZGlybmFtZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiAnLic7XG4gICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XG4gICAgdmFyIGhhc1Jvb3QgPSBjb2RlID09PSA0NyAvKi8qLztcbiAgICB2YXIgZW5kID0gLTE7XG4gICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XG4gICAgZm9yICh2YXIgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAxOyAtLWkpIHtcbiAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3JcbiAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVuZCA9PT0gLTEpIHJldHVybiBoYXNSb290ID8gJy8nIDogJy4nO1xuICAgIGlmIChoYXNSb290ICYmIGVuZCA9PT0gMSkgcmV0dXJuICcvLyc7XG4gICAgcmV0dXJuIHBhdGguc2xpY2UoMCwgZW5kKTtcbiAgfSxcblxuICBiYXNlbmFtZTogZnVuY3Rpb24gYmFzZW5hbWUocGF0aCwgZXh0KSB7XG4gICAgaWYgKGV4dCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBleHQgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImV4dFwiIGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICBhc3NlcnRQYXRoKHBhdGgpO1xuXG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICB2YXIgZW5kID0gLTE7XG4gICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XG4gICAgdmFyIGk7XG5cbiAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQgJiYgZXh0Lmxlbmd0aCA+IDAgJiYgZXh0Lmxlbmd0aCA8PSBwYXRoLmxlbmd0aCkge1xuICAgICAgaWYgKGV4dC5sZW5ndGggPT09IHBhdGgubGVuZ3RoICYmIGV4dCA9PT0gcGF0aCkgcmV0dXJuICcnO1xuICAgICAgdmFyIGV4dElkeCA9IGV4dC5sZW5ndGggLSAxO1xuICAgICAgdmFyIGZpcnN0Tm9uU2xhc2hFbmQgPSAtMTtcbiAgICAgIGZvciAoaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGlmIChjb2RlID09PSA0NyAvKi8qLykge1xuICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZmlyc3ROb25TbGFzaEVuZCA9PT0gLTEpIHtcbiAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCByZW1lbWJlciB0aGlzIGluZGV4IGluIGNhc2VcbiAgICAgICAgICAgIC8vIHdlIG5lZWQgaXQgaWYgdGhlIGV4dGVuc2lvbiBlbmRzIHVwIG5vdCBtYXRjaGluZ1xuICAgICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICAgICAgICBmaXJzdE5vblNsYXNoRW5kID0gaSArIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChleHRJZHggPj0gMCkge1xuICAgICAgICAgICAgLy8gVHJ5IHRvIG1hdGNoIHRoZSBleHBsaWNpdCBleHRlbnNpb25cbiAgICAgICAgICAgIGlmIChjb2RlID09PSBleHQuY2hhckNvZGVBdChleHRJZHgpKSB7XG4gICAgICAgICAgICAgIGlmICgtLWV4dElkeCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIHRoZSBleHRlbnNpb24sIHNvIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91ciBwYXRoXG4gICAgICAgICAgICAgICAgLy8gY29tcG9uZW50XG4gICAgICAgICAgICAgICAgZW5kID0gaTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gRXh0ZW5zaW9uIGRvZXMgbm90IG1hdGNoLCBzbyBvdXIgcmVzdWx0IGlzIHRoZSBlbnRpcmUgcGF0aFxuICAgICAgICAgICAgICAvLyBjb21wb25lbnRcbiAgICAgICAgICAgICAgZXh0SWR4ID0gLTE7XG4gICAgICAgICAgICAgIGVuZCA9IGZpcnN0Tm9uU2xhc2hFbmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGFydCA9PT0gZW5kKSBlbmQgPSBmaXJzdE5vblNsYXNoRW5kO2Vsc2UgaWYgKGVuZCA9PT0gLTEpIGVuZCA9IHBhdGgubGVuZ3RoO1xuICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgaWYgKHBhdGguY2hhckNvZGVBdChpKSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcbiAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcbiAgICAgICAgICAvLyBwYXRoIGNvbXBvbmVudFxuICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgICAgIGVuZCA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlbmQgPT09IC0xKSByZXR1cm4gJyc7XG4gICAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9XG4gIH0sXG5cbiAgZXh0bmFtZTogZnVuY3Rpb24gZXh0bmFtZShwYXRoKSB7XG4gICAgYXNzZXJ0UGF0aChwYXRoKTtcbiAgICB2YXIgc3RhcnREb3QgPSAtMTtcbiAgICB2YXIgc3RhcnRQYXJ0ID0gMDtcbiAgICB2YXIgZW5kID0gLTE7XG4gICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XG4gICAgLy8gVHJhY2sgdGhlIHN0YXRlIG9mIGNoYXJhY3RlcnMgKGlmIGFueSkgd2Ugc2VlIGJlZm9yZSBvdXIgZmlyc3QgZG90IGFuZFxuICAgIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXG4gICAgdmFyIHByZURvdFN0YXRlID0gMDtcbiAgICBmb3IgKHZhciBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdmFyIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICBzdGFydFBhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxuICAgICAgICAvLyBleHRlbnNpb25cbiAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICAgIGVuZCA9IGkgKyAxO1xuICAgICAgfVxuICAgICAgaWYgKGNvZGUgPT09IDQ2IC8qLiovKSB7XG4gICAgICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXG4gICAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSlcbiAgICAgICAgICAgIHN0YXJ0RG90ID0gaTtcbiAgICAgICAgICBlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSlcbiAgICAgICAgICAgIHByZURvdFN0YXRlID0gMTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgYW5kIG5vbi1wYXRoIHNlcGFyYXRvciBiZWZvcmUgb3VyIGRvdCwgc28gd2Ugc2hvdWxkXG4gICAgICAgIC8vIGhhdmUgYSBnb29kIGNoYW5jZSBhdCBoYXZpbmcgYSBub24tZW1wdHkgZXh0ZW5zaW9uXG4gICAgICAgIHByZURvdFN0YXRlID0gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0RG90ID09PSAtMSB8fCBlbmQgPT09IC0xIHx8XG4gICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XG4gICAgICAgIHByZURvdFN0YXRlID09PSAwIHx8XG4gICAgICAgIC8vIFRoZSAocmlnaHQtbW9zdCkgdHJpbW1lZCBwYXRoIGNvbXBvbmVudCBpcyBleGFjdGx5ICcuLidcbiAgICAgICAgcHJlRG90U3RhdGUgPT09IDEgJiYgc3RhcnREb3QgPT09IGVuZCAtIDEgJiYgc3RhcnREb3QgPT09IHN0YXJ0UGFydCArIDEpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnREb3QsIGVuZCk7XG4gIH0sXG5cbiAgZm9ybWF0OiBmdW5jdGlvbiBmb3JtYXQocGF0aE9iamVjdCkge1xuICAgIGlmIChwYXRoT2JqZWN0ID09PSBudWxsIHx8IHR5cGVvZiBwYXRoT2JqZWN0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIFwicGF0aE9iamVjdFwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBwYXRoT2JqZWN0KTtcbiAgICB9XG4gICAgcmV0dXJuIF9mb3JtYXQoJy8nLCBwYXRoT2JqZWN0KTtcbiAgfSxcblxuICBwYXJzZTogZnVuY3Rpb24gcGFyc2UocGF0aCkge1xuICAgIGFzc2VydFBhdGgocGF0aCk7XG5cbiAgICB2YXIgcmV0ID0geyByb290OiAnJywgZGlyOiAnJywgYmFzZTogJycsIGV4dDogJycsIG5hbWU6ICcnIH07XG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gcmV0O1xuICAgIHZhciBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xuICAgIHZhciBpc0Fic29sdXRlID0gY29kZSA9PT0gNDcgLyovKi87XG4gICAgdmFyIHN0YXJ0O1xuICAgIGlmIChpc0Fic29sdXRlKSB7XG4gICAgICByZXQucm9vdCA9ICcvJztcbiAgICAgIHN0YXJ0ID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICB2YXIgc3RhcnREb3QgPSAtMTtcbiAgICB2YXIgc3RhcnRQYXJ0ID0gMDtcbiAgICB2YXIgZW5kID0gLTE7XG4gICAgdmFyIG1hdGNoZWRTbGFzaCA9IHRydWU7XG4gICAgdmFyIGkgPSBwYXRoLmxlbmd0aCAtIDE7XG5cbiAgICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXG4gICAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcbiAgICB2YXIgcHJlRG90U3RhdGUgPSAwO1xuXG4gICAgLy8gR2V0IG5vbi1kaXIgaW5mb1xuICAgIGZvciAoOyBpID49IHN0YXJ0OyAtLWkpIHtcbiAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoY29kZSA9PT0gNDcgLyovKi8pIHtcbiAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxuICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XG4gICAgICAgICAgICBzdGFydFBhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxuICAgICAgICAvLyBleHRlbnNpb25cbiAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICAgIGVuZCA9IGkgKyAxO1xuICAgICAgfVxuICAgICAgaWYgKGNvZGUgPT09IDQ2IC8qLiovKSB7XG4gICAgICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXG4gICAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSkgc3RhcnREb3QgPSBpO2Vsc2UgaWYgKHByZURvdFN0YXRlICE9PSAxKSBwcmVEb3RTdGF0ZSA9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XG4gICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgYW5kIG5vbi1wYXRoIHNlcGFyYXRvciBiZWZvcmUgb3VyIGRvdCwgc28gd2Ugc2hvdWxkXG4gICAgICAgIC8vIGhhdmUgYSBnb29kIGNoYW5jZSBhdCBoYXZpbmcgYSBub24tZW1wdHkgZXh0ZW5zaW9uXG4gICAgICAgIHByZURvdFN0YXRlID0gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0RG90ID09PSAtMSB8fCBlbmQgPT09IC0xIHx8XG4gICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBjaGFyYWN0ZXIgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBkb3RcbiAgICBwcmVEb3RTdGF0ZSA9PT0gMCB8fFxuICAgIC8vIFRoZSAocmlnaHQtbW9zdCkgdHJpbW1lZCBwYXRoIGNvbXBvbmVudCBpcyBleGFjdGx5ICcuLidcbiAgICBwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSkge1xuICAgICAgaWYgKGVuZCAhPT0gLTEpIHtcbiAgICAgICAgaWYgKHN0YXJ0UGFydCA9PT0gMCAmJiBpc0Fic29sdXRlKSByZXQuYmFzZSA9IHJldC5uYW1lID0gcGF0aC5zbGljZSgxLCBlbmQpO2Vsc2UgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBlbmQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3RhcnRQYXJ0ID09PSAwICYmIGlzQWJzb2x1dGUpIHtcbiAgICAgICAgcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKDEsIHN0YXJ0RG90KTtcbiAgICAgICAgcmV0LmJhc2UgPSBwYXRoLnNsaWNlKDEsIGVuZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXQubmFtZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBzdGFydERvdCk7XG4gICAgICAgIHJldC5iYXNlID0gcGF0aC5zbGljZShzdGFydFBhcnQsIGVuZCk7XG4gICAgICB9XG4gICAgICByZXQuZXh0ID0gcGF0aC5zbGljZShzdGFydERvdCwgZW5kKTtcbiAgICB9XG5cbiAgICBpZiAoc3RhcnRQYXJ0ID4gMCkgcmV0LmRpciA9IHBhdGguc2xpY2UoMCwgc3RhcnRQYXJ0IC0gMSk7ZWxzZSBpZiAoaXNBYnNvbHV0ZSkgcmV0LmRpciA9ICcvJztcblxuICAgIHJldHVybiByZXQ7XG4gIH0sXG5cbiAgc2VwOiAnLycsXG4gIGRlbGltaXRlcjogJzonLFxuICB3aW4zMjogbnVsbCxcbiAgcG9zaXg6IG51bGxcbn07XG5cbnBvc2l4LnBvc2l4ID0gcG9zaXg7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9zaXg7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgUHV6emxlLCBwYXJzZUZpbGUgfSBmcm9tICcuL1B1enpsZSc7XG5pbXBvcnQgeyBJbWFnZSwgY3JlYXRlQ2FudmFzLCBsb2FkSW1hZ2UgfSBmcm9tICdjYW52YXMnO1xuZXhwb3J0IHR5cGUgeyBDYW52YXMsIEltYWdlIH0gZnJvbSAnY2FudmFzJztcbmNvbnN0IEJPWF9TSVpFID0gMTY7XG5cbi8vIGNhdGVnb3JpY2FsIGNvbG9ycyBmcm9tXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZDMvZDMtc2NhbGUtY2hyb21hdGljL3RyZWUvdjIuMC4wI3NjaGVtZUNhdGVnb3J5MTBcbmNvbnN0IENPTE9SUzogQXJyYXk8c3RyaW5nPiA9IFtcbiAgICAnIzFmNzdiNCcsXG4gICAgJyNmZjdmMGUnLFxuICAgICcjMmNhMDJjJyxcbiAgICAnI2Q2MjcyOCcsXG4gICAgJyM5NDY3YmQnLFxuICAgICcjOGM1NjRiJyxcbiAgICAnI2UzNzdjMicsXG4gICAgJyM3ZjdmN2YnLFxuICAgICcjYmNiZDIyJyxcbiAgICAnIzE3YmVjZicsXG5dO1xuXG4vLyBzZW1pdHJhbnNwYXJlbnQgdmVyc2lvbnMgb2YgdGhvc2UgY29sb3JzXG5jb25zdCBCQUNLR1JPVU5EUyA9IENPTE9SUy5tYXAoIChjb2xvcikgPT4gY29sb3IgKyAnNjAnICk7XG5cbi8qKlxuICogRHJhdyBhIGJsYWNrIHNxdWFyZSBmaWxsZWQgd2l0aCBhIHJhbmRvbSBjb2xvci5cbiAqIFxuICogQHBhcmFtIGNhbnZhcyBjYW52YXMgdG8gZHJhdyBvblxuICogQHBhcmFtIHggeCBwb3NpdGlvbiBvZiBjZW50ZXIgb2YgYm94XG4gKiBAcGFyYW0geSB5IHBvc2l0aW9uIG9mIGNlbnRlciBvZiBib3hcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRyYXdCb3goY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgYXNzZXJ0KGNvbnRleHQgIT09IG51bGwsICd1bmFibGUgdG8gZ2V0IGNhbnZhcyBkcmF3aW5nIGNvbnRleHQnKTtcblxuICAgIC8vIHNhdmUgb3JpZ2luYWwgY29udGV4dCBzZXR0aW5ncyBiZWZvcmUgd2UgdHJhbnNsYXRlIGFuZCBjaGFuZ2UgY29sb3JzXG4gICAgY29udGV4dC5zYXZlKCk7XG5cbiAgICAvLyB0cmFuc2xhdGUgdGhlIGNvb3JkaW5hdGUgc3lzdGVtIG9mIHRoZSBkcmF3aW5nIGNvbnRleHQ6XG4gICAgLy8gICB0aGUgb3JpZ2luIG9mIGBjb250ZXh0YCB3aWxsIG5vdyBiZSAoeCx5KVxuICAgIGNvbnRleHQudHJhbnNsYXRlKHgsIHkpO1xuXG4gICAgLy8gZHJhdyB0aGUgb3V0ZXIgb3V0bGluZSBib3ggY2VudGVyZWQgb24gdGhlIG9yaWdpbiAod2hpY2ggaXMgbm93ICh4LHkpKVxuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMjtcbiAgICBjb250ZXh0LnN0cm9rZVJlY3QoLUJPWF9TSVpFLzIsIC1CT1hfU0laRS8yLCBCT1hfU0laRSwgQk9YX1NJWkUpO1xuXG4gICAgLy8gZmlsbCB3aXRoIGEgcmFuZG9tIHNlbWl0cmFuc3BhcmVudCBjb2xvclxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gQkFDS0dST1VORFNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogQkFDS0dST1VORFMubGVuZ3RoKV0gPz8gYXNzZXJ0LmZhaWwoKTtcbiAgICBjb250ZXh0LmZpbGxSZWN0KC1CT1hfU0laRS8yLCAtQk9YX1NJWkUvMiwgQk9YX1NJWkUsIEJPWF9TSVpFKTtcblxuICAgIC8vIHJlc2V0IHRoZSBvcmlnaW4gYW5kIHN0eWxlcyBiYWNrIHRvIGRlZmF1bHRzXG4gICAgY29udGV4dC5yZXN0b3JlKCk7XG59XG5cblxuLyoqXG4gKiBEcmF3IGEgMTB4MTAgZ3JpZCBvbiB0aGUgY2FudmFzLlxuICogXG4gKiBAcGFyYW0gY2FudmFzIGNhbnZhcyB0byBkcmF3IG9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkcmF3R3JpZChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBwdXp6bGU6IFB1enpsZSk6IHZvaWQge1xuICAgIGNvbnN0IHdpZHRoID0gY2FudmFzLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGFzc2VydChjb250ZXh0LCAndW5hYmxlIHRvIGdldCBjYW52YXMgZHJhd2luZyBjb250ZXh0Jyk7XG4gICAgY29uc3QgbnVtUm93cyA9IHB1enpsZS5yb3dzO1xuICAgIGNvbnN0IG51bUNvbHMgPSBwdXp6bGUuY29sdW1ucztcbiAgICBjb25zdCB4SW5jcmVtZW50ID0gaGVpZ2h0L251bVJvd3M7XG4gICAgY29uc3QgeUluY3JlbWVudCA9IHdpZHRoL251bUNvbHM7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgLy8gZHJhdyBib3ggb3V0bGluZVxuICAgIGNvbnRleHQubGluZVdpZHRoID0gMztcbiAgICBmb3IgKGNvbnN0IGRlc3Qgb2YgW3t4OiAwLCB5OiBoZWlnaHR9LCB7eDogd2lkdGgsIHk6IDB9XSkge1xuICAgICAgICBmb3IgKGNvbnN0IHN0YXJ0IG9mIFt7eDogMCwgeTogMH0sIHt4OiB3aWR0aCwgeTogaGVpZ2h0fV0pIHtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8oc3RhcnQueCwgc3RhcnQueSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKGRlc3QueCwgZGVzdC55KTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBkcmF3IGdyaWQgbGluZXNcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDAuNTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG51bUNvbHM7IGkrKykge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh4SW5jcmVtZW50KmksIDApO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh4SW5jcmVtZW50KmksIGhlaWdodCk7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbnVtUm93czsgaSsrKSB7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKDAsIHlJbmNyZW1lbnQqaSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHdpZHRoLCB5SW5jcmVtZW50KmkpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBEcmF3IHRoZSBwdXp6bGUgbGluZXMuXG4gKiBcbiAqIEBwYXJhbSBjYW52YXMgY2FudmFzIHRvIGRyYXcgb25cbiAqIEBwYXJhbSBsaW5lcyBhbiBhcnJheSBvZiBzdGFydCBhbmQgZW5kIHBvaW50cyBvZiBsaW5lc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZHJhd1B1enpsZShjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBwdXp6bGU6IFB1enpsZSk6IHZvaWQge1xuICAgIGNvbnN0IGJsb2NrTGluZXM6IEFycmF5PHtzdGFydDoge3g6IG51bWJlciwgeTogbnVtYmVyfSwgZW5kOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9fT4gPSBuZXcgQXJyYXkoKTtcbiAgICBjb25zdCBibG9ja3MgPSBwdXp6bGUuZ2V0UmVnaW9ucygpO1xuXG4gICAgZm9yKGNvbnN0IGJsb2NrIG9mIGJsb2Nrcykge1xuICAgICAgICBjb25zdCByb3dTdGFydHM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgICAgIGNvbnN0IHJvd0VuZHM6IE1hcDxudW1iZXIsIG51bWJlcj4gPSBuZXcgTWFwKCk7XG4gICAgICAgIGNvbnN0IGNvbFN0YXJ0czogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcbiAgICAgICAgY29uc3QgY29sRW5kczogTWFwPG51bWJlciwgbnVtYmVyPiA9IG5ldyBNYXAoKTtcblxuICAgICAgICBmb3IoY29uc3QgY29vcmQgb2YgYmxvY2spIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IGNvb3JkLnJvdztcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IGNvb3JkLmNvbHVtbjtcbiAgICAgICAgICAgIGlmKHJvd1N0YXJ0cy5oYXMocm93KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJDb2wgPSByb3dTdGFydHMuZ2V0KHJvdyk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGN1cnJDb2wpO1xuICAgICAgICAgICAgICAgIHJvd1N0YXJ0cy5zZXQocm93LCBNYXRoLm1pbihjdXJyQ29sLCBjb2wpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHJvd0VuZHMuaGFzKHJvdykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyQ29sID0gcm93RW5kcy5nZXQocm93KTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoY3VyckNvbCk7XG4gICAgICAgICAgICAgICAgcm93RW5kcy5zZXQocm93LCBNYXRoLm1heChjdXJyQ29sLCBjb2wpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGNvbFN0YXJ0cy5oYXMoY29sKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJSb3cgPSByb3dTdGFydHMuZ2V0KGNvbCk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGN1cnJSb3cpO1xuICAgICAgICAgICAgICAgIHJvd1N0YXJ0cy5zZXQoY29sLCBNYXRoLm1pbihjdXJyUm93LCByb3cpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGNvbEVuZHMuaGFzKGNvbCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyUm93ID0gcm93RW5kcy5nZXQocm93KTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoY3VyclJvdyk7XG4gICAgICAgICAgICAgICAgcm93RW5kcy5zZXQoY29sLCBNYXRoLm1heChjdXJyUm93LCByb3cpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IoY29uc3QgW3Jvdywgcm93U3RhcnRdIG9mIHJvd1N0YXJ0cykge1xuICAgICAgICAgICAgY29uc3Qgcm93RW5kID0gcm93RW5kcy5nZXQocm93KTtcbiAgICAgICAgICAgIGFzc2VydChyb3dFbmQgIT09IHVuZGVmaW5lZCwgJ3JvdyBtdXN0IGhhdmUgZW5kJyk7XG4gICAgICAgICAgICBibG9ja0xpbmVzLnB1c2goe3N0YXJ0OiB7eDogcm93LCB5OiByb3dTdGFydH0sIGVuZDoge3g6IHJvdywgeTogcm93RW5kfX0pO1xuICAgICAgICB9XG4gICAgICAgIGZvcihjb25zdCBbY29sLCBjb2xTdGFydF0gb2YgY29sU3RhcnRzKSB7XG4gICAgICAgICAgICBjb25zdCBjb2xFbmQgPSBjb2xFbmRzLmdldChjb2wpO1xuICAgICAgICAgICAgYXNzZXJ0KGNvbEVuZCAhPT0gdW5kZWZpbmVkLCAncm93IG11c3QgaGF2ZSBlbmQnKTtcbiAgICAgICAgICAgIGJsb2NrTGluZXMucHVzaCh7c3RhcnQ6IHt4OiBjb2xTdGFydCwgeTogY29sfSwgZW5kOiB7eDogY29sRW5kLCB5OmNvbH19KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHdpZHRoID0gY2FudmFzLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGFzc2VydChjb250ZXh0LCAndW5hYmxlIHRvIGdldCBjYW52YXMgZHJhd2luZyBjb250ZXh0Jyk7XG4gICAgY29uc3QgbnVtUm93cyA9IHB1enpsZS5yb3dzO1xuICAgIGNvbnN0IG51bUNvbHMgPSBwdXp6bGUuY29sdW1ucztcbiAgICBjb25zdCB4SW5jcmVtZW50ID0gaGVpZ2h0L251bVJvd3M7XG4gICAgY29uc3QgeUluY3JlbWVudCA9IHdpZHRoL251bUNvbHM7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAzO1xuICAgIGZvcihsZXQgaT0wOyBpPGJsb2NrTGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbGluZSA9IGJsb2NrTGluZXNbaV07XG4gICAgICAgIGFzc2VydChsaW5lKTtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8obGluZS5zdGFydC54KnhJbmNyZW1lbnQsIGxpbmUuc3RhcnQueSp5SW5jcmVtZW50KTtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBCQUNLR1JPVU5EU1tpXSA/PyBhc3NlcnQuZmFpbCgpO1xuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIHhJbmNyZW1lbnQsIHhJbmNyZW1lbnQpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhsaW5lLmVuZC54KnhJbmNyZW1lbnQsIGxpbmUuZW5kLnkqeUluY3JlbWVudCk7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgfVxufVxuXG4vKipcbiAqIERyYXcgc3RhcnMuXG4gKiBcbiAqIEBwYXJhbSBjYW52YXMgY2FudmFzIHRvIGRyYXcgb25cbiAqIEBwYXJhbSBzdGFyIChyb3csIGNvbHVtbikgb2Ygc3RhcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRyYXdTdGFyKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHB1enpsZTogUHV6emxlLCBzdGFyQ29vcmQ6IHtyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXJ9KTogdm9pZCB7XG4gICAgY29uc3Qgd2lkdGggPSBjYW52YXMud2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgYXNzZXJ0KGNvbnRleHQsICd1bmFibGUgdG8gZ2V0IGNhbnZhcyBkcmF3aW5nIGNvbnRleHQnKTtcbiAgICBjb25zdCBudW1Sb3dzID0gcHV6emxlLnJvd3M7XG4gICAgY29uc3QgbnVtQ29scyA9IHB1enpsZS5jb2x1bW5zO1xuICAgIGNvbnN0IHhJbmNyZW1lbnQgPSBoZWlnaHQvbnVtUm93cztcbiAgICBjb25zdCB5SW5jcmVtZW50ID0gd2lkdGgvbnVtQ29scztcbiAgICBjb25zdCBzdGFyT2Zmc2V0ID0gMC41O1xuXG4gICAgY29uc3QgZm9udCA9ICc5NnB0IGJvbGQnO1xuXG4gICAgLy8gbWFrZSBhIHRpbnkgMXgxIGltYWdlIGF0IGZpcnN0IHNvIHRoYXQgd2UgY2FuIGdldCBhIEdyYXBoaWNzIG9iamVjdCwgXG4gICAgLy8gd2hpY2ggd2UgbmVlZCB0byBjb21wdXRlIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSB0ZXh0XG4gICAgY29uc3QgbWVhc3VyaW5nQ29udGV4dCA9IGNyZWF0ZUNhbnZhcygxLCAxKS5nZXRDb250ZXh0KCcyZCcpO1xuICAgIG1lYXN1cmluZ0NvbnRleHQuZm9udCA9IGZvbnQ7XG4gICAgY29uc3QgZm9udE1ldHJpY3MgPSBtZWFzdXJpbmdDb250ZXh0Lm1lYXN1cmVUZXh0KCfirZDvuI8nKTtcbiAgICAvLyBjb25zb2xlLmxvZygnbWV0cmljcycsIGZvbnRNZXRyaWNzKTtcblxuICAgIC8vIG5vdyBtYWtlIGEgY2FudmFzIHNpemVkIHRvIGZpdCB0aGUgdGV4dFxuICAgIC8vIHNhdmUgb3JpZ2luYWwgY29udGV4dCBzZXR0aW5ncyBiZWZvcmUgd2UgdHJhbnNsYXRlIGFuZCBjaGFuZ2UgY29sb3JzXG4gICAgY29udGV4dC5zYXZlKCk7XG5cbiAgICAvLyB0cmFuc2xhdGUgdGhlIGNvb3JkaW5hdGUgc3lzdGVtIG9mIHRoZSBkcmF3aW5nIGNvbnRleHQ6XG4gICAgLy8gICB0aGUgb3JpZ2luIG9mIGBjb250ZXh0YCB3aWxsIG5vdyBiZSAoeCx5KVxuICAgIGNvbnRleHQudHJhbnNsYXRlKChzdGFyQ29vcmQuY29sdW1uLXN0YXJPZmZzZXQpKnhJbmNyZW1lbnQsIChzdGFyQ29vcmQucm93LXN0YXJPZmZzZXQpKnlJbmNyZW1lbnQpO1xuXG4gICAgY29udGV4dC5mb250ID0gZm9udDtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgY29udGV4dC5maWxsVGV4dCgn4q2Q77iPJywgMCwgZm9udE1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hBc2NlbnQpO1xuXG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgY29udGV4dC5zdHJva2VUZXh0KCfirZDvuI8nLCAwLCBmb250TWV0cmljcy5hY3R1YWxCb3VuZGluZ0JveEFzY2VudCk7XG5cbiAgICAvLyByZXRvcmUgdG8gKDAsIDApXG4gICAgY29udGV4dC5yZXN0b3JlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVTdGFyKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHB1enpsZTogUHV6emxlLCBzdGFyQ29vcmQ6IHtyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXJ9KTogdm9pZCB7XG4gICAgY29uc3Qgd2lkdGggPSBjYW52YXMud2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgYXNzZXJ0KGNvbnRleHQsICd1bmFibGUgdG8gZ2V0IGNhbnZhcyBkcmF3aW5nIGNvbnRleHQnKTtcbiAgICBjb25zdCBudW1Sb3dzID0gcHV6emxlLnJvd3M7XG4gICAgY29uc3QgbnVtQ29scyA9IHB1enpsZS5jb2x1bW5zO1xuICAgIGNvbnN0IHhJbmNyZW1lbnQgPSBoZWlnaHQvbnVtUm93cztcbiAgICBjb25zdCB5SW5jcmVtZW50ID0gd2lkdGgvbnVtQ29scztcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDM7XG4gICAgY29uc3Qgc3Rhck9mZnNldCA9IDAuNTtcblxuICAgIGNvbnN0IHBpeGVsRnJvbUNlbGw6IFVpbnQ4Q2xhbXBlZEFycmF5ICA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKChzdGFyQ29vcmQuY29sdW1uLXN0YXJPZmZzZXQpKnhJbmNyZW1lbnQsIChzdGFyQ29vcmQucm93LXN0YXJPZmZzZXQpKnlJbmNyZW1lbnQsIDEsIDEpLmRhdGE7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyYXdCbG9jayhjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBwdXp6bGU6IFB1enpsZSwgc3RhckNvb3JkOiB7cm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyfSk6IHZvaWQge1xuICAgIGNvbnN0IHdpZHRoID0gY2FudmFzLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGFzc2VydChjb250ZXh0LCAndW5hYmxlIHRvIGdldCBjYW52YXMgZHJhd2luZyBjb250ZXh0Jyk7XG4gICAgY29uc3QgbnVtUm93cyA9IHB1enpsZS5yb3dzO1xuICAgIGNvbnN0IG51bUNvbHMgPSBwdXp6bGUuY29sdW1ucztcbiAgICBjb25zdCB4SW5jcmVtZW50ID0gaGVpZ2h0L251bVJvd3M7XG4gICAgY29uc3QgeUluY3JlbWVudCA9IHdpZHRoL251bUNvbHM7XG4gICAgY29uc3QgYmxvY2tPZmZzZXQgPSAwLjU7XG5cbiAgICBjb25zdCBmb250ID0gJzk2cHQgYm9sZCc7XG5cbiAgICAvLyBtYWtlIGEgdGlueSAxeDEgaW1hZ2UgYXQgZmlyc3Qgc28gdGhhdCB3ZSBjYW4gZ2V0IGEgR3JhcGhpY3Mgb2JqZWN0LCBcbiAgICAvLyB3aGljaCB3ZSBuZWVkIHRvIGNvbXB1dGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHRleHRcbiAgICBjb25zdCBtZWFzdXJpbmdDb250ZXh0ID0gY3JlYXRlQ2FudmFzKDEsIDEpLmdldENvbnRleHQoJzJkJyk7XG4gICAgbWVhc3VyaW5nQ29udGV4dC5mb250ID0gZm9udDtcbiAgICBjb25zdCBmb250TWV0cmljcyA9IG1lYXN1cmluZ0NvbnRleHQubWVhc3VyZVRleHQoJ/CfmqsnKTtcbiAgICAvLyBjb25zb2xlLmxvZygnbWV0cmljcycsIGZvbnRNZXRyaWNzKTtcblxuICAgIC8vIG5vdyBtYWtlIGEgY2FudmFzIHNpemVkIHRvIGZpdCB0aGUgdGV4dFxuICAgIC8vIHNhdmUgb3JpZ2luYWwgY29udGV4dCBzZXR0aW5ncyBiZWZvcmUgd2UgdHJhbnNsYXRlIGFuZCBjaGFuZ2UgY29sb3JzXG4gICAgY29udGV4dC5zYXZlKCk7XG5cbiAgICAvLyB0cmFuc2xhdGUgdGhlIGNvb3JkaW5hdGUgc3lzdGVtIG9mIHRoZSBkcmF3aW5nIGNvbnRleHQ6XG4gICAgLy8gICB0aGUgb3JpZ2luIG9mIGBjb250ZXh0YCB3aWxsIG5vdyBiZSAoeCx5KVxuICAgIGNvbnRleHQudHJhbnNsYXRlKChzdGFyQ29vcmQuY29sdW1uLWJsb2NrT2Zmc2V0KSp4SW5jcmVtZW50LCAoc3RhckNvb3JkLnJvdy1ibG9ja09mZnNldCkqeUluY3JlbWVudCk7XG5cbiAgICBjb250ZXh0LmZvbnQgPSBmb250O1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICBjb250ZXh0LmZpbGxUZXh0KCfwn5qrJywgMCwgZm9udE1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hBc2NlbnQpO1xuXG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgY29udGV4dC5zdHJva2VUZXh0KCfwn5qrJywgMCwgZm9udE1ldHJpY3MuYWN0dWFsQm91bmRpbmdCb3hBc2NlbnQpO1xuXG4gICAgLy8gcmV0b3JlIHRvICgwLCAwKVxuICAgIGNvbnRleHQucmVzdG9yZSgpO1xufVxuXG4vKipcbiAqIFNldCB1cCB0aGUgbWFpbiBwYWdlLlxuICovXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQgPz8gYXNzZXJ0LmZhaWwoJ21pc3NpbmcgZHJhd2luZyBjYW52YXMnKTtcbiAgICBjb25zdCBwdXp6bGU6IFB1enpsZSA9IGF3YWl0IHBhcnNlRmlsZSgnLi4vcHV6emxlcy9rZC0xLTEtMS5zdGFyYicpO1xuICAgIGRyYXdHcmlkKGNhbnZhcywgcHV6emxlKTtcbiAgICBkcmF3UHV6emxlKGNhbnZhcywgcHV6emxlKTtcblxufVxuXG5tYWluKCk7XG4iLCIvKiBDb3B5cmlnaHQgKGMpIDIwMjEtMjMgTUlUIDYuMTAyLzYuMDMxIGNvdXJzZSBzdGFmZiwgYWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFJlZGlzdHJpYnV0aW9uIG9mIG9yaWdpbmFsIG9yIGRlcml2ZWQgd29yayByZXF1aXJlcyBwZXJtaXNzaW9uIG9mIGNvdXJzZSBzdGFmZi5cbiAqL1xuXG4vLyBUaGlzIGNvZGUgaXMgbG9hZGVkIGludG8gZXhhbXBsZS1wYWdlLmh0bWwsIHNlZSB0aGUgYG5wbSB3YXRjaGlmeS1leGFtcGxlYCBzY3JpcHQuXG4vLyBSZW1lbWJlciB0aGF0IHlvdSB3aWxsICpub3QqIGJlIGFibGUgdG8gdXNlIE5vZGUgQVBJcyBsaWtlIGBmc2AgaW4gdGhlIHdlYiBicm93c2VyLlxuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBQdXp6bGUsIHBhcnNlRmlsZX0gZnJvbSAnLi9QdXp6bGUnO1xuaW1wb3J0IHsgZHJhd0Jsb2NrLCBkcmF3R3JpZCwgZHJhd1B1enpsZSwgZHJhd1N0YXIgfSBmcm9tICcuL0RyYXdpbmcnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuY29uc3QgQk9YX1NJWkUgPSAxNjtcblxuLy8gY2F0ZWdvcmljYWwgY29sb3JzIGZyb21cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kMy9kMy1zY2FsZS1jaHJvbWF0aWMvdHJlZS92Mi4wLjAjc2NoZW1lQ2F0ZWdvcnkxMFxuY29uc3QgQ09MT1JTOiBBcnJheTxzdHJpbmc+ID0gW1xuICAgICcjMWY3N2I0JyxcbiAgICAnI2ZmN2YwZScsXG4gICAgJyMyY2EwMmMnLFxuICAgICcjZDYyNzI4JyxcbiAgICAnIzk0NjdiZCcsXG4gICAgJyM4YzU2NGInLFxuICAgICcjZTM3N2MyJyxcbiAgICAnIzdmN2Y3ZicsXG4gICAgJyNiY2JkMjInLFxuICAgICcjMTdiZWNmJyxcbl07XG5cbi8vIHNlbWl0cmFuc3BhcmVudCB2ZXJzaW9ucyBvZiB0aG9zZSBjb2xvcnNcbmNvbnN0IEJBQ0tHUk9VTkRTID0gQ09MT1JTLm1hcCggKGNvbG9yKSA9PiBjb2xvciArICc2MCcgKTtcblxuLyoqXG4gKiBEcmF3IGEgYmxhY2sgc3F1YXJlIGZpbGxlZCB3aXRoIGEgcmFuZG9tIGNvbG9yLlxuICogXG4gKiBAcGFyYW0gY2FudmFzIGNhbnZhcyB0byBkcmF3IG9uXG4gKiBAcGFyYW0geCB4IHBvc2l0aW9uIG9mIGNlbnRlciBvZiBib3hcbiAqIEBwYXJhbSB5IHkgcG9zaXRpb24gb2YgY2VudGVyIG9mIGJveFxuICovXG5mdW5jdGlvbiBkcmF3Qm94KGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHg6IG51bWJlciwgeTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGFzc2VydChjb250ZXh0LCAndW5hYmxlIHRvIGdldCBjYW52YXMgZHJhd2luZyBjb250ZXh0Jyk7XG5cbiAgICAvLyBzYXZlIG9yaWdpbmFsIGNvbnRleHQgc2V0dGluZ3MgYmVmb3JlIHdlIHRyYW5zbGF0ZSBhbmQgY2hhbmdlIGNvbG9yc1xuICAgIGNvbnRleHQuc2F2ZSgpO1xuXG4gICAgLy8gdHJhbnNsYXRlIHRoZSBjb29yZGluYXRlIHN5c3RlbSBvZiB0aGUgZHJhd2luZyBjb250ZXh0OlxuICAgIC8vICAgdGhlIG9yaWdpbiBvZiBgY29udGV4dGAgd2lsbCBub3cgYmUgKHgseSlcbiAgICBjb250ZXh0LnRyYW5zbGF0ZSh4LCB5KTtcblxuICAgIC8vIGRyYXcgdGhlIG91dGVyIG91dGxpbmUgYm94IGNlbnRlcmVkIG9uIHRoZSBvcmlnaW4gKHdoaWNoIGlzIG5vdyAoeCx5KSlcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDI7XG4gICAgY29udGV4dC5zdHJva2VSZWN0KC1CT1hfU0laRS8yLCAtQk9YX1NJWkUvMiwgQk9YX1NJWkUsIEJPWF9TSVpFKTtcblxuICAgIC8vIGZpbGwgd2l0aCBhIHJhbmRvbSBzZW1pdHJhbnNwYXJlbnQgY29sb3JcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IEJBQ0tHUk9VTkRTW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEJBQ0tHUk9VTkRTLmxlbmd0aCldID8/IGFzc2VydC5mYWlsKCk7XG4gICAgY29udGV4dC5maWxsUmVjdCgtQk9YX1NJWkUvMiwgLUJPWF9TSVpFLzIsIEJPWF9TSVpFLCBCT1hfU0laRSk7XG5cbiAgICAvLyByZXNldCB0aGUgb3JpZ2luIGFuZCBzdHlsZXMgYmFjayB0byBkZWZhdWx0c1xuICAgIGNvbnRleHQucmVzdG9yZSgpO1xufVxuXG4vKipcbiAqIFByaW50IGEgbWVzc2FnZSBieSBhcHBlbmRpbmcgaXQgdG8gYW4gSFRNTCBlbGVtZW50LlxuICogXG4gKiBAcGFyYW0gb3V0cHV0QXJlYSBIVE1MIGVsZW1lbnQgdGhhdCBzaG91bGQgZGlzcGxheSB0aGUgbWVzc2FnZVxuICogQHBhcmFtIG1lc3NhZ2UgbWVzc2FnZSB0byBkaXNwbGF5XG4gKi9cbmZ1bmN0aW9uIHByaW50T3V0cHV0KG91dHB1dEFyZWE6IEhUTUxFbGVtZW50LCBtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBhcHBlbmQgdGhlIG1lc3NhZ2UgdG8gdGhlIG91dHB1dCBhcmVhXG4gICAgb3V0cHV0QXJlYS5pbm5lclRleHQgKz0gbWVzc2FnZSArICdcXG4nO1xuXG4gICAgLy8gc2Nyb2xsIHRoZSBvdXRwdXQgYXJlYSBzbyB0aGF0IHdoYXQgd2UganVzdCBwcmludGVkIGlzIHZpc2libGVcbiAgICBvdXRwdXRBcmVhLnNjcm9sbFRvcCA9IG91dHB1dEFyZWEuc2Nyb2xsSGVpZ2h0O1xufVxuXG4vKipcbiAqIFNldCB1cCB0aGUgZXhhbXBsZSBwYWdlLlxuICovXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIFxuICAgIC8vIG91dHB1dCBhcmVhIGZvciBwcmludGluZ1xuICAgIGNvbnN0IG91dHB1dEFyZWE6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHB1dEFyZWEnKSA/PyBhc3NlcnQuZmFpbCgnbWlzc2luZyBvdXRwdXQgYXJlYScpO1xuICAgIC8vIGNhbnZhcyBmb3IgZHJhd2luZ1xuICAgIGNvbnN0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykgYXMgSFRNTENhbnZhc0VsZW1lbnQgPz8gYXNzZXJ0LmZhaWwoJ21pc3NpbmcgZHJhd2luZyBjYW52YXMnKTtcbiAgICBcbiAgICAvLyB3aGVuIHRoZSB1c2VyIGNsaWNrcyBvbiB0aGUgZHJhd2luZyBjYW52YXMuLi5cbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZHJhd0JveChjYW52YXMsIGV2ZW50Lm9mZnNldFgsIGV2ZW50Lm9mZnNldFkpO1xuICAgIH0pO1xuXG4gICAgLy8gYWRkIGluaXRpYWwgaW5zdHJ1Y3Rpb25zIHRvIHRoZSBvdXRwdXQgYXJlYVxuXG4gICAgcHJpbnRPdXRwdXQob3V0cHV0QXJlYSwgYENsaWNrIGluIHRoZSBjYW52YXMgYWJvdmUgdG8gZHJhdyBhIGJveCBjZW50ZXJlZCBhdCB0aGF0IHBvaW50YCk7XG5cbiAgICBjb25zdCBwdXp6bGU6IFB1enpsZSA9IGF3YWl0IHBhcnNlRmlsZSgncHV6emxlcy9rZC0xLTEtMS5zdGFyYicpO1xuICAgIGRyYXdHcmlkKGNhbnZhcywgcHV6emxlKTtcbiAgICBkcmF3UHV6emxlKGNhbnZhcywgcHV6emxlKTtcblxuXG59XG5cbm1haW4oKTtcblxuXG4iLCJpbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBwYXJzZVB1enpsZSB9IGZyb20gJy4vUHV6emxlUGFyc2VyJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmV4cG9ydCBlbnVtIENlbGxTdGF0ZXMge1xuICAgIEVtcHR5LCBTdGFyLCBCbG9ja2VkXG59XG5cbi8qKlxuICogQURUIGZvciBhIFN0YXIgQmF0dGxlIHB1enpsZSBib2FyZFxuICovXG5leHBvcnQgY2xhc3MgUHV6emxlIHsgICAgXG4gICAgLy8gQWJzdHJhY3Rpb24gZnVuY3Rpb246XG4gICAgLy8gICBBRihyb3dzLCBjb2x1bW5zLCByZWdpb25zLCBzcXVhcmVzKTogYSBTdGFyIEJhdHRsZSBib2FyZCB3aXRoIGRpbWVuc2lvbnMgYHJvd3NgIGJ5IGBjb2x1bW5zYCwgd2l0aCBgcmVnaW9uc2AgcmVwcmVzZW50aW5nIGFsbCB0aGUgY2VsbHMgaW4gZWFjaCByZWdpb24gb2YgdGhlIGJvYXJkIGFuZCBgc3F1YXJlc2AgcmVwcmVzZW50aW5nIHRoZSBjZWxsIHN0YXRlIG9mIGV2ZXJ5IGNlbGwgb24gdGhlIGJvYXJkIChlbXB0eSwgc3Rhciwgb3IgYmxvY2tlZCkuXG4gICAgLy8gUmVwcmVzZW50YXRpb24gaW52YXJpYW50OlxuICAgIC8vICAgLSBgcm93c2AgYW5kIGBjb2x1bW5zYCBhbmQgc2l6ZSBvZiBgcmVnaW9uc2AgPT09IDEwXG4gICAgLy8gICAtIHRvdGFsIG51bWJlciBvZiBjZWxscyBhY3Jvc3MgYHJlZ2lvbnNgID09PSAxMDBcbiAgICAvLyAgIC0gZWFjaCBjb29yZGluYXRlIG9mIGEgY2VsbCBpbiBgcmVnaW9uc2AgaXMgMS1pbmRleGVkIGJldHdlZW4gMSBhbmQgMTAgaW5jbHVzaXZlXG4gICAgLy8gU2FmZXR5IGZyb20gcmVwIGV4cG9zdXJlOlxuICAgIC8vICAgLSBgcm93c2AgYW5kIGBjb2x1bW5zYCBhcmUgcmVhZG9ubHkgYW5kIGltbXV0YWJsZVxuICAgIC8vICAgLSBgc3F1YXJlc2AgYW5kIGByZWdpb25zYCBhcmUgcHJpdmF0ZSBhbmQgcmVhZG9ubHlcbiAgICAvLyAgIC0gYHNxdWFyZXNgIGFuZCBgcmVnaW9uc2Agd2lsbCBuZXZlciBiZSBkaXJlY3RseSByZXR1cm5lZCBmcm9tIGluc3RhbmNlIG1ldGhvZHNcbiAgICAvLyAgIC0gY29uc3RydWN0b3IgbWFrZXMgYSBkZWZlbnNpdmUgY29weSBvZiBgcmVnaW9uc2BcbiAgICBcbiAgICBwdWJsaWMgcmVhZG9ubHkgcm93czogbnVtYmVyO1xuICAgIHB1YmxpYyByZWFkb25seSBjb2x1bW5zOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHNxdWFyZXM6IEFycmF5PENlbGxTdGF0ZXM+O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVnaW9uczogTWFwPG51bWJlciwgQXJyYXk8W251bWJlciwgbnVtYmVyXT4+O1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHJlZ2lvbnMgdGhlIG1hcCBjb250YWluaW5nIHRoZSBjb29yZGluYXRlcyBvZiBhbGwgdGhlIGNlbGxzIGluIHRoZSAxMCByZWdpb25zIG9mIHRoZSBwdXp6bGVcbiAgICAgKiBAdGhyb3dzIGVycm9yIGlmIGFueSBvZiB0aGUgcmVwIGludmFyaWFudHMgYXJlIHZpb2xhdGVkXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgICAgICByZWdpb25zOiBNYXA8bnVtYmVyLCBBcnJheTxbbnVtYmVyLCBudW1iZXJdPj4sXG4gICAgKSB7XG4gICAgICAgIHRoaXMucm93cyA9IDEwO1xuICAgICAgICB0aGlzLmNvbHVtbnMgPSAxMDtcblxuICAgICAgICB0aGlzLnNxdWFyZXMgPSBuZXcgQXJyYXk8Q2VsbFN0YXRlcz4odGhpcy5yb3dzKnRoaXMuY29sdW1ucyk7XG4gICAgICAgIHRoaXMucmVnaW9ucyA9IG5ldyBNYXA8bnVtYmVyLCBBcnJheTxbbnVtYmVyLCBudW1iZXJdPj4oKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucm93cyp0aGlzLmNvbHVtbnM7ICsraSkge1xuICAgICAgICAgICAgdGhpcy5zcXVhcmVzW2ldID0gQ2VsbFN0YXRlcy5FbXB0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHJlZ2lvbnMua2V5cygpKSB7XG4gICAgICAgICAgICB0aGlzLnJlZ2lvbnMuc2V0KGtleSwgKHJlZ2lvbnMuZ2V0KGtleSkgPz8gYXNzZXJ0LmZhaWwoKSkubWFwKGxpc3QgPT4gW2xpc3RbMF0sIGxpc3RbMV1dKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoZWNrUmVwKCk7XG4gICAgfVxuXG4gICAgLy8gQXNzZXJ0cyB0aGUgcmVwIGludmFyaWFudFxuICAgIHByaXZhdGUgY2hlY2tSZXAoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGRpbWVuc2lvbiA9IDEwO1xuICAgICAgICBhc3NlcnQodGhpcy5yb3dzID09PSBkaW1lbnNpb24sIFwibnVtYmVyIG9mIHJvd3MgbXVzdCBiZSAxMFwiKTtcbiAgICAgICAgYXNzZXJ0KHRoaXMuY29sdW1ucyA9PT0gZGltZW5zaW9uLCBcIm51bWJlciBvZiBjb2x1bW5zIG11c3QgYmUgMTBcIik7XG4gICAgICAgIGFzc2VydCh0aGlzLnJlZ2lvbnMuc2l6ZSA9PT0gZGltZW5zaW9uLCBcIm51bWJlciBvZiByZWdpb25zIG11c3QgYmUgMTBcIik7XG4gICAgICAgIGxldCB0b3RhbENlbGxzID0gMDtcbiAgICAgICAgZm9yIChjb25zdCByZWdpb24gb2YgdGhpcy5yZWdpb25zLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2YgcmVnaW9uKSB7XG4gICAgICAgICAgICAgICAgdG90YWxDZWxscyArPSAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IGNlbGxbMF0gPz8gYXNzZXJ0LmZhaWwoXCJjZWxsIGlzIG1pc3Npbmcgcm93IHZhbHVlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbiA9IGNlbGxbMV0gPz8gYXNzZXJ0LmZhaWwoXCJjZWxsIGlzIG1pc3Npbmcgcm93IHZhbHVlXCIpO1xuICAgICAgICAgICAgICAgIGFzc2VydChyb3cgPj0gMSAmJiByb3cgPD0gZGltZW5zaW9uLCBcImNvb3JkaW5hdGVzIG11c3QgYmUgMS1pbmRleGVkIGFuZCBiZSBiZXR3ZWVuIDEgYW5kIDEwXCIpO1xuICAgICAgICAgICAgICAgIGFzc2VydChjb2x1bW4gPj0gMSAmJiByb3cgPD0gZGltZW5zaW9uLCBcImNvb3JkaW5hdGVzIG11c3QgYmUgMS1pbmRleGVkIGFuZCBiZSBiZXR3ZWVuIDEgYW5kIDEwXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFzc2VydCh0b3RhbENlbGxzID09PSBkaW1lbnNpb24qZGltZW5zaW9uLCBcIm11c3QgaGF2ZSB0b3RhbCBvZiAxMDAgY2VsbHMgb3ZlciBhbGwgcmVnaW9uc1wiKTtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgICogR2V0dGVyIGZ1bmN0aW9uIGZvciB0aGlzLnJlZ2lvbnNcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBcnJheTxBcnJheTx7cm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyfT4+IGFycmF5IG9mIGFsbCB0aGUgcmVnaW9uc1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRSZWdpb25zKCk6IEFycmF5PEFycmF5PHtyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXJ9Pj4ge1xuICAgICAgICBjb25zdCByZWdpb25zID0gW107XG4gICAgICAgIGZvcihjb25zdCBba2V5LCByZWdpb25dIG9mIHRoaXMucmVnaW9ucykge1xuICAgICAgICAgICAgY29uc3QgcmVnaW9uQ29vcmRzID0gW107XG4gICAgICAgICAgICBmb3IoY29uc3QgY29vcmQgb2YgcmVnaW9uKSB7XG4gICAgICAgICAgICAgICAgcmVnaW9uQ29vcmRzLnB1c2goe3JvdzogY29vcmRbMF0sIGNvbHVtbjogY29vcmRbMV19KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlZ2lvbnMucHVzaChyZWdpb25Db29yZHMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWdpb25zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE11dGF0ZXMgcHV6emxlIGJ5IHJlbW92aW5nIGFsbCBzdGFyc1xuICAgICAqIFxuICAgICAqL1xuXG4gICAgcHVibGljIGVtcHR5UHV6emxlKCk6IHZvaWQge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucm93cyp0aGlzLmNvbHVtbnM7ICsraSkge1xuICAgICAgICAgICAgdGhpcy5zcXVhcmVzW2ldID0gQ2VsbFN0YXRlcy5FbXB0eTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBlYWNoIHJlZ2lvbiBvZiB0aGUgcHV6emxlIGhhcyBleGFjdGx5IHRoZSBuZWVkZWQgbnVtYmVyIG9mIHN0YXJzLCBhbmQgbm8gc3RhcnMgYXJlIFxuICAgICAqIHZlcnRpY2FsbHksIGhvcml6b250YWxseSwgb3IgZGlhZ29uYWxseSBhZGphY2VudC5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSBwdXp6bGUgaXMgc29sdmVkOyBmYWxzZSBvdGhlcndpc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgaXNTb2x2ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIENoZWNrIHRoYXQgZWFjaCByb3cgaGFzIHRoZSBudW1iZXIgb2Ygc3RhcnMgbmVlZGVkXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5yb3dzOyArK2kpIHtcbiAgICAgICAgICAgIGxldCB0b3RhbFN0YXJzID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5jb2x1bW5zOyArK2opIHtcbiAgICAgICAgICAgICAgICB0b3RhbFN0YXJzICs9IHRoaXMuc3F1YXJlc1t0aGlzLmNvbHVtbnMqaSArIGpdID09PSBDZWxsU3RhdGVzLlN0YXIgPyAxIDogMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRvdGFsU3RhcnMgIT09IDIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2hlY2sgdGhhdCBlYWNoIGNvbHVtbiBoYXMgdGhlIG51bWJlciBvZiBzdGFycyBuZWVkZWRcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmNvbHVtbnM7ICsraikge1xuICAgICAgICAgICAgbGV0IHRvdGFsU3RhcnMgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJvd3M7ICsraSkge1xuICAgICAgICAgICAgICAgIHRvdGFsU3RhcnMgKz0gdGhpcy5zcXVhcmVzW3RoaXMuY29sdW1ucyppICsgal0gPT09IENlbGxTdGF0ZXMuU3RhciA/IDEgOiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodG90YWxTdGFycyAhPT0gMikgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhhdCBlYWNoIHJlZ2lvbiBoYXMgdGhlIG51bWJlciBvZiBzdGFycyBuZWVkZWRcbiAgICAgICAgZm9yIChjb25zdCByZWdpb24gb2YgdGhpcy5yZWdpb25zLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBsZXQgdG90YWxTdGFycyA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtyb3csIGNvbHVtbl0gb2YgcmVnaW9uKSB7XG4gICAgICAgICAgICAgICAgdG90YWxTdGFycyArPSB0aGlzLnNxdWFyZXNbdGhpcy5jb2x1bW5zKihyb3ctMSkgKyAoY29sdW1uLTEpXSA9PT0gQ2VsbFN0YXRlcy5TdGFyID8gMSA6IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0b3RhbFN0YXJzICE9PSAyKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayB0aGF0IG5vIHR3byBzdGFycyBhcmUgYWRqYWNlbnRcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJvd3M7ICsraSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmNvbHVtbnM7ICsraikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNxdWFyZXNbdGhpcy5jb2x1bW5zKmkgKyBqXSA9PT0gQ2VsbFN0YXRlcy5TdGFyICYmdGhpcy5zdGFyQWRqYWNlbnQoW2krMSwgaisxXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhbnkgb2YgdGhlIGFkamFjZW50IGdyaWQgc3F1YXJlcyBjb250YWlucyBhIHN0YXJcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcG9zaXRpb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBjZWxsIG9mIHdoaWNoIHlvdSB3YW50IHRvIGNoZWNrIGFkamFjZW50XG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGVyZSBpcyBhbiBhZGphY2VudCBzdGFyOyBmYWxzZSBvdGhlcndpc2VcbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXJBZGphY2VudChwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBbcm93LCBjb2x1bW5dID0gcG9zaXRpb247XG4gICAgICAgIGNvbnN0IGRlbHRhcyA9IFstMSwgMCwgMV07XG5cbiAgICAgICAgZm9yIChjb25zdCBkZWx0YVJvdyBvZiBkZWx0YXMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGVsdGFDb2x1bW4gb2YgZGVsdGFzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2VsbFJvdyA9IHJvdyArIGRlbHRhUm93O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGxDb2x1bW4gPSBjb2x1bW4gKyBkZWx0YUNvbHVtbjtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIChkZWx0YVJvdyA9PT0gMCAmJiBkZWx0YUNvbHVtbiA9PT0gMCkgfHwgXG4gICAgICAgICAgICAgICAgICAgIChjZWxsUm93IDwgMSB8fCBjZWxsUm93ID4gdGhpcy5yb3dzKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgKGNlbGxDb2x1bW4gPCAxIHx8IGNlbGxDb2x1bW4gPiB0aGlzLmNvbHVtbnMpXG4gICAgICAgICAgICAgICAgKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3F1YXJlc1t0aGlzLmNvbHVtbnMqKGNlbGxSb3ctMSkgKyAoY2VsbENvbHVtbi0xKV0gPT09IENlbGxTdGF0ZXMuU3Rhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2VsbFJvdywgY2VsbENvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEN5Y2xlIGEgZ3JpZCBzcXVhcmUgYmV0d2VlbiBlbXB0eSwgc3RhcnJlZCwgYW5kIGJsb2NrZWQsIGluIHRoYXQgb3JkZXIuXG4gICAgICogXG4gICAgICogQHBhcmFtIHBvc2l0aW9uIHRoZSBwb3NpdGlvbiBvbiB0aGUgZ3JpZCB0byBiZSBjeWNsZVxuICAgICAqIEByZXR1cm5zIHRoZSB1cGRhdGVkIHN0YXRlIG9mIHRoZSBncmlkIHNxdWFyZVxuICAgICAqIEB0aHJvd3MgRXJyb3IgaWYgeCBhbmQgeSBhcmUgbm90IHZhbGlkIGNvb3JkaW5hdGVzIG9mIHRoZSBwdXp6bGUgYm9hcmQuXG4gICAgICovICBcbiAgICBwdWJsaWMgY3ljbGVTcXVhcmUocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiBDZWxsU3RhdGVzIHtcbiAgICAgICAgY29uc3QgW3JvdywgY29sdW1uXSA9IHBvc2l0aW9uO1xuICAgICAgICBpZiAocm93IDwgMSB8fCByb3cgPiB0aGlzLnJvd3MgfHwgY29sdW1uIDwgMSB8fCBjb2x1bW4gPiB0aGlzLmNvbHVtbnMpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBwbGFjZSBhIHN0YXIgYXQgYW4gaW52YWxpZCBncmlkIHBvc2l0aW9uXCIpO1xuXG5cbiAgICAgICAgY29uc3Qgc3RhdHVzID0gdGhpcy5zcXVhcmVzW3RoaXMuY29sdW1ucyoocm93LTEpICsgKGNvbHVtbi0xKV07XG4gICAgICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlIENlbGxTdGF0ZXMuRW1wdHk6XG4gICAgICAgICAgICAgICAgdGhpcy5zcXVhcmVzW3RoaXMuY29sdW1ucyoocm93LTEpICsgKGNvbHVtbi0xKV0gPSBDZWxsU3RhdGVzLlN0YXI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIENlbGxTdGF0ZXMuU3RhcjpcbiAgICAgICAgICAgICAgICB0aGlzLnNxdWFyZXNbdGhpcy5jb2x1bW5zKihyb3ctMSkgKyAoY29sdW1uLTEpXSA9IENlbGxTdGF0ZXMuQmxvY2tlZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ2VsbFN0YXRlcy5CbG9ja2VkOlxuICAgICAgICAgICAgICAgIHRoaXMuc3F1YXJlc1t0aGlzLmNvbHVtbnMqKHJvdy0xKSArIChjb2x1bW4tMSldID0gQ2VsbFN0YXRlcy5FbXB0eTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IFxuICAgICAgICAgICAgICAgIGFzc2VydC5mYWlsKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoZWNrUmVwKCk7XG4gICAgICAgIHJldHVybiB0aGlzLnNxdWFyZXNbdGhpcy5jb2x1bW5zKihyb3ctMSkgKyAoY29sdW1uLTEpXSA/PyBhc3NlcnQuZmFpbChcIkdyaWQgc3F1YXJlIG5vdCBmb3VuZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29vcmRpbmF0ZXMgb2YgYWxsIHN0YXJzIG9uIHB1enpsZVxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEFycmF5PHtyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXJ9PiBhcnJheSBvZiB0aGUgY29vcmRpbmF0ZXMgb2YgYWxsIHRoZSBzdGFyc1xuICAgICAqL1xuXG4gICAgcHVibGljIGdldFN0YXJzKCk6IEFycmF5PHtyb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXJ9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJzOiBBcnJheTx7cm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyfT4gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnJvd3MqdGhpcy5jb2x1bW5zOyArK2kpIHtcbiAgICAgICAgICAgIGlmKHRoaXMuc3F1YXJlc1tpXSA9PT0gQ2VsbFN0YXRlcy5TdGFyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sOiBudW1iZXIgPSBpJXRoaXMuY29sdW1ucztcbiAgICAgICAgICAgICAgICBjb25zdCByb3c6IG51bWJlciA9IE1hdGguZmxvb3IoaS90aGlzLnJvd3MpO1xuICAgICAgICAgICAgICAgIHN0YXJzLnB1c2goe3Jvdzogcm93LCBjb2x1bW46IGNvbH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGFycztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAaW5oZXJpdGRvY1xuICAgICAqL1xuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgICAgICBsZXQgc3RyaW5nUmVwID0gXCJcIjtcbiAgICAgICAgc3RyaW5nUmVwICs9IGAke3RoaXMucm93c314JHt0aGlzLmNvbHVtbnN9XFxuYDtcbiAgICAgICAgZm9yIChjb25zdCByZWdpb24gb2YgdGhpcy5yZWdpb25zLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFycyA9IG5ldyBBcnJheTxbbnVtYmVyLCBudW1iZXJdPjtcbiAgICAgICAgICAgIGNvbnN0IG5vblN0YXJzID0gbmV3IEFycmF5PFtudW1iZXIsIG51bWJlcl0+O1xuICAgICAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IGNlbGxbMF0gPz8gYXNzZXJ0LmZhaWwoXCJjZWxsIGlzIG1pc3NpbmcgeCB2YWx1ZVwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW4gPSBjZWxsWzFdID8/IGFzc2VydC5mYWlsKFwiY2VsbCBpcyBtaXNzaW5nIHkgdmFsdWVcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgY2VsbFN0YXRlID0gdGhpcy5zcXVhcmVzW3RoaXMuY29sdW1ucyoocm93LTEpICsgKGNvbHVtbi0xKV07XG4gICAgICAgICAgICAgICAgaWYgKGNlbGxTdGF0ZSA9PT0gQ2VsbFN0YXRlcy5TdGFyKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzLnB1c2goW3JvdywgY29sdW1uXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub25TdGFycy5wdXNoKFtyb3csIGNvbHVtbl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBsaW5lID0gXCJcIjtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3RhciBvZiBzdGFycykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IHN0YXJbMF0gPz8gYXNzZXJ0LmZhaWwoXCJjZWxsIGlzIG1pc3NpbmcgeCB2YWx1ZVwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW4gPSBzdGFyWzFdID8/IGFzc2VydC5mYWlsKFwiY2VsbCBpcyBtaXNzaW5nIHkgdmFsdWVcIik7XG4gICAgICAgICAgICAgICAgbGluZSArPSBgJHtyb3d9LCR7Y29sdW1ufSBgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGluZSArPSAnfCAnO1xuICAgICAgICAgICAgZm9yIChjb25zdCBub25TdGFyIG9mIG5vblN0YXJzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gbm9uU3RhclswXSA/PyBhc3NlcnQuZmFpbChcImNlbGwgaXMgbWlzc2luZyB4IHZhbHVlXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbiA9IG5vblN0YXJbMV0gPz8gYXNzZXJ0LmZhaWwoXCJjZWxsIGlzIG1pc3NpbmcgeSB2YWx1ZVwiKTtcbiAgICAgICAgICAgICAgICBsaW5lICs9IGAke3Jvd30sJHtjb2x1bW59IGA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lICs9ICdcXG4nO1xuICAgICAgICAgICAgc3RyaW5nUmVwICs9IGxpbmU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cmluZ1JlcDtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgYSBwdXp6bGUuXG4gKiBcbiAqIEBwYXJhbSBpbnB1dCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBwdXp6bGUgdG8gcGFyc2UuXG4gKiBAcmV0dXJucyBwdXp6bGUgQURUIGZvciB0aGUgaW5wdXRcbiAqIEB0aHJvd3MgRXJyb3IgaWYgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBpcyBpbnZhbGlkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN0cmluZyhpbnB1dDogc3RyaW5nKTogUHV6emxlIHtcbiAgICByZXR1cm4gcGFyc2VQdXp6bGUoaW5wdXQpOyBcbn1cblxuLyoqXG4gKiBQYXJzZSBhIHB1enpsZS5cbiAqIFxuICogQHBhcmFtIGZpbGVuYW1lIHBhdGggdG8gdGhlIGZpbGUgY29udGFpbmluZyB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcHV6emxlIHRvIHBhcnNlLCBleGNsdWRpbmcgY29tbWVudHNcbiAqIEByZXR1cm5zIHB1enpsZSBBRFQgZm9yIHRoZSBpbnB1dFxuICogQHRocm93cyBFcnJvciBpZiB0aGUgZmlsZW5hbWUgb3Igc3RyaW5nIHJlcHJlc2VudGF0aW9uIGlzIGludmFsaWRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBhcnNlRmlsZShmaWxlbmFtZTogc3RyaW5nKTogUHJvbWlzZTxQdXp6bGU+IHtcbiAgICBjb25zdCBmaWxlQ29udGVudHMgPSAoYXdhaXQgZnMucHJvbWlzZXMucmVhZEZpbGUoZmlsZW5hbWUpKS50b1N0cmluZygpO1xuICAgIGxldCBzdHJpbmdSZXAgPSBcIlwiO1xuICAgIGNvbnN0IGxpbmVzID0gZmlsZUNvbnRlbnRzLnNwbGl0KCdcXG4nKTtcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgICAgaWYgKCFsaW5lLnN0YXJ0c1dpdGgoXCIjXCIpICYmIGxpbmUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc3RyaW5nUmVwICs9IGxpbmUgKyAnXFxuJztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFyc2VQdXp6bGUoc3RyaW5nUmVwKTsgXG59XG4iLCJpbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgeyBQdXp6bGUgfSBmcm9tICcuL1B1enpsZSc7XG5pbXBvcnQgeyBQYXJzZXIsIFBhcnNlVHJlZSwgY29tcGlsZSB9IGZyb20gJ3BhcnNlcmxpYic7XG5cbi8qKlxuICogUGFyc2VyIGZvciBwdXp6bGVzLlxuICogXG4gKi9cbmNvbnN0IGdyYW1tYXIgPSBgXG5Ac2tpcCB3aGl0ZXNwYWNlIHtcbiAgICBwdXp6bGUgOjo9IGRpbWVuc2lvbnMgW1xcXFxuXSByZWdpb24qO1xuICAgIGRpbWVuc2lvbnMgOjo9IG51bWJlciAneCcgbnVtYmVyKztcbiAgICByZWdpb24gOjo9IHN0YXIqICd8JyBjb29yZCsgW1xcXFxuXTtcbn1cbnN0YXIgOjo9IG51bWJlciAnLCcgbnVtYmVyO1xuY29vcmQgOjo9IG51bWJlciAnLCcgbnVtYmVyO1xubnVtYmVyIDo6PSBbMC05XSs7XG53aGl0ZXNwYWNlIDo6PSBbIFxcXFx0XFxcXHJdKztcbmA7XG5cbi8vIHRoZSBub250ZXJtaW5hbHMgb2YgdGhlIGdyYW1tYXJcbmVudW0gUHV6emxlR3JhbW1hciB7XG4gICAgUHV6emxlLCBEaW1lbnNpb25zLCBSZWdpb24sIFN0YXIsIENvb3JkLCBOdW1iZXIsIFdoaXRlc3BhY2Vcbn1cblxuLy8gY29tcGlsZSB0aGUgZ3JhbW1hciBpbnRvIGEgcGFyc2VyXG5jb25zdCBwYXJzZXI6IFBhcnNlcjxQdXp6bGVHcmFtbWFyPiA9IGNvbXBpbGUoZ3JhbW1hciwgUHV6emxlR3JhbW1hciwgUHV6emxlR3JhbW1hci5QdXp6bGUpO1xuXG4vKipcbiAqIFBhcnNlIGEgc3RyaW5nIGludG8gYSBwdXp6bGUuXG4gKiBcbiAqIEBwYXJhbSBpbnB1dCBzdHJpbmcgdG8gcGFyc2VcbiAqIEByZXR1cm5zIFB1enpsZSBwYXJzZWQgZnJvbSB0aGUgc3RyaW5nXG4gKiBAdGhyb3dzIFBhcnNlRXJyb3IgaWYgdGhlIHN0cmluZyBkb2Vzbid0IG1hdGNoIHRoZSBQdXp6bGUgZ3JhbW1hclxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQdXp6bGUoaW5wdXQ6IHN0cmluZyk6IFB1enpsZSB7XG4gICAgLy8gcGFyc2UgdGhlIGV4YW1wbGUgaW50byBhIHBhcnNlIHRyZWVcbiAgICBjb25zdCBwYXJzZVRyZWU6IFBhcnNlVHJlZTxQdXp6bGVHcmFtbWFyPiA9IHBhcnNlci5wYXJzZShpbnB1dCk7XG4gICAgLy8gbWFrZSBhIHB1enpsZSBmcm9tIHRoZSBwYXJzZSB0cmVlXG4gICAgY29uc3QgcHV6emxlOiBQdXp6bGUgPSBnZXRQdXp6bGUocGFyc2VUcmVlKTsgICAgXG4gICAgcmV0dXJuIHB1enpsZTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcGFyc2UgdHJlZSBpbnRvIGEgcmVjb3JkIGNvbnRhaW5pbmcgcHV6emxlIGRpbWVuc2lvbnMuXG4gKiBcbiAqIEBwYXJhbSBwYXJzZVRyZWUgY29uc3RydWN0ZWQgYWNjb3JkaW5nIHRvIHRoZSBncmFtbWFyIGZvciBwdXp6bGVzXG4gKiBAcmV0dXJucyBhIHJlY29yZCBjb250YWluaW5nIHB1enpsZSBkaW1lbnNpb25zXG4gKi9cbmZ1bmN0aW9uIGdldERpbWVuc2lvbnMocGFyc2VUcmVlOiBQYXJzZVRyZWU8UHV6emxlR3JhbW1hcj4pOiB7bnVtUm93czpudW1iZXIsIG51bUNvbHM6bnVtYmVyfSB7XG4gICAgLy8gZGltZW5zaW9ucyA6Oj0gWzAtOV0rICd4JyBbMC05XSs7XG4gICAgY29uc3QgZGltZW5zaW9uczogQXJyYXk8UGFyc2VUcmVlPFB1enpsZUdyYW1tYXI+PiA9IHBhcnNlVHJlZS5jaGlsZHJlbkJ5TmFtZShQdXp6bGVHcmFtbWFyLk51bWJlcik7XG4gICAgY29uc3QgbnVtUm93cyA9IGdldE51bWJlcihkaW1lbnNpb25zWzBdID8/IGFzc2VydC5mYWlsKFwibWlzc2luZyBudW1iZXIgb2Ygcm93c1wiKSk7XG4gICAgY29uc3QgbnVtQ29scyA9IGdldE51bWJlcihkaW1lbnNpb25zWzFdID8/IGFzc2VydC5mYWlsKFwibWlzc2luZyBudW1iZXIgb2YgY29sdW1uc1wiKSk7XG4gICAgcmV0dXJuIHtudW1Sb3dzOm51bVJvd3MsIG51bUNvbHM6bnVtQ29sc307XG59XG5cbi8qKlxuICogQ29udmVydCBhIHBhcnNlIHRyZWUgaW50byBhIG51bWJlci5cbiAqIFxuICogQHBhcmFtIHBhcnNlVHJlZSBjb25zdHJ1Y3RlZCBhY2NvcmRpbmcgdG8gdGhlIGdyYW1tYXIgZm9yIHB1enpsZXNcbiAqIEByZXR1cm5zIHRoZSBudW1iZXIgcmVwcmVzZW50ZWQgYnkgdGhlIHBhcnNlVHJlZVxuICovXG5mdW5jdGlvbiBnZXROdW1iZXIocGFyc2VUcmVlOiBQYXJzZVRyZWU8UHV6emxlR3JhbW1hcj4pOiBudW1iZXIge1xuICAgIC8vIG51bWJlciA6Oj0gWzAtOV0rO1xuICAgIHJldHVybiBwYXJzZUludChwYXJzZVRyZWUudGV4dCkgPz8gYXNzZXJ0LmZhaWwoXCJpbnZhbGlkIGRpbWVuc2lvbnNcIik7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHBhcnNlIHRyZWUgaW50byBhIHJlY29yZCBjb250YWluaW5nIGNvb3JkaW5hdGVzIGFuZCBzdGFycyBvZiB0aGUgZ2l2ZW4gcmVnaW9uLlxuICogXG4gKiBAcGFyYW0gcGFyc2VUcmVlIGNvbnN0cnVjdGVkIGFjY29yZGluZyB0byB0aGUgZ3JhbW1hciBmb3IgcHV6emxlc1xuICogQHJldHVybnMgYSByZWNvcmQgY29udGFpbmluZyBjb29yZGluYXRlcyBhbmQgc3RhcnMgb2YgdGhlIGdpdmVuIHJlZ2lvblxuICovXG5mdW5jdGlvbiBnZXRSZWdpb24ocGFyc2VUcmVlOiBQYXJzZVRyZWU8UHV6emxlR3JhbW1hcj4pOiB7XG4gICAgY29vcmRzOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPiwgc3RhcnM6IEFycmF5PFtudW1iZXIsIG51bWJlcl0+XG59IHtcbiAgICAvLyByZWdpb24gOjo9IHN0YXIqICd8JyBjb29yZCsgJ1xcbic7XG4gICAgY29uc3Qgc3RhcnMgPSBwYXJzZVRyZWUuY2hpbGRyZW5CeU5hbWUoUHV6emxlR3JhbW1hci5TdGFyKS5tYXAoc3RhciA9PiBnZXRDb29yZGluYXRlKHN0YXIpKTtcbiAgICBjb25zdCBjb29yZHMgPSBwYXJzZVRyZWUuY2hpbGRyZW5CeU5hbWUoUHV6emxlR3JhbW1hci5Db29yZCkubWFwKGNvb3JkID0+IGdldENvb3JkaW5hdGUoY29vcmQpKS5jb25jYXQoWy4uLnN0YXJzXSk7XG4gICAgcmV0dXJuIHtjb29yZHM6IGNvb3Jkcywgc3RhcnM6IHN0YXJzfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcGFyc2UgdHJlZSBpbnRvIGEgY29vcmRpbmF0ZVxuICogXG4gKiBAcGFyYW0gcGFyc2VUcmVlIGNvbnN0cnVjdGVkIGFjY29yZGluZyB0byB0aGUgZ3JhbW1hciBmb3IgcHV6emxlc1xuICogQHJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBjb29yZGluYXRlIG51bWJlcnNcbiAqL1xuZnVuY3Rpb24gZ2V0Q29vcmRpbmF0ZShwYXJzZVRyZWU6IFBhcnNlVHJlZTxQdXp6bGVHcmFtbWFyPik6IFtudW1iZXIsIG51bWJlcl0ge1xuICAgIC8vIGNvb3JkIDo6PSBudW1iZXIgJywnIG51bWJlcjtcbiAgICBjb25zdCBjb29yZHM6IEFycmF5PFBhcnNlVHJlZTxQdXp6bGVHcmFtbWFyPj4gPSBwYXJzZVRyZWUuY2hpbGRyZW5CeU5hbWUoUHV6emxlR3JhbW1hci5OdW1iZXIpO1xuICAgIGNvbnN0IHggPSBnZXROdW1iZXIoY29vcmRzWzBdID8/IGFzc2VydC5mYWlsKFwibWlzc2luZyBjb29yZGluYXRlXCIpKTtcbiAgICBjb25zdCB5ID0gZ2V0TnVtYmVyKGNvb3Jkc1sxXSA/PyBhc3NlcnQuZmFpbChcIm1pc3NpbmcgY29vcmRpbmF0ZVwiKSk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcGFyc2UgdHJlZSBpbnRvIGEgcHV6emxlLlxuICogXG4gKiBAcGFyYW0gcGFyc2VUcmVlIGNvbnN0cnVjdGVkIGFjY29yZGluZyB0byB0aGUgZ3JhbW1hciBmb3IgcHV6emxlc1xuICogQHJldHVybnMgbmV3IHB1enpsZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBwYXJzZVRyZWVcbiAqL1xuZnVuY3Rpb24gZ2V0UHV6emxlKHBhcnNlVHJlZTogUGFyc2VUcmVlPFB1enpsZUdyYW1tYXI+KTogUHV6emxlIHtcbiAgICAvLyBwdXp6bGUgOjo9IGRpbWVuc2lvbnMgJ1xcbicgcmVnaW9uKjtcbiAgICBjb25zdCBkaW1lbnNpb24gPSAxMDtcbiAgICBjb25zdCBkaW1lbnNpb25zID0gZ2V0RGltZW5zaW9ucyhwYXJzZVRyZWUuY2hpbGRyZW5bMF0gPz8gYXNzZXJ0LmZhaWwoJ21pc3NpbmcgY2hpbGQnKSk7XG4gICAgYXNzZXJ0KGRpbWVuc2lvbnMubnVtUm93cyA9PT0gZGltZW5zaW9uLCBcIm91ciBBRFQgY2FuIG9ubHkgaGFuZGxlIDEweDEwIHB1enpsZXNcIik7XG4gICAgYXNzZXJ0KGRpbWVuc2lvbnMubnVtQ29scyA9PT0gZGltZW5zaW9uLCBcIm91ciBBRFQgY2FuIG9ubHkgaGFuZGxlIDEweDEwIHB1enpsZXNcIik7XG5cbiAgICBjb25zdCByZWdpb25zID0gcGFyc2VUcmVlLmNoaWxkcmVuQnlOYW1lKFB1enpsZUdyYW1tYXIuUmVnaW9uKS5tYXAocmVnaW9uID0+IGdldFJlZ2lvbihyZWdpb24pKTtcbiAgICBjb25zdCBtYXAgPSBuZXcgTWFwPG51bWJlciwgQXJyYXk8W251bWJlciwgbnVtYmVyXT4+KCk7XG4gICAgY29uc3QgYWxsU3RhcnMgPSBuZXcgQXJyYXk8W251bWJlciwgbnVtYmVyXT47XG4gICAgZm9yIChjb25zdCBbcmVnaW9uSUQsIHJlZ2lvbl0gb2YgcmVnaW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgICAgbWFwLnNldChyZWdpb25JRCwgcmVnaW9uLmNvb3Jkcyk7XG4gICAgICAgIGFsbFN0YXJzLnB1c2goLi4ucmVnaW9uLnN0YXJzKTtcbiAgICB9XG4gICAgY29uc3QgcHV6emxlID0gbmV3IFB1enpsZShtYXApO1xuICAgIGZvciAoY29uc3Qgc3RhciBvZiBhbGxTdGFycykge1xuICAgICAgICBwdXp6bGUuY3ljbGVTcXVhcmUoc3Rhcik7XG4gICAgfVxuICAgIHJldHVybiBwdXp6bGU7XG59XG5cblxuIl19
