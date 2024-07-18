'use strict'

const isPromise = require('node:util').types.isPromise
const fp = require('fastify-plugin')

function fastifyFunky (fastify, opts, next) {
  fastify.addHook('preSerialization', (req, res, payload, done) => {
    // Handle Either
    if (isEither(payload)) {
      return resolvePayload(done, payload.left, payload.right, res)
    }

    // Handle Task
    if (isTask(payload)) {
      const result = payload()
      if (isPromise(result)) {
        result
          .then((taskResult) => {
            if (isEither(taskResult)) {
              return resolvePayload(done, taskResult.left, taskResult.right, res)
            }

            return resolvePayload(done, null, taskResult, res)
          })
          .catch(done)
        return
      }
      if (isEither(result)) {
        return resolvePayload(done, result.left, result.right, res)
      }
      return resolvePayload(done, null, result, this)
    }

    done(null, payload)
  })

  next()
}

function resolvePayload (done, err, result, reply) {
  if (typeof result === 'string') {
    reply.type('text/plain; charset=utf-8').serializer(String)
  }
  return done(err, result)
}

function isEither (payload) {
  return payload.left || payload.right
}

function isTask (value) {
  return typeof value === 'function' && value.length === 0
}

module.exports = fp(fastifyFunky, {
  fastify: '5.x',
  name: '@fastify/funky'
})
module.exports.default = fastifyFunky
module.exports.fastifyFunky = fastifyFunky
