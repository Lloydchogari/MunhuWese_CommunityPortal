import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authRequired, AuthRequest } from '../middleware/auth.js';

// Match Prisma exact return types
interface DashboardPost {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;  // Prisma returns null
  authorId: number;
  author: { id: number; name: string };
  createdAt: Date;
}

interface DashboardEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  startAt: Date;
  endAt: Date;
  creatorId: number | null;  // Prisma allows null
  creator: { id: number; name: string } | null;  // Prisma allows null
  createdAt: Date;
}

type DashboardItem = DashboardPost | DashboardEvent;

const router = Router();

// GET dashboard content (posts and events) for the logged-in user
router.get('/', authRequired, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  try {
    // Fetch posts created by the user
    const posts: DashboardPost[] = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true } } },
    });

    const events: DashboardEvent[] = await prisma.event.findMany({
      where: {
        startAt: { gte: new Date() }, // All future events for everyone
      },
      orderBy: { startAt: 'desc' },
      include: { creator: { select: { id: true, name: true } } },
    });

    // Combine and sort by creation/start date 
    const dashboardItems: DashboardItem[] = [...posts, ...events].sort((a, b) => {
      const getDate = (item: DashboardItem): Date => {
        if ('startAt' in item && item.startAt) return item.startAt;
        return item.createdAt;
      };
      
      return getDate(b).getTime() - getDate(a).getTime();
    });

    res.json(dashboardItems);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard content' });
  }
});

export default router;
