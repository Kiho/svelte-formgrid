import * as svelte from 'svelte';
import MaskedInput from '../../src/inputs/MaskedInput.html';
import NumberInput from '../../src/inputs/NumberInput.html';
import SelectInput from '../../src/inputs/SelectInput.html';
import TextField from '../../src/TextField.html';
import TextInput from '../../src/inputs/TextInput.html';
import { assert, test, done } from 'tape-modern';

// setup
const target = document.querySelector('main');
console.log('target', target);
function normalize(html) {
	const div = document.createElement('div');
	div.innerHTML = html
		.replace(/<!--.+?-->/g, '')
		.replace(/svelte-ref-\w+=""/g, '')
		.replace(/\s*svelte-\w+\s*/g, '')
		.replace(/class=""/g, '')
		.replace(/>\s+/g, '>')
		.replace(/\s+</g, '<')
		.replace(/id="[a-zA-Z0-9:;\.\s\(\)\-\,]*"/gi,'')
		.replace(/for="[a-zA-Z0-9:;\.\s\(\)\-\,]*"/gi,'')
		.replace(/<!--[^>]*-->/g,'');

	div.normalize();
	return div.innerHTML;
}

assert.htmlEqual = (a, b, msg) => {
	assert.equal(normalize(a), normalize(b));
};

// test TextField
test('with no data, creates <TextField /> elements', t1 => {
	const textField = new TextField({
		target,
		data: {
			value: 'value',
			label: 'text'
		}
    });

    t1.equal(1, 1);
    t1.htmlEqual(target.innerHTML, `
        <div class="form-group row">
            <label class="col-4 col-form-label" for="38e615fc-0c98-4789-867a-74144f0dc309">text</label>
            <div class="col-8">
                <div class="form-group">
                    <input type="text" class="form-control " placeholder="" id="38e615fc-0c98-4789-867a-74144f0dc309">
                    <!----><!---->
                </div>
            </div>
        </div>
	`);
	
	textField.destroy();
});

// test TextInput
test('with no data, creates <TextInput /> elements', t2 => {
	const textInput = new TextInput({
		target,
		data: {
			value: 'value',
			label: 'text'
		}
	});
	t2.htmlEqual(target.innerHTML, `
		<input type="text" class="form-control " placeholder="" id="38e615fc-0c98-4789-867a-74144f0dc309">
		<!----><!---->
	`);

	textInput.destroy();
});

// test NumberInput
test('with no data, creates <TextInput /> elements', t3 => {
	const numberInput = new NumberInput({
		target,
		data: {
			value: 'value',
			label: 'text'
		}
	});
	t3.htmlEqual(target.innerHTML, `
		<input type="number" class="form-control " placeholder="" id="38e615fc-0c98-4789-867a-74144f0dc309">
		<!----><!---->
	`);

	numberInput.destroy();
});

// test SelectInput
test('with no data, creates <TextInput /> elements', t4 => {
	const selectInput = new SelectInput({
		target,
		data: {
			value: 'value',
			label: 'text'
		}
	});
	t4.htmlEqual(target.innerHTML, `
		<select class="form-control " id="38e615fc-0c98-4789-867a-74144f0dc309"></select>
		<!----><!---->
	`);

	selectInput.destroy();
});

// test MaskedInput
test('with no data, creates <TextInput /> elements', t5 => {
	const maskedInput = new MaskedInput({
		target,
		data: {
			value: 'value',
			label: 'text'
		}
	});
	t5.htmlEqual(target.innerHTML, `
		<input type="text" class="form-control masked " id="842e3cdd-2303-4233-a26d-f8f0393f2906" pattern="" placeholder="">
	`);

	maskedInput.destroy();
});

// test('allows height to be specified', t => {
// 	const list = new VirtualList({
// 		target,
// 		data: {
// 			items: [],
// 			component: null,
// 			height: '150px'
// 		}
// 	});

// 	const div = target.firstElementChild;

// 	t.equal(getComputedStyle(div).height, '150px');

// 	list.set({ height: '50%' });
// 	t.equal(getComputedStyle(div).height, '250px');

// 	list.destroy();
// });

// test('props are passed to child component', t => {
// 	const Row = svelte.create(`
// 		<span>{{row.foo}}</span>
// 		<span>{{baz}}</span>
// 		<span>{{items}}</span> <!-- should be undefined -->
// 	`);

// 	const list = new VirtualList({
// 		target,
// 		data: {
// 			items: [{ foo: 'bar'}],
// 			component: Row,
// 			baz: 'qux'
// 		}
// 	});

// 	t.htmlEqual(target.innerHTML, `
// 		<div style='height: 100%;'>
// 			<div style="padding-top: 0px; padding-bottom: 0px;">
// 				<div class="row">
// 					<span>bar</span>
// 					<span>qux</span>
// 					<span>undefined</span>
// 				</div>
// 			</div>
// 		</div>
// 	`);

// 	list.set({ baz: 'changed' });

// 	t.htmlEqual(target.innerHTML, `
// 		<div style='height: 100%;'>
// 			<div style="padding-top: 0px; padding-bottom: 0px;">
// 				<div class="row">
// 					<span>bar</span>
// 					<span>changed</span>
// 					<span>undefined</span>
// 				</div>
// 			</div>
// 		</div>
// 	`);

// 	list.destroy();
// });


// this allows us to close puppeteer once tests have completed
window.done = done;