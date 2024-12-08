import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import fastify from 'fastify'
import { either, task, taskEither } from 'fp-ts'
import { expectType, expectError, expectAssignable } from 'tsd'

import { fastifyFunky as fastifyFunkyNamed } from '..'
import fastifyFunkyDefault from '..'
import * as fastifyFunkyStar from '..'
import fastifyFunkyCjsImport = require('..')
const fastifyFunkyCjs = require('./')

const app: FastifyInstance = fastify()
app.register(fastifyFunkyNamed)
app.register(fastifyFunkyDefault)
app.register(fastifyFunkyCjs)
app.register(fastifyFunkyCjsImport.default)
app.register(fastifyFunkyCjsImport.fastifyFunky)
app.register(fastifyFunkyStar.default)
app.register(fastifyFunkyStar.fastifyFunky)

expectType<FastifyPluginCallback>(fastifyFunkyNamed)
expectType<FastifyPluginCallback>(fastifyFunkyDefault)
expectType<FastifyPluginCallback>(fastifyFunkyCjsImport.default)
expectType<FastifyPluginCallback>(fastifyFunkyCjsImport.fastifyFunky)
expectType<FastifyPluginCallback>(fastifyFunkyStar.default)
expectType<FastifyPluginCallback>(fastifyFunkyStar.fastifyFunky)
expectType<any>(fastifyFunkyCjs)

app.register(fastifyFunkyDefault)
// this gives a type error:
app.get('/', (req: FastifyRequest, reply: FastifyReply) => {
  return { right: { id: 1 } }
})

app.get('/func', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  return () => {
    return { right: { id: 1 } }
  }
})

app.get('/func', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  return Promise.resolve({})
})

app.get('/func', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  reply.status(200).send({})
})

// this is allowed
app.get('/', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  return { right: { id: 1 } }
})
app.get('/', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  return { left: new Error('error') }
})
app.get('/', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  return taskEither.fromEither(either.left(new Error('Invalid state')))
})
app.get('/', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  return taskEither.fromTask(task.of(Promise.resolve({})))
})
app.get('/', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  return either.of(Promise.resolve({}))
})
app.get('/', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  return task.of(Promise.resolve({}))
})
app.get('/', (req, reply) => {
  expectAssignable<FastifyRequest>(req)
  expectAssignable<FastifyReply>(reply)
  return taskEither.of(Promise.resolve({}))
})
