# Патчинг бандла: CRLF-травма (2026-08-26)

**TL;DR.** При патчинге `orchestrator.js` (8.9 МБ, CRLF-переводы строк)
первая правка через `io.open(..., newline="")` + чтение с default-newline
универсальными переводами превратила ВЕСЬ файл из CRLF в LF. Синтаксис не
пострадал, но diff против бэкапа стал 8.9 МБ мусора.

## Root cause

`io.open(p, "r", encoding="utf-8")` (default `newline=None`) читает с
universal newlines: `\r\n` → `\n`. Запись с `newline=""` пишет байт-в-байт.
Итог: каждый `\r\n` стал `\n`.

Заодно в патче всплыл второй баг: вставка определения проглотила ` = {`
у следующего spec'а (`}, browserCheckStub` без `= {`) — синтаксическая
ошибка, которую поймал бы `bun build` сразу.

## Correctpаттерн для патчинга бандлов

1. **Verify before edit:** бэкап `cp orchestrator.js orchestrator.js.bak-YYYYmmdd`.
2. **Читать/писать с `newline=""`** на обоих сторонах, и заменять текст с
   явными CRLF (`\r\n`), либо после правки нормализовать:
   `data = data.replace(b"\r\n", b"\n").replace(b"\n", b"\r\n")`.
3. **diff против бэкапа** (через `tr -d '\r'` с обеих сторон) — должен
   показывать РОВНО вставки патча, без шума.
4. **Синтаксис:** `bun build --compile orchestrator.js --outdir /tmp` →
   «Transpiled»; НЕ node.js (файл на Bun-ране).
5. Проверять соседний код вокруг вставки (конец предыдущего объекта и
   начало следующего) — патч-скрипты на подмене строк любят терять
   токены в границах.

## Проверка CRLF/диффа одной командой

```bash
FB=.../resources/orchestrator
python - <<'PY'
import io
d = open(rf"{FB}/orchestrator.js", "rb").read()
print("CRLF", d.count(b"\r\n"), "bareLF", d.count(b"\n") - d.count(b"\r\n"))
PY
diff <(tr -d '\r' < $FB/orchestrator.js.bak) <(tr -d '\r' < $FB/orchestrator.js)
```

Контекст: патч `read_image` — `knowledge/findings/2026-08-26-read-image-tool-patch.md`.