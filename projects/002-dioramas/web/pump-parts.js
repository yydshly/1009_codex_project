export const parts = [
  { id: 'motor', name: '驱动电机', code: '01 / MOTOR', description: '提供旋转动力，通过联轴器带动泵轴与叶轮。示意模型用散热片和接线盒帮助识别电机。', tech: '分组圆柱几何 + PBR 金属材质' },
  { id: 'coupling', name: '联轴器', code: '02 / COUPLING', description: '连接电机轴与泵轴，将旋转动力传给泵的转动部件。本图省略了联轴器防护罩以便观察。', tech: '独立部件 ID + 展开偏移' },
  { id: 'seal', name: '机械密封', code: '03 / SEAL', description: '位于泵轴穿过泵壳的位置，用于限制轴与壳体之间的泄漏。图中只用环形结构表示所在位置。', tech: '环形几何 + 选中高亮' },
  { id: 'impeller', name: '叶轮', code: '04 / IMPELLER', description: '带叶片的旋转部件向水传递能量。流向模式中叶轮转动与粒子运动仅用于说明，不对应实际转速或流场。', tech: '曲线叶片 + 逐帧旋转' },
  { id: 'casing', name: '叶轮腔', code: '05 / CASING', description: '包围叶轮，容纳液体并连接出口。图中将复杂蜗壳简化为圆形叶轮腔；透视模式便于观察内部。', tech: '透明材质 + 内部可见性控制' },
  { id: 'inlet', name: '进水口', code: '06 / INLET', description: '液体从轴向进水口进入叶轮区域，再经叶轮腔汇集至上方出口。法兰螺栓仅表现连接结构。', tech: '空心挤出几何 + 射线拾取' },
];
