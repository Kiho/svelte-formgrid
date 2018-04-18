function noop() {}

function assign(tar, src) {
	for (var k in src) tar[k] = src[k];
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

function reinsertBefore(after, target) {
	var parent = after.parentNode;
	while (parent.firstChild !== after) target.appendChild(parent.firstChild);
}

function destroyEach(iterations) {
	for (var i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d();
	}
}

function createFragment() {
	return document.createDocumentFragment();
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
	this.set = this.get = noop;

	if (detach !== false) this._fragment.u();
	this._fragment.d();
	this._fragment = this._state = null;
}

function _differs(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, changed, newState, oldState) {
	for (var key in group) {
		if (!changed[key]) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		var callbacks = group[key];
		if (!callbacks) continue;

		for (var i = 0; i < callbacks.length; i += 1) {
			var callback = callbacks[i];
			if (callback.__calling) continue;

			callback.__calling = true;
			callback.call(component, newValue, oldValue);
			callback.__calling = false;
		}
	}
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function init(component, options) {
	component._observers = { pre: blankObject(), post: blankObject() };
	component._handlers = blankObject();
	component._bind = options._bind;

	component.options = options;
	component.root = options.root || component;
	component.store = component.root.store || options.store;
}

function observe(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

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
		dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
		this._fragment.p(changed, this._state);
		dispatchObservers(this, this._observers.post, changed, this._state, oldState);
	}
}

function callAll(fns) {
	while (fns && fns.length) fns.shift()();
}

function _mount(target, anchor) {
	this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
}

function _unmount() {
	if (this._fragment) this._fragment.u();
}

var proto = {
	destroy: destroy,
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	teardown: destroy,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount,
	_differs: _differs
};

/* src\Field.html generated by Svelte v1.60.3 */

function message(submit, error) {                
    if (submit) {
        return error;
    }
    return '';
}

function data() {
    return { 
        uuid: '',
        label: '',
        submit: false,
        error: '',
    }
}
function add_css() {
	var style = createElement("style");
	style.id = 'svelte-u293zm-style';
	style.textContent = ".svelte-u293zm.invalid-feedback,.svelte-u293zm .invalid-feedback{display:block}";
	appendNode(style, document.head);
}

function create_main_fragment(component, state) {
	var div, label, text, text_1, div_1, div_2, slot_content_default = component._slotted.default, slot_content_default_after, text_2;

	var if_block = (state.submit && state.error) && create_if_block(component, state);

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text = createText(state.label);
			text_1 = createText("\r\n    ");
			div_1 = createElement("div");
			div_2 = createElement("div");
			text_2 = createText("\r\n            ");
			if (if_block) { if_block.c(); }
			this.h();
		},

		h: function hydrate() {
			label.className = "col-4 col-form-label";
			label.htmlFor = state.uuid;
			div_2.className = "form-group";
			div_1.className = "col-8";
			div.className = "form-group row svelte-u293zm";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			appendNode(text, label);
			appendNode(text_1, div);
			appendNode(div_1, div);
			appendNode(div_2, div_1);

			if (slot_content_default) {
				appendNode(slot_content_default, div_2);
				appendNode(slot_content_default_after || (slot_content_default_after = createComment()), div_2);
			}

			appendNode(text_2, div_2);
			if (if_block) { if_block.m(div_2, null); }
		},

		p: function update(changed, state) {
			if (changed.label) {
				text.data = state.label;
			}

			if (changed.uuid) {
				label.htmlFor = state.uuid;
			}

			if (state.submit && state.error) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block(component, state);
					if_block.c();
					if_block.m(div_2, null);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}
		},

		u: function unmount() {
			detachNode(div);

			if (slot_content_default) {
				reinsertBefore(slot_content_default_after, slot_content_default);
			}

			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
		}
	};
}

// (6:12) {{#if submit && error}}
function create_if_block(component, state) {
	var div, text;

	return {
		c: function create() {
			div = createElement("div");
			text = createText(state.message);
			this.h();
		},

		h: function hydrate() {
			div.className = "invalid-feedback";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
		},

		p: function update(changed, state) {
			if (changed.message) {
				text.data = state.message;
			}
		},

		u: function unmount() {
			detachNode(div);
		},

		d: noop
	};
}

