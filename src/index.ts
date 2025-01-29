import fastify from "fastify";

// interface IQuerystring {
//     username: string;
//     password: string;
//   }
  
//   interface IHeaders {
//     'h-Custom': string;
//   }
  
//   interface IReply {
//     200: { success: boolean };
//     302: { url: string };
//     '4xx': { error: string };
//   }


const server = fastify();

server.get("/", async (request: any, reply: any) => {
  return 'rahsgfsdfds'
});

server.listen({ port: 8000, host: '0.0.0.0' }, (err: any, address: any) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
});