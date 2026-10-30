import type { SubcategoryId } from "./schemas";

export const site = {
  name: "Trustlio Home",
  url: "https://trustliohome.com",
  description:
    "Scored, side-by-side comparisons of the gadgets and tools that make small-space living easier.",
  defaultAuthor: "João Coelho",
  // Placeholder until the mailbox exists.
  correctionsEmail: "corrections@trustliohome.com",
  // Cloudflare Web Analytics site token (public: it ships in every page).
  // Cookieless, so no consent banner. Empty turns the beacon off.
  cloudflareAnalyticsToken: "1b3bf746ddc049718d419ed9d9c9913f",
};

export const subcategories: Record<
  SubcategoryId,
  { name: string; tagline: string; live: boolean }
> = {
  "small-space": {
    name: "Small-Space Living",
    tagline: "Renter-friendly, no-drill and compact picks for apartments and studios.",
    live: true,
  },
  "home-office": {
    name: "Home Office",
    tagline: "Compact desks, chairs and gear for working from a small home.",
    live: false,
  },
};

export const absoluteUrl = (path: string) => new URL(path, site.url).toString();
