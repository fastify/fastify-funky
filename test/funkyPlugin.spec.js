const { initAppGet } = require('./internal/appInitializer')
const { either, task, taskEither } = require('fp-ts')

const DUMMY_USER = {
  user: {
    id: 1,
  },
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
