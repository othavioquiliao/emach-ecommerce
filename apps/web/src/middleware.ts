import { type NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard"];

export function middleware(req: NextRequest) {
	const isProtected = PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p));
	if (!isProtected) {
		return NextResponse.next();
	}

	const token = req.cookies.get("ecommerce.session_token");
	if (!token) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("redirect", req.nextUrl.pathname);
		return NextResponse.redirect(url);
	}
	return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
