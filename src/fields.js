import Field from './Field.html';

import fieldBase from './inputs/field-base';
import { TextInput, NumberInput, MaskedInput, CurrencyInput, SelectInput } from './inputs';

function mergeState(base, data) {
	return Object.assign({}, base, { settings: base }, { fieldtype: TextInput}, data);
}

export const TextField = class extends Field {
  constructor(options) {
		options.data = mergeState(options.data,  { fieldtype: TextInput });
		super(options);
	}    
}

export const NumberField = class extends Field {
  constructor(options) {
		options.data = mergeState(options.data,  { fieldtype: NumberInput, type: 'number' });
		super(options);
	}    
}

export const MaskedField = class extends Field {
  constructor(options) {
		options.data = mergeState(options.data,  { fieldtype: MaskedInput });
		super(options);
	}    
}

export const CurrencyField = class extends Field {
  constructor(options) {
		options.data = mergeState(options.data,  { fieldtype: CurrencyInput });
		super(options);
	}    
}

export const SelectField = class extends Field {
	constructor(options) {
		options.data = mergeState(options.data,  { fieldtype: SelectInput });
		super(options);
	}    
}