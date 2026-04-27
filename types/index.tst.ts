import fastify, { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import { either, task, taskEither } from 'fp-ts'
import { expect } from 'tstyche'
import fastifyFunkyDefault, { fastifyFunky as fastifyFunkyNamed } from '..'
import * as fastifyFunkyStar from '..'

const fastifyFunkyCjs = require('./')
import fastifyFunkyCjsImport = require('..')

const app: FastifyInstance = fastify()
app.register(fastifyFunkyNamed)
app.register(fastifyFunkyDefault)
app.register(fastifyFunkyCjs)
app.register(fastifyFunkyCjsImport.default)
app.register(fastifyFunkyCjsImport.fastifyFunky)
app.register(fastifyFunkyStar.default)
app.register(fastifyFunkyStar.fastifyFunky)

expect(fastifyFunkyNamed).type.toBe<FastifyPluginCallback>()
expect(fastifyFunkyDefault).type.toBe<FastifyPluginCallback>()
expect(fastifyFunkyCjsImport.default).type.toBe<FastifyPluginCallback>()
expect(fastifyFunkyCjsImport.fastifyFunky).type.toBe<FastifyPluginCallback>()
expect(fastifyFunkyStar.default).type.toBe<FastifyPluginCallback>()
expect(fastifyFunkyStar.fastifyFunky).type.toBe<FastifyPluginCallback>()

app.register(fastifyFunkyDefault)
// this gives a type error:
app.get('/', (_req: FastifyRequest, _reply: FastifyReply) => {
  return { right: { id: 1 } }
})

app.get('/func', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  return () => {
    return { right: { id: 1 } }
  }
})

app.get('/func', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  return Promise.resolve({})
})

app.get('/func', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  reply.status(200).send({})
})

// this is allowed
app.get('/', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  return { right: { id: 1 } }
})

app.get('/', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  return { left: new Error('error') }
})

app.get('/', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  return taskEither.fromEither(either.left(new Error('Invalid state')))
})

app.get('/', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  return taskEither.fromTask(task.of(Promise.resolve({})))
})

app.get('/', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  return either.of(Promise.resolve({}))
})

app.get('/', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  return task.of(Promise.resolve({}))
})

app.get('/', (req, reply) => {
  expect(req).type.toBeAssignableTo<FastifyRequest>()
  expect(reply).type.toBeAssignableTo<FastifyReply>()
  return taskEither.of(Promise.resolve({}))
})
