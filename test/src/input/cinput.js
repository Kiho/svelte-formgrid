import * as svelte from 'svelte';
import CurrencyInput from '../../../src/inputs/CurrencyInput.html';
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
			.replace(/pattern="[a-zA-Z0-9:;\.\s\(\)\-\,]*"/gi,'')
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