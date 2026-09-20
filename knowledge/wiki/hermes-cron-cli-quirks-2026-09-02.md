# Lesson: hermes cron CLI quirks (learned 2026-09-02 during cron rework)

## Symptom
Programmatic job creation via `hermes cron create` silently failed or mangled
prompts in three independent ways.

## Quirks (all verified live)

1. **Positional prompt after optionals is rejected.**
   `hermes cron create "0 20 * * *" --name X --prompt ... <prompt>` →
   `error: unrecognized arguments: <prompt>` (argparse fails to match the
   positional once optionals start). Fix: prompt MUST sit immediately after
   the schedule positional, flags last:
   `hermes cron create "0 20 * * *" "<PROMPT>" --name X ...`

2. **create exits rc=0 even on failure.**
   `create` without a prompt prints `Failed to create job: create requires
   either prompt or at least one skill` and returns **exit code 0**.
   Fix: never trust the exit code alone; grep stdout for `Failed to` /
   `error:` and treat it as failure.

3. **Multiline args survive subprocess when shell=False.**
   With `shell=True` on Windows, multiline prompt args get mangled by
   cmd.exe parsing. Direct exec of `hermes.EXE` (resolved via
   `shutil.which`) with a list argv passes newlines intact.

4. **jobs.json persistence is asynchronous.**
   After `create`, the job may not appear in `jobs.json` immediately
   (gateway batch-write). Read-back loops need retry/backoff (~2s x3 was
   enough), or a later `apply` re-run converges.

## Standing rule
All jobs.json mutations go through `cron/cron_apply.py`, which encodes all
four workarounds. Do not call `hermes cron create` ad hoc for jobs with
multiline prompts.
