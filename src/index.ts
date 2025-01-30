import Fastify from "fastify";
import cors from '@fastify/cors'

const server = Fastify();
server.register(cors, {
  origin: true
  })

server.get("/", async (request: any, reply: any) => {
  return { message: 'srrerererae' }
});

server.listen({ port: 8000, host: '0.0.0.0' }, (err: any, address: any) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
});