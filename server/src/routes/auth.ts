import { Router } from "express";
import User from "../models/User";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const ROLES = ["phc_staff", "regional_admin"];


router.post("/register", requireAuth, requireRole("regional_admin"), async (req, res) => {
  const { name, email, password, role, phc, country } = req.body;
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!name.trim() || !email.trim() || !ROLES.includes(role)) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: "Password must be 8-72 characters" });
  }
  if (await User.findOne({ email })) {
    return res.status(409).json({ error: "Email already registered" });
  }
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role, phc, country });
  res.status(201).json({ user: { id: user.id, name: user.name, role: user.role } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = generateToken({ id: user.id, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

export default router;