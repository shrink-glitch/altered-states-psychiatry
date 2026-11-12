# Contributing

Thank you for helping. Most contributions are **content** - new cases, guide sections, references - and need no coding.

Read the [editorial policy](EDITORIAL_POLICY.md) and [disclaimer](DISCLAIMER.md) first.

## Adding a case

1. Copy `content/cases/01-vipassana-psychosis.yaml` to a new file, for example `content/cases/03-possession-trance.yaml`. The number sets the order on the site.
2. Edit the fields described below. Keep `status: draft`.
3. Add any new references to `content/references.bib` and cite them by key.
4. Run `npm run validate` to check the file, then `npm run dev` to try it at http://localhost:4321.
5. Open a pull request. Name the reviewers you would suggest.

### Case file format

```yaml
title: Short, memorable title
subtitle: One-sentence presentation
tags: [Topic, Diagnosis]
status: draft            # draft | published | hidden
minutes: 15
authors: [Dr A Author]
reviewers: []            # filled in at peer review
last_reviewed: 2026-11
learning_objectives:
  - ...
vignette: |
  Markdown. The opening presentation.

stages:
  - id: unique-id        # lowercase-with-hyphens
    title: Step title
    body: |
      Markdown. New information revealed at this step.
    question: The question for this step (Markdown allowed)
    options:
      - text: Option text
        rating: best      # best | acceptable | poor | unsafe
        feedback: |
          Why this option is or is not right.
        next: other-stage-id   # optional - branch to a different stage
    pearl: |              # optional - shown after answering
      A memorable clinical point.
    guide_links: ["differentials#mania"]   # guide-page-slug#section-id
    end: true             # on the final stage only

teaching_points:
  - Markdown, one point per line
references: [bibkey1, bibkey2]
```

**Ratings and scoring.** `best` scores 2, `acceptable` 1, `poor` and `unsafe` 0. Each stage should have exactly one `best` option. Use `unsafe` only when the option could cause real harm.

**Linking to the guide.** In any Markdown text, write `[link text](guide:frameworks#lukoff)`. In `guide_links`, use `"frameworks#lukoff"`. The page slug is the guide file name without its number prefix.

**Branching.** Stages run in file order by default. To branch, add `next:` to an option. A stage can also have its own `next:` to skip ahead.

## Adding to the guide

Guide pages are Markdown files in `content/guide/`. Each section that cases can link to needs:
- an entry under `sections:` in the front matter, with `id`, `title` and a one-sentence `summary` (shown as a hover preview inside cases), and
- a matching heading in the body: `<h2 id="your-id">Heading</h2>`.

## Code changes

The site is built with [Astro](https://astro.build) and React. Components are in `src/components/`. Keep the site static: no backend, no accounts, no data collection.
