import { notFound } from "next/navigation";
import { Parity } from "@/components/site/parity";

// Test-only route: renders fixtures through WebGL2 and the CPU path and reports mismatches.
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Parity />;
}
