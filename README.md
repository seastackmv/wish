# wish

A citizen platform where anyone can post a problem they face or a wish for
something better, and anyone else can upvote and discuss it. The most-supported
entries surface each month as a shortlist of priorities.

Live at [wish.seastack.mv](https://wish.seastack.mv). Built for the Maldives,
but works for any community.

Posting, voting, and commenting are anonymous by default. Optional Google
sign-in just lets you attach your name.

> This repository is public for transparency. It is a single-maintainer project
> and is not seeking outside contributions, but you are welcome to read or fork it.

## What it does

- Post a wish or a problem, optionally with a photo
- Upvote the entries you relate to
- Discuss with threaded comments, anonymously or under your name
- Browse, filter, search, and sort by popularity or latest
- Monthly priorities: the top wishes and problems each month

## Tech

SvelteKit and TypeScript on Cloudflare Pages, with Tailwind CSS.

## Local development

```sh
bun install
cp .dev.vars.example .dev.vars   # fill in the values it lists
bun run dev
```

Scripts: `bun run dev`, `bun run build`, `bun run check`, `bun run preview`.

## Database migrations

Schema changes live in `migrations/` and are tracked in D1's `d1_migrations`
table, so each file is applied at most once.

```sh
bun run db:migrations      # list which migrations are still pending on remote
bun run db:migrate         # apply pending migrations to the production DB
bun run db:migrate:local   # apply them to the local dev DB
```

Add new migrations with the next number in sequence (e.g. `007_*.sql`). Prefer
additive, backwards-compatible changes and apply them **before** deploying code
that depends on them — otherwise the live site can 500 in the gap between deploy
and migration.

## Deployment

Every push to `main` is built and deployed automatically by Cloudflare Pages.
Runtime bindings and secrets are configured in the Pages dashboard.

Pending migrations are applied automatically by the `D1 migrations` GitHub
Action (`.github/workflows/migrate.yml`) whenever a push to `main` touches
`migrations/`. It needs two repository secrets: `CLOUDFLARE_API_TOKEN` (with
`D1:Edit`) and `CLOUDFLARE_ACCOUNT_ID`. You can also run `bun run db:migrate`
by hand at any time.

## License

Released under the [MIT License](LICENSE).
