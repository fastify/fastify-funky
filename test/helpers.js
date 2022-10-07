const fastify = require('fastify')
const { fastifyFunky } = require('../index')

function initAppGet (t, endpoint) {
  const app = fastify()
  app.register(fastifyFunky)

  app.get('/', endpoint)

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error)
    t.strictSame(error.message, 'Invalid state')
    reply.status(500).send({ ok: false })
  })

  return app
}

async function assertResponseTypeAndBody (t, app, endpoint, expectedType, expectedBody) {
  const response = await app.inject().get(endpoint).end()
  t.strictSame(response.headers['content-type'], expectedType)
  t.strictSame(response.body, expectedBody)
}

function assertCorrectResponse (t, app) {
  return app
    .inject()
    .get('/')
    .end()
    .then((response) => {
      t.strictSame(response.statusCode, 200)
      t.strictSame(response.json().user, { id: 1 })
    })
}

function assertCorrectResponseBody (t, app, expectedBody, expectedCode = 200) {
  return app
    .inject()
    .get('/')
    .end()
    .then((response) => {
      t.strictSame(response.statusCode, expectedCode)
      t.strictSame(response.body, expectedBody)
    })
}

function assertErrorResponse (t, app) {
  return app
    .inject()
    .get('/')
    .end()
    .then((response) => {
      t.strictSame(response.statusCode, 500)
      t.strictSame(response.json(), {
        ok: false
      })
    })
}

module.exports = {
  initAppGet,
  assertResponseTypeAndBody,
  assertCorrectResponse,
  assertCorrectResponseBody,
  assertErrorResponse
}
