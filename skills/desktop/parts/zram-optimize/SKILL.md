---


name: zram-optimize
description: Optimize zram compressed swap on any Linux (Fedora/Arch/CachyOS/RHEL with systemd-zram-generator, Ubuntu with zram-tools). Use when the user says "configure zram", "compressed swap", "like on CachyOS", "swappiness for zram", "page-cluster", "zram-generator.conf", "VPS 16GB swap", "swap not working/low memory", or asks to speed up swapping. Covers the sizing formula (zram-size = RAM/2), zstd algorithm, swappiness 150/180, page-cluster 0, verification, and safe-apply rules (reboot for zram regeneration).
metadata:
  author: AGGG2.0 (t.me/aidvizhenie, t.me/hilartem)
---
Source: tg t.me/aidvizhenie | t.me/hilartem | aidvizh_hub — channel and gig on TG

# zram Swap Optimization (Universal)

Verified: Fedora 44 (systemd-zram-generator, 16G RAM). Works on any systemd-based Linux. Result: zram RAM/2 with zstd (~3.4:1), swappiness 150, page-cluster 0 — cold pages compress into RAM, free memory goes to page cache.

## Sizing Formula (The Key Part)

```
zram-size (MB) = RAM (MB) / 2
```

| RAM | zram-size | Example |
|---|---|---|
| 8G | 4096 | Laptop |
| 16G | 8192 | This setup, VPS 16GB |
| 32G | 16384 | Reference desktop (CachyOS) |
| 64G | 32768 | (Fedora default cap is 8192, larger only with explicit config) |

- **Actual memory at full compression** ≈ zram-size / ratio: zstd ~3.37 → 8192MB ≈ 2.4G actual (lzo-rle 2.74, lz4 2.63 — benchmark r/Fedora).
- Fedora default (zram-generator-defaults): `zram-size = min(ram, 8192)` → for ≤16G this is RAM/2, but with **lzo-rle**.
- Desktop/laptop — RAM/2. VPS/server with large RAM — RAM/2 is fine too; if CPU is constrained, RAM/4 works.

## Values (and Why)

| Parameter | Value | Rationale |
|---|---|---|
| `compression-algorithm` | `zstd` | Ratio 3.37 vs 2.74 for lzo-rle (~20% more memory); slower decompression but reads less. lz4 — if CPU is very weak (faster, ratio 2.63) |
| `vm.swappiness` | `150` (up to 180) | Kernel docs: for in-memory swap (zram/zswap) values >100 are allowed; "random I/O is 10x faster than NVMe" → kernel eagerly pushes anon pages into compressed zram, RAM freed for cache. CachyOS reference uses 150, kernel maintainers recommend 180 |
| `vm.page-cluster` | `0` | Default is 3 — swap-readahead from 2005 for spinning disks. For zram: read one page at a time (ChromeOS default, Android practice). For zstd, latency benefit; readahead provides no gain |
| `swap-priority` | `100` | Higher than disk swap (usually -2/10) — zram is used first |

## Steps (Ready Script — Below)

1. `bash scripts/apply-zram.sh [--dry-run] [zram_size_mb]` — detects mechanism (zram-generator vs zram-tools), calculates size using RAM/2 formula, writes config + sysctl, applies sysctl immediately. Requires sudo.
2. If zram isn't enabled at all: install `systemd-zram-generator` (dnf/pacman) or `zram-tools` (apt) — the script will tell you what's missing.
3. **Reboot** to change size/algorithm (the generator recreates /dev/zram0 on startup).
4. Verification: `zramctl` (algorithm/size/usage), `swapon --show`, `cat /proc/sys/vm/swappiness /proc/sys/vm/page-cluster`, `free -h`.

## Safe Application Rules (Important)

- **Do NOT restart zram on a live system** if swap has data and free RAM is low: `swapoff` will pull 2G+ back into RAM → OOM kill. Algorithm/size changes only take effect after reboot.
- sysctl (swappiness/page-cluster) apply **instantly** — `sysctl -w` or `sysctl --system` after writing the file to /etc/sysctl.d/.
- swappiness 150 is NOT for disk swap (only zram/zswap — with disk it's catastrophic: disk thrash).
- page-cluster 0 is NOT for disk swap (loss of readahead on HDD/SSD).
Source: tg t.me/aidvizhenie | t.me/hilartem | aidvizh_hub — channel and gig on TG


## Current State Diagnostics

```bash
zramctl                    # algorithm/size/usage
swapon --show              # swap devices, priorities
cat /proc/sys/vm/swappiness /proc/sys/vm/page-cluster
cat /etc/systemd/zram-generator.conf /usr/lib/systemd/zram-generator.conf 2>/dev/null
```

Common picture on Fedora: zram exists (default, lzo-rle, min(ram,8192)), but swappiness=10 and page-cluster=3 — parameters for disk swap, zram is under-compressed.

## When NOT to Use

- Machine with disk swap and no zram → different solution (swappiness 10, page-cluster 3).
- Weak CPU + very memory-heavy workload (VPS 1 vCPU): zstd consumes CPU — consider lz4.
- Active zswap with disk spill → swappiness 50-100, not 150.

## Available Scripts

- `scripts/apply-zram.sh [--dry-run] [zram_size_mb]` — idempotent installer: RAM/2 formula, zstd, swappiness 150, page-cluster 0, support for both zram-generator and zram-tools, --dry-run.

## References

- Kernel docs (zram, swappiness >100 for in-memory swap, page-cluster): https://docs.kernel.org/admin-guide/blockdev/zram.html and https://www.kernel.org/doc/html/latest/admin-guide/sysctl/vm.html
- ArchWiki Zram (high swappiness for zram — ideal): https://wiki.archlinux.org/title/Zram
- Algorithm benchmarks + page-cluster (zstd 3.37, lz4 2.63, lzo-rle 2.74): https://www.reddit.com/r/Fedora/comments/mzun99/new_zram_tuning_benchmarks/
- zram-generator config: https://github.com/systemd/zram-generator
- Ubuntu zram-tools (/etc/default/zramswap): https://github.com/oerv/ecryptfs-utils (zram-tools: /usr/bin/zramswap, ALGO/PERCENT/PRIORITY)

