import { type NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "./utils/amplify-utils";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const user = await authenticatedUser({ request, response });

    const { pathname } = request.nextUrl;
    const isOnDashboard = pathname.startsWith("/dashboard");
    const isOnAdminArea = pathname.startsWith("/admin");
    const isOnLogin = pathname === "/login";

    // Redirect unauthenticated users from protected routes
    if ((isOnDashboard || isOnAdminArea) && !user) {
        return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    // Prevent non-admins from accessing admin area
    if (isOnAdminArea && user && !user.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    // Redirect authenticated users away from login page
    if (isOnLogin && user) {
        return NextResponse.redirect(new URL("/", request.nextUrl));
    }

    // Add more role-based logic here if needed

    return response;
}

export const config = {
    /*
     * Match all request paths except for the ones starting with
     */
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - api (API routes)
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - any PNG files (e.g., images)
        */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
    ],
};