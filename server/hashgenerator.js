import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'YOUR_DESIRED_PASSWORD';
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('Hashed Password:', hashedPassword);
}

generateHash();