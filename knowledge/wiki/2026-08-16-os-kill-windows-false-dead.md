# Lesson: `os.kill(pid, 0)` on Windows — False DEAD for Other Processes

**Date:** 2026-08-16
**Context:** Single-instance guard in `litellm_watchdog.py` (code-critic A7).
The watchdog liveness check via pid file used `os.kill(pid, 0)` —
and reported "process dead" (stale) for a **living** watchdog (PID 8760).
The "stale pid file" conclusion was wrong; based on it a second watchdog copy
could have started on top of the living one.

## What Happens

`os.kill(pid, 0)` on Windows:
- For **own** PID — works (OK, alive);
- For **another process's** living PID — throws `WinError 87` ("The parameter is incorrect")
  → looks like a dead process (false DEAD).

Why: on Windows `os.kill` is implemented via OpenProcess/TerminateProcess and
for signal 0 does not do a proper existence check for another process.
This is POSIX semantics — on Windows it doesn't work for foreign PIDs.

## Verified (Windows, Python 3.14)

| Trial | os.kill(pid,0) | OpenProcess(0x1000) |
|-------|---------------|---------------------|
| self (own PID) | OK | True |
| other living (8760, watchdog) | WinError 87 | True |
| nonexistent (99999999) | OSError | False |

## Correct Solution

```python
def pid_alive(pid: int) -> bool:
    try:
        import ctypes
        h = ctypes.windll.kernel32.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
        if h:
            ctypes.windll.kernel32.CloseHandle(h)
            return True
        return False
    except Exception:
        try:
            os.kill(pid, 0)  # fallback: own PID / POSIX
            return True
        except OSError:
            return False
```

## Lesson

- **On Windows, check other process liveness via `OpenProcess` (ctypes),**
  not via `os.kill(pid, 0)` — the latter gives false DEAD.
- **The guard test must use a FOREIGN living PID**, not own: test with
  own PID passes even when logic is broken (os.kill(self) works).
  The integration test used own PID — that's why the bug wasn't caught immediately.
- First code-critic pass found a real problem (no single-instance
  guard), but my first fix contained a platform bug — found via
  self-check in the next cycle (checking a living process via tasklist).

## ADDENDUM (same day, 13:05): OpenProcess Is INSUFFICIENT — zombie PID

**Incident:** watchdog 8760 died with the proxy (~12:41-12:53). But
the single-instance guard on its PID **blocked starting a new watchdog** —
proxy :4000 was down without a guard (raised manually, PID 24672).

### What Happens

`OpenProcess(0x1000)` successfully opens a **zombie object** of a terminated
process if the parent still holds a handle to it. In this case:
- `GetProcessId(handle)` returns the **old PID** (object still exists);
- tasklist / Get-Process / Get-CimInstance **don't show it** — process is gone;
- `WaitForSingleObject` → WAIT_FAILED (0xFFFFFFFF) — indistinguishable;
- `GetExitCodeProcess` → 0xFFFFFFFF for zombie, **259 (STILL_ACTIVE)** for living.

| Trial | OpenProcess | GetExitCodeProcess | Conclusion |
|-------|-------------|-------------------|------------|
| zombie 8760 (dead, parent holds handle) | handle | 0xFFFFFFFF | DEAD |
| living 24672 (proxy) | handle | 259 | ALIVE |
| living 4052 (python) | handle | 259 | ALIVE |
| nonexistent 99999999 | NULL | — | DEAD |

### Correct Solution (Final)

```python
def _pid_alive(pid: int) -> bool:
    try:
        import ctypes
        k = ctypes.windll.kernel32
        k.OpenProcess.restype = ctypes.c_void_p
        k.OpenProcess.argtypes = [ctypes.c_uint32, ctypes.c_int, ctypes.c_uint32]
        k.GetExitCodeProcess.restype = ctypes.c_int
        k.GetExitCodeProcess.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_uint32)]
        h = k.OpenProcess(0x1000, False, pid)
        if not h:
            return False
        try:
            code = ctypes.c_uint32()
            ok = k.GetExitCodeProcess(h, ctypes.byref(code))
            return bool(ok) and code.value == 259  # STILL_ACTIVE
        finally:
            k.CloseHandle(h)
    except Exception:
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False
```

**Full picture of Windows liveness checking (3 tiers):**
`os.kill(pid,0)` → false DEAD for foreign living; `OpenProcess` → false ALIVE
for zombie; reliable only `OpenProcess` + `GetExitCodeProcess == 259`.

### Lesson

- OpenProcess handle ≠ process alive. If parent didn't release the object — PID
  "hangs": OpenProcess opens, GetProcessId returns old PID, but
  process is not in tasklist or Get-Process.
- The only reliable Windows test: OpenProcess + GetExitCodeProcess ==
  STILL_ACTIVE (259). Zombie gives 0xFFFFFFFF, living gives 259.
- Symptom "guard blocks start, but process invisible in tasklist" → zombie.
- The incident showed: the "fix" from the first part of this lesson was incomplete.
  Real verification — only live run with real PIDs (zombie,
  living, nonexistent) + integration test.

### Files

- `_scripts/litellm_watchdog.py` — `_pid_alive()` (OpenProcess +
  GetExitCodeProcess == 259, fallback os.kill)
- `_scripts/test_litellm_watchdog.py` — +1 zombie regression (21/21 OK)
- Commits: `12a0f7fda` (OpenProcess fix), `454acfe03` (zombie fix)
- Finding: `knowledge/findings/2026-08-16-A7-code-critic-review.md`

## ADDENDUM (13:51): CROSS-POLLINATE — pattern doesn't repeat elsewhere

Checked across `_scripts/*.py` (excluding litellm_watchdog and tests):
- `os.kill(pid,0)` / `OpenProcess` liveness checks don't exist elsewhere;
- the only neighbor with a similar task — `restart_proxy_clean.py` — already
  uses `psutil.process_iter` (reliable; psutil on Windows iterates a
  snapshot, zombie is not reported as living) and warns about
  `os.kill(0)` (process group signal) in comments.
- Verdict: nowhere to migrate, bug is isolated to one file, fix `454acfe03`
  remains the only place with this logic. Regression is additionally
  insured: `test_litellm_watchdog.py` 21/21 OK (re-verified 16.08 13:53).
