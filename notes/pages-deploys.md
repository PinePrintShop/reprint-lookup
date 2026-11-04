# GitHub Pages publishing problems

The site (`https://pineprintshop.github.io/reprint-lookup/`) is published by GitHub's own "pages build and deployment" run after every merge to `main`. Each run publishes the whole site, so a later successful run also publishes anything an earlier failed run missed.

## 2026-11-04: deploy stuck after Mockup Maker v197
- Run 2187 (PR 599, Mockup Maker v197) timed out on GitHub's side: "updating_pages" for 11 minutes, then "Timeout reached, aborting". It wasn't a code problem; the 20 runs before it were all fine.
- A re-run of its failed job sat in GitHub's queue and never started. The API wouldn't cancel it either ("Cannot cancel a workflow re-run that has not yet queued").
- Run 2188 (PR 600, Receiving v88) failed in a minute: "in progress deployment … Please cancel 46ea0a3 first". Its re-run also sat in the queue.
- Fix tried: a new commit to `main` (this note) to start a fresh publish of the whole site.
- **If this happens again:** open the run on the Actions tab and click **Cancel workflow**. If that won't cancel it either, wait: GitHub clears a stuck queue on its own (check githubstatus.com). Any later merge publishes everything.
