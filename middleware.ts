import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (req.method === "GET") {
    if (req.nextUrl.pathname === "/edit") {
      const editAccess = req.cookies.get("edit-access");

      if (!editAccess || editAccess.value !== "authenticated") {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      return res;
    }
  }

  return res;
}
