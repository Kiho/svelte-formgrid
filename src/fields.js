import Field from './Field.html';
import { TextInput, NumberInput, MaskedInput, CurrencyInput, SelectInput } from './inputs';

function mergeState(data, fieldtype) {
	return Object.assign({}, data, { settings: data, withSettings: true }, { fieldtype });
}

export const TextField = class extends Field {
    constructor(options) {
		options.data = mergeState(options.data, TextInput);
		super(options);
	}    
}

export const NumberField = class extends Field {
    constructor(options) {
		options.data = mergeState(options.data, NumberInput);
		super(options);
	}    
}

export const MaskedField = class extends Field {
    constructor(options) {
		options.data = mergeState(options.data, MaskedInput);
		super(options);
	}    
}

export const CurrencyField = class extends Field {
    constructor(options) {
		options.data = mergeState(options.data, CurrencyInput);
		super(options);
	}    
}

export const SelectField = class extends Field {
	constructor(options) {
		options.data = mergeState(options.data, SelectInput);
		super(options);
	}    
}