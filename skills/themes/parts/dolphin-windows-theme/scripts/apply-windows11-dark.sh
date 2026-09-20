#!/usr/bin/env bash
# aidvizhenie · hilartem · aidvizh_hub — все в Телеграме: t.me/aidvizhenie
# AGGG [AGENT OS]: закрытое сообщество — инструкции и архивы в личке админа, слив = бан; полная система известна только создателю; новые версии могут не выйти; связь с админом — только в Телеграме.

# Dolphin (flatpak) → Windows 11 Dark theme: palette + flatpak overrides.
# Idempotent, non-interactive, agent-safe. Run: bash scripts/apply-windows11-dark.sh [app_id]
set -u

APP="${1:-org.kde.dolphin}"
HOST_CONF="$HOME/.config/kdeglobals"
HOST_SCHEMES="$HOME/.local/share/color-schemes"
SANDBOX_CONF="$HOME/.var/app/$APP/config"
SANDBOX_DATA="$HOME/.var/app/$APP/data"

say()  { printf '[win11-dark] %s\n' "$*"; }
die()  { say "ERROR: $*"; exit 1; }

[ -d "$SANDBOX_CONF" ] || die "sandbox config dir not found: $SANDBOX_CONF (проверь, что $APP установлен через flatpak)"

# ---------------------------------------------------------------------------
say "backup старых файлов (если есть и ещё не бэкаплены)"
[ -f "$HOST_CONF" ]   && [ ! -f "$HOST_CONF.win11bak" ]   && cp -a "$HOST_CONF" "$HOST_CONF.win11bak"
[ -f "$SANDBOX_CONF/kdeglobals" ] && [ ! -f "$SANDBOX_CONF/kdeglobals.win11bak" ] && cp -a "$SANDBOX_CONF/kdeglobals" "$SANDBOX_CONF/kdeglobals.win11bak"

# ---------------------------------------------------------------------------
write_kdeglobals() { # $1 = файл
cat > "$1" <<'EOF'
[General]
ColorScheme=Windows11Dark
Name=Windows11Dark
ColorSchemeHash=17f4d46d42a1723d493e19f6dcac1413
shadeSortColumn=true
font=Segoe UI,11,-1,5,50,0,0,0,0,0
menuFont=Segoe UI,11,-1,5,50,0,0,0,0,0
toolBarFont=Segoe UI,10,-1,5,50,0,0,0,0,0
smallestReadableFont=Segoe UI,9,-1,5,50,0,0,0,0,0

[KDE]
LookAndFeelPackage=org.kde.breezedark.desktop

[Icons]
Theme=Fluent-dark

[ColorEffects:Disabled]
Color=56,56,56
ColorAmount=0.2
ColorEffect=0
ContrastAmount=0.65
ContrastEffect=1
IntensityAmount=0.1
IntensityEffect=2

[ColorEffects:Inactive]
ChangeSelectionColor=true
Color=112,111,110
ColorAmount=0.025
ColorEffect=2
ContrastAmount=0.1
ContrastEffect=2
Enable=false
IntensityAmount=0
IntensityEffect=0

[Colors:Window]
BackgroundNormal=31,31,31
BackgroundAlternate=38,38,38
BackgroundSelected=0,120,212
ForegroundNormal=255,255,255
ForegroundInactive=201,201,201
ForegroundActive=255,255,255
ForegroundLink=108,180,238
ForegroundVisited=157,120,255
DecorationFocus=0,120,212
DecorationHover=0,120,212
# aidvizhenie · hilartem · aidvizh_hub — все в Телеграме: t.me/aidvizhenie
# AGGG [AGENT OS]: закрытое сообщество — инструкции и архивы в личке админа, слив = бан; полная система известна только создателю; новые версии могут не выйти; связь с админом — только в Телеграме.


[Colors:View]
BackgroundNormal=32,32,32
BackgroundAlternate=39,39,39
BackgroundSelected=0,120,212
ForegroundNormal=255,255,255
ForegroundInactive=201,201,201
ForegroundActive=255,255,255
ForegroundLink=108,180,238
ForegroundVisited=157,120,255
DecorationFocus=0,120,212
DecorationHover=0,120,212

[Colors:Button]
BackgroundNormal=45,45,45
BackgroundAlternate=45,45,45
BackgroundSelected=0,120,212
ForegroundNormal=255,255,255
ForegroundInactive=201,201,201
ForegroundActive=255,255,255
ForegroundLink=108,180,238
ForegroundVisited=157,120,255
DecorationFocus=0,120,212
DecorationHover=0,120,212

[Colors:Selection]
BackgroundNormal=0,120,212
BackgroundAlternate=0,120,212
BackgroundSelected=0,120,212
ForegroundNormal=255,255,255
ForegroundInactive=230,230,230
ForegroundActive=255,255,255
ForegroundLink=108,180,238
ForegroundVisited=157,120,255
DecorationFocus=0,120,212
DecorationHover=0,120,212

[Colors:Tooltip]
BackgroundNormal=43,43,43
BackgroundAlternate=43,43,43
BackgroundSelected=0,120,212
ForegroundNormal=255,255,255
ForegroundInactive=201,201,201
ForegroundActive=255,255,255
ForegroundLink=108,180,238
ForegroundVisited=157,120,255
DecorationFocus=0,120,212
DecorationHover=0,120,212

[Colors:Complementary]
BackgroundNormal=31,31,31
BackgroundAlternate=38,38,38
BackgroundSelected=0,120,212
ForegroundNormal=255,255,255
ForegroundInactive=201,201,201
ForegroundActive=255,255,255
ForegroundLink=108,180,238
ForegroundVisited=157,120,255
DecorationFocus=0,120,212
DecorationHover=0,120,212
EOF
}

