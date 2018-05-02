import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import multiEntry from "rollup-plugin-multi-entry";
// import uglify from 'rollup-plugin-uglify';

const pack = require('./package.json');
// , transforms: { forOf: false }
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
			svelte({
				// enable run-time checks when not in production
				dev: !production,
			}),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration —
			// consult the documentation for details:
			// https://github.com/rollup/rollup-plugin-commonjs
			resolve(),
			commonjs(),
			production && buble({ objectAssign: 'Object.assign', exclude: 'node_modules/**' }),
		],
	},

	{
		input: 'src/main.js',	
		output: {
			sourcemap: true,	
			format: 'iife',
			file: 'public/bundle.js',
			name: 'app',
		},
		plugins: [
			svelte({
				// enable run-time checks when not in production
				dev: !production,
				// we'll extract any component CSS out into
				// a separate file — better for performance
				css: css => {
					css.write('public/bundle.css');
				},

				// enable https://svelte.technology/guide#state-management
				store: true,

				// this results in smaller CSS files
				cascade: false
			}),

			// If you have external dependencies installed from
			// npm, you'll most likely need these plugins. In
			// some cases you'll need additional configuration —
			// consult the documentation for details:
			// https://github.com/rollup/rollup-plugin-commonjs
			resolve(),
			commonjs(),
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