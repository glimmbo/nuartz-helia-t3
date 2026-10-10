"use client"

import { useEffect, useState } from "react"
import { isValidPeerId, PAIRED_PEER_STORAGE_KEY } from "@/lib/pairing"

export function NodePairing() {
  const [ready, setReady] = useState(false)
  const [pairedPeerId, setPairedPeerId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setPairedPeerId(localStorage.getItem(PAIRED_PEER_STORAGE_KEY))
    } catch {}
    setReady(true)
  }, [])

  if (!ready) return null

  if (pairedPeerId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3" role="status">
          <span className="inline-block size-3 rounded-full bg-green-500" aria-hidden />
          <span className="font-medium">Paired</span>
        </div>
        <p className="text-sm break-all font-mono">{pairedPeerId}</p>
        <button
          type="button"
          className="text-sm underline"
          onClick={() => {
            try {
              localStorage.removeItem(PAIRED_PEER_STORAGE_KEY)
            } catch {}
            setPairedPeerId(null)
            setInput("")
          }}
        >
          Unpair
        </button>
      </div>
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        const id = input.trim()
        if (!isValidPeerId(id)) {
          setError("Enter a valid PeerID (e.g. 12D3Koo...)")
          return
        }
        try {
          localStorage.setItem(PAIRED_PEER_STORAGE_KEY, id)
        } catch {}
        setError(null)
        setPairedPeerId(id)
      }}
    >
      <label className="block text-sm font-medium" htmlFor="peer-id">
        PeerID of your Kubo node
      </label>
      <input
        id="peer-id"
        className="w-full rounded border bg-background px-3 py-2 font-mono text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="12D3Koo..."
        autoComplete="off"
        spellCheck={false}
      />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button type="submit" className="rounded border px-4 py-2 text-sm font-medium">
        Pair
      </button>
    </form>
  )
}
