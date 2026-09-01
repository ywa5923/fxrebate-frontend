import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { invalidateRouteMapsCache } from "@/lib/routeMapsCache";

const ROUTE_MAPS_ALIASES = new Set(["route_maps", "route-maps", "routemaps"]);

function authorize(request: NextRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  const provided =
    request.headers.get("x-revalidate-secret") ??
    request.nextUrl.searchParams.get("secret");
  return Boolean(secret && provided === secret);
}

function parseTags(searchParams: URLSearchParams): string[] {
  const tags = new Set<string>();

  const multi = searchParams.get("revalidate_tags");
  if (multi) {
    for (const part of multi.split(",")) {
      const tag = part.trim();
      if (tag) tags.add(tag);
    }
  }

  const single = searchParams.get("revalidate_tag");
  if (single?.trim()) {
    tags.add(single.trim());
  }

  return [...tags];
}

async function handleRevalidate(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  let tags = parseTags(searchParams);
  let locale = searchParams.get("locale") ?? undefined;
  let zone = searchParams.get("zone") ?? undefined;

  if (request.method === "POST") {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));

    if (Array.isArray(body.revalidate_tags)) {
      for (const tag of body.revalidate_tags) {
        if (typeof tag === "string" && tag.trim()) tags.push(tag.trim());
      }
    }
    if (typeof body.revalidate_tags === "string") {
      tags.push(
        ...body.revalidate_tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
      );
    }
    if (typeof body.revalidate_tag === "string" && body.revalidate_tag.trim()) {
      tags.push(body.revalidate_tag.trim());
    }
    if (typeof body.locale === "string") locale = body.locale;
    if (typeof body.zone === "string") zone = body.zone;

    tags = [...new Set(tags)];
  }

  if (tags.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Missing tags. Use ?revalidate_tags=tag1,tag2 or ?revalidate_tag=route_maps",
      },
      { status: 400 },
    );
  }

  const revalidatedTags: string[] = [];
  let routeMapsCleared = false;

  for (const tag of tags) {
    if (ROUTE_MAPS_ALIASES.has(tag)) {
      await invalidateRouteMapsCache(locale, zone);
      routeMapsCleared = true;
      revalidatedTags.push(tag);
      continue;
    }

    revalidateTag(tag, "max");
    revalidatedTags.push(tag);
  }

  return NextResponse.json({
    success: true,
    message: "Cache revalidated",
    revalidated_tags: revalidatedTags,
    route_maps_cleared: routeMapsCleared,
    locale: locale ?? null,
    zone: zone ?? null,
  });
}

/**
 * Browser / webhook revalidation.
 *
 * GET  /api/revalidate?secret=...&revalidate_tags=translations,highest-rebates
 * GET  /api/revalidate?secret=...&revalidate_tag=route_maps&locale=ro&zone=eu
 * POST same params in query or JSON body.
 *
 * Special tag `route_maps` (also `route-maps`) clears the dedicated proxy route-maps cache.
 */
export async function GET(request: NextRequest) {
  return handleRevalidate(request);
}

export async function POST(request: NextRequest) {
  return handleRevalidate(request);
}
