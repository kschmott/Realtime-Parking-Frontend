import { getAllSpots, updateSpots } from "@/db/spots"; // Import functions for fetching and updating spots
import { db } from "../../../db/db"; // Adjust the import based on your db connection
import { eq } from 'drizzle-orm'; // Import eq for querying

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", JSON.stringify(body, null, 2));

    // Decode Lora message to extract parking spot information
    const spots = decodeLoraMessage(body.uplink_message.decoded_payload.bytes);
    console.log("Decoded spots:", JSON.stringify(spots, null, 2));

    // Save the spots to the database using updateSpots function
    await updateSpots(spots);
    return new Response(JSON.stringify({ success: true, receivedBody: body }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ success: false, message: "Failed to update spots" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export type Spot = {
  id: number;
  status: string;
};

// Function to decode the Lora message and extract spot information
function decodeLoraMessage(bytes: Uint8Array): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    const id = byte >> 1; // Extract the parking spot ID (first 7 bits)
    const isOccupied = byte & 1; // Extract the occupied status (last bit)
    spots.push({ id, status: isOccupied ? "occupied" : "available" });
  }
  return spots;
}

export async function GET(req: Request) {
  try {
    const spots = await getAllSpots(); // Fetch all spots from the database
    console.log("Fetched spots:", spots);
    return new Response(JSON.stringify({ spots }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching spots:", error);
    return new Response(JSON.stringify({ success: false, message: "Failed to fetch spots" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
