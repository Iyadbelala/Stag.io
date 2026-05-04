import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FIELDS", message: "All fields are required" } },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_EMAIL", message: "Invalid email format" } },
        { status: 400 }
      );
    }

    console.log(`[CONTACT] New message from ${name} (${email}): ${subject} - ${message}`);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error: unknown) {
    const e = error as { message: string };
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: e.message } },
      { status: 500 }
    );
  }
}