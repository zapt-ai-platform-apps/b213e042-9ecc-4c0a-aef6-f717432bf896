import { authenticateUser } from "./_apiUtils.js";
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Fetch nearby drivers (mocked for simplicity)
    const drivers = [
      { id: 1, name: 'Driver A', latitude: latitude - 0.01, longitude: longitude + 0.01 },
      { id: 2, name: 'Driver B', latitude: latitude + 0.02, longitude: longitude - 0.02 },
    ];

    res.status(200).json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Error fetching drivers' });
  }
}