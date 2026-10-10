import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { renderMarkdown } from "nuartz/markdown"
import { ipfsMarkdownInput } from "@/lib/ipfs-input"
import { fetchMarkdownFromCid, IpfsFetchError, MAX_MARKDOWN_BYTES } from "./helia"
import { publicProcedure, router } from "./trpc"

const ipfsErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  TIMEOUT: "TIMEOUT",
  TOO_LARGE: "PAYLOAD_TOO_LARGE",
  FETCH_FAILED: "INTERNAL_SERVER_ERROR",
} as const

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(({ input }) => ({
      greeting: input?.name ? `Hello ${input.name}` : "Hello world",
    })),
  ipfs: router({
    markdown: publicProcedure.input(ipfsMarkdownInput).query(async ({ input, signal }) => {
      try {
        return await fetchMarkdownFromCid(input.cid, input.path, { signal })
      } catch (error) {
        if (error instanceof IpfsFetchError) {
          throw new TRPCError({ code: ipfsErrorCodes[error.code], message: error.message, cause: error })
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          cause: error,
        })
      }
    }),
    render: publicProcedure
      .input(z.object({ markdown: z.string().max(MAX_MARKDOWN_BYTES) }))
      .query(async ({ input }) => {
        const { html, frontmatter, toc } = await renderMarkdown(input.markdown)
        return { html, frontmatter, toc }
      }),
  }),
})

export type AppRouter = typeof appRouter
