import { FastifyPluginCallback } from 'fastify'

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

declare function fastifyFunky (...params: Parameters<FastifyFunky>): ReturnType<FastifyFunky>
export = fastifyFunky
