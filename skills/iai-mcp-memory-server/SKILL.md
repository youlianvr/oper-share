---

name: iai-mcp-memory-server

description: Local MCP memory server for AI coding assistants with verbatim recall, semantic search, and automatic session capture

triggers:

  - set up iai-mcp memory server

  - configure long-term memory for Claude

  - install iai-mcp capture hooks

  - debug iai-mcp daemon issues

  - query iai-mcp memory store

  - benchmark iai-mcp performance

  - troubleshoot memory recall

  - migrate iai-mcp embeddings

---


# iai-mcp Memory Server


> Skill by [ara.so](https://ara.so) — MCP Skills collection.


## What It Is


iai-mcp is a local MCP server that provides long-term memory for AI coding assistants (Claude Code, Codex CLI, etc.). It captures every conversation turn verbatim, stores them encrypted with semantic embeddings, and automatically recalls relevant context at session start. All data stays local with no telemetry.


**Key Features:**

- ≥99% verbatim recall at 10k memories

- <100ms p95 recall latency

- AES-256-GCM encryption at rest

- Automatic capture/recall via hooks

- LanceDB vector storage with bge-small-en-v1.5 embeddings

- Background consolidation and duplicate merging


## Installation


### Prerequisites Check


```bash

# Verify requirements

python3 --version  # Must be 3.11 or 3.12

node --version     # Must be 18+

uname -m           # Apple Silicon recommended

```


### Install the Server


```bash

git clone https://github.com/CodeAbra/iai-mcp.git

cd iai-mcp

bash scripts/install.sh

```


This creates a Python venv, installs dependencies (LanceDB, sentence-transformers, torch, NetworkX, igraph), downloads the embedding model (~130 MB), and registers the daemon with launchd on macOS.


### Add to PATH


```bash

# Add to ~/.zshrc or ~/.bashrc

export PATH="$HOME/.local/bin:$PATH"


# Verify

iai-mcp --version

```


### Install Capture Hooks


**For Claude Code:**

```bash

iai-mcp capture-hooks install

iai-mcp capture-hooks status  # Should show "status: ACTIVE"

```


**For Codex CLI:**

```bash

iai-mcp capture-hooks install --target codex

```


**For both:**

```bash

iai-mcp capture-hooks install --target all

```


This installs three hooks to `~/.claude/hooks/`:

- `iai-mcp-turn-capture.sh` (UserPromptSubmit) — Captures each turn to session buffer

- `iai-mcp-session-capture.sh` (Stop) — Processes buffer at session end

- `iai-mcp-session-recall.sh` (SessionStart) — Injects memory context at start


### Connect MCP Host


**Claude Code:**

```bash

cd /path/to/iai-mcp

claude mcp add iai-mcp -- node "$(pwd)/mcp-wrapper/dist/index.js"

```


**Or edit `~/.claude.json` manually:**

```json

{

  "mcpServers": {

    "iai-mcp": {

      "command": "node",

      "args": ["/absolute/path/to/iai-mcp/mcp-wrapper/dist/index.js"]

    }

  }

}

```


**Codex CLI (`~/.codex/config.toml`):**

```toml

[mcp_servers.iai-mcp]

command = "node"

args = ["/absolute/path/to/iai-mcp/mcp-wrapper/dist/index.js"]


[mcp_servers.iai-mcp.env]

IAI_MCP_PYTHON = "/absolute/path/to/iai-mcp/.venv/bin/python"

IAI_MCP_STORE = "/Users/you/.iai-mcp"

TRANSFORMERS_VERBOSITY = "error"

TOKENIZERS_PARALLELISM = "false"

```


### Verify Installation


```bash

iai-mcp doctor  # Should show 14/14 PASS or 13/14 during sleep cycle

iai-mcp daemon status


# Check logs after first session

tail ~/.iai-mcp/logs/capture-$(date -u +%Y-%m-%d).log

# Look for "rc=0" indicating successful capture

```


## Key Commands


### Daemon Management


```bash

# Start daemon (usually auto-starts via launchd)

iai-mcp daemon start


# Check status

iai-mcp daemon status


# Stop daemon

iai-mcp daemon stop


# Restart daemon

iai-mcp daemon restart


# View daemon logs

tail -f ~/.iai-mcp/logs/daemon.log

```


### Capture Hooks


```bash

# Install hooks

iai-mcp capture-hooks install [--target {claude|codex|all}]


# Check hook status

iai-mcp capture-hooks status


# Uninstall hooks

iai-mcp capture-hooks uninstall


# Manual transcript capture (fallback)

iai-mcp capture-transcript --no-spawn

```


### Memory Operations


```bash

# Trigger session start (usually called by hook)

iai-mcp session-start


# Query memory directly

iai-mcp query "what did we discuss about error handling?"


# View recent memories

iai-mcp list --limit 20


# Export memories

iai-mcp export --output memories.json


# Clear all memories (irreversible)

iai-mcp clear --confirm

```


### Diagnostics


```bash

# Full health check (14 tests)

iai-mcp doctor


# Check specific components

iai-mcp doctor --check daemon

iai-mcp doctor --check store

iai-mcp doctor --check crypto


# View statistics

iai-mcp stats


# Check embedding model

iai-mcp info --embeddings

```


### Migrations


```bash

# Re-embed store with different model

iai-mcp migrate reembed --model bge-m3


# Rebuild graph indices

iai-mcp migrate rebuild-graph


# Compact database

iai-mcp migrate compact

```


## Configuration


### Environment Variables


```bash

# Data directory (default: ~/.iai-mcp/)

export IAI_MCP_STORE="/custom/path/to/store"


# Embedding model (default: bge-small-en-v1.5)

export IAI_MCP_EMBED_MODEL="bge-m3"  # For multilingual support


# Daemon socket path (advanced)

export IAI_MCP_SOCKET="/tmp/iai-mcp.sock"


# Log level

export IAI_MCP_LOG_LEVEL="DEBUG"  # DEBUG, INFO, WARN, ERROR

```


### Config File (`~/.iai-mcp/config.json`)


```json

{

  "embedding": {

    "model": "bge-small-en-v1.5",

    "batch_size": 32,

    "normalize": true

  },

  "recall": {

    "max_tokens": 3000,

    "cold_max_tokens": 8000,

    "min_similarity": 0.3

  },

  "consolidation": {

    "enabled": true,

    "idle_delay_seconds": 300,

    "cluster_threshold": 0.7,

    "decay_rate": 0.95

  },

  "encryption": {

    "enabled": true,

    "algorithm": "aes-256-gcm"

  },

  "insights": {

    "enabled": false,

    "api_key_env": "ANTHROPIC_API_KEY"

  }

}

```


## Real Usage Patterns


### Pattern 1: Basic Setup for Claude Code


```bash

# Clone and install

git clone https://github.com/CodeAbra/iai-mcp.git

cd iai-mcp

bash scripts/install.sh


# Add to PATH

echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc

source ~/.zshrc


# Install hooks

iai-mcp capture-hooks install


# Connect to Claude Code

claude mcp add iai-mcp -- node "$(pwd)/mcp-wrapper/dist/index.js"


# Verify

iai-mcp doctor

```


### Pattern 2: Multilingual Setup


```bash

# Set multilingual model

export IAI_MCP_EMBED_MODEL="bge-m3"


# Install with custom model

bash scripts/install.sh


# Verify model loaded

iai-mcp info --embeddings

# Should show: Model: bge-m3

```


### Pattern 3: Manual Memory Query


```python

# Not typical usage (hooks handle this), but for debugging:


import subprocess

import json


def query_memory(text: str) -> dict:

    """Query iai-mcp memory directly."""

    result = subprocess.run(

        ["iai-mcp", "query", text, "--json"],

        capture_output=True,

        text=True

    )

    return json.loads(result.stdout) if result.returncode == 0 else {}


# Example

memories = query_memory("error handling patterns")

for mem in memories.get("results", []):

    print(f"[{mem['timestamp']}] {mem['content'][:100]}...")

```


### Pattern 4: Custom Hook Integration


```bash

#!/usr/bin/env bash

# Custom post-session hook: ~/.claude/hooks/my-custom-capture.sh


set -euo pipefail


SESSION_ID="$1"

TRANSCRIPT_PATH="$2"


# Let iai-mcp process the transcript

iai-mcp capture-transcript --session-id "$SESSION_ID" --path "$TRANSCRIPT_PATH"


# Custom logic: export to external system

if [ -f "$HOME/.iai-mcp/exports/latest.json" ]; then

    curl -X POST https://my-backup.example.com/sync \

         -H "Authorization: Bearer $MY_BACKUP_TOKEN" \

         --data-binary "@$HOME/.iai-mcp/exports/latest.json"

fi

```


### Pattern 5: Programmatic Memory Access


```python

# Advanced: Direct LanceDB access (not recommended for normal use)


import lancedb

import os

from pathlib import Path


store_path = Path.home() / ".iai-mcp"

db = lancedb.connect(str(store_path / "lance"))


# Query episodic memories

table = db.open_table("records")

results = table.search([0.1] * 384) \  # Replace with actual embedding

    .limit(10) \

    .to_pandas()


print(results[["timestamp", "content", "session_id"]])

```


## Benchmarks


Run the included benchmark suite to verify performance on your hardware:


```bash

cd /path/to/iai-mcp


# Verbatim recall accuracy

python -m bench.verbatim

# Expected: >=99% byte-exact recall at N=10k


# Recall latency

python -m bench.neural_map

# Expected: p95 <100ms


# Memory footprint

python -m bench.memory_footprint

# Expected: ~150-300 MB steady state


# Session-start token cost

python -m bench.tokens

# Expected: <=3000 tokens warm, <=8000 cold


# Full session cost

python -m bench.total_session_cost


# Longitudinal trajectory (30 sessions)

python -m bench.trajectory


# Contradiction detection

python -m bench.contradiction_longitudinal


# LongMemEval-S blind run (no tuning)

python -m bench.longmemeval_blind

```


## Troubleshooting


### Daemon Won't Start


```bash

# Check for orphan processes

ps aux | grep iai-mcp


# Kill orphans

killall -9 iai-mcp-daemon


# Remove stale socket

rm -f ~/.iai-mcp/daemon.sock


# Check logs

tail -n 100 ~/.iai-mcp/logs/daemon.log


# Restart

iai-mcp daemon restart

```


### Hooks Not Capturing


```bash

# Verify hook installation

iai-mcp capture-hooks status


# Check hook permissions

ls -la ~/.claude/hooks/iai-mcp-*.sh

# Should be -rwxr-xr-x


# Test hook manually

~/.claude/hooks/iai-mcp-turn-capture.sh "test-session-id" "user" "Test prompt"


# Check buffer

cat ~/.iai-mcp/session-buffers/test-session-id.jsonl

```


### No Memory Recalled at Session Start


```bash

# Check if store is empty

iai-mcp stats

# Should show total_memories > 0


# Test recall manually

iai-mcp session-start --debug


# Check recall hook logs

tail ~/.iai-mcp/logs/recall-$(date -u +%Y-%m-%d).log


# Verify daemon is running

iai-mcp daemon status

```


### Encryption Key Lost


```bash

# Check key exists

ls -la ~/.iai-mcp/.key

# Should be -rw------- (600)


# If lost, data is unrecoverable

# Backup key location (if you made one):

cat ~/.iai-mcp/.key.backup


# Start fresh (destroys all memories)

iai-mcp clear --confirm

# New key generated on next capture

```


### High Memory Usage


```bash

# Check current footprint

iai-mcp stats --memory


# Compact database

iai-mcp migrate compact


# Reduce embedding batch size

export IAI_MCP_EMBED_BATCH=16  # Default 32


# Restart daemon

iai-mcp daemon restart

```


### Slow Recall


```bash

# Check store size

du -sh ~/.iai-mcp/lance/


# Rebuild indices

iai-mcp migrate rebuild-graph


# Check embedding model is cached

ls -lh ~/.cache/huggingface/hub/

# Should see models--BAAI--bge-small-en-v1.5


# Profile a query

time iai-mcp query "test query" --debug

```


### Hook Timeout Errors


```bash

# Increase hook timeout (Claude Code settings.json)

# Edit: ~/.claude/settings.json

{

  "hooks": {

    "timeouts": {

      "UserPromptSubmit": 10000,  # Default 5000ms

      "Stop": 60000,              # Default 35000ms

      "SessionStart": 45000       # Default 30000ms

    }

  }

}

```


### Doctor Check Failures


```bash

# Run with verbose output

iai-mcp doctor --verbose


# Fix common issues:


# Check (a) Daemon alive

iai-mcp daemon start


# Check (b) Socket fresh (may fail during consolidation - normal)

# Wait 30s and retry


# Check (h) Crypto file state

chmod 600 ~/.iai-mcp/.key


# Check (i) Lance versions piling up

iai-mcp migrate compact


# Check (k) Lifecycle history

rm ~/.iai-mcp/.daemon-state.json

iai-mcp daemon restart

```


### Migration to New Machine


```bash

# On old machine: backup store and key

tar czf iai-mcp-backup.tar.gz ~/.iai-mcp/


# On new machine: install iai-mcp

git clone https://github.com/CodeAbra/iai-mcp.git

cd iai-mcp

bash scripts/install.sh


# Restore backup

tar xzf iai-mcp-backup.tar.gz -C ~/


# Verify key permissions

chmod 600 ~/.iai-mcp/.key


# Restart daemon

iai-mcp daemon restart


# Verify

iai-mcp doctor

iai-mcp stats

```


## Advanced: Custom Embedding Models


```bash

# List available models

huggingface-cli scan-cache


# Download custom model

huggingface-cli download BAAI/bge-large-en-v1.5


# Configure

export IAI_MCP_EMBED_MODEL="bge-large-en-v1.5"


# Re-embed existing store

iai-mcp migrate reembed --model bge-large-en-v1.5 --confirm


# Verify

iai-mcp info --embeddings

```


## Security Notes


- All memories encrypted with AES-256-GCM at rest

- Encryption key: `~/.iai-mcp/.key` (mode 0600)

- **Backup the key** — no key recovery possible

- No network calls except optional Anthropic API for insights (disabled by default)

- No telemetry, no analytics, fully local

- Socket: Unix domain socket (no network exposure)


```bash

# Backup encryption key

cp ~/.iai-mcp/.key ~/secure-backup/.iai-mcp-key.backup

chmod 400 ~/secure-backup/.iai-mcp-key.backup

```


## Notes


- **Platform:** macOS (Apple Silicon tested). Linux/Windows support planned.

- **Python:** 3.11 or 3.12 required (3.13 may have torch compatibility issues).

- **Disk:** ~500 MB for fresh install, grows with memories (~1-2 MB per 1000 turns).

- **Model:** Default `bge-small-en-v1.5` is ~130 MB. `bge-m3` (multilingual) is ~380 MB.

- **Token Cost:** Session-start recall adds 1k-3k tokens (warm) or up to 8k (cold cache).

- **Consolidation:** Runs every 5 minutes of idle time. Socket briefly unavailable during sleep cycle (normal).
