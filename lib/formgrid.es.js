function noop() {}

function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
	return tar;
}

function assignTrue(tar, src) {
	for (var k in src) tar[k] = 1;
	return tar;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function destroyEach(iterations, detach) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detach);
	}
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function createComment() {
	return document.createComment('');
}

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function toNumber(value) {
	return value === '' ? undefined : +value;
}

function setStyle(node, key, value) {
	node.style.setProperty(key, value);
}

function selectOption(select, value) {
	for (var i = 0; i < select.options.length; i += 1) {
		var option = select.options[i];

		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
}

function selectValue(select) {
	var selectedOption = select.querySelector(':checked') || select.options[0];
	return selectedOption && selectedOption.__value;
}

function getSpreadUpdate(levels, updates) {
	var update = {};

	var to_null_out = {};
	var accounted_for = {};

	var i = levels.length;
	while (i--) {
		var o = levels[i];
		var n = updates[i];

		if (n) {
			for (var key in o) {
				if (!(key in n)) to_null_out[key] = 1;
			}

			for (var key in n) {
				if (!accounted_for[key]) {
					update[key] = n[key];
					accounted_for[key] = 1;
				}
			}

			levels[i] = n;
		} else {
			for (var key in o) {
				accounted_for[key] = 1;
			}
		}
	}

	for (var key in to_null_out) {
		if (!(key in update)) update[key] = undefined;
	}

	return update;
}

function blankObject() {
	return Object.create(null);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = noop;

	this._fragment.d(detach !== false);
	this._fragment = null;
	this._state = {};
}

function destroyDev(detach) {
	destroy.call(this, detach);
	this.destroy = function() {
		console.warn('Component was already destroyed');
	};
}

function _differs(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		var handler = handlers[i];

		if (!handler.__calling) {
			handler.__calling = true;
			handler.call(this, data);
			handler.__calling = false;
		}
	}
}

function get() {
	return this._state;
}

function init(component, options) {
	component._handlers = blankObject();
	component._bind = options._bind;

	component.options = options;
	component.root = options.root || component;
	component.store = component.root.store || options.store;
}

