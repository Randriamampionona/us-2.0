import { getLinkPreview } from "link-preview-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const data = await getLinkPreview(url);
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "public, max-age=0, s-maxage=900"); // cache for 15 min
    return response;
  } catch (error) {
    console.error("Link preview fetch failed:", error);

    // Return a minimal but valid fallback object
    const fallback = {
      charset: null,
      url,
      title: new URL(url).hostname,
      siteName: new URL(url).hostname,
      description: undefined,
      mediaType: "website",
      contentType: undefined,
      images: [],
      videos: [],
      favicons: [
        `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
      ],
    };

    const response = NextResponse.json(fallback);
    response.headers.set("Cache-Control", "public, max-age=0, s-maxage=300"); // shorter cache for fallback
    return response;
  }
}
