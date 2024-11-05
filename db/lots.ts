// /db/lots.ts
import { db } from "./db";
import { lots as LotsTable } from "./schema";

export async function getAllLots() {
  const lots = await db.select().from(LotsTable);
  return lots;
}


// Function to add a new lot
export async function addNewLot(parkingLotName: string, hours: string, price: string) {
  await db.insert(LotsTable).values({
    parkingLotName,
    hours,
    price,
  });
}
