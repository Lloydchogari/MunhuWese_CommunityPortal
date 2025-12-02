import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { sendEventRegistrationEmail } from '../utils/email.js';
const router = Router();
router.get('/', async (_req, res) => {
    const events = await prisma.event.findMany({
        where: { startAt: { gte: new Date() } },
        orderBy: { startAt: 'asc' },
    });
    res.json(events);
});
router.post('/', authRequired, requireRole('admin'), async (req, res) => {
    let { title, description, location, startAt, endAt } = req.body;
    title = (title || '').trim();
    description = (description || '').trim();
    location = (location || '').trim();
    if (!title || !description || !location || !startAt || !endAt) {
        return res.status(400).json({ message: 'Missing event fields' });
    }
    if (title.length < 3 || description.length < 10)
        return res.status(400).json({ message: 'Title or description too short' });
    const event = await prisma.event.create({
        data: {
            title,
            description,
            location,
            startAt: new Date(startAt),
            endAt: new Date(endAt),
        },
    });
    res.status(201).json(event);
});
router.put('/:id', authRequired, requireRole('admin'), async (req, res) => {
    const id = Number(req.params.id);
    const { title, description, location, startAt, endAt } = req.body;
    const event = await prisma.event.update({
        where: { id },
        data: {
            title,
            description,
            location,
            startAt: new Date(startAt),
            endAt: new Date(endAt),
        },
    });
    res.json(event);
});
router.delete('/:id', authRequired, requireRole('admin'), async (req, res) => {
    const id = Number(req.params.id);
    await prisma.event.delete({ where: { id } });
    res.status(204).send();
});
router.post('/:id/register', authRequired, async (req, res) => {
    const eventId = Number(req.params.id);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event)
        return res.status(404).json({ message: 'Event not found' });
    const registration = await prisma.eventRegistration.create({
        data: {
            eventId,
            userId: req.user.id,
        },
    });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user) {
        await sendEventRegistrationEmail(user.email, event.title);
    }
    res.status(201).json(registration);
});
export default router;
