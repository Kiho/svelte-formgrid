var app = (function () {
	'use strict';

	function noop() {}

	function assign(tar, src) {
		for (var k in src) tar[k] = src[k];
		return tar;
	}

	function assignTrue(tar, src) {
		for (var k in src) tar[k] = 1;
		return tar;
	}

	function addLoc(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function exclude(src, prop) {
		const tar = {};
		for (const k in src) k === prop || (tar[k] = src[k]);
		return tar;
	}

	function append(target, node) {
		target.appendChild(node);
	}

	function insert(target, node, anchor) {
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

	function setData(text, data) {
		text.data = '' + data;
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
				try {
					handler.__calling = true;
					handler.call(this, data);
				} finally {
					handler.__calling = false;
				}
			}
		}
	}

	function flush(component) {
		component._lock = true;
		callAll(component._beforecreate);
		callAll(component._oncreate);
		callAll(component._aftercreate);
		component._lock = false;
	}

	function get() {
		return this._state;
	}

	function init(component, options) {
		component._handlers = blankObject();
		component._slots = blankObject();
		component._bind = options._bind;

		component.options = options;
		component.root = options.root || component;
		component.store = options.store || component.root.store;

		if (!options.root) {
			component._beforecreate = [];
			component._oncreate = [];
			component._aftercreate = [];
		}
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
		flush(this.root);
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
	                const error = element.checkValidity() ? '' : element.validationMessage;
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
	};

	/* src\inputs\MaskedInput.html generated by Svelte v2.13.1 */

	var data = fieldBase.data;

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

	function oncreate() {
	    fieldBase.oncreate(this);
	}
	function onupdate({ changed, current }) {
	    if (changed.value) {
	        this.set({ text: current.value });
	    }
	}
	const file = "src\\inputs\\MaskedInput.html";

	function create_main_fragment(component, ctx) {
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
				addLoc(input, file, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);
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
		this._state = assign(data(), options.data);
		if (!('inputClass' in this._state)) console.warn("<MaskedInput> was created without expected data property 'inputClass'");
		if (!('text' in this._state)) console.warn("<MaskedInput> was created without expected data property 'text'");
		if (!('readOnly' in this._state)) console.warn("<MaskedInput> was created without expected data property 'readOnly'");
		if (!('required' in this._state)) console.warn("<MaskedInput> was created without expected data property 'required'");
		if (!('pattern' in this._state)) console.warn("<MaskedInput> was created without expected data property 'pattern'");
		if (!('placeholder' in this._state)) console.warn("<MaskedInput> was created without expected data property 'placeholder'");
		this._intro = true;
		this._handlers.update = [onupdate];

		this._fragment = create_main_fragment(this, this._state);

		this.root._oncreate.push(() => {
			oncreate.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
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

	/* src\inputs\CurrencyInput.html generated by Svelte v2.13.1 */

	const toNumber$1 = v => Number(v.replace(/[^0-9\.]+/g,""));

	var data$1 = fieldBase.data;

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

	function oncreate$1() {
	    fieldBase.oncreate(this);
	}
	function onupdate$1({ changed, current, previous }) {
	    if (changed.value) {
	        this.set({ text: formatCurrency(current.value) });
	    }
	}
	const file$1 = "src\\inputs\\CurrencyInput.html";

	function create_main_fragment$1(component, ctx) {
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
				addLoc(input, file$1, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);
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
		this._state = assign(data$1(), options.data);
		if (!('inputClass' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'inputClass'");
		if (!('uuid' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'uuid'");
		if (!('placeholder' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'placeholder'");
		if (!('text' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'text'");
		if (!('readOnly' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'readOnly'");
		if (!('required' in this._state)) console.warn("<CurrencyInput> was created without expected data property 'required'");
		this._intro = true;
		this._handlers.update = [onupdate$1];

		this._fragment = create_main_fragment$1(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$1.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(CurrencyInput.prototype, protoDev);
	assign(CurrencyInput.prototype, methods$1);

	CurrencyInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* src\inputs\SelectInput.html generated by Svelte v2.13.1 */

	function isObjectOptions({ optionList }) {
	    const listType = typeof optionList[0];
	    return optionList ? listType === 'object' : false;
	}

	function data$2() {
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
	const file$2 = "src\\inputs\\SelectInput.html";

	function create_main_fragment$2(component, ctx) {
		var select, select_updating = false, select_class_value;

		function select_block_type(ctx) {
			if (ctx.isObjectOptions) return create_if_block;
			return create_if_block_1;
		}

		var current_block_type = select_block_type(ctx);
		var if_block = current_block_type(component, ctx);

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
				if_block.c();
				addListener(select, "change", select_change_handler);
				if (!('value' in ctx)) component.root._beforecreate.push(select_change_handler);
				addListener(select, "change", change_handler);
				select.className = select_class_value = "form-control " + ctx.inputClass;
				addLoc(select, file$2, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, select, anchor);
				if_block.m(select, null);
				component.refs.input = select;

				selectOption(select, ctx.value);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block.d(1);
					if_block = current_block_type(component, ctx);
					if_block.c();
					if_block.m(select, null);
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

				if_block.d();
				removeListener(select, "change", select_change_handler);
				removeListener(select, "change", change_handler);
				if (component.refs.input === select) component.refs.input = null;
			}
		};
	}

	// (3:8) {#each optionList as opt}
	function create_each_block(component, ctx) {
		var option, text_value = ctx.getOptionName(ctx.opt), text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt[ctx.optionValue];
				option.value = option.__value;
				addLoc(option, file$2, 3, 12, 190);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.getOptionName || changed.optionList) && text_value !== (text_value = ctx.getOptionName(ctx.opt))) {
					setData(text, text_value);
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

	// (7:8) {#each optionList as opt}
	function create_each_block_1(component, ctx) {
		var option, text_value = ctx.opt, text, option_value_value;

		return {
			c: function create() {
				option = createElement("option");
				text = createText(text_value);
				option.__value = option_value_value = ctx.opt;
				option.value = option.__value;
				addLoc(option, file$2, 7, 12, 347);
			},

			m: function mount(target, anchor) {
				insert(target, option, anchor);
				append(option, text);
			},

			p: function update(changed, ctx) {
				if ((changed.optionList) && text_value !== (text_value = ctx.opt)) {
					setData(text, text_value);
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

	// (2:4) {#if isObjectOptions }
	function create_if_block(component, ctx) {
		var each_anchor;

		var each_value = ctx.optionList;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(component, get_each_context(ctx, each_value, i));
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

				insert(target, each_anchor, anchor);
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
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value.length;
				}
			},

			d: function destroy$$1(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
				}
			}
		};
	}

	// (6:4) {:else}
	function create_if_block_1(component, ctx) {
		var each_anchor;

		var each_value_1 = ctx.optionList;

		var each_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(component, get_each_context_1(ctx, each_value_1, i));
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

				insert(target, each_anchor, anchor);
			},

			p: function update(changed, ctx) {
				if (changed.optionList) {
					each_value_1 = ctx.optionList;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1(component, child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}
					each_blocks.length = each_value_1.length;
				}
			},

			d: function destroy$$1(detach) {
				destroyEach(each_blocks, detach);

				if (detach) {
					detachNode(each_anchor);
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

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.opt = list[i];
		child_ctx.each_value_1 = list;
		child_ctx.opt_index_1 = i;
		return child_ctx;
	}

	function SelectInput(options) {
		this._debugName = '<SelectInput>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this.refs = {};
		this._state = assign(data$2(), options.data);
		this._recompute({ optionList: 1 }, this._state);
		if (!('optionList' in this._state)) console.warn("<SelectInput> was created without expected data property 'optionList'");
		if (!('inputClass' in this._state)) console.warn("<SelectInput> was created without expected data property 'inputClass'");
		if (!('value' in this._state)) console.warn("<SelectInput> was created without expected data property 'value'");

		if (!('optionValue' in this._state)) console.warn("<SelectInput> was created without expected data property 'optionValue'");
		if (!('getOptionName' in this._state)) console.warn("<SelectInput> was created without expected data property 'getOptionName'");
		this._intro = true;

		this._fragment = create_main_fragment$2(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$2.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(SelectInput.prototype, protoDev);

	SelectInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('isObjectOptions' in newState && !this._updatingReadonlyProperty) throw new Error("<SelectInput>: Cannot set read-only property 'isObjectOptions'");
	};

	SelectInput.prototype._recompute = function _recompute(changed, state) {
		if (changed.optionList) {
			if (this._differs(state.isObjectOptions, (state.isObjectOptions = isObjectOptions(state)))) changed.isObjectOptions = true;
		}
	};

	/* src\inputs\TextInput.html generated by Svelte v2.13.1 */

	var data$3 = fieldBase.data;

	function oncreate$3() {
	    fieldBase.oncreate(this);
	}
	const file$3 = "src\\inputs\\TextInput.html";

	function create_main_fragment$3(component, ctx) {
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
				addLoc(input, file$3, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);
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
		this._state = assign(data$3(), options.data);
		if (!('inputClass' in this._state)) console.warn("<TextInput> was created without expected data property 'inputClass'");
		if (!('placeholder' in this._state)) console.warn("<TextInput> was created without expected data property 'placeholder'");
		if (!('value' in this._state)) console.warn("<TextInput> was created without expected data property 'value'");
		if (!('readOnly' in this._state)) console.warn("<TextInput> was created without expected data property 'readOnly'");
		if (!('required' in this._state)) console.warn("<TextInput> was created without expected data property 'required'");
		this._intro = true;

		this._fragment = create_main_fragment$3(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$3.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(TextInput.prototype, protoDev);

	TextInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* src\inputs\NumberInput.html generated by Svelte v2.13.1 */

	var data$4 = fieldBase.data;

	function oncreate$4() {
	    fieldBase.oncreate(this);
	}
	const file$4 = "src\\inputs\\NumberInput.html";

	function create_main_fragment$4(component, ctx) {
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
				addLoc(input, file$4, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);
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
		this._state = assign(data$4(), options.data);
		if (!('inputClass' in this._state)) console.warn("<NumberInput> was created without expected data property 'inputClass'");
		if (!('placeholder' in this._state)) console.warn("<NumberInput> was created without expected data property 'placeholder'");
		if (!('value' in this._state)) console.warn("<NumberInput> was created without expected data property 'value'");
		if (!('readOnly' in this._state)) console.warn("<NumberInput> was created without expected data property 'readOnly'");
		if (!('required' in this._state)) console.warn("<NumberInput> was created without expected data property 'required'");
		this._intro = true;

		this._fragment = create_main_fragment$4(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$4.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(NumberInput.prototype, protoDev);

	NumberInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* src\inputs\CheckboxInput.html generated by Svelte v2.13.1 */

	function data$5() {
	    return {
	        label: '',
	        class: '',
	        value: false,
	    }
	}
	const file$5 = "src\\inputs\\CheckboxInput.html";

	function create_main_fragment$5(component, ctx) {
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
				addLoc(input, file$5, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, input, anchor);

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
		this._state = assign(data$5(), options.data);
		if (!('value' in this._state)) console.warn("<CheckboxInput> was created without expected data property 'value'");
		if (!('class' in this._state)) console.warn("<CheckboxInput> was created without expected data property 'class'");
		this._intro = true;

		this._fragment = create_main_fragment$5(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(CheckboxInput.prototype, protoDev);

	CheckboxInput.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* src\inputs\ActionButton.html generated by Svelte v2.13.1 */

	function data$6() {
	    return {
	        label: '',
	        class: '',
	        value: false,
	    }
	}
	const file$6 = "src\\inputs\\ActionButton.html";

	function create_main_fragment$6(component, ctx) {
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
				addLoc(button, file$6, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, button, anchor);
				append(button, text);
			},

			p: function update(changed, ctx) {
				if (changed.label) {
					setData(text, ctx.label);
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
		this._state = assign(data$6(), options.data);
		if (!('class' in this._state)) console.warn("<ActionButton> was created without expected data property 'class'");
		if (!('label' in this._state)) console.warn("<ActionButton> was created without expected data property 'label'");
		this._intro = true;

		this._fragment = create_main_fragment$6(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);
		}
	}

	assign(ActionButton.prototype, protoDev);

	ActionButton.prototype._checkReadOnly = function _checkReadOnly(newState) {
	};

	/* src\Field.html generated by Svelte v2.13.1 */

	function props(all) { 
					return all.withSettings ? all.settings : all;
				}

	function message({ submit, error }) {
	    return submit ? error : '';
	}

	function label({ settings }) { 
	    return settings ? settings.label : null;
	}

	function data$7() {
	    const initialData = { 
	        uuid: fieldBase.makeUniqueId(),
	        submit: false,
	        error: '',
	        settings: null,
	        withSettings: false,
	        fieldtype: null,
	        value: '',
	    };
	    return Object.assign({}, initialData, fieldBase.fieldData());
	}
	const file$7 = "src\\Field.html";

	function create_main_fragment$7(component, ctx) {
		var div, label_1, text, text_1, div_1, div_2, switch_instance_updating = {}, text_2;

		var switch_instance_spread_levels = [
			ctx.props,
			{ uuid: ctx.uuid }
		];

		var switch_value = ctx.fieldtype;

		function switch_props(ctx) {
			var switch_instance_initial_data = {};
			for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
			}
			if (ctx.value  !== void 0) {
				switch_instance_initial_data.value = ctx.value ;
				switch_instance_updating.value = true;
			}
			if (ctx.submit  !== void 0) {
				switch_instance_initial_data.submit = ctx.submit ;
				switch_instance_updating.submit = true;
			}
			if (ctx.error  !== void 0) {
				switch_instance_initial_data.error = ctx.error ;
				switch_instance_updating.error = true;
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data,
				_bind(changed, childState) {
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

			component.root._beforecreate.push(() => {
				switch_instance._bind({ value: 1, submit: 1, error: 1 }, switch_instance.get());
			});
		}

		var if_block = (ctx.submit && ctx.error) && create_if_block$1(component, ctx);

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
				addLoc(label_1, file$7, 1, 4, 34);
				div_2.className = "form-group";
				addLoc(div_2, file$7, 3, 8, 131);
				div_1.className = "col-8";
				addLoc(div_1, file$7, 2, 4, 102);
				div.className = "form-group row";
				addLoc(div, file$7, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, label_1);
				append(label_1, text);
				append(div, text_1);
				append(div, div_1);
				append(div_1, div_2);

				if (switch_instance) {
					switch_instance._mount(div_2, null);
				}

				append(div_2, text_2);
				if (if_block) if_block.m(div_2, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				if (changed.label) {
					setData(text, ctx.label);
				}

				if (changed.uuid) {
					label_1.htmlFor = ctx.uuid;
				}

				var switch_instance_changes = (changed.props || changed.uuid) ? getSpreadUpdate(switch_instance_spread_levels, [
					(changed.props) && ctx.props,
					(changed.uuid) && { uuid: ctx.uuid }
				]) : {};
				if (!switch_instance_updating.value && changed.value) {
					switch_instance_changes.value = ctx.value ;
					switch_instance_updating.value = ctx.value  !== void 0;
				}
				if (!switch_instance_updating.submit && changed.submit) {
					switch_instance_changes.submit = ctx.submit ;
					switch_instance_updating.submit = ctx.submit  !== void 0;
				}
				if (!switch_instance_updating.error && changed.error) {
					switch_instance_changes.error = ctx.error ;
					switch_instance_updating.error = ctx.error  !== void 0;
				}

				if (switch_value !== (switch_value = ctx.fieldtype)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));

						component.root._beforecreate.push(() => {
							const changed = {};
							if (ctx.value  === void 0) changed.value = 1;
							if (ctx.submit  === void 0) changed.submit = 1;
							if (ctx.error  === void 0) changed.error = 1;
							switch_instance._bind(changed, switch_instance.get());
						});
						switch_instance._fragment.c();
						switch_instance._mount(div_2, text_2);
					} else {
						switch_instance = null;
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
						if_block = create_if_block$1(component, ctx);
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
	function create_if_block$1(component, ctx) {
		var div, text;

		return {
			c: function create() {
				div = createElement("div");
				text = createText(ctx.message);
				div.className = "invalid-feedback svelte-u293zm";
				addLoc(div, file$7, 6, 12, 309);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if (changed.message) {
					setData(text, ctx.message);
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
		this._state = assign(data$7(), options.data);
		this._recompute({ submit: 1, error: 1, settings: 1 }, this._state);
		if (!('submit' in this._state)) console.warn("<Field> was created without expected data property 'submit'");
		if (!('error' in this._state)) console.warn("<Field> was created without expected data property 'error'");
		if (!('settings' in this._state)) console.warn("<Field> was created without expected data property 'settings'");
		if (!('uuid' in this._state)) console.warn("<Field> was created without expected data property 'uuid'");

		if (!('fieldtype' in this._state)) console.warn("<Field> was created without expected data property 'fieldtype'");

		if (!('value' in this._state)) console.warn("<Field> was created without expected data property 'value'");
		this._intro = true;

		this._fragment = create_main_fragment$7(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(Field.prototype, protoDev);

	Field.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('message' in newState && !this._updatingReadonlyProperty) throw new Error("<Field>: Cannot set read-only property 'message'");
		if ('label' in newState && !this._updatingReadonlyProperty) throw new Error("<Field>: Cannot set read-only property 'label'");
		if ('props' in newState && !this._updatingReadonlyProperty) throw new Error("<Field>: Cannot set read-only property 'props'");
	};

	Field.prototype._recompute = function _recompute(changed, state) {
		if (changed.submit || changed.error) {
			if (this._differs(state.message, (state.message = message(state)))) changed.message = true;
		}

		if (changed.settings) {
			if (this._differs(state.label, (state.label = label(state)))) changed.label = true;
		}

		if (this._differs(state.props, (state.props = props(exclude(state, "props"))))) changed.props = true;
	};

	/* src\FormField.html generated by Svelte v2.13.1 */

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
	function oncreate$5() {
	    fieldBase.mergeProps(this, this.get().settings);
	}
	function create_main_fragment$8(component, ctx) {
		var field_updating = {};

		var field_initial_data = {
		 	settings: ctx.settings,
		 	withSettings: true,
		 	fieldtype: ctx.fieldtype
		 };
		if (ctx.value  !== void 0) {
			field_initial_data.value = ctx.value ;
			field_updating.value = true;
		}
		var field = new Field({
			root: component.root,
			store: component.store,
			data: field_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!field_updating.value && changed.value) {
					newState.value = childState.value;
				}
				component._set(newState);
				field_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
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
					field_updating.value = ctx.value  !== void 0;
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
		this._intro = true;

		this._fragment = create_main_fragment$8(this, this._state);

		this.root._oncreate.push(() => {
			oncreate$5.call(this);
			this.fire("update", { changed: assignTrue({}, this._state), current: this._state });
		});

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
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

	/* src\FormCol.html generated by Svelte v2.13.1 */

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
	        settings: {}
	    }
	}
	const file$9 = "src\\FormCol.html";

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
				addLoc(div, file$9, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				if (if_block) if_block.m(div, null);
			},

			p: function update(changed, ctx) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(changed, ctx);
				} else {
					if (if_block) if_block.d(1);
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
		if (ctx.source[ctx.field] !== void 0) {
			formfield_initial_data.value = ctx.source[ctx.field];
			formfield_updating.value = true;
		}
		var formfield = new FormField({
			root: component.root,
			store: component.store,
			data: formfield_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!formfield_updating.value && changed.value) {
					ctx.source[ctx.field] = childState.value;
					newState.source = ctx.source;
				}
				component._set(newState);
				formfield_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
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
					formfield_updating.value = ctx.source[ctx.field] !== void 0;
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
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.source || changed.field) && text_value !== (text_value = ctx.source[ctx.field])) {
					setData(text, text_value);
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
		this._intro = true;

		this._fragment = create_main_fragment$9(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
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

	/* src\FormGrid.html generated by Svelte v2.13.1 */

	function source({ item }) {
	    return item;
	}

	function rows({ columns }) {                
	    const maxRowNum = Math.max.apply(Math, columns.map(o => o.row));
	    const rows = [];
	    for (let i = 0; i <= maxRowNum; i++) {
	        rows.push({ columns: [] });
	    }
	    columns.forEach(col => {
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

	function data$a() {
	    return {
	        class: '',
	        edit: true,
	        item: {},
	        columns: [],
	    }
	}
	const file$a = "src\\FormGrid.html";

	function create_main_fragment$a(component, ctx) {
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
				addLoc(form, file$a, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, form, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(form, null);
				}

				component.refs.form = form;
			},

			p: function update(changed, ctx) {
				if (changed.rows || changed.class || changed.edit || changed.source) {
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
			each_blocks[i] = create_each_block_1$1(component, get_each_context_1$1(ctx, each_value_1, i));
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
				addLoc(div, file$a, 5, 4, 153);
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, text, anchor);
				insert(target, div, anchor);

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

				if (changed.rows || changed.edit || changed.source) {
					each_value_1 = ctx.row.columns;

					for (var i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(changed, child_ctx);
						} else {
							each_blocks[i] = create_each_block_1$1(component, child_ctx);
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
				addLoc(div, file$a, 3, 4, 90);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, text);
			},

			p: function update(changed, ctx) {
				if ((changed.rows) && text_value !== (text_value = ctx.row.subtitle)) {
					setData(text, text_value);
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
	function create_each_block_1$1(component, ctx) {
		var formcol_updating = {};

		var formcol_initial_data = { settings: ctx.col, edit: ctx.edit };
		if (ctx.source  !== void 0) {
			formcol_initial_data.source = ctx.source ;
			formcol_updating.source = true;
		}
		var formcol = new FormCol({
			root: component.root,
			store: component.store,
			data: formcol_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!formcol_updating.source && changed.source) {
					newState.source = childState.source;
				}
				component._set(newState);
				formcol_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
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
				if (changed.edit) formcol_changes.edit = ctx.edit;
				if (!formcol_updating.source && changed.source) {
					formcol_changes.source = ctx.source ;
					formcol_updating.source = ctx.source  !== void 0;
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

	function get_each_context_1$1(ctx, list, i) {
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
		this._state = assign(data$a(), options.data);
		this._recompute({ item: 1, columns: 1 }, this._state);
		if (!('item' in this._state)) console.warn("<FormGrid> was created without expected data property 'item'");
		if (!('columns' in this._state)) console.warn("<FormGrid> was created without expected data property 'columns'");

		if (!('class' in this._state)) console.warn("<FormGrid> was created without expected data property 'class'");

		if (!('edit' in this._state)) console.warn("<FormGrid> was created without expected data property 'edit'");
		this._intro = true;

		this._fragment = create_main_fragment$a(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
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

		if (changed.columns) {
			if (this._differs(state.rows, (state.rows = rows(state)))) changed.rows = true;
		}
	};

	/* src\DataCol.html generated by Svelte v2.13.1 */

	function collect(obj, field) {
	    if (typeof(field) === 'function')
	        return field(obj);
	    else if (typeof(field) === 'string')
	        return obj[field];
	    else
	        return undefined;
	}

	function props$1(all) { 
					return all.settings || all;
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

	function data$b(){
	    return {
	        source: {},
	    }
	}
	function create_main_fragment$b(component, ctx) {
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
				insert(target, if_block_anchor, anchor);
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
			ctx.props
		];

		var switch_value = ctx.fieldtype;

		function switch_props(ctx) {
			var switch_instance_initial_data = {};
			for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_initial_data = assign(switch_instance_initial_data, switch_instance_spread_levels[i]);
			}
			if (ctx.source[ctx.settings.field] !== void 0) {
				switch_instance_initial_data.value = ctx.source[ctx.settings.field];
				switch_instance_updating.value = true;
			}
			return {
				root: component.root,
				store: component.store,
				data: switch_instance_initial_data,
				_bind(changed, childState) {
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

			component.root._beforecreate.push(() => {
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
				if (switch_instance) switch_instance._fragment.c();
				switch_instance_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (switch_instance) {
					switch_instance._mount(target, anchor);
				}

				insert(target, switch_instance_anchor, anchor);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var switch_instance_changes = changed.props ? getSpreadUpdate(switch_instance_spread_levels, [
					ctx.props
				]) : {};
				if (!switch_instance_updating.value && changed.source || changed.settings) {
					switch_instance_changes.value = ctx.source[ctx.settings.field];
					switch_instance_updating.value = ctx.source[ctx.settings.field] !== void 0;
				}

				if (switch_value !== (switch_value = ctx.fieldtype)) {
					if (switch_instance) {
						switch_instance.destroy();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props(ctx));

						component.root._beforecreate.push(() => {
							const changed = {};
							if (ctx.source[ctx.settings.field] === void 0) changed.value = 1;
							switch_instance._bind(changed, switch_instance.get());
						});
						switch_instance._fragment.c();
						switch_instance._mount(switch_instance_anchor.parentNode, switch_instance_anchor);

						switch_instance.on("change", switch_instance_change);
						switch_instance.on("click", switch_instance_click);
					} else {
						switch_instance = null;
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
				insert(target, text, anchor);
			},

			p: function update(changed, ctx) {
				if ((changed.source || changed.settings) && text_value !== (text_value = collect(ctx.source, ctx.settings.field))) {
					setData(text, text_value);
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
		this._state = assign(data$b(), options.data);
		this._recompute({ settings: 1 }, this._state);
		if (!('settings' in this._state)) console.warn("<DataCol> was created without expected data property 'settings'");
		if (!('edit' in this._state)) console.warn("<DataCol> was created without expected data property 'edit'");


		if (!('source' in this._state)) console.warn("<DataCol> was created without expected data property 'source'");
		this._intro = true;

		this._fragment = create_main_fragment$b(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(DataCol.prototype, protoDev);

	DataCol.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('fieldtype' in newState && !this._updatingReadonlyProperty) throw new Error("<DataCol>: Cannot set read-only property 'fieldtype'");
		if ('props' in newState && !this._updatingReadonlyProperty) throw new Error("<DataCol>: Cannot set read-only property 'props'");
	};

	DataCol.prototype._recompute = function _recompute(changed, state) {
		if (changed.settings) {
			if (this._differs(state.fieldtype, (state.fieldtype = fieldtype$1(state)))) changed.fieldtype = true;
		}

		if (this._differs(state.props, (state.props = props$1(exclude(state, "props"))))) changed.props = true;
	};

	/* src\DataGrid.html generated by Svelte v2.13.1 */

	function colCount({ columns }) {
		return (columns) ? columns.length : 0;
	}

	function data$c() {
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

	const file$c = "src\\DataGrid.html";

	function create_main_fragment$c(component, ctx) {
		var div, table, thead, tr, text_2, tbody, table_class_value;

		var each_value = ctx.columns;

		var each_blocks = [];

		for (var i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(component, get_each_context$2(ctx, each_value, i));
		}

		var each_value_1 = ctx.rows;

		var each_1_blocks = [];

		for (var i = 0; i < each_value_1.length; i += 1) {
			each_1_blocks[i] = create_each_block_1$2(component, get_each_1_context(ctx, each_value_1, i));
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
				addLoc(tr, file$c, 3, 12, 156);
				addLoc(thead, file$c, 2, 8, 135);
				addLoc(tbody, file$c, 12, 8, 417);
				setAttribute(table, "ref", "table");
				table.className = table_class_value = "table table-striped table-sm " + (ctx.edit ? 'table-bordered' : '');
				addLoc(table, file$c, 1, 4, 38);
				setStyle(div, "position", "relative");
				addLoc(div, file$c, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, table);
				append(table, thead);
				append(thead, tr);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(tr, null);
				}

				append(table, text_2);
				append(table, tbody);

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
							each_1_blocks[i] = create_each_block_1$2(component, child_ctx);
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
				addLoc(th, file$c, 5, 16, 224);
			},

			m: function mount(target, anchor) {
				insert(target, th, anchor);
				append(th, text);
			},

			p: function update(changed, ctx) {
				if ((changed.columns) && text_value !== (text_value = ctx.column.label)) {
					setData(text, text_value);
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
	function create_each_block_1$2(component, ctx) {
		var tr;

		var each_value_2 = ctx.columns;

		var each_blocks = [];

		for (var i = 0; i < each_value_2.length; i += 1) {
			each_blocks[i] = create_each_block_2(component, get_each_context_1$2(ctx, each_value_2, i));
		}

		return {
			c: function create() {
				tr = createElement("tr");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}
				addLoc(tr, file$c, 14, 12, 467);
			},

			m: function mount(target, anchor) {
				insert(target, tr, anchor);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(tr, null);
				}
			},

			p: function update(changed, ctx) {
				if (changed.edit || changed.columns || changed.rows) {
					each_value_2 = ctx.columns;

					for (var i = 0; i < each_value_2.length; i += 1) {
						const child_ctx = get_each_context_1$2(ctx, each_value_2, i);

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
		if (ctx.row !== void 0) {
			datacol_initial_data.source = ctx.row;
			datacol_updating.source = true;
		}
		var datacol = new DataCol({
			root: component.root,
			store: component.store,
			data: datacol_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!datacol_updating.source && changed.source) {
					ctx.each_value_1[ctx.row_index] = childState.source = childState.source;

					newState.rows = ctx.rows;
				}
				component._set(newState);
				datacol_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
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
				addLoc(td, file$c, 16, 20, 536);
			},

			m: function mount(target, anchor) {
				insert(target, td, anchor);
				datacol._mount(td, null);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var datacol_changes = {};
				if (changed.columns) datacol_changes.settings = ctx.column;
				if (changed.edit) datacol_changes.edit = ctx.edit;
				if (!datacol_updating.source && changed.rows) {
					datacol_changes.source = ctx.row;
					datacol_updating.source = ctx.row !== void 0;
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

	function get_each_context_1$2(ctx, list, i) {
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
		this._state = assign(data$c(), options.data);
		this._recompute({ columns: 1 }, this._state);
		if (!('columns' in this._state)) console.warn("<DataGrid> was created without expected data property 'columns'");
		if (!('edit' in this._state)) console.warn("<DataGrid> was created without expected data property 'edit'");
		if (!('rows' in this._state)) console.warn("<DataGrid> was created without expected data property 'rows'");
		this._intro = true;

		this._fragment = create_main_fragment$c(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
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

	function mergeState(data, fieldtype) {
		return Object.assign({}, data, { settings: data }, { fieldtype });
	}

	const TextField = class extends Field {
	    constructor(options) {
			options.data = mergeState(options.data, TextInput);
			super(options);
		}    
	};

	/* src\App.html generated by Svelte v2.13.1 */

	const stateList = [
	   {id: 'AL',name: 'ALABAMA'},
	   {id: 'MA',name: 'MASSACHUSETTS'},
	   {id: 'MO',name: 'MISSOURI'},
	   {id: 'RI',name: 'RHODE ISLAND'}
	];

	const data$d = [
	        {
	            "id": 1,
	            "fname": "Gale",
	            "lname": "Mcmyne",
	            "age": 16,
	            "state": "RI",
	            "rate": 10,
	            "zipCode": "12345",
	            "phone": "123-456-7890",
	        }, {
	            "id": 2,
	            "fname": "Tighe",
	            "lname": "Walls",
	            "age": 43,
	            "state": "AL",
	            "rate": 11,
	            "zipCode": "23456",
	            "phone": "123-456-7890",
	        }, {
	            "id": 3,
	            "fname": "Anuj",
	            "lname": "Wittcop",
	            "age": 16,
	            "state": "MO",
	            "rate": 12,
	            "zipCode": "34567",
	            "phone": "332-456-7890",
	        }, {
	            "id": 4,
	            "fname": "Elisha",
	            "lname": "Mahan",
	            "age": 28,
	            "state": "MA",
	            "rate": 13,
	            "zipCode": "45678",
	            "phone": "322-456-7890",
	        }
	    ];

	function validateForm(form) {
	    // check validity of all inputs
	    const isValid = form.checkValidity();
	    if (!isValid) {
	        for (let i = 0; i < form.length; i++) {
	            const input = form[i];
	            if (input.checkValidity) {
	                if (!input.checkValidity()) {
	                    console.log(input.validationMessage);                        
	                }
	                if (input.setError) {
	                    input.setError(input.validationMessage);
	                }
	            }
	        }
	    }
	    return isValid;
	}

	function item({ index, rows }) {
	    console.log('app - computed - data[index]', index, rows[index]);
	    return rows[index];
	}

	function data_1() {
	    return {
	        index: 0,
	        rows: data$d,
	        show: true,
	        text: '12345',
	        fielddata: [
	            {
	                label: 'Field', 
	                field: 'field',
	                component: 'text',
	                readOnly: true,
	            }, {
	                label: 'Label', 
	                field: 'label',
	                component: 'text',
	            }, {
	                label: 'Read Only', 
	                field: 'readOnly',
	                component: 'checkbox',    
	            }, {
	                label: 'Row', 
	                field: 'row',
	                component: 'number',
	            }, {
	                label: 'Edit', 
	                field: 'field',
	                component: 'action',
	                'class': 'secondary',
	                action: (row) => {
	                    alert('DataGrid - row action ' + row.id);
	                    console.log('DataGrid - action', row);
	                }
	            },
	        ],
	        columndata: [
	            {
	                subtitle: 'Customer',
	                label: 'ID', 
	                field: 'id',
	                component: 'text',
	                readOnly: true,
	                row: 0,
	                col: 'md-3'
	            }, {
	                label: 'First Name',
	                field: 'fname',
	                component: 'text',
	                required: true,
	                row: 1,
	                col: 'md-3'
	            }, {
	                label: 'Last Name',
	                field: 'lname',
	                component: 'text',
	                row: 1,
	                col: 'md-3'
	            }, {
	                label: 'Age',
	                field: 'age',
	                component: 'number',
	                row: 2,
	                col: 'md-3'
	            }, {
	                label: 'Rate',
	                field: 'rate',
	                component: 'currency',
	                row: 2,
	                col: 'md-3'
	            }, {
	                label: 'State',
	                field: 'state',
	                optionList: stateList,
	                component: 'select',
	                row: 2,
	                col: 'md-3'    
	            }, {
	                label: 'Zip',
	                field: 'zipCode',
	                component: 'masked',
	                pattern: '^(\\d{5})', 
	                placeholder: 'XXXXX',
	                maxlength: 5,
	                row: 3,
	                col: 'md-3'    
	            }, {
	                label: 'Phone',
	                field: 'phone',
	                component: 'masked',
	                pattern: '\\d{3}\-\\d{3}\-\\d{4}', 
	                placeholder: 'XXX-XXX-XXXX',
	                maxlength: 20,
	                row: 3,
	                col: 'md-3'    
	            }
	        ]                
	    }
	}
	var methods$3 = {
	    next() {
	        const { index, rows } = this.get();
	        if (index < rows.length - 1) {
	            this.set({ index: index + 1 });
	        }
	    },
	    previous() {
	        const { index } = this.get();
	        if (index > 0) {
	            this.set({ index: index - 1 });
	        }                
	    },
	    save() {
	        const { item } = this.get();
	        const form = this.refs.form.refs.form;
	        console.log('save');
	        if (!validateForm(form)) {
	            console.log("Form is not valid", item);
	            return;
	        }
	        console.log("Form save successfull", item);
	    }
	};

	const file$d = "src\\App.html";

	function create_main_fragment$d(component, ctx) {
		var div, textfield_updating = {}, text, datagrid_updating = {}, text_1, text_2, button, text_3, text_4, button_1, text_5, text_6, button_2, text_7;

		var textfield_initial_data = {
		 	label: "Indivisual TextField",
		 	placeholder: "Text"
		 };
		if (ctx.text !== void 0) {
			textfield_initial_data.value = ctx.text;
			textfield_updating.value = true;
		}
		var textfield = new TextField({
			root: component.root,
			store: component.store,
			data: textfield_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!textfield_updating.value && changed.value) {
					newState.text = childState.value;
				}
				component._set(newState);
				textfield_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			textfield._bind({ value: 1 }, textfield.get());
		});

		var datagrid_initial_data = {};
		if (ctx.columndata !== void 0) {
			datagrid_initial_data.rows = ctx.columndata;
			datagrid_updating.rows = true;
		}
		if (ctx.fielddata !== void 0) {
			datagrid_initial_data.columns = ctx.fielddata;
			datagrid_updating.columns = true;
		}
		var datagrid = new DataGrid({
			root: component.root,
			store: component.store,
			data: datagrid_initial_data,
			_bind(changed, childState) {
				var newState = {};
				if (!datagrid_updating.rows && changed.rows) {
					newState.columndata = childState.rows;
				}

				if (!datagrid_updating.columns && changed.columns) {
					newState.fielddata = childState.columns;
				}
				component._set(newState);
				datagrid_updating = {};
			}
		});

		component.root._beforecreate.push(() => {
			datagrid._bind({ rows: 1, columns: 1 }, datagrid.get());
		});

		datagrid.on("update", function(event) {
			component.fire("update", event);
		});

		var formgrid_initial_data = { columns: ctx.columndata, item: ctx.item };
		var formgrid = new FormGrid({
			root: component.root,
			store: component.store,
			data: formgrid_initial_data
		});

		component.refs.form = formgrid;

		function click_handler(event) {
			component.previous();
		}

		function click_handler_1(event) {
			component.next();
		}

		function click_handler_2(event) {
			component.save();
		}

		return {
			c: function create() {
				div = createElement("div");
				textfield._fragment.c();
				text = createText("\r\n    ");
				datagrid._fragment.c();
				text_1 = createText("        \r\n    ");
				formgrid._fragment.c();
				text_2 = createText("\r\n    ");
				button = createElement("button");
				text_3 = createText("Previous");
				text_4 = createText("\r\n    ");
				button_1 = createElement("button");
				text_5 = createText("Next");
				text_6 = createText("\r\n    ");
				button_2 = createElement("button");
				text_7 = createText("Save");
				addListener(button, "click", click_handler);
				setAttribute(button, "color", "primary");
				addLoc(button, file$d, 4, 4, 259);
				addListener(button_1, "click", click_handler_1);
				setAttribute(button_1, "color", "primary");
				addLoc(button_1, file$d, 5, 4, 328);
				addListener(button_2, "click", click_handler_2);
				setAttribute(button_2, "color", "primary");
				addLoc(button_2, file$d, 6, 4, 389);
				div.className = "container-fluid";
				addLoc(div, file$d, 0, 0, 0);
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				textfield._mount(div, null);
				append(div, text);
				datagrid._mount(div, null);
				append(div, text_1);
				formgrid._mount(div, null);
				append(div, text_2);
				append(div, button);
				append(button, text_3);
				append(div, text_4);
				append(div, button_1);
				append(button_1, text_5);
				append(div, text_6);
				append(div, button_2);
				append(button_2, text_7);
			},

			p: function update(changed, _ctx) {
				ctx = _ctx;
				var textfield_changes = {};
				if (!textfield_updating.value && changed.text) {
					textfield_changes.value = ctx.text;
					textfield_updating.value = ctx.text !== void 0;
				}
				textfield._set(textfield_changes);
				textfield_updating = {};

				var datagrid_changes = {};
				if (!datagrid_updating.rows && changed.columndata) {
					datagrid_changes.rows = ctx.columndata;
					datagrid_updating.rows = ctx.columndata !== void 0;
				}
				if (!datagrid_updating.columns && changed.fielddata) {
					datagrid_changes.columns = ctx.fielddata;
					datagrid_updating.columns = ctx.fielddata !== void 0;
				}
				datagrid._set(datagrid_changes);
				datagrid_updating = {};

				var formgrid_changes = {};
				if (changed.columndata) formgrid_changes.columns = ctx.columndata;
				if (changed.item) formgrid_changes.item = ctx.item;
				formgrid._set(formgrid_changes);
			},

			d: function destroy$$1(detach) {
				if (detach) {
					detachNode(div);
				}

				textfield.destroy();
				datagrid.destroy();
				formgrid.destroy();
				if (component.refs.form === formgrid) component.refs.form = null;
				removeListener(button, "click", click_handler);
				removeListener(button_1, "click", click_handler_1);
				removeListener(button_2, "click", click_handler_2);
			}
		};
	}

	function App(options) {
		this._debugName = '<App>';
		if (!options || (!options.target && !options.root)) throw new Error("'target' is a required option");
		init(this, options);
		this.refs = {};
		this._state = assign(data_1(), options.data);
		this._recompute({ index: 1, rows: 1 }, this._state);
		if (!('index' in this._state)) console.warn("<App> was created without expected data property 'index'");
		if (!('rows' in this._state)) console.warn("<App> was created without expected data property 'rows'");
		if (!('text' in this._state)) console.warn("<App> was created without expected data property 'text'");
		if (!('columndata' in this._state)) console.warn("<App> was created without expected data property 'columndata'");
		if (!('fielddata' in this._state)) console.warn("<App> was created without expected data property 'fielddata'");
		this._intro = true;

		this._fragment = create_main_fragment$d(this, this._state);

		if (options.target) {
			if (options.hydrate) throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			this._fragment.c();
			this._mount(options.target, options.anchor);

			flush(this);
		}
	}

	assign(App.prototype, protoDev);
	assign(App.prototype, methods$3);

	App.prototype._checkReadOnly = function _checkReadOnly(newState) {
		if ('item' in newState && !this._updatingReadonlyProperty) throw new Error("<App>: Cannot set read-only property 'item'");
	};

	App.prototype._recompute = function _recompute(changed, state) {
		if (changed.index || changed.rows) {
			if (this._differs(state.item, (state.item = item(state)))) changed.item = true;
		}
	};

	var app = new App({
		target: document.body,
		data: {}
	});

	return app;

}());
//# sourceMappingURL=bundle.js.map
