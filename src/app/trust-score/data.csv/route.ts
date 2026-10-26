import { trustDatasetCsv } from "@/lib/trust-dataset";

export const dynamic = "force-static";

export function GET() {
  return new Response(trustDatasetCsv(), {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
