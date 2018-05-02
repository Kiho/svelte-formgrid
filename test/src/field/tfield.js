import * as svelte from 'svelte';
import TextField from '../../../src/TextField.html';
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

// test TextField
test('with no data, creates <TextField /> elements', t => {
	const textField = new TextField({
		target,
		data: {
			value: 'value',
			label: 'text'
		}
    });

    t.htmlEqualIgnoreId(target.innerHTML, `
        <div class="form-group row">
            <label class="col-4 col-form-label" for="38e615fc-0c98-4789-867a-74144f0dc309">text</label>
            <div class="col-8">
                <div class="form-group">
                    <input type="text" class="form-control " placeholder="" id="38e615fc-0c98-4789-867a-74144f0dc309">
                </div>
            </div>
        </div>
	`);
	textField.set({ value: 'three' });

	const input = target.querySelector('input');	
	t.equal(input.value, 'three');
	textField.destroy();
});

// this allows us to close puppeteer once tests have completed
window.done = done;