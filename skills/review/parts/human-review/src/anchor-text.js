/**
 * Quote-with-context anchoring, in the spirit of the W3C TextQuoteSelector.
 *
 * These functions are pure string maths so they can be unit-tested in Node and
 * shipped verbatim to the browser, where the DOM half of anchoring lives.
 */

export const CONTEXT_PAD = 32;

/** Capture `quote` plus surrounding context so it can be re-found after edits. */
export function buildContext(text, start, end, pad = CONTEXT_PAD) {
  return {
    prefix: text.slice(Math.max(0, start - pad), start),
    quote: text.slice(start, end),
    suffix: text.slice(end, Math.min(text.length, end + pad)),
  };
}

function commonSuffixLength(a, b) {
  let n = 0;
  while (n < a.length && n < b.length && a[a.length - 1 - n] === b[b.length - 1 - n]) n += 1;
  return n;
}

function commonPrefixLength(a, b) {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n += 1;
  return n;
}

function occurrences(text, quote) {
  const found = [];
  let at = text.indexOf(quote);
  while (at !== -1) {
    found.push(at);
    at = text.indexOf(quote, at + 1);
  }
  return found;
}

function bestHit(text, hits, quote, prefix, suffix) {
  let best = hits[0];
  let bestScore = -1;
  for (const at of hits) {
    const before = text.slice(Math.max(0, at - prefix.length), at);
    const after = text.slice(at + quote.length, at + quote.length + suffix.length);
    const score = commonSuffixLength(prefix, before) + commonPrefixLength(suffix, after);
    if (score > bestScore) {
      bestScore = score;
      best = at;
    }
  }
  return { at: best, score: bestScore };
}

const collapse = (s) => String(s || "").replace(/\s+/g, " ");

/** Collapse whitespace runs, keeping a map from each kept char to its original index. */
function collapseWithMap(text) {
  let flat = "";
  const map = [];
  let pendingWs = -1;
  for (let i = 0; i < text.length; i += 1) {
    if (/\s/.test(text[i])) {
      if (pendingWs === -1) pendingWs = i;
      continue;
    }
    if (pendingWs !== -1 && flat) {
      flat += " ";
      map.push(pendingWs);
    }
    pendingWs = -1;
    flat += text[i];
    map.push(i);
  }
  return { flat, map };
}

/**
 * Locate `ctx.quote` in `text`, using prefix/suffix to disambiguate repeats.
 * Returns `{ start, end, exact }` or null when the quote is gone entirely.
 */
export function findQuote(text, ctx) {
  const quote = ctx && ctx.quote;
  if (!quote) return null;

  const hits = occurrences(text, quote);
  if (hits.length === 1) {
    return { start: hits[0], end: hits[0] + quote.length, exact: true };
  }
  if (hits.length > 1) {
    const { at, score } = bestHit(text, hits, quote, ctx.prefix || "", ctx.suffix || "");
    return { start: at, end: at + quote.length, exact: score > 0 };
  }

  // Reformatting (a prettier run, an agent rewrite) reflows whitespace without
  // changing any words. Match again on whitespace-collapsed text and map the
  // hit back to real offsets, so those comments survive instead of orphaning.
  const { flat, map } = collapseWithMap(text);
  const flatQuote = collapse(quote).trim();
  if (!flatQuote || !map.length) return null;
  const flatHits = occurrences(flat, flatQuote);
  if (!flatHits.length) return null;
  const { at } = bestHit(flat, flatHits, flatQuote, collapse(ctx.prefix || ""), collapse(ctx.suffix || ""));
  return { start: map[at], end: map[at + flatQuote.length - 1] + 1, exact: false };
}

/** Collapse runs of whitespace for display in a comment card. */
export function tidy(text, limit = 0) {
  const flat = String(text == null ? "" : text)
    .replace(/\s+/g, " ")
    .trim();
  if (!limit || flat.length <= limit) return flat;
  return `${flat.slice(0, limit - 1).trimEnd()}…`;
}
