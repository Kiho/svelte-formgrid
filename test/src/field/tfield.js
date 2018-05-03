import * as svelte from 'svelte';
import TextField from '../../../src/TextField.html';
import { test, done } from 'tape-modern';
import assert from '../../utils/assert';

// setup
const target = document.querySelector('main');

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