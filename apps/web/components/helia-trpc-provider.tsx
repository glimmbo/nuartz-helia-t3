// WIP review and test
import React, { useMemo, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact, TRPCClientError } from "@trpc/react-query";
import type { AppRouter } from "@/server/router";
import { pipe } from "it-pipe";
import * as lp from "it-length-prefixed";

// Create your React-specific tRPC hooks
export const trpc = createTRPCReact<AppRouter>();

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// The Custom Link function adapted for React
const createLibp2pLink = (clientNode: any, targetPeerId: any) => () => {
  return ({ op }: any) => {
    return {
      subscribe(observer: any) {
        let isCancelled = false;

        (async () => {
          try {
            if (isCancelled) return;
            const stream = await clientNode.dialProtocol(
              targetPeerId,
              "/trpc/1.0.0",
            );

            const payload = JSON.stringify({
              id: op.id,
              method: op.type,
              path: op.path,
              input: op.input,
            });

            await pipe(
              [encoder.encode(payload)],
              lp.encode(),
              stream,
              lp.decode(),
              async function (source) {
                for await (const chunk of source) {
                  if (isCancelled) break;
                  const rawStr = decoder.decode(
                    chunk instanceof Uint8Array ? chunk : chunk.subarray(),
                  );
                  const response = JSON.parse(rawStr);

                  observer.next({
                    context: {},
                    result: { data: response.result },
                  });
                  observer.complete();
                }
              },
            );
          } catch (err: any) {
            if (!isCancelled) {
              observer.error(TRPCClientError.from(err));
            }
          }
        })();

        return () => {
          isCancelled = true;
        };
      },
    };
  };
};

interface P2PProviderProps {
  libp2pNode: any; // Your initialized client-side js-libp2p node
  serverPeerId: any; // The destination PeerId string/object of your tRPC server
  children: React.ReactNode;
}

export function TRPCLibp2pProvider({
  libp2pNode,
  serverPeerId,
  children,
}: P2PProviderProps) {
  const queryClient = useMemo(() => new QueryClient(), []);

  // Initialize the tRPC client only when the nodes are passed/ready
  const trpcClient = useMemo(() => {
    return trpc.createClient({
      links: [createLibp2pLink(libp2pNode, serverPeerId)],
    });
  }, [libp2pNode, serverPeerId]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
