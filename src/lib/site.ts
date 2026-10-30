import type { SubcategoryId } from "./schemas";

export const site = {
  name: "Trustlio Home",
  url: "https://trustliohome.com",
  description:
    "Scored, side-by-side comparisons of the gadgets and tools that make small-space living easier.",
  defaultAuthor: "João Coelho",
  ownerLocation: "Portugal",
  // Placeholders until the mailboxes exist.
  contactEmail: "hello@trustliohome.com",
  correctionsEmail: "corrections@trustliohome.com",
  // Turn on only once the Amazon Associates account is approved: until then
  // the site has no Amazon links and the required sentence would be untrue.
  amazonAssociate: false,
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

// The exact wording the Associates Operating Agreement requires.
export const amazonAssociateStatement = "As an Amazon Associate we earn from qualifying purchases.";

export const absoluteUrl = (path: string) => new URL(path, site.url).toString();
