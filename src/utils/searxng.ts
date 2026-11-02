export const SEARXNG_HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json,text/html",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};
export async function fetchSearxng(url: string, init: RequestInit = {}) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { ...init, redirect: "error", headers: { ...SEARXNG_HEADERS, ...init.headers } });
    if (response.status !== 429 || attempt === 2) return response;
    await response.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 3000 : 5000));
  }
}
