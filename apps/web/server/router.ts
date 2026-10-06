import { z } from "zod"
import { publicProcedure, router } from "./trpc"

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(({ input }) => ({
      greeting: input?.name ? `Hello ${input.name}` : "Hello world",
    })),
})

export type AppRouter = typeof appRouter
