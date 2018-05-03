import * as svelte from 'svelte';
import NumberInput from '../../../src/inputs/NumberInput.html';
import { test, done } from 'tape-modern';
import assert from '../../utils/assert';

// setup
const target = document.querySelector('main');

// test NumberInput
test('with no data, creates <input type="number" /> elements', t => {
	const numberInput = new NumberInput({
		target,
		data: { value: '1' }
	});

	t.htmlEqual(target.innerHTML, `
		<input type="number" class="form-control " placeholder="">
	`);

	const input = target.firstElementChild;
	t.equal(input.value, '1');

	numberInput.destroy();
});

test('change value', t => {
	const numberInput = new NumberInput({
		target,
		data: { value: '1' }
	});

	const input = target.firstElementChild;

	// string value should be null
	numberInput.set({ value: 'three' });
	t.equal(input.value, '');

	numberInput.set({ value: '2' });
	t.equal(input.value, '2');
	
	numberInput.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;