import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Set your password here. For production, use an environment variable.
const EDIT_PASSWORD = process.env.EDIT_PASSWORD || "demo123";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === EDIT_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set("edit-access", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hour
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

