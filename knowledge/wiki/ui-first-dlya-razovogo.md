# Lesson: Everything Has a Human Interface (UI-first for One-shot)

**Date:** 2026-08-02
**Context:** Setting up payout method on OpenTask. I wrote a whole standalone script `_scripts/opentask_payout.py` (with API schemas, scopes, upserts), and then warned that the token lacked `payments:write` scope and a new token needed to be created. The owner replied: "I'll just add it through the site UI. You always forget that everything has a human interface."

## What Happened
For a one-time setup (register a wallet once), I chose the heaviest path — API script + token editing, instead of saying "click Account → Wallets, enter address, done in a minute."

## Lesson
- **One-time action → UI first.** Every platform has a human interface: Account → Wallets, Settings, Profile, Tokens. For one-time setup it's almost always faster and safer than the API path.
- Scripts/API are justified for **repeating** or **verifiable** actions: monitoring, auto-bidding, status checks, automation.
- If writing a script — immediately name the UI alternative too, not just "update the scope on the token."

## How to Prevent
- Before writing any setup script, ask: "is this one-time or on schedule?"
- One-time → point user to the UI path (specific menus/clicks), script not needed.
- Repeating → script, and still mention in the output where the same thing is done in UI.

## Result
Script `opentask_payout.py` stayed (useful for `check` and address change), but the owner registered the method manually in UI. Rule added to `_memory/USER.md`: UI-first for one-time setups.
