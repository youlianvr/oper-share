---
name: vpn
description: >-
  VPN setup, repair, and verification: GUI client one-button setup (v2RayTun),
  system-wide stack bootstrap and self-reflection (broken wrappers, RU-zone
  whitelists, TUN mode, autorun), sing-box TUN tunnel reference on
  Fedora/Linux, and an Android app that detects VPN/proxy servers. One
  contract; the parts under parts/ carry the procedures.
---

# vpn — tunnel setup and verification

> Mutation warning, all parts: installation, systemd units, CAP_NET_ADMIN,
> routing and DNS changes alter the machine's network posture. Treat them as
> mutation procedures — confirm before applying, keep the rollback step.

## How to use it

Pick the parts that match the task from the table and read those files.

## Parts

| Part | What it covers |
|---|---|
| `parts/vpn-gui-setup/` | VPN via GUI client (v2RayTun) down to one button: install, subscription import via deeplink without manual clicks, disabling "whitelists" at config level, TUN mode, one-button control |
| `parts/vpn-stack-fix/` | Self-reflection + bootstrap of a broken system-wide stack: client wrapper broken → cores launch directly; RU-zone "whitelists" leak local IP → fix; TUN for the whole PC; autorun via Task Scheduler |
| `parts/singbox-tun/` | Project-local Fedora/Linux reference for a system TUN tunnel through sing-box: install, systemd, CAP_NET_ADMIN, routing and DNS |
| `parts/yourvpndead-vpn-detection/` | Android app detecting VPN/proxy servers (VLESS/xray/sing-box) via local SOCKS5 exposure: exit IPs and server configs without root |

## Choosing

- **"Set up VPN on my phone"** → `parts/vpn-gui-setup/`.
- **VPN is installed but leaks / wrapper broken / autorun missing** →
  `parts/vpn-stack-fix/` (its self-reflection section is the diagnostic).
- **Fedora/Linux system tunnel via sing-box** → `parts/singbox-tun/`.
- **"Is this app secretly a VPN server?" / Android detection** →
  `parts/yourvpndead-vpn-detection/`.

LLM-proxy provider management (adding OpenAI-compatible providers, .env
secrets, tiers) is `proxy-provider-management`, a different domain — network
posture is here, model routing is there.
