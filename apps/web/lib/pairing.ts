import { base58btc } from "multiformats/bases/base58"
import { decode as decodeMultihash } from "multiformats/hashes/digest"
import { multiaddr, type Multiaddr } from "@multiformats/multiaddr"

export const PAIRED_PEER_STORAGE_KEY = "nuartz:paired-peer-id"
export const PAIRED_ADDR_STORAGE_KEY = "nuartz:paired-multiaddr"

/** Validates a libp2p PeerID string (base58btc multihash, e.g. `12D3Koo...` or `Qm...`). */
export function isValidPeerId(value: string): boolean {
  const id = value.trim()
  if (!id || id.length > 128) return false
  try {
    const bytes = base58btc.baseDecode(id)
    const digest = decodeMultihash(bytes)
    return digest.bytes.length === bytes.length
  } catch {
    return false
  }
}

const BROWSER_TRANSPORTS = ["ws", "wss", "tls", "webtransport", "webrtc-direct", "webrtc"]

/**
 * Parses a Kubo multiaddr such as `/ip4/127.0.0.1/tcp/4003/ws/p2p/12D3Koo...`.
 * Returns the peer id and normalized address, or null when it is not dialable
 * from a browser (browsers cannot open raw TCP/QUIC connections) or lacks /p2p/.
 */
export function parsePairingAddress(value: string): { peerId: string; address: string } | null {
  const address = value.trim()
  if (!address.startsWith("/")) return null
  let ma: Multiaddr
  try {
    ma = multiaddr(address)
  } catch {
    return null
  }
  const parts = ma.getComponents()
  const peer = parts.find((c) => c.name === "p2p")
  if (!peer?.value || !isValidPeerId(peer.value)) return null
  if (!parts.some((c) => BROWSER_TRANSPORTS.includes(c.name))) return null
  return { peerId: peer.value, address: ma.toString() }
}
