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
            submit: false,
            error: '',
        }
    },
    oncreate(p, field) {
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
        if (field) {
            element.setAttribute('id', makeUniqueId());
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