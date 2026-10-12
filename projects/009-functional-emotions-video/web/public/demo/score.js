export const SCORE = {
  title: '光种的旅行', duration: 32, bpm: 90, beat: 2 / 3, key: 'D 小调',
  description: '原创程序合成器乐：钟琴旋律、和声铺底、低音与轻打击乐。',
  shots: [
    { title: '夜湖来信', start: 0, end: 16 / 3, action: '远景推近；光种沿旋律越过夜湖。', sync: '钟琴进入，光种随拍点闪动。' },
    { title: '光种落水', start: 16 / 3, end: 32 / 3, action: '镜头切近；光种落入水面，涟漪向外扩散。', sync: '第二组和弦进入；每拍生成一圈水纹。' },
    { title: '水下聚光', start: 32 / 3, end: 16, action: '潜入水下；光粒围绕种子聚成根系。', sync: '低音与鼓点驱动根系和光粒脉冲。' },
    { title: '破土抽芽', start: 16, end: 64 / 3, action: '回到小岛；树干与枝条逐渐长出。', sync: '第四乐段切镜，八拍内完成生长。' },
    { title: '树冠盛放', start: 64 / 3, end: 80 / 3, action: '树冠近景；花朵逐拍打开，萤火升起。', sync: '钟琴高音对应花朵亮起。' },
    { title: '把光还给夜空', start: 80 / 3, end: 32, action: '镜头拉远；光树与湖中倒影呼应。', sync: '终止和弦落下，声音与画面一起收束。' },
  ],
};
export function shotAt(time) { return Math.min(5, Math.floor(Math.max(0, time) / (16 / 3))); }
