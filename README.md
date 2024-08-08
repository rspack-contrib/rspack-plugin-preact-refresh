<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://assets.rspack.dev/rspack/rspack-banner-plain-dark.png">
  <img alt="Rspack Banner" src="https://assets.rspack.dev/rspack/rspack-banner-plain-light.png">
</picture>

# @rspack/plugin-preact-refresh

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
>
> Please use `builtin:swc-loader` and enable preact specific transformation with `rspackExperiments.preact: {}`

```js
const PreactRefreshPlugin = require('@rspack/plugin-preact-refresh');
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  // ...
  mode: isDev ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              experimental: {
                plugins: [
                  [
                    '@swc/plugin-prefresh', // enable prefresh specific transformation
                    {
                      library: ['preact-like-framework'], // the customizable preact name, default is `["preact", "preact/compat", "react"]`
                    },
                  ],
                ],
              },
              parser: {
                syntax: 'ecmascript',
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

## Example

See [examples/preact-refresh](https://github.com/rspack-contrib/rspack-examples/blob/main/rspack/preact-refresh/rspack.config.js) for the full example.
