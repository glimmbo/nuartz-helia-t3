// lib/helia.ts
import { createHelia } from "helia";
import type { HeliaWithLibp2p } from "@helia/libp2p";
import { loadOrCreateSelfKey } from "@libp2p/config";
import { PeerId } from "@libp2p/interface";
import { FsBlockstore } from "blockstore-fs";
import { FsDatastore } from "datastore-fs";
import qrcode from "qrcode";
import { Key } from "interface-datastore";

// Ensure global type safety for TypeScript
interface CustomNodeJSGlobal {
  helia?: HeliaWithLibp2p;
}

declare const globalThis: CustomNodeJSGlobal;

let heliaInstance: HeliaWithLibp2p;

export async function getHelia(): Promise<HeliaWithLibp2p> {
  // Reuse existing instance in development or production if it exists
  if (globalThis.helia) {
    return globalThis.helia;
  }

  // If no instance exists, create a new one
  if (!heliaInstance) {
    const blockstore = new FsBlockstore("./server/blockstore");
    const datastore = new FsDatastore("./server/datastore");

    const privateKey = await loadOrCreateSelfKey(datastore);

    const helia = createHelia({
      // WIP: connection, encryption, listen addrs, pubsub
      blockstore,
      datastore,
      libp2p: {
        privateKey,
      },
    });

    await helia.start();

    await helia.datastore.put(new Key("test"), Buffer.from("storage"));

    heliaInstance = helia;

    // Save to globalThis in development to persist across Hot Module Replacements (HMR)
    if (process.env.NODE_ENV !== "production") {
      globalThis.helia = heliaInstance;
    }
  }

  return heliaInstance;
}

export async function generatePairingQR(peerId: PeerId) {
  return qrcode.toString(peerId.toString(), { type: "terminal", small: true });
}
