import { Spot } from "@/app/api/spots/route";
import { db } from "./db";
import { spots as SpotsTable } from "./schema";
import { Spot as LabledSpot } from "@/app/spot-marker/types";
import { inArray, sql, eq } from "drizzle-orm";

export const updateSpots = async (spots: Spot[]) => {
  // Extract the spot IDs from the provided spots array
  const spotIds = spots.map((spot) => spot.id);
  console.log("Spot IDs", spotIds);
  // Start a transaction
  await db.transaction(async (tx) => {
    // Get existing spots from the database
    const existingSpots = await tx
      .select()
      .from(SpotsTable)
      .where(inArray(SpotsTable.id, spotIds));

    // Get the IDs of existing spots
    const existingSpotIds = new Set(existingSpots.map((spot) => spot.id));
    console.log("Existing spot IDs", existingSpotIds);
    // Filter spots that exist in the database
    const spotsToUpdate = spots.filter((spot) => existingSpotIds.has(spot.id));
    console.log("Spots to update", spotsToUpdate);
    // Update each spot individually
    for (const spot of spotsToUpdate) {
      console.log("Updating spot", spot.id, "to", spot.status);
      await tx
        .update(SpotsTable)
        .set({
          status: spot.status,
        })
        .where(eq(SpotsTable.id, spot.id));
    }
  });
};

export async function clearAndSetSpots(spots: LabledSpot[]) {
  // Extract spot IDs from the provided spots array
  const spotIds = spots.map((spot) => spot.id);

  // Start a transaction
  await db.transaction(async (tx) => {
    // Clear existing spots that match the input spot IDs
    await tx.delete(SpotsTable).where(inArray(SpotsTable.id, spotIds));

    // Prepare the new spots for insertion
    const newSpots = spots.map((spot) => ({
      id: spot.id,
      latitude: spot.location?.lat || 0, // Use default value if location is null
      longitude: spot.location?.lng || 0, // Use default value if location is null
      status: "available", // Default status for new spots
    }));

    // Insert new spots into the table
    if (newSpots.length > 0) {
      await tx.insert(SpotsTable).values(newSpots);
    }
  });
}

export async function getAllSpots() {
  return await db.query.spots.findMany();
}
