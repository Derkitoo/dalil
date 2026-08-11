/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  VIRUSTOTAL_API_KEY?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function consumeQuota(db: D1Database, scope: string, bucket: string, limit: number): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  await db.prepare(`
    INSERT INTO reputation_rate_limits (scope, bucket, count, updated_at)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(scope, bucket)
    DO UPDATE SET count = count + 1, updated_at = excluded.updated_at
  `).bind(scope, bucket, now).run();
  const row = await db.prepare(
    "SELECT count FROM reputation_rate_limits WHERE scope = ? AND bucket = ?"
  ).bind(scope, bucket).first<{ count: number }>();
  const count = row?.count ?? limit + 1;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const SHORTENER_DOMAINS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy",
  "rebrand.ly", "ow.ly", "buff.ly", "ft.link", "shorturl.at"
]);

const OFFICIAL_DOMAINS = [
  "who.int", "interpol.int", "service-public.fr", "gouv.fr",
  "gov.sa", "moh.gov.sa", "sante.fr", "ameli.fr", "laposte.fr",
  "caf.fr", "impots.gouv.fr", "defense.gouv.fr", "interieur.gouv.fr"
];

async function resolveRedirects(initialUrl: string): Promise<{ resolvedUrl: string; unshortened: boolean }> {
  let currentUrl = initialUrl;
  let unshortened = false;
  try {
    const parsed = new URL(initialUrl);
    if (SHORTENER_DOMAINS.has(parsed.hostname.toLowerCase())) {
      for (let i = 0; i < 3; i++) {
        const res = await fetch(currentUrl, { method: "HEAD", redirect: "manual" });
        const location = res.headers.get("location");
        if (location && [301, 302, 303, 307, 308].includes(res.status)) {
          currentUrl = new URL(location, currentUrl).href;
          unshortened = true;
        } else {
          break;
        }
      }
    }
  } catch {}
  return { resolvedUrl: currentUrl, unshortened };
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function checkTyposquatting(hostname: string): { suspected: boolean; targetOfficialDomain?: string; isOfficial: boolean } {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  const isOfficial = OFFICIAL_DOMAINS.some(d => host === d || host.endsWith('.' + d));
  if (isOfficial) {
    return { suspected: false, isOfficial: true };
  }

  for (const official of OFFICIAL_DOMAINS) {
    const baseOfficial = official.split('.')[0];
    const baseHost = host.split('.')[0];
    if (baseHost.includes(baseOfficial) && baseHost !== baseOfficial) {
      return { suspected: true, targetOfficialDomain: official, isOfficial: false };
    }
    const dist = levenshteinDistance(baseHost, baseOfficial);
    if (dist > 0 && dist <= 2 && baseOfficial.length >= 4) {
      return { suspected: true, targetOfficialDomain: official, isOfficial: false };
    }
  }
  return { suspected: false, isOfficial: false };
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/reputation" && request.method === "GET") {
      const fetchSite = request.headers.get("sec-fetch-site");
      if (fetchSite && !["same-origin", "none"].includes(fetchSite)) {
        return Response.json({ error: "cross_site_request_rejected" }, { status: 403 });
      }
      const candidate = url.searchParams.get("url");
      if (!candidate) {
        return Response.json({ error: "missing_url" }, { status: 400 });
      }

      let checkedUrl: URL;
      try {
        checkedUrl = new URL(candidate);
        if (!['http:', 'https:'].includes(checkedUrl.protocol)) throw new Error('unsupported protocol');
      } catch {
        return Response.json({ error: "invalid_url" }, { status: 400 });
      }

      const apiKey = env.VIRUSTOTAL_API_KEY || process.env.VIRUSTOTAL_API_KEY;
      if (!apiKey) {
        return Response.json({
          error: "reputation_service_not_configured",
          envKeys: Object.keys(env || {}),
        }, { status: 503 });
      }

      const urlHash = await sha256(checkedUrl.href);
      const now = Date.now();
      const cached = await env.DB.prepare(
        "SELECT payload FROM reputation_cache WHERE url_hash = ? AND expires_at > ?"
      ).bind(urlHash, now).first<{ payload: string }>();
      if (cached?.payload) {
        return new Response(cached.payload, {
          headers: { "content-type": "application/json", "cache-control": "private, max-age=300", "x-dalil-cache": "hit" },
        });
      }

      const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
      const visitorHash = await sha256(ip);
      const hourBucket = new Date(now).toISOString().slice(0, 13);
      const dayBucket = new Date(now).toISOString().slice(0, 10);
      const visitorQuota = await consumeQuota(env.DB, `visitor:${visitorHash}`, hourBucket, 5);
      if (!visitorQuota.allowed) {
        return Response.json({ error: "visitor_rate_limit", retry: "next_hour" }, {
          status: 429,
          headers: { "retry-after": "3600", "x-ratelimit-remaining": "0" },
        });
      }
      const globalQuota = await consumeQuota(env.DB, "global", dayBucket, 100);
      if (!globalQuota.allowed) {
        return Response.json({ error: "daily_rate_limit", retry: "next_day" }, {
          status: 429,
          headers: { "retry-after": "86400", "x-ratelimit-remaining": "0" },
        });
      }

      const { resolvedUrl, unshortened } = await resolveRedirects(checkedUrl.href);
      const targetUrl = new URL(resolvedUrl);
      const typosquatting = checkTyposquatting(targetUrl.hostname);

      const id = btoa(targetUrl.href).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const upstream = await fetch(`https://www.virustotal.com/api/v3/urls/${id}`, {
        headers: { "x-apikey": apiKey, accept: "application/json" },
      });

      if (upstream.status === 404) {
        const result = JSON.stringify({
          status: "unknown",
          provider: "VirusTotal",
          originalUrl: checkedUrl.href,
          resolvedUrl: targetUrl.href,
          unshortened,
          domain: targetUrl.hostname,
          typosquatting: { suspected: typosquatting.suspected, targetOfficialDomain: typosquatting.targetOfficialDomain },
          officialMatch: typosquatting.isOfficial,
          checkedAt: new Date().toISOString(),
        });
        await env.DB.prepare(`
          INSERT INTO reputation_cache (url_hash, payload, expires_at, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(url_hash)
          DO UPDATE SET payload = excluded.payload, expires_at = excluded.expires_at, updated_at = excluded.updated_at
        `).bind(urlHash, result, now + 60 * 60 * 1000, now).run();
        return new Response(result, { headers: { "content-type": "application/json", "x-ratelimit-remaining": String(visitorQuota.remaining) } });
      }
      if (!upstream.ok) {
        return Response.json({ error: "provider_unavailable", providerStatus: upstream.status }, { status: 502 });
      }

      const payload = await upstream.json() as {
        data?: { attributes?: { last_analysis_stats?: Record<string, number>; last_analysis_date?: number } };
      };
      const stats = payload.data?.attributes?.last_analysis_stats ?? {};
      const malicious = stats.malicious ?? 0;
      const suspicious = stats.suspicious ?? 0;
      const harmless = stats.harmless ?? 0;
      const undetected = stats.undetected ?? 0;

      const result = JSON.stringify({
        status: malicious > 0 ? "malicious" : suspicious > 0 ? "suspicious" : "no_detection",
        provider: "VirusTotal",
        originalUrl: checkedUrl.href,
        resolvedUrl: targetUrl.href,
        unshortened,
        domain: targetUrl.hostname,
        typosquatting: { suspected: typosquatting.suspected, targetOfficialDomain: typosquatting.targetOfficialDomain },
        officialMatch: typosquatting.isOfficial,
        stats: { malicious, suspicious, harmless, undetected },
        lastAnalysisAt: payload.data?.attributes?.last_analysis_date
          ? new Date(payload.data.attributes.last_analysis_date * 1000).toISOString()
          : null,
        checkedAt: new Date().toISOString(),
      });
      await env.DB.prepare(`
        INSERT INTO reputation_cache (url_hash, payload, expires_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(url_hash)
        DO UPDATE SET payload = excluded.payload, expires_at = excluded.expires_at, updated_at = excluded.updated_at
      `).bind(urlHash, result, now + 24 * 60 * 60 * 1000, now).run();
      ctx.waitUntil(env.DB.prepare("DELETE FROM reputation_cache WHERE expires_at <= ?").bind(now).run());
      return new Response(result, { headers: {
        "content-type": "application/json",
        "cache-control": "private, max-age=300",
        "x-dalil-cache": "miss",
        "x-ratelimit-remaining": String(visitorQuota.remaining),
      } });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
