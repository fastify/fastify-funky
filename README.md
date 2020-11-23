# fastify-functional-response
Support for fastify routes returning functional structures, such as fp-ts Either, Task or plain javascript parameterless functions.

## Getting started

First install the package:

```bash
npm i fastify-functional-response
```

Next, set up the plugin:

```js
const { fastifyFunctionalResponse } = require('fastify-functional-response')
const fastify = require('fastify');

fastify.register(fastifyFunctionalResponse);
``` 

With plugin registered, you can start returning entities of type Either, Task or plain parameterless functions as router method results:

```js
const { either, task } = require('fp-ts')

app.get('/', (req, reply) => {
  // This will return 200: { id: 1}
  return either.right({ id: 1})

  // Same as above
  return task.of(Promise.resolve({ id: 1}))

  // This will propagate to fastify error handler, which by default will return 500: Internal server error
  return either.left(new Error('Invalid state'))
});
```
