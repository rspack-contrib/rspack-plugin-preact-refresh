# @rspack/plugin-preact-refresh

<p>
  <a href="https://www.npmjs.com/package/@rspack/plugin-preact-refresh?activeTab=readme"><img src="https://img.shields.io/npm/v/@rspack/plugin-preact-refresh?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>
  <a href="https://npmcharts.com/compare/@rspack/plugin-preact-refresh?minimal=true"><img src="https://img.shields.io/npm/dm/@rspack/plugin-preact-refresh.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
  <a href="https://github.com/web-infra-dev/rspack/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" /></a>
</p>

Preact refresh plugin for [Rspack](https://github.com/web-infra-dev/rspack).

## Installation

First you need to install the dependencies:

```bash
npm add @rspack/plugin-preact-refresh @prefresh/core @prefresh/utils -D
# or
yarn add @rspack/plugin-preact-refresh @prefresh/core @prefresh/utils -D
# or
pnpm add @rspack/plugin-preact-refresh @prefresh/core @prefresh/utils -D
# or
bun add @rspack/plugin-preact-refresh @prefresh/core @prefresh/utils -D
```

## Usage

The enabling of the [Preact Refresh](https://github.com/preactjs/prefresh) is divided into two parts: code injection and code transformation

- Code injection: injects code that interacts with `@prefresh/core` and `@prefresh/utils`, this is what this plugin does.
- Code transformation requires a loader
  - Use `builtin:swc-loader` or [`swc-loader`](https://swc.rs/docs/usage/swc-loader)
    - Enable `jsc.transform.react.refresh` to support common react transformation
    - Add [`@swc/plugin-prefresh`](https://github.com/swc-project/plugins/tree/main/packages/prefresh) into `jsc.experimental.plugins` to support the specific transformation of preact
  - Use `babel-loader` and add official [babel plugin](https://github.com/preactjs/prefresh/tree/main/packages/babel) of prefresh.

> In versions below 1.0.0, Rspack did not support preact refresh with `swc-loader`.

```js
const PreactRefreshPlugin = require("@rspack/plugin-preact-refresh");
const isDev = process.env.NODE_ENV === "development";

module.exports = {
  // ...
  mode: isDev ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.jsx$/,
        // exclude node_modules to avoid dependencies transformed by `@swc/plugin-prefresh`
        exclude: /node_modules/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              experimental: {
                plugins: [
                  [
                    // enable prefresh specific transformation
                    require.resolve("@swc/plugin-prefresh"),
                    {
                      library: ["preact-like-framework"], // the customizable preact name, default is `["preact", "preact/compat", "react"]`
                    },
                  ],
                ],
              },
              parser: {
                syntax: "ecmascript",
                jsx: true,
              },
              transform: {
                react: {
                  development: isDev,
                  refresh: isDev, // enable common react transformation
                },
              },
            },
          },
        },
      },
    ],
  },
  plugins: [isDev && new PreactRefreshPlugin()].filter(Boolean),
};
```

## Options

### include

- Type: [Rspack.RuleSetCondition](https://rspack.rs/config/module-rules#condition)
- Default: `/\.([jt]sx?)$/`

Include files to be processed by the plugin. The value is the same as the `rule.test` option in Rspack.

```js
new PreactRefreshPlugin({
  include: [/\.jsx$/, /\.tsx$/],
});
```

### exclude

- Type: [Rspack.RuleSetCondition](https://rspack.rs/config/module-rules#condition)
- Default: `/node_modules/`

Exclude files from being processed by the plugin. The value is the same as the `rule.exclude` option in Rspack.

```js
new PreactRefreshPlugin({
  exclude: [/node_modules/, /some-other-module/],
});
```

### preactPath

- Type: `string`
- Default: `path.dirname(require.resolve('preact/package.json'))`

Path to the `preact` package.

```js
const path = require("node:path");

new PreactRefreshPlugin({
  preactPath: path.dirname(require.resolve("preact/package.json")),
});
```

## Example

See [examples/preact-refresh](https://github.com/rspack-contrib/rspack-examples/blob/main/rspack/preact-refresh/rspack.config.js) for the full example.

## Credits

Thanks to the [prefresh](https://github.com/preactjs/prefresh) created by [@Jovi De Croock](https://github.com/JoviDeCroock), which inspires implement this plugin.

## License

Rspack is [MIT licensed](https://github.com/web-infra-dev/rspack/blob/main/LICENSE).
