import { FastifyInstance } from "fastify";

export async function mealsRoutes(app: FastifyInstance) {
  app.post("/meals", async (request, reply) => {});
}
