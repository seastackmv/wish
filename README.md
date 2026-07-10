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

## Deployment

Every push to `main` is built and deployed automatically by Cloudflare Pages.
Runtime bindings and secrets are configured in the Pages dashboard.

## License

Released under the [MIT License](LICENSE).
