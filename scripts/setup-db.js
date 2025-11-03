const { execSync } = require('child_process');
const path = require('path');

console.log('Setting up database...');

try {
  // Install dependencies if not already installed
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Run database migrations
  console.log('Running database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

  // Seed the database if seed file exists
  try {
    const seedPath = path.join(__dirname, '..', 'prisma', 'seed.js');
    if (require('fs').existsSync(seedPath)) {
      console.log('Seeding database...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
    }
  } catch (error) {
    console.warn('Warning: Could not seed database:', error.message);
  }

  console.log('✅ Database setup completed successfully!');
} catch (error) {
  console.error('❌ Error setting up database:', error.message);
  process.exit(1);
}
