import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Serve build-time HTML from assets instead of re-rendering per request (free plan CPU limit is 10 ms).
// shortcut: read-only cache, no ISR/revalidate; upgrade to R2 cache if pages ever revalidate.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
