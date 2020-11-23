const fastify = require('fastify')
const { fastifyFunctionalResponse } = require('../../')

function initAppGet(endpoint) {
  const app = fastify({ logger: true })
  app.register(fastifyFunctionalResponse)

  app.get('/', endpoint)

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error)
    expect(error.message).toEqual('Invalid state')
    reply.status(500).send({ ok: false })
  })

  return app
}

module.exports = {
  initAppGet,
}
