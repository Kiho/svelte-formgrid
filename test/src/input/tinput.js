import * as svelte from 'svelte';
import TextInput from '../../../src/inputs/TextInput.html';
import { test, done } from 'tape-modern';
import assert from '../../utils/assert';

// setup
const target = document.querySelector('main');

// test TextInput
test('with no data, creates <input type="text" /> elements', t => {
	const textInput = new TextInput({
		target,
		data: { value: 'value' }
	});

	t.htmlEqual(target.innerHTML, `
		<input type="text" class="form-control " placeholder="">
	`);	
	const input = target.firstElementChild;
	t.equal(input.value, 'value');

	textInput.destroy();
});

test('change value in <input type="text" /> elements', t => {
	const textInput = new TextInput({
		target,
		data: { value: 'value' }
	});

	textInput.set({ value: 'text', placeholder: 'placeholder' });
	t.htmlEqual(target.innerHTML, `
		<input type="text" class="form-control " placeholder="placeholder">
	`);
	const input = target.firstElementChild;
	t.equal(input.value, 'text');

	textInput.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;