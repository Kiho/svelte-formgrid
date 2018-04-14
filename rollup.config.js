import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import buble from 'rollup-plugin-buble';
// import uglify from 'rollup-plugin-uglify';

const production = !process.env.ROLLUP_WATCH;

// export default {
// 	input: 'src/main.js',	
// 	output: {
// 		sourcemap: true,	
// 		format: 'iife',
// 		file: 'public/bundle.js',
// 		name: 'app',
// 	},
// 	plugins: [
// 		svelte({
// 			// enable run-time checks when not in production
// 			dev: !production,
// 			// we'll extract any component CSS out into
// 			// a separate file — better for performance
// 			css: css => {
// 				css.write('public/bundle.css');
// 			},

// 			// enable https://svelte.technology/guide#state-management
// 			store: true,

// 			// this results in smaller CSS files
// 			cascade: false
// 		}),

// 		// If you have external dependencies installed from
// 		// npm, you'll most likely need these plugins. In
// 		// some cases you'll need additional configuration —
// 		// consult the documentation for details:
// 		// https://github.com/rollup/rollup-plugin-commonjs
// 		resolve(),
// 		commonjs(),

// 		// If we're building for production (npm run build
// 		// instead of npm run dev), transpile and minify
// 		production && buble({ exclude: 'node_modules/**' }),
// 		production && uglify()
// 	]
// };

export default [
	// {
	// 	input: 'src/VirtualList.html',
	// 	output: [
	// 		{ file: pkg.module, 'format': 'es' },
	// 		{ file: pkg.main, 'format': 'umd', name: 'VirtualList' }
	// 	],
	// 	plugins: [
	// 		resolve(),
	// 		svelte({
	// 			cascade: false,
	// 			store: true
	// 		})
	// 	]
	// },

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
		input: 'test/src/index.js',
		output: {
			file: 'test/public/bundle.js',
			format: 'iife'
		},
		plugins: [
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