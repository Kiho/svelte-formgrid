import { rulesRunner } from '../validations/validationUtils';
import TextInputBase from './TextInput.html';

export { default as MaskedInput } from './MaskedInput.html';
export { default as CurrencyInput } from './CurrencyInput.html';
export { default as SelectInput } from './SelectInput.html';
export { default as NumberInput } from './NumberInput.html';
export { default as CheckboxInput } from './CheckboxInput.html';
export { default as ActionButton } from './ActionButton.html';

function preValidate() {
    const { formSchema, element, field } = this.get();
    const fieldValue = element.value;
    const fieldSchema = formSchema[field];
    let result = { errorText: '' };
    if (fieldSchema){
        result = rulesRunner(fieldValue, formSchema);   
    } 
    // console.log('TextInput - preValidate()', this, schema);
    element.setCustomValidity(result.errorText);
}

export const TextInput = class extends TextInputBase {
    constructor(options) {      
        super(options);
        options.oncreate = this.oncreate;
    }

    oncreate(p) {
        const { element } = p.get();
        element.preValidate = preValidate.bind(p);
    }
}