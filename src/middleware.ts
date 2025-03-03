import { NextResponse } from 'next/server';

export async function middleware(req:any) {
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

  const url = req.nextUrl;
  url.searchParams.set('countryCode', countryCode);
  
  return NextResponse.rewrite(url);

 // return NextResponse.next();
}

export const config = {
  matcher: '/(.*)', // Apply this middleware to all routes or specific paths as needed
};