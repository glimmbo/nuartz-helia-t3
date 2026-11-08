import { lpStream } from "@libp2p/utils";
import { TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { Libp2p } from "@libp2p/interface";
import type { PeerId } from "@libp2p/interface";
import type { Multiaddr } from "@multiformats/multiaddr";
import type { AppRouter } from "./router";
import type { TrpcRequestFrame, TrpcResponseFrame } from "./helia-router";

const TRPC_PROTOCOL = "/nuartz/trpc/1.0.0";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Browser-safe tRPC link that sends each call over a fresh libp2p stream
 * (the muxer multiplexes them) to `target`. Queries and mutations only.
 */
export function heliaLink(opts: {
  libp2p: Libp2p;
  target: PeerId | Multiaddr | Multiaddr[];
}): TRPCLink<AppRouter> {
  return () =>
    ({ op }) =>
      observable((emit) => {
        const abort = new AbortController();

        (async () => {
          if (op.type === "subscription") {
            throw new Error("Subscriptions are not supported over helia");
          }
          const stream = await opts.libp2p.dialProtocol(
            opts.target,
            TRPC_PROTOCOL,
            { signal: abort.signal },
          );
          const lp = lpStream(stream);
          const frame: TrpcRequestFrame = {
            type: op.type,
            path: op.path,
            input: op.input,
          };
          await lp.write(encoder.encode(JSON.stringify(frame)));
          const raw = await lp.read({ signal: abort.signal });
          await stream.close().catch(() => {});
          const res = JSON.parse(decoder.decode(raw.subarray())) as TrpcResponseFrame;

          if (!res.ok) throw new Error(`${res.error.code}: ${res.error.message}`);
          emit.next({ result: { type: "data", data: res.data } });
          emit.complete();
        })().catch((cause) => emit.error(TRPCClientError.from(cause)));

        return () => abort.abort();
      });
}
