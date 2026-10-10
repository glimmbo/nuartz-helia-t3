"use client"

import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc"
import { useIpfsMarkdown } from "@/lib/use-ipfs-markdown"

export function IpfsMarkdown({ cid, path }: { cid: string; path?: string }) {
  const trpc = useTRPC()
  const md = useIpfsMarkdown(cid, { path })
  const rendered = useQuery(
    trpc.ipfs.render.queryOptions(
      { markdown: md.data?.markdown ?? "" },
      { enabled: !!md.data, staleTime: Infinity, gcTime: Infinity }
    )
  )

  if (md.isPending || (md.isSuccess && rendered.isPending)) return <p>Loading from IPFS...</p>
  if (md.isError) return <p role="alert">Error: {md.error.message}</p>
  if (rendered.isError) return <p role="alert">Error: {rendered.error.message}</p>
  return (
    <article
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: rendered.data.html }}
    />
  )
}
