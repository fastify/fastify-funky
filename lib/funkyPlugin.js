const utilTypes = require('util').types
const fp = require('fastify-plugin')

function plugin(fastify, opts, next) {
  fastify.addHook('preSerialization', (req, res, payload, done) => {
    // Handle Either
    if (isEither(payload)) {
      return done(payload.left, payload.right)
    }

    // Handle Task
    if (isTask(payload)) {
      const result = payload()
      if (isPromise(result)) {
        result
          .then((taskResult) => {
            if (isEither(taskResult)) {
              return done(taskResult.left, taskResult.right)
            }

            return done(null, taskResult)
          })
          .catch((err) => {
            return done(err)
          })
        return
      }
      if (isEither(result)) {
        return done(result.left, result.right)
      }
      return done(null, result)
    }

    done(null, payload)
  })

  next()
}

function isEither(payload) {
  return payload.left || payload.right
}

function isPromise(value) {
  return utilTypes.isPromise(value)
}

function isTask(value) {
  return typeof value === 'function' && value.length === 0
}

const fastifyFunky = fp(plugin, {
  fastify: '3.x',
  name: 'fastify-funky',
})

module.exports = {
  fastifyFunky,
}
