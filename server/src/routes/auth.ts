import { Router } from "express";
import User from "../models/User";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phc, country } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role, phc, country });
    const token = generateToken({ id: user.id, role: user.role });
    res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (role && user.role !== role) {
      return res.status(401).json({ error: "Selected role does not match this account" });
    }
    const token = generateToken({ id: user.id, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});
router.post

export default router;