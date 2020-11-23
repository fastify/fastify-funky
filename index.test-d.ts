import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fastify from "fastify";
import { expectType } from "tsd";

import { fastifyFunctionalResponse as fastifyFunctionalResponseNamed } from "./";
import fastifyFunctionalResponseDefault from "./";
import * as fastifyFunctionalResponseStar from "./";
import fastifyFunctionalResponseCjsImport = require("./");
const fastifyFunctionalResponseCjs = require("./");

const app: FastifyInstance = fastify();
app.register(fastifyFunctionalResponseNamed);
app.register(fastifyFunctionalResponseDefault);
app.register(fastifyFunctionalResponseCjs);
app.register(fastifyFunctionalResponseCjsImport.default);
app.register(fastifyFunctionalResponseCjsImport.fastifyFunctionalResponse);
app.register(fastifyFunctionalResponseStar.default);
app.register(fastifyFunctionalResponseStar.fastifyFunctionalResponse);

expectType<FastifyPluginCallback>(fastifyFunctionalResponseNamed);
expectType<FastifyPluginCallback>(fastifyFunctionalResponseDefault);
expectType<FastifyPluginCallback>(fastifyFunctionalResponseCjsImport.default);
expectType<FastifyPluginCallback>(
  fastifyFunctionalResponseCjsImport.fastifyFunctionalResponse
);
expectType<FastifyPluginCallback>(fastifyFunctionalResponseStar.default);
expectType<FastifyPluginCallback>(
  fastifyFunctionalResponseStar.fastifyFunctionalResponse
);
expectType<any>(fastifyFunctionalResponseCjs);
