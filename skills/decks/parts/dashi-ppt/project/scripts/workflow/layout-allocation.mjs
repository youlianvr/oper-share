// @ts-check

const DEFAULT_BEAM_WIDTH = 72;
const DEFAULT_CANDIDATE_LIMIT = 120;

export function createLayoutAllocationState() {
  return {
    layoutUsage: new Map(),
    familyUsage: new Map(),
    compositionUsage: new Map(),
    tripletUsage: new Map(),
    familyTripletUsage: new Map(),
    layoutPairUsage: new Map(),
    shapePairUsage: new Map(),
    positionUsage: [new Map(), new Map(), new Map()],
    positionCompositionUsage: [new Map(), new Map(), new Map()],
    pageFamilies: new Map(),
    previousFamilies: new Set(),
  };
}

export function selectDiverseLayouts(
  candidates,
  count,
  allocationState,
  seed = null,
  slideIndex = null,
  options = {},
) {
  return selectDiverseLayoutCandidates(
    candidates,
    count,
    allocationState,
    seed,
    slideIndex,
    options,
  ).map(item => item.layout);
}

export function selectDiverseLayoutCandidates(
  candidates,
  count,
  allocationState,
  seed = null,
  slideIndex = null,
  options = {},
) {
  const requestedCount = Math.max(1, Math.floor(Number(count) || 0));
  const candidateLimit = Math.max(
    requestedCount,
    Math.floor(Number(options.candidateLimit) || DEFAULT_CANDIDATE_LIMIT),
  );
  const beamWidth = Math.max(
    requestedCount,
    Math.floor(Number(options.beamWidth) || DEFAULT_BEAM_WIDTH),
  );
  const pool = uniqueCandidates(candidates).slice(0, candidateLimit);
  if (pool.length < requestedCount) {
    throw new Error(`layout allocation requires ${requestedCount} candidates, received ${pool.length}`);
  }

  let beam = [{ items: [], nextIndex: 0, score: 0, key: '' }];
  for (let depth = 0; depth < requestedCount; depth += 1) {
    const remainingAfterPick = requestedCount - depth - 1;
    const expanded = [];
    for (const node of beam) {
      const finalStart = pool.length - remainingAfterPick;
      for (let index = node.nextIndex; index < finalStart; index += 1) {
        const items = [...node.items, pool[index]];
        expanded.push({
          items,
          nextIndex: index + 1,
          score: boundedCombinationScore(items, allocationState, seed, slideIndex),
          key: layoutTripletKey(items),
        });
      }
    }
    expanded.sort(compareBeamNodes);
    beam = expanded.slice(0, beamWidth);
  }

  const selected = beam.sort(compareBeamNodes)[0]?.items || pool.slice(0, requestedCount);
  const ordered = orderLayoutCombination(selected, allocationState, seed);
  recordAllocation(ordered, allocationState, slideIndex);
  return ordered;
}

