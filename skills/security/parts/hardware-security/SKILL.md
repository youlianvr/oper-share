---
name: hardware-security
description: Use for authorized hardware and embedded interface security research including UART/JTAG discovery, debug pad triage, secure boot overview, and offline firmware extraction support.
---

# Hardware / Embedded Interface Security

## Before you start

1. `NOW`: confirm **physical-access authorization** and device ownership.
2. `NOW`: ESD and power safety; read-only probing is the default.
3. `NEXT`: pair with `firmware-pentest` for image analysis.
4. `ACT`: case and debug-port identification → consoles → extraction.

## When to use

- UART / JTAG / SWD debug-port discovery.
- Boot logs, root shells, boot interruption.
- Supporting flash extraction during teardown.
- Feasibility assessment of secure boot / encrypted flash (non-destructive first).

## Workflow

```text
□ Teardown an authorized device; photograph and label the test points
□ Multimeter to find GND/VCC/TX/RX; logic level 1.8/3.3/5V
□ USB-TTL read-only log capture; record the baud rate
□ JTAG: enumerate IDCODE; assess whether it is locked
□ Extract the image → hand off to firmware-pentest / ghidra
```

## Toolchain

| Tool | Purpose |
|------|---------|
| USB-TTL / logic analyzer | UART |
| J-Link / CMSIS-DAP | debugging |
| Bus Pirate / Flipper (lab) | multi-protocol |
| binwalk / flashrom | extraction |

## References

- `references/debug-interface-triage.md`
- `security/parts/firmware-pentest/`, `security/parts/ot-ics/`

## Routing context

**Upstream**: MASTER R34
**MUST NOT**: unauthorized teardown, damaging someone else's equipment

## Completion self-check

- [ ] Were the interface levels and pinout recorded?
- [ ] Were the image hashes preserved?
- [ ] Checklist?
