# Contributing an example

Every top-level example directory is a complete app that can be deployed on Tokay.
Keep it ordinary. Do not add a Tokay manifest, deployment YAML, or wrapper that makes
otherwise working code platform-specific.

## Publication contract

An example is published on tokay.io only when all of these are true:

1. Its slug appears once in `manifest.json`.
2. It has one matching `catalog/<slug>.json` record.
3. Its directory contains a tracked `README.md` and only reviewed, deployable files.
4. Its README follows the section contract below.
5. Every related use case in its catalog names a published guide.

`manifest.json` owns category order, example order, and the curated Featured list.
The root README mirrors that order for GitHub visitors. Each example appears in one
primary category and may appear once more in Featured.

`catalog/<slug>.json` contains site metadata that does not belong in the deployable
app. Do not put catalog records inside example directories because downloads must not
look like they require Tokay metadata.

## README contract

Start with one `#` title. Follow it with a concrete description of the app and its
real features. That first sentence becomes the site summary and search description,
so it must make sense on its own. The next sentence should pair the app with Tokay and
the customer facing service type.

Use the next paragraph to explain the shape of the code and why it works well on
Tokay. Write for someone deciding whether this example solves their problem. Lead
with what they get, then explain the mechanism.

Apps with a visible interface or several endpoints need a `## What it does` section.
Guide the reader through the real interface and name the labels they will see. Keep
APIs, migrations, and other plumbing in `## How it works`.

Immediately after the introduction, add this section with the example's slug:

```md
## Guide and download

Read the full guide at https://tokay.io/examples/<slug>. You can also download the
complete project at https://tokay.io/examples/downloads/<slug>.zip.
```

Keep workload specific setup, ways to try the app, failure behavior, secrets, and
growth paths. Use `## Try it` for a short proof with two or three steps. Do not repeat
the same behavior in the lede, `## What it does`, and `## Try it`.

Use a Secrets table only when the app needs at least one real secret. Otherwise write
one sentence that explains what Tokay supplies. Never add a table row that says
`None`. Do not add a `## What's not in this repo` section.

The site generator excludes the standard guide section and repeated deployment
procedures from the rendered page. It also rejects a sentence repeated across three
or more published example guides. Shared deployment procedures are exempt because
they do not reach the site.

Write as Tokay speaking to the reader. Use `you` and `we`. Keep the tone warm and the
delivery firm. Do not use em dashes, semicolons, colons in prose, invented metaphors,
or compound modifier hyphens. Periods close sentences.

Use `##` headings only. The generator deliberately rejects deeper headings, raw HTML,
and unsupported Markdown instead of guessing how they should render.

## Catalog relations

`relatedUseCases` is an ordered array of unique guide slugs. Put the most specific
guide first because that is the guide linked from the example page. Add a service
type flagship only when this example is one of the strongest representatives for that
guide. A matching service type alone is not enough. Keep `deploy-webapp` focused on
generic web deployment instead of listing every specialized app that serves HTTP.

An empty array needs a nonempty `relatedUseCaseException`. The exception is not
allowed when the array has an entry.

## Merge coordination

Merge to `main` only when the example, README, catalog record, and root catalog are
site-ready together. The website pins an exact repository commit. It never fetches a
moving revision during a normal documentation build.

This repository follows `../platform/CLAUDE.md` § Git Workflow verbatim, including
"ship it", "sync it", and "release the gecko".
