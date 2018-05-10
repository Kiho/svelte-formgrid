import { rulesRunner } from '../ruleHandlers/validationUtils';
import TextInputBase from './TextInput.html';

export { default as MaskedInput } from './MaskedInput.html';
export { default as CurrencyInput } from './CurrencyInput.html';
export { default as SelectInput } from './SelectInput.html';
export { default as NumberInput } from './NumberInput.html';
export { default as CheckboxInput } from './CheckboxInput.html';
export { default as ActionButton } from './ActionButton.html';

export const TextInput = class extends TextInputBase {
    constructor(options) {        
        super(options);
        options.oncreate = this.oncreate;
    }

    oncreate() {
        // console.log('TextInput - oncreate()', this);
    }
    
    validate() {
        const { schema, element, field } = this.get();
        const fieldValue = element.value;
        const fieldSchema = { [field]: schema };
        const result = rulesRunner(fieldValue, fieldSchema); //
        console.log('TextInput - validate()', this, schema);
        return result.errorText;
    }
}