import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../prisma.js';
import { authRequired, AuthRequest } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
  // Use process.cwd() to find the project root uploads folder in ESM context
  destination: path.join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get('/', async (_req, res) => {
  const posts = await prisma.post.findMany({
    include: { author: { select: { id: true, name: true } }, _count: { select: { likes: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } }, _count: { select: { likes: true } } },
  });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

// Get likes count for a post (and whether the current user liked it)
router.get('/:id/likes', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const count = await prisma.postLike.count({ where: { postId: id } });
    res.json({ count });
  } catch (err) {
    console.error('Failed to get likes', err);
    res.status(500).json({ message: 'Failed to get likes' });
  }
});

router.post('/', authRequired, upload.single('image'), async (req: AuthRequest, res) => {
  let { title, description } = req.body;
  title = (title || '').trim();
  description = (description || '').trim();
  if (!title || !description || title.length < 3 || description.length < 10)
    return res.status(400).json({ message: 'Title and description required (min lengths: title 3, description 10)' });

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  const post = await prisma.post.create({
    data: {
      title,
      description,
      imageUrl,
      authorId: req.user!.id,
    },
  });
  res.status(201).json(post);
});

router.put('/:id', authRequired, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Post not found' });
  if (existing.authorId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed' });
  }

  const { title, description } = req.body;
  const updated = await prisma.post.update({
    where: { id },
    data: { title, description },
  });
  res.json(updated);
});

router.delete('/:id', authRequired, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Post not found' });
  if (existing.authorId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed' });
  }

  await prisma.post.delete({ where: { id } });
  res.status(204).send();
});

// Toggle like for post
router.post('/:id/like', authRequired, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  try {
    const exists = await prisma.postLike.findUnique({ where: { userId_postId: { userId: req.user!.id, postId: id } } });
    if (exists) {
      await prisma.postLike.delete({ where: { userId_postId: { userId: req.user!.id, postId: id } } });
    } else {
      await prisma.postLike.create({ data: { userId: req.user!.id, postId: id } });
    }
    const count = await prisma.postLike.count({ where: { postId: id } });
    res.json({ count });
  } catch (err) {
    console.error('Failed to toggle like', err);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
});

export default router;
