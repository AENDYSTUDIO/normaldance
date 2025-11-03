const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Ensure .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, '# Auto-generated environment variables\n');
  console.log('Created .env file');
}

// Generate random secrets
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// Read existing .env file
let envContent = fs.existsSync(envPath) 
  ? fs.readFileSync(envPath, 'utf-8')
  : '';

// Define required environment variables
const requiredVars = {
  // Database
  'DATABASE_URL': 'postgresql://postgres:password@localhost:5432/normaldance?schema=public',
  
  // JWT
  'JWT_SECRET': generateSecret(64),
  'JWT_REFRESH_SECRET': generateSecret(64),
  'JWT_EXPIRES_IN': '1h',
  'JWT_REFRESH_EXPIRES_IN': '7d',
  
  // Web3
  'NEXT_PUBLIC_WEB3_PROVIDER': 'https://mainnet.infura.io/v3/YOUR-INFURA-KEY',
  'NEXT_PUBLIC_CHAIN_ID': '1',
  'NEXT_PUBLIC_NETWORK_NAME': 'mainnet',
  
  // IPFS
  'NEXT_PUBLIC_IPFS_GATEWAY': 'https://ipfs.io/ipfs',
  'NEXT_PUBLIC_IPFS_API': 'https://ipfs.infura.io:5001',
  
  // API
  'NEXT_PUBLIC_API_URL': 'http://localhost:3000/api',
  'NEXT_PUBLIC_APP_URL': 'http://localhost:3000',
  
  // OAuth
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID': '',
  'GOOGLE_CLIENT_SECRET': '',
  'NEXT_PUBLIC_GITHUB_CLIENT_ID': '',
  'GITHUB_CLIENT_SECRET': '',
  
  // Email
  'EMAIL_SERVER': 'smtp://username:password@smtp.example.com:587',
  'EMAIL_FROM': 'no-reply@normaldance.xyz',
  
  // Misc
  'NODE_ENV': 'development',
  'NEXTAUTH_URL': 'http://localhost:3000',
  'NEXTAUTH_SECRET': generateSecret(64),
};

// Update or add new variables
let updated = false;
Object.entries(requiredVars).forEach(([key, defaultValue]) => {
  const regex = new RegExp(`^${key}=.*`, 'm');
  if (!regex.test(envContent)) {
    envContent += `\n${key}=${defaultValue}`;
    updated = true;
  }
});

if (updated) {
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('Updated .env file with missing variables');
} else {
  console.log('No updates needed for .env file');
}

// Generate a new key pair for JWT signing
const generateKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: generateSecret(32)
    }
  });

  return { publicKey, privateKey };
};

// Create keys directory if it doesn't exist
const keysDir = path.join(__dirname, '..', 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
  console.log('Created keys directory');
}

// Generate JWT keys if they don't exist
const jwtKeysPath = path.join(keysDir, 'jwt.json');
if (!fs.existsSync(jwtKeysPath)) {
  const keys = generateKeyPair();
  fs.writeFileSync(
    jwtKeysPath,
    JSON.stringify({
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      algorithm: 'RS256',
      expiresIn: '1h',
      refreshExpiresIn: '7d'
    }, null, 2)
  );
  console.log('Generated JWT keys');
}

console.log('Key generation complete!');
console.log('Please review the generated files and update any values as needed.');
