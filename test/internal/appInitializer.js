const fastify = require("fastify");
const {
  fastifyFunctionalResponsePlugin,
} = require("../../lib/functionalResponsePlugin");

function initAppGet(endpoint) {
  const app = fastify({ logger: true });
  app.register(fastifyFunctionalResponsePlugin);

  app.get("/", endpoint);

  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    expect(error.message).toEqual("Invalid state");
    reply.status(500).send({ ok: false });
  });

  return app;
}

module.exports = {
  initAppGet,
};
