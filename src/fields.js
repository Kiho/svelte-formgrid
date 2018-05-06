import Field from './Field.html';

import fieldBase from './inputs/field-base';
import { TextInput, NumberInput, MaskedInput, CurrencyInput, SelectInput } from './inputs';

function mergeComponentState(base, data) {
	return Object.assign({}, base, { settings: base }, { fieldtype: TextInput}, data);
}

export const TextField = class extends Field {    
    constructor(options) {
		options.data = mergeComponentState(options.data,  { fieldtype: TextInput });
		// console.log('Text constructor(options) ', options);	
		super(options);
		// console.log('Text = class extends Field', this._state);
	}    
}

export const NumberField = class extends Field {    
    constructor(options) {
		options.data = mergeComponentState(options.data,  { fieldtype: NumberInput, type: 'number' });
		super(options);
	}    
}

export const MaskedField = class extends Field {    
    constructor(options) {
		options.data = mergeComponentState(options.data,  { fieldtype: MaskedInput });
		super(options);
	}    
}

export const CurrencyField = class extends Field {    
    constructor(options) {
		options.data = mergeComponentState(options.data,  { fieldtype: CurrencyInput });
		super(options);
	}    
}

export const SelectField = class extends Field {    
		constructor(options) {
		options.data = mergeComponentState(options.data,  { fieldtype: SelectInput });
		super(options);
	}    
}