import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import multiEntry from "rollup-plugin-multi-entry";

const pack = require('./package.json');

const production = !process.env.ROLLUP_WATCH;
console.log('production', production);

export default [
	{
		input: './src/index.js',	
		output:[
			{	
				sourcemap: true,
				format: 'cjs',
				file: pack.main,
				name: 'formgrid',	
			}, {
				sourcemap: true,
				format: "es",
				file: pack.jsnext,
				name: 'formgrid',
			}
		],
		plugins: [
			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration —
			// consult the documentation for details:
			// https://github.com/rollup/rollup-plugin-commonjs
			resolve(),
			commonjs(),
			svelte({
				// enable run-time checks when not in production
				dev: !production,
			}),
			production && buble({ objectAssign: 'Object.assign', exclude: 'node_modules/**' }),
		],
	},

	{
		input: 'src/main.js',	
		output: [{
			sourcemap: true,	
			format: 'iife',
			file: 'public/bundle.js',
			name: 'app',
		}, {
			sourcemap: true,	
			format: 'iife',
			file: 'docs/bundle.js',
			name: 'app',
		}],
		plugins: [
			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration —
			// consult the documentation for details:
			// https://github.com/rollup/rollup-plugin-commonjs
			resolve(),
			commonjs(),
			svelte({
				// enable run-time checks when not in production
				dev: !production,
				// we'll extract any component CSS out into
				// a separate file — better for performance
				css: css => {
					css.write('public/bundle.css');
				},
			}),
		],
	},

	// tests
	{
		input: 'test/src/**/*.js',
		output: {
			file: 'test/public/bundle.js',
			format: 'iife'
		},
		plugins: [
			multiEntry(),
			resolve(),
			commonjs({
				namedExports: {
					svelte: ['create', 'compile']
				}
			}),
			svelte({
				cascade: false,
				store: true
			})
		]
	}
];