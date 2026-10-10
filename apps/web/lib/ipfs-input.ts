import { CID } from "multiformats/cid"
import { z } from "zod"

export function isValidCid(value: string): boolean {
  try {
    CID.parse(value)
    return true
  } catch {
    return false
  }
}

export function isSafeIpfsPath(value: string): boolean {
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("//")) return false
  if (/[\\?#\0]/.test(value)) return false
  let decoded: string
  try {
    decoded = decodeURIComponent(value)
  } catch {
    return false
  }
  return !decoded.split(/[\\/]/).includes("..")
}

export const ipfsMarkdownInput = z.object({
  cid: z.string().refine(isValidCid, { message: "Invalid CID" }),
  path: z
    .string()
    .max(1024)
    .refine(isSafeIpfsPath, { message: "Invalid path" })
    .optional(),
})
