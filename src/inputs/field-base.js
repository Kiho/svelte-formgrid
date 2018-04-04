import { makeUniqueId } from '../utils';

const intialData = { 
    type: 'text',
    uuid: '',
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
    fieldData() {
        return Object.assign({}, {settings: null}, intialData);
    },
    oncreate(p) {
        const { uniqueId, settings } = p.get();
        const element = p.refs.input;
        element.onkeyup = (e) => {
            if (p.get('submit')) {
                const error = element.checkValidity() ? '' : element.validationMessage;
                p.set({error});
            }
        };
        element.setError = (error) => {
            p.set({error, submit: true});
        };
        if (uniqueId) {
            element.setAttribute('id', makeUniqueId());
        } 
        if (settings) {
            this.mergeProps(p, settings);
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
}