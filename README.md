# Vice City Trophy Atlas

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ted666/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ted666/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

The best guide and tracker for the 55 PlayStation 5 trophies of **Grand Theft Auto VI** — a make.fun bounty entry.

## What it is

An offline web app (static files under `app/`, no build step, no network requests) that is both a guide and a tracker:

- **Tracker** — a checklist of all 55 trophies with the official name, description and grade for each; progress saves in the browser (localStorage), exportable to a file and importable back. Counters for PSN's targets (250 stunts, 42 shooting-range golds, $250,000 laundered, …), per-trophy notes, search, and filters by kind (story, missable, collectibles, activities, online) and grade.
- **Spoiler setting** — hides the names, descriptions and guides of hidden story trophies until they are earned.
- **Roadmap to the platinum** — three stages (story first, 60–80 h; the 100% checklist, ~100 h; character quests and cleanup, ~10 h), with per-stage progress and the one missable trophy flagged.
- **Missables page** — the only missable trophy, Positive Mental Attitude, and why the others are safe.
- **Cited guidance** — every trophy's guide is written for this entry in our own words and names the source its facts come from (Exophase, PSNProfiles, PowerPyx, GTA Zone). A guide that repeats the trophy's description adds nothing; a specific location or step with no source gets no credit.
- **Next up planner** — the next 5 unearned trophies in roadmap order.
- **Honesty note** — the game launched 19 November 2026. Five trophies still have no confirmed method; their guides say so plainly and label the community's best guess as a guess, instead of inventing a step.

## The list

55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze. 28 hidden, 1 missable, 0 online. The official names, descriptions and grades were verified against Exophase and PSNProfiles (the two agree on every name, description and grade). The full data is in `app/data/trophies.json`.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Everything works offline: open `app/index.html` in a browser and no network request is made.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.

## License

MIT — see `LICENSE`.
