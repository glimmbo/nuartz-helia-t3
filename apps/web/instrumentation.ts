export async function register() {
  // Helia uses Node APIs, so skip the edge runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getHelia, generatePairingQR } = await import("./server/helia-node");
    const helia = await getHelia();
    const pairingQR = await generatePairingQR(helia.libp2p.peerId);

    // WIP: need to send a token for the QR scanner to use in /api/register-director

    console.log(`\n\n`);
    console.log(pairingQR);
    console.log(`\n`);
    console.log(`PeerId: ${helia.libp2p.peerId.toString()}`);
  }
}
