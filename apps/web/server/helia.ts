import type { VerifiedFetch } from "@helia/verified-fetch"

export const MAX_MARKDOWN_BYTES = 2 * 1024 * 1024
const DEFAULT_TIMEOUT_MS = 30_000

export type IpfsFetchErrorCode = "NOT_FOUND" | "TIMEOUT" | "TOO_LARGE" | "FETCH_FAILED"

export class IpfsFetchError extends Error {
  constructor(public code: IpfsFetchErrorCode, message: string) {
    super(message)
    this.name = "IpfsFetchError"
  }
}

const globalForHelia = globalThis as unknown as {
  __nuartzVerifiedFetch?: Promise<VerifiedFetch>
}

export function getVerifiedFetch(): Promise<VerifiedFetch> {
  if (!globalForHelia.__nuartzVerifiedFetch) {
    globalForHelia.__nuartzVerifiedFetch = import("@helia/verified-fetch")
      .then(({ createVerifiedFetch }) => createVerifiedFetch())
      .catch((error) => {
        globalForHelia.__nuartzVerifiedFetch = undefined
        throw error
      })
  }
  return globalForHelia.__nuartzVerifiedFetch
}

async function readLimited(response: Response, limit: number): Promise<string> {
  const declared = Number(response.headers.get("content-length"))
  if (Number.isFinite(declared) && declared > limit) {
    throw new IpfsFetchError("TOO_LARGE", `Content exceeds ${limit} bytes`)
  }
  if (!response.body) return ""
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > limit) {
      await reader.cancel()
      throw new IpfsFetchError("TOO_LARGE", `Content exceeds ${limit} bytes`)
    }
    chunks.push(value)
  }
  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(merged)
}

export async function fetchMarkdownFromCid(
  cid: string,
  path?: string,
  opts: { signal?: AbortSignal; timeoutMs?: number } = {}
): Promise<{ cid: string; path: string | undefined; markdown: string; contentType: string | null }> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const timeout = AbortSignal.timeout(timeoutMs)
  const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout
  const cleanPath = path?.replace(/^\/+/, "")
  const url = `ipfs://${cid}${cleanPath ? `/${cleanPath}` : ""}`

  try {
    const verifiedFetch = await getVerifiedFetch()
    const response = await verifiedFetch(url, { signal })
    if (response.status === 404) {
      throw new IpfsFetchError("NOT_FOUND", `Content not found: ${url}`)
    }
    if (!response.ok) {
      throw new IpfsFetchError("FETCH_FAILED", `IPFS fetch failed with status ${response.status}: ${url}`)
    }
    const markdown = await readLimited(response, MAX_MARKDOWN_BYTES)
    return { cid, path, markdown, contentType: response.headers.get("content-type") }
  } catch (error) {
    if (error instanceof IpfsFetchError) throw error
    if (timeout.aborted) {
      throw new IpfsFetchError("TIMEOUT", `Timed out after ${timeoutMs}ms fetching ${url}`)
    }
    if (opts.signal?.aborted) throw error
    throw new IpfsFetchError(
      "FETCH_FAILED",
      `Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
