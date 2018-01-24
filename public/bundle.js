var app = (function () {
'use strict';

function noop() {}

function assign(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
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

function reinsertChildren(parent, target) {
	while (parent.firstChild) target.appendChild(parent.firstChild);
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

function destroyDev(detach) {
	destroy.call(this, detach);
	this.destroy = function() {
		console.warn('Component was already destroyed');
	};
}

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
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

function observeDev(key, callback, options) {
	var c = (key = '' + key).search(/[^\w]/);
	if (c > -1) {
		var message =
			'The first argument to component.observe(...) must be the name of a top-level property';
		if (c > 0)
			message += ", i.e. '" + key.slice(0, c) + "' rather than '" + key + "'";

		throw new Error(message);
	}

	return observe.call(this, key, callback, options);
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

function onDev(eventName, handler) {
	if (eventName === 'teardown') {
		console.warn(
			"Use component.on('destroy', ...) instead of component.on('teardown', ...) which has been deprecated and will be unsupported in Svelte 2"
		);
		return this.on('destroy', handler);
	}

	return on.call(this, eventName, handler);
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
		if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign({}, oldState, newState);
	this._recompute(changed, this._state);
	if (this._bind) this._bind(changed, this._state);

	if (this._fragment) {
		dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
		this._fragment.p(changed, this._state);
		dispatchObservers(this, this._observers.post, changed, this._state, oldState);
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
	while (fns && fns.length) fns.pop()();
}

function _mount(target, anchor) {
	this._fragment.m(target, anchor);
}

function _unmount() {
	if (this._fragment) this._fragment.u();
}

var protoDev = {
	destroy: destroyDev,
	get: get,
	fire: fire,
	observe: observeDev,
	on: onDev,
	set: setDev,
	teardown: destroyDev,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount
};

function makeUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/* src\TextField.html generated by Svelte v1.53.0 */
function data$3() {
    return { 
        type: 'text',
        uuid: makeUniqueId(),
        placeholder: '',
        label: '',
        inputClass: '',
        value: '',
        class: '',
        readOnly: false,
        required: false,
        pattern: '',
        validate: null,
        validators: null
    }
}

var methods = {
    initValidators: function (element, data) {
        if (data && data.length > 0) {
            data.forEach(function(attr) {
                const kv = attr.split('=');
                if (kv.length == 2) {
                    element.setAttribute('data-validate-' + kv[0], kv[1]);
                }                    
            }, this);
        }
    }
};

function oncreate$1() {
    const element = this.refs.input;
    this.observe('required', required => {
        element.required = required;
    });
    element.required = this.get('required');
    const pattern = this.get('pattern');
    if (pattern) {
        element.setAttribute('pattern', pattern);
    }
    this.initValidators(element, this.get('validate'));
}

function create_main_fragment$3(state, component) {
	var div, label, text, text_1, div_1, div_2;

	var current_block_type = select_block_type$2(state);
	var if_block = current_block_type(state, component);

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text = createText(state.label);
			text_1 = createText("\r\n    ");
			div_1 = createElement("div");
			div_2 = createElement("div");
			if_block.c();
			this.h();
		},

		h: function hydrate() {
			label.className = "col-4 col-form-label";
			label.htmlFor = state.uuid;
			div_2.className = "form-group";
			div_1.className = "col-8";
			div.className = "form-group row";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			appendNode(text, label);
			appendNode(text_1, div);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			if_block.m(div_2, null);
		},

		p: function update(changed, state) {
			if (changed.label) {
				text.data = state.label;
			}

			if (changed.uuid) {
				label.htmlFor = state.uuid;
			}

			if (current_block_type === (current_block_type = select_block_type$2(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(state, component);
				if_block.c();
				if_block.m(div_2, null);
			}
		},

		u: function unmount() {
			detachNode(div);
			if_block.u();
		},

		d: function destroy$$1() {
			if_block.d();
		}
	};
}

// (5:12) {{#if type=='number'}}
function create_if_block$2(state, component) {
	var input, input_updating = false, input_class_value, input_readonly_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ value: toNumber(input.value) });
		input_updating = false;
	}

	return {
		c: function create() {
			input = createElement("input");
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			input.type = "number";
			input.className = input_class_value = "form-control " + state.inputClass;
			input.id = state.uuid;
			input.placeholder = state.placeholder;
			input.readOnly = input_readonly_value = state.readOnly ? 'readonly' : '';
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = state.value;
		},

		p: function update(changed, state) {
			if (!input_updating) input.value = state.value;
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + state.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.uuid) {
				input.id = state.uuid;
			}

			if (changed.placeholder) {
				input.placeholder = state.placeholder;
			}

			if ((changed.readOnly) && input_readonly_value !== (input_readonly_value = state.readOnly ? 'readonly' : '')) {
				input.readOnly = input_readonly_value;
			}
		},

		u: function unmount() {
			detachNode(input);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			if (component.refs.input === input) component.refs.input = null;
		}
	};
}

// (12:12) {{else}}
function create_if_block_1$2(state, component) {
	var input, input_updating = false, input_class_value, input_readonly_value;

	function input_input_handler() {
		input_updating = true;
		component.set({ value: input.value });
		input_updating = false;
	}

	return {
		c: function create() {
			input = createElement("input");
			this.h();
		},

		h: function hydrate() {
			addListener(input, "input", input_input_handler);
			input.type = "text";
			input.className = input_class_value = "form-control " + state.inputClass;
			input.id = state.uuid;
			input.placeholder = state.placeholder;
			input.readOnly = input_readonly_value = state.readOnly ? 'readonly' : '';
		},

		m: function mount(target, anchor) {
			insertNode(input, target, anchor);
			component.refs.input = input;

			input.value = state.value;
		},

		p: function update(changed, state) {
			if (!input_updating) input.value = state.value;
			if ((changed.inputClass) && input_class_value !== (input_class_value = "form-control " + state.inputClass)) {
				input.className = input_class_value;
			}

			if (changed.uuid) {
				input.id = state.uuid;
			}

			if (changed.placeholder) {
				input.placeholder = state.placeholder;
			}

			if ((changed.readOnly) && input_readonly_value !== (input_readonly_value = state.readOnly ? 'readonly' : '')) {
				input.readOnly = input_readonly_value;
			}
		},

		u: function unmount() {
			detachNode(input);
		},

		d: function destroy$$1() {
			removeListener(input, "input", input_input_handler);
			if (component.refs.input === input) component.refs.input = null;
		}
	};
}

function select_block_type$2(state) {
	if (state.type=='number') return create_if_block$2;
	return create_if_block_1$2;
}

function TextField(options) {
	this._debugName = '<TextField>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this.refs = {};
	this._state = assign(data$3(), options.data);
	if (!('uuid' in this._state)) console.warn("<TextField> was created without expected data property 'uuid'");
	if (!('label' in this._state)) console.warn("<TextField> was created without expected data property 'label'");
	if (!('type' in this._state)) console.warn("<TextField> was created without expected data property 'type'");
	if (!('inputClass' in this._state)) console.warn("<TextField> was created without expected data property 'inputClass'");
	if (!('placeholder' in this._state)) console.warn("<TextField> was created without expected data property 'placeholder'");
	if (!('value' in this._state)) console.warn("<TextField> was created without expected data property 'value'");
	if (!('readOnly' in this._state)) console.warn("<TextField> was created without expected data property 'readOnly'");

	var _oncreate = oncreate$1.bind(this);

	if (!options.root) {
		this._oncreate = [_oncreate];
	} else {
	 	this.root._oncreate.push(_oncreate);
	 }

	this._fragment = create_main_fragment$3(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._oncreate);
	}
}

assign(TextField.prototype, methods, protoDev);

TextField.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src\SelectField.html generated by Svelte v1.53.0 */
function optionList(settings) {                
    if (settings) {                    
        return settings.optionList;
    }
    return [];
}

function data$4() {
    return { 
        uuid: makeUniqueId(),
        label: '',
        inputClass: '',
        value: '',
        optionList: [],
        getOptionName: (x) => x.name
    }
}

function create_main_fragment$4(state, component) {
	var div, label, text, text_1, div_1, div_2, select, select_updating = false, select_class_value;

	var optionList_1 = state.optionList;

	var each_blocks = [];

	for (var i = 0; i < optionList_1.length; i += 1) {
		each_blocks[i] = create_each_block$1(state, optionList_1, optionList_1[i], i, component);
	}

	function select_change_handler() {
		select_updating = true;
		component.set({ value: selectValue(select) });
		select_updating = false;
	}

	return {
		c: function create() {
			div = createElement("div");
			label = createElement("label");
			text = createText(state.label);
			text_1 = createText("\r\n    ");
			div_1 = createElement("div");
			div_2 = createElement("div");
			select = createElement("select");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		h: function hydrate() {
			label.className = "col-4 col-form-label";
			label.htmlFor = state.uuid;
			addListener(select, "change", select_change_handler);
			if (!('value' in state)) component.root._beforecreate.push(select_change_handler);
			select.className = select_class_value = "form-control " + state.inputClass;
			select.id = state.uuid;
			div_2.className = "form-group";
			div_1.className = "col-8";
			div.className = "form-group row";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(label, div);
			appendNode(text, label);
			appendNode(text_1, div);
			appendNode(div_1, div);
			appendNode(div_2, div_1);
			appendNode(select, div_2);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			selectOption(select, state.value);
		},

		p: function update(changed, state) {
			if (changed.label) {
				text.data = state.label;
			}

			if (changed.uuid) {
				label.htmlFor = state.uuid;
			}

			var optionList_1 = state.optionList;

			if (changed.optionList || changed.getOptionName) {
				for (var i = 0; i < optionList_1.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].p(changed, state, optionList_1, optionList_1[i], i);
					} else {
						each_blocks[i] = create_each_block$1(state, optionList_1, optionList_1[i], i, component);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = optionList_1.length;
			}

			if (!select_updating) selectOption(select, state.value);
			if ((changed.inputClass) && select_class_value !== (select_class_value = "form-control " + state.inputClass)) {
				select.className = select_class_value;
			}

			if (changed.uuid) {
				select.id = state.uuid;
			}
		},

		u: function unmount() {
			detachNode(div);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			removeListener(select, "change", select_change_handler);
		}
	};
}

// (6:16) {{#each optionList as opt}}
function create_each_block$1(state, optionList_1, opt, opt_index, component) {
	var option, text_value = state.getOptionName(opt), text, option_value_value;

	return {
		c: function create() {
			option = createElement("option");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			option.__value = option_value_value = opt.id;
			option.value = option.__value;
		},

		m: function mount(target, anchor) {
			insertNode(option, target, anchor);
			appendNode(text, option);
		},

		p: function update(changed, state, optionList_1, opt, opt_index) {
			if ((changed.getOptionName || changed.optionList) && text_value !== (text_value = state.getOptionName(opt))) {
				text.data = text_value;
			}

			if ((changed.optionList) && option_value_value !== (option_value_value = opt.id)) {
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

function SelectField(options) {
	this._debugName = '<SelectField>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$4(), options.data);
	this._recompute({ settings: 1 }, this._state);
	if (!('settings' in this._state)) console.warn("<SelectField> was created without expected data property 'settings'");
	if (!('uuid' in this._state)) console.warn("<SelectField> was created without expected data property 'uuid'");
	if (!('label' in this._state)) console.warn("<SelectField> was created without expected data property 'label'");
	if (!('inputClass' in this._state)) console.warn("<SelectField> was created without expected data property 'inputClass'");
	if (!('value' in this._state)) console.warn("<SelectField> was created without expected data property 'value'");
	if (!('optionList' in this._state)) console.warn("<SelectField> was created without expected data property 'optionList'");
	if (!('getOptionName' in this._state)) console.warn("<SelectField> was created without expected data property 'getOptionName'");

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
	}

	this._fragment = create_main_fragment$4(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		callAll(this._beforecreate);
	}
}

assign(SelectField.prototype, protoDev);

SelectField.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('optionList' in newState && !this._updatingReadonlyProperty) throw new Error("<SelectField>: Cannot set read-only property 'optionList'");
};

SelectField.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (differs(state.optionList, (state.optionList = optionList(state.settings)))) changed.optionList = true;
	}
};

/* src\FormCol.html generated by Svelte v1.53.0 */
function classes(settings) {                
    if (settings.col) {
        let cols = settings.col.split(' ');
        cols = cols.filter(x=> x && x.trim()).map(x=> 'col-' + x);
        return cols.join(' ').trim();
    }
    return '';
}

function displayable(source, settings) {
    return source && (source.hasOwnProperty(settings.field) && source[settings.field] != null);
}

function fieldtype(settings) {
    let ft = TextField;
    if (settings.component) {
        switch (settings.component.toLowerCase()) {
            case 'text':
                ft = TextField;
                break;
            // case 'number':
            //     ft = Number;
            //     break;
            // case 'date':
            //     ft = Date;
            //     break;
            case 'select':
                ft = SelectField;
                break;
        }
    }
    return ft;
}

function data$2(){
    return {
        // edit: true,
        // editable: true,
        source: {},
    }
}

function create_main_fragment$2(state, component) {
	var div;

	var current_block_type = select_block_type$1(state);
	var if_block = current_block_type && current_block_type(state, component);

	return {
		c: function create() {
			div = createElement("div");
			if (if_block) if_block.c();
			this.h();
		},

		h: function hydrate() {
			div.className = state.classes;
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			if (if_block) if_block.m(div, null);
		},

		p: function update(changed, state) {
			if (current_block_type === (current_block_type = select_block_type$1(state)) && if_block) {
				if_block.p(changed, state);
			} else {
				if (if_block) {
					if_block.u();
					if_block.d();
				}
				if_block = current_block_type && current_block_type(state, component);
				if (if_block) if_block.c();
				if (if_block) if_block.m(div, null);
			}

			if (changed.classes) {
				div.className = state.classes;
			}
		},

		u: function unmount() {
			detachNode(div);
			if (if_block) if_block.u();
		},

		d: function destroy$$1() {
			if (if_block) if_block.d();
		}
	};
}

// (2:4) {{#if edit && source}}
function create_if_block$1(state, component) {
	var switch_instance_updating = {}, switch_instance_anchor;

	var switch_value = state.fieldtype;

	function switch_props(state) {
		var switch_instance_initial_data = {
			label: state.settings.label,
			settings: state.settings
		};
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
					newState.settings = state.settings;
				}
				switch_instance_updating = assign({}, changed);
				component._set(newState);
				switch_instance_updating = {};
			}
		};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(state));

		component.root._beforecreate.push(function() {
			var state = component.get(), childState = switch_instance.get(), newState = {};
			if (!childState) return;
			if (!switch_instance_updating.value) {
				state.source[state.settings.field] = childState.value;
				newState.source = state.source;
				newState.settings = state.settings;
			}
			switch_instance_updating = { value: true };
			component._set(newState);
			switch_instance_updating = {};
		});
	}

	return {
		c: function create() {
			switch_instance_anchor = createComment();
			if (switch_instance) switch_instance._fragment.c();
		},

		m: function mount(target, anchor) {
			insertNode(switch_instance_anchor, target, anchor);
			if (switch_instance) switch_instance._mount(target, anchor);
		},

		p: function update(changed, state) {
			if (switch_value !== (switch_value = state.fieldtype)) {
				if (switch_instance) switch_instance.destroy();

				if (switch_value) {
					switch_instance = new switch_value(switch_props(state));
					switch_instance._fragment.c();
					switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);
				}
			}

			else {
				var switch_instance_changes = {};
				if (changed.settings) switch_instance_changes.label = state.settings.label;
				if (changed.settings) switch_instance_changes.settings = state.settings;
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
			if (switch_instance) switch_instance._unmount();
		},

		d: function destroy$$1() {
			if (switch_instance) switch_instance.destroy(false);
		}
	};
}