function Field(options) {
	init(this, options);
	this._state = assign(data(), options.data);
	this._recompute({ submit: 1, error: 1 }, this._state);

	this._slotted = options.slots || {};

	if (!document.getElementById("svelte-u293zm-style")) { add_css(); }

	this.slots = {};

	this._fragment = create_main_fragment(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(Field.prototype, proto);

Field.prototype._recompute = function _recompute(changed, state) {
	if (changed.submit || changed.error) {
		if (this._differs(state.message, (state.message = message(state.submit, state.error)))) { changed.message = true; }
	}
};

var intialData = { 
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
    data: function data() {
        return Object.assign({}, intialData);
    },
    fieldData: function fieldData() {
        return Object.assign({}, {settings: null}, intialData);
    },
    oncreate: function oncreate(p) {
        var ref = p.get();
        var uuid = ref.uuid;
        var settings = ref.settings;
        var element = p.refs.input;
        element.onkeyup = function (e) {
            if (p.get('submit')) {
                var error = element.checkValidity() ? '' : element.validationMessage;
                p.set({error: error});
            }
        };
        element.setError = function (error) {
            p.set({error: error, submit: true});
        };
        if (uuid) {
            element.setAttribute('id', uuid);
        } 
        // if (settings) {
        //     this.mergeProps(p, settings);
        // }
        p.set({ element: element });        
    },
    validate: function validate(p) { 
        var ref = p.get();
        var element = ref.element;       
        if (element.checkValidity) {
            element.setError(element.validationMessage);
        }
        return element.checkValidity();
    },
    mergeProps: function mergeProps(p, s) {
        var t = p.get(), n = {};   
        for (var k in s) {
            if (t[k] !== undefined) {
                n[k] = s[k];
            }
        }                            
        p.set(n);
    },
    makeUniqueId: function makeUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
}

/* src\inputs\MaskedInput.html generated by Svelte v1.60.3 */

var data$1 = fieldBase.data;

var methods = {
    handleChange: function handleChange(e) {
        var ref = this.get();
        var maxlength = ref.maxlength;
        var pattern = ref.pattern;
        var placeholder = ref.placeholder;
        var text = ref.text;
        e.target.value = this.handleCurrentValue(e);
        // document.getElementById(uuid + 'Mask').innerHTML = this.setValueOfMask(e);
        this.set({ value: e.target.value });
    },

    handleCurrentValue: function handleCurrentValue(e) {
        var ref = this.get();
        var charset = ref.charset;
        var validExample = ref.validExample;
        var isCharsetPresent = charset,
            maskedNumber = 'XMDY',
            maskedLetter = '_',
            placeholder = isCharsetPresent || this.get('placeholder'),
            value = e.target.value, l = placeholder.length;
        var i, j, isInt, isLetter, strippedValue, matchesNumber, matchesLetter, newValue = '';

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

    validateProgress: function validateProgress(e, value) {
        var ref = this.get();
        var pattern = ref.pattern;
        var placeholder = ref.placeholder;
        var validExample = ref.validExample;
        var l = value.length, testValue = '', i;
        var regex = new RegExp(this.props.pattern);

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

function oncreate() {
    var this$1 = this;

    fieldBase.oncreate(this);
    this.observe('value', function (value) {
        this$1.set({ text: value });
    }, { init: true });
}
function create_main_fragment$1(component, state) {
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
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			addListener(input, "input", input_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "text");
			input.className = input_class_value = "form-control masked " + state.inputClass;
			input.id = state.uuid;
			input.readOnly = state.readOnly;
			input.required = state.required;
			input.pattern = state.pattern;
			input.placeholder = state.placeholder;
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = state.text;
		},

		p: function update(changed, state) {
			if (!input_updating) { input.value = state.text; }
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control masked " + state.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.uuid) {
				input.id = state.uuid;
			}

			if (changed.readOnly) {
				input.readOnly = state.readOnly;
			}

			if (changed.required) {
				input.required = state.required;
			}

			if (changed.pattern) {
				input.pattern = state.pattern;
			}

			if (changed.placeholder) {
				input.placeholder = state.placeholder;
			}
		},

		u: function unmount() {
			detachNode(input);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			removeListener(input, "input", input_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) { component.refs.input = null; }
		}
	};
}

function MaskedInput(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data$1(), options.data);

	var _oncreate = oncreate.bind(this);

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$1(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(assign(MaskedInput.prototype, methods), proto);

/* src\MaskedField.html generated by Svelte v1.60.3 */

var data$2 = fieldBase.fieldData;

function oncreate$1() {
    this.set({ settings: this.get(), uuid: fieldBase.makeUniqueId() });
}
function create_main_fragment$2(component, state) {
	var text, maskedinput_spread_levels, maskedinput_updating = {}, text_1, field_updating = {};

	var maskedinput_initial_data = {};
	maskedinput_spread_levels = [
		state.settings
	];

	for (var i = 0; i < maskedinput_spread_levels.length; i += 1) {
		maskedinput_initial_data = assign(maskedinput_initial_data, maskedinput_spread_levels[i]);
	}
	if ('value' in state) {
		maskedinput_initial_data.value = state.value ;
		maskedinput_updating.value = true;
	}
	if ('submit' in state) {
		maskedinput_initial_data.submit = state.submit ;
		maskedinput_updating.submit = true;
	}
	if ('error' in state) {
		maskedinput_initial_data.error = state.error ;
		maskedinput_updating.error = true;
	}
	var maskedinput = new MaskedInput({
		root: component.root,
		data: maskedinput_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!maskedinput_updating.value && changed.value) {
				newState.value = childState.value;
			}

			if (!maskedinput_updating.submit && changed.submit) {
				newState.submit = childState.submit;
			}

			if (!maskedinput_updating.error && changed.error) {
				newState.error = childState.error;
			}
			component._set(newState);
			maskedinput_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		maskedinput._bind({ value: 1, submit: 1, error: 1 }, maskedinput.get());
	});

	var field_initial_data = { uuid: state.uuid, label: state.label };
	if ('submit' in state) {
		field_initial_data.submit = state.submit ;
		field_updating.submit = true;
	}
	if ('error' in state) {
		field_initial_data.error = state.error ;
		field_updating.error = true;
	}
	var field = new Field({
		root: component.root,
		slots: { default: createFragment() },
		data: field_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!field_updating.submit && changed.submit) {
				newState.submit = childState.submit;
			}

			if (!field_updating.error && changed.error) {
				newState.error = childState.error;
			}
			component._set(newState);
			field_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		field._bind({ submit: 1, error: 1 }, field.get());
	});

	return {
		c: function create() {
			text = createText("\r\n    ");
			maskedinput._fragment.c();
			text_1 = createText("\r\n");
			field._fragment.c();
		},

		m: function mount(target, anchor) {
			appendNode(text, field._slotted.default);
			maskedinput._mount(field._slotted.default, null);
			appendNode(text_1, field._slotted.default);
			field._mount(target, anchor);
		},

		p: function update(changed, state) {
			var maskedinput_changes = {};
			var maskedinput_changes = getSpreadUpdate(maskedinput_spread_levels, [
				changed.settings && state.settings
			]);
			if (!maskedinput_updating.value && changed.value) {
				maskedinput_changes.value = state.value ;
				maskedinput_updating.value = true;
			}
			if (!maskedinput_updating.submit && changed.submit) {
				maskedinput_changes.submit = state.submit ;
				maskedinput_updating.submit = true;
			}
			if (!maskedinput_updating.error && changed.error) {
				maskedinput_changes.error = state.error ;
				maskedinput_updating.error = true;
			}
			maskedinput._set(maskedinput_changes);
			maskedinput_updating = {};

			var field_changes = {};
			if (changed.uuid) { field_changes.uuid = state.uuid; }
			if (changed.label) { field_changes.label = state.label; }
			if (!field_updating.submit && changed.submit) {
				field_changes.submit = state.submit ;
				field_updating.submit = true;
			}
			if (!field_updating.error && changed.error) {
				field_changes.error = state.error ;
				field_updating.error = true;
			}
			field._set(field_changes);
			field_updating = {};
		},

		u: function unmount() {
			field._unmount();
		},

		d: function destroy$$1() {
			maskedinput.destroy(false);
			field.destroy(false);
		}
	};
}

function MaskedField(options) {
	init(this, options);
	this._state = assign(data$2(), options.data);

	var _oncreate = oncreate$1.bind(this);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$2(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(MaskedField.prototype, proto);

function formatCurrency(data, alwaysShowCents) {
    if ( alwaysShowCents === void 0 ) alwaysShowCents = true;

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

/* src\inputs\CurrencyInput.html generated by Svelte v1.60.3 */

var toNumber$1 = function (v) { return Number(v.replace(/[^0-9\.]+/g,"")); };

var data$3 = fieldBase.data;

var methods$1 = {
    blur: function blur(text) {
        var value = text ? toNumber$1(text) : 0;
        if (!isNaN(value)) {
            this.set({ text: formatCurrency(value) });
        }
        if (fieldBase.validate(this)) {                    
            this.set({ value: value });
        }              
    },
};

function oncreate$2() {
    var this$1 = this;

    fieldBase.oncreate(this, true);
    this.observe('value', function (value) {
        this$1.set({ text: formatCurrency(value) });
    }, { init: true });
}
function create_main_fragment$3(component, state) {
	var input, input_updating = false, input_class_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ text: input.value });
		input_updating = false;
	}

	function blur_handler(event) {
		var state = component.get();
		component.blur(state.text);
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function create() {
			input = createElement("input");
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			addListener(input, "blur", blur_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "text");
			input.className = input_class_value = "form-control " + state.inputClass;
			input.id = state.uuid;
			input.placeholder = state.placeholder;
			input.pattern = "^(?!\\(.*[^)]$|[^(].*\\)$)\\(?\\$?(0|[1-9]\\d{0,2}(,?\\d{3})?)(\\.\\d\\d?)?\\)?$";
			input.readOnly = state.readOnly;
			input.required = state.required;
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = state.text;
		},

		p: function update(changed, state) {
			if (!input_updating) { input.value = state.text; }
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + state.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.uuid) {
				input.id = state.uuid;
			}

			if (changed.placeholder) {
				input.placeholder = state.placeholder;
			}

			if (changed.readOnly) {
				input.readOnly = state.readOnly;
			}

			if (changed.required) {
				input.required = state.required;
			}
		},

		u: function unmount() {
			detachNode(input);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			removeListener(input, "blur", blur_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) { component.refs.input = null; }
		}
	};
}

