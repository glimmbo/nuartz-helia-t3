import { getHelia } from "@/server/helia-node";
import { Key } from "interface-datastore";
import { NextResponse } from "next/server";

// TEST: api routes vs tRPC router
// If I needed to tweak/manage anything on the server node (while it's running)
// I could have admin routes here.. or just have it all in-app, and stick with tRPC

export async function GET() {
  const helia = await getHelia();

  const exists = await helia.datastore.has(new Key("test"));

  return NextResponse.json({
    hello: "world",
    helia: helia.libp2p.peerId.toString(),
    exists,
  });
}
