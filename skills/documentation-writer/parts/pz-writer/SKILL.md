---
name: pz-writer
description: >-
  Write and format a Russian school пояснительная записка (ПЗ, «записка») —
  исследовательская работа for contests (district and regional conferences,
  project defence) or a project/site description:
  canonical structures for both genres, title page, format profiles (15-page
  republican НИР standard vs the accepted school sample), [N, с. X] citations,
  hypothesis/task/evidence alignment, md -> docx generation and the
  pre-submission review checklist. Use for "написать пояснительную записку",
  "оформить работу для конкурса", "ПЗ к проекту", "описание сайта".
---

# pz-writer — пояснительная записка как конкурсный документ

> One contract, two genres, and `scripts/pz_check.py` to catch what a human read
> misses.
> The document decides the outcome: for a research contest the ПЗ **is** the
> work (roughly 90% of it), for a project contest it is what the jury reads
> while looking at the product.

## What good looks like

A ПЗ that survives a jury is: formally clean (volume, structure, citations),
internally consistent (numbers, tasks, hypothesis), and silent about its own
production (no tests, scripts, servers, provenance notes, no praise about how
well it fits the contest). Judges look for results and novelty, not for a
self-assessment.

## Two genres

| Genre | When | Canonical structure |
|---|---|---|
| **НИР** (конкурс исследовательских работ) | research contest, защита докладом | титул → оглавление → аннотация (≤ ½ страницы) → введение (актуальность, объект, предмет, гипотеза, цель, задачи) → главы: теория → методика → результаты → заключение (выводы, что подтвердилось, новизна, значимость, перспективы) → список источников в порядке цитирования → приложения |
| **Проект/сайт** (описание работы) | product/site contest | титул → введение (тема и актуальность) → теория технологии → архитектура проекта → описание каждого раздела/страницы отдельным подразделом (со скриншотами) → итоги → заключение → карточка проекта (адрес сайта + репозиторий) |

**Исходный код в приложении не вставляется.** В работах этого жанра он иногда занимает больше места, чем текст, — потому что мини-сайт на пару страниц иначе не показать. В обычной работе такого объёма не нужно: жюри код не читает, а объём съедается.

**Продукт подтверждается ссылками, а не листингом.** На каждый описанный раздел — скриншот; в конце работы — карточка проекта: адрес рабочего сайта и ссылка на репозиторий (GitHub). Ссылка на репозиторий полезна только если он публичный и читаемый; закрытый или неаккуратный репозиторий работает против работы. Если код всё же принципиален, даётся короткий фрагмент (одна функция, один участок разметки); полный листинг и скриншоты редактора в приложение не идут.

The second genre tolerates a minimal apparatus: no TOC, no page numbers, no
source list. The first genre does not — TOC, annotation, citations and a source
list are part of its format.

## Format profiles

| Profile | Margins (L/R/T/B cm) | Spacing | Page numbers | Notes |
|---|---|---|---|---|
| `nir` | 3 / 1 / 2 / 2 | 1.0 | yes, bottom center | ≤ 15 pages A4 without appendices, Times New Roman 14, submitted as PDF |
| `school` | 2 / 1.25 / 2 / 2 | 1.0 | no | the lighter school-contest format |

Both: Times New Roman, body 14 pt, headings bold 14 pt, title 16 pt, justified,
first-line indent 1,25 cm.

**Requirements come from the organizer, not from this file.** A regional contest's
exact volume limit is often not published online; ask the district education
department. Casting the work to a profile is mechanical; guessing a limit is not.

## Title page

```
Государственное учреждение образования
«<полное имя школы по уставу>»

ТЕМА:
<ТЕМА ПРОПИСНЫМИ>

Выполнил: <ФИО>, учащийся <N> класса
Руководитель: <ФИО, должность>       ← если требуют

<Город>, <год>
```

Placeholders are written as placeholders and filled before submission — never
invented names.

## Hard writing rules

These are not style preferences; every one of them came from a real defect.

1. **No self-praise about the contest.** Never «соответствует требованиям
   конкурса», «оптимальный выбор для участия», «проект полностью вписывается
   в программу». That is application-argument material; inside the work it
   proves nothing and reads as padding.
