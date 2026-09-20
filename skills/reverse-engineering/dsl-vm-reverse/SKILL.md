# DSL Custom VM Reverse Engineering

> For reversing custom WASM-like virtual machines / risk-control engines implemented in JavaScript.

---

## Table of contents

- [1. Scope](#1-scope)
- [2. DSL VM identification traits](#2-dsl-vm-identification-traits)
- [3. General RE workflow](#3-general-re-workflow)
- [4. Opcode extraction and classification](#4-opcode-extraction-and-classification)
- [5. Runtime capture options](#5-runtime-capture-options)
- [6. Common status codes](#6-common-status-codes)
- [7. Self-check list](#7-self-check-list)

---

## 1. Scope

Use this skill when the target file matches **any** of these traits:

| # | Trait | Example |
|---|-------|---------|
| 1 | IIFE entry + many single-letter variable names | `!function(){var U=void 0,y=parseInt,E0=Function,...}` |
| 2 | A `DG()`-like function with a switch-case loop | Interpreter main loop, `d[7]&31` decodes the opcode |
| 3 | Large file (500KB+) with zero-byte ratio < 1% | Not standard WASM — pure JS |
| 4 | `C[number]` constant-table references | `C[9][xxx]` function/string tables |
| 5 | Single-line minified code | 583KB on one line, obfuscated names |

### Exclusion rules

| Condition | Not this skill | Go to |
|-----------|----------------|-------|
| File starts with `\x00asm` | Standard WASM binary | `reverse-engineering/languages.md` |
| File contains the WASM magic `Uint8Array([0,97,115,109])` | Embedded WASM | extract the .wasm, then IDA/Ghidra |
| Standard Webpack bundle (`function(e,t,n){...}`) | Ordinary JS | `js-reverse/` |
| Zero-byte ratio > 20% | WASM binary | `reverse-engineering/languages.md` |

---

## 2. DSL VM identification traits

### Code traits

```javascript
// Trait 1: IIFE entry, single-letter variables mapped to number constants
!function(){
    var U=void 0, y=parseInt, E0=Function, AN=Uint8Array;
    var E=15, l=10, m=12, x=16, S=13, $=11;
    // number constants stored as variable names, replacing the literals
    ...
}

// Trait 2: interpreter main loop DG()
function DG(C, d, ...) {
    var d = [];  // array emulating the WASM stack/locals
    for (d[7] = x; d[7] !== U;) {
        var aE = d[7] & 31;         // low 5 bits = opcode
        var O = d[7] >> 5 & 31;     // high 5 bits = sub-operation
        switch (aE) {
            case 0: /* ... */ d[7] = 612; break;
            case 1: /* ... */
            // ... N cases
        }
    }
}

// Trait 3: constant table C[9] stores function indices and strings
// C[9][0] = ["pc"]      → function parameter descriptors
// C[9][667] = "string"  → string constants
// C[9][x] = number      → function index

// Trait 4: W(C[index], null, ...) call pattern
// W = Function.prototype.call.bind(call)
// all builtins are invoked via C[index]

// Trait 5: instruction encoding
// d[7] = opcode(bit 0-4) | subop(bit 5-9) | operand(bit 10+)
```

### Opcode encoding format

Each instruction is a 32-bit integer:

```
bit 0-4:   opcode (0-N)
bit 5-9:   sub-operation (0-31)
bit 10-31: operand / immediate

Decode:
  aE = d[7] & 31        → opcode
  O  = d[7] >> 5 & 31   → sub-operation
  d[other] = d[7] >> 10  → operand
```

---

## 3. General RE workflow

### Phase 1: File classification (5 min)

```bash
# Check whether this is a DSL VM
python3 << 'EOF'
with open('target.js', 'rb') as f:
    head = f.read(100)

# 1. WASM magic check
if head[:4] == b'\x00asm':
    print("standard WASM binary")
    exit()

# 2. Zero-byte ratio
data = open('target.js', 'rb').read()
zero_pct = data.count(b'\x00') / len(data) * 100
print(f"zero-byte ratio: {zero_pct:.1f}%")

if zero_pct > 20:
    print("WASM binary")
elif head[:2] == b'!f':
    # single-letter variable pattern
    if b'var U=void 0' in head or b'U=void 0,y=parseInt' in head:
        print("→ DSL VM!")
    else:
        print("ordinary JS IIFE")
EOF
```

### Phase 2: Variable mapping table extraction (10 min)

```python
import re

with open('target.js', 'r', errors='replace') as f:
    s = f.read()

# Extract the leading `var X=<number>` mappings (first 2000 chars)
mappings = re.findall(r'var\s+(\w+)\s*=\s*(\d+)', s[:2000])
print('constant mappings:')
for name, val in mappings:
    print(f"  {name:4s} = {val:3d} (0x{int(val):02x})")
```

### Phase 3: Opcode extraction and classification (15 min)

```python
# 1. Extract all cases
all_cases = re.findall(r'case\s+(\d+):', s)
unique = sorted(set(int(c) for c in all_cases))

print(f"total cases: {len(all_cases)}")
print(f"unique opcodes: {len(unique)}: {unique}")

# 2. Classify each opcode
for op in unique:
    idx = s.find(f'case {op}:')
    snippet = s[idx:idx+200]
    if 'd[7]=' in snippet:
        op_type = 'BRANCH'
    elif 'return' in snippet:
        op_type = 'RETURN'
    elif 'W(C[' in snippet:
        op_type = 'CALL'
    elif 'new' in snippet:
        op_type = 'ALLOC'
    elif 'try' in snippet or 'catch' in snippet:
        op_type = 'EXCEPTION'
    else:
        op_type = 'ARITH/STORE'
    print(f"  opcode {op:2d}: {op_type}")
```

### Phase 4: Constant table analysis (30 min)

```python
const_refs = re.findall(r'C\[9\]\[(\d+)\]', s)
unique_refs = sorted(set(int(x) for x in const_refs))

print(f"C[9] references: {len(unique_refs)} indices")
print(f"range: {min(unique_refs)} - {max(unique_refs)}")

# Analyze the context of each reference
for ref in unique_refs[:20]:
    idx = s.find(f'C[9][{ref}]')
    ctx = s[max(0,idx-50):idx+80]
    clean = ''.join(c if c.isprintable() else ' ' for c in ctx)
    print(f"  C[9][{ref}] → {clean}")
```

### Phase 5: Exported function tracing (1–2 h)

Exported functions (e.g. `getToken`) are located via:

```
1. Find AWSCInner.register() or a similar registration call
2. Identify the registered module and factory function
3. Find the object the factory returns → where the exported function is defined
4. If the function name is not in the JS → it is stored as bytecode in the C[9] constant table
5. Trace the call chain:
   AWSCInner._modules['fy'].getToken()
   → W(C[function index], null, ...)
   → DG() interprets the encoded instruction sequence
```

### Phase 6: Runtime injection (if static analysis is not enough)

```javascript
// Inject a minimal AWSC-compatible environment
const fakeEnv = {
    AWSCInner: {
        _modules: {},
        register(name, moduleName, factory) {
            this._modules[moduleName] = factory();
        }
    }
};

// Run the DSL VM code
dslVmCode();

// Grab the export
const token = fakeEnv.AWSCInner._modules['fy'].getToken({});
```

---

## 4. Opcode extraction and classification

### Reference opcode table (from previous cases)

| Opcode | Type | Traits |
|--------|------|--------|
| 0 | **BRANCH** | `d[7]=xxx` unconditional jump |
| 1 | **CALL** | `W(C[Y],null,function(){...})` embedded function call |
| 2 | **ARITH** | `d[4]=0`, `d[7]=72` variable assignment |
| 3 | **ARITH** | `d[0]=d[1][C[x]]`, `d[5]=d[0]<d[3]` comparisons |
| 4 | **STORE** | `d[8]=d[5]in d[4]` property access / existence check |
| 5 | **ARITH** | `d[8]=d[4]-d[8]` arithmetic |
| 6 | **RETURN** | `return gV`, `throw` return / raise |
| 7 | **ALLOC** | `d[6]=[]`, `d[6][C[8]](...)` push |
| 8 | **BRANCH** | `d[7]=d[k]?512:425` conditional jump |
| 9 | **STRING** | `d[6][C[t]]=d[m]`, `new fh(...)` regex |
| 10 | **ALLOC** | argument preparation, call-stack creation |
| 11 | **STRING** | `new fh("\\s",d[5])` regex matching |
| 12 | **STORE** | `P[d[9]]=d[4][C[H]](d[3])` data transfer |
| 13 | **CALL** | `C[9][113]=d[9]` module initialization |
| 14 | **STRING** | `d[8]=d[9]+d[m]` string concatenation |
| 15 | **RETURN** | `return EL;` function return |
| 16 | **ALLOC** | `var r,P,Z,B...` local variable declarations |
| 17 | **ALLOC** | `(Z=[])[C[8]](69,T,445)` static array init |
| 18 | **TABLE** | function/type table initialization |
| 19 | **EXCEPTION** | `try{for(var RK=x;...` try-catch loop |
| 20 | **DOM** | `Is[d[o]]` DOM operations |
| 21 | **STORE** | safe global/object property access |
| 22 | **STRING** | `new fh(r,v)` string/regex handling |
| 23 | **BRANCH** | `try...catch` safe access + conditional jump |
| 24 | **CALL** | `W(C[2],null,8,z,FL)` multi-arg function call |
| 25 | **EXCEPTION** | `try{...}catch(C){...}` exception catch + jump |

---

## 5. Runtime capture options

### Option A: Selenium + native CDP events (recommended, highest success rate)

```python
from selenium import webdriver

driver = webdriver.Chrome()

# Inject anti-detection
driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
    "source": r"""
        Object.defineProperty(navigator, 'webdriver', {get: () => false});
        Object.defineProperty(navigator, 'plugins', {get: () => [1,2,3,4,5]});
        Object.defineProperty(navigator, 'languages', {get: () => ['en-US','en']});
    """
})

# Send native CDP mouse events
driver.execute_cdp_cmd("Input.dispatchMouseEvent", {
    "type": "mousePressed",
    "x": 549.5, "y": 441.2,
    "button": "left", "buttons": 1,
    "clickCount": 1, "pointerType": "mouse"
})
```

### Option B: Playwright headless browser

```javascript
const { chromium } = require('playwright');

async function run() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Intercept network requests
    await page.route('**/api/**', async route => {
        await route.continue();
    });

    await page.goto('https://target-page.com');

    // Wait for DSL VM initialization
    await page.waitForFunction(() => {
        return window.AWSCInner &&
               window.AWSCInner._modules &&
               window.AWSCInner._modules['fy'];
    });

    // Perform actions
    await page.mouse.move(500, 400);
    await page.mouse.down();
    // ... action sequence
    await page.mouse.up();
}
```

### Option C: Pure protocol replay (very low success rate)

> Tokens produced by a DSL VM are usually strongly bound to the browser context
> (TLS JA3 fingerprint, IP, cookies, headers). Outside a browser the server can
> detect the context mismatch. **Pure-protocol replay is not recommended.**

---

## 6. Common status codes

| Code | Meaning | Handling |
|------|---------|----------|
| 0 | **verification passed** | extract sessionId + sig |
| 300 | **risk-control block** | blocked, cannot pass |
| 8778 | **verification failed, retry** | retry the operation |
| 8776 | **too fast, retry** | increase delay and retry |
| 69634 | **generic failure** | check the parameters |

---

## 7. Self-check list

- [ ] Did I complete DSL VM identification (IIFE + single-letter variables + DG() interpreter)?
- [ ] Did I extract the variable mapping table (`var X=<number>`)?
- [ ] Did I extract and classify the opcode list?
- [ ] Did I analyze the C[9] constant table reference range?
- [ ] Did I locate the exported function registration point?
- [ ] If static analysis was insufficient, did I try the runtime injection options?
- [ ] After the task, did I write the findings back to the field journal?
- [ ] New tools / new scenarios found → update the routing notes?

---

## Routing registration

| Type | Route |
|------|-------|
| **Target type**: WASM / DSL VM / custom instruction set | `reverse-engineering/dsl-vm-reverse/SKILL.md` |
| **User intent**: "DSL VM / risk-control engine reversing" | this skill |
| **Toolchain**: Playwright / Selenium CDP | browser-injection options |

### Path crossings

```
DSL VM RE path:
  reverse-engineering/dsl-vm-reverse/ → Phases 1–6 workflow
  ↓ if runtime data capture is needed
  browser-automation/ → Playwright/Selenium CDP
  ↓ if API protocol layer analysis is needed
  js-reverse/ → Observe → Capture → Rebuild
```
