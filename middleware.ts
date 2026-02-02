import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  if (req.method === "GET") {
    if (req.nextUrl.pathname === "/edit/location") {
      const editAccess = req.cookies.get("edit-access");

      if (!editAccess || editAccess.value !== "authenticated") {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      return res;
    }

    // Rewrite routes that match "/[...puckPath]/edit" to "/puck/[...puckPath]"
    if (req.nextUrl.pathname.endsWith("/edit")) {
      // Check for authentication cookie
      const editAccess = req.cookies.get("edit-access");

      if (!editAccess || editAccess.value !== "authenticated") {
        // Redirect to login page with redirect parameter
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      const pathWithoutEdit = req.nextUrl.pathname.slice(
        0,
        req.nextUrl.pathname.length - 5
      );
      const pathWithEditPrefix = `/puck${pathWithoutEdit}`;

      return NextResponse.rewrite(new URL(pathWithEditPrefix, req.url));
    }

    // Disable "/puck/[...puckPath]"
    if (req.nextUrl.pathname.startsWith("/puck")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}
