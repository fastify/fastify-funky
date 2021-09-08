import { FastifyPluginCallback } from 'fastify'
import {
  ContextConfigDefault,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
} from 'fastify/types/utils'
import { FastifyInstance } from 'fastify/types/instance'
import { FastifyRequest } from 'fastify/types/request'
import { FastifyReply } from 'fastify/types/reply'
import { RouteGenericInterface } from 'fastify/types/route'

declare module 'fastify' {
  interface RouteHandlerMethod<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
    ContextConfig = ContextConfigDefault
  > {
    (
      this: FastifyInstance<RawServer, RawRequest, RawReply>,
      request: FastifyRequest<RouteGeneric, RawServer, RawRequest>,
      reply: FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig>
    ): Record<string, any> | (() => any)
  }
}

declare const fastifyFunky: FastifyPluginCallback

export default fastifyFunky
export { fastifyFunky }
