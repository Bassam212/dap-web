import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Allow public access to API routes (so Extension can fetch/save guides)
const isPublicRoute = createRouteMatcher(["/api(.*)", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};