function CurrencyInput(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data$3(), options.data);

	var _oncreate = oncreate$2.bind(this);

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$3(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(assign(CurrencyInput.prototype, methods$1), proto);

/* src\CurrencyField.html generated by Svelte v1.60.3 */

var data$4 = fieldBase.fieldData;

function oncreate$3() {
    this.set({ settings: this.get(), uuid: fieldBase.makeUniqueId() });
}
function create_main_fragment$4(component, state) {
	var text, currencyinput_spread_levels, currencyinput_updating = {}, text_1, field_updating = {};

	var currencyinput_initial_data = {};
	currencyinput_spread_levels = [
		state.settings
	];

	for (var i = 0; i < currencyinput_spread_levels.length; i += 1) {
		currencyinput_initial_data = assign(currencyinput_initial_data, currencyinput_spread_levels[i]);
	}
	if ('value' in state) {
		currencyinput_initial_data.value = state.value ;
		currencyinput_updating.value = true;
	}
	if ('submit' in state) {
		currencyinput_initial_data.submit = state.submit ;
		currencyinput_updating.submit = true;
	}
	if ('error' in state) {
		currencyinput_initial_data.error = state.error ;
		currencyinput_updating.error = true;
	}
	var currencyinput = new CurrencyInput({
		root: component.root,
		data: currencyinput_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!currencyinput_updating.value && changed.value) {
				newState.value = childState.value;
			}

			if (!currencyinput_updating.submit && changed.submit) {
				newState.submit = childState.submit;
			}

			if (!currencyinput_updating.error && changed.error) {
				newState.error = childState.error;
			}
			component._set(newState);
			currencyinput_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		currencyinput._bind({ value: 1, submit: 1, error: 1 }, currencyinput.get());
	});

	var field_initial_data = { uuid: state.uuid, label: state.label };
	if ('submit' in state) {
		field_initial_data.submit = state.submit ;
		field_updating.submit = true;
	}
	if ('error' in state) {
		field_initial_data.error = state.error ;
		field_updating.error = true;
	}
	var field = new Field({
		root: component.root,
		slots: { default: createFragment() },
		data: field_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!field_updating.submit && changed.submit) {
				newState.submit = childState.submit;
			}

			if (!field_updating.error && changed.error) {
				newState.error = childState.error;
			}
			component._set(newState);
			field_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		field._bind({ submit: 1, error: 1 }, field.get());
	});

	return {
		c: function create() {
			text = createText("\r\n    ");
			currencyinput._fragment.c();
			text_1 = createText("\r\n");
			field._fragment.c();
		},

		m: function mount(target, anchor) {
			appendNode(text, field._slotted.default);
			currencyinput._mount(field._slotted.default, null);
			appendNode(text_1, field._slotted.default);
			field._mount(target, anchor);
		},

		p: function update(changed, state) {
			var currencyinput_changes = {};
			var currencyinput_changes = getSpreadUpdate(currencyinput_spread_levels, [
				changed.settings && state.settings
			]);
			if (!currencyinput_updating.value && changed.value) {
				currencyinput_changes.value = state.value ;
				currencyinput_updating.value = true;
			}
			if (!currencyinput_updating.submit && changed.submit) {
				currencyinput_changes.submit = state.submit ;
				currencyinput_updating.submit = true;
			}
			if (!currencyinput_updating.error && changed.error) {
				currencyinput_changes.error = state.error ;
				currencyinput_updating.error = true;
			}
			currencyinput._set(currencyinput_changes);
			currencyinput_updating = {};

			var field_changes = {};
			if (changed.uuid) { field_changes.uuid = state.uuid; }
			if (changed.label) { field_changes.label = state.label; }
			if (!field_updating.submit && changed.submit) {
				field_changes.submit = state.submit ;
				field_updating.submit = true;
			}
			if (!field_updating.error && changed.error) {
				field_changes.error = state.error ;
				field_updating.error = true;
			}
			field._set(field_changes);
			field_updating = {};
		},

		u: function unmount() {
			field._unmount();
		},

		d: function destroy$$1() {
			currencyinput.destroy(false);
			field.destroy(false);
		}
	};
}

function CurrencyField(options) {
	init(this, options);
	this._state = assign(data$4(), options.data);

	var _oncreate = oncreate$3.bind(this);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$4(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(CurrencyField.prototype, proto);

/* src\inputs\SelectInput.html generated by Svelte v1.60.3 */

function data$5() {
    return { 
        uuid: '',
        label: '',
        inputClass: '',
        value: '',
        optionList: [],
        getOptionName: function (x) { return x.name; },
        optionValue: 'id'
    }
}
function oncreate$4() {
    fieldBase.oncreate(this);
}
function create_main_fragment$5(component, state) {
	var select, select_updating = false, select_class_value;

	var each_value = state.optionList;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(component, assign(assign({}, state), {
			each_value: each_value,
			opt: each_value[i],
			opt_index: i
		}));
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
			this.h();
		},

		h: function hydrate() {
			addListener(select, "change", select_change_handler);
			if (!('value' in state)) { component.root._beforecreate.push(select_change_handler); }
			addListener(select, "change", change_handler);
			select.className = select_class_value = "form-control " + state.inputClass;
		},

		m: function mount(target, anchor) {
			insertNode(select, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			component.refs.input = select;

			selectOption(select, state.value);
		},

		p: function update(changed, state) {
			var each_value = state.optionList;

			if (changed.optionList || changed.optionValue || changed.getOptionName) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						opt: each_value[i],
						opt_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			if (!select_updating) { selectOption(select, state.value); }
			if ((changed.inputClass) && select_class_value !== (select_class_value = "form-control " + state.inputClass)) {
				select.className = select_class_value;
			}
		},

		u: function unmount() {
			detachNode(select);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
			removeListener(select, "change", change_handler);
			if (component.refs.input === select) { component.refs.input = null; }
		}
	};
}

// (2:4) {{#each optionList as opt}}
function create_each_block(component, state) {
	var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
	var if_block_anchor;

	function select_block_type(state) {
		if (typeof state.optionList[0] === 'string') { return create_if_block$1; }
		return create_if_block_1;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			if_block.c();
			if_block_anchor = createComment();
		},

		m: function mount(target, anchor) {
			if_block.m(target, anchor);
			insertNode(if_block_anchor, target, anchor);
		},

		p: function update(changed, state) {
			opt = state.opt;
			each_value = state.each_value;
			opt_index = state.opt_index;
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},

		u: function unmount() {
			if_block.u();
			detachNode(if_block_anchor);
		},

		d: function destroy$$1() {
			if_block.d();
		}
	};
}

// (3:8) {{#if typeof optionList[0] === 'string'}}
function create_if_block$1(component, state) {
	var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
	var option, text_value = opt, text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = opt;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			opt = state.opt;
			each_value = state.each_value;
			opt_index = state.opt_index;
			if ((changed.optionList) && text_value !== (text_value = opt)) {
				text.data = text_value;
			}

			if ((changed.optionList) && option_value_value !== (option_value_value = opt)) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

// (5:8) {{else}}
function create_if_block_1(component, state) {
	var opt = state.opt, each_value = state.each_value, opt_index = state.opt_index;
	var option, text_value = state.getOptionName(opt), text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = opt[state.optionValue];
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state) {
			opt = state.opt;
			each_value = state.each_value;
			opt_index = state.opt_index;
			if ((changed.getOptionName || changed.optionList) && text_value !== (text_value = state.getOptionName(opt))) {
				text.data = text_value;
			}

			if ((changed.optionList || changed.optionValue) && option_value_value !== (option_value_value = opt[state.optionValue])) {
				option.__value = option_value_value;
			}

			option.value = option.__value;
		},

		u: function unmount() {
			detachNode(option);
		},

		d: noop
	};
}

function SelectInput(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data$5(), options.data);

	var _oncreate = oncreate$4.bind(this);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$5(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._beforecreate);
		callAll(this._oncreate);
	}
}

assign(SelectInput.prototype, proto);

/* src\SelectField.html generated by Svelte v1.60.3 */

var data$6 = fieldBase.fieldData;

