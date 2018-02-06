import { makeUniqueId, mergeProps } from './utils';

export default {
    data() {
        return { 
            type: 'text',
            uuid: makeUniqueId(),
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
    oncreate(p) {
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

        mergeProps(p, 'settings');
    },
    validate(input) {
        if (input.checkValidity) {
            input.setError(input.validationMessage);
        }
    }
}