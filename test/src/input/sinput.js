import * as svelte from 'svelte';
import SelectInput from '../../../src/inputs/SelectInput.html';
import { test, done } from 'tape-modern';
import assert from '../../utils/assert';


// setup
const target = document.querySelector('main');

const stateList = [
	{id: 'AL',name: 'ALABAMA'},
	{id: 'MA',name: 'MASSACHUSETTS'},
	{id: 'MO',name: 'MISSOURI'},
	{id: 'RI',name: 'RHODE ISLAND'}
];

const states = stateList.map(x => x.name);

// test SelectInput
test('Creates <SelectInput /> elements with string options', t => {
	const selectInput = new SelectInput({
		target,
		data: {
			value: 'value',
			optionList: states
		}
	});

	t.htmlEqual(target.innerHTML, `
		<select class="form-control ">
			<option value="ALABAMA">ALABAMA</option>
			<option value="MASSACHUSETTS">MASSACHUSETTS</option>
			<option value="MISSOURI">MISSOURI</option>
			<option value="RHODE ISLAND">RHODE ISLAND</option>
		</select>
	`, true);

	let sel = target.querySelector('option');
	let sel1 = sel.nextElementSibling;
	let sel2 = sel1.nextElementSibling;
	let sel3 = sel2.nextElementSibling;
	// let sel4 = sel3.nextElementSibling;
	t.equal(sel.value, 'ALABAMA');
	t.equal(sel1.value, 'MASSACHUSETTS');
	t.equal(sel2.value, 'MISSOURI');
	t.equal(sel3.value, 'RHODE ISLAND');
	// t.equal(sel4.value, null);

	selectInput.destroy();
});

test('Creates <SelectInput /> elements with object options', t => {
	const selectInput = new SelectInput({
		target,
		data: {
			value: 'value',
			optionList: stateList
		}
	});

	t.htmlEqual(target.innerHTML, `
		<select class="form-control ">
			<option value="AL">ALABAMA</option>
			<option value="MA">MASSACHUSETTS</option>
			<option value="MO">MISSOURI</option>
			<option value="RI">RHODE ISLAND</option>
		</select>
	`, true);

	let sel = target.querySelector('option');
	let sel1 = sel.nextElementSibling;
	let sel2 = sel1.nextElementSibling;
	let sel3 = sel2.nextElementSibling;
	// let sel4 = sel3.nextElementSibling;
	t.equal(sel.value, 'AL');
	t.equal(sel1.value, 'MA');
	t.equal(sel2.value, 'MO');
	t.equal(sel3.value, 'RI');
	// t.equal(sel4.value, null);

	selectInput.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;