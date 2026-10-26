import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about/" },
};

// DRAFT: the author bio is to be written by the site owner.
export default function About() {
  return (
    <PageShell>
      <article className="prose max-w-none">
        <h1>About {site.name}</h1>
        <p>
          {site.name} compares the gadgets and tools that make life in a small home easier. Every
          product gets a trust score from a published rubric, with the sources behind it.
        </p>
        <h2>Who writes this</h2>
        <p>{site.defaultAuthor}. Bio coming soon.</p>
      </article>
    </PageShell>
  );
}
