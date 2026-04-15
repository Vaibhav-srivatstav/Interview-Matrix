// Run: node scripts/makeAdmin.js your@email.com
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const email = process.argv[2];
if (!email) { console.error('Usage: node utils/makeAdmin.js your@email.com'); process.exit(1); }


await mongoose.connect(process.env.MONGODB_URI);
const user = await User.findOneAndUpdate(
  { email: email.toLowerCase() },
  { isAdmin: true },
  { new: true }
);
if (!user) { console.error('User not found:', email); }
else { console.log(`✅ ${user.name} (${user.email}) is now an admin`); }
await mongoose.disconnect();
