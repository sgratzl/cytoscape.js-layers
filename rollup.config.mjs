import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';

import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

function resolveYear() {
  // Extract copyrights from the LICENSE.
  const license = fs.readFileSync('./LICENSE', 'utf-8').toString();
  const matches = Array.from(license.matchAll(/\(c\) (\d+)/gm));
  if (!matches || matches.length === 0) {
    return 2021;
  }
  return matches[matches.length - 1][1];
}
const year = resolveYear();

const banner = `/**
 * ${pkg.name}
 * ${pkg.homepage}
 *
 * Copyright (c) ${year} ${pkg.author.name} <${pkg.author.email}>
 */
`;

/**
 * defines which formats (umd, esm, cjs, types) should be built when watching
 */
const watchOnly = ['umd'];

const isDependency = (v) => Object.keys(pkg.dependencies || {}).some((e) => e === v || v.startsWith(e + '/'));
const isPeerDependency = (v) => Object.keys(pkg.peerDependencies || {}).some((e) => e === v || v.startsWith(e + '/'));

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Config(options) {
  const buildFormat = (format) => !options.watch || watchOnly.includes(format);

  const base = {
    input: './src/index.ts',
    output: {
      sourcemap: true,
      banner,
      exports: 'named',
      globals: {},
    },
    external: (v) => isDependency(v) || isPeerDependency(v),
    plugins: [
      typescript(),
      resolve(),
      commonjs(),
      replace({
        preventAssignment: true,
        values: {
          // eslint-disable-next-line no-undef
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || 'production',
          __VERSION__: JSON.stringify(pkg.version),
        },
      }),
    ],
  };
  return [
    (buildFormat('esm') || buildFormat('cjs')) && {
      ...base,
      output: [
        buildFormat('esm') && {
          ...base.output,
          file: pkg.module,
          format: 'esm',
        },
        buildFormat('cjs') && {
          ...base.output,
          file: pkg.require,
          format: 'cjs',
        },
      ].filter(Boolean),
    },
    ((buildFormat('umd') && pkg.umd) || (buildFormat('umd-min') && pkg.unpkg)) && {
      ...base,
      input: fs.existsSync(base.input.replace('.ts', '.umd.ts')) ? base.input.replace('.ts', '.umd.ts') : base.input,
      output: [
        buildFormat('umd') &&
          pkg.umd && {
            ...base.output,
            file: pkg.umd,
            format: 'umd',
            name: pkg.global,
          },
        buildFormat('umd-min') &&
          pkg.unpkg && {
            ...base.output,
            file: pkg.unpkg,
            format: 'umd',
            name: pkg.global,
            plugins: [terser()],
          },
      ].filter(Boolean),
      external: (v) => isPeerDependency(v),
      plugins: [...base.plugins, babel({ presets: ['@babel/env'], babelHelpers: 'bundled' })],
    },
    buildFormat('types') && {
      ...base,
      output: {
        ...base.output,
        file: pkg.types,
        format: 'es',
      },
      plugins: [
        dts({
          compilerOptions: {
            removeComments: false,
          },
          respectExternal: true,
        }),
      ],
    },
  ].filter(Boolean);
}
