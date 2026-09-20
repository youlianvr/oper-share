// JAD-214:纯装饰槽位的契约层标记(数据描述符,参照 per-theme overrides 机制)。
// 这里只声明"哪些 defaultProps 键是纯装饰、不该被 Agent 当文案填写";
// 由 scripts/skill-workflow-utils.mjs 的 inspect 契约层消费,不改主题组件视觉。
//
// 收编范围保守:只标已确认的纯装饰位。
// theme09_page007/page111 的 signature(封面/结语手写花字)曾在此黑名单里,
// 但它其实是完全 props 驱动的真实品牌落款文案(非结构装饰),黑名单把它排除出
// copyKeys 后,Agent 只能任由示例品牌名 'AInsight' 出现在每份生成的画册里——
// 已移除该条目,交回 copyKeys 正常暴露(见 theme09-report.json 审计结论)。
export const DECORATIVE_SLOTS = {};

export function getDecorativeKeys(layout) {
  return DECORATIVE_SLOTS[layout] || [];
}