// (4:26) 
function create_if_block_1$1(state, component) {
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

function select_block_type$1(state) {
	if (state.edit && state.source) return create_if_block$1;
	if (state.displayable) return create_if_block_1$1;
	return null;
}

function FormCol(options) {
	this._debugName = '<FormCol>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$2(), options.data);
	this._recompute({ settings: 1, source: 1 }, this._state);
	if (!('settings' in this._state)) console.warn("<FormCol> was created without expected data property 'settings'");
	if (!('source' in this._state)) console.warn("<FormCol> was created without expected data property 'source'");
	if (!('classes' in this._state)) console.warn("<FormCol> was created without expected data property 'classes'");
	if (!('edit' in this._state)) console.warn("<FormCol> was created without expected data property 'edit'");
	if (!('fieldtype' in this._state)) console.warn("<FormCol> was created without expected data property 'fieldtype'");
	if (!('displayable' in this._state)) console.warn("<FormCol> was created without expected data property 'displayable'");

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$2(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

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
	if ('fieldtype' in newState && !this._updatingReadonlyProperty) throw new Error("<FormCol>: Cannot set read-only property 'fieldtype'");
};

FormCol.prototype._recompute = function _recompute(changed, state) {
	if (changed.settings) {
		if (differs(state.classes, (state.classes = classes(state.settings)))) changed.classes = true;
	}

	if (changed.source || changed.settings) {
		if (differs(state.displayable, (state.displayable = displayable(state.source, state.settings)))) changed.displayable = true;
	}

	if (changed.settings) {
		if (differs(state.fieldtype, (state.fieldtype = fieldtype(state.settings)))) changed.fieldtype = true;
	}
};

/* src\Row.html generated by Svelte v1.53.0 */
function data$5() {
  return {
    class: '',
    noGutters: false
  }
}

function create_main_fragment$5(state, component) {
	var div, slot_content_default = component._slotted.default, div_class_value;

	return {
		c: function create() {
			div = createElement("div");
			this.h();
		},

		h: function hydrate() {
			div.className = div_class_value = "row" + (state.noGutters ? ' no-gutters' : '') + " " + state.class;
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);

			if (slot_content_default) {
				appendNode(slot_content_default, div);
			}
		},

		p: function update(changed, state) {
			if ((changed.noGutters || changed.class) && div_class_value !== (div_class_value = "row" + (state.noGutters ? ' no-gutters' : '') + " " + state.class)) {
				div.className = div_class_value;
			}
		},

		u: function unmount() {
			detachNode(div);

			if (slot_content_default) {
				reinsertChildren(div, slot_content_default);
			}
		},

		d: noop
	};
}

function Row(options) {
	this._debugName = '<Row>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$5(), options.data);
	if (!('noGutters' in this._state)) console.warn("<Row> was created without expected data property 'noGutters'");
	if (!('class' in this._state)) console.warn("<Row> was created without expected data property 'class'");

	this._slotted = options.slots || {};

	this.slots = {};

	this._fragment = create_main_fragment$5(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);
	}
}

