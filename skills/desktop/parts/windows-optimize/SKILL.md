---
name: windows-optimize
description: >
  Windows system optimization and cleanup. Removes bloatware, cleans temp/cache
  files, optimizes autostart, disables unnecessary services, tunes visual
  performance, configures page file, DNS, telemetry, and network settings.
  Use when: "optimize system", "clean up windows", "speed up PC", "remove bloatware",
  "clean temp", "fix autostart", "system cleanup", "performance tweak", "remove junk".
  NOT for: Linux/macOS, code refactoring, or application-level optimization.
license: MIT
metadata:
  platform: windows
  requires: admin-rights
  risk: low-medium
  created: 2026-07-28T17:11:00+03:00
  updated: 2026-07-28T17:25:00+03:00
---


# Windows Optimize

Systematic Windows optimization guidance. Audit commands are read-only; cleanup, uninstall, registry, service, pagefile, environment, network, scheduled-task, and reboot actions are system mutations and require explicit authorization, a scoped target, and a reversible fallback. Work in phases — never skip ahead. Always verify before and after.

---

## Phase 0 — Audit (read-only)

Before touching anything, gather facts. Run all checks in parallel.

### Disk space

```powershell
Get-PSDrive -PSProvider FileSystem | Select-Object Name,
  @{N='UsedGB';E={[math]::Round($_.Used/1GB,1)}},
  @{N='FreeGB';E={[math]::Round($_.Free/1GB,1)}}
```

### Temp file sizes

```powershell
@($env:TEMP, "$env:LOCALAPPDATA\Temp", "C:\Windows\Temp") | ForEach-Object {
  $s = (Get-ChildItem $_ -Recurse -Force -EA SilentlyContinue |
    Measure-Object Length -Sum).Sum
  "$_ : $([math]::Round($s/1MB,1)) MB"
}
```

### Autostart entries

```powershell
# Startup folder
Get-ChildItem "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
# Registry Run keys
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -EA SilentlyContinue |
  Select-Object * -ExcludeProperty PS*
Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run" -EA SilentlyContinue |
  Select-Object * -ExcludeProperty PS*
```

### Scheduled tasks (non-Microsoft)

```powershell
Get-ScheduledTask |
  Where-Object { $_.State -ne 'Disabled' -and $_.TaskPath -notmatch "\\Microsoft\\" } |
  Select-Object TaskName, State
```

### Running processes (top RAM consumers)

```powershell
Get-Process | Group-Object Name | ForEach-Object {
  [PSCustomObject]@{
    Name = $_.Name
    Count = $_.Count
    RAM_MB = [math]::Round(($_.Group | Measure-Object WorkingSet64 -Sum).Sum/1MB)
  }
} | Sort-Object RAM_MB -Descending | Select-Object -First 15
```

### Installed programs

```powershell
Get-ChildItem "$env:LOCALAPPDATA\Programs" -Directory | Select-Object Name
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" -EA SilentlyContinue |
  Where-Object { $_.DisplayName } |
  Select-Object DisplayName, InstallLocation
```

### Services (running, automatic)

```powershell
Get-Service | Where-Object { $_.Status -eq 'Running' -and $_.StartType -eq 'Automatic' } |
  Select-Object Name, DisplayName
```

### System info

```powershell
# RAM
$os = Get-CimInstance Win32_OperatingSystem
"$([math]::Round($os.TotalVisibleMemorySize/1MB,1)) GB total, $([math]::Round($os.FreePhysicalMemory/1MB,1)) GB free"
# CPU
(Get-CimInstance Win32_Processor | Select-Object -First 1).Name
# GPU
Get-CimInstance Win32_VideoController | Select-Object Name, DriverVersion
# Network
Get-NetAdapter | Select-Object Name, Status, LinkSpeed
# DNS
Get-DnsClientServerAddress | Where-Object { $_.ServerAddresses } |
  Select-Object InterfaceAlias, ServerAddresses
# Page file
Get-CimInstance Win32_PageFileSetting -EA SilentlyContinue |
  Select-Object Name, InitialSize, MaximumSize
# Power plan
powercfg /getactivescheme
```

---

## Phase 1 — Clean junk

### Temp files

The commands below are mutation examples, not a default action. Do not run them during audit/review; prefer size-only inspection and move-to-trash handling after explicit authorization.

```powershell
Remove-Item "$env:TEMP\*" -Recurse -Force -EA SilentlyContinue
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -EA SilentlyContinue
```

### Recycle Bin

```powershell
Clear-RecycleBin -Force -EA SilentlyContinue
```