function on(eventName, handler) {
	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	if (this.root._lock) return;
	this.root._lock = true;
	callAll(this.root._beforecreate);
	callAll(this.root._oncreate);
	callAll(this.root._aftercreate);
	this.root._lock = false;
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (this._differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign(assign({}, oldState), newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);

	if (this._fragment) {
		this.fire("state", { changed: changed, current: this._state, previous: oldState });
		this._fragment.p(changed, this._state);
		this.fire("update", { changed: changed, current: this._state, previous: oldState });
	}
}

function setDev(newState) {
	if (typeof newState !== 'object') {
		throw new Error(
			this._debugName + '.set was called without an object of data key-values to update.'
		);
	}

	this._checkReadOnly(newState);
	set.call(this, newState);
}

function callAll(fns) {
	while (fns && fns.length) fns.shift()();
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

var protoDev = {
	destroy: destroyDev,
	get,
	fire,
	on,
	set: setDev,
	_recompute: noop,
	_set,
	_mount,
	_differs
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var is = createCommonjsModule(function (module, exports) {
(function(root, factory) {    // eslint-disable-line no-extra-semi
    if (typeof undefined === 'function' && undefined.amd) {
        // AMD. Register as an anonymous module.
        undefined(function() {
            // Also create a global in case some scripts
            // that are loaded still are looking for
            // a global even when an AMD loader is in use.
            return (root.is = factory());
        });
    } else {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    }
}(commonjsGlobal, function() {

    // Baseline
    /* -------------------------------------------------------------------------- */

    // define 'is' object and current version
    var is = {};
    is.VERSION = '0.8.0';

    // define interfaces
    is.not = {};
    is.all = {};
    is.any = {};

    // cache some methods to call later on
    var toString = Object.prototype.toString;
    var slice = Array.prototype.slice;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    // helper function which reverses the sense of predicate result
    function not(func) {
        return function() {
            return !func.apply(null, slice.call(arguments));
        };
    }

    // helper function which call predicate function per parameter and return true if all pass
    function all(func) {
        return function() {
            var params = getParams(arguments);
            var length = params.length;
            for (var i = 0; i < length; i++) {
                if (!func.call(null, params[i])) {
                    return false;
                }
            }
            return true;
        };
    }

    // helper function which call predicate function per parameter and return true if any pass
    function any(func) {
        return function() {
            var params = getParams(arguments);
            var length = params.length;
            for (var i = 0; i < length; i++) {
                if (func.call(null, params[i])) {
                    return true;
                }
            }
            return false;
        };
    }

    // build a 'comparator' object for various comparison checks
    var comparator = {
        '<': function(a, b) { return a < b; },
        '<=': function(a, b) { return a <= b; },
        '>': function(a, b) { return a > b; },
        '>=': function(a, b) { return a >= b; }
    };

    // helper function which compares a version to a range
    function compareVersion(version, range) {
        var string = (range + '');
        var n = +(string.match(/\d+/) || NaN);
        var op = string.match(/^[<>]=?|/)[0];
        return comparator[op] ? comparator[op](version, n) : (version == n || n !== n);
    }

    // helper function which extracts params from arguments
    function getParams(args) {
        var params = slice.call(args);
        var length = params.length;
        if (length === 1 && is.array(params[0])) {    // support array
            params = params[0];
        }
        return params;
    }

    // Type checks
    /* -------------------------------------------------------------------------- */

    // is a given value Arguments?
    is.arguments = function(value) {    // fallback check is for IE
        return toString.call(value) === '[object Arguments]' ||
            (value != null && typeof value === 'object' && 'callee' in value);
    };

    // is a given value Array?
    is.array = Array.isArray || function(value) {    // check native isArray first
        return toString.call(value) === '[object Array]';
    };

    // is a given value Boolean?
    is.boolean = function(value) {
        return value === true || value === false || toString.call(value) === '[object Boolean]';
    };

    // is a given value Char?
    is.char = function(value) {
        return is.string(value) && value.length === 1;
    };

    // is a given value Date Object?
    is.date = function(value) {
        return toString.call(value) === '[object Date]';
    };

    // is a given object a DOM node?
    is.domNode = function(object) {
        return is.object(object) && object.nodeType > 0;
    };

    // is a given value Error object?
    is.error = function(value) {
        return toString.call(value) === '[object Error]';
    };

    // is a given value function?
    is['function'] = function(value) {    // fallback check is for IE
        return toString.call(value) === '[object Function]' || typeof value === 'function';
    };

    // is given value a pure JSON object?
    is.json = function(value) {
        return toString.call(value) === '[object Object]';
    };

    // is a given value NaN?
    is.nan = function(value) {    // NaN is number :) Also it is the only value which does not equal itself
        return value !== value;
    };

    // is a given value null?
    is['null'] = function(value) {
        return value === null;
    };

    // is a given value number?
    is.number = function(value) {
        return is.not.nan(value) && toString.call(value) === '[object Number]';
    };

    // is a given value object?
    is.object = function(value) {
        return Object(value) === value;
    };

    // is a given value RegExp?
    is.regexp = function(value) {
        return toString.call(value) === '[object RegExp]';
    };

    // are given values same type?
    // prevent NaN, Number same type check
    is.sameType = function(value, other) {
        var tag = toString.call(value);
        if (tag !== toString.call(other)) {
            return false;
        }
        if (tag === '[object Number]') {
            return !is.any.nan(value, other) || is.all.nan(value, other);
        }
        return true;
    };
    // sameType method does not support 'all' and 'any' interfaces
    is.sameType.api = ['not'];

    // is a given value String?
    is.string = function(value) {
        return toString.call(value) === '[object String]';
    };

    // is a given value undefined?
    is.undefined = function(value) {
        return value === void 0;
    };

    // is a given value window?
    // setInterval method is only available for window object
    is.windowObject = function(value) {
        return value != null && typeof value === 'object' && 'setInterval' in value;
    };

    // Presence checks
    /* -------------------------------------------------------------------------- */

    //is a given value empty? Objects, arrays, strings
    is.empty = function(value) {
        if (is.object(value)) {
            var length = Object.getOwnPropertyNames(value).length;
            if (length === 0 || (length === 1 && is.array(value)) ||
                    (length === 2 && is.arguments(value))) {
                return true;
            }
            return false;
        }
        return value === '';
    };

    // is a given value existy?
    is.existy = function(value) {
        return value != null;
    };

    // is a given value falsy?
    is.falsy = function(value) {
        return !value;
    };

    // is a given value truthy?
    is.truthy = not(is.falsy);

    // Arithmetic checks
    /* -------------------------------------------------------------------------- */

    // is a given number above minimum parameter?
    is.above = function(n, min) {
        return is.all.number(n, min) && n > min;
    };
    // above method does not support 'all' and 'any' interfaces
    is.above.api = ['not'];

    // is a given number decimal?
    is.decimal = function(n) {
        return is.number(n) && n % 1 !== 0;
    };

    // are given values equal? supports numbers, strings, regexes, booleans
    // TODO: Add object and array support
    is.equal = function(value, other) {
        // check 0 and -0 equity with Infinity and -Infinity
        if (is.all.number(value, other)) {
            return value === other && 1 / value === 1 / other;
        }
        // check regexes as strings too
        if (is.all.string(value, other) || is.all.regexp(value, other)) {
            return '' + value === '' + other;
        }
        if (is.all.boolean(value, other)) {
            return value === other;
        }
        return false;
    };
    // equal method does not support 'all' and 'any' interfaces
    is.equal.api = ['not'];

    // is a given number even?
    is.even = function(n) {
        return is.number(n) && n % 2 === 0;
    };

    // is a given number finite?
    is.finite = isFinite || function(n) {
        return is.not.infinite(n) && is.not.nan(n);
    };

    // is a given number infinite?
    is.infinite = function(n) {
        return n === Infinity || n === -Infinity;
    };

    // is a given number integer?
    is.integer = function(n) {
        return is.number(n) && n % 1 === 0;
    };

    // is a given number negative?
    is.negative = function(n) {
        return is.number(n) && n < 0;
    };

    // is a given number odd?
    is.odd = function(n) {
        return is.number(n) && n % 2 === 1;
    };

    // is a given number positive?
    is.positive = function(n) {
        return is.number(n) && n > 0;
    };

    // is a given number above maximum parameter?
    is.under = function(n, max) {
        return is.all.number(n, max) && n < max;
    };
    // least method does not support 'all' and 'any' interfaces
    is.under.api = ['not'];

    // is a given number within minimum and maximum parameters?
    is.within = function(n, min, max) {
        return is.all.number(n, min, max) && n > min && n < max;
    };
    // within method does not support 'all' and 'any' interfaces
    is.within.api = ['not'];

    // Regexp checks
    /* -------------------------------------------------------------------------- */
    // Steven Levithan, Jan Goyvaerts: Regular Expressions Cookbook
    // Scott Gonzalez: Email address validation

    // dateString match m/d/yy and mm/dd/yyyy, allowing any combination of one or two digits for the day and month, and two or four digits for the year
    // eppPhone match extensible provisioning protocol format
    // nanpPhone match north american number plan format
    // time match hours, minutes, and seconds, 24-hour clock
    var regexes = {
        affirmative: /^(?:1|t(?:rue)?|y(?:es)?|ok(?:ay)?)$/,
        alphaNumeric: /^[A-Za-z0-9]+$/,
        caPostalCode: /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z]\s?[0-9][A-Z][0-9]$/,
        creditCard: /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/,
        dateString: /^(1[0-2]|0?[1-9])([\/-])(3[01]|[12][0-9]|0?[1-9])(?:\2)(?:[0-9]{2})?[0-9]{2}$/,
        email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i, // eslint-disable-line no-control-regex
        eppPhone: /^\+[0-9]{1,3}\.[0-9]{4,14}(?:x.+)?$/,
        hexadecimal: /^(?:0x)?[0-9a-fA-F]+$/,
        hexColor: /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
        ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
        ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
        nanpPhone: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
        socialSecurityNumber: /^(?!000|666)[0-8][0-9]{2}-?(?!00)[0-9]{2}-?(?!0000)[0-9]{4}$/,
        timeString: /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/,
        ukPostCode: /^[A-Z]{1,2}[0-9RCHNQ][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$|^[A-Z]{2}-?[0-9]{4}$/,
        url: /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i,
        usZipCode: /^[0-9]{5}(?:-[0-9]{4})?$/
    };

    function regexpCheck(regexp, regexes) {
        is[regexp] = function(value) {
            return regexes[regexp].test(value);
        };
    }

    // create regexp checks methods from 'regexes' object
    for (var regexp in regexes) {
        if (regexes.hasOwnProperty(regexp)) {
            regexpCheck(regexp, regexes);
        }
    }

    // simplify IP checks by calling the regex helpers for IPv4 and IPv6
    is.ip = function(value) {
        return is.ipv4(value) || is.ipv6(value);
    };

    // String checks
    /* -------------------------------------------------------------------------- */

    // is a given string or sentence capitalized?
    is.capitalized = function(string) {
        if (is.not.string(string)) {
            return false;
        }
        var words = string.split(' ');
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            if (word.length) {
                var chr = word.charAt(0);
                if (chr !== chr.toUpperCase()) {
                    return false;
                }
            }
        }
        return true;
    };

    // is string end with a given target parameter?
    is.endWith = function(string, target) {
        if (is.not.string(string)) {
            return false;
        }
        target += '';
        var position = string.length - target.length;
        return position >= 0 && string.indexOf(target, position) === position;
    };
    // endWith method does not support 'all' and 'any' interfaces
    is.endWith.api = ['not'];

    // is a given string include parameter target?
    is.include = function(string, target) {
        return string.indexOf(target) > -1;
    };
    // include method does not support 'all' and 'any' interfaces
    is.include.api = ['not'];

    // is a given string all lowercase?
    is.lowerCase = function(string) {
        return is.string(string) && string === string.toLowerCase();
    };

    // is a given string palindrome?
    is.palindrome = function(string) {
        if (is.not.string(string)) {
            return false;
        }
        string = string.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
        var length = string.length - 1;
        for (var i = 0, half = Math.floor(length / 2); i <= half; i++) {
            if (string.charAt(i) !== string.charAt(length - i)) {
                return false;
            }
        }
        return true;
    };

    // is a given value space?
    // horizantal tab: 9, line feed: 10, vertical tab: 11, form feed: 12, carriage return: 13, space: 32
    is.space = function(value) {
        if (is.not.char(value)) {
            return false;
        }
        var charCode = value.charCodeAt(0);
        return (charCode > 8 && charCode < 14) || charCode === 32;
    };

    // is string start with a given target parameter?
    is.startWith = function(string, target) {
        return is.string(string) && string.indexOf(target) === 0;
    };
    // startWith method does not support 'all' and 'any' interfaces
    is.startWith.api = ['not'];

    // is a given string all uppercase?
    is.upperCase = function(string) {
        return is.string(string) && string === string.toUpperCase();
    };

    // Time checks
    /* -------------------------------------------------------------------------- */

    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    // is a given dates day equal given day parameter?
    is.day = function(date, day) {
        return is.date(date) && day.toLowerCase() === days[date.getDay()];
    };
    // day method does not support 'all' and 'any' interfaces
    is.day.api = ['not'];

    // is a given date in daylight saving time?
    is.dayLightSavingTime = function(date) {
        var january = new Date(date.getFullYear(), 0, 1);
        var july = new Date(date.getFullYear(), 6, 1);
        var stdTimezoneOffset = Math.max(january.getTimezoneOffset(), july.getTimezoneOffset());
        return date.getTimezoneOffset() < stdTimezoneOffset;
    };

    // is a given date future?
    is.future = function(date) {
        var now = new Date();
        return is.date(date) && date.getTime() > now.getTime();
    };

    // is date within given range?
    is.inDateRange = function(date, start, end) {
        if (is.not.date(date) || is.not.date(start) || is.not.date(end)) {
            return false;
        }
        var stamp = date.getTime();
        return stamp > start.getTime() && stamp < end.getTime();
    };
    // inDateRange method does not support 'all' and 'any' interfaces
    is.inDateRange.api = ['not'];

    // is a given date in last month range?
    is.inLastMonth = function(date) {
        return is.inDateRange(date, new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date());
    };

    // is a given date in last week range?
    is.inLastWeek = function(date) {
        return is.inDateRange(date, new Date(new Date().setDate(new Date().getDate() - 7)), new Date());
    };

    // is a given date in last year range?
    is.inLastYear = function(date) {
        return is.inDateRange(date, new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date());
    };

    // is a given date in next month range?
    is.inNextMonth = function(date) {
        return is.inDateRange(date, new Date(), new Date(new Date().setMonth(new Date().getMonth() + 1)));
    };

    // is a given date in next week range?
    is.inNextWeek = function(date) {
        return is.inDateRange(date, new Date(), new Date(new Date().setDate(new Date().getDate() + 7)));
    };

    // is a given date in next year range?
    is.inNextYear = function(date) {
        return is.inDateRange(date, new Date(), new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    };

    // is the given year a leap year?
    is.leapYear = function(year) {
        return is.number(year) && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
    };

    // is a given dates month equal given month parameter?
    is.month = function(date, month) {
        return is.date(date) && month.toLowerCase() === months[date.getMonth()];
    };
    // month method does not support 'all' and 'any' interfaces
    is.month.api = ['not'];

    // is a given date past?
    is.past = function(date) {
        var now = new Date();
        return is.date(date) && date.getTime() < now.getTime();
    };

    // is a given date in the parameter quarter?
    is.quarterOfYear = function(date, quarter) {
        return is.date(date) && is.number(quarter) && quarter === Math.floor((date.getMonth() + 3) / 3);
    };
    // quarterOfYear method does not support 'all' and 'any' interfaces
    is.quarterOfYear.api = ['not'];

    // is a given date indicate today?
    is.today = function(date) {
        var now = new Date();
        var todayString = now.toDateString();
        return is.date(date) && date.toDateString() === todayString;
    };

    // is a given date indicate tomorrow?
    is.tomorrow = function(date) {
        var now = new Date();
        var tomorrowString = new Date(now.setDate(now.getDate() + 1)).toDateString();
        return is.date(date) && date.toDateString() === tomorrowString;
    };

    // is a given date weekend?
    // 6: Saturday, 0: Sunday
    is.weekend = function(date) {
        return is.date(date) && (date.getDay() === 6 || date.getDay() === 0);
    };

    // is a given date weekday?
    is.weekday = not(is.weekend);

    // is a given dates year equal given year parameter?
    is.year = function(date, year) {
        return is.date(date) && is.number(year) && year === date.getFullYear();
    };
    // year method does not support 'all' and 'any' interfaces
    is.year.api = ['not'];

    // is a given date indicate yesterday?
    is.yesterday = function(date) {
        var now = new Date();
        var yesterdayString = new Date(now.setDate(now.getDate() - 1)).toDateString();
        return is.date(date) && date.toDateString() === yesterdayString;
    };

    // Environment checks
    /* -------------------------------------------------------------------------- */

    var freeGlobal = is.windowObject(typeof commonjsGlobal == 'object' && commonjsGlobal) && commonjsGlobal;
    var freeSelf = is.windowObject(typeof self == 'object' && self) && self;
    var thisGlobal = is.windowObject(typeof this == 'object' && this) && this;
    var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

    var document = freeSelf && freeSelf.document;
    var previousIs = root.is;

    // store navigator properties to use later
    var navigator = freeSelf && freeSelf.navigator;
    var appVersion = (navigator && navigator.appVersion || '').toLowerCase();
    var userAgent = (navigator && navigator.userAgent || '').toLowerCase();
    var vendor = (navigator && navigator.vendor || '').toLowerCase();

    // is current device android?
    is.android = function() {
        return /android/.test(userAgent);
    };
    // android method does not support 'all' and 'any' interfaces
    is.android.api = ['not'];

    // is current device android phone?
    is.androidPhone = function() {
        return /android/.test(userAgent) && /mobile/.test(userAgent);
    };
    // androidPhone method does not support 'all' and 'any' interfaces
    is.androidPhone.api = ['not'];

    // is current device android tablet?
    is.androidTablet = function() {
        return /android/.test(userAgent) && !/mobile/.test(userAgent);
    };
    // androidTablet method does not support 'all' and 'any' interfaces
    is.androidTablet.api = ['not'];

    // is current device blackberry?
    is.blackberry = function() {
        return /blackberry/.test(userAgent) || /bb10/.test(userAgent);
    };
    // blackberry method does not support 'all' and 'any' interfaces
    is.blackberry.api = ['not'];

    // is current browser chrome?
    // parameter is optional
    is.chrome = function(range) {
        var match = /google inc/.test(vendor) ? userAgent.match(/(?:chrome|crios)\/(\d+)/) : null;
        return match !== null && compareVersion(match[1], range);
    };
    // chrome method does not support 'all' and 'any' interfaces
    is.chrome.api = ['not'];

    // is current device desktop?
    is.desktop = function() {
        return is.not.mobile() && is.not.tablet();
    };
    // desktop method does not support 'all' and 'any' interfaces
    is.desktop.api = ['not'];

    // is current browser edge?
    // parameter is optional
    is.edge = function(range) {
        var match = userAgent.match(/edge\/(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // edge method does not support 'all' and 'any' interfaces
    is.edge.api = ['not'];

    // is current browser firefox?
    // parameter is optional
    is.firefox = function(range) {
        var match = userAgent.match(/(?:firefox|fxios)\/(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // firefox method does not support 'all' and 'any' interfaces
    is.firefox.api = ['not'];

    // is current browser internet explorer?
    // parameter is optional
    is.ie = function(range) {
        var match = userAgent.match(/(?:msie |trident.+?; rv:)(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // ie method does not support 'all' and 'any' interfaces
    is.ie.api = ['not'];

    // is current device ios?
    is.ios = function() {
        return is.iphone() || is.ipad() || is.ipod();
    };
    // ios method does not support 'all' and 'any' interfaces
    is.ios.api = ['not'];

    // is current device ipad?
    // parameter is optional
    is.ipad = function(range) {
        var match = userAgent.match(/ipad.+?os (\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // ipad method does not support 'all' and 'any' interfaces
    is.ipad.api = ['not'];

    // is current device iphone?
    // parameter is optional
    is.iphone = function(range) {
        // original iPhone doesn't have the os portion of the UA
        var match = userAgent.match(/iphone(?:.+?os (\d+))?/);
        return match !== null && compareVersion(match[1] || 1, range);
    };
    // iphone method does not support 'all' and 'any' interfaces
    is.iphone.api = ['not'];

    // is current device ipod?
    // parameter is optional
    is.ipod = function(range) {
        var match = userAgent.match(/ipod.+?os (\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // ipod method does not support 'all' and 'any' interfaces
    is.ipod.api = ['not'];

    // is current operating system linux?
    is.linux = function() {
        return /linux/.test(appVersion);
    };
    // linux method does not support 'all' and 'any' interfaces
    is.linux.api = ['not'];

    // is current operating system mac?
    is.mac = function() {
        return /mac/.test(appVersion);
    };
    // mac method does not support 'all' and 'any' interfaces
    is.mac.api = ['not'];

    // is current device mobile?
    is.mobile = function() {
        return is.iphone() || is.ipod() || is.androidPhone() || is.blackberry() || is.windowsPhone();
    };
    // mobile method does not support 'all' and 'any' interfaces
    is.mobile.api = ['not'];

    // is current state offline?
    is.offline = not(is.online);
    // offline method does not support 'all' and 'any' interfaces
    is.offline.api = ['not'];

    // is current state online?
    is.online = function() {
        return !navigator || navigator.onLine === true;
    };
    // online method does not support 'all' and 'any' interfaces
    is.online.api = ['not'];

    // is current browser opera?
    // parameter is optional
    is.opera = function(range) {
        var match = userAgent.match(/(?:^opera.+?version|opr)\/(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // opera method does not support 'all' and 'any' interfaces
    is.opera.api = ['not'];

    // is current browser phantomjs?
    // parameter is optional
    is.phantom = function(range) {
        var match = userAgent.match(/phantomjs\/(\d+)/);
        return match !== null && compareVersion(match[1], range);
    };
    // phantom method does not support 'all' and 'any' interfaces
    is.phantom.api = ['not'];

    // is current browser safari?
    // parameter is optional
    is.safari = function(range) {
        var match = userAgent.match(/version\/(\d+).+?safari/);
        return match !== null && compareVersion(match[1], range);
    };
    // safari method does not support 'all' and 'any' interfaces
    is.safari.api = ['not'];

    // is current device tablet?
    is.tablet = function() {
        return is.ipad() || is.androidTablet() || is.windowsTablet();
    };
    // tablet method does not support 'all' and 'any' interfaces
    is.tablet.api = ['not'];

    // is current device supports touch?
    is.touchDevice = function() {
        return !!document && ('ontouchstart' in freeSelf ||
            ('DocumentTouch' in freeSelf && document instanceof DocumentTouch));
    };
    // touchDevice method does not support 'all' and 'any' interfaces
    is.touchDevice.api = ['not'];

    // is current operating system windows?
    is.windows = function() {
        return /win/.test(appVersion);
    };
    // windows method does not support 'all' and 'any' interfaces
    is.windows.api = ['not'];

    // is current device windows phone?
    is.windowsPhone = function() {
        return is.windows() && /phone/.test(userAgent);
    };
    // windowsPhone method does not support 'all' and 'any' interfaces
    is.windowsPhone.api = ['not'];

    // is current device windows tablet?
    is.windowsTablet = function() {
        return is.windows() && is.not.windowsPhone() && /touch/.test(userAgent);
    };
    // windowsTablet method does not support 'all' and 'any' interfaces
    is.windowsTablet.api = ['not'];

    // Object checks
    /* -------------------------------------------------------------------------- */

    // has a given object got parameterized count property?
    is.propertyCount = function(object, count) {
        if (is.not.object(object) || is.not.number(count)) {
            return false;
        }
        var n = 0;
        for (var property in object) {
            if (hasOwnProperty.call(object, property) && ++n > count) {
                return false;
            }
        }
        return n === count;
    };
    // propertyCount method does not support 'all' and 'any' interfaces
    is.propertyCount.api = ['not'];

    // is given object has parameterized property?
    is.propertyDefined = function(object, property) {
        return is.object(object) && is.string(property) && property in object;
    };
    // propertyDefined method does not support 'all' and 'any' interfaces
    is.propertyDefined.api = ['not'];

    // Array checks
    /* -------------------------------------------------------------------------- */

    // is a given item in an array?
    is.inArray = function(value, array) {
        if (is.not.array(array)) {
            return false;
        }
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    };
    // inArray method does not support 'all' and 'any' interfaces
    is.inArray.api = ['not'];

    // is a given array sorted?
    is.sorted = function(array, sign) {
        if (is.not.array(array)) {
            return false;
        }
        var predicate = comparator[sign] || comparator['>='];
        for (var i = 1; i < array.length; i++) {
            if (!predicate(array[i], array[i - 1])) {
                return false;
            }
        }
        return true;
    };

    // API
    // Set 'not', 'all' and 'any' interfaces to methods based on their api property
    /* -------------------------------------------------------------------------- */

    function setInterfaces() {
        var options = is;
        for (var option in options) {
            if (hasOwnProperty.call(options, option) && is['function'](options[option])) {
                var interfaces = options[option].api || ['not', 'all', 'any'];
                for (var i = 0; i < interfaces.length; i++) {
                    if (interfaces[i] === 'not') {
                        is.not[option] = not(is[option]);
                    }
                    if (interfaces[i] === 'all') {
                        is.all[option] = all(is[option]);
                    }
                    if (interfaces[i] === 'any') {
                        is.any[option] = any(is[option]);
                    }
                }
            }
        }
    }
    setInterfaces();

    // Configuration methods
    // Intentionally added after setInterfaces function
    /* -------------------------------------------------------------------------- */

    // change namespace of library to prevent name collisions
    // var preferredName = is.setNamespace();
    // preferredName.odd(3);
    // => true
    is.setNamespace = function() {
        root.is = previousIs;
        return this;
    };

    // set optional regexes to methods
    is.setRegexp = function(regexp, name) {
        for (var r in regexes) {
            if (hasOwnProperty.call(regexes, r) && (name === r)) {
                regexes[r] = regexp;
            }
        }
    };

    return is;
}));
});

// @ts-check

const inArray = (name, value, schema) => ({
  isValid: is.inArray(value, schema.inArray),
  errorText: `Value of ${name} should be within [${schema.inArray.toString()}].`
});

const matchRegex = (name, value, schema) => ({
  isValid: schema.matchRegex.test(value),
  errorText: `Value of ${name} is not valid.`
});

const isEmail = (name, value) => ({
  isValid: is.email(value),
  errorText: `${name} should be email.`
});

const isUrl = (name, value) => ({
  isValid: is.url(value),
  errorText: `${name} should be a URL.`
});

const isCreditCard = (name, value) => ({
  isValid: is.creditCard(value * 1),
  errorText: `${name} should be a credit card number.`
});

const isHexColor = (name, value) => ({
  isValid: is.hexColor(value),
  errorText: `${name} should be a hex color.`
});

const notEmpty = (name, value) => ({
  isValid: is.not.empty(value),
  errorText: `${name} should not be empty.`
});

const isIP = (name, value, schema) => {
  let isValid;
  let ipString = '';

  switch (schema.isIP) {
    case 'v4':
      isValid = is.ipv4(value);
      ipString = 'IPv4';
      break;
    case 'v6':
      isValid = is.ipv6(value);
      ipString = 'IPv6';
      break;
    case 'all':
      isValid = is.ip(value);
      ipString = 'IP';
      break;
    default:
      isValid = is.ip(value);
      ipString = 'IP';
      break;
  }

  return {
    isValid,
    errorText: `${name} should be ${ipString} address.`
  };
};

const min = (name, value, schema) => ({
  isValid: is.above(value * 1, schema.min * 1),
  errorText: `${name} should be greater than ${schema.min}. Current: ${value}`
});

const max = (name, value, schema) => ({
  isValid: is.under(value * 1, schema.max * 1),
  errorText: `${name} should be less than ${schema.max}. Current: ${value}`
});

const equal = (name, value, schema) => ({
  isValid: is.equal(value * 1, schema.equal * 1),
  errorText: `${name} should equal to ${schema.equal * 1}.`
});

const notEqual = (name, value, schema) => ({
  isValid: is.not.equal(value * 1, schema.notEqual * 1),
  errorText: `${name} should not equal to ${schema.notEqual * 1}.`
});

const isPositive = (name, value) => ({
  isValid: is.positive(value * 1),
  errorText: `${name} should be positive.`
});

const isNegative = (name, value) => ({
  isValid: is.negative(value * 1),
  errorText: `${name} should be negative.`
});

const isInt = (name, value) => ({
  isValid: is.integer(value * 1),
  errorText: `${name} should be integer.`
});

const isDecimal = (name, value) => ({
  isValid: is.decimal(value * 1),
  errorText: `${name} should be decimal.`
});

const isIntOrDecimal = (name, value) => ({
  isValid: is.integer(value * 1) || is.decimal(value * 1),
  errorText: `${name} should be either integer or decimal.`
});

/* eslint-disable max-len */

const minLength = (name, value, schema) => ({
  isValid: is.equal(value.length, schema.minLength) || is.above(value.length, schema.minLength),
  errorText: `${name}'s length should be equal or greater than ${schema.minLength}. Current: ${value.length}`
});

const maxLength = (name, value, schema) => ({
  isValid: is.equal(value.length, schema.maxLength) || is.under(value.length, schema.maxLength),
  errorText: `${name}'s length should be equal or less than ${schema.maxLength}. Current: ${value.length}`
});

const include = (name, value, schema) => ({
  isValid: is.include(value, schema.include),
  errorText: `${name} should include ${schema.include}. Current: ${value}`
});

const exclude = (name, value, schema) => ({
  isValid: is.not.include(value, schema.exclude),
  errorText: `${name} should not include ${schema.exclude}. Current: ${value}`
});

const startWith = (name, value, schema) => ({
  isValid: is.startWith(value, schema.startWith),
  errorText: `${name} should start with '${schema.startWith}'.`
});

const notStartWith = (name, value, schema) => ({
  isValid: is.not.startWith(value, schema.notStartWith),
  errorText: `${name} should not start with '${schema.notStartWith}'.`
});

const endWith = (name, value, schema) => ({
  isValid: is.endWith(value, schema.endWith),
  errorText: `${name} should end with '${schema.endWith}'.`
});

const notEndWith = (name, value, schema) => ({
  isValid: is.not.endWith(value, schema.notEndWith),
  errorText: `${name} should not end with '${schema.notEndWith}'.`
});

// If the rule expects an array as value, please put
// it here, so we can extract user defined error message
// without problem.
const RuleWhichNeedsArray = ['inArray'];

// This is for rule which expect a boolean value,
// Will ignore the check if the value if false.
const RuleWhichNeedsBoolean = [
  'isEmail',
  'isUrl',
  'isCreditCard',
  'isHexColor',
  'isDecimal',
  'isInt',
  'isNegative',
  'isPositive',
  'isIntOrDecimal'
];

const handlerMatcher = {
  /* String handlers */
  minLength: minLength,
  maxLength: maxLength,
  include: include,
  exclude: exclude,
  startWith: startWith,
  notStartWith: notStartWith,
  endWith: endWith,
  notEndWith: notEndWith,

  /* Number handlers */
  min: min,
  max: max,
  equal: equal,
  notEqual: notEqual,
  isPositive: isPositive,
  isNegative: isNegative,
  isInt: isInt,
  isDecimal: isDecimal,
  isIntOrDecimal: isIntOrDecimal,

  /* General handlers */
  inArray: inArray,
  matchRegex: matchRegex,
  isEmail: isEmail,
  isUrl: isUrl,
  isCreditCard: isCreditCard,
  isHexColor: isHexColor,
  notEmpty: notEmpty,
  isIP: isIP
};

const FieldStatus = {
    ok: 'ok',
    error: 'error',
    normal: 'normal'
};

function createNewFieldState() {
    return {
        status: FieldStatus.normal,
        errorText: '',
        value: undefined
    };
}

/**
 * throw an error with defined text, usually calls by ruleRunner().
 */
function throwError(
    value,
    errorText
  ) {
    // eslint-disable-next-line no-throw-literal
    throw { value, errorText, status: FieldStatus.error };
}

function extractUserDefinedMsg(
    handlerName,
    schema
  ) {
    const userErrorTextKey = `${handlerName}_userErrorText`;  
    const result = { schema, userErrorText: '' };
  
    // No user message or already processed
    if (is.not.array(schema[handlerName])) {
        if (schema[userErrorTextKey]) {
            result.userErrorText = result.schema[userErrorTextKey];
        }
        return result;
    }    
    const currentSchema = schema[handlerName];
  
    // Handle the case where the value of rule is array
    if (RuleWhichNeedsArray.includes(handlerName)) {
      // No user message, just return
      if (is.not.array(currentSchema[0])) return result;
    }
  
    // The most common case: [0] is rule and [1] is errText
    const [rule, errText] = currentSchema;
    result.schema[handlerName] = rule;
    result.schema[userErrorTextKey] = errText;
    result.userErrorText = errText;
    return result;
}

function grabValueForReliesField(
    allSchema,
    allState,
    reliedFieldName
  ) {
    let result;
  
    if (
        allState[reliedFieldName] != null &&
        allState[reliedFieldName].value != null
    ) {
        result = allState[reliedFieldName].value;
    }
    else if (
        allSchema.collectValues != null &&
        allSchema.collectValues[reliedFieldName] != null
    ) {
        result = getNestedValue(
            allSchema.collectValues[reliedFieldName],
            allState
        );
    }
  
    return result;
}

function isOnlyWhenFulfilled(
    fieldOnlyWhenSchema,
    fieldState,
    allSchema,
    allState
  ) {
    return Object.keys(fieldOnlyWhenSchema).every(reliedFieldName => {
        const reliesKeySchema = fieldOnlyWhenSchema[reliedFieldName];
  
        return Object.keys(reliesKeySchema).every(rule => {
            const reliedFieldValue = grabValueForReliesField(
                allSchema,
                allState,
                reliedFieldName
            );
    
            try {
                ruleRunner(
                    rule,
                    handlerMatcher[rule],
                    reliedFieldName,
                    reliedFieldValue, // Here we need to swap the field value to the target value
                    reliesKeySchema
                );
            } catch (err) {
                return false;
            }
    
            return true;
        });
    });
}

function runMatchers(
    matcher,
    fieldState,
    fieldSchema,
    fieldName,
    allSchema,
    allState
  ) {
    const fieldRules = fieldSchema[fieldName];
  
    if (fieldRules.onlyWhen != null) {
        if (allSchema && allState) {
            const result = isOnlyWhenFulfilled(
                fieldRules.onlyWhen,
                {...fieldState},
                allSchema,
                allState
            );
    
            if (result === false) {
                fieldState.status = FieldStatus.normal;
                return fieldState;
            }
        }
    }
  
    if (
        fieldRules.beforeValidation != null
    ) {
        fieldState.value = handleBeforeValidation(
            fieldState.value,
            fieldRules.beforeValidation
        );
    }
  
    Object.keys(fieldRules).forEach(ruleInSchema => {
      if (ruleInSchema === 'reliesOn') {
        const fieldReliesOnSchema = fieldSchema[fieldName].reliesOn;
        if (allSchema && allState && (fieldReliesOnSchema != null) ) {
            handleReliesOn(
                fieldReliesOnSchema,
                fieldState,
                allSchema,
                allState
            );
        }
      }
      else {
        // eslint-disable-next-line no-use-before-define
        ruleRunner (
            ruleInSchema,
            matcher[ruleInSchema],
            fieldName,
            fieldState.value,
            fieldRules
        );
      }
  
      // TODO: Do something when the rule is not match
      // else if (ruleInSchema !== 'default') {
      // }
    });
    return fieldState;
}

function ruleRunner(
    ruleName,
    ruleHandler,
    fieldName,
    value,
    fieldRules
  ) {
    if (ruleHandler == null) {
        if (ruleName.indexOf('_userErrorText') === -1){
            console.warn(`${ruleName} is invalid. Please check the online doc for more reference: https://albert-gao.github.io/veasy/#/rules`);
        }            
        return;
    }
  
    const { schema, userErrorText } = extractUserDefinedMsg (
        ruleName,
        fieldRules
    );
  
    if (RuleWhichNeedsBoolean.includes(ruleName)) {
        if (schema[ruleName] === false) return;
    }
  
    const result = ruleHandler(fieldName, value, schema);
    if (result.isValid) return;
  
    throwError(value, userErrorText || result.errorText);
}

function rulesRunner(
    value,
    fieldSchema,
    fieldName,
    allSchema,
    allState
  ) {
    const fieldState = createNewFieldState();
    fieldState.value = value;
  
    if (
        is.existy(value) &&
        is.not.empty(value)
    ) {
        fieldState.status = FieldStatus.ok;
    }
  
    try {
        return runMatchers(
            handlerMatcher,
            fieldState,
            fieldSchema,
            fieldName,
            allSchema,
            allState
        );
    } catch (err) {
        return err;
    }
}

const intialData = { 
    type: 'text',
    placeholder: '',
    label: '',
    inputClass: '',
    value: '',
    text: '',
    class: '',
    readOnly: false,
    required: false,
    pattern: '',
    validate: null,
    uniqueId: false,
    submit: false,
    error: '',
};

var fieldBase = {
    data() {
        return Object.assign({}, intialData);
    },
    fieldData(data) {
        // console.log('field-base', data);
        return Object.assign({}, { settings: null }, intialData, data);
    },
    oncreate(p) {
        const { uuid, settings, type } = p.get();
        const element = p.refs.input;
        element.onkeyup = (e) => {
            if (p.get().submit) {
                element.preValidate && element.preValidate(p);
                let error = element.checkValidity() ? '' : element.validationMessage;
                p.set({error});
            }
        };
        element.setError = (error) => {
            p.set({error, submit: true});
        };
        if (uuid) {
            element.setAttribute('id', uuid);
        }
        p.set({ element });        
    },
    preValidate() {
        const { formSchema, element, field } = this.get();
        const fieldValue = element.value;
        const fieldSchema = formSchema[field];
        let result = { errorText: '' };
        if (fieldSchema){
            result = rulesRunner(fieldValue, formSchema, field);   
        } 
        // console.log('TextInput - preValidate()', this, schema);
        element.setCustomValidity(result.errorText);
    },
    validate(p) { 
        const { element } = p.get();       
        if (element.checkValidity) {
            element.setError(element.validationMessage);
        }
        return element.checkValidity();
    },
    mergeProps(p, s) {
        const t = p.get(), n = {};   
        for (let k in s) {
            if (t[k] !== undefined) {
                n[k] = s[k];
            }
        }                            
        p.set(n);
    },
    makeUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}

/* src\Field.html generated by Svelte v2.5.0 */

function settings(all) { 
				return all.settings;
			}

function message({ submit, error }) {
    return submit ? error : '';
}

function label({ settings }) { 
    return settings ? settings.label : null;
}

function data() {
    const initialData = { 
        uuid: fieldBase.makeUniqueId(),
        submit: false,
        error: '',
        settings: null,
        fieldtype: null,
        value: '',
    };
    return Object.assign({}, initialData, fieldBase.fieldData());
}
function add_css() {
	var style = createElement("style");
	style.id = 'svelte-u293zm-style';
	style.textContent = ".invalid-feedback.svelte-u293zm{display:block}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmllbGQuaHRtbCIsInNvdXJjZXMiOlsiRmllbGQuaHRtbCJdLCJzb3VyY2VzQ29udGVudCI6WyI8ZGl2IGNsYXNzPVwiZm9ybS1ncm91cCByb3dcIj5cclxuICAgIDxsYWJlbCBjbGFzcz1cImNvbC00IGNvbC1mb3JtLWxhYmVsXCIgZm9yPXt1dWlkfT57bGFiZWx9PC9sYWJlbD5cclxuICAgIDxkaXYgY2xhc3M9XCJjb2wtOFwiPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICAgIDxzdmVsdGU6Y29tcG9uZW50IHRoaXM9XCJ7ZmllbGR0eXBlfVwiIHsuLi5zZXR0aW5nc30gYmluZDp2YWx1ZSBiaW5kOnN1Ym1pdCBiaW5kOmVycm9yIHt1dWlkfSAvPlxyXG4gICAgICAgICAgICB7I2lmIHN1Ym1pdCAmJiBlcnJvcn1cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImludmFsaWQtZmVlZGJhY2tcIj5cclxuICAgICAgICAgICAgICAgIHttZXNzYWdlfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgey9pZn1cclxuICAgICAgICA8L2Rpdj4gICAgICAgXHJcbiAgICA8L2Rpdj5cclxuPC9kaXY+XHJcblxyXG48c2NyaXB0PlxyXG4gICAgaW1wb3J0IGZpZWxkQmFzZSBmcm9tICcuL2lucHV0cy9maWVsZC1iYXNlJztcclxuXHJcbiAgICBleHBvcnQgZGVmYXVsdCB7XHJcbiAgICAgICAgZGF0YSgpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbERhdGEgPSB7IFxyXG4gICAgICAgICAgICAgICAgdXVpZDogZmllbGRCYXNlLm1ha2VVbmlxdWVJZCgpLFxyXG4gICAgICAgICAgICAgICAgc3VibWl0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiAnJyxcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgZmllbGR0eXBlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBpbml0aWFsRGF0YSwgZmllbGRCYXNlLmZpZWxkRGF0YSgpKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjb21wdXRlZDp7XHJcbiAgICAgICAgICAgIHNldHRpbmdzOiAoYWxsKSA9PiB7IFxyXG5cdFx0XHRcdHJldHVybiBhbGwuc2V0dGluZ3M7XHJcblx0XHRcdH0sXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICh7IHN1Ym1pdCwgZXJyb3IgfSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Ym1pdCA/IGVycm9yIDogJyc7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGxhYmVsOiAoeyBzZXR0aW5ncyB9KSA9PiB7IFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldHRpbmdzID8gc2V0dGluZ3MubGFiZWwgOiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG48L3NjcmlwdD5cclxuXHJcbjxzdHlsZT5cclxuICAgIC5pbnZhbGlkLWZlZWRiYWNrIHtcclxuICAgICAgICBkaXNwbGF5OiBibG9jaztcclxuICAgIH1cclxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBNkNJLGlCQUFpQixjQUFDLENBQUMsQUFDZixPQUFPLENBQUUsS0FBSyxBQUNsQixDQUFDIn0= */";
	appendNode(style, document.head);
}

function create_main_fragment(component, ctx) {
	var div, label_1, text, text_1, div_1, div_2, switch_instance_updating = {}, text_2;

	var switch_instance_spread_levels = [
		ctx.settings,
		{ uuid: ctx.uuid }
	];

	var switch_value = ctx.fieldtype;

	function switch_props(ctx) {
		var switch_instance_initial_data = {};
		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
		}
		if ('value' in ctx) {
			switch_instance_initial_data.value = ctx.value ;
			switch_instance_updating.value = true;
		}
		if ('submit' in ctx) {
			switch_instance_initial_data.submit = ctx.submit ;
			switch_instance_updating.submit = true;
		}
		if ('error' in ctx) {
			switch_instance_initial_data.error = ctx.error ;
			switch_instance_updating.error = true;
		}
		return {
			root: component.root,
			data: switch_instance_initial_data,
			_bind: function(changed, childState) {
				var newState = {};
				if (!switch_instance_updating.value && changed.value) {
					newState.value = childState.value;
				}

				if (!switch_instance_updating.submit && changed.submit) {
					newState.submit = childState.submit;
				}

				if (!switch_instance_updating.error && changed.error) {
					newState.error = childState.error;
				}
				component._set(newState);
				switch_instance_updating = {};
			}
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));

		component.root._beforecreate.push(function() {
			switch_instance._bind({ value: 1, submit: 1, error: 1 }, switch_instance.get());
		});
	}

	var if_block = (ctx.submit && ctx.error) && create_if_block(component, ctx);

	return {
		c: function create() {
			div = createElement("div");
			label_1 = createElement("label");
			text = createText(ctx.label);
			text_1 = createText("\r\n    ");
			div_1 = createElement("div");
			div_2 = createElement("div");
			if (switch_instance) switch_instance._fragment.c();
			text_2 = createText("\r\n            ");
			if (if_block) if_block.c();
			label_1.className = "col-4 col-form-label";
			label_1.htmlFor = ctx.uuid;
			div_2.className = "form-group";
			div_1.className = "col-8";
			div.className = "form-group row";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label_1, div);
			appendNode(text, label_1);
			appendNode(text_1, div);
			appendNode(div_1, div);
			appendNode(div_2, div_1);

			if (switch_instance) {
				switch_instance._mount(div_2, null);
			}

			appendNode(text_2, div_2);
			if (if_block) if_block.m(div_2, null);
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			if (changed.label) {
				text.data = ctx.label;
			}

			if (changed.uuid) {
				label_1.htmlFor = ctx.uuid;
			}

			var switch_instance_changes = {};
			var switch_instance_changes = (changed.settings || changed.uuid) && getSpreadUpdate(switch_instance_spread_levels, [
				changed.settings && ctx.settings,
				changed.uuid && { uuid: ctx.uuid }
			]);
			if (!switch_instance_updating.value && changed.value) {
				switch_instance_changes.value = ctx.value ;
				switch_instance_updating.value = true;
			}
			if (!switch_instance_updating.submit && changed.submit) {
				switch_instance_changes.submit = ctx.submit ;
				switch_instance_updating.submit = true;
			}
			if (!switch_instance_updating.error && changed.error) {
				switch_instance_changes.error = ctx.error ;
				switch_instance_updating.error = true;
			}

			if (switch_value !== (switch_value = ctx.fieldtype)) {
				if (switch_instance) switch_instance.destroy();

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance._fragment.c();
					switch_instance._mount(div_2, text_2);
				}
			}

			else if (switch_value) {
				switch_instance._set(switch_instance_changes);
				switch_instance_updating = {};
			}

			if (ctx.submit && ctx.error) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block(component, ctx);
					if_block.c();
					if_block.m(div_2, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}

			if (switch_instance) switch_instance.destroy();
			if (if_block) if_block.d();
		}
	};
}

// (6:12) {#if submit && error}
function create_if_block(component, ctx) {
	var div, text;

	return {
		c: function create() {
			div = createElement("div");
			text = createText(ctx.message);
			div.className = "invalid-feedback svelte-u293zm";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
		},

		p: function update(changed, ctx) {
			if (changed.message) {
				text.data = ctx.message;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

function Field(options) {
	this._debugName = '<Field>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data(), options.data);
	this._recompute({ submit: 1, error: 1, settings: 1 }, this._state);
	if (!('submit' in this._state)) console.warn("<Field> was created without expected data property 'submit'");
	if (!('error' in this._state)) console.warn("<Field> was created without expected data property 'error'");

	if (!('uuid' in this._state)) console.warn("<Field> was created without expected data property 'uuid'");

	if (!('fieldtype' in this._state)) console.warn("<Field> was created without expected data property 'fieldtype'");
	if (!('value' in this._state)) console.warn("<Field> was created without expected data property 'value'");

	if (!document.getElementById("svelte-u293zm-style")) add_css();

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(Field.prototype, protoDev);

Field.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('message' in newState && !this._updatingReadonlyProperty) throw new Error("<Field>: Cannot set read-only property 'message'");
	if ('label' in newState && !this._updatingReadonlyProperty) throw new Error("<Field>: Cannot set read-only property 'label'");
	if ('settings' in newState && !this._updatingReadonlyProperty) throw new Error("<Field>: Cannot set read-only property 'settings'");
};

Field.prototype._recompute = function _recompute(changed, state) {
	if (changed.submit || changed.error) {
		if (this._differs(state.message, (state.message = message(state)))) changed.message = true;
	}

	if (changed.settings) {
		if (this._differs(state.label, (state.label = label(state)))) changed.label = true;
	}

	if (this._differs(state.settings, (state.settings = settings(state)))) changed.settings = true;
};

/* src\inputs\TextInput.html generated by Svelte v2.5.0 */

var data$1 = fieldBase.data;

function oncreate() {
    fieldBase.oncreate(this);
    const { element } = this.get();
    element.preValidate = fieldBase.preValidate.bind(this);
}
function create_main_fragment$1(component, ctx) {
	var input, input_updating = false, input_class_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ value: input.value });
		input_updating = false;
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function create() {
			input = createElement("input");
			addListener(input, "input", input_input_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "text");
			input.className = input_class_value = "form-control " + ctx.inputClass;
			input.placeholder = ctx.placeholder;
			input.readOnly = ctx.readOnly;
			input.required = ctx.required;
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = ctx.value
    ;
		},

		p: function update(changed, ctx) {
			if (!input_updating) input.value = ctx.value
    ;
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + ctx.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.placeholder) {
				input.placeholder = ctx.placeholder;
			}

			if (changed.readOnly) {
				input.readOnly = ctx.readOnly;
			}

			if (changed.required) {
				input.required = ctx.required;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) component.refs.input = null;
		}
	};
}

function TextInput(options) {
	this._debugName = '<TextInput>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$1(), options.data);
	if (!('inputClass' in this._state)) console.warn("<TextInput> was created without expected data property 'inputClass'");
	if (!('placeholder' in this._state)) console.warn("<TextInput> was created without expected data property 'placeholder'");
	if (!('value' in this._state)) console.warn("<TextInput> was created without expected data property 'value'");
	if (!('readOnly' in this._state)) console.warn("<TextInput> was created without expected data property 'readOnly'");
	if (!('required' in this._state)) console.warn("<TextInput> was created without expected data property 'required'");

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$1(this, this._state);

	this.root._oncreate.push(() => {
		oncreate.call(this);
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(TextInput.prototype, protoDev);

TextInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src\inputs\MaskedInput.html generated by Svelte v2.5.0 */

var data$2 = fieldBase.data;

var methods = {
    handleChange(e) {
        const { maxlength, pattern, placeholder, text } = this.get();
        e.target.value = this.handleCurrentValue(e);
        // document.getElementById(uuid + 'Mask').innerHTML = this.setValueOfMask(e);
        this.set({ value: e.target.value });
    },

    handleCurrentValue(e) {
        const { charset, validExample } = this.get();
        const isCharsetPresent = charset,
            maskedNumber = 'XMDY',
            maskedLetter = '_',
            placeholder = isCharsetPresent || this.get().placeholder,
            value = e.target.value, l = placeholder.length;
        let i, j, isInt, isLetter, strippedValue, matchesNumber, matchesLetter, newValue = '';

        // strip special characters
        strippedValue = isCharsetPresent ? value.replace(/\W/g, "") : value.replace(/\D/g, "");

        for (i = 0, j = 0; i < l; i++) {
            isInt = !isNaN(parseInt(strippedValue[j]));
            isLetter = strippedValue[j] ? strippedValue[j].match(/[A-Z]/i) : false;
            matchesNumber = (maskedNumber.indexOf(placeholder[i]) >= 0);
            matchesLetter = (maskedLetter.indexOf(placeholder[i]) >= 0);
            if ((matchesNumber && isInt) || (isCharsetPresent && matchesLetter && isLetter)) {
                newValue += strippedValue[j++];
            } else if ((!isCharsetPresent && !isInt && matchesNumber) || (isCharsetPresent && ((matchesLetter && !isLetter) || (matchesNumber && !isInt)))) {
                return newValue;
            } else {
                newValue += placeholder[i];
            }
            // break if no characters left and the pattern is non-special character
            if (strippedValue[j] == undefined) {
                break;
            }
        }

        if (validExample) {
            return this.validateProgress(e, newValue);
        }                
        return newValue;
    },

    validateProgress(e, value) {
        const { pattern, placeholder, validExample } = this.get();
        let l = value.length, testValue = '', i;
        const regex = new RegExp(this.props.pattern);

        //convert to months
        if ((l == 1) && (placeholder.toUpperCase().substr(0, 2) == 'MM')) {
            if(value > 1 && value < 10) {
                value = '0' + value;
            }
            return value;
        }

        for ( i = l; i >= 0; i--) {
            testValue = value + validExample.substr(value.length);
            if (regex.test(testValue)) {
                return value;
            } else {
                value = value.substr(0, value.length-1);
            }
        }

        return value;
    },
};

function oncreate$1() {
    fieldBase.oncreate(this);
}
function onstate({ changed, current }) {
    if (changed.value) {
        this.set({ text: current.value });
    }
}
function create_main_fragment$2(component, ctx) {
	var input, input_updating = false, input_class_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ text: input.value });
		input_updating = false;
	}

	function input_handler(event) {
		component.handleChange(event);
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function create() {
			input = createElement("input");
			addListener(input, "input", input_input_handler);
			addListener(input, "input", input_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "text");
			input.className = input_class_value = "form-control masked " + ctx.inputClass;
			input.readOnly = ctx.readOnly;
			input.required = ctx.required;
			input.pattern = ctx.pattern;
			input.placeholder = ctx.placeholder;
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = ctx.text;
		},

		p: function update(changed, ctx) {
			if (!input_updating) input.value = ctx.text;
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control masked " + ctx.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.readOnly) {
				input.readOnly = ctx.readOnly;
			}

			if (changed.required) {
				input.required = ctx.required;
			}

			if (changed.pattern) {
				input.pattern = ctx.pattern;
			}

			if (changed.placeholder) {
				input.placeholder = ctx.placeholder;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "input", input_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) component.refs.input = null;
		}
	};
}

function MaskedInput(options) {
	this._debugName = '<MaskedInput>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$2(), options.data);
	if (!('inputClass' in this._state)) console.warn("<MaskedInput> was created without expected data property 'inputClass'");
	if (!('text' in this._state)) console.warn("<MaskedInput> was created without expected data property 'text'");
	if (!('readOnly' in this._state)) console.warn("<MaskedInput> was created without expected data property 'readOnly'");
	if (!('required' in this._state)) console.warn("<MaskedInput> was created without expected data property 'required'");
	if (!('pattern' in this._state)) console.warn("<MaskedInput> was created without expected data property 'pattern'");
	if (!('placeholder' in this._state)) console.warn("<MaskedInput> was created without expected data property 'placeholder'");

	this._handlers.state = [onstate];

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$2(this, this._state);

	this.root._oncreate.push(() => {
		onstate.call(this, { changed: assignTrue({}, this._state), current: this._state });
		oncreate$1.call(this);
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(MaskedInput.prototype, protoDev);
assign(MaskedInput.prototype, methods);

MaskedInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

function formatCurrency(data, alwaysShowCents = true) {
    var options = {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };
  
    if (!alwaysShowCents) {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 0;
    }
  
    return Number(data).toLocaleString('en-US', options);
}

/* src\inputs\CurrencyInput.html generated by Svelte v2.5.0 */

const toNumber$1 = v => Number(v.replace(/[^0-9\.]+/g,""));

var data$3 = fieldBase.data;

var methods$1 = {
    blur(text) {
        let value = text ? toNumber$1(text) : 0;
        if (!isNaN(value)) {
            this.set({ text: formatCurrency(value) });
        }
        if (fieldBase.validate(this)) {                    
            this.set({ value });
        }              
    },
};

function onstate$1({ changed, current, previous }) {
    fieldBase.oncreate(this, true);
    if (changed.value) {
        this.set({ text: formatCurrency(current.value) });
    }
}
function create_main_fragment$3(component, ctx) {
	var input, input_updating = false, input_class_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ text: input.value });
		input_updating = false;
	}

	function blur_handler(event) {
		component.blur(ctx.text);
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function create() {
			input = createElement("input");
			addListener(input, "input", input_input_handler);
			addListener(input, "blur", blur_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "text");
			input.className = input_class_value = "form-control " + ctx.inputClass;
			input.id = ctx.uuid;
			input.placeholder = ctx.placeholder;
			input.pattern = "^(?!\\(.*[^)]$|[^(].*\\)$)\\(?\\$?(0|[1-9]\\d{0,2}(,?\\d{3})?)(\\.\\d\\d?)?\\)?$";
			input.readOnly = ctx.readOnly;
			input.required = ctx.required;
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = ctx.text;
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			if (!input_updating) input.value = ctx.text;
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + ctx.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.uuid) {
				input.id = ctx.uuid;
			}

			if (changed.placeholder) {
				input.placeholder = ctx.placeholder;
			}

			if (changed.readOnly) {
				input.readOnly = ctx.readOnly;
			}

			if (changed.required) {
				input.required = ctx.required;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "blur", blur_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) component.refs.input = null;
		}
	};
}

function CurrencyInput(options) {
	this._debugName = '<CurrencyInput>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$3(), options.data);
	if (!('inputClass' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'inputClass'");
	if (!('uuid' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'uuid'");
	if (!('placeholder' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'placeholder'");
	if (!('text' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'text'");
	if (!('readOnly' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'readOnly'");
	if (!('required' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'required'");

	this._handlers.state = [onstate$1];

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$3(this, this._state);

	this.root._oncreate.push(() => {
		onstate$1.call(this, { changed: assignTrue({}, this._state), current: this._state });
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(CurrencyInput.prototype, protoDev);
assign(CurrencyInput.prototype, methods$1);

CurrencyInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src\inputs\SelectInput.html generated by Svelte v2.5.0 */

function data$4() {
    return { 
        uuid: '',
        label: '',
        inputClass: '',
        value: '',
        optionList: [],
        getOptionName: (x) => x.name,
        optionValue: 'id'
    }
}
function oncreate$2() {
    fieldBase.oncreate(this);
}
function create_main_fragment$4(component, ctx) {
	var select, select_updating = false, select_class_value;

	var each_value = ctx.optionList;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ value: selectValue(select) });
		select_updating = false;
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function create() {
			select = createElement("select");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			addListener(select, "change", select_change_handler);
			if (!('value' in ctx)) component.root._beforecreate.push(select_change_handler);
			addListener(select, "change", change_handler);
			select.className = select_class_value = "form-control " + ctx.inputClass;
		},

		m: function mount(target, anchor) {
			insertNode(select, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			component.refs.input = select;

			selectOption(select, ctx.value);
		},

		p: function update(changed, ctx) {
			if (changed.optionList || changed.optionValue || changed.getOptionName) {
				each_value = ctx.optionList;

				for (var i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) selectOption(select, ctx.value);
			if ((changed.inputClass) && select_class_value !== (select_class_value = "form-control " + ctx.inputClass)) {
				select.className = select_class_value;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(select);
			}

			destroyEach(each_blocks, detach);

			removeListener(select, "change", select_change_handler);
			removeListener(select, "change", change_handler);
			if (component.refs.input === select) component.refs.input = null;
		}
	};
}

// (2:4) {#each optionList as opt}
function create_each_block(component, ctx) {
	var if_block_anchor;

	function select_block_type(ctx) {
		if (typeof ctx.optionList[0] === 'string') return create_if_block$1;
		return create_if_block_1;
	}

	var current_block_type = select_block_type(ctx);
	var if_block = current_block_type(component, ctx);

	return {
		c: function create() {
			if_block.c();
			if_block_anchor = createComment();
		},

		m: function mount(target, anchor) {
			if_block.m(target, anchor);
			insertNode(if_block_anchor, target, anchor);
		},

		p: function update(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(component, ctx);
				if_block.c();
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},

		d: function destroy$$1(detach) {
			if_block.d(detach);
			if (detach) {
				detachNode(if_block_anchor);
			}
		}
	};
}

// (3:8) {#if typeof optionList[0] === 'string'}
function create_if_block$1(component, ctx) {
	var option, text_value = ctx.opt, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			option.__value = option_value_value = ctx.opt;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, ctx) {
			if ((changed.optionList) && text_value !== (text_value = ctx.opt)) {
				text.data = text_value;
			}

			if ((changed.optionList) && option_value_value !== (option_value_value = ctx.opt)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(option);
			}
		}
	};
}

// (5:8) {:else}
function create_if_block_1(component, ctx) {
	var option, text_value = ctx.getOptionName(ctx.opt), text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			option.__value = option_value_value = ctx.opt[ctx.optionValue];
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, ctx) {
			if ((changed.getOptionName || changed.optionList) && text_value !== (text_value = ctx.getOptionName(ctx.opt))) {
				text.data = text_value;
			}

			if ((changed.optionList || changed.optionValue) && option_value_value !== (option_value_value = ctx.opt[ctx.optionValue])) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(option);
			}
		}
	};
}

function get_each_context(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.opt = list[i];
	child_ctx.each_value = list;
	child_ctx.opt_index = i;
	return child_ctx;
}

function SelectInput(options) {
	this._debugName = '<SelectInput>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$4(), options.data);
	if (!('inputClass' in this._state)) console.warn("<SelectInput> was created without expected data property 'inputClass'");
	if (!('value' in this._state)) console.warn("<SelectInput> was created without expected data property 'value'");
	if (!('optionList' in this._state)) console.warn("<SelectInput> was created without expected data property 'optionList'");
	if (!('optionValue' in this._state)) console.warn("<SelectInput> was created without expected data property 'optionValue'");
	if (!('getOptionName' in this._state)) console.warn("<SelectInput> was created without expected data property 'getOptionName'");

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$4(this, this._state);

	this.root._oncreate.push(() => {
		oncreate$2.call(this);
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
		callAll(this._oncreate);
	}
}

assign(SelectInput.prototype, protoDev);

SelectInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src\inputs\NumberInput.html generated by Svelte v2.5.0 */

var data$5 = fieldBase.data;

function oncreate$3() {
    fieldBase.oncreate(this);
    const { element } = this.get();
    element.preValidate = fieldBase.preValidate.bind(this);
}
function create_main_fragment$5(component, ctx) {
	var input, input_updating = false, input_class_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ value: toNumber(input.value) });
		input_updating = false;
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function create() {
			input = createElement("input");
			addListener(input, "input", input_input_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "number");
			input.className = input_class_value = "form-control " + ctx.inputClass;
			input.placeholder = ctx.placeholder;
			input.readOnly = ctx.readOnly;
			input.required = ctx.required;
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = ctx.value
    ;
		},

		p: function update(changed, ctx) {
			if (!input_updating) input.value = ctx.value
    ;
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + ctx.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.placeholder) {
				input.placeholder = ctx.placeholder;
			}

			if (changed.readOnly) {
				input.readOnly = ctx.readOnly;
			}

			if (changed.required) {
				input.required = ctx.required;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "input", input_input_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) component.refs.input = null;
		}
	};
}

function NumberInput(options) {
	this._debugName = '<NumberInput>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$5(), options.data);
	if (!('inputClass' in this._state)) console.warn("<NumberInput> was created without expected data property 'inputClass'");
	if (!('placeholder' in this._state)) console.warn("<NumberInput> was created without expected data property 'placeholder'");
	if (!('value' in this._state)) console.warn("<NumberInput> was created without expected data property 'value'");
	if (!('readOnly' in this._state)) console.warn("<NumberInput> was created without expected data property 'readOnly'");
	if (!('required' in this._state)) console.warn("<NumberInput> was created without expected data property 'required'");

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$5(this, this._state);

	this.root._oncreate.push(() => {
		oncreate$3.call(this);
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(NumberInput.prototype, protoDev);

NumberInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src\inputs\CheckboxInput.html generated by Svelte v2.5.0 */

function data$6() {
    return {
        label: '',
        class: '',
        value: false,
    }
}
function add_css$1() {
	var style = createElement("style");
	style.id = 'svelte-m11ft5-style';
	style.textContent = "input.svelte-m11ft5{margin:0 0 0 0.5rem}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tib3hJbnB1dC5odG1sIiwic291cmNlcyI6WyJDaGVja2JveElucHV0Lmh0bWwiXSwic291cmNlc0NvbnRlbnQiOlsiPGlucHV0IFxyXG4gICAgdHlwZT1cImNoZWNrYm94XCJcclxuICAgIGJpbmQ6Y2hlY2tlZD1cInZhbHVlXCJcclxuICAgIGNsYXNzPVwie2NsYXNzfVwiXHJcbiAgICBvbjpjaGFuZ2U9XCJmaXJlKCdjaGFuZ2UnLCBldmVudClcIlxyXG4vPlxyXG5cclxuPHNjcmlwdD5cclxuICAgIGV4cG9ydCBkZWZhdWx0IHtcclxuICAgICAgICBkYXRhKCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6ICcnLFxyXG4gICAgICAgICAgICAgICAgY2xhc3M6ICcnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZhbHNlLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG48L3NjcmlwdD5cclxuPHN0eWxlPlxyXG4gICAgaW5wdXQge1xyXG4gICAgICAgIG1hcmdpbjogMCAwIDAgMC41cmVtO1xyXG4gICAgfVxyXG48L3N0eWxlPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFtQkksS0FBSyxjQUFDLENBQUMsQUFDSCxNQUFNLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxBQUN4QixDQUFDIn0= */";
	appendNode(style, document.head);
}

function create_main_fragment$6(component, ctx) {
	var input;

	function input_change_handler() {
		component.set({ value: input.checked });
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function create() {
			input = createElement("input");
			addListener(input, "change", input_change_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "checkbox");
			input.className = "" + ctx.class + " svelte-m11ft5";
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);

			input.checked = ctx.value;
		},

		p: function update(changed, ctx) {
			input.checked = ctx.value;
			if (changed.class) {
				input.className = "" + ctx.class + " svelte-m11ft5";
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(input);
			}

			removeListener(input, "change", input_change_handler);
			removeListener(input, "change", change_handler);
		}
	};
}

function CheckboxInput(options) {
	this._debugName = '<CheckboxInput>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$6(), options.data);
	if (!('value' in this._state)) console.warn("<CheckboxInput> was created without expected data property 'value'");
	if (!('class' in this._state)) console.warn("<CheckboxInput> was created without expected data property 'class'");

	if (!document.getElementById("svelte-m11ft5-style")) add_css$1();

	this._fragment = create_main_fragment$6(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(CheckboxInput.prototype, protoDev);

CheckboxInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src\inputs\ActionButton.html generated by Svelte v2.5.0 */

function data$7() {
    return {
        label: '',
        class: '',
        value: false,
    }
}
function create_main_fragment$7(component, ctx) {
	var button, text, button_class_value;

	function click_handler(event) {
		component.fire('click', event);
	}

	return {
		c: function create() {
			button = createElement("button");
			text = createText(ctx.label);
			addListener(button, "click", click_handler);
			button.className = button_class_value = "btn btn-" + ctx.class;
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
			appendNode(text, button);
		},

		p: function update(changed, ctx) {
			if (changed.label) {
				text.data = ctx.label;
			}

			if ((changed.class) && button_class_value !== (button_class_value = "btn btn-" + ctx.class)) {
				button.className = button_class_value;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(button);
			}

			removeListener(button, "click", click_handler);
		}
	};
}

function ActionButton(options) {
	this._debugName = '<ActionButton>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$7(), options.data);
	if (!('class' in this._state)) console.warn("<ActionButton> was created without expected data property 'class'");
	if (!('label' in this._state)) console.warn("<ActionButton> was created without expected data property 'label'");

	this._fragment = create_main_fragment$7(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(ActionButton.prototype, protoDev);

ActionButton.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

// import { rulesRunner } from '../validations/validationUtils';

// function preValidate() {
//     const { formSchema, element, field } = this.get();
//     const fieldValue = element.value;
//     const fieldSchema = formSchema[field];
//     let result = { errorText: '' };
//     if (fieldSchema){
//         result = rulesRunner(fieldValue, formSchema);   
//     } 
//     // console.log('TextInput - preValidate()', this, schema);
//     element.setCustomValidity(result.errorText);
// }

// export const TextInput = class extends TextInputBase {
//     constructor(options) {      
//         super(options);
//         options.oncreate = this.oncreate;
//     }

//     oncreate(p) {
//         const { element } = p.get();
//         element.preValidate = preValidate.bind(p);
//     }
// }

function mergeState(data, fieldtype) {
	return Object.assign({}, data, { settings: data }, { fieldtype });
}

const TextField = class extends Field {
    constructor(options) {
		options.data = mergeState(options.data, TextInput);
		super(options);
	}    
};

const NumberField = class extends Field {
    constructor(options) {
		options.data = mergeState(options.data, NumberInput);
		super(options);
	}    
};

const MaskedField = class extends Field {
    constructor(options) {
		options.data = mergeState(options.data, MaskedInput);
		super(options);
	}    
};

const CurrencyField = class extends Field {
    constructor(options) {
		options.data = mergeState(options.data, CurrencyInput);
		super(options);
	}    
};

const SelectField = class extends Field {
	constructor(options) {
		options.data = mergeState(options.data, SelectInput);
		super(options);
	}    
};

/* src\FormField.html generated by Svelte v2.5.0 */

function fieldlabel({ settings }) {
    return settings ? settings.label : '';
}

function fieldtype({ settings }) {
    let ft = TextInput;
    if (settings.component) {
        switch (settings.component.toLowerCase()) {
            case 'currency':
                ft = CurrencyInput;
                break;
            case 'masked':
                ft = MaskedInput;
                break;
            case 'number':
                ft = NumberInput;
                break;
            case 'select':
                ft = SelectInput;
                break;
        }
    }
    return ft;
}

function data$8() {
    return { 
        uuid: fieldBase.makeUniqueId(),
        // submit: false,
        // error: '',
        value: '',
        settings: null
    }
}
function oncreate$4() {
    fieldBase.mergeProps(this, this.get().settings);
}
function create_main_fragment$8(component, ctx) {
	var field_updating = {};

	var field_initial_data = {
	 	settings: ctx.settings,
	 	fieldtype: ctx.fieldtype
	 };
	if ('value' in ctx) {
		field_initial_data.value = ctx.value ;
		field_updating.value = true;
	}
	var field = new Field({
		root: component.root,
		data: field_initial_data,
		_bind: function(changed, childState) {
			var newState = {};
			if (!field_updating.value && changed.value) {
				newState.value = childState.value;
			}
			component._set(newState);
			field_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		field._bind({ value: 1 }, field.get());
	});

	return {
		c: function create() {
			field._fragment.c();
		},

		m: function mount(target, anchor) {
			field._mount(target, anchor);
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			var field_changes = {};
			if (changed.settings) field_changes.settings = ctx.settings;
			if (changed.fieldtype) field_changes.fieldtype = ctx.fieldtype;
			if (!field_updating.value && changed.value) {
				field_changes.value = ctx.value ;
				field_updating.value = true;
			}
			field._set(field_changes);
			field_updating = {};
		},

		d: function destroy$$1(detach) {
			field.destroy(detach);
		}
	};
}

function FormField(options) {
	this._debugName = '<FormField>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$8(), options.data);
	this._recompute({ settings: 1 }, this._state);
	if (!('settings' in this._state)) console.warn("<FormField> was created without expected data property 'settings'");

	if (!('value' in this._state)) console.warn("<FormField> was created without expected data property 'value'");

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$8(this, this._state);

	this.root._oncreate.push(() => {
		oncreate$4.call(this);
		this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
	});

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormField.prototype, protoDev);

FormField.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('fieldlabel' in newState && !this._updatingReadonlyProperty) throw new Error("<FormField>: Cannot set read-only property 'fieldlabel'");
	if ('fieldtype' in newState && !this._updatingReadonlyProperty) throw new Error("<FormField>: Cannot set read-only property 'fieldtype'");
};

FormField.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.fieldlabel, (state.fieldlabel = fieldlabel(state)))) changed.fieldlabel = true;
		if (this._differs(state.fieldtype, (state.fieldtype = fieldtype(state)))) changed.fieldtype = true;
	}
};

/* src\FormCol.html generated by Svelte v2.5.0 */

function classes({ settings }) {                
    if (settings.col) {
        let cols = settings.col.split(' ');
        cols = cols.filter(x => x && x.trim()).map(x=> 'col-' + x);
        return cols.join(' ').trim();
    }
    return '';
}

function displayable({ source, settings }) {
    return source && (source.hasOwnProperty(settings.field) && source[settings.field] != null);
}

function field({ settings }) {              
    return settings.field;
}

function data$9(){
    return {
        source: {},
        settings: {},
    }
}
function create_main_fragment$9(component, ctx) {
	var div;

	function select_block_type(ctx) {
		if (ctx.edit) return create_if_block$2;
		if (ctx.displayable) return create_if_block_1$1;
		return null;
	}

	var current_block_type = select_block_type(ctx);
	var if_block = current_block_type && current_block_type(component, ctx);

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) if_block.c();
			div.className = ctx.classes;
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) if_block.m(div, null);
		},

		p: function update(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if (if_block) {
					if_block.d(1);
				}
				if_block = current_block_type && current_block_type(component, ctx);
				if (if_block) if_block.c();
				if (if_block) if_block.m(div, null);
			}

			if (changed.classes) {
				div.className = ctx.classes;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}

			if (if_block) if_block.d();
		}
	};
}

// (2:4) {#if edit}
function create_if_block$2(component, ctx) {
	var formfield_updating = {};

	var formfield_initial_data = { settings: ctx.settings };
	if (ctx.field in ctx.source) {
		formfield_initial_data.value = ctx.source[ctx.field];
		formfield_updating.value = true;
	}
	var formfield = new FormField({
		root: component.root,
		data: formfield_initial_data,
		_bind: function(changed, childState) {
			var newState = {};
			if (!formfield_updating.value && changed.value) {
				ctx.source[ctx.field] = childState.value;
				newState.source = ctx.source;
			}
			component._set(newState);
			formfield_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		formfield._bind({ value: 1 }, formfield.get());
	});

	return {
		c: function create() {
			formfield._fragment.c();
		},

		m: function mount(target, anchor) {
			formfield._mount(target, anchor);
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			var formfield_changes = {};
			if (changed.settings) formfield_changes.settings = ctx.settings;
			if (!formfield_updating.value && changed.source || changed.field) {
				formfield_changes.value = ctx.source[ctx.field];
				formfield_updating.value = true;
			}
			formfield._set(formfield_changes);
			formfield_updating = {};
		},

		d: function destroy$$1(detach) {
			formfield.destroy(detach);
		}
	};
}

// (4:25) 
function create_if_block_1$1(component, ctx) {
	var text_value = ctx.source[ctx.field], text;

	return {
		c: function create() {
			text = createText(text_value);
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		p: function update(changed, ctx) {
			if ((changed.source || changed.field) && text_value !== (text_value = ctx.source[ctx.field])) {
				text.data = text_value;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

function FormCol(options) {
	this._debugName = '<FormCol>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$9(), options.data);
	this._recompute({ settings: 1, source: 1 }, this._state);
	if (!('settings' in this._state)) console.warn("<FormCol> was created without expected data property 'settings'");
	if (!('source' in this._state)) console.warn("<FormCol> was created without expected data property 'source'");

	if (!('edit' in this._state)) console.warn("<FormCol> was created without expected data property 'edit'");

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$9(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormCol.prototype, protoDev);

FormCol.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('classes' in newState && !this._updatingReadonlyProperty) throw new Error("<FormCol>: Cannot set read-only property 'classes'");
	if ('displayable' in newState && !this._updatingReadonlyProperty) throw new Error("<FormCol>: Cannot set read-only property 'displayable'");
	if ('field' in newState && !this._updatingReadonlyProperty) throw new Error("<FormCol>: Cannot set read-only property 'field'");
};

FormCol.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.classes, (state.classes = classes(state)))) changed.classes = true;
	}

	if (changed.source || changed.settings) {
		if (this._differs(state.displayable, (state.displayable = displayable(state)))) changed.displayable = true;
	}

	if (changed.settings) {
		if (this._differs(state.field, (state.field = field(state)))) changed.field = true;
	}
};

/* src\FormGrid.html generated by Svelte v2.5.0 */

function source({ item }) {
    return item;
}

function rows({ columns, formSchema }) {                
    const maxRowNum = Math.max.apply(Math, columns.map(o => o.row));
    const rows = [];
    for (let i = 0; i <= maxRowNum; i++) {
        rows.push({ columns: [] });
    }
    columns.forEach(col => {
        col.formSchema = formSchema;
        const row = rows[col.row];
        if (row && row.columns) {
            row.columns.push(col);
            if (col.subtitle) {
                row.subtitle = col.subtitle;
            }
        }                
    });
    // console.log('computed - rows', rows);
    return rows;
}

function data$10() {
    return {
        class: '',
        edit: true,
        item: {},
        columns: [],
        formSchema: {},
    }
}
function add_css$2() {
	var style = createElement("style");
	style.id = 'svelte-z3e38j-style';
	style.textContent = ".subtitle.svelte-z3e38j{margin:0.5rem;font-size:1rem;font-weight:600;text-decoration:underline;text-transform:uppercase}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9ybUdyaWQuaHRtbCIsInNvdXJjZXMiOlsiRm9ybUdyaWQuaHRtbCJdLCJzb3VyY2VzQ29udGVudCI6WyI8Zm9ybSBjbGFzcz1cImZvcm0taG9yaXpvbnRhbFwiIHJlZjpmb3JtPlxyXG57I2VhY2ggcm93cyBhcyByb3d9XHJcbiAgICB7I2lmIHJvdy5zdWJ0aXRsZX1cclxuICAgIDxkaXYgY2xhc3M9XCJyb3cgc3VidGl0bGVcIj57cm93LnN1YnRpdGxlfTwvZGl2PlxyXG4gICAgey9pZn1cclxuICAgIDxkaXYgY2xhc3M9XCJyb3cge2NsYXNzfVwiPlxyXG4gICAgICAgIHsjZWFjaCByb3cuY29sdW1ucyBhcyBjb2x9XHJcbiAgICAgICAgPEZvcm1Db2wgc2V0dGluZ3M9e2NvbH0ge2Zvcm1TY2hlbWF9IGJpbmQ6c291cmNlIHtlZGl0fSAvPlxyXG4gICAgICAgIHsvZWFjaH1cclxuICAgIDwvZGl2PlxyXG57L2VhY2h9XHJcbjwvZm9ybT5cclxuXHJcbjxzY3JpcHQ+XHJcbmltcG9ydCBGb3JtQ29sIGZyb20gJy4vRm9ybUNvbC5odG1sJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIGRhdGEoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2xhc3M6ICcnLFxyXG4gICAgICAgICAgICBlZGl0OiB0cnVlLFxyXG4gICAgICAgICAgICBpdGVtOiB7fSxcclxuICAgICAgICAgICAgY29sdW1uczogW10sXHJcbiAgICAgICAgICAgIGZvcm1TY2hlbWE6IHt9LFxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjb21wb25lbnRzOntcclxuICAgICAgICBGb3JtQ29sXHJcbiAgICB9LFxyXG4gICAgY29tcHV0ZWQ6e1xyXG4gICAgICAgIHNvdXJjZTogKHsgaXRlbSB9KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm93czogKHsgY29sdW1ucywgZm9ybVNjaGVtYSB9KSA9PiB7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBtYXhSb3dOdW0gPSBNYXRoLm1heC5hcHBseShNYXRoLCBjb2x1bW5zLm1hcChvID0+IG8ucm93KSlcclxuICAgICAgICAgICAgY29uc3Qgcm93cyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBtYXhSb3dOdW07IGkrKykge1xyXG4gICAgICAgICAgICAgICAgcm93cy5wdXNoKHsgY29sdW1uczogW10gfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb2wuZm9ybVNjaGVtYSA9IGZvcm1TY2hlbWE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByb3cgPSByb3dzW2NvbC5yb3ddO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvdyAmJiByb3cuY29sdW1ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvdy5jb2x1bW5zLnB1c2goY29sKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29sLnN1YnRpdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdy5zdWJ0aXRsZSA9IGNvbC5zdWJ0aXRsZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NvbXB1dGVkIC0gcm93cycsIHJvd3MpO1xyXG4gICAgICAgICAgICByZXR1cm4gcm93cztcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxufVxyXG48L3NjcmlwdD5cclxuXHJcbjxzdHlsZT5cclxuICAgIC5zdWJ0aXRsZSB7XHJcbiAgICAgICAgbWFyZ2luOiAwLjVyZW07XHJcbiAgICAgICAgZm9udC1zaXplOiAxcmVtO1xyXG4gICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XHJcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XHJcbiAgICAgICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcclxuICAgIH1cclxuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBeURJLFNBQVMsY0FBQyxDQUFDLEFBQ1AsTUFBTSxDQUFFLE1BQU0sQ0FDZCxTQUFTLENBQUUsSUFBSSxDQUNmLFdBQVcsQ0FBRSxHQUFHLENBQ2hCLGVBQWUsQ0FBRSxTQUFTLENBQzFCLGNBQWMsQ0FBRSxTQUFTLEFBQzdCLENBQUMifQ== */";
	appendNode(style, document.head);
}

function create_main_fragment$10(component, ctx) {
	var form;

	var each_value = ctx.rows;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(component, get_each_context$1(ctx, each_value, i));
	}

	return {
		c: function create() {
			form = createElement("form");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			form.className = "form-horizontal";
		},

		m: function mount(target, anchor) {
			insertNode(form, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(form, null);
			}

			component.refs.form = form;
		},

		p: function update(changed, ctx) {
			if (changed.rows || changed.class || changed.formSchema || changed.edit || changed.source) {
				each_value = ctx.rows;

				for (var i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$1(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(form, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(form);
			}

			destroyEach(each_blocks, detach);

			if (component.refs.form === form) component.refs.form = null;
		}
	};
}

// (2:0) {#each rows as row}
function create_each_block$1(component, ctx) {
	var text, div, div_class_value;

	var if_block = (ctx.row.subtitle) && create_if_block$3(component, ctx);

	var each_value_1 = ctx.row.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(component, get_each_context_1(ctx, each_value_1, i));
	}

	return {
		c: function create() {
			if (if_block) if_block.c();
			text = createText("\r\n    ");
			div = createElement("div");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			div.className = div_class_value = "row " + ctx.class + " svelte-z3e38j";
		},

		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insertNode(text, target, anchor);
			insertNode(div, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},

		p: function update(changed, ctx) {
			if (ctx.row.subtitle) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block$3(component, ctx);
					if_block.c();
					if_block.m(text.parentNode, text);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (changed.rows || changed.formSchema || changed.edit || changed.source) {
				each_value_1 = ctx.row.columns;

				for (var i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_1(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value_1.length;
			}

			if ((changed.class) && div_class_value !== (div_class_value = "row " + ctx.class + " svelte-z3e38j")) {
				div.className = div_class_value;
			}
		},

		d: function destroy$$1(detach) {
			if (if_block) if_block.d(detach);
			if (detach) {
				detachNode(text);
				detachNode(div);
			}

			destroyEach(each_blocks, detach);
		}
	};
}

// (3:4) {#if row.subtitle}
function create_if_block$3(component, ctx) {
	var div, text_value = ctx.row.subtitle, text;

	return {
		c: function create() {
			div = createElement("div");
			text = createText(text_value);
			div.className = "row subtitle svelte-z3e38j";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
		},

		p: function update(changed, ctx) {
			if ((changed.rows) && text_value !== (text_value = ctx.row.subtitle)) {
				text.data = text_value;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

// (7:8) {#each row.columns as col}
function create_each_block_1(component, ctx) {
	var formcol_updating = {};

	var formcol_initial_data = {
	 	settings: ctx.col,
	 	formSchema: ctx.formSchema,
	 	edit: ctx.edit
	 };
	if ('source' in ctx) {
		formcol_initial_data.source = ctx.source ;
		formcol_updating.source = true;
	}
	var formcol = new FormCol({
		root: component.root,
		data: formcol_initial_data,
		_bind: function(changed, childState) {
			var newState = {};
			if (!formcol_updating.source && changed.source) {
				newState.source = childState.source;
			}
			component._set(newState);
			formcol_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		formcol._bind({ source: 1 }, formcol.get());
	});

	return {
		c: function create() {
			formcol._fragment.c();
		},

		m: function mount(target, anchor) {
			formcol._mount(target, anchor);
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			var formcol_changes = {};
			if (changed.rows) formcol_changes.settings = ctx.col;
			if (changed.formSchema) formcol_changes.formSchema = ctx.formSchema;
			if (changed.edit) formcol_changes.edit = ctx.edit;
			if (!formcol_updating.source && changed.source) {
				formcol_changes.source = ctx.source ;
				formcol_updating.source = true;
			}
			formcol._set(formcol_changes);
			formcol_updating = {};
		},

		d: function destroy$$1(detach) {
			formcol.destroy(detach);
		}
	};
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.row = list[i];
	child_ctx.each_value = list;
	child_ctx.row_index = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.col = list[i];
	child_ctx.each_value_1 = list;
	child_ctx.col_index = i;
	return child_ctx;
}

function FormGrid(options) {
	this._debugName = '<FormGrid>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$10(), options.data);
	this._recompute({ item: 1, columns: 1, formSchema: 1 }, this._state);
	if (!('item' in this._state)) console.warn("<FormGrid> was created without expected data property 'item'");
	if (!('columns' in this._state)) console.warn("<FormGrid> was created without expected data property 'columns'");
	if (!('formSchema' in this._state)) console.warn("<FormGrid> was created without expected data property 'formSchema'");

	if (!('class' in this._state)) console.warn("<FormGrid> was created without expected data property 'class'");

	if (!('edit' in this._state)) console.warn("<FormGrid> was created without expected data property 'edit'");

	if (!document.getElementById("svelte-z3e38j-style")) add_css$2();

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$10(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormGrid.prototype, protoDev);

FormGrid.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('source' in newState && !this._updatingReadonlyProperty) throw new Error("<FormGrid>: Cannot set read-only property 'source'");
	if ('rows' in newState && !this._updatingReadonlyProperty) throw new Error("<FormGrid>: Cannot set read-only property 'rows'");
};

FormGrid.prototype._recompute = function _recompute(changed, state) {
	if (changed.item) {
		if (this._differs(state.source, (state.source = source(state)))) changed.source = true;
	}

	if (changed.columns || changed.formSchema) {
		if (this._differs(state.rows, (state.rows = rows(state)))) changed.rows = true;
	}
};

/* src\DataCol.html generated by Svelte v2.5.0 */

function collect(obj, field) {
    if (typeof(field) === 'function')
        return field(obj);
    else if (typeof(field) === 'string')
        return obj[field];
    else
        return undefined;
}

function settings$1(all) { 
				return all.settings;
			}

function fieldtype$1({ settings }) {
    let ft = TextInput;
    if (settings.component) {
        switch (settings.component.toLowerCase()) {
            case 'text':
                ft = TextInput;
                break;
            case 'number':
                ft = NumberInput;
                break;    
            case 'masked':
                ft = MaskedInput;
                break;
            case 'currency':
                ft = CurrencyInput;
                break;
            case 'select':
                ft = SelectInput;
                break;
            case 'checkbox':
                ft = CheckboxInput;
                break;
            case 'action':
                ft = ActionButton;
                break;
        }
    }
    return ft;
}

function data$11(){
    return {
        source: {},
    }
}
function create_main_fragment$11(component, ctx) {
	var if_block_anchor;

	function select_block_type(ctx) {
		if (ctx.edit || ctx.settings.action) return create_if_block$4;
		return create_if_block_1$2;
	}

	var current_block_type = select_block_type(ctx);
	var if_block = current_block_type(component, ctx);

	return {
		c: function create() {
			if_block.c();
			if_block_anchor = createComment();
		},

		m: function mount(target, anchor) {
			if_block.m(target, anchor);
			insertNode(if_block_anchor, target, anchor);
		},

		p: function update(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(component, ctx);
				if_block.c();
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},

		d: function destroy$$1(detach) {
			if_block.d(detach);
			if (detach) {
				detachNode(if_block_anchor);
			}
		}
	};
}

// (1:0) {#if edit || settings.action}
function create_if_block$4(component, ctx) {
	var switch_instance_updating = {}, switch_instance_anchor;

	var switch_instance_spread_levels = [
		ctx.settings
	];

	var switch_value = ctx.fieldtype;

	function switch_props(ctx) {
		var switch_instance_initial_data = {};
		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
		}
		if (ctx.settings.field in ctx.source) {
			switch_instance_initial_data.value = ctx.source[ctx.settings.field];
			switch_instance_updating.value = true;
		}
		return {
			root: component.root,
			data: switch_instance_initial_data,
			_bind: function(changed, childState) {
				var newState = {};
				if (!switch_instance_updating.value && changed.value) {
					ctx.source[ctx.settings.field] = childState.value;
					newState.source = ctx.source;
				}
				component._set(newState);
				switch_instance_updating = {};
			}
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));

		component.root._beforecreate.push(function() {
			switch_instance._bind({ value: 1 }, switch_instance.get());
		});
	}

	function switch_instance_change(event) {
		component.fire("change", event);
	}

	if (switch_instance) switch_instance.on("change", switch_instance_change);
	function switch_instance_click(event) {
		component.fire("click", event);
	}

	if (switch_instance) switch_instance.on("click", switch_instance_click);

	return {
		c: function create() {
			switch_instance_anchor = createComment();
			if (switch_instance) switch_instance._fragment.c();
		},

		m: function mount(target, anchor) {
			insertNode(switch_instance_anchor, target, anchor);

			if (switch_instance) {
				switch_instance._mount(target, anchor);
			}
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			var switch_instance_changes = {};
			var switch_instance_changes = changed.settings && getSpreadUpdate(switch_instance_spread_levels, [
				ctx.settings
			]);
			if (!switch_instance_updating.value && changed.source || changed.settings) {
				switch_instance_changes.value = ctx.source[ctx.settings.field];
				switch_instance_updating.value = true;
			}

			if (switch_value !== (switch_value = ctx.fieldtype)) {
				if (switch_instance) switch_instance.destroy();

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance._fragment.c();
					switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);

					switch_instance.on("change", switch_instance_change);
					switch_instance.on("click", switch_instance_click);
				}
			}

			else if (switch_value) {
				switch_instance._set(switch_instance_changes);
				switch_instance_updating = {};
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(switch_instance_anchor);
			}

			if (switch_instance) switch_instance.destroy(detach);
		}
	};
}

// (3:0) {:else}
function create_if_block_1$2(component, ctx) {
	var text_value = collect(ctx.source, ctx.settings.field), text;

	return {
		c: function create() {
			text = createText(text_value);
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		p: function update(changed, ctx) {
			if ((changed.source || changed.settings) && text_value !== (text_value = collect(ctx.source, ctx.settings.field))) {
				text.data = text_value;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(text);
			}
		}
	};
}

function DataCol(options) {
	this._debugName = '<DataCol>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$11(), options.data);
	this._recompute({ settings: 1 }, this._state);

	if (!('edit' in this._state)) console.warn("<DataCol> was created without expected data property 'edit'");

	if (!('source' in this._state)) console.warn("<DataCol> was created without expected data property 'source'");

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$11(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(DataCol.prototype, protoDev);

DataCol.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('fieldtype' in newState && !this._updatingReadonlyProperty) throw new Error("<DataCol>: Cannot set read-only property 'fieldtype'");
	if ('settings' in newState && !this._updatingReadonlyProperty) throw new Error("<DataCol>: Cannot set read-only property 'settings'");
};

DataCol.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.fieldtype, (state.fieldtype = fieldtype$1(state)))) changed.fieldtype = true;
	}

	if (this._differs(state.settings, (state.settings = settings$1(state)))) changed.settings = true;
};

/* src\DataGrid.html generated by Svelte v2.5.0 */

function colCount({ columns }) {
	return (columns) ? columns.length : 0;
}

function data$12() {
    return {
        class: '',
        columns: [],
        edit: true,
        rows: []
    }
}
var methods$2 = {
    actionClick(event, row, action) {
        event && event.preventDefault();
        action && action(row);
    },
};

function add_css$3() {
	var style = createElement("style");
	style.id = 'svelte-bmd9at-style';
	style.textContent = "td.nopadding.svelte-bmd9at{padding:0 0}td.nopadding.svelte-bmd9at input{padding:0.35rem 0.5rem;border-width:0}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YUdyaWQuaHRtbCIsInNvdXJjZXMiOlsiRGF0YUdyaWQuaHRtbCJdLCJzb3VyY2VzQ29udGVudCI6WyI8ZGl2IHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlXCI+XHJcbiAgICA8dGFibGUgcmVmPVwidGFibGVcIiBjbGFzcz1cInRhYmxlIHRhYmxlLXN0cmlwZWQgdGFibGUtc20ge2VkaXQgPyAndGFibGUtYm9yZGVyZWQnIDogJyd9XCI+XHJcbiAgICAgICAgPHRoZWFkPlxyXG4gICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICB7I2VhY2ggY29sdW1ucyBhcyBjb2x1bW4sIHh9XHJcbiAgICAgICAgICAgICAgICA8dGggc3R5bGU9XCJ3aWR0aDogeyBjb2x1bW4ud2lkdGggPyBjb2x1bW4ud2lkdGggOiAnYXV0bycgfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHtjb2x1bW4ubGFiZWx9XHJcbiAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgey9lYWNofVxyXG4gICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgIDwvdGhlYWQ+XHJcblxyXG4gICAgICAgIDx0Ym9keT5cclxuICAgICAgICB7I2VhY2ggcm93cyBhcyByb3d9XHJcbiAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgIHsjZWFjaCBjb2x1bW5zIGFzIGNvbHVtbn1cclxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJ7ICgoIWVkaXQgJiYgY29sdW1uLmFjdGlvbikgfHwgZWRpdCkgPyAnbm9wYWRkaW5nJyA6ICcnIH0geyBjb2x1bW4ubnVtZXJpYyA/ICdudW1lcmljJyA6ICcnfSB7IGNvbHVtbi50cnVuY2F0ZSA/ICcgdHJ1bmNhdGUnIDogJycgfVwiIFxyXG5cdFx0XHRcdFx0XHRcdHN0eWxlPVwid2lkdGg6IHsgY29sdW1uLndpZHRoID8gY29sdW1uLndpZHRoIDogJ2F1dG8nIH1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPERhdGFDb2wgYmluZDpzb3VyY2U9XCJyb3dcIiBzZXR0aW5ncz1cIntjb2x1bW59XCIge2VkaXR9IG9uOmNoYW5nZT1cImZpcmUoJ3VwZGF0ZScsIHsgZXZlbnQgfSlcIiBvbjpjbGljaz1cImFjdGlvbkNsaWNrKGV2ZW50LCByb3csIGNvbHVtbi5hY3Rpb24pXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8L3RkPiAgICBcclxuICAgICAgICAgICAgICAgIHsvZWFjaH1cclxuICAgICAgICAgICAgPC90cj5cclxuICAgICAgICB7L2VhY2h9XHJcbiAgICAgICAgPC90Ym9keT5cclxuICAgIDwvdGFibGU+ICAgIFxyXG48L2Rpdj5cclxuICAgIFxyXG48c2NyaXB0PlxyXG4gICAgaW1wb3J0IERhdGFDb2wgZnJvbSAnLi9EYXRhQ29sLmh0bWwnO1xyXG4gICAgXHJcbiAgICBleHBvcnQgZGVmYXVsdCB7XHJcbiAgICAgICAgZGF0YSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzOiAnJyxcclxuICAgICAgICAgICAgICAgIGNvbHVtbnM6IFtdLFxyXG4gICAgICAgICAgICAgICAgZWRpdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJvd3M6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXBvbmVudHM6e1xyXG4gICAgICAgICAgICBEYXRhQ29sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgICAgICBjb2xDb3VudDogKHsgY29sdW1ucyB9KSA9PiAoY29sdW1ucykgPyBjb2x1bW5zLmxlbmd0aCA6IDAsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICAgIGFjdGlvbkNsaWNrKGV2ZW50LCByb3csIGFjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQgJiYgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGFjdGlvbiAmJiBhY3Rpb24ocm93KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbjwvc2NyaXB0PlxyXG5cclxuPHN0eWxlPlxyXG4gICAgdGQubm9wYWRkaW5nIHtcclxuXHRcdHBhZGRpbmc6IDAgMDtcclxuXHR9XHJcblx0dGQubm9wYWRkaW5nIDpnbG9iYWwoaW5wdXQpIHtcclxuXHRcdHBhZGRpbmc6IDAuMzVyZW0gMC41cmVtO1xyXG5cdFx0Ym9yZGVyLXdpZHRoOiAwO1xyXG5cdFx0LyogYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7ICovXHJcblx0fVxyXG48L3N0eWxlPiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF1REksRUFBRSxVQUFVLGNBQUMsQ0FBQyxBQUNoQixPQUFPLENBQUUsQ0FBQyxDQUFDLENBQUMsQUFDYixDQUFDLEFBQ0QsRUFBRSx3QkFBVSxDQUFDLEFBQVEsS0FBSyxBQUFFLENBQUMsQUFDNUIsT0FBTyxDQUFFLE9BQU8sQ0FBQyxNQUFNLENBQ3ZCLFlBQVksQ0FBRSxDQUFDLEFBRWhCLENBQUMifQ== */";
	appendNode(style, document.head);
}

function create_main_fragment$12(component, ctx) {
	var div, table, thead, tr, text_2, tbody, table_class_value;

	var each_value = ctx.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(component, get_each_context$2(ctx, each_value, i));
	}

	var each_value_1 = ctx.rows;

	var each_1_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_1_blocks[i] = create_each_block_1$1(component, get_each_1_context(ctx, each_value_1, i));
	}

	return {
		c: function create() {
			div = createElement("div");
			table = createElement("table");
			thead = createElement("thead");
			tr = createElement("tr");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			text_2 = createText("\r\n\r\n        ");
			tbody = createElement("tbody");

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].c();
			}
			setAttribute(table, "ref", "table");
			table.className = table_class_value = "table table-striped table-sm " + (ctx.edit ? 'table-bordered' : '');
			setStyle(div, "position", "relative");
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(table, div);
			appendNode(thead, table);
			appendNode(tr, thead);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}

			appendNode(text_2, table);
			appendNode(tbody, table);

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].m(tbody, null);
			}
		},

		p: function update(changed, ctx) {
			if (changed.columns) {
				each_value = ctx.columns;

				for (var i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$2(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}

			if (changed.columns || changed.edit || changed.rows) {
				each_value_1 = ctx.rows;

				for (var i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_1_context(ctx, each_value_1, i);

					if (each_1_blocks[i]) {
						each_1_blocks[i].p(changed, child_ctx);
					} else {
						each_1_blocks[i] = create_each_block_1$1(component, child_ctx);
						each_1_blocks[i].c();
						each_1_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_1_blocks.length; i += 1) {
					each_1_blocks[i].d(1);
				}
				each_1_blocks.length = each_value_1.length;
			}

			if ((changed.edit) && table_class_value !== (table_class_value = "table table-striped table-sm " + (ctx.edit ? 'table-bordered' : ''))) {
				table.className = table_class_value;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(div);
			}

			destroyEach(each_blocks, detach);

			destroyEach(each_1_blocks, detach);
		}
	};
}

// (5:16) {#each columns as column, x}
function create_each_block$2(component, ctx) {
	var th, text_value = ctx.column.label, text;

	return {
		c: function create() {
			th = createElement("th");
			text = createText(text_value);
			setStyle(th, "width", (ctx.column.width ? ctx.column.width : 'auto'));
		},

		m: function mount(target, anchor) {
			insertNode(th, target, anchor);
			appendNode(text, th);
		},

		p: function update(changed, ctx) {
			if ((changed.columns) && text_value !== (text_value = ctx.column.label)) {
				text.data = text_value;
			}

			if (changed.columns) {
				setStyle(th, "width", (ctx.column.width ? ctx.column.width : 'auto'));
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(th);
			}
		}
	};
}

// (14:8) {#each rows as row}
function create_each_block_1$1(component, ctx) {
	var tr;

	var each_value_2 = ctx.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(component, get_each_context_1$1(ctx, each_value_2, i));
	}

	return {
		c: function create() {
			tr = createElement("tr");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
		},

		m: function mount(target, anchor) {
			insertNode(tr, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tr, null);
			}
		},

		p: function update(changed, ctx) {
			if (changed.edit || changed.columns || changed.rows) {
				each_value_2 = ctx.columns;

				for (var i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_1$1(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_2(component, child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value_2.length;
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(tr);
			}

			destroyEach(each_blocks, detach);
		}
	};
}

// (16:16) {#each columns as column}
function create_each_block_2(component, ctx) {
	var td, datacol_updating = {}, td_class_value;

	var datacol_initial_data = { settings: ctx.column, edit: ctx.edit };
	if ('row' in ctx) {
		datacol_initial_data.source = ctx.row;
		datacol_updating.source = true;
	}
	var datacol = new DataCol({
		root: component.root,
		data: datacol_initial_data,
		_bind: function(changed, childState) {
			var newState = {};
			if (!datacol_updating.source && changed.source) {
				ctx.each_value_1[ctx.row_index] = childState.source = childState.source;

				newState.rows = ctx.rows;
			}
			component._set(newState);
			datacol_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		datacol._bind({ source: 1 }, datacol.get());
	});

	datacol.on("change", function(event) {
		component.fire('update', { event });
	});
	datacol.on("click", function(event) {
		component.actionClick(event, ctx.row, ctx.column.action);
	});

	return {
		c: function create() {
			td = createElement("td");
			datacol._fragment.c();
			td.className = td_class_value = "" + (((!ctx.edit && ctx.column.action) || ctx.edit) ? 'nopadding' : '') + " " + (ctx.column.numeric ? 'numeric' : '') + " " + (ctx.column.truncate ? ' truncate' : '') + " svelte-bmd9at";
			setStyle(td, "width", (ctx.column.width ? ctx.column.width : 'auto'));
		},

		m: function mount(target, anchor) {
			insertNode(td, target, anchor);
			datacol._mount(td, null);
		},

		p: function update(changed, _ctx) {
			ctx = _ctx;
			var datacol_changes = {};
			if (changed.columns) datacol_changes.settings = ctx.column;
			if (changed.edit) datacol_changes.edit = ctx.edit;
			if (!datacol_updating.source && changed.rows) {
				datacol_changes.source = ctx.row;
				datacol_updating.source = true;
			}
			datacol._set(datacol_changes);
			datacol_updating = {};

			if ((changed.edit || changed.columns) && td_class_value !== (td_class_value = "" + (((!ctx.edit && ctx.column.action) || ctx.edit) ? 'nopadding' : '') + " " + (ctx.column.numeric ? 'numeric' : '') + " " + (ctx.column.truncate ? ' truncate' : '') + " svelte-bmd9at")) {
				td.className = td_class_value;
			}

			if (changed.columns) {
				setStyle(td, "width", (ctx.column.width ? ctx.column.width : 'auto'));
			}
		},

		d: function destroy$$1(detach) {
			if (detach) {
				detachNode(td);
			}

			datacol.destroy();
		}
	};
}

function get_each_context$2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.column = list[i];
	child_ctx.each_value = list;
	child_ctx.x = i;
	return child_ctx;
}

function get_each_1_context(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.row = list[i];
	child_ctx.each_value_1 = list;
	child_ctx.row_index = i;
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.column = list[i];
	child_ctx.each_value_2 = list;
	child_ctx.column_index = i;
	return child_ctx;
}

function DataGrid(options) {
	this._debugName = '<DataGrid>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$12(), options.data);
	this._recompute({ columns: 1 }, this._state);
	if (!('columns' in this._state)) console.warn("<DataGrid> was created without expected data property 'columns'");
	if (!('edit' in this._state)) console.warn("<DataGrid> was created without expected data property 'edit'");
	if (!('rows' in this._state)) console.warn("<DataGrid> was created without expected data property 'rows'");

	if (!document.getElementById("svelte-bmd9at-style")) add_css$3();

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$12(this, this._state);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(DataGrid.prototype, protoDev);
assign(DataGrid.prototype, methods$2);

DataGrid.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('colCount' in newState && !this._updatingReadonlyProperty) throw new Error("<DataGrid>: Cannot set read-only property 'colCount'");
};

DataGrid.prototype._recompute = function _recompute(changed, state) {
	if (changed.columns) {
		if (this._differs(state.colCount, (state.colCount = colCount(state)))) changed.colCount = true;
	}
};

export { FormGrid, DataGrid, ActionButton, TextField, NumberField, MaskedField, CurrencyField, SelectField };
//# sourceMappingURL=formgrid.es.js.map
