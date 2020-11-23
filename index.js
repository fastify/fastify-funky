const { fastifyFunctionalResponse } = require('./lib/functionalResponsePlugin')

/**
 * These export configurations enable JS and TS developers
 * to consume fastify-functional-response in whatever way best suits their needs.
 * Some examples of supported import syntax includes:
 * - `const fastifyFunctionalResponse = require('fastify-functional-response')`
 * - `const { fastifyFunctionalResponse } = require('fastify-functional-response')`
 * - `import * as fastifyFunctionalResponse from 'fastify-functional-response'`
 * - `import { fastifyFunctionalResponse } from 'fastify-functional-response'`
 * - `import fastifyFunctionalResponse from 'fastify-functional-response'`
 */
fastifyFunctionalResponse.fastifyFunctionalResponse = fastifyFunctionalResponse
fastifyFunctionalResponse.default = fastifyFunctionalResponse
module.exports = fastifyFunctionalResponse