function oncreate$5() {
    this.set({ settings: this.get(), uuid: fieldBase.makeUniqueId() });
}
function create_main_fragment$6(component, state) {
	var text, selectinput_spread_levels, selectinput_updating = {}, text_1, field_updating = {};

	var selectinput_initial_data = {};
	selectinput_spread_levels = [
		state.settings
	];

	for (var i = 0; i < selectinput_spread_levels.length; i += 1) {
		selectinput_initial_data = assign(selectinput_initial_data, selectinput_spread_levels[i]);
	}
	if ('value' in state) {
		selectinput_initial_data.value = state.value ;
		selectinput_updating.value = true;
	}
	if ('submit' in state) {
		selectinput_initial_data.submit = state.submit ;
		selectinput_updating.submit = true;
	}
	if ('error' in state) {
		selectinput_initial_data.error = state.error ;
		selectinput_updating.error = true;
	}
	var selectinput = new SelectInput({
		root: component.root,
		data: selectinput_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!selectinput_updating.value && changed.value) {
				newState.value = childState.value;
			}

			if (!selectinput_updating.submit && changed.submit) {
				newState.submit = childState.submit;
			}

			if (!selectinput_updating.error && changed.error) {
				newState.error = childState.error;
			}
			component._set(newState);
			selectinput_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		selectinput._bind({ value: 1, submit: 1, error: 1 }, selectinput.get());
	});

	var field_initial_data = { uuid: state.uuid, label: state.label };
	if ('submit' in state) {
		field_initial_data.submit = state.submit ;
		field_updating.submit = true;
	}
	if ('error' in state) {
		field_initial_data.error = state.error ;
		field_updating.error = true;
	}
	var field = new Field({
		root: component.root,
		slots: { default: createFragment() },
		data: field_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!field_updating.submit && changed.submit) {
				newState.submit = childState.submit;
			}

			if (!field_updating.error && changed.error) {
				newState.error = childState.error;
			}
			component._set(newState);
			field_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		field._bind({ submit: 1, error: 1 }, field.get());
	});

	return {
		c: function create() {
			text = createText("\r\n    ");
			selectinput._fragment.c();
			text_1 = createText("\r\n");
			field._fragment.c();
		},

		m: function mount(target, anchor) {
			appendNode(text, field._slotted.default);
			selectinput._mount(field._slotted.default, null);
			appendNode(text_1, field._slotted.default);
			field._mount(target, anchor);
		},

		p: function update(changed, state) {
			var selectinput_changes = {};
			var selectinput_changes = getSpreadUpdate(selectinput_spread_levels, [
				changed.settings && state.settings
			]);
			if (!selectinput_updating.value && changed.value) {
				selectinput_changes.value = state.value ;
				selectinput_updating.value = true;
			}
			if (!selectinput_updating.submit && changed.submit) {
				selectinput_changes.submit = state.submit ;
				selectinput_updating.submit = true;
			}
			if (!selectinput_updating.error && changed.error) {
				selectinput_changes.error = state.error ;
				selectinput_updating.error = true;
			}
			selectinput._set(selectinput_changes);
			selectinput_updating = {};

			var field_changes = {};
			if (changed.uuid) { field_changes.uuid = state.uuid; }
			if (changed.label) { field_changes.label = state.label; }
			if (!field_updating.submit && changed.submit) {
				field_changes.submit = state.submit ;
				field_updating.submit = true;
			}
			if (!field_updating.error && changed.error) {
				field_changes.error = state.error ;
				field_updating.error = true;
			}
			field._set(field_changes);
			field_updating = {};
		},

		u: function unmount() {
			field._unmount();
		},

		d: function destroy$$1() {
			selectinput.destroy(false);
			field.destroy(false);
		}
	};
}

function SelectField(options) {
	init(this, options);
	this._state = assign(data$6(), options.data);

	var _oncreate = oncreate$5.bind(this);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$6(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(SelectField.prototype, proto);

/* src\DynamicField.html generated by Svelte v1.60.3 */

function fieldtype(settings) { 
    return settings ? settings.fieldtype : null;
}

function data$7() {
    return { 
        uuid: fieldBase.makeUniqueId(),
        label: '',
        submit: false,
        error: '',
        value: '',
        settings: null,
    }
}
function create_main_fragment$7(component, state) {
	var text, switch_instance_spread_levels, switch_instance_updating = {}, switch_instance_anchor, text_1, field_updating = {};

	var switch_value = state.fieldtype;

	function switch_props(state) {
		var switch_instance_initial_data = {};
		switch_instance_spread_levels = [
			state.settings,
			{ uuid: state.uuid }
		];

		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
		}
		if ('value' in state) {
			switch_instance_initial_data.value = state.value ;
			switch_instance_updating.value = true;
		}
		if ('submit' in state) {
			switch_instance_initial_data.submit = state.submit ;
			switch_instance_updating.submit = true;
		}
		if ('error' in state) {
			switch_instance_initial_data.error = state.error ;
			switch_instance_updating.error = true;
		}
		return {
			root: component.root,
			data: switch_instance_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
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
		var switch_instance = new switch_value(switch_props(state));

		component.root._beforecreate.push(function() {
			switch_instance._bind({ value: 1, submit: 1, error: 1 }, switch_instance.get());
		});
	}

	var field_initial_data = { uuid: state.uuid, label: state.label };
	if ('submit' in state) {
		field_initial_data.submit = state.submit ;
		field_updating.submit = true;
	}
	if ('error' in state) {
		field_initial_data.error = state.error ;
		field_updating.error = true;
	}
	var field = new Field({
		root: component.root,
		slots: { default: createFragment() },
		data: field_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!field_updating.submit && changed.submit) {
				newState.submit = childState.submit;
			}

			if (!field_updating.error && changed.error) {
				newState.error = childState.error;
			}
			component._set(newState);
			field_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		field._bind({ submit: 1, error: 1 }, field.get());
	});

	return {
		c: function create() {
			text = createText("\r\n    ");
			switch_instance_anchor = createComment();
			if (switch_instance) { switch_instance._fragment.c(); }
			text_1 = createText("\r\n");
			field._fragment.c();
		},

		m: function mount(target, anchor) {
			appendNode(text, field._slotted.default);
			appendNode(switch_instance_anchor, field._slotted.default);

			if (switch_instance) {
				switch_instance._mount(field._slotted.default, null);
			}

			appendNode(text_1, field._slotted.default);
			field._mount(target, anchor);
		},

		p: function update(changed, state) {
			if (switch_value !== (switch_value = state.fieldtype)) {
				if (switch_instance) { switch_instance.destroy(); }

				if (switch_value) {
					switch_instance = new switch_value(switch_props(state));
					switch_instance._fragment.c();
					switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);
				}
			}

			else {
				var switch_instance_changes = {};
				var switch_instance_changes = getSpreadUpdate(switch_instance_spread_levels, [
					changed.settings && state.settings,
					changed.uuid && { uuid: state.uuid }
				]);
				if (!switch_instance_updating.value && changed.value) {
					switch_instance_changes.value = state.value ;
					switch_instance_updating.value = true;
				}
				if (!switch_instance_updating.submit && changed.submit) {
					switch_instance_changes.submit = state.submit ;
					switch_instance_updating.submit = true;
				}
				if (!switch_instance_updating.error && changed.error) {
					switch_instance_changes.error = state.error ;
					switch_instance_updating.error = true;
				}
				switch_instance._set(switch_instance_changes);
				switch_instance_updating = {};
			}

			var field_changes = {};
			if (changed.uuid) { field_changes.uuid = state.uuid; }
			if (changed.label) { field_changes.label = state.label; }
			if (!field_updating.submit && changed.submit) {
				field_changes.submit = state.submit ;
				field_updating.submit = true;
			}
			if (!field_updating.error && changed.error) {
				field_changes.error = state.error ;
				field_updating.error = true;
			}
			field._set(field_changes);
			field_updating = {};
		},

		u: function unmount() {
			field._unmount();
		},

		d: function destroy$$1() {
			if (switch_instance) { switch_instance.destroy(false); }
			field.destroy(false);
		}
	};
}

function DynamicField(options) {
	init(this, options);
	this._state = assign(data$7(), options.data);
	this._recompute({ settings: 1 }, this._state);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$7(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(DynamicField.prototype, proto);

DynamicField.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.fieldtype, (state.fieldtype = fieldtype(state.settings)))) { changed.fieldtype = true; }
	}
};

/* src\inputs\TextInput.html generated by Svelte v1.60.3 */

var data$8 = fieldBase.data;

function oncreate$6() {
    fieldBase.oncreate(this);
}
function create_main_fragment$8(component, state) {
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
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "text");
			input.className = input_class_value = "form-control " + state.inputClass;
			input.placeholder = state.placeholder;
			input.readOnly = state.readOnly;
			input.required = state.required;
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = state.value
    ;
		},

		p: function update(changed, state) {
			if (!input_updating) { input.value = state.value
    ; }
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + state.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.placeholder) {
				input.placeholder = state.placeholder;
			}

			if (changed.readOnly) {
				input.readOnly = state.readOnly;
			}

			if (changed.required) {
				input.required = state.required;
			}
		},

		u: function unmount() {
			detachNode(input);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) { component.refs.input = null; }
		}
	};
}

function TextInput(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data$8(), options.data);

	var _oncreate = oncreate$6.bind(this);

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$8(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(TextInput.prototype, proto);

/* src\inputs\NumberInput.html generated by Svelte v1.60.3 */

var data$9 = fieldBase.data;

function oncreate$7() {
    fieldBase.oncreate(this);
}
function create_main_fragment$9(component, state) {
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
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "number");
			input.className = input_class_value = "form-control " + state.inputClass;
			input.placeholder = state.placeholder;
			input.readOnly = state.readOnly;
			input.required = state.required;
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = state.value
    ;
		},

		p: function update(changed, state) {
			if (!input_updating) { input.value = state.value
    ; }
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + state.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.placeholder) {
				input.placeholder = state.placeholder;
			}

			if (changed.readOnly) {
				input.readOnly = state.readOnly;
			}

			if (changed.required) {
				input.required = state.required;
			}
		},

		u: function unmount() {
			detachNode(input);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			removeListener(input, "change", change_handler);
			if (component.refs.input === input) { component.refs.input = null; }
		}
	};
}

