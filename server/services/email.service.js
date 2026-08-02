import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '..', 'emailTemplates');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const renderTemplate = async (templateName, variables = {}) => {
  const filePath = path.join(templatesDir, `${templateName}.html`);
  let html = await fs.readFile(filePath, 'utf-8');

  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, value ?? '');
  }

  return html;
};

export const sendEmail = async ({ to, subject, templateName, variables }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[email] SMTP not configured — skipping email "${subject}" to ${to}`);
    return { skipped: true };
  }

  const html = await renderTemplate(templateName, variables);

  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = ({ to, name, verifyUrl }) =>
  sendEmail({
    to,
    subject: 'Verify your email address',
    templateName: 'verifyEmail',
    variables: { name, verifyUrl },
  });

export const sendPasswordResetEmail = ({ to, name, resetUrl }) =>
  sendEmail({
    to,
    subject: 'Reset your password',
    templateName: 'resetPassword',
    variables: { name, resetUrl },
  });

export const sendWelcomeUserEmail = ({ to, name }) =>
  sendEmail({
    to,
    subject: 'Welcome to Hotel Booking System',
    templateName: 'welcomeUser',
    variables: { name },
  });

export const sendWelcomeOwnerEmail = ({ to, name }) =>
  sendEmail({
    to,
    subject: 'Welcome, Hotel Partner!',
    templateName: 'welcomeOwner',
    variables: { name },
  });

export const sendContactMessageEmail = ({ name, email, subject, message }) => {
  if (!process.env.ADMIN_EMAIL) {
    console.warn('[email] ADMIN_EMAIL not configured — skipping contact notification email');
    return Promise.resolve({ skipped: true });
  }

  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New contact message: ${subject}`,
    templateName: 'contactMessage',
    variables: { name, email, subject, message },
  });
};
