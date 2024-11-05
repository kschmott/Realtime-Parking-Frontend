import { clearAndSetSpots } from "@/db/spots";
import { getAllLots, addNewLot } from "@/db/lots"; // Import necessary functions
import { db } from "../../../db/db"; // Adjust the import based on where your db connection is defined
import { lots } from "../../../db/schema"; // Adjust the import based on where your db connection is defined
import { NextResponse } from "next/server";
import { eq } from 'drizzle-orm';

// POST handler to add or fetch lots
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if body contains valid JSON
    if (!body) {
      return NextResponse.json(
        { success: false, message: "Request body is missing or invalid" },
        { status: 400 }
      );
    }

    if (body.spots) {
      // Clear and set spots if `spots` array is provided
      await clearAndSetSpots(body.spots);
      return NextResponse.json({ success: true });
    } else if (body.parkingLotName && body.hours && body.price) {
      // Check if the lot exists directly within the handler
      const existingLots = await db.query.lots.findMany({
        where: eq(lots.parkingLotName, body.parkingLotName)
      });

      if (existingLots.length > 0) { // Use length check for existing lots
        return NextResponse.json({
          success: false,
          message: "Lot already exists",
        }, { status: 409 }); // Conflict status code
      }

      // Add new lot if it does not exist
      await addNewLot(body.parkingLotName, body.hours, body.price);
      return NextResponse.json({
        success: true,
        message: "New lot added successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid input data" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET handler for fetching all lots
export async function GET() {
  try {
    const lots = await getAllLots();
    return NextResponse.json({ lots });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