assign(Row.prototype, protoDev);

Row.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

/* src\FormGrid.html generated by Svelte v1.53.0 */
function rows(columns) {                
    const maxRowNum = Math.max.apply(Math, columns.map(o => o.row));
    const rows = [];
    for (let i = 0; i <= maxRowNum; i++) {
        rows.push({ columns: [] });
    }
    for (let i = 0; i < columns.length; i++) {
        rows[columns[i].row].columns.push(columns[i]);
    }
    return rows;
}

function data$1() {
    return {
        edit: true,
        item: {},
        rows: [],
        columns: [],
    }
}

function encapsulateStyles(node) {
	setAttribute(node, "svelte-2669792316", "");
}

function create_main_fragment$1(state, component) {
	var each_anchor;

	var rows_1 = state.rows;

	var each_blocks = [];

	for (var i = 0; i < rows_1.length; i += 1) {
		each_blocks[i] = create_each_block(state, rows_1, rows_1[i], i, component);
	}

	return {
		c: function create() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_anchor = createComment();
		},

		m: function mount(target, anchor) {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insertNode(each_anchor, target, anchor);
		},

		p: function update(changed, state) {
			var rows_1 = state.rows;

			if (changed.rows || changed.item || changed.edit) {
				for (var i = 0; i < rows_1.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].p(changed, state, rows_1, rows_1[i], i);
					} else {
						each_blocks[i] = create_each_block(state, rows_1, rows_1[i], i, component);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = rows_1.length;
			}
		},

		u: function unmount() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			detachNode(each_anchor);
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);
		}
	};
}