export function rebalanceDuplicateLayouts(assignments, candidateMatrix, seed) {
  const usage = new Map();
  assignments.flat().forEach(layout => incrementUsage(usage, layout));
  while (true) {
    const selected = new Set(assignments.flat());
    const opportunities = [];
    assignments.forEach((layouts, pageIndex) => {
      const candidateByLayout = new Map(
        (candidateMatrix[pageIndex]?.candidates || []).map(item => [item.layout, item]),
      );
      const current = layouts.map(layout => candidateByLayout.get(layout)).filter(Boolean);
      if (current.length !== layouts.length) return;
      const currentCompositionDiversity = new Set(current.map(layoutCompositionIdentity)).size;
      const currentFamilyDiversity = new Set(current.map(layoutFamily)).size;
      layouts.forEach((layout, slotIndex) => {
        if ((usage.get(layout) || 0) < 2) return;
        const alternatives = (candidateMatrix[pageIndex]?.candidates || [])
          .filter(item => !selected.has(item.layout))
          .filter(item => !layouts.includes(item.layout))
          .filter(item => {
            const replaced = current.map((entry, index) => index === slotIndex ? item : entry);
            return new Set(replaced.map(layoutCompositionIdentity)).size >= currentCompositionDiversity
              && new Set(replaced.map(layoutFamily)).size >= currentFamilyDiversity;
          });
        if (!alternatives.length) return;
        opportunities.push({ pageIndex, slotIndex, layout, alternatives });
      });
    });
    if (!opportunities.length) return;
    const opportunity = opportunities.sort((left, right) => (
      left.alternatives.length - right.alternatives.length
      || (usage.get(right.layout) || 0) - (usage.get(left.layout) || 0)
      || left.pageIndex - right.pageIndex
      || left.slotIndex - right.slotIndex
    ))[0];
    const replacement = [...opportunity.alternatives].sort((left, right) => (
      (usage.get(left.layout) || 0) - (usage.get(right.layout) || 0)
      || Number(right.queryScore || 0) - Number(left.queryScore || 0)
      || stableHash(`${seed}:rebalance:${opportunity.pageIndex}:${right.layout}`)
        - stableHash(`${seed}:rebalance:${opportunity.pageIndex}:${left.layout}`)
      || left.layout.localeCompare(right.layout)
    ))[0];
    assignments[opportunity.pageIndex][opportunity.slotIndex] = replacement.layout;
    usage.set(opportunity.layout, Math.max(0, (usage.get(opportunity.layout) || 1) - 1));
    incrementUsage(usage, replacement.layout);
  }
}

export function layoutFamily(item) {
  return item?.structureFingerprint?.family || 'unknown';
}

export function layoutCompositionIdentity(item) {
  const fingerprint = item?.structureFingerprint || {};
  return [
    fingerprint.family || 'unknown',
    fingerprint.compositionType || 'unknown',
    fingerprint.primaryShape || 'none',
  ].join(':');
}

function uniqueCandidates(candidates) {
  const seen = new Set();
  return (Array.isArray(candidates) ? candidates : []).filter(item => {
    const layout = String(item?.layout || '');
    if (!layout || seen.has(layout)) return false;
    seen.add(layout);
    return true;
  });
}

function compareBeamNodes(left, right) {
  return right.score - left.score || left.key.localeCompare(right.key);
}

function boundedCombinationScore(combination, state, seed, slideIndex) {
  const families = combination.map(layoutFamily);
  const compositions = combination.map(layoutCompositionIdentity);
  const shapes = combination.map(item => item?.structureFingerprint?.primaryShape || 'none');
  const distinctFamilies = new Set(families).size;
  const distinctCompositions = new Set(compositions).size;
  const distinctShapes = new Set(shapes).size;
  const queryScore = combination.reduce((sum, item) => sum + Number(item?.queryScore || 0), 0);
  const layoutReuse = combination.reduce((sum, item) => {
    const usage = state?.layoutUsage?.get(item.layout) || 0;
    return sum + usage * usage;
  }, 0);
  const novelLayouts = combination.filter(item => !(state?.layoutUsage?.get(item.layout) || 0)).length;
  const compositionReuse = compositions.reduce(
    (sum, identity) => sum + (state?.compositionUsage?.get(identity) || 0),
    0,
  );
  const familyReuse = families.reduce(
    (sum, family) => sum + (state?.familyUsage?.get(family) || 0),
    0,
  );
  const adjacentFamilies = new Set([
    ...(state?.pageFamilies?.get(Number(slideIndex) - 1) || []),
    ...(state?.pageFamilies?.get(Number(slideIndex) + 1) || []),
  ]);
  const adjacentOverlap = families.filter(family => adjacentFamilies.has(family)).length;
  const complete = combination.length >= 3;
  const tripletUsage = complete
    ? state?.tripletUsage?.get(layoutTripletKey(combination)) || 0
    : 0;
  const familyTripletUsage = complete
    ? state?.familyTripletUsage?.get(familyTripletKey(combination)) || 0
    : 0;
  const pairReuse = layoutPairKeys(combination).reduce(
    (sum, key) => sum + (state?.layoutPairUsage?.get(key) || 0),
    0,
  );
  const shapePairReuse = shapePairKeys(combination).reduce(
    (sum, key) => sum + (state?.shapePairUsage?.get(key) || 0),
    0,
  );
  return queryScore
    + distinctCompositions * 520
    + distinctFamilies * 150
    + distinctShapes * 45
    + novelLayouts * 260
    - layoutReuse * 260
    - compositionReuse * 26
    - familyReuse * 8
    - tripletUsage * 480
    - familyTripletUsage * 150
    - pairReuse * 210
    - shapePairReuse * 54
    - adjacentOverlap * 18
    + (stableHash(`${seed}:${layoutTripletKey(combination)}`) % 1000) / 10000;
}

