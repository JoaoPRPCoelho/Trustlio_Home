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
Inside MDX you can use `<ProductCard id="..." />` and
`<ComparisonTable ids={["a", "b"]} />`.

**Trust Score v1.0** (`src/lib/trust-score.ts`, page `/methodology/trust-score/`):
five fixed pillars worth 100 points, the same for every category: independent
evidence 30, safety & compliance 20, specs & claims transparency 20, brand
accountability 15, warranty & support 15. No score is published under an
active CPSC recall or with fewer than two independent sources with real use.
Confidence (High/Medium/Low) is shown next to it. Amazon reviews, ratings and
prices never enter it, and Amazon pages are rejected as sources.

Fill a product's `trust.inputs` with the scoring sheet
(`docs/trust-score-rubric-v1.0.xlsx`): yellow columns are answers, blue ones
compute the score, and the Rubric tab has the rules. `e1IndependentSources`
must equal the number of `E1` sources with `realUse: true`, or the build fails.

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

## Affiliate links

- Amazon offers link straight to `amazon.com/dp/<ASIN>?tag=<tag>`; never
  through a redirect (Associates policy).
- Other merchants go through `/go/<product>/<merchant>/`. The build writes
  Cloudflare's `_redirects` file from the product data.
- Every page with offers shows the FTC/Amazon disclosure above the first link.
- No Amazon prices are shown until the Creators API is connected (it needs
  10 qualifying sales in 30 days). Pages show a price range instead.

## Example content

The three `example-robot-vacuum-*` products and the robot vacuum guide are
placeholders (`"example": true`). They are noindexed, bannered and left out of
the sitemap. Replace them with real products before launch.

## Before launch

- [ ] Replace `replace-me-20` in `data/merchants/amazon-us.json` with the real Associates tracking tag.
- [ ] Review the disclosure, privacy and about pages (marked DRAFT in the source).
- [ ] Set the fit rubric weights (`data/rubrics/robot-vacuum.json` is a draft).
- [ ] Create the corrections mailbox in `src/lib/site.ts` (`correctionsEmail`).
- [ ] Replace the example products and guide.

## Deploying to Cloudflare Pages

Connect this repository in Cloudflare Pages with:

- Build command: `npm run build`
- Build output directory: `out`
- Environment variable: `NODE_VERSION=22`

Every push to `main` deploys; every pull request gets a preview URL.
