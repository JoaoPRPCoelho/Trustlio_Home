import Link from "next/link";
import { amazonAssociateStatement, site } from "@/lib/site";

// Shown above the first affiliate link on every page that has one. The FTC
// wants it clear and close to the recommendations; a footer note alone is not
// enough. The Amazon sentence is required by the Associates agreement once
// the site is in the program.
export function AffiliateDisclosure() {
  return (
    <p className="rounded-xl border border-border bg-surface/70 px-4 py-3 text-sm text-muted">
      We may earn a commission when you buy through links on this page. It never
      changes our scores.{site.amazonAssociate && ` ${amazonAssociateStatement}`}{" "}
      <Link href="/disclosure/" className="font-medium text-accent underline">
        How we make money
      </Link>
    </p>
  );
}

export function ExampleBanner() {
  return (
    <p className="rounded-xl border border-warn bg-warn-soft px-4 py-3 text-sm text-warn">
      Example content: this page uses placeholder products to develop the site
      templates. It is hidden from search engines and will be replaced before launch.
    </p>
  );
}
