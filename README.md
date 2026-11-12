# Altered States in Psychiatric Practice

An open, peer-reviewed case library for psychiatry trainees on presentations involving **religious, spiritual and psychedelic experiences** - and the question of when they are illness.

- **Cases** - interactive, branching cases with feedback on every option
- **Differential guide** - the reference layer behind the cases: clinical stance, diagnostic frameworks (DSM-5-TR Z65.8, ICD-11 trance disorders, Lukoff's criteria), differentials and red flags
- **Quiz** - an 8-item core-knowledge quiz for pre- and post-testing

The site is fully static. It has no backend, no accounts, and collects no data.

> **Status:** v0.1 - two draft cases, not yet peer reviewed. See the [editorial policy](docs/EDITORIAL_POLICY.md).

## Run locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # http://localhost:4321
npm run validate   # check case files
npm run build      # static site in dist/
```

## Publish on GitHub Pages

1. Create a new repository on GitHub named `altered-states-psychiatry` and push this folder to the `main` branch.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` validates the cases, builds the site and publishes it at `https://<your-username>.github.io/altered-states-psychiatry/`.

## Project structure

```
content/
  cases/           one YAML file per case
  guide/           differential guide (Markdown)
  quiz/            core-knowledge quiz
  references.bib   shared bibliography
src/components/    CaseRunner, Quiz, GuideLink
src/pages/         site routes
docs/              CONTRIBUTING, editorial policy, disclaimer
scripts/           case validator
```

## Contributing

Most contributions are content and need no coding. See [CONTRIBUTING](docs/CONTRIBUTING.md).

## Citation

See [CITATION.cff](CITATION.cff). Each tagged release can be archived on Zenodo for a citable DOI.

## Licence

- Code: [MIT](LICENSE)
- Content (cases, guide, quiz): [CC BY-NC-SA 4.0](LICENSE-CONTENT.md)

## Disclaimer

For education only. Cases are fictional composites. This resource does not replace clinical assessment, supervision or guidelines, and does not provide guidance on obtaining or using any substance. See the [full disclaimer](docs/DISCLAIMER.md).
