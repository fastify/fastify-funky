# fastify-funky

Support for fastify routes returning functional structures, such as fp-ts Either, Task, TaskEither or plain javascript parameterless functions.
Let's go funky, let's go functional!

## Getting started

First install the package:

```bash
npm i fastify-funky
```

Next, set up the plugin:

```js
const { fastifyFunky } = require('fastify-funky')
const fastify = require('fastify');

fastify.register(fastifyFunky);
``` 

With the plugin registered, you can start returning entities of type Either, Task or plain parameterless functions as router method results:

```js
const { either, task, taskEither } = require('fp-ts')

app.get('/', (req, reply) => {
  // This will return 200: { id: 1}
  return either.right({ id: 1})

  // Same as above
  return task.of(Promise.resolve({ id: 1}))

  // Same as above
  return taskEither.fromEither(either.right({ id: 1}))

  // Same as above
  return taskEither.fromTask(task.of(Promise.resolve({ id: 1})))

  // Same as above
  return () => { return { id: 1} } 

  // This will propagate to fastify error handler, which by default will return 500: Internal server error
  return either.left(new Error('Invalid state'))

  // Same as above
  return taskEither.fromEither(either.left(new Error('Invalid state')))
});
```
