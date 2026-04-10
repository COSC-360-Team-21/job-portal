import User from './models/User.js';

// This script seeds an admin user if one doesn't already exist.
// Only for development/testing purposes. In production, admin users should be created securely.

export default async function seedAdmin() {
  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin user already exists — skipping seed.');
    return;
  }

  await User.create({
    name: 'Admin',
    email: 'admin@jobportal.dev',
    password: 'admin1234',
    role: 'admin',
  });

  console.log('Admin user seeded: admin@jobportal.dev / admin1234');
}
