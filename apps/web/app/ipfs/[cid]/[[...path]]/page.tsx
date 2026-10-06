import { IpfsMarkdown } from "@/components/ipfs-markdown"

export default async function IpfsPage({
  params,
}: {
  params: Promise<{ cid: string; path?: string[] }>
}) {
  const { cid, path } = await params
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto w-full">
      <IpfsMarkdown cid={cid} path={path?.join("/")} />
    </div>
  )
}