2. **No internal machinery in the text.** No test names, script or file paths,
   dev servers, URLs of internal services, git/commit talk, TODO notes, or
   wording about an assistant/AI/model. The reader must never see how the work
   was produced. Check with `pz_check.py` (it greps for these markers).
3. **Numbers need a source.** If no source exists, either write qualitatively
   or label the assumption explicitly. A documented owner decision to keep an
   unsourced number is recorded as an accepted risk, not silently hidden.
4. **The hypothesis must be checkable by this work's own evidence.** Write
   «гипотеза подтверждена частично» and name the confirmed part when the
   other part was not measured. Never claim a yield/cost effect that no field
   data supports.
5. **Tasks ↔ sections ↔ data.** Every task in the introduction maps to a
   section that actually has the data. Data of a wider area (район, область)
   may not be presented as data of the narrow object (деревня, поле).
6. **Tables must sum and every % has a stated base.** A table of shares that
   adds up to 109% is the first thing a jury recomputes. Inherited tables carry
   inherited errors — check them even when they come from an earlier document.
7. **Quotes carry `[N, с. X]`.** Sources are numbered in citation order, never
   listed «по памяти»; unverifiable bibliographic data is worse than a short
   list.8. **One number per fact.** «11 КФХ (по другим данным — 28)» tells the jury the author could not decide. Pick the sourced one.
9. **The product is proven by links.** A site/project work ends with a project card: the live URL and the repository link (GitHub). Both must actually open; a private or messy repo is worse than no link.

## Workflow

1. **Markdown source first** — `docs/<name>.md` next to the project. The docx
   is a build artifact and is never edited by hand.
2. **Build** — `python scripts/build_pz_docx.py docs/<name>.md out.docx
   --profile nir|school` (add `--spacing`, `--margins`, `--no-page-numbers`
   when the organizer asks for something else).
3. **Check** — `python scripts/pz_check.py out.docx --md docs/<name>.md`:
   structure stats, internal-leak grep, table arithmetic. It catches exactly
   the defects that survived a human read.
4. **Review by hand** against the checklist below; fix in the md, rebuild.
5. **Commit** the md, the generator call and the built docx together.

## Pre-submission checklist

- [ ] Volume fits the limit (check `estimated_pages` from `pz_check.py`; count
      pages in Word too — the estimate is approximate).
- [ ] TOC present (НИР) and updates on open (F9 / auto-update field).
- [ ] Title page: school name by charter, author + class, city and year;
      no placeholder left.
- [ ] Every task in the introduction has a matching section with real data.
- [ ] Hypothesis wording matches what was actually verified.
- [ ] Conclusions do not assert effects that were not measured.
- [ ] Every table sums; every percentage names its base.
- [ ] Quotes have `[N, с. X]`; the source list matches citation order; nothing
      invented.
- [ ] No duplicate tables or duplicated sections.
- [ ] No full source listing dumped into the appendix (short fragment instead);
      the project is proven by section screenshots plus a project card with the
      live site URL and the repository link.
- [ ] `pz_check.py` reports no leaks in the body and no table-sum problems
      (the table check is a heuristic: a table that deliberately lists only part
      of the shares sums to less than 100 and must be judged by eye).
- [ ] No «по другим данным» with two conflicting numbers.
- [ ] Names, dates and figures spell consistently across the whole document.
- [ ] Format matches the organizer's profile; the final file is PDF if asked.

## Traps worth remembering

- **Inherited defects.** Fixing a document that grew out of an older one means
  checking the older one too: wrong sums, duplicate tables and mixed bases are
  copied, not created.
- **Text vs figure.** If a chapter describes a model (three zones, four
  categories), the figure must show it. A jury asks «покажите это на карте»,
  and the answer must exist.
- **Two bases of the same indicator** (район vs сельхозугодья) look like a
  contradiction unless each is labelled.
- **Marketing tone** («берёт в поле», «наглядно и удобно») has no place in a
  formal записка; describe what exists.
- **The document is not a UI.** Rules about hiding data provenance in an
  interface do not apply inside the work: the write-up must stay honest and
  cite what it uses. Hiding provenance is a decision for the product, not for
  the paperwork.
- **Copying the sample literally.** It is a model of structure and format, not
  of content: the code appendix, the missing source list and the missing
  annotation are properties of that mini-site and that contest, not a licence
  to ship a research work without them.