### Old installers in Downloads

Remove setup .exe/.msi for programs already uninstalled. Keep installers for
programs still in use. Pattern: check if the program exists before deleting.

```powershell
Get-ChildItem "$env:USERPROFILE\Downloads" -File |
  Where-Object { $_.Extension -match '\.(exe|msi)$' } |
  ForEach-Object {
    # Check if related program is installed
    $name = $_.BaseName -replace '-?\d+[\d.]*.*$',''
    $installed = Get-ChildItem "$env:LOCALAPPDATA\Programs" -Directory -EA SilentlyContinue |
      Where-Object { $_.Name -match $name }
    if (-not $installed) {
      Write-Output "DELETE: $($_.Name)"
      # Remove-Item $_.FullName -Force  # uncomment to execute
    }
  }
```

### npm / pip / package caches

```powershell
npm cache clean --force 2>$null
pip cache purge 2>$null
```

### Windows Update cache (admin)

```powershell
Stop-Service wuauserv -Force -EA SilentlyContinue
Remove-Item "C:\Windows\SoftwareDistribution\Download\*" -Recurse -Force -EA SilentlyContinue
Start-Service wuauserv -EA SilentlyContinue
```

### DNS cache

```powershell
ipconfig /flushdns
```

### Event logs (admin)

```powershell
wevtutil el | ForEach-Object { wevtutil cl $_ 2>$null }
```

### Icon cache

```powershell
Remove-Item "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\iconcache*" -Force -EA SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\thumbcache*" -Force -EA SilentlyContinue
```

---

## Phase 2 — Remove programs

### Find uninstallers

```powershell
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" -EA SilentlyContinue |
  Where-Object { $_.DisplayName -match "targetname" } |
  Select-Object DisplayName, UninstallString, InstallLocation
```

### Uninstall flow

1. Run the uninstaller: `& "path\to\uninstall.exe" /SILENT`
2. Wait 3-5 seconds
3. Remove leftover folder: `Remove-Item "path" -Recurse -Force`
4. Clean AppData: `Remove-Item "$env:LOCALAPPDATA\ProgramName","$env:APPDATA\ProgramName" -Recurse -Force`
5. Clean registry entry (admin):
   ```powershell
   Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*","HKLM:\..." -EA SilentlyContinue |
     Where-Object { $_.DisplayName -match "targetname" } |
     ForEach-Object { Remove-ItemProperty -Path $_.PSPath -Name $_.PSChildName -Force }
   ```

### npm global packages

```powershell
npm uninstall -g packagename
```

### Desktop shortcuts

```powershell
Remove-Item "$env:USERPROFILE\Desktop\*.lnk" -Force -EA SilentlyContinue
Remove-Item "$env:PUBLIC\Desktop\*.lnk" -Force -EA SilentlyContinue  # may need admin
# If denied: cmd /c del /F /Q "C:\Users\Public\Desktop\Name.lnk"
```

---

## Phase 3 — Autostart cleanup

### Startup folder

```powershell
Remove-Item "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\item.lnk" -Force
```

### Registry Run key

```powershell
Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "EntryName" -Force
```

### Scheduled tasks

```powershell
Unregister-ScheduledTask -TaskName "TaskName" -Confirm:$false
# If denied, use admin:
Start-Process powershell -Verb RunAs -ArgumentList '-Command',
  'Unregister-ScheduledTask -TaskName "TaskName" -Confirm:$false' -Wait -WindowStyle Hidden
```

### Verify

```powershell
Get-ChildItem "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -EA SilentlyContinue
Get-ScheduledTask | Where-Object { $_.TaskPath -notmatch "\\Microsoft\\" } |
  Select-Object TaskName, State
```

---

## Phase 4 — Visual performance

All changes go to HKCU — no admin needed. Changes apply after logout/restart.

```powershell
# Faster menu animation (default 400ms)
Set-ItemProperty "HKCU:\Control Panel\Desktop" "MenuShowDelay" "50"
# Disable window minimize/maximize animation
Set-ItemProperty "HKCU:\Control Panel\Desktop\WindowMetrics" "MinAnimate" "0"
# Best performance visual effects
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects" "VisualFXSetting" 2
# Disable transparency
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" "EnableTransparency" 0
```

---

## Phase 5 — Privacy & background apps

```powershell
# Disable tips and suggested apps
$cdm = "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager"
Set-ItemProperty $cdm "SoftLandingEnabled" 0
Set-ItemProperty $cdm "SystemPaneSuggestionsEnabled" 0
Set-ItemProperty $cdm "SubscribedContent-338389Enabled" 0
Set-ItemProperty $cdm "SubscribedContent-338388Enabled" 0

# Disable background apps
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications" "GlobalUserDisabled" 1
```

