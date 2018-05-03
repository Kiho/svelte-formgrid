import * as svelte from 'svelte';
import CurrencyInput from '../../../src/inputs/CurrencyInput.html';
import { test, done } from 'tape-modern';
import assert from '../../utils/assert';

// setup
const target = document.querySelector('main');

// test CurrencyInput
test('with no data, creates <input type="text" /> elements', t => {
	const currencyInput = new CurrencyInput({
		target,
		data: { }
	});

	// t.htmlEqual(target.innerHTML, `
	// 	<input type="text" class="form-control " placeholder="" pattern="^(?!(.*[^)]$|[^(].*)$)(?$?(0|[1-9]d{0,2}(,?d{3})?)(.dd?)?)?$">
	// `);	

	const input = target.firstElementChild;
	t.equal(input.value, '$0.00');

	currencyInput.set({ value: '500' });
	t.equal(input.value, '$500.00');

	currencyInput.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;