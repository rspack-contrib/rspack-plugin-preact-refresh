import fs from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import type {
  Compiler,
  RspackPluginInstance,
  RuleSetCondition,
} from '@rspack/core';

const require = createRequire(import.meta.url);

export interface IPreactRefreshRspackPluginOptions {
  /**
   * Include files to be processed by the plugin.
   * The value is the same as the `rule.test` option in Rspack.
   * @default /\.([jt]sx?)$/
   */
  include?: RuleSetCondition | null;
  /**
   * Exclude files from being processed by the plugin.
   * The value is the same as the `rule.exclude` option in Rspack.
   * @default /node_modules/
   */
  exclude?: RuleSetCondition | null;
  /**
   * Configure the error overlay.
   */
  overlay?: {
    /**
     * The module to use for the error overlay.
     */
    module: string;
  };
  /**
   * Path to the `preact` package.
   * @default `path.dirname(require.resolve('preact/package.json'))`
   */
  preactPath?: string;
}

interface NormalizedPluginOptions extends IPreactRefreshRspackPluginOptions {
  include: NonNullable<IPreactRefreshRspackPluginOptions['include']>;
  exclude: NonNullable<IPreactRefreshRspackPluginOptions['exclude']>;
  preactPath: NonNullable<IPreactRefreshRspackPluginOptions['preactPath']>;
}

const PREFRESH_CORE_PATH = require.resolve('@prefresh/core');
const PREFRESH_UTILS_PATH = require.resolve('@prefresh/utils');
const RUNTIME_UTIL_PATH = require.resolve('../client/prefresh.js');
const RUNTIME_INTERCEPT_PATH = require.resolve('../client/intercept.js');

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
      preactPath:
        options?.preactPath ?? dirname(require.resolve('preact/package.json')),
    };
  }

  apply(compiler: Compiler) {
    if (
      process.env.NODE_ENV === 'production' ||
      compiler.options.mode === 'production'
    )
      return;

    const INTERNAL_PATHS = [
      PREFRESH_UTILS_PATH,
      PREFRESH_CORE_PATH,
      RUNTIME_UTIL_PATH,
      RUNTIME_INTERCEPT_PATH,
    ];

    new compiler.webpack.ProvidePlugin({
      __prefresh_utils__: [RUNTIME_UTIL_PATH, 'default'],
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
      preact: this.options.preactPath,
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

export { PreactRefreshRspackPlugin };
export default PreactRefreshRspackPlugin;