function recordAllocation(ordered, allocationState, slideIndex) {
  if (!allocationState) return;
  const families = new Set(ordered.map(layoutFamily));
  for (const item of ordered) {
    incrementUsage(allocationState.layoutUsage, item.layout);
    incrementUsage(allocationState.familyUsage, layoutFamily(item));
    incrementUsage(allocationState.compositionUsage, layoutCompositionIdentity(item));
  }
  incrementUsage(allocationState.tripletUsage, layoutTripletKey(ordered));
  incrementUsage(allocationState.familyTripletUsage, familyTripletKey(ordered));
  for (const key of layoutPairKeys(ordered)) incrementUsage(allocationState.layoutPairUsage, key);
  for (const key of shapePairKeys(ordered)) incrementUsage(allocationState.shapePairUsage, key);
  ordered.forEach((item, index) => {
    incrementUsage(allocationState.positionUsage?.[index], item.layout);
    incrementUsage(
      allocationState.positionCompositionUsage?.[index],
      layoutCompositionIdentity(item),
    );
  });
  if (Number.isInteger(slideIndex)) allocationState.pageFamilies.set(slideIndex, families);
  allocationState.previousFamilies = families;
}

function orderLayoutCombination(combination, state, seed) {
  const permutations = layoutPermutations(combination);
  return permutations.sort((left, right) => (
    layoutOrderScore(right, state, seed)
    - layoutOrderScore(left, state, seed)
    || left.map(item => item.layout).join('|').localeCompare(right.map(item => item.layout).join('|'))
  ))[0] || combination;
}

function layoutPermutations(items) {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) => (
    layoutPermutations(items.filter((_, itemIndex) => itemIndex !== index))
      .map(rest => [item, ...rest])
  ));
}

function layoutOrderScore(items, state, seed) {
  return items.reduce((score, item, index) => (
    score
    - (state?.positionUsage?.[index]?.get(item.layout) || 0) * 28
    - (state?.positionCompositionUsage?.[index]?.get(layoutCompositionIdentity(item)) || 0) * 64
    + (stableHash(`${seed}:v${index + 1}:${item.layout}`) % 1000) / 100000
  ), 0);
}

function layoutTripletKey(items) {
  return items.map(item => item.layout).sort().join('|');
}

function familyTripletKey(items) {
  return items.map(layoutFamily).sort().join('|');
}

function layoutPairKeys(items) {
  return pairKeys(items.map(item => item.layout));
}

function shapePairKeys(items) {
  return pairKeys(items.map(item => item?.structureFingerprint?.primaryShape || 'none'));
}

function pairKeys(values) {
  const result = [];
  for (let left = 0; left < values.length; left += 1) {
    for (let right = left + 1; right < values.length; right += 1) {
      result.push([values[left], values[right]].sort().join('|'));
    }
  }
  return result;
}

function incrementUsage(map, key) {
  if (!map || !key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function stableHash(value) {
  const text = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
}
