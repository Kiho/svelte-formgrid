import * as svelte from 'svelte';
import { TextField, NumberField, MaskedField, SelectField } from '../../../src/fields';
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

// test Text
test('creates <Text /> elements', t => {
	const textField = new TextField({
		target,
		data: {
			value: 'one',
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

	const input = target.querySelector('input');	
	t.equal(input.value, 'one');

	textField.set({ value: 'three' });

	t.equal(input.value, 'three');

	textField.destroy();
});

// test NumberField
test('creates <NumberField /> elements', t => {
	const numberField = new NumberField({
		target,
		data: {
			value: '1',
			label: 'number'
		}
    });

    t.htmlEqualIgnoreId(target.innerHTML, `
        <div class="form-group row">
            <label class="col-4 col-form-label" for="38e615fc-0c98-4789-867a-74144f0dc309">number</label>
            <div class="col-8">
                <div class="form-group">
                    <input type="number" class="form-control " placeholder="" id="38e615fc-0c98-4789-867a-74144f0dc309">
                </div>
            </div>
        </div>
	`);

	const input = target.querySelector('input');
	t.equal(input.value, '1');

	numberField.set({ value: '3' });

	t.equal(input.value, '3');
	numberField.destroy();
});

// test MaskedField
test('creates <MaskedField /> elements', t => {
	const maskedField = new MaskedField({
		target,
		data: {
			value: '1',
			label: 'masked'
		}
    });

    t.htmlEqualIgnoreId(target.innerHTML, `
        <div class="form-group row">
            <label class="col-4 col-form-label" for="38e615fc-0c98-4789-867a-74144f0dc309">masked</label>
            <div class="col-8">
                <div class="form-group">
                    <input type="text" class="form-control masked " pattern="" placeholder="" id="38e615fc-0c98-4789-867a-74144f0dc309">
                </div>
            </div>
        </div>
    `);
    
	const input = target.querySelector('input');
	t.equal(maskedField.get().value, '1');
	// TODO - this fails with masked field, need to check value & text
	// t.equal(input.value, '1');

	maskedField.set({ value: '3' });
	   	
    t.equal(input.value, '3');
    
	maskedField.destroy();
});

// test Select
test('creates <SelectField /> elements', t => {
	const selectField = new SelectField({
		target,
		data: {
			label: 'select',
			value: '',
			optionList: stateList
		}
    });

    t.htmlEqualIgnoreId(target.innerHTML, `
		<div class="form-group row">
			<label class="col-4 col-form-label" for="166def6d-1423-49ca-9850-a543418b8876">select</label>
			<div class="col-8">
				<div class="form-group">
					<select class="form-control "id="166def6d-1423-49ca-9850-a543418b8876">
						<option value="AL">ALABAMA</option><option value="MA">MASSACHUSETTS</option><option value="MO">MISSOURI</option><option value="RI">RHODE ISLAND</option>
					</select>
				</div>
			</div>
		</div>
	`);

	let sel = target.querySelector('option');
	let sel1 = sel.nextElementSibling;
	let sel2 = sel1.nextElementSibling;
	let sel3 = sel2.nextElementSibling;
	
	t.equal(sel.value, 'AL');
	t.equal(sel1.value, 'MA');
	t.equal(sel2.value, 'MO');
	t.equal(sel3.value, 'RI');

	selectField.destroy();
});

window.done = done;