import fs from 'node:fs';
import { dirname } from 'node:path';
import type { Compiler, RspackPluginInstance } from '@rspack/core';

export interface IPreactRefreshRspackPluginOptions {
  include?: string | RegExp | (string | RegExp)[] | null;
  exclude?: string | RegExp | (string | RegExp)[] | null;
  overlay?: {
    module: string;
  };
}

interface NormalizedPluginOptions extends IPreactRefreshRspackPluginOptions {
  include: NonNullable<IPreactRefreshRspackPluginOptions['include']>;
  exclude: NonNullable<IPreactRefreshRspackPluginOptions['exclude']>;
}

const PREFRESH_CORE_PATH = require.resolve('@prefresh/core');
const PREFRESH_UTILS_PATH = require.resolve('@prefresh/utils');
const RUNTIME_UTIL_PATH = require.resolve('../client/prefresh.cjs');
const RUNTIME_INTERCEPT_PATH = require.resolve('../client/intercept.cjs');

const runtimeSource = fs.readFileSync(RUNTIME_INTERCEPT_PATH, 'utf-8');

const NAME = 'PreactRefreshRspackPlugin';

class PreactRefreshRspackPlugin implements RspackPluginInstance {
  name = NAME;
  private options: NormalizedPluginOptions;

  constructor(options: IPreactRefreshRspackPluginOptions) {
    this.options = {
      include: options?.include ?? /\.([jt]sx?)$/,
      exclude: options?.exclude ?? /node_modules/,
      overlay: options?.overlay,
    };
  }

  apply(compiler: Compiler) {
    if (
      process.env.NODE_ENV === 'production' ||
      compiler.options.mode === 'production'
    )
      return;

    const PREACT_PATH = dirname(require.resolve('preact/package.json'));

    const INTERNAL_PATHS = [
      PREFRESH_UTILS_PATH,
      PREFRESH_CORE_PATH,
      RUNTIME_UTIL_PATH,
      RUNTIME_INTERCEPT_PATH,
    ];

    new compiler.webpack.ProvidePlugin({
      __prefresh_utils__: RUNTIME_UTIL_PATH,
      ...(this.options.overlay
        ? {
            __prefresh_errors__: require.resolve(this.options.overlay.module),
          }
        : {}),
    }).apply(compiler);
    new compiler.webpack.EntryPlugin(compiler.context, '@prefresh/core', {
      name: undefined,
    }).apply(compiler);

    // new compiler.webpack.DefinePlugin({ __refresh_library__ }).apply(compiler);
    compiler.options.resolve.alias = {
      preact: PREACT_PATH,
      '@prefresh/core': PREFRESH_CORE_PATH,
      '@prefresh/utils': PREFRESH_UTILS_PATH,
      ...compiler.options.resolve.alias,
    };

    compiler.options.module.rules.unshift({
      include: this.options.include,
      exclude: {
        or: [
          this.options.exclude,
          ...INTERNAL_PATHS,
          /node_modules[\\/]preact[\\/]/,
        ].filter(Boolean),
      },
      use: 'builtin:preact-refresh-loader',
    });

    compiler.hooks.thisCompilation.tap(NAME, (compilation) => {
      compilation.hooks.runtimeModule.tap(NAME, (runtimeModule) => {
        // rspack does not have addRuntimeModule and runtimeRequirements on js side
        if (
          runtimeModule.constructorName === 'HotModuleReplacementRuntimeModule'
        ) {
          if (!runtimeModule.source) {
            throw new Error(
              'Can not get the original source of HotModuleReplacementRuntimeModule',
            );
          }
          const originalSource =
            runtimeModule.source.source.toString('utf-8') || '';
          runtimeModule.source.source = Buffer.from(
            `${originalSource}\n${runtimeSource}`,
            'utf-8',
          );
        }
      });
    });
  }
}

// @ts-expect-error output module.exports
export = PreactRefreshRspackPlugin;
