import { getAllSpots, updateSpots } from "@/db/spots";

export async function POST(req: Request) {
  const body = await req.json();
  console.log(JSON.stringify(body, null, 2));
  const spots = decodeLoraMessage(body.uplink_message.decoded_payload.bytes);
  console.log(JSON.stringify(spots, null, 2));
  // Save the spots to the database
  await updateSpots(spots);
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
  const set = new Set(bytes);
  const dedupedBytes = Array.from(set);
  const spots: Spot[] = [];
  for (let i = 0; i < dedupedBytes.length; i++) {
    const byte = dedupedBytes[i];
    const id = byte >> 1;
    const isOccupied = byte & 1;
    spots.push({ id, status: isOccupied ? "occupied" : "available" });
  }
  return spots.filter((spot) => spot.id !== 0);
}

export async function GET(req: Request) {
  const spots = await getAllSpots();
  console.log(spots);
  return Response.json({
    spots,
  });
}
