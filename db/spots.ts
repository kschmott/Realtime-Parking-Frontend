import { Spot } from "@/app/api/spots/route";
import { db } from "./db";
import { spots as SpotsTable } from "./schema";
import { inArray, sql } from "drizzle-orm";

export const saveSpots = async (spots: Spot[]) => {
  // Extract the spot IDs from the provided spots array
  const spotIds = spots.map((spot) => spot.id);

  // Start a transaction
  await db.transaction(async (tx) => {
    // Get existing spots from the database
    const existingSpots = await tx
      .select()
      .from(SpotsTable)
      .where(inArray(SpotsTable.id, spotIds));

    // Get the IDs of existing spots
    const existingSpotIds = new Set(existingSpots.map((spot) => spot.id));

    // Filter spots that exist in the database
    const spotsToUpdate = spots.filter((spot) => existingSpotIds.has(spot.id));

    // If there are spots to update
    if (spotsToUpdate.length > 0) {
      await tx.execute(
        sql`
          UPDATE ${SpotsTable}
          SET status = CASE
            ${sql.join(
              spotsToUpdate.map(
                (spot) =>
                  sql`WHEN ${SpotsTable.id} = ${spot.id} THEN ${spot.status}`
              ),
              " "
            )}
            ELSE status
          END
          WHERE ${SpotsTable.id} IN (${sql.join(spotIds)});
        `
      );
    }
  });
};
