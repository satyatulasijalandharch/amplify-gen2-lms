import { type NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "./utils/amplify-utils";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const user = await authenticatedUser({ request, response });

    const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
    const isOnAdminArea =
        request.nextUrl.pathname.startsWith("/dashboard/admins");

    // if (isOnDashboard) {
    //     if (!user)
    //         return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
    //     if (isOnAdminArea && !user.isAdmin)
    //         return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    //     return response;
    // } else if (user) {
    //     return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    // }
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