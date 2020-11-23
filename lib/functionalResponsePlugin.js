const utilTypes = require("util").types;
const fp = require("fastify-plugin");

function plugin(fastify, opts, next) {
  fastify.addHook("preSerialization", (req, res, payload, done) => {
    // Handle Either
    if (payload.left || payload.right) {
      return done(payload.left, payload.right);
    }

    // Handle Task
    if (isTask(payload)) {
      const result = payload();
      if (isPromise(result)) {
        result.then((taskResult) => {
          done(null, taskResult);
        });
        return;
      }
      return done(null, result);
    }

    done(null, payload);
  });

  next();
}

function isPromise(value) {
  return utilTypes.isPromise(value);
}

function isTask(value) {
  return typeof value === "function" && value.length === 0;
}

const fastifyFunctionalResponsePlugin = fp(plugin, {
  fastify: "3.x",
  name: "fastify-functional-response",
});

module.exports = {
  fastifyFunctionalResponsePlugin,
};
