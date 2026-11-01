import { createHelia } from "helia";
import { randomUUIDv7 } from "crypto";
import QRCode from "qrcode";

export async function init() {
  const heliaNode = createHelia();
  await heliaNode.start();

  // I want to generate a token appended to a url
  // that is displayed as a qr in the terminal

  const token = randomUUIDv7();
  const peerId = heliaNode.libp2p.peerId;

  // clog
  console.log(`\n\n`);
  console.dir(
    { ...heliaNode.info, peerId: peerId.toString(), token },
    { depth: 10 },
  );
  console.log(`\n\n`);

  const searchParams = new URLSearchParams({
    token,
    peerId: peerId.toString(),
  });

  const url = new URL(`localhost:3000/${peerId.toString()}/register-director`);

  url.search = searchParams.toString();

  const qrURL = await QRCode.toString(url.toString(), {
    type: "terminal",
    small: true,
  });

  console.log(qrURL);

  return heliaNode;
}
