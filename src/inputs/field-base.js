import { makeUniqueId, mergeProps } from '../utils';

export default {
    data() {
        return { 
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
        }
    },
    oncreate(p) {
        const { uniqueId } = p.get();
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
        } else {
            mergeProps(p, 'settings');
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
}