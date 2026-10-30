import { describe, expect, it, vi } from "vitest";
import { countRegistryRequest } from "./registry";

describe("countRegistryRequest", () => {
  it("logs one data point with only the item name for /r/<name>.json", () => {
    const writeDataPoint = vi.fn();
    expect(countRegistryRequest("/r/dither-field.json", { writeDataPoint })).toBe(true);
    expect(writeDataPoint).toHaveBeenCalledExactlyOnceWith({ blobs: ["dither-field"], indexes: ["dither-field"] });
  });

  it("ignores other paths and tolerates a missing binding", () => {
    const writeDataPoint = vi.fn();
    for (const p of ["/r/", "/r/a/b.json", "/docs", "/r/x.json.map"]) expect(countRegistryRequest(p, { writeDataPoint })).toBe(false);
    expect(writeDataPoint).not.toHaveBeenCalled();
    expect(countRegistryRequest("/r/engine.json", undefined)).toBe(true);
  });
});
