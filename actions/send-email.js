"use server";

import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: { message: "RESEND_API_KEY is not configured" } };
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}