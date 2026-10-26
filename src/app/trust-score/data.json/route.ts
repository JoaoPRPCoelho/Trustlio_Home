import { trustDataset } from "@/lib/trust-dataset";

export const dynamic = "force-static";

export function GET() {
  return Response.json(trustDataset());
}
