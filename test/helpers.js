'use strict'

const fastify = require('fastify')
const { fastifyFunky } = require('../index')

function initAppGet (t, endpoint) {
  const app = fastify()
  app.register(fastifyFunky)

  app.get('/', endpoint)

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error)
    t.assert.deepStrictEqual(error.message, 'Invalid state')
    reply.status(500).send({ ok: false })
  })

  return app
}

async function assertResponseTypeAndBody (t, app, endpoint, expectedType, expectedBody) {
  const response = await app.inject().get(endpoint).end()
  t.assert.deepStrictEqual(response.headers['content-type'], expectedType)
  t.assert.deepStrictEqual(response.body, expectedBody)
}

function assertCorrectResponse (t, app) {
  return app
    .inject()
    .get('/')
    .end()
    .then((response) => {
      t.assert.deepStrictEqual(response.statusCode, 200)
      t.assert.deepStrictEqual(response.json().user, { id: 1 })
    })
}

function assertCorrectResponseBody (t, app, expectedBody, expectedCode = 200) {
  return app
    .inject()
    .get('/')
    .end()
    .then((response) => {
      t.assert.deepStrictEqual(response.statusCode, expectedCode)
      t.assert.deepStrictEqual(response.body, expectedBody)
    })
}

function assertErrorResponse (t, app) {
  return app
    .inject()
    .get('/')
    .end()
    .then((response) => {
      t.assert.deepStrictEqual(response.statusCode, 500)
      t.assert.deepStrictEqual(response.json(), {
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
