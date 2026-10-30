"use client";

import { AsciiChart } from "@/registry/ui/ascii-chart";

const visits = [12, 18, 15, 26, 22, 31, 28, 40, 36, 44, 39, 52];

export default function AsciiChartDemo() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 520 }}>
      <AsciiChart label="Weekly visits" data={visits} style={{ height: 120 }} />
      <AsciiChart type="bar" label="Weekly visits" data={visits} style={{ height: 120 }} />
      <div>
        Signups <AsciiChart type="sparkline" label="Daily signups" data={[3, 5, 4, 8, 6, 9, 12, 10]} />
      </div>
    </div>
  );
}
