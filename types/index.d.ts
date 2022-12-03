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
    ): void | Promise<RouteGeneric['Reply'] | void> | fastifyFunky.FunkyReply<RouteGeneric['Reply']>
  }
}

type FastifyFunky = FastifyPluginCallback

declare namespace fastifyFunky {

  export interface Left<E = unknown> {
    readonly left: E
  }

  export interface Right<A> {
    readonly right: A
  }

  export type Either<E, A> = Left<E> | Right<A>

  export interface Task<A> {
    (): Promise<A>
  }

  export type FunkyReply<T> =
    | TaskEither<unknown, T>
    | Either<unknown, T>
    | Right<T>
    | Left
    | Task<T>
    | (() => FunkyReply<T>)

  interface TaskEither<E, A> extends Task<Either<E, A>> { }

  export const fastifyFunky: FastifyFunky
  export { fastifyFunky as default }
}

declare function fastifyFunky(...params: Parameters<FastifyFunky>): ReturnType<FastifyFunky>
export = fastifyFunky
