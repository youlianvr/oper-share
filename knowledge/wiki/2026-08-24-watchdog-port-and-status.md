# Lesson: watchdog double-silent — kill-port mismatch + stale-pid status lie (A1)

**Date:** 2026-08-24
**Context:** DEEP REVIEW of `_kill_port4000.py` after TEST GAP on rarely-checked
projects. Two silent bugs in the watchdog restart chain, uncovered live when a
manual kill of the proxy (my own mistake) showed the watchdog was not restarting it.

## Bug 1 — kill script cleaned :4001, proxy lives on :4000

`_kill_port4000.py` read `os.environ.get("PROXY_PORT", "4001")` — the default was
**4001**, while the whole proxy family resolves **4000** (`proxy_config.json` port,
`proxy_state._resolve_proxy_port`, `litellm_watchdog._get_proxy_port`,
`proxy_desktop_launcher._resolve_port`). The watchdog restart path
(port alive + /health dead → 3 failures → kill → start) killed :4001, leaving the
wedged :4000 proxy alive; the fresh `start_proxy` then failed to bind → endless
"НЕ ЗАПУСТИЛСЯ" loop.

## Bug 2 — `--status` printed the pid file, not liveness

`--status` only checked `PID_FILE.exists()`. The watchdog died (PID 32316) while
the pid file remained — `--status` printed `Watchdog PID: 32316` and looked
healthy. The proxy sat unguarded; nobody would have noticed until the next manual
check.

## Rules

1. **Every port resolver in the proxy family must use the same precedence:
   `proxy_config.json/{port}` > `PROXY_PORT` env > default 4000.** A diverging
   default (4001) silently breaks the restart path.
2. **A status check must verify process liveness (`_pid_alive`), never pid-file
   presence.** A pid file is a leftover, not evidence.
3. **Never launch the watchdog under `timeout N`** — the process dies after N
   seconds. Correct: `nohup python litellm_watchdog.py --daemon &` (detaches from
   the wrapper so it survives).
4. **Never run a kill-port helper without an explicit port argument against a
   live port** — it kills the proxy. That's how this was discovered (self-inflicted;
   a live watchdog would have restarted it honestly).

## Fix

`5851478a6`: `_kill_port4000` — argv > env > default 4000, `resolve_port`/`find_pid`
extracted (testable); watchdog passes `PROXY_PORT`; `--status` uses `_pid_alive`;
`main()` extracted. +13 tests. ERROR_LOG entry `388dd7b84`.

## Family audit (2026-08-24)

Full resolver (config > env > 4000): `proxy_state`, `proxy_desktop_launcher`,
`litellm_watchdog`. Env-only (no config read): `proxy_probe`, `restart_proxy_clean`
— identical behavior while the config port is 4000; will diverge if the port
changes. Not fixed (no current impact), documented here.
