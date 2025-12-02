import nodemailer from 'nodemailer';
function createTransporterIfConfigured() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return null;
}
async function sendMailOptions(opts) {
    const transporter = createTransporterIfConfigured();
    if (!transporter) {
        console.log(`📧 Mock email to ${opts.to} : ${opts.subject}\n${opts.text}`);
        return;
    }
    await transporter.sendMail({
        from: '"Community Portal" <no-reply@community.test>',
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
    });
}
export async function sendEventRegistrationEmail(to, eventTitle) {
    const subject = `Registration confirmed: ${eventTitle}`;
    const text = `Thank you for registering for "${eventTitle}". We look forward to seeing you!`;
    await sendMailOptions({ to, subject, text });
}
export async function sendPasswordResetEmail(to, token) {
    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset?token=${token}`;
    const subject = 'Password reset request';
    const text = `A password reset was requested for your account. Use the link below to reset your password (expires in 60 minutes):\n\n${resetUrl}`;
    const html = `<p>A password reset was requested for your account. Click the link below to reset your password (expires in 60 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`;
    await sendMailOptions({ to, subject, text, html });
}