// (1:0) {{#each rows as row}}
function create_each_block(state, rows_1, row, row_index, component) {
	var text, each_anchor, text_1;

	var columns = row.columns;

	var each_blocks = [];

	for (var i = 0; i < columns.length; i += 1) {
		each_blocks[i] = create_each_block_1(state, rows_1, row, row_index, columns, columns[i], i, component);
	}

	var row_1 = new Row({
		root: component.root,
		slots: { default: createFragment() }
	});

	return {
		c: function create() {
			text = createText("\r\n    ");

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_anchor = createComment();
			text_1 = createText("\r\n");
			row_1._fragment.c();
		},

		m: function mount(target, anchor) {
			appendNode(text, row_1._slotted.default);

			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(row_1._slotted.default, null);
			}

			appendNode(each_anchor, row_1._slotted.default);
			appendNode(text_1, row_1._slotted.default);
			row_1._mount(target, anchor);
		},

		p: function update(changed, state, rows_1, row, row_index) {
			var columns = row.columns;

			if (changed.rows || changed.item || changed.edit) {
				for (var i = 0; i < columns.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].p(changed, state, rows_1, row, row_index, columns, columns[i], i);
					} else {
						each_blocks[i] = create_each_block_1(state, rows_1, row, row_index, columns, columns[i], i, component);
						each_blocks[i].c();
						each_blocks[i].m(each_anchor.parentNode, each_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
					each_blocks[i].d();
				}
				each_blocks.length = columns.length;
			}
		},

		u: function unmount() {
			for (var i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].u();
			}

			row_1._unmount();
		},

		d: function destroy$$1() {
			destroyEach(each_blocks);

			row_1.destroy(false);
		}
	};
}

