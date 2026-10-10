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
