import {
  pgEnum,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
  timestamp,
  index,
  integer,
  real,
  text,
} from "drizzle-orm/pg-core";

export const spots = pgTable("spots", {
  id: integer("id").primaryKey(), // user-defined integer ID, no auto-increment
  latitude: real("latitude").notNull(), // latitude of the spot, required
  longitude: real("longitude").notNull(), // longitude of the spot, required
  status: text("status").notNull(), // status as a string, required
  parkingLotName: text("parkingLotName")
  .references(() => lots.parkingLotName) // foreign key referencing spots.id
  .notNull(), // make it required if each lot must have an associated spot
});

export const lots = pgTable("lots", {
  parkingLotName: text("parkingLotName").primaryKey(), // name as a string, not required
  hours: text("hours").notNull(), // hours as a string, not required
  price: text("price").notNull(), // price as a string, not required
});
