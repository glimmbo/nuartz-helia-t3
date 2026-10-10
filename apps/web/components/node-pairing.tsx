"use client"

import { useCallback, useEffect, useState } from "react"
import { dialPairedNode, isConnectedTo } from "@/lib/helia-client"
import { PAIRED_ADDR_STORAGE_KEY, PAIRED_PEER_STORAGE_KEY, parsePairingAddress } from "@/lib/pairing"

type Status = "connecting" | "connected" | "disconnected"

const DIAL_TIMEOUT_MS = 20_000
const POLL_MS = 5_000

const dot: Record<Status, { color: string; label: string }> = {
  connecting: { color: "bg-yellow-500", label: "Connecting..." },
  connected: { color: "bg-green-500", label: "Paired" },
  disconnected: { color: "bg-red-500", label: "Disconnected" },
}

function PairedStatus({
  peerId,
  address,
  onUnpair,
}: {
  peerId: string
  address: string
  onUnpair: () => void
}) {
  const [status, setStatus] = useState<Status>("connecting")
  const [error, setError] = useState<string | null>(null)

  const dial = useCallback(
    async (signal: AbortSignal) => {
      setStatus("connecting")
      setError(null)
      try {
        await dialPairedNode(address, AbortSignal.any([signal, AbortSignal.timeout(DIAL_TIMEOUT_MS)]))
        if (!signal.aborted) setStatus("connected")
      } catch (e) {
        if (signal.aborted) return
        setError(e instanceof Error ? e.message : String(e))
        setStatus("disconnected")
      }
    },
    [address]
  )

  useEffect(() => {
    const controller = new AbortController()
    void dial(controller.signal)
    return () => controller.abort()
  }, [dial])

  useEffect(() => {
    if (status !== "connected") return
    const id = setInterval(() => {
      isConnectedTo(peerId)
        .then((ok) => {
          if (!ok) setStatus("disconnected")
        })
        .catch(() => setStatus("disconnected"))
    }, POLL_MS)
    return () => clearInterval(id)
  }, [status, peerId])

  const { color, label } = dot[status]
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3" role="status">
        <span className={`inline-block size-3 rounded-full ${color}`} aria-hidden />
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-sm break-all font-mono">{peerId}</p>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-4 text-sm">
        {status === "disconnected" && (
          <button type="button" className="underline" onClick={() => void dial(new AbortController().signal)}>
            Retry
          </button>
        )}
        <button type="button" className="underline" onClick={onUnpair}>
          Unpair
        </button>
      </div>
    </div>
  )
}

export function NodePairing() {
  const [ready, setReady] = useState(false)
  const [paired, setPaired] = useState<{ peerId: string; address: string } | null>(null)
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const peerId = localStorage.getItem(PAIRED_PEER_STORAGE_KEY)
      const address = localStorage.getItem(PAIRED_ADDR_STORAGE_KEY)
      if (peerId && address) setPaired({ peerId, address })
    } catch {}
    setReady(true)
  }, [])

  if (!ready) return null

  if (paired) {
    return (
      <PairedStatus
        peerId={paired.peerId}
        address={paired.address}
        onUnpair={() => {
          try {
            localStorage.removeItem(PAIRED_PEER_STORAGE_KEY)
            localStorage.removeItem(PAIRED_ADDR_STORAGE_KEY)
          } catch {}
          setPaired(null)
          setInput("")
        }}
      />
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        const parsed = parsePairingAddress(input)
        if (!parsed) {
          setError(
            "Enter a browser-dialable multiaddr ending in /p2p/<PeerID>, e.g. /ip4/127.0.0.1/tcp/4003/ws/p2p/12D3Koo..."
          )
          return
        }
        try {
          localStorage.setItem(PAIRED_PEER_STORAGE_KEY, parsed.peerId)
          localStorage.setItem(PAIRED_ADDR_STORAGE_KEY, parsed.address)
        } catch {}
        setError(null)
        setPaired(parsed)
      }}
    >
      <label className="block text-sm font-medium" htmlFor="peer-addr">
        Multiaddr of your Kubo node
      </label>
      <input
        id="peer-addr"
        className="w-full rounded border bg-background px-3 py-2 font-mono text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="/ip4/127.0.0.1/tcp/4003/ws/p2p/12D3Koo..."
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
