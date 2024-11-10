import { authenticateUser } from "./_apiUtils.js";
import { rides } from '../drizzle/schema.js';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    const { pickupLocation, dropoffLocation, fare } = req.body;

    if (!pickupLocation || !dropoffLocation || !fare) {
      return res.status(400).json({ error: 'Pickup location, drop-off location, and fare are required' });
    }

    const sql = neon(process.env.NEON_DB_URL);
    const db = drizzle(sql);

    const result = await db
      .insert(rides)
      .values({
        userId: user.id,
        pickupLocation,
        dropoffLocation,
        fare,
        status: 'pending',
      })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error requesting ride:', error);
    res.status(500).json({ error: 'Error requesting ride' });
  }
}