import type { Metadata } from "next";
import { PageShell } from "@/components/layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy/" },
};

// DRAFT: to be reviewed by the site owner before launch, and updated when
// analytics or the newsletter are added.
export default function Privacy() {
  return (
    <PageShell>
      <article className="prose max-w-none">
        <h1>Privacy</h1>
        <p>
          {site.name} does not use advertising cookies. When you click an affiliate link, the
          store you visit (for example Amazon) may set its own cookies under its own privacy policy.
        </p>
        <p>
          Some pages show YouTube videos. Until you press play, your browser only loads the video&apos;s
          preview image from YouTube. When you press play, the video loads from youtube-nocookie.com,
          YouTube&apos;s privacy-enhanced mode, under{" "}
          <a href="https://policies.google.com/privacy">Google&apos;s privacy policy</a>.
        </p>
      </article>
    </PageShell>
  );
}
