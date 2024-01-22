import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const { name, email } = createUserBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 6 * 24 * 7, // 7 days
      });
    }

    await knex("users").insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
