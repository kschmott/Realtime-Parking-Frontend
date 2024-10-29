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
});
