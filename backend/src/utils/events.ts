import { Router } from 'express';
import { prisma } from '../prisma.js';
import multer from 'multer';
import path from 'path';
import { authRequired, requireRole, AuthRequest, authOptional } from '../middleware/auth.js';
import { sendEventRegistrationEmail } from '../utils/email.js';

const router = Router();

// GET all events with attendee count
router.get('/', authOptional, async (req: AuthRequest, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        endAt: {
          gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { startAt: 'desc' },
      include: { 
        creator: { select: { id: true, name: true } },
        _count: { select: { registrations: true } }  // Attendee count
      },
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// POST new event (admin only)
router.post('/', authRequired, requireRole('admin'), upload.single('image'), async (req: AuthRequest, res) => {
  let { title, description, location, startAt, endAt } = req.body;
  title = (title || '').trim();
  description = (description || '').trim();
  location = (location || '').trim();

  if (!title || !description || !location || !startAt || !endAt) {
    return res.status(400).json({ message: 'Missing event fields' });
  }
  if (title.length < 3 || description.length < 10) {
    return res.status(400).json({ message: 'Title or description too short' });
  }

  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        creatorId: req.user!.id,
        imageUrl,
      },
      include: { creator: true },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// PUT update event (admin only)
router.put('/:id', authRequired, requireRole('admin'), upload.single('image'), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { title, description, location, startAt, endAt } = req.body;

  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const data: any = {
      title,
      description,
      location,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
    };
    if (imageUrl) data.imageUrl = imageUrl;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...data,
      },
      include: { creator: true },
    });
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// DELETE event (admin only)
router.delete('/:id', authRequired, requireRole('admin'), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.event.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

// POST register for event (any authenticated user)
router.post('/:id/register', authRequired, async (req: AuthRequest, res) => {
  const eventId = Number(req.params.id);

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Prevent duplicate registration
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: { userId: req.user!.id, eventId },
      },
    });
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId: req.user!.id,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (user) {
      try {
        await sendEventRegistrationEmail(user.email, event.title);
      } catch (emailError) {
        console.error('Failed to send registration email:', emailError);
      }
    }

    res.status(201).json(registration);
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Failed to register for event' });
  }
});

// New Admin route to list registrations for event
router.get('/:id/registrations', authRequired, requireRole('admin'), async (req: AuthRequest, res) => {
  const eventId = Number(req.params.id);

  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

export default router;