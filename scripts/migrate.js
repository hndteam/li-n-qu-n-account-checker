import 'dotenv/config';
import { initDB } from '../backend/db/connection.js';
import { User } from '../backend/models/mongo/User.js';

async function migrate() {
  try {
    console.log('Starting migration...');
    await initDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('✓ Admin user already exists:', adminEmail);
    } else {
      const admin = new User({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        profile: { name: 'Administrator' }
      });

      await admin.save();
      console.log('✓ Admin user created:', adminEmail);
      console.log('✓ Password:', adminPassword);
    }

    console.log('✓ Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
