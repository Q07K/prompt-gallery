# Prompt Gallery repository guidance

## Current operations and stale checkouts

The production site is hosted on **Cloudflare Pages**. GitHub Actions provides CI, plus a manual workflow that publishes **redirect-only** pages to the old GitHub Pages address (no app content). Read [docs/cloudflare-pages.md](docs/cloudflare-pages.md) for the production URL, project and build settings. Do not treat a historical Pages deployment or an old branch's pages.yml as the current hosting configuration.

For questions about the current site, deployment, analytics or SEO, first check the actual branch, HEAD, worktree and dirty state. A project opened in a new session may still be on an older content branch, while the migration was merged from another worktree.

Identify the original repository's remote with git remote -v, fetch its default branch when network access is available, and read the operations document from that updated remote ref. For this repository, when origin is Q07K/prompt-gallery, use:

```sh
git fetch origin main
git show origin/main:docs/cloudflare-pages.md
git ls-tree -r --name-only origin/main .github/workflows
```

Separate the checked-out source version, the latest main configuration and the currently deployed commit. Verify live deployment status in Cloudflare when claiming a release succeeded. If the network or account is unavailable, report the source/ref/date actually checked rather than asserting current deployment success.

## Preserve ongoing work

Keep unrelated modified and untracked files. Do not switch, reset, pull/merge or stash a dirty content checkout just to answer an operations question. Read updated refs without changing the checkout; implement new work in a clean managed worktree based on the original repository's latest default branch. Update operations guidance in the usual project folder after an infrastructure change without overwriting content work.

## Prompt publishing

Use [.agents/skills/prompt-gallery-workflow/SKILL.md](.agents/skills/prompt-gallery-workflow/SKILL.md) for creating, testing and publishing photo transformation prompts. Keep the user's review and authorization boundaries. Run the applicable checks described in [docs/testing-and-deployment.md](docs/testing-and-deployment.md).

After an authorized merge, verify both the merge commit's GitHub CI and its **Cloudflare Pages production deployment**, then check the public prompt URL. CI success alone is not deployment success. Sitemap submission, sitemap fetching and actual search indexing are separate states.
