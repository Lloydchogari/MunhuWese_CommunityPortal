import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword, mobile } = req.body;

  if (!name || !email || !password || !confirmPassword || !mobile) {
    console.error('REGISTER VALIDATION FAILED - missing fields', { body: req.body });
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (typeof name !== 'string' || name.length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters' });
  if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  if (!/^[+\d\- ]{7,20}$/.test(mobile)) return res.status(400).json({ message: 'Mobile number not valid' });
  
  if (password !== confirmPassword) {
    console.error('REGISTER VALIDATION FAILED - passwords mismatch', { password, confirmPassword });
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: 'Email already used' });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hash, mobile },
  });

  // Issue a token on registration so user is immediately authenticated
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' },
  );

  return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' },
  );

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// Minimal mock password reset endpoints
router.post('/reset-request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ message: 'If this email exists, a reset link was sent' });

  // create a short-lived reset token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  // send email (real if configured, otherwise mocked)
  try {
    const { sendPasswordResetEmail } = await import('../utils/email.js');
    await sendPasswordResetEmail(user.email, token);
  } catch (err) {
    console.error('failed to send password reset email', err);
  }

  return res.json({ message: 'If this email exists, a reset link was sent' });
});

router.post('/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
});

export default router;