@AGENTS.md

# Trustlio Home: rules for writing and editing content

Read `README.md` first for how products, rubrics and guides fit together.

## Honesty rules (legal, not style)

- Never write "we tested", "in our testing" or similar unless the product's
  `evidence` is `hands-on-tested`. Research-based pages say what the score is based on.
- Every Trust Score check is backed by an entry in `trust.sources`, and every
  fit criterion score needs a `source`: a URL or a precise citation. Never
  invent specs, prices, test results, owner quotes or certifications. If you
  can't find it, leave the product out or ask.
- Don't write Amazon prices into content or data. Use `priceBand`.
- Never use Amazon reviews, star ratings or review counts, in content or as
  Trust Score evidence (Associates Program Policies). The schema rejects
  Amazon URLs as sources.
- Don't add `AggregateRating` or user-review markup anywhere.
- Product images from Amazon may only come from its API or SiteStripe.

## Writing guides

- Site copy is in US English.
- Start with the answer: who should buy what, in the first lines.
- Put product facts in `data/products/*.json`, not in the MDX body, and pull
  them in with `<ProductCard>` / `<ComparisonTable>`.
- Update `meta.updated` when the content materially changes, and
  `lastVerified` on a product when you re-check it.
- New content is never `example: true`.

## Checks before opening a PR

`npm test && npm run lint && npm run build` must pass.
