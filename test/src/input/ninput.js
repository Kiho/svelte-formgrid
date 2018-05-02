import * as svelte from 'svelte';
import NumberInput from '../../../src/inputs/NumberInput.html';
import { assert, test, done } from 'tape-modern';

// setup
const target = document.querySelector('main');

function normalize(html, ignoreId) {
	const div = document.createElement('div');
	let newHtml = html
		.replace(/<!--.+?-->/g, '')
		.replace(/svelte-ref-\w+=""/g, '')
		.replace(/\s*svelte-\w+\s*/g, '')
		.replace(/class=""/g, '')
		.replace(/>\s+/g, '>')
		.replace(/\s+</g, '<')
		.replace(/<!--[^>]*-->/g,'');
	if (ignoreId) {
		newHtml = newHtml
			.replace(/id="[a-zA-Z0-9:;\.\s\(\)\-\,]*"/gi,'')
			.replace(/for="[a-zA-Z0-9:;\.\s\(\)\-\,]*"/gi,'')
	}
	div.innerHTML = newHtml;
	div.normalize();
	return div.innerHTML;
}

assert.htmlEqual = (a, b, msg) => {
	assert.equal(normalize(a), normalize(b));
};

assert.htmlEqualIgnoreId = (a, b, msg) => {
	assert.equal(normalize(a, true), normalize(b, true));
};

// test TextInput
// test('with no data, creates <input type="text" /> elements', t2 => {
// 	const textInput = new TextInput({
// 		target,
// 		data: { value: 'value' }
// 	});

// 	t2.htmlEqual(target.innerHTML, `
// 		<input type="text" class="form-control " placeholder="">
// 	`);	
// 	const input = target.firstElementChild;
// 	t2.equal(input.value, 'value');

// 	textInput.destroy();
// });

// test('change value in <input type="text" /> elements', t2 => {
// 	const textInput = new TextInput({
// 		target,
// 		data: { value: 'value' }
// 	});

// 	textInput.set({ value: 'text', placeholder: 'placeholder' });
// 	t2.htmlEqual(target.innerHTML, `
// 		<input type="text" class="form-control " placeholder="placeholder">
// 	`);
// 	const input = target.firstElementChild;
// 	t2.equal(input.value, 'text');

// 	textInput.destroy();
// });

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