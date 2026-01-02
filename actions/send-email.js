"use server";

import nodemailer from "nodemailer";
import { render } from "@react-email/render";

export async function sendEmail({ to, subject, react }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER or GMAIL_APP_PASSWORD is not configured");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    // Convert React email template → HTML
    const html = render(react);

    await transporter.sendMail({
      from: `"Finance App" <${user}>`,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    throw error; // IMPORTANT: let Inngest see failures
  }
}
