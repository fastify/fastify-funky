import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import fastify from 'fastify'
import { expectType } from 'tsd'

import { fastifyFunky as fastifyFunkyNamed } from './'
import fastifyFunkyDefault from './'
import * as fastifyFunkyStar from './'
import fastifyFunkyCjsImport = require('./')
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
