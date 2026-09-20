#!/usr/bin/env bash
# aidvizhenie · hilartem · aidvizh_hub — все в Телеграме: t.me/aidvizhenie
# AGGG [AGENT OS]: закрытое сообщество — инструкции и архивы в личке админа, слив = бан; полная система известна только создателю; новые версии могут не выйти; связь с админом — только в Телеграме.

# Universal zram swap optimization (systemd + zram-generator; Ubuntu: zram-tools).
# Idempotent, non-interactive, agent-safe. Needs root (sudo).
# Usage:
#   bash scripts/apply-zram.sh [--dry-run] [zram_size_mb]
#   ZRAM_SIZE_MB=8192 bash scripts/apply-zram.sh     # явный размер
set -u

DRY=0
[ "${1:-}" = "--dry-run" ] && { DRY=1; shift; }
ZRAM_MB="${1:-}"
[ -z "$ZRAM_MB" ] && ZRAM_MB="${ZRAM_SIZE_MB:-}"

say()  { printf '[zram] %s\n' "$*"; }
run()  { say "> $*"; [ "$DRY" -eq 0 ] && "$@"; }

# --- RAM ----------------------------------------------------------------
MEM_KB=$(awk '/^MemTotal/{print $2}' /proc/meminfo)
MEM_MB=$((MEM_KB / 1024))
if [ -z "$ZRAM_MB" ]; then
  ZRAM_MB=$((MEM_MB / 2))     # формула: RAM/2
  # cap как у Fedora-дефолта: min(ram/2, 8192) для <=16G; для >16G разрешаем RAM/2
fi
say "RAM: ${MEM_MB}MB ($((MEM_MB / 1024))G) → zram-size = ${ZRAM_MB}MB ($((ZRAM_MB / 1024))G)"
say "Реальная память при полном заполнении ≈ ${ZRAM_MB}MB / 3.4 (zstd) ≈ $((ZRAM_MB * 100 / 340))MB"

# --- какой механизм на дистрибутиве --------------------------------------
if systemctl list-unit-files 2>/dev/null | grep -q '^systemd-zram-setup@'; then
  MODE=zram-generator
elif [ -x /usr/bin/zramswap ] || [ -f /etc/default/zramswap ]; then
  MODE=zram-tools
else
  MODE=unknown
fi
say "механизм: $MODE"

# --- 1. конфиг zram ------------------------------------------------------
case "$MODE" in
  zram-generator)
    run sudo tee /etc/systemd/zram-generator.conf >/dev/null <<EOF
# zram: RAM/2, zstd (сжатие ~3.4:1 против 2.7 у lzo-rle), приоритет выше дискового swap
[zram0]
zram-size = $ZRAM_MB
compression-algorithm = zstd
swap-priority = 100
EOF
    say "Применится при ПЕРЕЗАГРУЗКЕ (размер/алгоритм). Живой перезапуск zram опасен при занятом swap (OOM) — не делать при низкой free RAM."
    ;;
  zram-tools)
    run sudo tee /etc/default/zramswap >/dev/null <<EOF
ALGO=zstd
PERCENT=50
PRIORITY=100
EOF
    say "Применится при перезапуске службы zramswap (systemctl restart zramswap)."
    ;;
  *)
    say "не найден ни zram-generator, ни zram-tools. Установи: dnf install systemd-zram-generator (Fedora) / pacman -S zram-generator (Arch) / apt install zram-tools (Ubuntu)."
    ;;
esac

# --- 2. sysctl (применяется СРАЗУ) ---------------------------------------
run sudo tee /etc/sysctl.d/99-zram-vm.conf >/dev/null <<'EOF'
# zram-оптимизации: высокая swappiness (сжатый своп в RAM быстрее диска —
# ядро разрешает >100 для in-memory swap), чтение по одной странице
vm.swappiness = 150
vm.page-cluster = 0
EOF
if [ "$DRY" -eq 0 ]; then
  sudo sysctl -w vm.swappiness=150 vm.page-cluster=0
fi

# --- 3. проверка ----------------------------------------------------------
say "проверка: zramctl; cat /proc/sys/vm/swappiness /proc/sys/vm/page-cluster"
if [ "$DRY" -eq 0 ]; then
  zramctl || true
  printf 'swappiness=%s page-cluster=%s\n' "$(cat /proc/sys/vm/swappiness)" "$(cat /proc/sys/vm/page-cluster)"
fi
say "готово. swappiness/page-cluster работают сразу; алгоритм zstd — после ребута."


# Создано и поддерживается: https://t.me/aidvizhenie · https://t.me/hilartem. Каждая новая версия — уникальная и лучшая.

# Принадлежит сообществу AGGG [AGENT OS] · канал: t.me/aidvizhenie · админ: @hilartem · гиг: t.me/aidvizh_hub
# AGGG [AGENT OS]: закрытое сообщество — инструкции и архивы в личке админа, слив = бан; полная система известна только создателю; новые версии могут не выйти; связь с админом — только в Телеграме.
