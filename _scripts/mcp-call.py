#!/usr/bin/env python3
"""mcp-call.py — stdlib-only MCP stdio probe.

Usage:
  python _scripts/mcp-call.py <server-name> tools          # list tools
  python _scripts/mcp-call.py <server-name> call <tool> '<json-args>'

Reads launcher definitions from ~/.agents/mcp.json (command/args/env per
server), spawns the server over stdio, speaks MCP JSON-RPC, prints the
result. No third-party dependencies.

Purpose: a status label (VERIFIED-LIVE etc.) is only honest if some script
can reproduce the call. This is that script.
"""
import json
import os
import subprocess
import sys


def load_launchers():
    for p in (
        os.path.expanduser("~/.agents/mcp.json"),
        os.path.expanduser("~/.cline/mcp.json"),
    ):
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                raw = json.load(f)
            servers = raw.get("mcpServers") or raw.get("servers") or raw
            if isinstance(servers, dict) and servers:
                return servers
    sys.exit("no MCP config found (~/.agents/mcp.json)")


def rpc(proc, method, params=None, _id=1):
    req = {"jsonrpc": "2.0", "id": _id, "method": method}
    if params is not None:
        req["params"] = params
    proc.stdin.write(json.dumps(req) + "\n")
    proc.stdin.flush()
    while True:
        line = proc.stdout.readline()
        if not line:
            raise RuntimeError("server closed stream")
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue
        if msg.get("id") == _id:
            if "error" in msg:
                raise RuntimeError(json.dumps(msg["error"]))
            return msg.get("result")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    name, action = sys.argv[1], sys.argv[2]
    servers = load_launchers()
    if name not in servers:
        sys.exit(f"server '{name}' not in config; known: {', '.join(sorted(servers))}")
    spec = servers[name]
    cmd = spec.get("command")
    if not cmd:
        sys.exit(f"server '{name}' has no command (remote http? use its own client)")
    args = list(spec.get("args") or [])
    env = {**os.environ, **{k: str(v) for k, v in (spec.get("env") or {}).items()}}

    proc = subprocess.Popen(
        [cmd] + args, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL, text=True, env=env,
    )
    try:
        proto = spec.get("protocolVersion", "2024-11-05")
        rpc(proc, "initialize", {
            "protocolVersion": proto,
            "capabilities": {},
            "clientInfo": {"name": "mcp-call", "version": "1.0"},
        }, _id=1)
        proc.stdin.write(json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}) + "\n")
        proc.stdin.flush()

        if action == "tools":
            res = rpc(proc, "tools/list", {}, _id=2)
            tools = res.get("tools", [])
            print(f"{name}: {len(tools)} tools")
            for t in tools:
                print(f"  - {t.get('name')}: {str(t.get('description', ''))[:80]}")
        elif action == "call" and len(sys.argv) >= 5:
            tool = sys.argv[3]
            arguments = json.loads(sys.argv[4]) if sys.argv[4] != "-" else {}
            res = rpc(proc, "tools/call", {"name": tool, "arguments": arguments}, _id=3)
            print(json.dumps(res, ensure_ascii=False, indent=2)[:4000])
        else:
            sys.exit("unknown action; use 'tools' or 'call <tool> <json>'")
    finally:
        try:
            proc.stdin.close()
        except Exception:
            pass
        proc.terminate()


if __name__ == "__main__":
    main()
