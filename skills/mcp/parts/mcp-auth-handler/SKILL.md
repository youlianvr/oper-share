---
name: mcp-auth-handler
description: Handle MCP auth keys, insert them when the user says to.
---

# MCP Auth Handler

## Trigger
When MCP servers require authentication and user provides keys.

## Workflow
1. Identify which MCP needs auth:
   - shodan → SHODAN_API_KEY
   - virustotal → VIRUSTOTAL_API_KEY
   - ssh-mcp → --host + --user (args)
   - gdrive-mcp → credentials.json or token
   - openapi2mcp → swagger/openapi file path
   - cookie-mcp → COOKIE env var

2. Treat credentials as a sensitive, owner-controlled mutation. Confirm the
   target server, destination, and exact intended change before writing; a
   casual phrase is not permission to expose or persist a
   secret.

3. Update the actual MCP configuration used by the target runtime, keeping the
   secret in an environment variable or external secret store. Do not write a
   literal key to a tracked file, logs, command history, or this skill.

4. Validate the configuration without printing secret values. Restart or
   reload the MCP only after the user explicitly requests that outward/system
   action, then run the smallest safe probe.

## Pitfalls
- User frustration is not authorization to bypass safety or confirmation gates.
- Never write API keys to git-tracked files, logs, command lines, or chat output.
- Key formats:
  - Shodan: 32-char alphanumeric
  - VirusTotal: 64-char hex

## Sources
- Shodan: developer.shodan.io (Account → API Key)
- VirusTotal: developers.virustotal.com (Join → API Key)
- GDrive: console.cloud.google.com (Credentials → Service Account)
