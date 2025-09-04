import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { authRoutes,DEFAULT_LOGIN_REDIRECT, apiRoutePrefix, publicRoutes  } from "./routes";
import { NextRequest, NextResponse } from "next/server"

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req: NextRequest){
    const { nextUrl } = req;
    const isLoggedIn = !!(await auth());

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiRoutePrefix);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return ;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return ;
    }

    if(!isLoggedIn && !isPublicRoute){
        return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
    
    return ;
    
})

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)" ],
}