import fastify from "fastify";

const server = fastify();

server.get("/", async (request: any, reply: any) => {
  return 's'
});

server.listen({ port: 8000, host: '0.0.0.0' }, (err: any, address: any) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
});