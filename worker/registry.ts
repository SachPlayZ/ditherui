/** Counts one Analytics Engine data point per registry item request: the item name only, no request details. */
export function countRegistryRequest(pathname: string, dataset: { writeDataPoint(point: { blobs: string[]; indexes: string[] }): void } | undefined): boolean {
  const name = /^\/r\/([\w-]+)\.json$/.exec(pathname)?.[1];
  if (!name) return false;
  dataset?.writeDataPoint({ blobs: [name], indexes: [name] });
  return true;
}
