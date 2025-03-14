import { NextResponse } from 'next/server';
import  createMiddleware  from 'next-intl/middleware';


const intlMiddleware = createMiddleware({
  locales:["en","ro"],
  defaultLocale:"en"
})
export async function middleware(req:any) {

   // Step 1: Skip static assets by checking if the URL path starts with "_next/static"
   if (req.nextUrl.pathname.startsWith('/_next/static')) {
    return NextResponse.next();
  }
  //const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip;
  const ip="78.96.85.163";
  const apiKey = process.env.IPREGISTRY_API_KEY;
  const response = await fetch(`https://api.ipregistry.co/${ip}?key=ira_Yqs7i0q8xk09d6HPG9De8cqBLmU8bZ4RIHgc`);
  const data = await response.json();

  

  // Check if IP is flagged as a proxy or VPN
  if (data.security.is_proxy || data.security.is_vpn || data.security.is_tor) {
    return new NextResponse("Access Denied: Proxy/VPN detected.", { status: 403 });
  }
  const countryCode= data.location.country.code;

  // Rewrite URL to add the country code
  const url = req.nextUrl;
  url.searchParams.set('countryCode', countryCode);

  // Create the rewritten response
  const rewrittenResponse = NextResponse.rewrite(url);

  // Set the countryCode in the cookie
  rewrittenResponse.cookies.set('countryCode', countryCode, {
    path: '/', // Ensures cookie is available throughout the site
    httpOnly: true,
    secure: false, // Ensure this is secure in production
    sameSite: 'lax', // Use Lax for cross-site requests
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  
   // Step 2: Add the countryCode to the request
 
  //console.log(req);
  // Pass the request to the intlMiddleware
 // return intlMiddleware(req); 


 //return NextResponse.next();
 return rewrittenResponse;
}

export const config = {
  matcher: '/(.*)', // Apply this middleware to all routes or specific paths as needed
};