### Admin-only (telemetry, Cortana, Game DVR)

```powershell
# Disable telemetry
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" "AllowTelemetry" 0

# Disable Cortana and web search in Start
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"
if (!(Test-Path $path)) { New-Item $path -Force | Out-Null }
Set-ItemProperty $path "AllowCortana" 0
Set-ItemProperty $path "DisableWebSearch" 1
Set-ItemProperty $path "ConnectedSearchUseWeb" 0

# Disable Game DVR
$gpath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\GameDVR"
if (!(Test-Path $gpath)) { New-Item $gpath -Force | Out-Null }
Set-ItemProperty $gpath "AllowGameDVR" 0
```

---

## Phase 6 — Memory & storage

### Page file (CRITICAL — admin)

Windows with no page file will crash when RAM fills up. Always configure one.

```powershell
# Disable automatic management
$cs = Get-WmiInstance Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $false
$cs.Put() | Out-Null

# Set page file (4-8 GB recommended for16 GB RAM)
$pf = ([WMIClass]"root\cimv2:Win32_PageFileSetting").CreateInstance()
$pf.Name = "C:\pagefile.sys"
$pf.InitialSize = 4096
$pf.MaximumSize = 8192
$pf.Put() | Out-Null
```

### Prefetch optimization

```powershell
$pp = "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters"
Set-ItemProperty $pp "EnablePrefetcher" 0
Set-ItemProperty $pp "EnableSuperfetch" 0
```

### NTFS last access time (SSD optimization)

```powershell
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" "NtfsDisableLastAccessUpdate" 80000003
```

### Verify TRIM is enabled (SSD)

```powershell
fsutil behavior query DisableDeleteNotify
# Should show: DisableDeleteNotify = 0 (disabled = TRIM enabled)
```

---

## Phase 7 — Network (optional)

### DNS (Cloudflare1.1.1.1 — faster than router DNS)

Note: DHCP may override. Change DNS on router for permanent effect.

```powershell
# Via netsh
netsh interface ip set dns "Ethernet" static 1.1.1.1 primary
netsh interface ip add dns "Ethernet" 1.0.0.1 index=2

# Or via registry (adapter GUID required)
$guid = (Get-NetAdapter -Name "Ethernet").InterfaceGuid
$rp = "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces\$guid"
Set-ItemProperty $rp "NameServer" "1.1.1.1,1.0.0.1"
Set-ItemProperty $rp "DhcpNameServer" "1.1.1.1,1.0.0.1"
Restart-NetAdapter -Name "Ethernet"
```

### Verify

```powershell
Get-DnsClientServerAddress -InterfaceAlias "Ethernet" -AddressFamily IPv4
ipconfig /flushdns
```

---

## Phase 8 — Services to consider disabling

Check if these are running and whether you need them:

| Service | Name | Safe to disable if... |
|---|---|---|
| SysMain | Superfetch | SSD installed (already disabled on most setups) |
| WSearch | Windows Search | Not using file search (you have Everything) |
| DiagTrack | Telemetry | Always safe |
| RetailDemo | Retail demo | Not in a store |
| MapsBroker | Offline maps | Not using Maps |

```powershell
Get-Service -Name "SysMain","WSearch","DiagTrack","RetailDemo","MapsBroker" -EA SilentlyContinue |
  Select-Object Name, Status, StartType
```

---

## Post-optimization checklist

1. [ ] Reboot — page file, visual tweaks, DNS apply on restart
2. [ ] Verify page file exists: `Get-CimInstance Win32_PageFileUsage`
3. [ ] Verify DNS: `Get-DnsClientServerAddress`
4. [ ] Check no programs were broken by removal
5. [ ] Run `npm cache clean --force` if npm was used
6. [ ] Verify autostart is clean

---

## What NOT to touch

- Windows Update service (wuauserv) — keep enabled
- Windows Audio (Audiosrv) — keep enabled
- DHCP client (Dhcp) — keep enabled
- DNS client (Dnscache) — keep enabled
- RPC (RpcSs) — critical
- Plug and Play — critical
- Power service — critical
- NVIDIA/AMD GPU services — keep for graphics
- Antivirus — unless replacing with specific alternative

---

## Phase 9 — Deep optimization (after basics done)

Run Phase 0 audit first. If basics (Phases 1-8) are done — go deeper.

