# Trustlio Home

Scored, side-by-side comparisons of gadgets and tools for small-space living.
Fully static Next.js site, hosted on Cloudflare Pages, monetized with affiliate
links (Amazon US + OneLink, direct programs).

## Commands

```bash
npm install
npm run dev     # local preview at http://localhost:3000
npm test        # unit tests (trust score, affiliate links)
npm run lint
npm run build   # static site in out/
```

## How content works

There is no CMS and no database. Everything is a file in this repo, validated
at build time; a missing field or broken reference fails the build.

| What | Where | Notes |
| --- | --- | --- |
| Products | `data/products/<id>.json` | Specs, pros/cons, offers, the Trust Score inputs with their sources (`trust`), and an optional small-space fit rating (`fit`) |
| Fit rubrics | `data/rubrics/<id>.json` | Criteria and weights per category for the fit rating; critical criteria cap it |
| Merchants | `data/merchants/<id>.json` | Amazon tracking tag, button label, program type |
| Guides | `content/<subcategory>/guides/<slug>.mdx` | `export const meta = {...}` plus the article body |

Reviews are generated from product data at `/<subcategory>/reviews/<id>/`.
Inside MDX you can use `<ProductCard id="..." />`,
`<ComparisonTable ids={["a", "b"]} />` and `<ProductVideo id="..." />`.

## Images and videos

Both live in the product's data file, and the build checks their rights.

- **Images** (`images`): self-hosted WebP/JPG/PNG under
  `public/images/products/<product>/`. Each one needs a `license` (`own`,
  `brand-permission`, `press-kit`, `cc0`, `cc-by`, `cc-by-sa`), a `credit`
  shown under it and, unless it's our own photo, a `source` that records the
  license or permission. Never Amazon images (only its API may supply them),
  never hotlinks, never a brand image without written terms that cover the use.
  The first image shows on product cards. On the review page, images and
  videos share one carousel (`<ProductGallery>`): photos first, then our own
  videos, the brand's, AI ones, and independent reviews last.
- **Open Icecat**: images from Open Icecat use `license: "press-kit"`, a
  `credit` such as "Image: Roborock via Open Icecat" and the product's Icecat
  URL as `source`. Self-host them, and only after checking that the Open
  Content License covers this use and the brand is in the free tier.
- **Videos** (`videos`): YouTube embeds through the official player, loaded
  only on click from youtube-nocookie.com. Only embed videos that have
  embedding turned on, and set `kind`: `independent-review`, `manufacturer`,
  `own` or `ai-generated`. The caption follows from the kind, so a third-party
  review never reads as our test.
- **AI media**: an `ai-generated` video needs an `aiDisclosure`, and an AI image
  needs `aiGenerated: true`; both are labelled on the page. Never use AI to
  show a product cleaning, working or being used, or a person describing an
  experience: that's a simulated demonstration or a fake testimonial under FTC
  rules, label or not.

**Trust Score v1.1** (`src/lib/trust-score.ts`, page `/methodology/trust-score/`):
five fixed pillars worth 100 points, the same for every category: independent
evidence 30, safety & compliance 20, specs & claims transparency 20, brand
accountability 15, warranty & support 15. No score is published under an
active recall in a market where we link to the product (CPSC, EU Safety Gate,
UK product safety recalls) or with fewer than two independent sources with
real use. v1.1 made the checks market-neutral for UK/EU products; US scores
didn't change.
Confidence (High/Medium/Low) is shown next to it. Amazon reviews, ratings and
prices never enter it, and Amazon pages are rejected as sources.

Fill a product's `trust.inputs` with the scoring sheet
(`docs/trust-score-rubric-v1.1.xlsx`): yellow columns are answers, blue ones
compute the score, and the Rubric tab has the rules. `e1IndependentSources`
must equal the number of `E1` sources with `realUse: true`, or the build fails.
Up to three of those sources show on the review as "What reviewers found",
with their `note` as the summary, so write notes that a reader can follow and
that include what went wrong. A source can also carry a `quote`: at most 30
words copied exactly from the page, shown in quotes with the link. Only
professional reviews go there; never consumer reviews from other sites
(copyright, and EU/UK rules on showing consumer reviews) and never Amazon.

**Small-space fit** (`src/lib/fit-score.ts`) is a separate, optional rating:
10 × the weighted average of 0–10 criterion scores from the category's fit
rubric, capped by critical criteria. Price never enters it.

All published scores are also served as `/trust-score/data.json` and
`/trust-score/data.csv` (example products left out).

## Recall checks

`.github/workflows/recalls.yml` runs `scripts/check-recalls.mjs` every Monday
against the CPSC Recalls API, by manufacturer, importer and title. A failed run
means a product needs a person: read the recall notice, then update
`activeRecall` or `s1NoBrandRecalls5y`. Run it by hand from the Actions tab
(workflow_dispatch) or locally with `node scripts/check-recalls.mjs`.

The EU Safety Gate and the UK list have no API wired in, so for products sold
in the UK or EU the run prints a reminder to check them by hand, and the
methodology says so. Do it before publishing and at every review.

## Markets

The site links to stores in the US (`us`), the UK (`uk`) and the EU (`eu`).
Every merchant has a `market`, and a product has one `priceBands` entry per
market it is sold in, in that market's currency; the build fails if an offer's
market has no price band. Pages with several markets group the buy buttons by
market.

When a product is sold as a different model in another market (a Nuki lock
for European cylinders vs. one for US deadbolts), each model gets its own data
file and score, and `equivalents` links them, with a note on what differs. A
hands-on test covers only the model we used.

## Affiliate links

- Amazon offers link straight to `<amazonDomain>/dp/<ASIN>?tag=<tag>`; never
  through a redirect (Associates policy). OneLink (one US account) sends
  visitors from the UK, EU and other countries to the same product in their
  local store; a different model for another market needs its own offer.
- Other merchants go through `/go/<product>/<merchant>/`. The build writes
  Cloudflare's `_redirects` file from the product data.
- Every page with offers shows the FTC/Amazon disclosure above the first link.
- No Amazon prices are shown until the Creators API is connected (it needs
  10 qualifying sales in 30 days). Pages show a price range instead.

## Example content

Content marked `"example": true` is noindexed, bannered and left out of the
sitemap. None is left in the repo; the flag stays for building new templates.

## Before launch

- [ ] Replace `replace-me-20` in `data/merchants/amazon-us.json` with the real Associates tracking tag.
- [ ] Review the disclosure, privacy and about pages (marked DRAFT in the source).
- [x] Set `cloudflareAnalyticsToken` in `src/lib/site.ts` (Cloudflare dashboard → Web Analytics → the site → Manage site, manual JS snippet).
- [x] Set the fit rubric weights (`data/rubrics/robot-vacuum.json` v1.0).
- [ ] Add Amazon offers (ASIN from SiteStripe) to the real products once the Associates account is approved; they link to the brand stores until then.
- [ ] Create the corrections mailbox in `src/lib/site.ts` (`correctionsEmail`).
- [x] Replace the example products and guide.

## Deploying to Cloudflare

The site deploys as a static-only Cloudflare Worker (Workers Builds).
`wrangler.jsonc` tells Cloudflare to serve `out/` as static assets, so no
Worker script and no OpenNext adapter are involved. `_redirects` in `out/` is
applied natively.

Workers Builds settings:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Environment variable: `NODE_VERSION=22`

Every push to `main` deploys. To check the output locally:
`npm run build && npx wrangler dev`.