function NumberInput(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data$9(), options.data);

	var _oncreate = oncreate$7.bind(this);

	if (!options.root) {
		this._oncreate = [];
	}

	this._fragment = create_main_fragment$9(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		callAll(this._oncreate);
	}
}

assign(NumberInput.prototype, proto);

/* src\inputs\CheckboxInput.html generated by Svelte v1.60.3 */

function data$10() {
    return {
        label: '',
        class: '',
        value: false,
    }
}
function add_css$1() {
	var style = createElement("style");
	style.id = 'svelte-m11ft5-style';
	style.textContent = "input.svelte-m11ft5,.svelte-m11ft5 input{margin:0 0 0 0.5rem}";
	appendNode(style, document.head);
}

function create_main_fragment$10(component, state) {
	var input, input_class_value;

	function input_change_handler() {
		component.set({ value: input.checked });
	}

	function change_handler(event) {
		component.fire('change', event);
	}

	return {
		c: function create() {
			input = createElement("input");
			this.h();
		},

		h: function hydrate() {
			addListener(input, "change", input_change_handler);
			addListener(input, "change", change_handler);
			setAttribute(input, "type", "checkbox");
			input.className = input_class_value = "" + state.class + " svelte-m11ft5";
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);

			input.checked = state.value;
		},

		p: function update(changed, state) {
			input.checked = state.value;
			if ((changed.class) && input_class_value !== (input_class_value = "" + state.class + " svelte-m11ft5")) {
				input.className = input_class_value;
			}
		},

		u: function unmount() {
			detachNode(input);
		},

		d: function destroy$$1() {
			removeListener(input, "change", input_change_handler);
			removeListener(input, "change", change_handler);
		}
	};
}

function CheckboxInput(options) {
	init(this, options);
	this._state = assign(data$10(), options.data);

	if (!document.getElementById("svelte-m11ft5-style")) { add_css$1(); }

	this._fragment = create_main_fragment$10(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(CheckboxInput.prototype, proto);

/* src\inputs\ActionButton.html generated by Svelte v1.60.3 */

function data$11() {
    return {
        label: '',
        class: '',
        value: false,
    }
}
function create_main_fragment$11(component, state) {
	var button, text, button_class_value;

	function click_handler(event) {
		component.fire('click', event);
	}

	return {
		c: function create() {
			button = createElement("button");
			text = createText(state.label);
			this.h();
		},

		h: function hydrate() {
			addListener(button, "click", click_handler);
			button.className = button_class_value = "btn btn-" + state.class;
		},

		m: function mount(target, anchor) {
			insertNode(button, target, anchor);
			appendNode(text, button);
		},

		p: function update(changed, state) {
			if (changed.label) {
				text.data = state.label;
			}

			if ((changed.class) && button_class_value !== (button_class_value = "btn btn-" + state.class)) {
				button.className = button_class_value;
			}
		},

		u: function unmount() {
			detachNode(button);
		},

		d: function destroy$$1() {
			removeListener(button, "click", click_handler);
		}
	};
}

function ActionButton(options) {
	init(this, options);
	this._state = assign(data$11(), options.data);

	this._fragment = create_main_fragment$11(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);
	}
}

assign(ActionButton.prototype, proto);

/* src\TextField.html generated by Svelte v1.60.3 */

var data$12 = fieldBase.fieldData;

function oncreate$8() {
    this.set({ settings: Object.assign({}, {fieldtype: TextInput}, this.get()) });
}
function create_main_fragment$12(component, state) {
	var dynamicfield_spread_levels, dynamicfield_updating = {};

	var dynamicfield_initial_data = {};
	dynamicfield_spread_levels = [
		state.settings,
		{ settings: state.settings }
	];

	for (var i = 0; i < dynamicfield_spread_levels.length; i += 1) {
		dynamicfield_initial_data = assign(dynamicfield_initial_data, dynamicfield_spread_levels[i]);
	}
	if ('value' in state) {
		dynamicfield_initial_data.value = state.value ;
		dynamicfield_updating.value = true;
	}
	var dynamicfield = new DynamicField({
		root: component.root,
		data: dynamicfield_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!dynamicfield_updating.value && changed.value) {
				newState.value = childState.value;
			}
			component._set(newState);
			dynamicfield_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		dynamicfield._bind({ value: 1 }, dynamicfield.get());
	});

	return {
		c: function create() {
			dynamicfield._fragment.c();
		},

		m: function mount(target, anchor) {
			dynamicfield._mount(target, anchor);
		},

		p: function update(changed, state) {
			var dynamicfield_changes = {};
			var dynamicfield_changes = getSpreadUpdate(dynamicfield_spread_levels, [
				changed.settings && state.settings,
				changed.settings && { settings: state.settings }
			]);
			if (!dynamicfield_updating.value && changed.value) {
				dynamicfield_changes.value = state.value ;
				dynamicfield_updating.value = true;
			}
			dynamicfield._set(dynamicfield_changes);
			dynamicfield_updating = {};
		},

		u: function unmount() {
			dynamicfield._unmount();
		},

		d: function destroy$$1() {
			dynamicfield.destroy(false);
		}
	};
}

function TextField(options) {
	init(this, options);
	this._state = assign(data$12(), options.data);

	var _oncreate = oncreate$8.bind(this);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$12(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(TextField.prototype, proto);

/* src\FormField.html generated by Svelte v1.60.3 */

function fieldtype$1(settings) {
    var ft = TextInput;
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

function data$13() {
    return { 
        uuid: fieldBase.makeUniqueId(),
        label: '',
        submit: false,
        error: '',
        value: '',
        settings: null
    }
}
function oncreate$9() {
    fieldBase.mergeProps(this, this.get('settings'));
}
function create_main_fragment$13(component, state) {
	var text, switch_instance_spread_levels, switch_instance_updating = {}, switch_instance_anchor, text_1, field_updating = {};

	var switch_value = state.fieldtype;

	function switch_props(state) {
		var switch_instance_initial_data = {};
		switch_instance_spread_levels = [
			state.settings,
			{ uuid: state.uuid }
		];

		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
		}
		if ('value' in state) {
			switch_instance_initial_data.value = state.value ;
			switch_instance_updating.value = true;
		}
		if ('submit' in state) {
			switch_instance_initial_data.submit = state.submit ;
			switch_instance_updating.submit = true;
		}
		if ('error' in state) {
			switch_instance_initial_data.error = state.error ;
			switch_instance_updating.error = true;
		}
		return {
			root: component.root,
			data: switch_instance_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
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
		var switch_instance = new switch_value(switch_props(state));

		component.root._beforecreate.push(function() {
			switch_instance._bind({ value: 1, submit: 1, error: 1 }, switch_instance.get());
		});
	}

	var field_initial_data = { uuid: state.uuid, label: state.label };
	if ('submit' in state) {
		field_initial_data.submit = state.submit ;
		field_updating.submit = true;
	}
	if ('error' in state) {
		field_initial_data.error = state.error ;
		field_updating.error = true;
	}
	var field = new Field({
		root: component.root,
		slots: { default: createFragment() },
		data: field_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!field_updating.submit && changed.submit) {
				newState.submit = childState.submit;
			}

			if (!field_updating.error && changed.error) {
				newState.error = childState.error;
			}
			component._set(newState);
			field_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		field._bind({ submit: 1, error: 1 }, field.get());
	});

	return {
		c: function create() {
			text = createText("\r\n    ");
			switch_instance_anchor = createComment();
			if (switch_instance) { switch_instance._fragment.c(); }
			text_1 = createText("\r\n");
			field._fragment.c();
		},

		m: function mount(target, anchor) {
			appendNode(text, field._slotted.default);
			appendNode(switch_instance_anchor, field._slotted.default);

			if (switch_instance) {
				switch_instance._mount(field._slotted.default, null);
			}

			appendNode(text_1, field._slotted.default);
			field._mount(target, anchor);
		},

		p: function update(changed, state) {
			if (switch_value !== (switch_value = state.fieldtype)) {
				if (switch_instance) { switch_instance.destroy(); }

				if (switch_value) {
					switch_instance = new switch_value(switch_props(state));
					switch_instance._fragment.c();
					switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);
				}
			}

			else {
				var switch_instance_changes = {};
				var switch_instance_changes = getSpreadUpdate(switch_instance_spread_levels, [
					changed.settings && state.settings,
					changed.uuid && { uuid: state.uuid }
				]);
				if (!switch_instance_updating.value && changed.value) {
					switch_instance_changes.value = state.value ;
					switch_instance_updating.value = true;
				}
				if (!switch_instance_updating.submit && changed.submit) {
					switch_instance_changes.submit = state.submit ;
					switch_instance_updating.submit = true;
				}
				if (!switch_instance_updating.error && changed.error) {
					switch_instance_changes.error = state.error ;
					switch_instance_updating.error = true;
				}
				switch_instance._set(switch_instance_changes);
				switch_instance_updating = {};
			}

			var field_changes = {};
			if (changed.uuid) { field_changes.uuid = state.uuid; }
			if (changed.label) { field_changes.label = state.label; }
			if (!field_updating.submit && changed.submit) {
				field_changes.submit = state.submit ;
				field_updating.submit = true;
			}
			if (!field_updating.error && changed.error) {
				field_changes.error = state.error ;
				field_updating.error = true;
			}
			field._set(field_changes);
			field_updating = {};
		},

		u: function unmount() {
			field._unmount();
		},

		d: function destroy$$1() {
			if (switch_instance) { switch_instance.destroy(false); }
			field.destroy(false);
		}
	};
}

function FormField(options) {
	init(this, options);
	this._state = assign(data$13(), options.data);
	this._recompute({ settings: 1 }, this._state);

	var _oncreate = oncreate$9.bind(this);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$13(this, this._state);

	this.root._oncreate.push(_oncreate);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormField.prototype, proto);

FormField.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.fieldtype, (state.fieldtype = fieldtype$1(state.settings)))) { changed.fieldtype = true; }
	}
};