### Browser cleanup

Firefox/Chrome eat1-2 GB RAM with dozens of processes. After basic cleanup:

```powershell
# Check browser RAM usage
Get-Process -Name "firefox","chrome","msedge" -EA SilentlyContinue |
  Group-Object Name | ForEach-Object {
    [PSCustomObject]@{
      Name = $_.Name
      Processes = $_.Count
      RAM_MB = [math]::Round(($_.Group | Measure-Object WorkingSet64 -Sum).Sum/1MB)
    }
  }
```

Actions:
- Close unused tabs (each tab = separate process = RAM)
- Clear browser cache: Settings → Privacy → Clear browsing data
- Disable unused extensions (each loads in every tab)
- Firefox: `about:config` → `browser.sessionstore.interval` =60000 (save session less often)
- Consider `browser.cache.disk.capacity` =256000 (256 MB limit)

### Disk health (SMART)

```powershell
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus, Size
Get-Disk | Select-Object Number, FriendlyName, PartitionStyle,
  @{N='SizeGB';E={[math]::Round($_.Size/1GB,1)}}
```

If HealthStatus != "Healthy" — backup immediately.

### SSD vs HDD defrag check

SSD should NEVER be defragmented, only TRIM'd. Verify:

```powershell
# Check if scheduled defrag exists
Get-ScheduledTask -TaskName "ScheduledDefrag" -EA SilentlyContinue |
  Select-Object TaskName, State

# Check TRIM status
fsutil behavior query DisableDeleteNotify
# NTFS DisableDeleteNotify = 0 → TRIM enabled (good)
```

If defrag is scheduled for SSD — disable it:

```powershell
# Disable scheduled defrag for SSD (admin)
Start-Process powershell -Verb RunAs -ArgumentList '-Command',
  'Unregister-ScheduledTask -TaskName "ScheduledDefrag" -Confirm:$false'
```

### System file integrity

Corrupted system files cause random crashes, failed updates, weird errors.

```powershell
# Scan for corruption (read-only, safe)
sfc /scannow

# If SFC found issues but couldn't fix:
DISM /Online /Cleanup-Image /RestoreHealth

# After DISM, re-run SFC
sfc /scannow
```

### Component store cleanup (winsxs)

Windows accumulates old update components. Clean them:

```powershell
# Check component store size
DISM /Online /Cleanup-Image /AnalyzeComponentStore

# Clean if recommended (admin)
Start-Process powershell -Verb RunAs -ArgumentList '-Command',
  'DISM /Online /Cleanup-Image /StartComponentCleanup /ResetBase'
```

Can free1-5 GB on old installations.

### PATH environment variable audit

Developers accumulate PATH entries that slow down every shell startup:

```powershell
# Show current PATH
$env:PATH -split ';' | ForEach-Object { $_ }

# Check for duplicates
$env:PATH -split ';' | Group-Object | Where-Object { $_.Count -gt1 }
```

Remove dead paths:

```powershell
$path = [Environment]::GetEnvironmentVariable("Path", "User")
$cleaned = ($path -split ';' | Where-Object { $_ -and (Test-Path $_) }) -join ';'
[Environment]::SetEnvironmentVariable("Path", $cleaned, "User")
```

### Network profile (Private = faster file sharing)

```powershell
# Check current profile
Get-NetConnectionProfile | Select-Object Name, NetworkCategory

# Set to Private (faster local discovery, HomeGroup)
Set-NetConnectionProfile -InterfaceAlias "Ethernet 2" -NetworkCategory Private
```

### Windows features to consider disabling

Check what's enabled and disable what you don't use:

```powershell
# List enabled features (admin needed for changes)
Get-WindowsOptionalFeature -Online | Where-Object { $_.State -eq 'Enabled' } |
  Select-Object FeatureName

# Common safe-to-disable:
# - Internet Explorer 11 (if not using legacy sites)
# - Windows Media Player (if using VLC/other)
# - Work Folders (if not in corporate domain)
# - XPS Viewer (if not printing XPS)
# - Remote Desktop (if not using RDP)
```

```powershell
# Disable feature example (admin)
Start-Process powershell -Verb RunAs -ArgumentList '-Command',
  'Disable-WindowsOptionalFeature -Online -FeatureName "Internet-Explorer-Optional-amd64" -NoRestart'
```

### Startup impact analysis

Check which programs slow boot the most:

```powershell
# Check startup impact via registry
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" -EA SilentlyContinue
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\StartupFolder" -EA SilentlyContinue
```

Or via Task Manager → Startup tab (manual check).

