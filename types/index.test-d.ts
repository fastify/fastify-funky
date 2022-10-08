import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import fastify from 'fastify'
import { either, task, taskEither } from 'fp-ts'
import { expectType, expectError } from 'tsd'

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

app.get('/func', (req: FastifyRequest, reply: FastifyReply) => {
  return () => {
    return { right: { id: 1 } }
  }
})

app.get('/func', (req: FastifyRequest, reply: FastifyReply) => {
  return Promise.resolve({})
})

app.get('/func', (req: FastifyRequest, reply: FastifyReply) => {
  reply.status(200).send({})
})

// this is allowed
app.get("/", (req, reply) => {
  return { right: { id: 1 } };
});
app.get("/", (req, reply) => {
  return { left: new Error('error') };
});
app.get("/", (req, reply) => {
  return taskEither.fromEither(either.left(new Error('Invalid state')))
});
app.get("/", (req, reply) => {
  return taskEither.fromTask(task.of(Promise.resolve({})))
});
app.get("/", (req, reply) => {
  return either.of(Promise.resolve({}))
});
app.get("/", (req, reply) => {
  return task.of(Promise.resolve({}))
});
app.get("/", (req, reply) => {
  return taskEither.of(Promise.resolve({}))
});

//this will actually work in js, but not encouraged and hence ts will throw an error
expectError(app.get("/", (req, reply) => {
  return {}
}))

// ...but this gives a (correct) type error
expectError(app.get('/', (req: FastifyRequest, reply: FastifyReply) => {
  return { rght: { id: 1 } }
}))
