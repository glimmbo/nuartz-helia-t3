import { multiaddr } from "@multiformats/multiaddr"
import type { createHelia } from "helia"

type BrowserHelia = Awaited<ReturnType<typeof createHelia>>

const globalForHelia = globalThis as unknown as { __nuartzBrowserHelia?: Promise<BrowserHelia> }

/** Lazily creates a single in-browser Helia node (client-side only). */
export function getBrowserHelia(): Promise<BrowserHelia> {
  if (!globalForHelia.__nuartzBrowserHelia) {
    globalForHelia.__nuartzBrowserHelia = import("helia")
      .then(({ createHelia }) => createHelia())
      .catch((error) => {
        globalForHelia.__nuartzBrowserHelia = undefined
        throw error
      })
  }
  return globalForHelia.__nuartzBrowserHelia
}

/** Dials the paired Kubo node and resolves once the connection is open. */
export async function dialPairedNode(address: string, signal?: AbortSignal): Promise<void> {
  const helia = await getBrowserHelia()
  await helia.libp2p.dial(multiaddr(address), { signal })
}

/** True while the libp2p node has an open connection to the given peer. */
export async function isConnectedTo(peerId: string): Promise<boolean> {
  const helia = await getBrowserHelia()
  return helia.libp2p.getConnections().some((c) => c.remotePeer.toString() === peerId && c.status === "open")
}