// (3:4) {{#each row.columns as col}}
function create_each_block_1(state, rows_1, row, row_index, columns, col, col_index, component) {
	var if_block_anchor;

	var current_block_type = select_block_type(state, rows_1, row, row_index, columns, col, col_index);
	var if_block = current_block_type(state, rows_1, row, row_index, columns, col, col_index, component);

	return {
		c: function create() {
			if_block.c();
			if_block_anchor = createComment();
		},

		m: function mount(target, anchor) {
			if_block.m(target, anchor);
			insertNode(if_block_anchor, target, anchor);
		},

		p: function update(changed, state, rows_1, row, row_index, columns, col, col_index) {
			if (current_block_type === (current_block_type = select_block_type(state, rows_1, row, row_index, columns, col, col_index)) && if_block) {
				if_block.p(changed, state, rows_1, row, row_index, columns, col, col_index);
			} else {
				if_block.u();
				if_block.d();
				if_block = current_block_type(state, rows_1, row, row_index, columns, col, col_index, component);
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

// (4:8) {{#if col.subtitle}}
function create_if_block(state, rows_1, row, row_index, columns, col, col_index, component) {
	var div, text_value = col.subtitle, text;

	return {
		c: function create() {
			div = createElement("div");
			text = createText(text_value);
			this.h();
		},

		h: function hydrate() {
			encapsulateStyles(div);
			div.className = "subtitle";
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			appendNode(text, div);
		},

		p: function update(changed, state, rows_1, row, row_index, columns, col, col_index) {
			if ((changed.rows) && text_value !== (text_value = col.subtitle)) {
				text.data = text_value;
			}
		},

		u: function unmount() {
			detachNode(div);
		},

		d: noop
	};
}

// (6:8) {{else}}
function create_if_block_1(state, rows_1, row, row_index, columns, col, col_index, component) {
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
			formcol_updating = assign({}, changed);
			component._set(newState);
			formcol_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		var state = component.get(), childState = formcol.get(), newState = {};
		if (!childState) return;
		if (!formcol_updating.source) {
			newState.item = childState.source;
		}
		formcol_updating = { source: true };
		component._set(newState);
		formcol_updating = {};
	});

	return {
		c: function create() {
			formcol._fragment.c();
		},

		m: function mount(target, anchor) {
			formcol._mount(target, anchor);
		},

		p: function update(changed, state, rows_1, row, row_index, columns, col, col_index) {
			var formcol_changes = {};
			if (changed.rows) formcol_changes.settings = col;
			if (changed.edit) formcol_changes.edit = state.edit;
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

function select_block_type(state, rows_1, row, row_index, columns, col, col_index) {
	if (col.subtitle) return create_if_block;
	return create_if_block_1;
}

function FormGrid(options) {
	this._debugName = '<FormGrid>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data$1(), options.data);
	this._recompute({ columns: 1 }, this._state);
	if (!('columns' in this._state)) console.warn("<FormGrid> was created without expected data property 'columns'");
	if (!('rows' in this._state)) console.warn("<FormGrid> was created without expected data property 'rows'");
	if (!('item' in this._state)) console.warn("<FormGrid> was created without expected data property 'item'");
	if (!('edit' in this._state)) console.warn("<FormGrid> was created without expected data property 'edit'");

	if (!options.root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment$1(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(FormGrid.prototype, protoDev);

FormGrid.prototype._checkReadOnly = function _checkReadOnly(newState) {
	if ('rows' in newState && !this._updatingReadonlyProperty) throw new Error("<FormGrid>: Cannot set read-only property 'rows'");
};

FormGrid.prototype._recompute = function _recompute(changed, state) {
	if (changed.columns) {
		if (differs(state.rows, (state.rows = rows(state.columns)))) changed.rows = true;
	}
};

/* src\App.html generated by Svelte v1.53.0 */
const stateList = [
   {id: 'AL',name: 'AL'},
   {id: 'MA',name: 'MA'},
   {id: 'MO',name: 'MO'},
   {id: 'RI',name: 'RI'}
];

var data = [
        {
            "id": 1,
            "fname": "Gale",
            "lname": "Mcmyne",
            "age": 16,
            "state": "RI"
        }, {
            "id": 2,
            "fname": "Tighe",
            "lname": "Walls",
            "age": 43,
            "state": "AL"
        }, {
            "id": 3,
            "fname": "Anuj",
            "lname": "Wittcop",
            "age": 16,
            "state": "MO"
        }, {
            "id": 4,
            "fname": "Elisha",
            "lname": "Mahan",
            "age": 28,
            "state": "MA"
        }
    ];

function data_1() {
    return { 
        item: data[0],
        columndata: [
            {
                label: 'First Name', // Column name
                field: 'fname', // Field name from row
                numeric: false, // Affects sorting
                component: 'text',
                row: 0,
                col: 'md-4'
            }, {
                label: 'Last Name',
                field: 'lname',
                numeric: false,
                component: 'text',
                row: 0,
                col: 'md-3'
            }, {
                label: 'Age',
                field: 'age',
                numeric: true,
                component: 'text',
                row: 1,
                col: 'md-4'
            }, {
                label: 'State',
                field: 'state',
                optionList: stateList,
                component: 'select',
                row: 1,
                col: 'md-3'
            }
        ]                
    }
}

function oncreate() {
    setTimeout(() => {
        this.set({ item: data[1] });
    }, 1000);
}

function create_main_fragment(state, component) {
	var div, formgrid_updating = {};

	var formgrid_initial_data = { columns: state.columndata };
	if ('item' in state) {
		formgrid_initial_data.item = state.item;
		formgrid_updating.item = true;
	}
	var formgrid = new FormGrid({
		root: component.root,
		data: formgrid_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if (!formgrid_updating.item && changed.item) {
				newState.item = childState.item;
			}
			formgrid_updating = assign({}, changed);
			component._set(newState);
			formgrid_updating = {};
		}
	});

	component.root._beforecreate.push(function() {
		var state = component.get(), childState = formgrid.get(), newState = {};
		if (!childState) return;
		if (!formgrid_updating.item) {
			newState.item = childState.item;
		}
		formgrid_updating = { item: true };
		component._set(newState);
		formgrid_updating = {};
	});

	return {
		c: function create() {
			div = createElement("div");
			formgrid._fragment.c();
		},

		m: function mount(target, anchor) {
			insertNode(div, target, anchor);
			formgrid._mount(div, null);
		},

		p: function update(changed, state) {
			var formgrid_changes = {};
			if (changed.columndata) formgrid_changes.columns = state.columndata;
			if (!formgrid_updating.item && changed.item) {
				formgrid_changes.item = state.item;
				formgrid_updating.item = true;
			}
			formgrid._set(formgrid_changes);
			formgrid_updating = {};

			
		},

		u: function unmount() {
			detachNode(div);
		},

		d: function destroy$$1() {
			formgrid.destroy(false);
		}
	};
}

function App(options) {
	this._debugName = '<App>';
	if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
	init(this, options);
	this._state = assign(data_1(), options.data);
	if (!('columndata' in this._state)) console.warn("<App> was created without expected data property 'columndata'");
	if (!('item' in this._state)) console.warn("<App> was created without expected data property 'item'");

	var _oncreate = oncreate.bind(this);

	if (!options.root) {
		this._oncreate = [_oncreate];
		this._beforecreate = [];
		this._aftercreate = [];
	} else {
	 	this.root._oncreate.push(_oncreate);
	 }

	this._fragment = create_main_fragment(this._state, this);

	if (options.target) {
		if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		this._fragment.c();
		this._fragment.m(options.target, options.anchor || null);

		this._lock = true;
		callAll(this._beforecreate);
		callAll(this._oncreate);
		callAll(this._aftercreate);
		this._lock = false;
	}
}

assign(App.prototype, protoDev);

App.prototype._checkReadOnly = function _checkReadOnly(newState) {
};

var app = new App({
	target: document.body,
	data: {}
});

return app;

}());
//# sourceMappingURL=bundle.js.map
