// 使用台面边界拟合观察范围，长走台和偏置展岛也能完整入镜。
export function stageFrame(stage) {
  const points = stage.objects.filter(object => object.type === 'platform').flatMap(object => {
    const angle = object.rotationY * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
    return [-1,1].flatMap(x => [-1,1].map(z => {
      const dx = x * object.size[0] / 2, dz = z * object.size[2] / 2;
      return [object.position[0] + dx*c + dz*s, object.position[2] - dx*s + dz*c];
    }));
  });
  if (!points.length) return { center: [0,2.3,0], extent: 14 };
  const xs = points.map(point=>point[0]), zs = points.map(point=>point[1]);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minZ=Math.min(...zs), maxZ=Math.max(...zs);
  return { center: [(minX+maxX)/2,2.3,(minZ+maxZ)/2], extent: Math.max(12,maxX-minX,maxZ-minZ) };
}
