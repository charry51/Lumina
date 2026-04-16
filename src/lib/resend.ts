import { Resend } from 'resend';

// NOTE: This requires RESEND_API_KEY in .env.local
export const resend = new Resend(process.env.RESEND_API_KEY);
