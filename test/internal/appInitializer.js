const fastify = require('fastify')
const { fastifyFunky } = require('../../')

function initAppGet(endpoint) {
  const app = fastify({ logger: true })
  app.register(fastifyFunky)

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
