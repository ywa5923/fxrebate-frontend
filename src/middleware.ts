import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getCountryByIP } from './lib/getCountryByIP';
import { getZoneByCountry } from './lib/getZoneByCountry';

export async function middleware(req:NextRequest) {

  const response = NextResponse.next();
  response.headers.set("x-pathname", req.nextUrl.pathname);
   //Skip static assets by checking if the URL path starts with "_next/static"
   if (req.nextUrl.pathname.startsWith('/_next/static') ||req.nextUrl.pathname.startsWith('/assets')) {
    return response;
  }

  console.log("Path name in middleware", req.nextUrl.pathname)

   //Check if 'zone' cookie is already set
   const existingZone = req.cookies.get('zone');
   if (existingZone) {
     return response;
   }

   //Get country from IP
  //const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip;
  const ip="78.96.85.163";
  const country=await getCountryByIP(ip);

  if (!country) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  //Get zone code
  const zone = await getZoneByCountry(country);
 
  // Set the zone cookie
  response.cookies.set('zone', zone ?? '', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure only in production
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;

}

export const config = {
  matcher: '/(.*)', // Apply this middleware to all routes or specific paths as needed
};