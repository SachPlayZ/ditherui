export type PlotType = "line" | "bar";

const cache = new WeakMap<readonly number[], { key: string; values: Float32Array }>();

/**
 * Per-mark levels (row-major, top row first) for a series drawn into cols × rows marks.
 * Bars fill up to each value with a fractional top mark, so a ramp draws partial heights; lines join the points.
 */
export function plotValues(series: readonly number[], type: PlotType, cols: number, rows: number): Float32Array {
  const key = `${type}|${cols}x${rows}|${series.join()}`;
  const hit = cache.get(series);
  if (hit?.key === key) return hit.values;
  const values = new Float32Array(cols * rows);
  const n = series.length;
  const lo = Math.min(0, ...series), span = Math.max(...series) - lo || 1;
  // Height in marks at fractional index i, interpolated between points.
  const at = (i: number) => {
    const a = Math.min(n - 1, Math.floor(i)), b = Math.min(n - 1, a + 1);
    return ((series[a] + (series[b] - series[a]) * (i - a) - lo) / span) * rows;
  };
  for (let x = 0; n && x < cols; x++) {
    const bar = type === "bar" ? at(Math.floor(((x + 0.5) / cols) * n)) : 0;
    // The line's extent across this column: both edges plus any data point (peak or trough) inside it.
    const i0 = (x / cols) * (n - 1), i1 = ((x + 1) / cols) * (n - 1);
    const ys = [at(i0), at(i1)];
    for (let k = Math.ceil(i0); k <= i1; k++) ys.push(at(k));
    const y0 = Math.min(...ys) - 0.5, y1 = Math.max(...ys) + 0.5;
    for (let b = 0; b < rows; b++) {
      const c = b + 0.5;
      values[(rows - 1 - b) * cols + x] = type === "bar" ? Math.min(1, Math.max(0, bar - b)) : c >= y0 && c <= y1 ? 1 : 0;
    }
  }
  cache.set(series, { key, values });
  return values;
}