### Disable startup delay

Windows delays startup items by default. Remove the delay:

```powershell
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Serialize" "StartupDelayInMSec" 0
```

### Windows Spotlight & lock screen ads

```powershell
# Disable Spotlight
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" "RotatingLockScreenEnabled" 0
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" "RotatingLockScreenOverlayEnabled" 0

# Disable lock screen ads/tips
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" "SubscribedContent-338387Enabled" 0
```

### USB selective suspend (can disconnect USB devices)

```powershell
# Disable USB selective suspend
powercfg /SETACVALUEINDEX SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 0
powercfg /SETACTIVE SCHEME_CURRENT
```

### PCI Express Link State Power Management

```powershell
# Disable PCIe power saving (prevents GPU/SSD throttling)
powercfg /SETACVALUEINDEX SCHEME_CURRENT 501a4d13-42af-4429-9fd1-a8218c268e20 ee12f906-d277-404b-b6da-e5fa1a576df5 0
powercfg /SETACTIVE SCHEME_CURRENT
```

### Hibernate check

Should be off on SSD (saves disk space = RAM size):

```powershell
# Check hibernate status
powercfg /hibernate /query

# Disable if off (saves disk space equal to RAM)
powercfg /hibernate off
```

---

## Phase 10 — Maintenance schedule

After all optimization — set up recurring cleanup.

### Weekly temp cleanup (Task Scheduler)

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument '-Command "Remove-Item $env:TEMP\* -Recurse -Force -EA SilentlyContinue; Clear-RecycleBin -Force -EA SilentlyContinue"'
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 3AM
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "WeeklyCleanup" -Description "Weekly temp and recycle bin cleanup"
```

### Monthly DISM cleanup

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument '-Command "DISM /Online /Cleanup-Image /StartComponentCleanup /ResetBase"'
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 4AM
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "MonthlyDISMCleanup" -Description "Monthly Windows component cleanup"
```

---

## Phase 11 — Monitoring

### Quick health check script

Save as `$env:USERPROFILE\Scripts\health-check.ps1`:

```powershell
Write-Output "=== SYSTEM HEALTH CHECK ==="
Write-Output ""

# RAM
$os = Get-CimInstance Win32_OperatingSystem
$totalGB = [math]::Round($os.TotalVisibleMemorySize/1MB,1)
$freeGB = [math]::Round($os.FreePhysicalMemory/1MB,1)
$usedPct = [math]::Round(($totalGB-$freeGB)/$totalGB*100,1)
Write-Output "RAM: $freeGB GB free / $totalGB GB ($usedPct% used)"

# Disk
Get-PSDrive -PSProvider FileSystem | ForEach-Object {
  $free = [math]::Round($_.Free/1GB,1)
  $total = [math]::Round(($_.Used+$_.Free)/1GB,1)
  Write-Output "Disk $($_.Name): $free GB free / $total GB"
}

# CPU
$cpu = (Get-CimInstance Win32_Processor).LoadPercentage
Write-Output "CPU: $cpu% load"

# Top processes
Write-Output ""
Write-Output "=== TOP RAM PROCESSES ==="
Get-Process | Group-Object Name | ForEach-Object {
  [PSCustomObject]@{
    Name = $_.Name
    Count = $_.Count
    RAM_MB = [math]::Round(($_.Group | Measure-Object WorkingSet64 -Sum).Sum/1MB)
  }
} | Sort-Object RAM_MB -Descending | Select-Object -First 10 | Format-Table -AutoSize

# Temp size
$tempSize = (Get-ChildItem $env:TEMP -Recurse -Force -EA SilentlyContinue |
  Measure-Object Length -Sum).Sum
Write-Output "Temp: $([math]::Round($tempSize/1MB,1)) MB"

# Uptime
$boot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$uptime = (Get-Date) - $boot
Write-Output "Uptime: $([math]::Floor($uptime.Days))d $($uptime.Hours)h $($uptime.Minutes)m"
```

Run it:

```powershell
powershell -File "$env:USERPROFILE\Scripts\health-check.ps1"
```

---

## Quick reference — optimization levels

| Level | Phases | Time | Impact |
|---|---|---|---|
| Basic | 1-3 |5 min | Clean junk, remove bloatware, fix autostart |
| Standard | 1-6 |15 min | + visual perf, privacy, page file |
| Full | 1-8 |30 min | + network, services |
| Deep | 1-11 |1 hour | + browser, system files, features, maintenance |
| Pro | All |2 hours | + monitoring, scheduled maintenance |
