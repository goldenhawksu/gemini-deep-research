import { NextResponse, type NextRequest } from "next/server";
import { fetchSearxng } from "@/utils/searxng";
export const runtime = "edge";
export async function POST(req: NextRequest) {
  // Only the search endpoint is exposed; no client-controlled proxy or path.
  const url = new URL("search", `${(process.env.SEARXNG_API_BASE_URL || "https://searxng.aesc.ai").replace(/\/$/, "")}/`);
  url.search = req.nextUrl.search;
  url.searchParams.delete("slug");
  url.searchParams.set("format", "json");
  try {
    const response = await fetchSearxng(url.toString(), { method: "GET" });
    return new NextResponse(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") || "application/json", "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    const category = /redirect/i.test(detail) && /follow|manual/i.test(detail) ? "unsupported-redirect-mode" : error instanceof Error ? error.name : "unknown";
    console.error("[searxng] upstream failure", category);
    return NextResponse.json({ error: "Search upstream unavailable" }, { status: 502, headers: { "X-Search-Error": category } });
  }
}
