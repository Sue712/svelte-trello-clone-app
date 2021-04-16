import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import strip from '@rollup/plugin-strip';
import svelte from 'rollup-plugin-svelte';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import sveltePreProcess from 'svelte-preprocess';

import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import replace from 'rollup-plugin-replace';
const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		svelte({
			// compilerOptions: {
			// 	// enable run-time checks when not in production

			// }

			dev: !production,

			preprocess: sveltePreProcess({
				scss: {
					prependData: '@import "./src/scss/main.scss";'
				},
				//번들된 이후에 postcss실행
				postcss: {
					plugins: [
						//autoprefixer 모듈을 확인하는거까지 package.json에서 확인해주고 추가해줘야함
						require('autoprefixer')()
					]
				}
			})

		}),
		// we'll extract any component CSS out into    
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs

		//replace 모듈은 기본적인 플러그인들의 가장 상위에 명시해야함
		//특정코드를 replace로 다 바꾼다음에 번들 시작하는 것이기 때문에 외부모듈이 번들에 포함되기 시작하는 resolve 전에 추가해야함

		replace({
			values: {
				'crypto.randomBytes': '(require("randombytes"))'
			}
		}),

		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		globals(),
		builtins(),
		alias({
			entries: [
				{
					find: '~',
					replacement: path.resolve(__dirname, 'src/')

				}
			]
		}),


		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		production && strip({
			include: '**/*.(svelte|js)',
			functions: ['console.*', 'assert.*']
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()

	],
	watch: {
		clearScreen: false
	}
};
