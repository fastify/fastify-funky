# @fastify/funky

[![NPM Version][npm-image]][npm-url]
[![CI](https://github.com/fastify/fastify-funky/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fastify/fastify-funky/actions/workflows/ci.yml)
[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)

Support for Fastify routes returning functional structures, such as `fp-ts` Either, Task, TaskEither, or plain JavaScript parameterless functions.
Let's go funky, let's go functional!

## Getting started

First, install the package:

```bash
npm i @fastify/funky
```

Next, set up the plugin:

```js
const { fastifyFunky } = require('@fastify/funky')
const fastify = require('fastify');

fastify.register(fastifyFunky);
```

`@fastify/funky` plugin is executed during `preSerialization` response lifecycle phase.

## Supported structures

While the most convenient way to use this plugin is with `fp-ts` library, it is not required.
`@fastify/funky` supports the following data structures:

### Parameterless functions:

```js
app.get('/', (req, reply) => {
  // This will result in a response 200: { id: 1}
  return () => { return { id: 1} }

  // Same as above
  return () => { return { right:
  { id: 1 }
  }}

  // Same as above
  return () => { return Promise.resolve({ id: 1 })}

  // Same as above
  return () => { return Promise.resolve({ right:
      { id: 1 }
  })}

  // Plugin will pass-through this value without doing anything
  return (id) => { return Promise.resolve({ id })}
});
```

If the function returns an `Either` object, it will be handled in the same way as if you returned that `Either` object directly.

If the function returns a Promise, it will be resolved. If Promise resolves to an `Either` object, it will be handled in the same way as if you returned that `Either` object directly.

If the function directly returns anything else, or if its Promise resolves to anything else, that result is passed further along the chain as the plugin execution result.

Note that functions with parameters will be ignored by the plugin and passed-through as-is.

### `Either` objects:

Right value is passed further along the chain as the plugin execution result:

```js
app.get('/', (req, reply) => {
  // This will result in a response 200: { id: 1}
  return { right:
           { id: 1 }
         }
});
```

Left value is passed to the error handler:

```js
app.get('/', (req, reply) => {
  // This will propagate to fastify error handler, which by default will result in a response 500: Internal server error
  return { left: new Error('Invalid state') }
});
```

## Using with fp-ts

With the plugin registered, you can start returning entities of type Either, Task, or plain parameterless functions as router method results:

```js
const { either, task, taskEither } = require('fp-ts')

app.get('/', (req, reply) => {
  // This will result in a response 200: { id: 1}
  return either.right({ id: 1})

  // Same as above
  return task.of(Promise.resolve({ id: 1}))

  // Same as above
  return taskEither.fromEither(either.right({ id: 1}))

  // Same as above
  return taskEither.fromTask(task.of(Promise.resolve({ id: 1})))

  // Same as above
  return () => { return { id: 1} }

  // This will propagate to fastify error handler, which by default will result in a response 500: Internal server error
  return either.left(new Error('Invalid state'))

  // Same as above
  return taskEither.fromEither(either.left(new Error('Invalid state')))
});
```

## License

Licensed under [MIT](./LICENSE).

[npm-image]: https://img.shields.io/npm/v/@fastify/funky.svg
[npm-url]: https://npmjs.org/package/@fastify/funky
[downloads-image]: https://img.shields.io/npm/dm/fastify-funky.svg
[downloads-url]: https://npmjs.org/package/@fastify/funky
