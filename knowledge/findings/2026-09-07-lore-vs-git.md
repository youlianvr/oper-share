# Brief: Epic Games Lore vs git (2026-09-07)

Owner question: "сравни с гит". Sources: github.com/EpicGames/lore README,
epicgames.github.io/lore (MIT, Rust, pre-1.0).

## What Lore is
Open-source VCS by Epic, built for repos mixing code with LARGE binary assets
(games/entertainment). Pre-1.0 — formats/APIs change between releases. It is
UEFN's built-in VCS, but the open-source build can't yet interop with UEFN
repositories (proprietary compression). MIT, Rust, CLI-first + full API surface
(C/C++, C#, Rust, Go, Python, JS).

## vs git (what actually differs)

| Aspect | git | Lore |
|---|---|---|
| Large binaries | blobs stored fully; git-lfs as a bolt-on (separate server, manual pointer hygiene) | shared data + on-demand download in the core; dedup across history |
| Team scale | OK to thousands; binary-heavy repos choke | designed for "unprecedented scalability of data and teams" |
| Branching | cheap, but binary merges/lockfile conflicts hurt | "free branching" as a first-class goal; scalable locking on the roadmap |
| History integrity | commit graph (SHA-1/SHA-256) | verifiable, tamper-evident source of truth (auditable history) |
| Ecosystem | universal (hosting, CI, tools) | none yet; pre-1.0; desktop client on roadmap |
| Our fit | workspace is markdown/code, tiny binaries | no pressure: our assets (images, mocap zips) are MB-scale |

## vs Perforce (the game-industry incumbent)
Perforce = central, per-file locking, licensing friction at scale. Lore aims at
the same workload with a distributed-friendly, open model — that's the actual
target of "устал от ограничений традиционных систем" in the TG post.

## Verdict for us
Watch, don't adopt: pre-1.0 (explicit warning), zero ecosystem, and our repos
have no binary-storage pain that git-lfs doesn't already cover. Revisit when
(1) a game-asset project of ours exceeds GB-scale assets, or (2) Lore hits 1.0
with hosting story. Saved as reference; no clone (README+docs suffice).
