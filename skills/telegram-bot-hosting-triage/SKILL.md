---
name: telegram-bot-hosting-triage
description: "Choose a practical hosting and API strategy for a Telegram LLM bot, separating bot runtime, model API, persistence, and webhook/polling constraints. Use when someone asks where to host a Telegram AI bot, wants a free 24/7 deployment, has no API key or infrastructure, or is deciding whether to build, self-host, or use an existing public bot."
---

# Telegram Bot Hosting Triage

Use this skill to prevent a common planning mistake: treating hosting, AI access, and Telegram delivery as one problem.

## Quick decision table

| Situation | Recommendation |
|---|---|
| The user only needs to chat and has no API key | Test an established public AI bot or the official app first; do not build infrastructure by default. |
| A custom bot is required and an API key exists | Use a small always-on VPS or VM with Docker and a mounted data directory. |
| The bot uses long polling | Prefer a continuously running worker/VM; many free web tiers sleep or do not offer workers. |
| A free serverless tier is the only option | Rewrite for Telegram webhooks and move state to durable storage; do not pretend it is a drop-in host. |
| Chat history matters | Store the session file/database on persistent storage and test restart recovery. |

## Required separation

Before recommending a platform, answer four independent questions:

1. **Telegram delivery:** long polling or webhook?
2. **Model access:** whose API key, endpoint, quota, and billing?
3. **Runtime:** where does the process stay alive?
4. **State:** where do chats survive a restart or redeploy?

A free VM can solve only item 3. It does not provide a free or unlimited LLM API.

## Minimal deployment path

For a small private bot with an OpenAI-compatible endpoint:

1. Keep the Telegram token and model API key in environment variables or the host secret store; never commit them or put values in documentation.
2. Build a minimal Docker image with the bot and its pinned requirements.
3. Mount a durable directory, for example `/data`, for the session database/JSON and logs.
4. Run the worker continuously and configure restart-on-failure.
5. Smoke-test `getMe`, model discovery, one chat completion, and a restart/reload of history.
6. Restrict access with a Telegram user/chat allowlist before sharing the username.

## Feature-fit check

For a ChatGPT-like Telegram experience, verify the actual implementation rather than assuming it:

- multiple sessions and switching;
- regenerate tied to a specific turn, not merely the latest answer;
- edit prompt and regenerate;
- edit answer as an instruction;
- cancellation while generation is running;
- concurrent callbacks protected by the same per-chat lock;
- persistence migration and corrupted/empty state handling.

## What did not work

- A free sleeping web service is not a reliable host for long polling.
- A free host does not remove model-provider quotas or the need for an API key.
- Root-level test discovery may report zero tests for a hyphenated standalone project; run the suite from the project directory.
- Do not accept a deployment as live-verified when only syntax and unit tests passed.
- Do not collect a user's API key in ordinary Telegram messages without an explicit security design, encryption, deletion path, and threat model.

## Verification contract

Report separately: unit/syntax checks, live Telegram smoke, live model smoke, persistence recovery, and the current host/provider limits. If any item was not tested, say so.
