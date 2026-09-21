import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import User from "./models/User";
import { hashPassword } from "./utils/auth";

dotenv.config({ path: [".env.local", ".env"] });


const args = process.argv.slice(2);
const arg = (flag: string) => {
  const i = args.indexOf(`--${flag}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const run = async () => {
  const name = arg("name");
  const email = arg("email");
  const password = arg("password");
  const role = arg("role") ?? "regional_admin";

  if (!name || !email || !password) {
    console.error('Usage: npm run create-user -- --name "Name" --email x@y.com --password "..." [--role phc_staff|regional_admin]');
    process.exit(1);
  }
  if (role !== "phc_staff" && role !== "regional_admin") {
    console.error("--role must be phc_staff or regional_admin");
    process.exit(1);
  }
  if (password.length < 8 || password.length > 72) {
    console.error("Password must be 8-72 characters");
    process.exit(1);
  }

  await connectDB();
  const passwordHash = await hashPassword(password);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    existing.role = role;
    await existing.save();
    console.log(`Updated ${email} (${role})`);
  } else {
    await User.create({ name, email, passwordHash, role });
    console.log(`Created ${email} (${role})`);
  }
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});