import { pgTable, serial, text, timestamp, uuid, decimal } from 'drizzle-orm/pg-core';

export const rides = pgTable('rides', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  driverId: uuid('driver_id'),
  pickupLocation: text('pickup_location').notNull(),
  dropoffLocation: text('dropoff_location').notNull(),
  fare: decimal('fare', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull(), // pending, accepted, completed, canceled
  createdAt: timestamp('created_at').defaultNow(),
});