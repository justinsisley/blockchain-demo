import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'lib/index.js',
  output: {
    file: 'blockchain.js',
    format: 'iife',
    name: 'blockchain',
  },
  plugins: [
    resolve(),
    commonjs(),
  ],
};