import { FastifyInstance } from "fastify";
import { InMemoryRunner } from "@google/adk";
import { registerHomeRoute } from "./home";

export function registerRoutes(fastify: FastifyInstance, runner: InMemoryRunner) {
    registerHomeRoute(fastify, runner);

    // Add future routes here
}
