"use server";

import { render } from "@react-email/render";

export async function sendEmail({ to, subject, react }) {
  // 👇 IMPORTANT: dynamic import
  const nodemailer = await import("nodemailer");

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER or EMAIL_PASS is not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const html = render(react);

  await transporter.sendMail({
    from: `"Wealth App" <${user}>`,
    to,
    subject,
    html,
  });

  return { success: true };
}
