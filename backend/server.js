import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import seedJobs from './src/seed.js';

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  await seedJobs();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (error) {
  console.error('Failed to connect to the database:', error);
  process.exit(1); // Exit with failure code
}