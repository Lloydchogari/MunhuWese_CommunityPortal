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

// COMMENTS
// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  const postId = Number(req.params.id);
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true, profileImage: true } } },
    });
    res.json(comments);
  } catch (err) {
    console.error('Failed to get comments', err);
    res.status(500).json({ message: 'Failed to get comments' });
  }
});

// Create a comment for a post
router.post('/:id/comments', authRequired, async (req: AuthRequest, res) => {
  const postId = Number(req.params.id);
  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length < 1) return res.status(400).json({ message: 'Content is required' });

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: req.user!.id,
        postId,
      },
      include: { author: { select: { id: true, name: true, profileImage: true } } },
    });
    res.status(201).json(comment);
  } catch (err) {
    console.error('Failed to create comment', err);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Update a comment
router.put('/comments/:commentId', authRequired, async (req: AuthRequest, res) => {
  const commentId = Number(req.params.commentId);
  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length < 1) return res.status(400).json({ message: 'Content is required' });

  try {
    const existing = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!existing) return res.status(404).json({ message: 'Comment not found' });
    if (existing.authorId !== req.user!.id && req.user!.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });

    const updated = await prisma.comment.update({ where: { id: commentId }, data: { content: content.trim() }, include: { author: { select: { id: true, name: true, profileImage: true } } } });
    res.json(updated);
  } catch (err) {
    console.error('Failed to update comment', err);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// Delete a comment
router.delete('/comments/:commentId', authRequired, async (req: AuthRequest, res) => {
  const commentId = Number(req.params.commentId);
  try {
    const existing = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!existing) return res.status(404).json({ message: 'Comment not found' });
    if (existing.authorId !== req.user!.id && req.user!.role !== 'admin') return res.status(403).json({ message: 'Not allowed' });

    await prisma.comment.delete({ where: { id: commentId } });
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete comment', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

export default router;
