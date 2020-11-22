const fp = require("fastify-plugin");

function plugin(fastify, opts, next) {
  fastify.addHook("preSerialization", (req, res, payload, done) => {
    if (payload.left || payload.right) {
      return done(payload.left, payload.right);
    }

    done(null, payload);
  });

  next();
}

const fastifyFunctionalResponsePlugin = fp(plugin, {
  fastify: "3.x",
  name: "fastify-functional-response",
});

module.exports = {
  fastifyFunctionalResponsePlugin,
};
