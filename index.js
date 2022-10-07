'use strict'

const utilTypes = require('util').types
const fp = require('fastify-plugin')

function resolvePayload (done, err, result, reply) {
  if (typeof result === 'string') {
    reply.type('text/plain; charset=utf-8').serializer(String)
  }
  return done(err, result)
}

function plugin (fastify, opts, next) {
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

function isEither (payload) {
  return payload.left || payload.right
}

function isPromise (value) {
  return utilTypes.isPromise(value)
}

function isTask (value) {
  return typeof value === 'function' && value.length === 0
}

module.exports = fp(plugin, {
  fastify: '4.x',
  name: '@fastify/funky'
})
