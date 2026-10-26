import Link from "next/link";
import { PageShell } from "@/components/layout";
import { hubPath } from "@/lib/paths";
import { site, subcategories } from "@/lib/site";
import type { SubcategoryId } from "@/lib/schemas";

export default function Home() {
  return (
    <PageShell>
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold">{site.name}</h1>
        <p className="max-w-2xl text-lg text-muted">{site.description}</p>
        <p className="max-w-2xl text-muted">
          Every product gets a Trust Score from public, verifiable evidence, with a link behind
          every check. We say plainly whether we tested it ourselves.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {(Object.entries(subcategories) as [SubcategoryId, (typeof subcategories)[SubcategoryId]][]).map(
          ([id, s]) =>
            s.live ? (
              <Link
                key={id}
                href={hubPath(id)}
                className="rounded-lg border border-border bg-white p-5 hover:border-accent"
              >
                <h2 className="text-lg font-semibold">{s.name}</h2>
                <p className="mt-1 text-sm text-muted">{s.tagline}</p>
              </Link>
            ) : (
              <div key={id} className="rounded-lg border border-dashed border-border p-5">
                <h2 className="text-lg font-semibold text-muted">{s.name}</h2>
                <p className="mt-1 text-sm text-muted">Coming later.</p>
              </div>
            ),
        )}
      </section>
    </PageShell>
  );
}
