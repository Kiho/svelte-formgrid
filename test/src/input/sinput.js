import * as svelte from 'svelte';
import SelectInput from '../../../src/inputs/SelectInput.html';
import { test, done } from 'tape-modern';
import assert from '../../utils/assert';

// setup
const target = document.querySelector('main');

// test SelectInput
test('with no data, creates <SelectInput /> elements', t => {
	const selectInput = new SelectInput({
		target,
		data: {
			value: 'value'
		}
	});
	t.htmlEqual(target.innerHTML, `
		<select class="form-control "></select>
	`);

	selectInput.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;