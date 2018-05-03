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

	const input = target.firstElementChild;
	// t.equal(input.value,'10');
	maskedInput.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;