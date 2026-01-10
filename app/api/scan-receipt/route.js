import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // ✅ Validate image
    if (!file || !file.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid image file" },
        { status: 400 }
      );
    }

    // ✅ Convert image to base64
    const base64Image = Buffer.from(
      await file.arrayBuffer()
    ).toString("base64");

    const prompt = `
You are an OCR + receipt parsing system.

Return ONLY valid JSON in this format:
{
  "amount": number,
  "date": "YYYY-MM-DD",
  "description": "string",
  "merchantName": "string",
  "category": "string"
}

If this is not a receipt, return {}.
`;

    // ✅ Call Gemini
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: file.type,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      console.error("GEMINI ERROR:", json);
      return NextResponse.json(
        { error: json.error?.message || "Gemini API error" },
        { status: 500 }
      );
    }

    const text =
      json.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("RAW GEMINI OUTPUT >>>", text);

    // ✅ Robust JSON extraction
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return NextResponse.json({});
    }

    const data = JSON.parse(text.slice(start, end + 1));

    // ✅ Normalize date (Prisma-safe)
    const parsedDate =
      data.date && !isNaN(new Date(data.date).getTime())
        ? new Date(data.date).toISOString()
        : new Date().toISOString();

    // ✅ Final sanitized response
    return NextResponse.json({
      amount: Number(data.amount) || 0,
      date: parsedDate,
      description: data.description || "",
      merchantName: data.merchantName || "",
      category: data.category || "other",
    });
  } catch (error) {
    console.error("SCAN RECEIPT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to scan receipt" },
      { status: 500 }
    );
  }
}
