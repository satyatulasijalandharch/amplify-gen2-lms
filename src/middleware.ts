import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/utils/amplify-utils";

const publicRoutes = ["/login", "/signup", "/verify-request", "/set-new-password", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    const isAuthenticated = await runWithAmplifyServerContext({
        nextServerContext: { request, response },
        operation: async (contextSpec) => {
            try {
                const session = await fetchAuthSession(contextSpec, {});
                return session.tokens !== undefined;
            } catch (error) {
                console.log("Auth check error:", error);
                return false;
            }
        },
    });

    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

    if (isAuthenticated && isPublicRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isAuthenticated && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login, signup, verify-request, set-new-password, forgot-password, reset-password (auth routes)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|login|signup|verify-request|set-new-password|forgot-password|reset-password).*)",
    ],
};