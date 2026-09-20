---
name: wifi-wireless
description: Use for authorized wireless security assessment including Wi-Fi capture, WPA handshake analysis, rogue AP detection research, and lab-only deauth testing.
---

# Wi-Fi / Wireless Security

## Before you start

1. `NOW`: read the local precedent if one exists; **wireless attacks carry high
   legal risk** — written authorization and a physical scope are mandatory.
2. `NOW`: the scope must name the target SSID/BSSID and the site; scanning
   neighboring networks is forbidden.
3. `NEXT`: confirm the adapter supports monitor mode.
4. `ACT`: recon → capture → analysis (lab first).

## When to use

- Authorized Wi-Fi security assessments.
- WPA/WPA2 handshake capture and offline strength evaluation.
- Rogue AP / evil-twin hotspot detection research.
- Enterprise wireless isolation and captive-portal security.

## Workflow

```text
□ iwconfig / airmon-ng into monitor mode (legal environment)
□ airodump-ng lock onto the target BSSID channel
□ Handshake or PMKID capture (target only)
□ hashcat / aircrack offline evaluation of the password policy
□ Report: encryption type, isolation, portal bypass, recommendations
```

## Toolchain

| Tool | Purpose |
|------|---------|
| aircrack-ng suite | capture / evaluation |
| hcxdumptool / hcxtools | PMKID |
| hashcat | password evaluation |
| Wireshark | management-frame analysis |

## References

- `references/wireless-lab-rules.md`
- `security/parts/pentest-tools/`, `security/parts/attack-chain/` (close-access chapter)

## Routing context

**Upstream**: MASTER R29
**MUST NOT**: unauthorized deauth, acting on non-target client networks

## Completion self-check

- [ ] Was the target BSSID locked down strictly?
- [ ] Does the report include hardening advice?
- [ ] Checklist?
