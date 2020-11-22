import { fastifyFunctionalResponsePlugin } from './'
import { FastifyInstance } from 'fastify'

const fastify = require('fastify')

const app: FastifyInstance = fastify()
app.register(fastifyFunctionalResponsePlugin)

