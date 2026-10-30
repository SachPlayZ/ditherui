// Wraps the OpenNext worker: /r/*.json runs here first (see run_worker_first) to count installs, then is
// served from static assets. Everything else goes straight to Next.
// @ts-ignore built by `opennextjs-cloudflare build`; absent until then
import { default as next } from "../.open-next/worker.js";
import { countRegistryRequest } from "./registry";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  REGISTRY_REQUESTS?: { writeDataPoint(point: { blobs: string[]; indexes: string[] }): void };
}

const worker = {
  async fetch(request: Request, env: Env, ctx: unknown) {
    if (countRegistryRequest(new URL(request.url).pathname, env.REGISTRY_REQUESTS)) return env.ASSETS.fetch(request);
    return next.fetch(request, env, ctx);
  },
};
export default worker;

// @ts-ignore built by `opennextjs-cloudflare build`; absent until then
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "../.open-next/worker.js";
