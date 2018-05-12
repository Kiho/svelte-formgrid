import { rulesRunner } from '../validations/validationUtils';

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

export default {
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