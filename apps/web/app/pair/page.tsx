import { NodePairing } from "@/components/node-pairing"

export default function PairPage() {
  return (
    <div className="px-6 py-8 max-w-xl mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-4">Pair with a node</h1>
      <NodePairing />
    </div>
  )
}
