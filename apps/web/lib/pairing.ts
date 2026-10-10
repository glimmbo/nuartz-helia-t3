import { base58btc } from "multiformats/bases/base58"
import { decode as decodeMultihash } from "multiformats/hashes/digest"

export const PAIRED_PEER_STORAGE_KEY = "nuartz:paired-peer-id"

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
