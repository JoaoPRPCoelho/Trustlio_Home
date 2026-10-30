import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { site } from "@/lib/site";

const UPDATED = "October 30, 2026";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `What data ${site.name} collects (very little), who processes it, and your rights.`,
  alternates: { canonical: "/privacy/" },
};

// Update before adding a newsletter, a form or any new third-party service.
export default function Privacy() {
  return (
    <PageShell>
      <article className="prose max-w-none">
        <h1>Privacy policy</h1>
        <p className="text-sm text-muted">Last updated: {UPDATED}</p>

        <h2>The short version</h2>
        <p>
          {site.name} has no accounts, no comments, no forms and no advertising. It sets no
          advertising or tracking cookies, we don&apos;t track you across sites and we don&apos;t
          sell personal information. The services below handle a small amount of data so the site can load,
          count visits and play videos.
        </p>

        <h2>Who is responsible</h2>
        <p>
          {site.name} is run by {site.defaultAuthor}, based in {site.ownerLocation}, who is the
          data controller for this site. For any privacy question or request, email{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>

        <h2>Hosting</h2>
        <p>
          The site is served by Cloudflare. Like any web host, Cloudflare processes your IP
          address and basic request details, such as the page asked for and your browser type, to
          deliver pages and protect the site from attacks. We don&apos;t use this data to
          identify visitors. See{" "}
          <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare&apos;s privacy policy</a>.
        </p>

        <h2>Analytics</h2>
        <p>
          We count visits with Cloudflare Web Analytics, which does not use cookies or local
          storage and does not fingerprint visitors by IP address or browser. It tells us which
          pages are read and where visitors come from, in aggregate.
        </p>
        <p>
          We also use Google Search Console, which reports how the site appears in Google search.
          It adds nothing to the pages you visit.
        </p>

        <h2>YouTube videos</h2>
        <p>
          Some pages show YouTube videos. Until you press play, your browser only loads the
          video&apos;s preview image from YouTube. When you press play, the video loads from
          youtube-nocookie.com, YouTube&apos;s privacy-enhanced mode, under{" "}
          <a href="https://policies.google.com/privacy">Google&apos;s privacy policy</a>.
        </p>

        <h2>Store and affiliate links</h2>
        <p>
          When you click a link to a store, you leave {site.name}. The store, and the affiliate
          network that runs its program, may set cookies to record that you came from us, so we
          can be paid if you buy something. That happens on their sites, under their privacy
          policies. The reports we get show clicks and sales, not your name, address or payment
          details.
        </p>

        <h2>Emails</h2>
        <p>
          If you email us, we keep your message and address to reply and to handle any correction
          you report, and delete them when they&apos;re no longer needed, within two years at
          most.
        </p>

        <h2>Legal basis</h2>
        <p>
          Under the EU and UK GDPR, we rely on our legitimate interest in running a secure site,
          understanding which pages are useful and answering messages. Playing a YouTube video is
          your choice, made when you press play.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask us for a copy of the personal data we hold about you, or ask us to correct
          or delete it, limit how we use it, or stop using it. Email{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> and we&apos;ll answer
          within 30 days. If you&apos;re in the EU or UK, you can also complain to your data
          protection authority. Because we don&apos;t sell or share personal information for
          advertising, there is nothing to opt out of under US state privacy laws.
        </p>

        <h2>Children</h2>
        <p>
          {site.name} is written for adults and isn&apos;t directed at children under 16. We
          don&apos;t knowingly collect their data.
        </p>

        <h2>Changes</h2>
        <p>
          If we add a newsletter, a form or a new service, we&apos;ll update this page first and
          change the date at the top.
        </p>
      </article>
    </PageShell>
  );
}
