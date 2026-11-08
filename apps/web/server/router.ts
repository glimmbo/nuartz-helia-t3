import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { getHelia } from "./helia-node";
import { Key } from "interface-datastore";

const anotherRouter = router({
  stuff: publicProcedure.input(z.string()).query(({ input }) => {
    const message = `Hello ${input}`;

    return message;
  }),
});

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(({ input }) => ({
      greeting: input?.name ? `Hello ${input.name}` : "Hello world",
    })),

  helloHelia: publicProcedure.query(async () => {
    const heliaNode = await getHelia();
    const key = (await heliaNode.datastore.get(new Key("test"))).toString();
    return { status: heliaNode.status, info: heliaNode.info, key };
  }),

  registerDirector: publicProcedure
    .input(z.object({ key: z.string() }).strict())
    .query(async ({ ctx, input, path, signal, batchIndex }) => {
      // WIP: key generation, pairing 'lock in', show paired PeerID in console

      // clog
      console.log(`\n\n`);
      console.dir({ input }, { depth: 10 });
      console.log(`\n\n`);
      return {};
    }),

  otherRoute: anotherRouter,
});

export type AppRouter = typeof appRouter;
