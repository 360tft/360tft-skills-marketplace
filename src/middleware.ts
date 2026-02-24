import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Redirect footballai.co and skills.360tft.com to aifootball.co
  if (
    host.includes("footballai.co") ||
    host.includes("skills.360tft.com")
  ) {
    const url = new URL(request.url);
    url.host = "aifootball.co";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