/* src\FormCol.html generated by Svelte v1.60.3 */

function classes(settings) {                
    if (settings.col) {
        var cols = settings.col.split(' ');
        cols = cols.filter(function (x) { return x && x.trim(); }).map(function (x){ return 'col-' + x; });
        return cols.join(' ').trim();
    }
    return '';
}

function displayable(source, settings) {
    return source && (source.hasOwnProperty(settings.field) && source[settings.field] != null);
}

function data$14(){
    return {
        source: {},
    }
}
function create_main_fragment$14(component, state) {
	var div;

	function select_block_type(state) {
		if (state.edit) { return create_if_block$2; }
		if (state.displayable) { return create_if_block_1$1; }
		return null;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type && current_block_type(component, state);

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) { if_block.c(); }
			this.h();
		},

		h: function hydrate() {
			div.className = state.classes;
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) { if_block.m(div, null); }
		},

		p: function update(changed, state) {
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if (if_block) {
					if_block.u();
					if_block.d();
				}
				if_block = current_block_type && current_block_type(component, state);
				if (if_block) { if_block.c(); }
				if (if_block) { if_block.m(div, null); }
			}

			if (changed.classes) {
				div.className = state.classes;
			}
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) { if_block.u(); }
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }
		}
	};
}

// (2:4) {{#if edit}}
function create_if_block$2(component, state) {
	var formfield_updating = {};

	var formfield_initial_data = { settings: state.settings };
	if (state.settings.field in state.source) {
		formfield_initial_data.value = state.source[state.settings.field];
		formfield_updating.value = true;
	}
	var formfield = new FormField({
		root: component.root,
		data: formfield_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!formfield_updating.value && changed.value) {
				state.source[state.settings.field] = childState.value;
				newState.source = state.source;
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

		p: function update(changed, state) {
			var formfield_changes = {};
			if (changed.settings) { formfield_changes.settings = state.settings; }
			if (!formfield_updating.value && changed.source || changed.settings) {
				formfield_changes.value = state.source[state.settings.field];
				formfield_updating.value = true;
			}
			formfield._set(formfield_changes);
			formfield_updating = {};
		},

		u: function unmount() {
			formfield._unmount();
		},

		d: function destroy$$1() {
			formfield.destroy(false);
		}
	};
}

// (4:26) 
function create_if_block_1$1(component, state) {
	var text_value = state.source[state.settings.field], text;

	return {
		c: function create() {
			text = createText(text_value);
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		p: function update(changed, state) {
			if ((changed.source || changed.settings) && text_value !== (text_value = state.source[state.settings.field])) {
				text.data = text_value;
			}
		},

		u: function unmount() {
			detachNode(text);
		},

		d: noop
	};
}

function FormCol(options) {
	init(this, options);
	this._state = assign(data$14(), options.data);
	this._recompute({ settings: 1, source: 1 }, this._state);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$14(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormCol.prototype, proto);

FormCol.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.classes, (state.classes = classes(state.settings)))) { changed.classes = true; }
	}

	if (changed.source || changed.settings) {
		if (this._differs(state.displayable, (state.displayable = displayable(state.source, state.settings)))) { changed.displayable = true; }
	}
};

/* src\FormGrid.html generated by Svelte v1.60.3 */

function rows(columns) {                
    var maxRowNum = Math.max.apply(Math, columns.map(function (o) { return o.row; }));
    var rows = [];
    for (var i = 0; i <= maxRowNum; i++) {
        rows.push({ columns: [] });
    }
    columns.forEach(function (col) {
        var row = rows[col.row];
        if (row && row.columns) {
            row.columns.push(col);
            if (col.subtitle) {
                row.subtitle = col.subtitle;
            }
        }                
    });
    return rows;
}

function data$15() {
    return {
        class: '',
        edit: true,
        item: {},
        columns: [],
    }
}
function add_css$2() {
	var style = createElement("style");
	style.id = 'svelte-z3e38j-style';
	style.textContent = ".svelte-z3e38j.subtitle,.svelte-z3e38j .subtitle{margin:0.5rem;font-size:1rem;font-weight:600;text-decoration:underline;text-transform:uppercase}";
	appendNode(style, document.head);
}

function create_main_fragment$15(component, state) {
	var form;

	var each_value = state.rows;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(component, assign(assign({}, state), {
			each_value: each_value,
			row: each_value[i],
			row_index: i
		}));
	}

	return {
		c: function create() {
			form = createElement("form");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			form.className = "form-horizontal svelte-z3e38j";
		},

		m: function mount(target, anchor) {
			insertNode(form, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(form, null);
			}

			component.refs.form = form;
		},

		p: function update(changed, state) {
			var each_value = state.rows;

			if (changed.rows || changed.class || changed.item || changed.edit) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						row: each_value[i],
						row_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$1(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(form, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}
		},

		u: function unmount() {
			detachNode(form);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			if (component.refs.form === form) { component.refs.form = null; }
		}
	};
}

