const { fastifyFunky } = require('./lib/funkyPlugin')

/**
 * These export configurations enable JS and TS developers
 * to consume fastify-funky in whatever way best suits their needs.
 * Some examples of supported import syntax includes:
 * - `const fastifyFunky = require('fastify-funky')`
 * - `const { fastifyFunky } = require('fastify-funky')`
 * - `import * as fastifyFunky from 'fastify-funky'`
 * - `import { fastifyFunky } from 'fastify-funky'`
 * - `import fastifyFunky from 'fastify-funky'`
 */
fastifyFunky.fastifyFunky = fastifyFunky
fastifyFunky.default = fastifyFunky
module.exports = fastifyFunky
