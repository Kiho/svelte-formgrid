import * as svelte from 'svelte';
import MaskedInput from '../../../src/inputs/MaskedInput.html';
import { test, done } from 'tape-modern';
import assert from '../../utils/assert';

// setup
const target = document.querySelector('main');

// test MaskedInput
test('with no data, creates <TextInput /> elements', t => {
	const maskedInput = new MaskedInput({
		target,
		data: {
			value: '7147020839',
			pattern : '\d{3}-\d{3}-\d{4}',
			placeholder: 'XXX-XXX-XXXX'
		}
	});

	t.htmlEqual(target.innerHTML, `
		<input type="text" class="form-control masked " pattern="\d{3}-\d{3}-\d{4}" placeholder="XXX-XXX-XXXX">
	`);

	maskedInput.destroy();
});

// test MaskedInput
test('detect invalid input with pattern', t => {
	const maskedInput = new MaskedInput({
		target,
		data: {
			value: '12345',
            label: 'masked',
            pattern: '^(\\d{5})', 
			placeholder: 'XXXXX',
		}
    });

    let input = target.querySelector('input');
    	
    t.equal(input.value, '12345');
    t.equal(input.checkValidity(), true);

    maskedInput.set({ value: '123456' });

    t.equal(input.checkValidity(), false);

	maskedInput.destroy();
});

test('shourd not acccept input if not match with pattern', t => {
	const maskedInput = new MaskedInput({
		target,
		data: {
			value: '12345',
            label: 'masked',
            pattern: '^(\\d{5})', 
			placeholder: 'XXXXX',
		}
    });

    const input = target.querySelector('input');
    	
    t.equal(input.value, '12345');

	input.value = '234567'; 
	input.dispatchEvent(new Event('input'));

    t.equal(input.value, '23456');

	maskedInput.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;