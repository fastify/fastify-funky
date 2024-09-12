'use strict'

const fastify = require('fastify')
const { either, task, taskEither } = require('fp-ts')
const { test } = require('node:test')
const {
  initAppGet,
  assertResponseTypeAndBody,
  assertCorrectResponse,
  assertCorrectResponseBody,
  assertErrorResponse
} = require('./helpers')
const { fastifyFunky } = require('../index')

const DUMMY_USER = {
  user: {
    id: 1
  }
}

test('Promise: Correctly handles top-level promise', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    return Promise.resolve(either.right(DUMMY_USER))
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('either: correctly parses right part of Either (sync)', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    return either.right(DUMMY_USER)
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('either: correctly parses right part of Either (async)', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    const payload = either.right(DUMMY_USER)
    return Promise.resolve(payload)
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('either: correctly parses left part of Either when resolved (async)', async (t) => {
  t.plan(3)

  const route = (_req, _reply) => {
    const payload = either.left(new Error('Invalid state'))
    return Promise.resolve(payload)
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertErrorResponse(t, app)
})

test('either: correctly parses left part of Either when resolved (sync)', async (t) => {
  t.plan(3)

  const route = (_req, _reply) => {
    return either.left(new Error('Invalid state'))
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertErrorResponse(t, app)
})

test('either: supports reply callback with the right part of Either', async (t) => {
  t.plan(2)

  const route = (_req, reply) => {
    const payload = either.right(DUMMY_USER)
    Promise.resolve(payload).then((result) => {
      reply.send(result)
    })
    return reply
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('task: correctly parses Task result (sync)', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    return task.of(DUMMY_USER)
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('task: correctly parses Task result (promise)', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    return task.of(Promise.resolve(DUMMY_USER))
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('task: correctly handles Task throwing', async (t) => {
  t.plan(3)

  const route = (_req, _reply) => {
    return () => {
      return Promise.resolve().then(() => {
        throw new Error('Invalid state')
      })
    }
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertErrorResponse(t, app)
})

test('task: correctly parses result of a plain parameterless function', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    const payload = () => {
      return DUMMY_USER
    }

    return payload
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('task: correctly parses result of a plain parameterless function that returns Either', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    const payload = () => {
      return { right: DUMMY_USER }
    }

    return payload
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('task: ignores parameterless function with parameters', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    const payload = (user) => {
      return user
    }

    return payload
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponseBody(t, app, '')
})

test('task: handles empty body correctly', async (t) => {
  t.plan(2)

  const route = (_req, reply) => {
    reply.code(204).send()
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponseBody(t, app, '', 204)
})

test('text content: correctly handles text response', async (t) => {
  t.plan(16)

  const text = 'text'
  const obj = { json: true }

  const app = fastify().register(fastifyFunky)

  t.after(() => {
    app.close()
  })

  app.get('/simple-json', async () => obj)
  app.get('/simple-text', async () => text)
  app.get('/task-json', async () => task.of(obj))
  app.get('/task-text', async () => task.of(text))
  app.get('/either-json', async () => either.of(obj))
  app.get('/either-text', async () => either.of(text))
  app.get('/taskeither-json', async () => taskEither.of(obj))
  app.get('/taskeither-text', async () => taskEither.of(text))

  await app.listen({ port: 3000 })

  const objStr = JSON.stringify(obj)
  for (const endpoint of ['/simple-json', '/task-json', '/either-json', '/taskeither-json']) {
    await assertResponseTypeAndBody(t, app, endpoint, 'application/json; charset=utf-8', objStr)
  }

  for (const endpoint of ['/simple-text', '/task-text', '/either-text', '/taskeither-text']) {
    await assertResponseTypeAndBody(t, app, endpoint, 'text/plain; charset=utf-8', text)
  }
})

test('taskEither: correctly parses TaskEither result (Either right)', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    return taskEither.fromEither(either.right(DUMMY_USER))
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('taskEither: correctly parses TaskEither result (Task)', async (t) => {
  t.plan(2)

  const route = (_req, _reply) => {
    return taskEither.fromEither(either.right(DUMMY_USER))
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertCorrectResponse(t, app)
})

test('taskEither: correctly parses TaskEither result (Either left)', async (t) => {
  t.plan(3)

  const route = (_req, _reply) => {
    return taskEither.fromEither(either.left(new Error('Invalid state')))
  }

  const app = await initAppGet(t, route).ready()

  t.after(() => {
    app.close()
  })

  await assertErrorResponse(t, app)
})
