# Altered States in Psychiatric Practice

An open, case library for psychiatry trainees on presentations involving **religious, spiritual and psychedelic experiences** - and the question of when they are illness.

- **Cases** - interactive, branching cases with feedback on every option
- **Differential guide** - the reference layer behind the cases: clinical stance, diagnostic frameworks (DSM-5-TR Z65.8, ICD-11 trance disorders, Lukoff's criteria), differentials and red flags
- **Quiz** - an 8-item core-knowledge quiz for pre- and post-testing

The site is fully static. It has no backend, no accounts, and collects no data.



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


## Licence

- Code: [MIT](LICENSE)
- Content (cases, guide, quiz): [CC BY-NC-SA 4.0](LICENSE-CONTENT.md)

## Disclaimer

For education only. Cases are fictional composites. This resource does not replace clinical assessment, supervision or guidelines, and does not provide guidance on obtaining or using any substance. See the [full disclaimer](docs/DISCLAIMER.md).