// (2:0) {{#each rows as row}}
function create_each_block$1(component, state) {
	var row = state.row, each_value = state.each_value, row_index = state.row_index;
	var text, div, div_class_value;

	var if_block = (row.subtitle) && create_if_block$3(component, state);

	var each_value_1 = row.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(component, assign(assign({}, state), {
			each_value_1: each_value_1,
			col: each_value_1[i],
			col_index: i
		}));
	}

	return {
		c: function create() {
			if (if_block) { if_block.c(); }
			text = createText("\r\n    ");
			div = createElement("div");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			div.className = div_class_value = "row " + state.class;
		},

		m: function mount(target, anchor) {
			if (if_block) { if_block.m(target, anchor); }
			insertNode(text, target, anchor);
			insertNode(div, target, anchor);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},

		p: function update(changed, state) {
			row = state.row;
			each_value = state.each_value;
			row_index = state.row_index;
			if (row.subtitle) {
				if (if_block) {
					if_block.p(changed, state);
				} else {
					if_block = create_if_block$3(component, state);
					if_block.c();
					if_block.m(text.parentNode, text);
				}
			} else if (if_block) {
				if_block.u();
				if_block.d();
				if_block = null;
			}

			var each_value_1 = row.columns;

			if (changed.item || changed.rows || changed.edit) {
				for (var i = 0; i < each_value_1.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value_1: each_value_1,
						col: each_value_1[i],
						col_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block_1(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value_1.length;
			}

			if ((changed.class) && div_class_value !== (div_class_value = "row " + state.class)) {
				div.className = div_class_value;
			}
		},

		u: function unmount() {
			if (if_block) { if_block.u(); }
			detachNode(text);
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			if (if_block) { if_block.d(); }

			destroyEach(each_blocks);
		}
	};
}

// (3:4) {{#if row.subtitle}}
function create_if_block$3(component, state) {
	var row = state.row, each_value = state.each_value, row_index = state.row_index;
	var div, text_value = row.subtitle, text;

	return {
		c: function create() {
			div = createElement("div");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			div.className = "row subtitle";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
		},

		p: function update(changed, state) {
			row = state.row;
			each_value = state.each_value;
			row_index = state.row_index;
			if ((changed.rows) && text_value !== (text_value = row.subtitle)) {
				text.data = text_value;
			}
		},

		u: function unmount() {
			detachNode(div);
		},

		d: noop
	};
}

// (7:8) {{#each row.columns as col}}
function create_each_block_1(component, state) {
	var row = state.row, each_value = state.each_value, row_index = state.row_index, col = state.col, each_value_1 = state.each_value_1, col_index = state.col_index;
	var formcol_updating = {};

	var formcol_initial_data = { settings: col, edit: state.edit };
	if ('item' in state) {
		formcol_initial_data.source = state.item;
		formcol_updating.source = true;
	}
	var formcol = new FormCol({
		root: component.root,
		data: formcol_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!formcol_updating.source && changed.source) {
				newState.item = childState.source;
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

		p: function update(changed, state) {
			row = state.row;
			each_value = state.each_value;
			row_index = state.row_index;
			col = state.col;
			each_value_1 = state.each_value_1;
			col_index = state.col_index;
			var formcol_changes = {};
			if (changed.rows) { formcol_changes.settings = col; }
			if (changed.edit) { formcol_changes.edit = state.edit; }
			if (!formcol_updating.source && changed.item) {
				formcol_changes.source = state.item;
				formcol_updating.source = true;
			}
			formcol._set(formcol_changes);
			formcol_updating = {};
		},

		u: function unmount() {
			formcol._unmount();
		},

		d: function destroy$$1() {
			formcol.destroy(false);
		}
	};
}

function FormGrid(options) {
	init(this, options);
	this.refs = {};
	this._state = assign(data$15(), options.data);
	this._recompute({ columns: 1 }, this._state);

	if (!document.getElementById("svelte-z3e38j-style")) { add_css$2(); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$15(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormGrid.prototype, proto);

FormGrid.prototype._recompute = function _recompute(changed, state) {
	if (changed.columns) {
		if (this._differs(state.rows, (state.rows = rows(state.columns)))) { changed.rows = true; }
	}
};

/* src\DataCol.html generated by Svelte v1.60.3 */

function collect(obj, field) {
    if (typeof(field) === 'function')
        { return field(obj); }
    else if (typeof(field) === 'string')
        { return obj[field]; }
    else
        { return undefined; }
}

function fieldtype$2(settings) {
    var ft = TextInput;
    if (settings.component) {
        switch (settings.component.toLowerCase()) {
            case 'text':
                ft = TextInput;
                break;
            case 'number':
                ft = NumberInput;
                break;    
            case 'masked':
                ft = Masked;
                break;
            case 'currency':
                ft = DatePicker;
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

function data$16(){
    return {
        source: {},
    }
}
function create_main_fragment$16(component, state) {
	var if_block_anchor;

	function select_block_type(state) {
		if (state.edit || state.settings.action) { return create_if_block$4; }
		return create_if_block_1$2;
	}

	var current_block_type = select_block_type(state);
	var if_block = current_block_type(component, state);

	return {
		c: function create() {
			if_block.c();
			if_block_anchor = createComment();
		},

		m: function mount(target, anchor) {
			if_block.m(target, anchor);
			insertNode(if_block_anchor, target, anchor);
		},

		p: function update(changed, state) {
			if (current_block_type === (current_block_type = select_block_type(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(component, state);
				if_block.c();
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},

		u: function unmount() {
			if_block.u();
			detachNode(if_block_anchor);
		},

		d: function destroy$$1() {
			if_block.d();
		}
	};
}

// (1:0) {{#if edit || settings.action}}
function create_if_block$4(component, state) {
	var switch_instance_spread_levels, switch_instance_updating = {}, switch_instance_anchor;

	var switch_value = state.fieldtype;

	function switch_props(state) {
		var switch_instance_initial_data = {};
		switch_instance_spread_levels = [
			state.settings
		];

		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
		}
		if (state.settings.field in state.source) {
			switch_instance_initial_data.value = state.source[state.settings.field];
			switch_instance_updating.value = true;
		}
		return {
			root: component.root,
			data: switch_instance_initial_data,
			_bind: function(changed, childState) {
				var state = component.get(), newState = {};
				if (!switch_instance_updating.value && changed.value) {
					state.source[state.settings.field] = childState.value;
					newState.source = state.source;
				}
				component._set(newState);
				switch_instance_updating = {};
			}
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(state));

		component.root._beforecreate.push(function() {
			switch_instance._bind({ value: 1 }, switch_instance.get());
		});
	}

	function switch_instance_change(event) {
		component.fire('change', event);
	}

	if (switch_instance) { switch_instance.on("change", switch_instance_change); }
	function switch_instance_click(event) {
		component.fire('click', event);
	}

	if (switch_instance) { switch_instance.on("click", switch_instance_click); }

	return {
		c: function create() {
			switch_instance_anchor = createComment();
			if (switch_instance) { switch_instance._fragment.c(); }
		},

		m: function mount(target, anchor) {
			insertNode(switch_instance_anchor, target, anchor);

			if (switch_instance) {
				switch_instance._mount(target, anchor);
			}
		},

		p: function update(changed, state) {
			if (switch_value !== (switch_value = state.fieldtype)) {
				if (switch_instance) { switch_instance.destroy(); }

				if (switch_value) {
					switch_instance = new switch_value(switch_props(state));
					switch_instance._fragment.c();
					switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);

					switch_instance.on("change", switch_instance_change);
					switch_instance.on("click", switch_instance_click);
				}
			}

			else {
				var switch_instance_changes = {};
				var switch_instance_changes = getSpreadUpdate(switch_instance_spread_levels, [
					changed.settings && state.settings
				]);
				if (!switch_instance_updating.value && changed.source || changed.settings) {
					switch_instance_changes.value = state.source[state.settings.field];
					switch_instance_updating.value = true;
				}
				switch_instance._set(switch_instance_changes);
				switch_instance_updating = {};
			}
		},

		u: function unmount() {
			detachNode(switch_instance_anchor);
			if (switch_instance) { switch_instance._unmount(); }
		},

		d: function destroy$$1() {
			if (switch_instance) { switch_instance.destroy(false); }
		}
	};
}

// (3:0) {{else}}
function create_if_block_1$2(component, state) {
	var text_value = collect(state.source, state.settings.field), text;

	return {
		c: function create() {
			text = createText(text_value);
		},

		m: function mount(target, anchor) {
			insertNode(text, target, anchor);
		},

		p: function update(changed, state) {
			if ((changed.source || changed.settings) && text_value !== (text_value = collect(state.source, state.settings.field))) {
				text.data = text_value;
			}
		},

		u: function unmount() {
			detachNode(text);
		},

		d: noop
	};
}

function DataCol(options) {
	init(this, options);
	this._state = assign(data$16(), options.data);
	this._recompute({ settings: 1 }, this._state);

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$16(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(DataCol.prototype, proto);

DataCol.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (this._differs(state.fieldtype, (state.fieldtype = fieldtype$2(state.settings)))) { changed.fieldtype = true; }
	}
};

/* src\DataGrid.html generated by Svelte v1.60.3 */

function colCount(columns) {
	return (columns) ? columns.length : 0;
}

function data$17() {
    return {
        class: '',
        columns: [],
        edit: true,
        rows: []
    }
}
var methods$2 = {
    actionClick: function actionClick(event, row, action) {
        event && event.preventDefault();
        action && action(row);
    },
};

function add_css$3() {
	var style = createElement("style");
	style.id = 'svelte-bmd9at-style';
	style.textContent = "td.svelte-bmd9at.nopadding,.svelte-bmd9at td.nopadding{padding:0 0}td.svelte-bmd9at.nopadding :global(input),.svelte-bmd9at td.nopadding :global(input){padding:0.35rem 0.5rem;border-width:0}";
	appendNode(style, document.head);
}

function create_main_fragment$17(component, state) {
	var div, table, thead, tr, text_2, tbody, table_class_value;

	var each_value = state.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(component, assign(assign({}, state), {
			each_value: each_value,
			column: each_value[i],
			x: i
		}));
	}

	var each_value_1 = state.rows;

	var each_1_blocks = [];

	for (var i = 0; i < each_value_1.length; i += 1) {
		each_1_blocks[i] = create_each_block_1$1(component, assign(assign({}, state), {
			each_value_1: each_value_1,
			row: each_value_1[i],
			row_index: i
		}));
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
			this.h();
		},

		h: function hydrate() {
			setAttribute(table, "ref", "table");
			table.className = table_class_value = "table table-striped table-sm " + (state.edit ? 'table-bordered' : '');
			setStyle(div, "position", "relative");
			div.className = "svelte-bmd9at";
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

		p: function update(changed, state) {
			var each_value = state.columns;

			if (changed.columns) {
				for (var i = 0; i < each_value.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value: each_value,
						column: each_value[i],
						x: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block$2(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value.length;
			}

			var each_value_1 = state.rows;

			if (changed.columns || changed.edit || changed.rows) {
				for (var i = 0; i < each_value_1.length; i += 1) {
					var each_1_context = assign(assign({}, state), {
						each_value_1: each_value_1,
						row: each_value_1[i],
						row_index: i
					});

					if (each_1_blocks[i]) {
						each_1_blocks[i].p(changed, each_1_context);
					} else {
						each_1_blocks[i] = create_each_block_1$1(component, each_1_context);
						each_1_blocks[i].c();
						each_1_blocks[i].m(tbody, null);
					}
				}

				for (; i < each_1_blocks.length; i += 1) {
					each_1_blocks[i].u();
					each_1_blocks[i].d();
				}
				each_1_blocks.length = each_value_1.length;
			}

			if ((changed.edit) && table_class_value !== (table_class_value = "table table-striped table-sm " + (state.edit ? 'table-bordered' : ''))) {
				table.className = table_class_value;
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			for (var i = 0; i < each_1_blocks.length; i += 1) {
				each_1_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			destroyEach(each_1_blocks);
		}
	};
}

// (5:16) {{#each columns as column, x}}
function create_each_block$2(component, state) {
	var column = state.column, each_value = state.each_value, x = state.x;
	var th, text_value = column.label, text;

	return {
		c: function create() {
			th = createElement("th");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			setStyle(th, "width", ( column.width ? column.width : 'auto' ));
		},

		m: function mount(target, anchor) {
			insertNode(th, target, anchor);
			appendNode(text, th);
		},

		p: function update(changed, state) {
			column = state.column;
			each_value = state.each_value;
			x = state.x;
			if ((changed.columns) && text_value !== (text_value = column.label)) {
				text.data = text_value;
			}

			if (changed.columns) {
				setStyle(th, "width", ( column.width ? column.width : 'auto' ));
			}
		},

		u: function unmount() {
			detachNode(th);
		},

		d: noop
	};
}

// (14:8) {{#each rows as row}}
function create_each_block_1$1(component, state) {
	var row = state.row, each_value_1 = state.each_value_1, row_index = state.row_index;
	var tr;

	var each_value_2 = state.columns;

	var each_blocks = [];

	for (var i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(component, assign(assign({}, state), {
			each_value_2: each_value_2,
			column: each_value_2[i],
			column_index: i
		}));
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

		p: function update(changed, state) {
			row = state.row;
			each_value_1 = state.each_value_1;
			row_index = state.row_index;
			var each_value_2 = state.columns;

			if (changed.edit || changed.columns || changed.rows) {
				for (var i = 0; i < each_value_2.length; i += 1) {
					var each_context = assign(assign({}, state), {
						each_value_2: each_value_2,
						column: each_value_2[i],
						column_index: i
					});

					if (each_blocks[i]) {
						each_blocks[i].p(changed, each_context);
					} else {
						each_blocks[i] = create_each_block_2(component, each_context);
						each_blocks[i].c();
						each_blocks[i].m(tr, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = each_value_2.length;
			}
		},

		u: function unmount() {
			detachNode(tr);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (16:16) {{#each columns as column}}
function create_each_block_2(component, state) {
	var row = state.row, each_value_1 = state.each_value_1, row_index = state.row_index, column = state.column, each_value_2 = state.each_value_2, column_index = state.column_index;
	var td, datacol_updating = {}, td_class_value;

	var datacol_initial_data = { settings: column, edit: state.edit };
	if (row_index in state.each_value_1) {
		datacol_initial_data.source = row;
		datacol_updating.source = true;
	}
	var datacol = new DataCol({
		root: component.root,
		data: datacol_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!datacol_updating.source && changed.source) {
				each_value_1[row_index] = childState.source;

				newState.rows = state.rows;
			}
			component._set(newState);
			datacol_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		datacol._bind({ source: 1 }, datacol.get());
	});

	datacol.on("change", function(event) {
		component.fire('update', { event: event });
	});
	datacol.on("click", function(event) {
		component.actionClick(event, row, column.action);
	});

	return {
		c: function create() {
			td = createElement("td");
			datacol._fragment.c();
			this.h();
		},

		h: function hydrate() {
			td.className = td_class_value = "" + (((!state.edit && column.action) || state.edit) ? 'nopadding' : '') + " " + (column.numeric ? 'numeric' : '') + " " + (column.truncate ? ' truncate' : '');
			setStyle(td, "width", ( column.width ? column.width : 'auto' ));
		},

		m: function mount(target, anchor) {
			insertNode(td, target, anchor);
			datacol._mount(td, null);
		},

		p: function update(changed, state) {
			row = state.row;
			each_value_1 = state.each_value_1;
			row_index = state.row_index;
			column = state.column;
			each_value_2 = state.each_value_2;
			column_index = state.column_index;
			var datacol_changes = {};
			if (changed.columns) { datacol_changes.settings = column; }
			if (changed.edit) { datacol_changes.edit = state.edit; }
			if (!datacol_updating.source && changed.rows) {
				datacol_changes.source = row;
				datacol_updating.source = true;
			}
			datacol._set(datacol_changes);
			datacol_updating = {};

			if ((changed.edit || changed.columns) && td_class_value !== (td_class_value = "" + (((!state.edit && column.action) || state.edit) ? 'nopadding' : '') + " " + (column.numeric ? 'numeric' : '') + " " + (column.truncate ? ' truncate' : ''))) {
				td.className = td_class_value;
			}

			if (changed.columns) {
				setStyle(td, "width", ( column.width ? column.width : 'auto' ));
			}
		},

		u: function unmount() {
			detachNode(td);
		},

		d: function destroy$$1() {
			datacol.destroy(false);
		}
	};
}

function DataGrid(options) {
	init(this, options);
	this._state = assign(data$17(), options.data);
	this._recompute({ columns: 1 }, this._state);

	if (!document.getElementById("svelte-bmd9at-style")) { add_css$3(); }

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$17(this, this._state);

	if (options.target) {
		this._fragment.c();
		this._mount(options.target, options.anchor);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(assign(DataGrid.prototype, methods$2), proto);

DataGrid.prototype._recompute = function _recompute(changed, state) {
	if (changed.columns) {
		if (this._differs(state.colCount, (state.colCount = colCount(state.columns)))) { changed.colCount = true; }
	}
};

export { MaskedField, CurrencyField, SelectField, TextField, FormGrid, DataGrid, ActionButton };
//# sourceMappingURL=formgrid.es.js.map
