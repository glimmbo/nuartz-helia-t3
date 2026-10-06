import { beforeEach, expect, test, vi } from "vitest"
import { ipfsMarkdownInput } from "./ipfs-input"

const verifiedFetch = vi.fn()
vi.mock("@helia/verified-fetch", () => ({ createVerifiedFetch: async () => verifiedFetch }))

import { fetchMarkdownFromCid, IpfsFetchError, MAX_MARKDOWN_BYTES } from "../server/helia"

const CID_V1 = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"

beforeEach(() => verifiedFetch.mockReset())

test("input validation accepts valid CIDs and rejects unsafe values", () => {
  expect(ipfsMarkdownInput.safeParse({ cid: CID_V1 }).success).toBe(true)
  expect(ipfsMarkdownInput.safeParse({ cid: CID_V1, path: "docs/a.md" }).success).toBe(true)
  expect(ipfsMarkdownInput.safeParse({ cid: "nope" }).success).toBe(false)
  expect(ipfsMarkdownInput.safeParse({ cid: CID_V1, path: "../x" }).success).toBe(false)
  expect(ipfsMarkdownInput.safeParse({ cid: CID_V1, path: "a/%2e%2e/x" }).success).toBe(false)
  expect(ipfsMarkdownInput.safeParse({ cid: CID_V1, path: "https://evil.com/x" }).success).toBe(false)
  expect(ipfsMarkdownInput.safeParse({ cid: CID_V1, path: "//evil.com/x" }).success).toBe(false)
})

test("fetchMarkdownFromCid returns markdown", async () => {
  verifiedFetch.mockResolvedValue(new Response("# Hi", { headers: { "content-type": "text/markdown" } }))
  const result = await fetchMarkdownFromCid(CID_V1, "/a.md")
  expect(verifiedFetch).toHaveBeenCalledWith(`ipfs://${CID_V1}/a.md`, expect.anything())
  expect(result).toEqual({ cid: CID_V1, path: "/a.md", markdown: "# Hi", contentType: "text/markdown" })
})

test("fetchMarkdownFromCid maps 404 and other failures", async () => {
  verifiedFetch.mockResolvedValue(new Response("", { status: 404 }))
  await expect(fetchMarkdownFromCid(CID_V1)).rejects.toMatchObject({ code: "NOT_FOUND" })
  verifiedFetch.mockResolvedValue(new Response("", { status: 500 }))
  await expect(fetchMarkdownFromCid(CID_V1)).rejects.toBeInstanceOf(IpfsFetchError)
})

test("fetchMarkdownFromCid enforces the size limit", async () => {
  verifiedFetch.mockResolvedValue(new Response("a".repeat(MAX_MARKDOWN_BYTES + 1)))
  await expect(fetchMarkdownFromCid(CID_V1)).rejects.toMatchObject({ code: "TOO_LARGE" })
})

test("fetchMarkdownFromCid reports timeouts", async () => {
  verifiedFetch.mockImplementation((_url: string, init: { signal: AbortSignal }) =>
    new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(new Error("aborted"))))
  )
  await expect(fetchMarkdownFromCid(CID_V1, undefined, { timeoutMs: 10 })).rejects.toMatchObject({ code: "TIMEOUT" })
})
