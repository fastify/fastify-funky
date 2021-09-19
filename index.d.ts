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
    ): void | Promise<RouteGeneric['Reply'] | void> | FunkyReply<RouteGeneric['Reply']>
  }
}

declare const fastifyFunky: FastifyPluginCallback
declare type FunkyReply<T> =
  | TaskEither<unknown, T>
  | Either<unknown, T>
  | Right<T>
  | Left
  | Task<T>
  | (() => FunkyReply<T>)

declare interface Left<E = unknown> {
  readonly left: E
}

declare interface Right<A> {
  readonly right: A
}

declare type Either<E, A> = Left<E> | Right<A>

declare interface Task<A> {
  (): Promise<A>
}

declare interface TaskEither<E, A> extends Task<Either<E, A>> {}

export default fastifyFunky
export { fastifyFunky, FunkyReply, Left, Right, Either, Task, TaskEither }
