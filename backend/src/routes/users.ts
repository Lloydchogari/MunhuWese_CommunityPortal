import { Router } from 'express';
import { prisma } from '../prisma.js';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
import { authRequired, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET user's registrations (My Events)
router.get('/registrations', authRequired, async (req: AuthRequest, res) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: req.user!.id },
      include: {
        event: {
          select: { 
            id: true, 
            title: true, 
            description: true,
            location: true, 
            startAt: true, 
            endAt: true,
            _count: { select: { registrations: true } },
            creator: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

// Storage for profile image uploads
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Update current user's profile (supports optional profile image upload)
router.put('/profile', authRequired, upload.single('profileImage'), async (req: AuthRequest, res) => {
  try {
    const { name, email, bio } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If email changed — ensure uniqueness
    if (email && email !== user.email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
    }

    const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;
    const removeProfile = req.body?.removeProfile === 'true' || req.body?.removeProfile === true;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name ?? user.name,
        email: email ?? user.email,
        bio: bio ?? user.bio,
        ...(profileImage ? { profileImage } : {}),
        ...(removeProfile ? { profileImage: null } : {}),
      },
    });

    res.json({ id: updated.id, name: updated.name, email: updated.email, bio: updated.bio, profileImage: updated.profileImage });
  } catch (err) {
    console.error('Failed to update profile', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// DELETE current user's account (requires password confirmation)
router.delete('/me', authRequired, async (req: AuthRequest, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password required' });

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid password' });

    // Delete user's posts, registrations, and user record in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.post.deleteMany({ where: { authorId: user.id } });
      await tx.eventRegistration.deleteMany({ where: { userId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

export default router;
