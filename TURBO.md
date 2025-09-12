Turbopack (Next.js "--turbo")

What this does

- Runs Next.js dev server using Turbopack, a faster bundler from Vercel. It can significantly improve cold-start and incremental rebuild times.

How to run

- Use the npm script:

  npm run dev:turbo

- The project already includes a `dev:fast` script which also passes `--turbo` and uses `next.config.fast.mjs`.

Caveats

- Turbopack is focused on development speed. Some features or Next.js plugins may not be fully compatible yet.
- If you hit unexpected bundling issues, fall back to `npm run dev`.
- For CI and production builds, continue to use `next build` / `next start`.

Notes

- The repo already exposes `dev:fast` which uses a faster config file (`next.config.fast.mjs`). `dev:turbo` is a simple convenience script for most dev use-cases.
