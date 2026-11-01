import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { init } from "./helia-node";

const heliaNode = await init();

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(({ input }) => ({
      greeting: input?.name ? `Hello ${input.name}` : "Hello world",
    })),
  helloHelia: publicProcedure.query(async () => {
    await heliaNode.start();
    return { status: heliaNode.status, info: heliaNode.info };
  }),
  registerDirector: publicProcedure
    .input(z.object({ key: z.string() }).strict())
    .query(async ({ ctx, input, path, signal, batchIndex }) => {
      // clog
      console.log(`\n\n`);
      console.dir({ input }, { depth: 10 });
      console.log(`\n\n`);
    }),
});

export type AppRouter = typeof appRouter;
