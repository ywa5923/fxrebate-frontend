import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getCountryByIP } from './lib/getCountryByIP';
import { getZoneByCountry } from './lib/getZoneByCountry';
import { getOriginalPath } from './lib/getOriginalPath';
import { getOriginalRoute } from './lib/getOriginalRoute';


export async function middleware(req: NextRequest) {

  const url = req.nextUrl;
  let { pathname } = url;
  const localeMatch = pathname.match(/^\/([a-zA-Z]{2,3})\/(.*)$/);

  if (!localeMatch) {
    pathname = pathname === "/" ? "/en" : `/en${pathname}`;
  }

  const locale = localeMatch ? localeMatch[1] : 'en';



  const response = NextResponse.next();
  response.headers.set("x-pathname", req.nextUrl.pathname);
  //Skip static assets and favicon
  if (req.nextUrl.pathname.startsWith('/_next/static') ||
    req.nextUrl.pathname.startsWith('/assets') ||
    req.nextUrl.pathname === '/favicon.ico') {
    return response;
  }

  console.log("Path name in middleware", pathname)

  //Check if 'zone' cookie is already set
  let zone = req.cookies.get('zone')?.value;
  if (!zone) {
    //Get country from IP
    //const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip;
    const ip = "78.96.85.163";
   // const country = await getCountryByIP(ip);

    // if (!country) {
    //   return new NextResponse("Access Denied", { status: 403 });
    // }

    //Get zone code
    //zone = await getZoneByCountry(country) ?? undefined;
    zone = "zone1";
    if (!zone) {
      return new NextResponse("Zone not found", { status: 404 });
      
    }

    // Set the zone cookie
    response.cookies.set('zone', zone, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure only in production
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }



  const rewrittenPath = await getOriginalRoute(pathname, locale, zone);
  console.log("Rewritten path", rewrittenPath)
  if (rewrittenPath) {
    url.pathname = rewrittenPath;
    const rewriteResponse = NextResponse.rewrite(url);
    // Copy the cookie to the rewrite response
    rewriteResponse.cookies.set('zone', zone, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
    return rewriteResponse;
  }

  return response;

}

export const config = {
  matcher: '/(.*)', // Apply this middleware to all routes or specific paths as needed
};