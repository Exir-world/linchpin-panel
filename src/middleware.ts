import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

// export default createMiddleware(routing);

const intlMiddleware = createMiddleware(routing);

export const middleware = (req: NextRequest) => {
  const intlResponse = intlMiddleware(req);
  if (intlResponse) {
    return intlResponse;
  }

  const cookies = req.cookies.get("linchpin-admin");
  if (!cookies?.value) {
    const locale = req.nextUrl.locale || "en";
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }
};
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
