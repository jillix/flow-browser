import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
//import closure from 'rollup-plugin-closure-compiler-js';
import uglify from 'rollup-plugin-uglify';

export default {
    entry: '/home/adioo/Repos/flow-nodejs/node_modules/flow/index.js',
    //entry: '/home/adioo/Repos/builder/index.js',
    dest: '/home/adioo/Repos/bundle.js',
    format: 'es',
    moduleName: 'flow',
    plugins: [
        globals(),
        builtins(),
        resolve({
            jsnext: true,
            browser: true
        }),
        commonjs(),
        //closure()
        uglify()
    ]
}
