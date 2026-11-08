// WIP: review, bring in existing router
import type { Libp2p } from "@libp2p/interface";
import { pipe } from "it-pipe";
import * as lp from "it-length-prefixed";
import { map } from "streaming-iterables";

import type { AppRouter } from "./router";

export const TRPC_PROTOCOL = "/trpc/1.0.0";

// Native standard utilities available everywhere
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function createTRPCServerListener(node: Libp2p, router: AppRouter) {
  node.handle(TRPC_PROTOCOL, async ({ stream }) => {
    try {
      await pipe(
        stream.source,
        lp.decode(),
        map(async (buf) => {
          // Decode standard Uint8Array directly into a string
          const rawStr = decoder.decode(
            buf instanceof Uint8Array ? buf : buf.subarray(),
          );
          const { id, method, path, input } = JSON.parse(rawStr);

          const caller = router.createCaller({});
          let result;
          if (method === "query") {
            result = await caller[path](input);
          } else {
            throw new Error(`Unsupported tRPC method type: ${method}`);
          }

          const responsePayload = JSON.stringify({ id, result });
          // Encode string back into standard Uint8Array
          return encoder.encode(responsePayload);
        }),
        lp.encode(),
        stream.sink,
      );
    } catch (err) {
      console.error("tRPC libp2p stream error:", err);
    }
  });
}
