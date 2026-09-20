export const SCHEMA_V2_LOGICAL_SLIDE_FIELDS = Object.freeze([
  'id',
  'key',
  'label',
  'logicalIndex',
  'content',
  'stateId',
  'selectedVariant',
  'variants',
]);

export function pickSchemaV2LogicalSlideFields(source) {
  const slide = {};
  for (const field of SCHEMA_V2_LOGICAL_SLIDE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source || {}, field) && source[field] !== undefined) {
      slide[field] = source[field];
    }
  }
  return slide;
}