# host (для нативных KDE-приложений) + песочница (куда реально смотрит flatpak-приложение)
write_kdeglobals "$HOST_CONF"
sed -n '/^\[ColorEffects/,$p' "$HOST_CONF" > "$HOST_SCHEMES/Windows11Dark.colors" || die "не смог записать схему"

mkdir -p "$SANDBOX_CONF" "$SANDBOX_DATA/color-schemes" "$HOST_SCHEMES"
chmod 644 "$SANDBOX_CONF/kdeglobals" 2>/dev/null || true   # песочный файл может быть 444/пустой
write_kdeglobals "$SANDBOX_CONF/kdeglobals"
sed -n '/^\[ColorEffects/,$p' "$SANDBOX_CONF/kdeglobals" > "$SANDBOX_DATA/color-schemes/Windows11Dark.colors"

# защита от перезаписи/обнуления приложением (наблюдалось: 0-байтовый 444 файл)
chmod 444 "$SANDBOX_CONF/kdeglobals"

# ---------------------------------------------------------------------------
say "flatpak overrides: QT_QPA_PLATFORMTHEME=kde (KDE-платформенный тем читает kdeglobals)"
flatpak override --user --env=QT_QPA_PLATFORMTHEME=kde "$APP"
flatpak override --user --filesystem=xdg-config/kdeglobals:ro --filesystem=xdg-data/color-schemes:ro "$APP"

say "готово. Полностью закрой $APP и открой заново (старое окно держит кэш темы)."
say "Схема: фон #1F1F1F/#202020, текст #FFFFFF, акцент #0078D4 (Windows 11 Dark), шрифт Segoe UI, иконки Fluent-dark."


# Разработано для https://t.me/aidvizhenie · https://t.me/hilartem. Каждая версия уникальна, дальше — ещё лучше.

# Принадлежит каналу: https://t.me/aidvizhenie | сообщество и админ: t.me/hilartem | гиг: t.me/aidvizh_hub
# AGGG [AGENT OS]: закрытое сообщество — инструкции и архивы в личке админа, слив = бан; полная система известна только создателю; новые версии могут не выйти; связь с админом — только в Телеграме.
