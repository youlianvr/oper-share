---
name: protocol-reverse
description: Use for authorized reverse engineering of custom binary protocols, Protobuf/gRPC, WebSocket frames, and PCAP-driven protocol recovery.
---

# Protocol Reverse Engineering

## Authorization preamble

1. Confirm the task is **protocol / traffic / serialization format** RE (plain web param signing → `js-reverse/`).
2. If there is target network interaction → complete scope first; no ACT against the target before `auth` is granted.
3. Tools: tshark / wireshark may need manual install — verify before use.
4. Enter workflow Phase 1; produce a frame-layout or message-dictionary draft.

## Scope

- Custom TCP/UDP binary protocols
- Protobuf / gRPC / FlatBuffers / MessagePack
- WebSocket / MQTT / private RPC
- PCAP / PCAPNG field and state-machine recovery
- Client-server validation, sequence numbers, encrypted frame headers

## Not this skill

| Situation | Go to |
|-----------|-------|
| HTTP param signing / JS crypto only | `js-reverse/` |
| TLS certificate issues only | `security/parts/pentest-tools/` or browser proxy |
| Firmware protocol stack deep-dive + emulation | `firmware-pentest/` first, then back here |

## Workflow

### Phase 1 — Collection and triage

```text
□ Get samples: PCAP / proxy export / client logs / binaries
□ Mark direction: C→S / S→C; handshake, heartbeat, reconnect?
□ Fixed header? Magic? Length field? TLV? Fixed-width?
□ Compressed (zlib/gzip/lz4) or encrypted (AES/ChaCha in-frame)?
□ tshark -r cap.pcap -T fields -e frame.number -e ip.src -e tcp.payload
```

### Phase 2 — Frame layout recovery

```text
□ Align multiple same-type messages; find invariant bytes / incrementing sequence numbers
□ Length field: endianness, header-inclusive or not
□ Checksums: CRC16/32, checksum, HMAC position
□ Draw the state machine: Connect → Auth → Ready → Request/Response → Close
□ Tools: Wireshark custom dissector draft / ImHex / 010 Editor templates / Kaitai Struct
```

### Phase 3 — Serialization and crypto

```text
□ Protobuf: .proto recovery (blackboxprotobuf / pbtk / protoc --decode_raw)
□ gRPC: HTTP/2 headers + protobuf body
□ Crypto: find key derivation (client so/dll/JS) → pair with ida-reverse / js-reverse / apk-reverse
□ Replay: only within authorized scope; harmless fields before sensitive operations
```

### Phase 4 — Deliverables

```text
MUST produce:
- Message type table (name / opcode / fields)
- At least 1 reproducible decode command or script
- Evidence: raw hex excerpt + decode result (sanitized)
```

## Toolchain

| Tool | Needed | Purpose | Bootstrap |
|------|--------|---------|-----------|
| tshark / Wireshark | strongly advised | PCAP parsing | manual / winget |
| Python3 | yes | decode scripts | system |
| blackboxprotobuf | optional | unknown protobuf | pip |
| ImHex / 010 | optional | structure templates | manual |
| IDA / r2 / Ghidra | as needed | client serialization functions | see respective skills |

## References

- `references/protocol-workflow.md` — frame layout and Protobuf quick reference
- Related: `reverse-engineering/parts/ida-reverse/` `reverse-engineering/parts/js-reverse/` (same router); `security/parts/ida-reverse/`? no — ida/js live here; firmware and pentest live in `security/parts/`

## Completion self-check

- [ ] Message layout or state machine recovered (not just hex pasted)?
- [ ] Reproducible decode command present?
- [ ] Scope / sanitization respected?
- [ ] Report checklist written?
