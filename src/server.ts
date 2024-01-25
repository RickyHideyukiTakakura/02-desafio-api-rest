import { app } from "./app";
import { env } from "./env";

const PORT = 3333;

app
  .listen({
    port: env.PORT,
  })
  .then(() => console.log(`Listening on ${PORT}`));
