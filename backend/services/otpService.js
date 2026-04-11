/**
 * OTP Service — generates, stores, verifies 6-digit OTPs
 * Uses in-memory Map (survives server restarts via re-request)
 */

import nodemailer from 'nodemailer';

// In-memory store: email → { otp, expiresAt, userData }
const pendingRegistrations = new Map();

// ─── Generate OTP ─────────────────────────────────────────────────────────────
export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─── Store pending registration ───────────────────────────────────────────────
export const storePending = (email, otp, userData) => {
  pendingRegistrations.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    userData,
    createdAt: Date.now()
  });
};

// ─── Get pending registration ─────────────────────────────────────────────────
export const getPending = (email) =>
  pendingRegistrations.get(email.toLowerCase()) || null;

// ─── Delete pending registration ──────────────────────────────────────────────
export const deletePending = (email) =>
  pendingRegistrations.delete(email.toLowerCase());

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOTP = (email, inputOtp) => {
  const record = getPending(email);
  if (!record) return { valid: false, reason: 'No pending registration found. Please request a new OTP.' };
  if (Date.now() > record.expiresAt) {
    deletePending(email);
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== inputOtp.toString()) {
    return { valid: false, reason: 'Invalid OTP. Please try again.' };
  }
  return { valid: true, userData: record.userData };
};

// ─── Nodemailer transporter ───────────────────────────────────────────────────
const createTransporter = () => {
  // If no email config, use Ethereal (test) transport
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.warn('⚠️  No email config found — OTP will be logged to console only');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Send OTP email ───────────────────────────────────────────────────────────
export const sendOTPEmail = async (email, otp, firstName) => {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="background: linear-gradient(135deg, #059669, #2563eb); display: inline-block; padding: 12px; border-radius: 50%;">
          <span style="font-size: 24px;">🌿</span>
        </div>
        <h1 style="color: #111827; margin-top: 12px; font-size: 22px;">CuraOne</h1>
      </div>
      <div style="background: white; padding: 28px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827; margin: 0 0 8px;">Verify your email</h2>
        <p style="color: #6b7280; margin: 0 0 24px;">Hi ${firstName}, use the code below to complete your registration.</p>
        <div style="background: #f0fdf4; border: 2px dashed #059669; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #059669;">${otp}</span>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <p style="color: #d1d5db; font-size: 12px; text-align: center; margin-top: 16px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    // Dev fallback — print OTP to console
    console.log(`\n📧 OTP for ${email}: ${otp}\n`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `CuraOne <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} — Your CuraOne verification code`,
    html,
  });
};
