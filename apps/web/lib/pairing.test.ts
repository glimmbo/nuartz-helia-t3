import { expect, test } from "vitest"
import { isValidPeerId } from "./pairing"

test("accepts ed25519 and legacy PeerIDs", () => {
  expect(isValidPeerId("12D3KooWGzxzKZYveHXtpG6AsrUJBcWxHBFS2HsEoGTxrMLvKXtf")).toBe(true)
  expect(isValidPeerId("QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN")).toBe(true)
})

test("rejects garbage", () => {
  expect(isValidPeerId("")).toBe(false)
  expect(isValidPeerId("hello world")).toBe(false)
  expect(isValidPeerId("12D3Koo0OIl")).toBe(false)
  expect(isValidPeerId("bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi")).toBe(false)
})

import { parsePairingAddress } from "./pairing"

const PEER = "12D3KooWGzxzKZYveHXtpG6AsrUJBcWxHBFS2HsEoGTxrMLvKXtf"

test("parsePairingAddress accepts browser-dialable multiaddrs with /p2p/", () => {
  const ws = `/ip4/127.0.0.1/tcp/4003/ws/p2p/${PEER}`
  expect(parsePairingAddress(ws)).toEqual({ peerId: PEER, address: ws })
  expect(parsePairingAddress(`/dns4/example.com/tcp/443/tls/ws/p2p/${PEER}`)?.peerId).toBe(PEER)
})

test("parsePairingAddress rejects raw TCP, missing peer id and junk", () => {
  expect(parsePairingAddress(`/ip4/127.0.0.1/tcp/4001/p2p/${PEER}`)).toBeNull()
  expect(parsePairingAddress("/ip4/127.0.0.1/tcp/4003/ws")).toBeNull()
  expect(parsePairingAddress(PEER)).toBeNull()
  expect(parsePairingAddress("/nonsense")).toBeNull()
})
