import Fastify from "fastify";
import cors from '@fastify/cors'

const server = Fastify();
server.register(cors, {
  origin: (origin, cb) => {
    if (!origin) {
      cb(new Error("Origin is undefined"), false);
      return;
    }
    const hostname = new URL(origin).hostname;
    console.log(hostname)
    if(hostname === "localhost"){
      //  Request from localhost will pass
      cb(null, true)
      return
    }
    // Generate an error on other origins, disabling access
    cb(new Error("Not allowed"), false)
  }})

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