const fastify = require('fastify')
const { either, task, taskEither } = require('fp-ts')
const { initAppGet } = require('./internal/appInitializer')
const { fastifyFunky } = require('../')

const DUMMY_USER = {
  user: {
    id: 1,
  },
}

async function assertResponseTypeAndBody(app, endpoint, expectedType, expectedBody) {
  const response = await app.inject().get(endpoint).end()
  expect(response.headers['content-type']).toEqual(expectedType)
  expect(response.body).toEqual(expectedBody)
}
function assertCorrectResponse(app) {
  return app
    .inject()
    .get('/')
    .end()
    .then((response) => {
      expect(response.statusCode).toEqual(200)
      expect(response.json().user).toEqual({ id: 1 })
    })
}

function assertCorrectResponseBody(app, expectedBody, expectedCode = 200) {
  return app
    .inject()
    .get('/')
    .end()
    .then((response) => {
      expect(response.statusCode).toEqual(expectedCode)
      expect(response.body).toEqual(expectedBody)
    })
}

function assertErrorResponse(app) {
  return app
    .inject()
    .get('/')
    .end()
    .then((response) => {
      expect(response.statusCode).toEqual(500)
      expect(response.json()).toEqual({
        ok: false,
      })
    })
}

describe('fastifyFunky', () => {
  let app
  afterEach(() => {
    return app.close()
  })

  describe('Promise', () => {
    it('Correctly handles top-level promise', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        return Promise.resolve(either.right(DUMMY_USER))
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })
  })

  describe('either', () => {
    it('correctly parses right part of Either (sync)', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        return either.right(DUMMY_USER)
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })

    it('correctly parses right part of Either (async)', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        const payload = either.right(DUMMY_USER)
        return Promise.resolve(payload)
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })

    it('correctly parses left part of Either when resolved (async)', async () => {
      expect.assertions(3)

      const route = (_req, _reply) => {
        const payload = either.left(new Error('Invalid state'))
        return Promise.resolve(payload)
      }

      app = await initAppGet(route).ready()
      await assertErrorResponse(app)
    })

    it('correctly parses left part of Either when resolved (sync)', async () => {
      expect.assertions(3)

      const route = (_req, _reply) => {
        return either.left(new Error('Invalid state'))
      }

      app = await initAppGet(route).ready()
      await assertErrorResponse(app)
    })

    it('supports reply callback with the right part of Either', async () => {
      expect.assertions(2)

      const route = (_req, reply) => {
        const payload = either.right(DUMMY_USER)
        Promise.resolve(payload).then((result) => {
          reply.send(result)
        })
        return reply
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })
  })

  describe('task', () => {
    it('correctly parses Task result (sync)', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        return task.of(DUMMY_USER)
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })

    it('correctly parses Task result (promise)', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        return task.of(Promise.resolve(DUMMY_USER))
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })

    it('correctly handles Task throwing', async () => {
      expect.assertions(3)

      const route = (_req, _reply) => {
        return () => {
          return Promise.resolve().then(() => {
            throw new Error('Invalid state')
          })
        }
      }

      app = await initAppGet(route).ready()
      await assertErrorResponse(app)
    })

    it('correctly parses result of a plain parameterless function', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        const payload = () => {
          return DUMMY_USER
        }

        return payload
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })

    it('correctly parses result of a plain parameterless function that returns Either', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        const payload = () => {
          return { right: DUMMY_USER }
        }

        return payload
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })

    it('ignores parameterless function with parameters', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        const payload = (user) => {
          return user
        }

        return payload
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponseBody(app, '')
    })

    it('handles empty body correctly', async () => {
      expect.assertions(2)

      const route = (_req, reply) => {
        reply.code(204).send()
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponseBody(app, '', 204)
    })
  })

  describe('text content', () => {
    it('correctly handles text response', async () => {
      const text = 'text'
      const obj = { json: true }

      const server = fastify().register(fastifyFunky)
      app = server

      server.get('/simple-json', async () => obj)
      server.get('/simple-text', async () => text)
      server.get('/task-json', async () => task.of(obj))
      server.get('/task-text', async () => task.of(text))
      server.get('/either-json', async () => either.of(obj))
      server.get('/either-text', async () => either.of(text))
      server.get('/taskeither-json', async () => taskEither.of(obj))
      server.get('/taskeither-text', async () => taskEither.of(text))

      await server.listen({ port: 3000 })

      const objStr = JSON.stringify(obj)
      for (const endpoint of ['/simple-json', '/task-json', '/either-json', '/taskeither-json']) {
        await assertResponseTypeAndBody(server, endpoint, 'application/json; charset=utf-8', objStr)
      }

      for (const endpoint of ['/simple-text', '/task-text', '/either-text', '/taskeither-text']) {
        await assertResponseTypeAndBody(server, endpoint, 'text/plain; charset=utf-8', text)
      }
    })
  })

  describe('taskEither', () => {
    it('correctly parses TaskEither result (Either right)', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        return taskEither.fromEither(either.right(DUMMY_USER))
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })

    it('correctly parses TaskEither result (Task)', async () => {
      expect.assertions(2)

      const route = (_req, _reply) => {
        return taskEither.fromTask(task.of(Promise.resolve(DUMMY_USER)))
      }

      app = await initAppGet(route).ready()
      await assertCorrectResponse(app)
    })

    it('correctly parses TaskEither result (Either left)', async () => {
      expect.assertions(3)

      const route = (_req, _reply) => {
        return taskEither.fromEither(either.left(new Error('Invalid state')))
      }

      app = await initAppGet(route).ready()
      await assertErrorResponse(app)
    })
  })
})
