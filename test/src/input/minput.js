import * as svelte from 'svelte';
import MaskedInput from '../../../src/inputs/MaskedInput.html';
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