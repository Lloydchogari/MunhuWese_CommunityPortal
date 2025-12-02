import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { prisma } from './prisma.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import eventRoutes from './routes/events.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';  

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists
import fs from 'fs';
if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
  fs.mkdirSync(path.join(__dirname, '../uploads'), { recursive: true });
}

// SAFE HOURLY CLEANUP - Won't delete new events!
let lastCleanup = 0; // Track last cleanup time

async function autoCleanupExpiredEvents() {
  try {
    const expiredEvents = await prisma.event.findMany({
      where: {
        endAt: {
          lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Events ended > 2 days ago
        },
      },
    });

    for (const event of expiredEvents) {
      await prisma.$transaction(async (tx) => {
        await tx.eventRegistration.deleteMany({ where: { eventId: event.id } });
        await tx.event.delete({ where: { id: event.id } });
      });
      console.log(`🧹 Deleted expired event: ${event.title}`);
    }
  } catch (error) {
    console.error('Auto-cleanup failed:', error);
  }
}

// SAFE MIDDLEWARE - Runs ONLY once per hour (disabled during tests to avoid
// interfering with mocked Prisma / test isolation)
if (process.env.NODE_ENV !== 'test') {
  app.use(async (req, res, next) => {
  const now = Date.now();
  if (now - lastCleanup > 60 * 60 * 1000) { // 1 hour = 60*60*1000 ms
    lastCleanup = now;
    console.log('🧹 Running hourly cleanup...');
    await autoCleanupExpiredEvents();
  }
  next();
  });
}

app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000', 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (_req, res) => {
  res.json({ status: 'OK', message: 'Community Portal API v1.0' });
});

// ALL ROUTES MOUNTED
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);  //  NEW: My Registrations endpoint

// Generic error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Server error:', err?.stack || err);
  res.status(err?.status || 500).json({ message: err?.message ?? 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

export default app;
