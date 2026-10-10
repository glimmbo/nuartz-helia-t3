"use client"

import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc"

export function useIpfsMarkdown(
  cid: string | undefined,
  { path, enabled = true }: { path?: string; enabled?: boolean } = {}
) {
  const trpc = useTRPC()
  return useQuery(
    trpc.ipfs.markdown.queryOptions(
      { cid: cid ?? "", path },
      {
        enabled: !!cid && enabled,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: (failureCount, error) =>
          failureCount < 2 &&
          error.data?.code !== "BAD_REQUEST" &&
          error.data?.code !== "NOT_FOUND",
      }
    )
  )
}
