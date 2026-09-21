import { Router } from "express";
import User from "../models/User";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password, role, phc, country } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (await User.findOne({ email })) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role, phc, country });
  const token = generateToken({ id: user.id, role: user.role });
  res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = generateToken({ id: user.id, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

export default router;