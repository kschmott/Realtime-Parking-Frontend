import { saveSpots } from "@/db/spots";

export async function POST(req: Request) {
  const body = await req.json();
  console.log(JSON.stringify(body, null, 2));
  const spots = decodeLoraMessage(body.uplink_message.decoded_payload.bytes);
  console.log(JSON.stringify(spots, null, 2));
  // Save the spots to the database
  await saveSpots(spots);
  return Response.json({
    receivedBody: body,
  });
}

export type Spot = {
  id: number;
  status: string;
};

function decodeLoraMessage(bytes: Uint8Array) {
  // First 7 bits is the parking spot id
  // Next 1 bit is the occupied status
  const spots: Spot[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    const id = byte >> 1;
    const isOccupied = byte & 1;
    spots.push({ id, status: isOccupied ? "occupied" : "free" });
  }
  return spots;
}
