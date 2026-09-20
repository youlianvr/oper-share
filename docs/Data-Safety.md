# Data Safety — Never Destroy, Trash-Only Rule (HIGHEST PRIORITY)

> **Source of truth for the Trash-Only Rule.** The constitution (`AGENTS.md`)
> keeps a one-line pointer to this document. This rule is the highest-priority
> safety rule and applies in ALL postures, including Experimental.
>
> Status: normative. Belongs to the Data Safety cluster of the Oper constitution.

---

**You MUST NEVER destroy data by ANY means. EVER. No exceptions.**

This rule covers ALL methods — not just obvious ones. If a command can
delete, truncate, overwrite, or erase data — do NOT use it.

## Forbidden — ALL of these, not just rm

```
# Shell commands
rm, rm -f, rm -rf, rmdir, del, del /f, erase, rd, unlink

# PowerShell (every alias)
Remove-Item, ri, rm, rd, del, erase, rmdir

# Python
os.remove(), os.unlink(), os.rmdir(), shutil.rmtree()

# Node.js
fs.unlinkSync(), fs.unlink(), fs.rmSync(), fs.rm(), fs.rmdirSync(), fs.rmdir()

# Truncation (data loss without deletion)
: > file       # bash truncate
echo "" > file # overwrite with empty
cat /dev/null > file  # truncate

truncate -s 0  # size truncation

# Any other command that destroys data
DEL, ERASE, RD  (cmd.exe)
Remove-Item, ri (PowerShell aliases)
```

## Safe alternatives — use these INSTEAD

```
_scripts/trash.ps1 -LiteralPath <file/dir>  # Native PowerShell
_scripts/trash.sh <file/dir>                # Bash/Cygwin/WSL wrapper

trash-safe <file/dir>          # bashrc function — interactive terminal only
trash <file/dir>               # alias for trash-safe
recycle                        # opens Recycle Bin in Explorer
korzina                        # alias for recycle (Russian)
git checkout HEAD -- <file>    # if tracked — instant restore
```

Use `_scripts/trash.ps1 -LiteralPath` from native PowerShell and
`_scripts/trash.sh` from Bash/Cygwin/WSL. Both preserve spaces, quotes, and
Unicode names. `trash-safe`/`trash` only work when `~/.bashrc` is loaded.

## Why this rule exists

```
DESTROYING DATA IS ALWAYS THE WRONG CHOICE.
Every "deletion" should be a move to trash.
Trash is cheap. Recovery is expensive. Irreversible loss is catastrophic.
```

This rule overrides ALL other rules. If there is any conflict between
"faster to just rm" and "move to trash" — trash wins. Always.

In Experimental Posture this rule STILL HOLDS. Bold ≠ destructive.
There is NO scenario where destroying data is the right move.
