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
| Products | `data/products/<id>.json` | Specs, pros/cons, offers, and a 0–10 score with a source for every rubric criterion |
| Rubrics | `data/rubrics/<id>.json` | Criteria and weights per product category; critical criteria cap the score |
| Merchants | `data/merchants/<id>.json` | Amazon tracking tag, button label, program type |
| Guides | `content/<subcategory>/guides/<slug>.mdx` | `export const meta = {...}` plus the article body |

Reviews are generated from product data at `/<subcategory>/reviews/<id>/`.
Inside MDX you can use `<ProductCard id="..." />` and
`<ComparisonTable ids={["a", "b"]} />`.

**Trust score** = 10 × weighted average of the criterion scores, rounded,
then capped by any critical criterion below its minimum
(`src/lib/trust-score.ts`). Commission never enters it.

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
- [ ] Set the rubric weights (`data/rubrics/robot-vacuum.json` is a draft).
- [ ] Replace the example products and guide.

## Deploying to Cloudflare Pages

Connect this repository in Cloudflare Pages with:

- Build command: `npm run build`
- Build output directory: `out`
- Environment variable: `NODE_VERSION=22`

Every push to `main` deploys; every pull request gets a preview URL.
