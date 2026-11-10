# GitHub Pages publishing problems

The site (`https://pineprintshop.github.io/reprint-lookup/`) is published by GitHub's own "pages build and deployment" run after every merge to `main`. Each run publishes the whole site, so a later successful run also publishes anything an earlier failed run missed.

## 2026-11-04: deploy stuck after Mockup Maker v197
- Run 2187 (PR 599, Mockup Maker v197) timed out on GitHub's side: "updating_pages" for 11 minutes, then "Timeout reached, aborting". It wasn't a code problem; the 20 runs before it were all fine.
- A re-run of its failed job sat in GitHub's queue and never started. The API wouldn't cancel it either ("Cannot cancel a workflow re-run that has not yet queued").
- Run 2188 (PR 600, Receiving v88) failed in a minute: "in progress deployment … Please cancel 46ea0a3 first". Its re-run also sat in the queue.
- Fix tried: a new commit to `main` (this note) to start a fresh publish of the whole site.
- **If this happens again:** open the run on the Actions tab and click **Cancel workflow**. If that won't cancel it either, wait: GitHub clears a stuck queue on its own (check githubstatus.com). Any later merge publishes everything.

## 2026-11-05 · GitHub 500s on deploy
- PR 612 (Mockup Maker v207) and PR 613 (notes): the build passed, then "Deploy to GitHub Pages" failed with "Failed to create deployment (status: 500) … Server error, is githubstatus.com reporting a Pages outage?". The same minute, GitHub's API also returned 500 on a PR create.
- A re-run of the failed job sat queued for over 10 minutes. As on Nov 4, a fresh merge to main publishes everything: this entry is that merge.

## 2026-11-06 · "Deployment failed, try again later" (Topo Packing v11)
- Run 2242 (PR 654, Topo Packing v11): the build passed; "Deploy to GitHub Pages" sat in `deployment_queued` for 40 s, then "Deployment failed, try again later." A GitHub-side failure; the code built fine.
- Fix: a fresh merge to main (this note), which republishes the whole site.

## 2026-11-09 · deploy stuck after Mockup Maker v248
- Run 2278 (PR 690, Mockup Maker v248 + tabs preview): the build passed in 40 s, then "Deploy to GitHub Pages" hung for over 5 minutes. Stephen: "they still haven't loaded".
- Fix: cancelled the run through the API (this time it accepted), then merged this note to main, which republishes the whole site.

## 2026-11-10 · deploy stuck after Mockup Maker v255
- Run 2286 (PR 698, Mockup Maker v255): the build passed, then "Deploy to GitHub Pages" hung for over 4 minutes. Cancelled through the API, then this note was merged to republish the whole site.
