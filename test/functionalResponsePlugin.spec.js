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

describe('functionalResponsePlugin', () => {
  let app
  afterEach(() => {
    return app.close()
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
