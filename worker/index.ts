/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
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

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/reputation" && request.method === "GET") {
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

      if (!env.VIRUSTOTAL_API_KEY) {
        return Response.json({ error: "reputation_service_not_configured" }, { status: 503 });
      }

      const id = btoa(checkedUrl.href).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const upstream = await fetch(`https://www.virustotal.com/api/v3/urls/${id}`, {
        headers: { "x-apikey": env.VIRUSTOTAL_API_KEY, accept: "application/json" },
      });

      if (upstream.status === 404) {
        return Response.json({ status: "unknown", provider: "VirusTotal", checkedAt: new Date().toISOString() });
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

      return Response.json({
        status: malicious > 0 ? "malicious" : suspicious > 0 ? "suspicious" : "no_detection",
        provider: "VirusTotal",
        stats: { malicious, suspicious, harmless, undetected },
        lastAnalysisAt: payload.data?.attributes?.last_analysis_date
          ? new Date(payload.data.attributes.last_analysis_date * 1000).toISOString()
          : null,
        checkedAt: new Date().toISOString(),
      }, { headers: { "cache-control": "private, max-age=300" } });
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
